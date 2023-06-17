import { AppShell, Box } from "@mantine/core";
import { useRouter } from "next/router";

import BottomNavigation from "../BottomNavigation/BottomNavigation";
import PostSheet from "../PostSheet/PostSheet";
import FileDropOverlay from "../FileDropOverlay/FileDropOverlay";
import { Route } from "enums/routes";

export const ApplicationContainer = ({
  children,
}: React.PropsWithChildren<{}>) => {
  const router = useRouter();

  return (
    <AppShell
      padding={0}
      styles={{
        root: {
          width: "100%",
          maxWidth: [Route.Home, Route.Discover].includes(
            router.pathname as Route
          )
            ? "100%"
            : 600,
          height: "100vh",
          margin: "auto",
        },
        main: {
          width: "100%",
          height: "100vh",
        },
      }}
      fixed
      footer={<BottomNavigation />}
    >
      {children}
      {![Route.Home, Route.Discover].includes(router.pathname as Route) && (
        // Spacer so content isn't covered up by bottom nav
        <Box h={96 + 16} />
      )}
      <PostSheet />
      <FileDropOverlay />
    </AppShell>
  );
};
