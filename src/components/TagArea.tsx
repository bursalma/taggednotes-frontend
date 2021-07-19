import { useEffect } from "react";
import styled from "styled-components";
import { Spin, Button, Switch, Tooltip, Space } from "antd";
import { CloseOutlined } from "@ant-design/icons";

import { useAppDispatch, useAppSelector } from "../redux/store";
import {
  fetchTags,
  selectTagLoading,
  filterReset,
  isAndFilterToggled,
  selectTagMetaBySection,
  selectTagsBySection,
  selectTagsToDelete,
} from "../redux/tagSlice";
import Tag from "./Tag";

const TagArea: React.FC<{ sectionId: number }> = ({ sectionId }) => {
  const dispatch = useAppDispatch();
  const loading = useAppSelector(selectTagLoading);
  const toDelete = useAppSelector(selectTagsToDelete);
  const allTags = useAppSelector((state) =>
    selectTagsBySection(state, sectionId)
  );
  const { isAndFilter, activeTagIds, activeNoteIds } = useAppSelector((state) =>
    selectTagMetaBySection(state, sectionId)
  );

  useEffect(() => {
    dispatch(fetchTags(sectionId));
  }, [dispatch, sectionId]);

  return (
    <div>
      {loading ? (
        <Spin size="large" />
      ) : (
        <TagAreaContainer>
          <SettingsContainer>
          <Space>
            <Tooltip
              title="Filter by intersection or union"
              placement="topLeft"
              mouseEnterDelay={1}
            >
              <Switch
                checkedChildren="⋂"
                unCheckedChildren="⋃"
                size="small"
                defaultChecked
                onChange={() => dispatch(isAndFilterToggled(sectionId))}
              />
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
            {allTags
              .filter(({ id }) => !toDelete.includes(id))
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
        </TagAreaContainer>
      )}
    </div>
  );
};

const TagAreaContainer = styled.div``;

const TagsViewContainer = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
`;

const SettingsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
`;

export default TagArea;
