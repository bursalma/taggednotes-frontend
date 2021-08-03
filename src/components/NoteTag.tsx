import { Tag } from "antd";

import { useAppSelector} from "../redux/store";
import {
  selectTagById,
  // tagToggled,
  // selectTagMetaBySection,
  // deleteTag,
  // putTag,
} from "../redux/tagSlice";

const NoteTag: React.FC<{ tagId: number }> = ({ tagId }) => {
  // const dispatch = useAppDispatch();
  const tag = useAppSelector((state) => selectTagById(state, tagId));
  const label: string = tag?.label!;

  return <Tag>{label}</Tag>;
};

export default NoteTag;
