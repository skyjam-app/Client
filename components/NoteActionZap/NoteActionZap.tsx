import { Space, Text, Group } from "@mantine/core";
import { ZapIcon } from "icons/StemstrIcon";
import NoteAction from "components/NoteAction/NoteAction";
import { useEvent } from "ndk/NDKEventProvider";
import { useUser } from "ndk/hooks/useUser";
import { getLnurlServiceEndpoint } from "ndk/utils";
import {
  ZapWizard,
  useZapWizard,
  ZapWizardProvider,
} from "components/ZapWizard";
import { useSelector } from "react-redux";
import { AppState } from "../../store/Store";
import { selectNoteState } from "../../store/Notes";

const NoteActionContentWithZapWizard = () => {
  const { start } = useZapWizard();
  const { event } = useEvent();
  const { zapsAmountTotal } = useSelector((state: AppState) =>
    selectNoteState(state, event.id)
  );
  const formattedZapsTotal = (() => {
    const formatNumber = (num: number) => num.toFixed(1).replace(/\.0$/, "");

    if (zapsAmountTotal === 0) {
      return;
    }

    if (zapsAmountTotal >= 1_000_000) {
      return `${formatNumber(zapsAmountTotal / 1_000_000)}M`;
    }

    if (zapsAmountTotal >= 1000) {
      return `${formatNumber(zapsAmountTotal / 1_000)}k`;
    }

    return formatNumber(zapsAmountTotal);
  })();

  return (
    <NoteAction onClick={start}>
      <Group position="center" spacing={6} noWrap>
        <ZapIcon width={18} height={18} />
        {formattedZapsTotal && <Text lh="normal">{formattedZapsTotal}</Text>}
      </Group>
      <ZapWizard />
    </NoteAction>
  );
};

const NoteActionZap = () => {
  const { event } = useEvent();
  const zapRecipient = useUser(event.pubkey);
  const isZappable =
    zapRecipient && getLnurlServiceEndpoint(zapRecipient.profile, event);

  return isZappable ? (
    <ZapWizardProvider zapRecipient={zapRecipient} zappedEvent={event}>
      <NoteActionContentWithZapWizard />
    </ZapWizardProvider>
  ) : (
    <Space w={44} />
  );
};

export default NoteActionZap;
