import { Chip, Group } from "@mantine/core";
import withStopClickPropagation from "../../utils/hoc/withStopClickPropagation";
import { useEvent } from "../../ndk/NDKEventProvider";

const NoteTags = ({ classes, ...rest }) => {
  const { event } = useEvent();
  return (
    <Group
      position="left"
      sx={{ flexWrap: "nowrap", overflowX: "auto" }}
      {...rest}
    >
      {event?.tags
        ?.filter((tag) => tag[0] == "t")
        .map((tag, index) => (
          <Chip radius="md" key={index} className={classes.tag}>
            #{tag[1]}
          </Chip>
        ))}
    </Group>
  );
};

export default withStopClickPropagation(NoteTags);
