import { Stack, Tabs } from "@mantine/core";
import { NDKEvent } from "@nostr-dev-kit/ndk";
import UserCard from "components/UserCard/UserCard";
import { useMemo } from "react";

type FollowersPanelProps = {
  contactList?: NDKEvent;
};

export default function FollowingPanel({ contactList }: FollowersPanelProps) {
  const followingPubkeys: string[] = useMemo(
    () =>
      contactList?.tags.filter((tag) => tag[0] === "p").map((tag) => tag[1]) ||
      [],
    [contactList]
  );

  return (
    <Tabs.Panel value="following" pt="md" pl="md" pr="md">
      <Stack spacing="md">
        {followingPubkeys.slice(0, 10).map((pubkey) => (
          <UserCard key={pubkey} pubkey={pubkey} />
        ))}
      </Stack>
    </Tabs.Panel>
  );
}
