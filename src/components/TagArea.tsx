import { useEffect, useState } from "react";
import styled from "styled-components";
import { Button, Tooltip, Space, Modal, Input } from "antd";
import { CloseOutlined, PlusOutlined } from "@ant-design/icons";

import { useAppDispatch, useAppSelector } from "../redux/store";
import { selectIsAuthenticated } from "../redux/homeSlice";
import {
  fetchTags,
  filterReset,
  isAndFilterToggled,
  postTag,
  selectTagMetaBySection,
  selectTagsBySection,
} from "../redux/tagSlice";
import Tag from "./Tag";

const TagArea: React.FC<{ sectionId: number }> = ({ sectionId }) => {
  const [postVal, setPostVal] = useState<string>("");
  const [open, setOpen] = useState<boolean>(false);
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const allTags = useAppSelector((state) =>
    selectTagsBySection(state, sectionId)
  );
  const { isAndFilter, activeTagIds, activeNoteIds } =
    useAppSelector((state) => selectTagMetaBySection(state, sectionId));

  useEffect(() => {
    if (isAuthenticated) dispatch(fetchTags(sectionId));
  }, [dispatch, sectionId, isAuthenticated]);

  const handleCreate = () => {
    if (postVal) dispatch(postTag({ label: postVal, section: sectionId }));
    setOpen(false);
  };

  return (
    <TagAreaContainer>
      <SettingsContainer>
        <Space>
          <Tooltip
            title="Filter by intersection or union"
            placement="topLeft"
            mouseEnterDelay={1}
          >
            <Button
              shape="circle"
              size="small"
              type="primary"
              // ghost={!isAndFilter}
              onClick={() => dispatch(isAndFilterToggled(sectionId))}
            >
              {isAndFilter ? "⋂" : "⋃"}
            </Button>
          </Tooltip>
          <Button
            shape="circle"
            size="small"
            type="primary"
            icon={<CloseOutlined />}
            onClick={() => dispatch(filterReset(sectionId))}
          />
        </Space>
      </SettingsContainer>
      <TagsViewContainer>
        <Button
          shape="circle"
          size="small"
          type="primary"
          style={{ margin: "3px" }}
          icon={<PlusOutlined />}
          onClick={() => setOpen(true)}
        />
        {allTags
          .filter((tag) =>
            activeTagIds.includes(tag.id)
              ? false
              : activeTagIds.length === 0 || !isAndFilter
              ? true
              : tag.notes.some((noteId) => activeNoteIds.includes(noteId))
          )
          .map((tag) => (
            <Tag key={tag.id} tagId={tag.id} />
          ))}
      </TagsViewContainer>
      <TagsViewContainer>
        {activeTagIds.map((tagId: number) => (
          <Tag key={tagId} tagId={tagId} />
        ))}
      </TagsViewContainer>
      <Modal
        visible={open}
        width={300}
        closable={false}
        okText="Create"
        onOk={handleCreate}
        onCancel={() => setOpen(false)}
      >
        <Input
          maxLength={30}
          onPressEnter={handleCreate}
          allowClear
          onChange={(e) => setPostVal(e.target.value)}
          placeholder="Create Tag"
        />
      </Modal>
    </TagAreaContainer>
  );
};

const TagAreaContainer = styled.div``;

const TagsViewContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
`;

const SettingsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  align-items: center;
`;

export default TagArea;
