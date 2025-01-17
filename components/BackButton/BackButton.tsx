import { Center } from "@mantine/core";
import { useRouter } from "next/router";

interface BackButtonProps {
  defaultUrl: string;
}

const BackButton = ({
  defaultUrl,
  children,
}: React.PropsWithChildren<BackButtonProps>) => {
  const router = useRouter();

  const handleBackClick = () => {
    if (window.history.length > 2) {
      return router.back();
    } else {
      router.push(defaultUrl);
    }
  };

  return (
    <Center onClick={handleBackClick} sx={{ cursor: "pointer" }}>
      {children}
    </Center>
  );
};

export default BackButton;
