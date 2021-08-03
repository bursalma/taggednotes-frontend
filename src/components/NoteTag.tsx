import { Tag } from "antd";

import { useAppDispatch } from "../redux/store";
import { TagObj } from "../redux/tagSlice";
import { putNoteTagRemove } from "../redux/noteSlice";

const NoteTag: React.FC<{ tag: TagObj; noteId: number; tag_set: number[] }> = ({
  tag,
  noteId,
  tag_set,
}) => {
  const dispatch = useAppDispatch();

  const handleRemove = () => {
    dispatch(
      putNoteTagRemove({
        note: {
          id: noteId,
          tag_set: tag_set.filter((id: number) => id !== tag.id),
        },
        tag: tag,
      })
    );
  };

  return (
    <Tag closable onClose={handleRemove}>
      {tag.label}
    </Tag>
  );
};

export default NoteTag;
