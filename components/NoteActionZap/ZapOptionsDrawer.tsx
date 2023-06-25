import { Button, Divider, Stack } from "@mantine/core";
import { useState, useEffect, useCallback } from "react";
import ZapDrawer from "./ZapDrawer";
import SatsButton from "./SatsButton";
import SquareButton from "./SquareButton";
import useGetBtcPrice from "./useGetBtcPrice";
import SquareButtonRow from "./SquareButtonRow";
import SendSatsHeader from "./SendSatsHeader";
import ZapCommentFieldGroup from "./ZapCommentFieldGroup";
import DrawerCloseButton from "./CloseButton";

interface ZapOptionsDrawerProps {
  isOpen: boolean;
  onClose: Function;
  onContinue: (satsAmount: number, comment?: string) => void;
  onCustomClick: (comment: string) => void;
  onCommentChange: (comment: string) => void;
  comment: string;
}

const ZapOptionsDrawer = ({
  isOpen,
  onClose,
  onContinue,
  onCustomClick,
  onCommentChange,
  comment,
}: ZapOptionsDrawerProps) => {
  const btcPrice = useGetBtcPrice(isOpen);
  const defaultSatAmountValues = [21, 444, 808, 5000, 10000];
  const defaultSatAmount = defaultSatAmountValues[0];
  const [satsAmount, setSatsAmount] = useState(defaultSatAmount);
  const [isLoading, setIsLoading] = useState(false);
  const handleOnClose = useCallback(() => {
    setSatsAmount(defaultSatAmount);
    setIsLoading(false);
    onClose();
  }, [onClose, defaultSatAmount]);
  const renderSatsAmountButton = (_satsAmount: number) => (
    <SatsButton
      key={_satsAmount}
      satsAmount={_satsAmount}
      btcPrice={btcPrice}
      onClick={() => setSatsAmount(_satsAmount)}
      isHighlighted={_satsAmount === satsAmount}
    />
  );
  const handleContinueClick = () => {
    setIsLoading(true);
    onContinue(satsAmount);
  };

  useEffect(() => {
    if (!isOpen) {
      handleOnClose();
    }
  }, [isOpen, handleOnClose]);

  return (
    <ZapDrawer isOpen={isOpen} onClose={handleOnClose} size={578}>
      <Stack spacing={21}>
        <SendSatsHeader />
        <SquareButtonRow>
          {defaultSatAmountValues.slice(0, 3).map(renderSatsAmountButton)}
        </SquareButtonRow>
        <SquareButtonRow>
          {defaultSatAmountValues.slice(3).map(renderSatsAmountButton)}
          <SquareButton label="Custom" onClick={onCustomClick}>
            ...
          </SquareButton>
        </SquareButtonRow>
        <ZapCommentFieldGroup
          defaultValue={comment}
          onChange={onCommentChange}
        />
        <Button
          mt={24}
          fullWidth
          onClick={handleContinueClick}
          loading={isLoading}
        >
          Continue
        </Button>
        <Divider color="gray.4" />
        <DrawerCloseButton onClick={handleOnClose} />
      </Stack>
    </ZapDrawer>
  );
};

export default ZapOptionsDrawer;
