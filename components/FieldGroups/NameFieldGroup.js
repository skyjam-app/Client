import NameField from "../Fields/NameField/NameField";
import FieldGroup from "./FieldGroup";

export default function NameFieldGroup(props) {
  return (
    <FieldGroup title="Username" titleFontSize="xs">
      <NameField {...props} />
    </FieldGroup>
  );
}
