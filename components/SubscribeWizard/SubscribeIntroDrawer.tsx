import { DrawerProps } from "components/Drawer/Drawer";
import SubscribeDrawer from "./SubscribeDrawer";
import { Button, Image, Text } from "@mantine/core";
import { useSubscribeWizard } from "./SubscribeWizardProvider";

type SubscribeIntroDrawerProps = DrawerProps & {
  onContinue: () => void;
};

export default function SubscribeIntroDrawer({
  opened,
  onClose,
  onContinue,
  ...rest
}: SubscribeIntroDrawerProps) {
  const { passOptions } = useSubscribeWizard();

  return (
    <SubscribeDrawer opened={opened} onClose={onClose} {...rest}>
      <Text c="white" ta="center" fz={20} fw="bold" mt={8}>
        Stemstr Share Pass
      </Text>
      <Image
        src="/img/subscription-hero.png"
        height={212}
        fit="cover"
        mt="md"
        styles={{
          image: {
            borderRadius: 16,
          },
        }}
      />
      <Text c="white" ta="center" fz={18} fw={500} mt={28}>
        Gain access to unlimited sharing of sounds and commenting on Stemstr
      </Text>
      <Text ta="center" fz="sm" mt={8}>
        Purchasing a pass helps to kee the quality of content on Stemstr at it's
        highest level and also limits any spam on the service.
      </Text>
      <Button onClick={onContinue} mt={58} color="green" fullWidth>
        Explore passes
        {passOptions.length &&
          ` starting at ${passOptions[0].priceSATS.toLocaleString()} sats ${
            passOptions[0]?.priceUSD
              ? `(~${passOptions[0].priceUSD.toLocaleString("en-US", {
                  style: "currency",
                  currency: "USD",
                })})`
              : ""
          }`}
      </Button>
    </SubscribeDrawer>
  );
}
