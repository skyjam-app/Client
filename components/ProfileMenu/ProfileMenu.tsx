import {
  Box,
  Button,
  Center,
  Group,
  MantineTheme,
  Stack,
  Text,
  Transition,
} from "@mantine/core";
import ProfileLink from "components/ProfileLink/ProfileLink";
import useAuth from "hooks/useAuth";
import {
  CalendarSolidIcon,
  ElectricSquirrelIcon,
  InfinityIcon,
  StarsSolidIcon,
} from "icons/StemstrIcon";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useDisclosure } from "@mantine/hooks";
import Drawer from "components/Drawer/Drawer";
import { AddSoundIcon } from "icons/StemstrIcon";
import { RepostIcon } from "icons/StemstrIcon";
import { CommentIcon } from "icons/StemstrIcon";

const INFINITE_SUBSCRIPTION_TIME = 21_000_000_000;

export default function ProfileMenu() {
  const { authState } = useAuth();
  const [
    subscriptionDrawerOpened,
    { open: openSubscriptionDrawer, close: closeSubscriptionDrawer },
  ] = useDisclosure(false);
  const [subscriptionTimeRemaining, setSubscriptionTimeRemaining] =
    useState<number>(); // in seconds
  const formattedSubscriptionTimeData = useMemo(
    () =>
      subscriptionTimeRemaining
        ? formatTime(subscriptionTimeRemaining)
        : undefined,
    [subscriptionTimeRemaining]
  );
  const formattedSubscriptionTime = `${formattedSubscriptionTimeData?.amount} ${formattedSubscriptionTimeData?.unit}`;
  const timeSinceSubscriptionStart =
    authState.subscriptionStatus?.created_at &&
    Date.now() / 1000 - authState.subscriptionStatus?.created_at;
  const isHighlightingSubscriptionStatus = Boolean(
    timeSinceSubscriptionStart &&
      timeSinceSubscriptionStart > 0 &&
      timeSinceSubscriptionStart < 20
  );
  const hasLifetimePass =
    authState.subscriptionStatus?.expires_at === INFINITE_SUBSCRIPTION_TIME;
  const bgGradient = hasLifetimePass
    ? "linear-gradient(135deg, #F9F5FF 0%, #A17BF0 100%)"
    : "linear-gradient(134deg, #09D4B0 0%, #2F9AF8 100%)";

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (authState.subscriptionStatus?.expires_at) {
      setSubscriptionTimeRemaining(
        authState.subscriptionStatus.expires_at - Date.now() / 1000
      );
      interval = setInterval(() => {
        if (authState.subscriptionStatus?.expires_at) {
          setSubscriptionTimeRemaining(
            authState.subscriptionStatus.expires_at - Date.now() / 1000
          );
        }
      }, 1000);
    } else {
      setSubscriptionTimeRemaining(undefined);
    }

    return () => {
      clearInterval(interval);
    };
  }, [authState.subscriptionStatus?.expires_at, setSubscriptionTimeRemaining]);

  return (
    <>
      <Drawer
        opened={subscriptionDrawerOpened}
        position="bottom"
        onClose={closeSubscriptionDrawer}
        withCloseButton={false}
        onDragEnd={closeSubscriptionDrawer}
        trapFocus={false}
        styles={(theme: MantineTheme) => ({
          overlay: {
            backgroundColor: `${theme.colors.dark[7]} !important`,
            backdropFilter: "blur(16px)",
            opacity: `${0.5} !important`,
          },
          drawer: {
            background: bgGradient,
            borderTopLeftRadius: 40,
            borderTopRightRadius: 40,
            maxWidth: 600,
            margin: "auto",
            padding: `0 16px 24px 16px !important`,
            color: theme.colors.dark[8],
          },
        })}
      >
        {hasLifetimePass ? (
          <Box m="auto" w={62} mt={8}>
            <ElectricSquirrelIcon width={62} height={52} />
          </Box>
        ) : (
          <Box m="auto" w={48} mt={8} c="dark.7" pos="relative">
            <CalendarSolidIcon width={48} height={54} />
            <Text
              c="white"
              fw="bold"
              pos="absolute"
              bottom={14}
              w={50}
              align="center"
              left="calc(50% - 25px)"
            >
              {formattedSubscriptionTimeData?.numDays}
            </Text>
            <Box c="purple.5" pos="absolute" top={-1} left={-1}>
              <StarsSolidIcon width={12} height={12} />
            </Box>
            <Box c="white" pos="absolute" bottom={1} left={1}>
              <StarsSolidIcon width={10} height={10} />
            </Box>
            <Box c="orange.5" pos="absolute" bottom={1} right={-3}>
              <StarsSolidIcon width={14} height={14} />
            </Box>
          </Box>
        )}
        <Text fz={20} fw="bold" align="center" mt={8}>
          {hasLifetimePass
            ? "Lifetime Pass"
            : `${formattedSubscriptionTime} remaining`}
        </Text>
        <Text align="center" fz="sm" mt={4}>
          {hasLifetimePass
            ? "You have been granted a life time pass since you’re a Stemstr supporter. Enjoy!"
            : `You currently have ${formattedSubscriptionTime} remaining. This pass allows you to:`}
        </Text>
        <Stack spacing={24} mt={24}>
          <SubscriptionDrawerItem
            title="Post Sounds"
            content="Share your music with the world and receive ⚡️ sats for it"
            Icon={AddSoundIcon}
          />
          <SubscriptionDrawerItem
            title="Repost"
            content="You will be able to repost sounds"
            Icon={RepostIcon}
          />
          <SubscriptionDrawerItem
            title="Comment"
            content="You can make comments and reply to sounds with your own remixed version"
            Icon={CommentIcon}
          />
        </Stack>
        <Button
          onClick={closeSubscriptionDrawer}
          variant="subtle"
          c="white"
          fz="md"
          mt={24}
          fullWidth
          sx={(theme) => ({
            borderTop: `1px solid ${theme.fn.rgba(theme.colors.gray[4], 0.2)}`,
            borderRadius: 0,
            margin: "auto",
            display: "block",
            height: 58,
          })}
        >
          Close
        </Button>
      </Drawer>
      <Group
        noWrap
        spacing={8}
        pos="relative"
        sx={(theme) => ({
          color: isHighlightingSubscriptionStatus
            ? theme.colors.green[5]
            : theme.white,
          border: "1px solid",
          borderColor: isHighlightingSubscriptionStatus
            ? theme.colors.green[5]
            : theme.colors.gray[2],
          outline: "3px solid",
          outlineColor: isHighlightingSubscriptionStatus
            ? theme.colors.green[8]
            : theme.colors.gray[4],
          padding: 3,
          borderRadius: 19,
          transition:
            "color 0.5s ease, border-color 0.5s ease, outline-color 0.5s ease",
        })}
      >
        <Stars mounted={isHighlightingSubscriptionStatus} />
        <Transition
          mounted={Boolean(formattedSubscriptionTimeData)}
          transition="slide-left"
          duration={500}
          timingFunction="ease"
        >
          {(styles) => (
            <Box
              onClick={openSubscriptionDrawer}
              style={{
                ...styles,
                cursor: "pointer",
              }}
            >
              {hasLifetimePass ? (
                <Center ml={10}>
                  <InfinityIcon width={20} height={20} />
                </Center>
              ) : (
                <>
                  <Text fw="bold" ml={10} span>
                    {formattedSubscriptionTimeData?.amount}
                  </Text>{" "}
                  {formattedSubscriptionTimeData?.unit}
                </>
              )}
            </Box>
          )}
        </Transition>
        <ProfileLink size={30} />
      </Group>
    </>
  );
}

type SubscriptionDrawerItemProps = {
  title: string;
  content: string;
  Icon: (props: any) => JSX.Element;
};

const SubscriptionDrawerItem = ({
  title,
  content,
  Icon,
}: SubscriptionDrawerItemProps) => {
  return (
    <Group sx={{ flexWrap: "nowrap" }}>
      <Center
        w={48}
        h={48}
        sx={(theme) => ({
          background: "rgba(30, 30, 30, 0.24)",
          borderRadius: "50%",
          flexShrink: 0,
        })}
      >
        <Icon width={24} height={24} />
      </Center>
      <Box>
        <Text fw="bold">{title}</Text>
        <Text fz="sm">{content}</Text>
      </Box>
    </Group>
  );
};

type StarSprite = {
  size: number;
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
};

const Stars = ({ mounted }: { mounted: boolean }) => {
  const stars: StarSprite[] = [
    { size: 13, top: -4, left: 2 },
    { size: 11, top: -4, right: -4 },
    { size: 11, bottom: -4, right: 2 },
    { size: 11, bottom: -4, left: 8 },
  ];

  return (
    <>
      {stars.map((star, index) => (
        <AnimatePresence key={index}>
          {mounted && (
            <Box
              component={motion.div}
              initial={{ scale: 0, rotate: 0 }}
              animate={{
                scale: [0, 1.25, 1],
                rotate: [0, 360],
              }}
              exit={{ scale: 0 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              key={index}
              sx={{ zIndex: 1 }}
              lh={0}
              pos="absolute"
              top={star.top}
              right={star.right}
              bottom={star.bottom}
              left={star.left}
            >
              <StarsSolidIcon width={star.size} height={star.size} />
            </Box>
          )}
        </AnimatePresence>
      ))}
    </>
  );
};

const formatTime = (
  seconds: number
): { amount: number; unit: string; numDays: number } => {
  const secondsInADay = 86400;
  const numDays = Math.ceil(seconds / secondsInADay);

  if (seconds < 3600) {
    const minutes = Math.ceil(seconds / 60);
    return {
      amount: minutes,
      unit: `min.`,
      numDays,
    };
  } else if (seconds < 86400) {
    const hours = Math.ceil(seconds / 3600);
    return {
      amount: hours,
      unit: `hr${hours === 1 ? "" : "s"}.`,
      numDays,
    };
  } else {
    const days = Math.ceil(seconds / 86400);
    return {
      amount: days,
      unit: `day${days === 1 ? "" : "s"}`,
      numDays,
    };
  }
};
