import NDK, {
  NDKEvent,
  NDKFilter,
  NDKRelay,
  NDKRelaySet,
  NDKTag,
  NDKUser,
  NDKUserProfile,
  NDKSubscriptionOptions,
  NostrEvent,
} from "@nostr-dev-kit/ndk";
import {
  nip19,
  nip57,
  finishEvent,
  generatePrivateKey,
  type EventTemplate,
} from "nostr-tools";
import axios from "axios";
import { bech32 } from "@scure/base";
import { defaultRelayUrls } from "../constants";

interface ParsedEventTags {
  root?: NDKTag;
  mentions: NDKTag[];
  reply?: NDKTag;
}

export const parseEventTags = (event: NDKEvent) => {
  const result: ParsedEventTags = {
    root: undefined,
    mentions: [],
    reply: undefined,
  };
  const eTags = event.tags.filter((t) => t[0] === "e");
  if (usesDepecratedETagSchema(event)) {
    if (eTags) {
      if (eTags.length === 1) {
        result.reply = eTags[0];
      }
      if (eTags.length > 0) {
        result.root = eTags[0];
      }
      if (eTags.length > 1) {
        console.log(eTags);
        result.reply = eTags[eTags.length - 1];
      }
      if (eTags.length > 2) {
        for (let i = 1; i < eTags.length - 1; i++) {
          result.mentions.push(eTags[i]);
        }
      }
    }
  } else {
    eTags?.forEach((t) => {
      switch (t[3]) {
        case "root":
          result.root = t;
          break;
        case "reply":
          result.reply = t;
          break;
        case "mention":
          result.mentions.push(t);
          break;
      }
    });
  }
  if (result.root) {
    result.root = formatETag(result.root, "root");
  }
  result.mentions.forEach((mention, i) => {
    if (mention) {
      result.mentions[i] = formatETag(mention, "mention");
    }
  });
  if (result.reply) {
    result.reply = formatETag(result.reply, "reply");
  }
  return result;
};

export const formatETag = (
  tag: NDKTag,
  type: "root" | "mention" | "reply"
): NDKTag => {
  if (!tag[2]) {
    tag[2] = "";
  }
  tag[3] = type;
  return tag;
};

export const usesDepecratedETagSchema = (event: NDKEvent | undefined) => {
  if (!event) return false;
  const tag = event.tags.find((t) => t[0] === "e");
  if (tag && tag[3] !== undefined) {
    return false;
  }
  return !!tag;
};

export const uniqBy = <T,>(arr: T[], key: keyof T): T[] => {
  return Object.values(
    arr.reduce(
      (map, item) => ({
        ...map,
        [`${item[key]}`]: item,
      }),
      {}
    )
  );
};

export const dateToUnix = (_date?: Date) => {
  const date = _date || new Date();

  return Math.floor(date.getTime() / 1000);
};

export const getRelativeTimeString = (unixTime: number) => {
  const currentTime = Math.floor(Date.now() / 1000);
  const differenceInSeconds = currentTime - unixTime;

  const secondsInMinute = 60;
  const secondsInHour = secondsInMinute * 60;
  const secondsInDay = secondsInHour * 24;
  const secondsInWeek = secondsInDay * 7;
  const secondsInMonth = secondsInDay * 30; // Approximation
  const secondsInYear = secondsInDay * 365; // Approximation

  if (differenceInSeconds < secondsInMinute) {
    return `${differenceInSeconds}s`;
  } else if (differenceInSeconds < secondsInHour) {
    const minutes = Math.floor(differenceInSeconds / secondsInMinute);
    return `${minutes}m`;
  } else if (differenceInSeconds < secondsInDay) {
    const hours = Math.floor(differenceInSeconds / secondsInHour);
    return `${hours}h`;
  } else if (differenceInSeconds < secondsInWeek) {
    const days = Math.floor(differenceInSeconds / secondsInDay);
    return `${days}d`;
  } else if (differenceInSeconds < secondsInMonth) {
    const weeks = Math.floor(differenceInSeconds / secondsInWeek);
    return `${weeks}w`;
  } else if (differenceInSeconds < secondsInYear) {
    const months = Math.floor(differenceInSeconds / secondsInMonth);
    return `${months}mo`;
  } else {
    const years = Math.floor(differenceInSeconds / secondsInYear);
    return `${years}y`;
  }
};

export const getPublicKeys = (
  hexOrNpub: string
): { pk: string; npub: string } => {
  const publicKeys = { pk: "", npub: "" };
  if (isNpub(hexOrNpub)) {
    publicKeys.npub = hexOrNpub;
    let { type, data } = nip19.decode(hexOrNpub);
    publicKeys.pk = data as string;
  } else if (isHexPubkey(hexOrNpub)) {
    publicKeys.pk = hexOrNpub;
    publicKeys.npub = nip19.npubEncode(hexOrNpub);
  } else {
    // TODO: throw error
  }
  return publicKeys;
};

// TODO: Write this function fr
export const isNpub = (hexOrNpub: string): boolean => {
  return hexOrNpub.startsWith("npub1");
};

// TODO: Write this function fr
export const isHexPubkey = (hexOrNpub: string): boolean => {
  return !isNpub(hexOrNpub);
};

export const abbreviateKey = (key: string): string => {
  return `${key.slice(0, 12)}...${key.slice(-12)}`;
};

export const getNoteIds = (noteId: string): { hex: string; bech32: string } => {
  // TODO: Error handling, etc.
  const ids = { hex: "", bech32: "" };
  if (noteId.startsWith("note")) {
    ids.bech32 = noteId;
    let { type, data } = nip19.decode(noteId);
    if (typeof data === "string") {
      ids.hex = data;
    }
  } else {
    ids.hex = noteId;
    ids.bech32 = nip19.noteEncode(noteId);
  }
  return ids;
};

export const createRelaySet = (relayUrls: string[], ndk: NDK) => {
  if (!relayUrls.length) {
    return;
  }

  const relays: Set<NDKRelay> = new Set();

  relayUrls.forEach((url) => {
    const relay = ndk.pool?.relays.get(url);

    if (relay) {
      relays.add(relay);
    }
  });

  return new NDKRelaySet(relays, ndk);
};

export const dedupeEvent = (event1: NDKEvent, event2: NDKEvent) => {
  // return the newest of the two
  if (event1.created_at! > event2.created_at!) {
    return event1;
  }

  return event2;
};

export const fetchEvents = async (
  filter: NDKFilter,
  ndk: NDK,
  relaySet?: NDKRelaySet,
  opts?: NDKSubscriptionOptions
): Promise<Set<NDKEvent>> => {
  return new Promise((resolve) => {
    const events: Map<string, NDKEvent> = new Map();
    const relaySetSubscription = ndk.subscribe(filter, opts, relaySet);

    relaySetSubscription.on("event", (event: NDKEvent) => {
      const existingEvent = events.get(event.tagId());
      if (existingEvent) {
        event = dedupeEvent(existingEvent, event);
      }

      event.ndk = ndk;
      events.set(event.tagId(), event);
    });
    relaySetSubscription.on("eose", () => {
      resolve(new Set(events.values()));
    });

    relaySetSubscription.start();
  });
};

export const getNormalizedName = (pubkey: string, user?: NDKUser) => {
  const profile = user?.profile;

  return (
    profile?.displayName ?? profile?.name ?? `${pubkey.substring(0, 5)}...`
  );
};

const getZapEndpoint = async (
  zappedUserProfile?: NDKUserProfile,
  zappedEvent?: NDKEvent
) => {
  let lud06: string | undefined;
  let lud16: string | undefined;
  let zapEndpoint: string | undefined;
  let zapEndpointCallback: string | undefined;

  if (zappedEvent) {
    const zapTag = zappedEvent.getMatchingTags("zap")[0];

    if (zapTag) {
      switch (zapTag[2]) {
        case "lud06":
          lud06 = zapTag[1];
          break;
        case "lud16":
          lud16 = zapTag[1];
          break;
        default:
          throw new Error(`Unknown zap tag ${zapTag}`);
      }
    }
  }

  if (!lud06 && !lud16) {
    lud06 = zappedUserProfile?.lud06;
    lud16 = zappedUserProfile?.lud16;
  }

  if (lud16) {
    const [name, domain] = lud16.split("@");
    zapEndpoint = `https://${domain}/.well-known/lnurlp/${name}`;
  } else if (lud06) {
    const { words } = bech32.decode(lud06, 1000);
    const data = bech32.fromWords(words);
    const utf8Decoder = new TextDecoder("utf-8");
    zapEndpoint = utf8Decoder.decode(data);
  }

  if (!zapEndpoint) {
    throw new Error("No zap endpoint found");
  }

  const { data } = await axios(zapEndpoint);

  if (data?.allowsNostr && (data?.nostrPubkey || data?.nostrPubKey)) {
    zapEndpointCallback = data.callback;
  }

  return zapEndpointCallback;
};

const getUserRelayUrls = async (
  user: NDKUser,
  opts?: { filter?: "readable" | "writable" }
) => {
  const relayListEvent = Array.from(await user.relayList())[0];
  const { filter } = opts ?? {};

  if (!relayListEvent) {
    return null;
  }

  return relayListEvent
    .getMatchingTags("r")
    .filter((tag) => {
      if (filter === "readable") {
        return tag[2] === "read" || tag[2] === undefined;
      }

      if (filter === "writable") {
        return tag[2] === "write" || tag[2] === undefined;
      }

      return true;
    })
    .map((tag) => tag[1]);
};

interface SignEventParams {
  event: EventTemplate;
  ndk: NDK;
  isAnonymous?: boolean;
}

const signEvent = async ({ event, ndk, isAnonymous }: SignEventParams) => {
  if (isAnonymous) {
    return finishEvent(event, generatePrivateKey());
  }

  const zapRequestEvent = new NDKEvent(ndk, event as NostrEvent);

  await zapRequestEvent.sign();

  return await zapRequestEvent.toNostrEvent();
};

interface CreateZapRequestParams {
  amount: number; // amount to zap in sats
  comment?: string;
  extraTags?: NDKTag[];
  zappedUser: NDKUser;
  zappedEvent?: NDKEvent;
  ndk: NDK;
  isAnonymous?: boolean;
}

export const createZapRequest = async ({
  amount,
  comment,
  extraTags,
  zappedUser,
  zappedEvent,
  ndk,
  isAnonymous,
}: CreateZapRequestParams) => {
  const zapEndpoint = await getZapEndpoint(zappedUser.profile, zappedEvent);
  const normalizedAmount = amount * 1000; // convert to millisats

  if (!zapEndpoint) {
    throw new Error("No zap endpoint found");
  }

  const userRelayUrls = await getUserRelayUrls(zappedUser, {
    filter: "writable",
  });
  const zapRequest = nip57.makeZapRequest({
    profile: zappedUser.hexpubkey(),

    // set the event to null since nostr-tools doesn't support nip-33 zaps
    event: null,
    amount: normalizedAmount,
    comment: comment ?? "",
    relays: userRelayUrls
      ? [...userRelayUrls, ...defaultRelayUrls]
      : defaultRelayUrls,
  });

  // add the event tag if it exists; this supports both 'e' and 'a' tags
  if (zappedEvent) {
    const tag = zappedEvent.tagReference();
    if (tag) {
      zapRequest.tags.push(tag);
    }
  }

  if (extraTags) {
    zapRequest.tags = zapRequest.tags.concat(extraTags);
  }

  const signedZapRequest = await signEvent({
    event: zapRequest,
    ndk,
    isAnonymous,
  });
  console.log(signedZapRequest);

  const { data } = await axios(
    `${zapEndpoint}?` +
      new URLSearchParams({
        amount: normalizedAmount.toString(),
        nostr: JSON.stringify(signedZapRequest),
      })
  );

  return data.pr;
};
