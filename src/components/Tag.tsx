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
  const [visible, setVisible] = useState<boolean>(false);
  const tag = useAppSelector((state) => selectTagById(state, tagId));
  const { isDeleteOn, activeTagIds } = useAppSelector((state) =>
    selectTagMetaBySection(state, tag?.section!)
  );
  const active = activeTagIds.includes(tagId);
  const label: string = tag?.label!;
  const [putVal, setPutVal] = useState<string>(label);

  const handleUpdate = () => {
    if (putVal && putVal !== label)
      dispatch(putTag({ id: tagId, label: putVal, section: tag?.section }));
    setOpen(false);
  };

  const menu = (
    <Menu>
      <Menu.Item key={1} onClick={() => setOpen(true)}>
        Edit
      </Menu.Item>
      <Popconfirm
        title="Are you sure you want to delete?"
        okText="Delete"
        placement="bottom"
        // visible={visible}
        // onCancel={() => setVisible(false)}
        onConfirm={() => dispatch(deleteTag(tagId))}
      >
        <Menu.Item key={2}>
          Delete
        </Menu.Item>
      </Popconfirm>
    </Menu>
  );

  return (
    <div>
      <Popconfirm
        title="Are you sure you want to delete?"
        okText="Delete"
        visible={visible}
        onCancel={() => setVisible(false)}
        onConfirm={() => dispatch(deleteTag(tagId))}
      >
        <Dropdown overlay={menu} trigger={["contextMenu"]}>
          <TagContainer
            shape="round"
            size="small"
            type="primary"
            ghost={active}
            onClick={
              isDeleteOn
                ? () => setVisible(true)
                : () =>
                    dispatch(
                      tagToggled({ sectionId: tag?.section, tagId: tagId })
                    )
            }
          >
            {label}
          </TagContainer>
        </Dropdown>
      </Popconfirm>
      <Modal
        visible={open}
        width={300}
        closable={false}
        okText="Update"
        onOk={handleUpdate}
        onCancel={() => setOpen(false)}
      >
        <Input
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
