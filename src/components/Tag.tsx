import { useState } from "react";
import styled from "styled-components";
import { Button, Dropdown, Input, Menu, Modal, Popconfirm } from "antd";

import { useAppSelector, useAppDispatch } from "../redux/store";
import {
  selectTagById,
  tagToggled,
  selectTagMetaBySection,
  deleteTag,
  putTag,
} from "../redux/tagSlice";

const Tag: React.FC<{ tagId: number }> = ({ tagId }) => {
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState<boolean>(false);
  const tag = useAppSelector((state) => selectTagById(state, tagId));
  const { activeTagIds } = useAppSelector((state) =>
    selectTagMetaBySection(state, tag?.section!)
  );
  const active = activeTagIds.includes(tagId);
  const label: string = tag?.label!;
  const [putVal, setPutVal] = useState<string>(label);

  const menu = (
    <Menu>
      <Menu.Item key={1} onClick={() => setOpen(true)}>
        Edit
      </Menu.Item>
      <Popconfirm
        title="Are you sure you want to delete?"
        okText="Delete"
        placement="bottom"
        onConfirm={() => dispatch(deleteTag({ tagId, notes: tag?.notes }))}
      >
        <Menu.Item key={2}>Delete</Menu.Item>
      </Popconfirm>
    </Menu>
  );

  return (
    <div>
      <Dropdown overlay={menu} trigger={["contextMenu"]}>
        <TagContainer
          shape="round"
          size="small"
          type="primary"
          ghost={active}
          onClick={() =>
            dispatch(tagToggled({ sectionId: tag?.section, tagId }))
          }
        >
          {label}
        </TagContainer>
      </Dropdown>
      <Modal
        visible={open}
        width={300}
        closable={false}
        okText="Update"
        onCancel={() => {
          setOpen(false);
          setPutVal(label);
        }}
        onOk={() => {
          if (putVal && putVal !== label)
            dispatch(putTag({ id: tagId, label: putVal.toLowerCase() }));
          setOpen(false);
        }}
      >
        <Input
          value={putVal}
          maxLength={30}
          defaultValue={label}
          onChange={(e) => setPutVal(e.target.value)}
          placeholder="Update Tag Name"
        />
      </Modal>
    </div>
  );
};

const TagContainer = styled(Button)`
  margin: 3px;
`;

export default Tag;
