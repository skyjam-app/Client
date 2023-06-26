import { ZapIcon } from "icons/StemstrIcon";
import NoteAction from "components/NoteAction/NoteAction";
import { useEvent } from "ndk/NDKEventProvider";
import { useUser } from "ndk/hooks/useUser";
import {
  ZapWizard,
  useZapWizardStepManager,
  withZapWizardProvider,
} from "components/ZapWizard";

const NoteActionZap = () => {
  const { event } = useEvent();
  const zapRecipient = useUser(event.pubkey);
  const { setStep } = useZapWizardStepManager();

  return (
    <NoteAction onClick={() => setStep("defaultAmounts")}>
      <ZapIcon width={18} height={18} />

      {zapRecipient && <ZapWizard zapRecipient={zapRecipient} event={event} />}
    </NoteAction>
  );
};

export default withZapWizardProvider(NoteActionZap);
