import { useState } from "react";
import styled from "styled-components";
import {
  Button,
  Card,
  Modal,
  Input,
  Typography,
  Popconfirm,
  Tag,
  Dropdown,
  Menu,
} from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";

import { useAppDispatch, useAppSelector } from "../redux/store";
import {
  deleteNote,
  putNoteTitle,
  putNoteContent,
  selectJustCreatedNoteId,
  selectNoteById,
  putNoteTag,
} from "../redux/noteSlice";
import NoteTag from "./NoteTag";
import { postTag, selectTagsBySection, TagObj } from "../redux/tagSlice";

const Note: React.FC<{ noteId: number }> = ({ noteId }) => {
  const dispatch = useAppDispatch();
  const justCreatedId = useAppSelector(selectJustCreatedNoteId);
  const [open, setOpen] = useState<boolean>(justCreatedId === noteId);
  const [inputVisible, setInputVisible] = useState<boolean>(false);
  const [menuVisible, setMenuVisible] = useState<boolean>(false);
  const [newTag, setNewTag] = useState<string>("");
  const note = useAppSelector((state) => selectNoteById(state, noteId));
  const sectionId: number = note?.section!;
  const tag_set: number[] = note?.tag_set!;
  const allTags: TagObj[] = useAppSelector((state) =>
    selectTagsBySection(state, sectionId)
  );
  const relTags = allTags.filter(({ id }) => !tag_set.includes(id));
  const [options, setOptions] = useState<TagObj[]>(relTags);

  const handleClose = () => {
    setMenuVisible(false);
    setInputVisible(false);
    setNewTag("");
  };

  const handleChange = (e: any) => {
    let value = e.target.value;
    setNewTag(value);
    setOptions(
      relTags.filter(({ label }) => label.includes(value.toLowerCase()))
    );
  };

  const handleCreate = (tagToAdd = newTag.toLowerCase()) => {
    let isNewTag = allTags
      .filter(({ id }) => tag_set.includes(id))
      .every(({ label }) => label !== tagToAdd);
    if (tagToAdd && isNewTag) {
      let existingTag = relTags.find(({ label }) => label === tagToAdd);
      if (existingTag) {
        dispatch(
          putNoteTag({ id: noteId, tag_set: [...tag_set, existingTag.id] })
        );
      } else {
        dispatch(
          postTag({ label: tagToAdd, section: sectionId, notes: [noteId] })
        );
      }
    }
    handleClose();
  };

  const menu = (
    <Menu>
      {options.map(({ id, label }) => (
        <Menu.Item
          key={id}
          onMouseDown={(e) => {
            e.preventDefault();
            handleCreate(label);
          }}
        >
          {label}
        </Menu.Item>
      ))}
    </Menu>
  );

  return (
    <div>
      <NoteContainer size="small" onClick={() => setOpen(true)} hoverable>
        <Typography.Title level={5}>
          {note?.title} {/* {note?.rank} */}
        </Typography.Title>
        <p>{note?.content}</p>
      </NoteContainer>
      <ModalContainer
        visible={open}
        closable={false}
        footer={null}
        onCancel={() => setOpen(false)}
      >
        <NoteTagView>
          {tag_set.map((tagId) => (
            <NoteTag key={tagId} tagId={tagId} />
          ))}
          {inputVisible ? (
            <Dropdown visible={options.length ? menuVisible : false} overlay={menu}>
              <Input
                maxLength={30}
                style={{ width: 80 }}
                autoFocus
                size="small"
                placeholder="New Tag"
                onChange={handleChange}
                onBlur={handleClose}
                onPressEnter={() => handleCreate()}
              />
            </Dropdown>
          ) : (
            <NewTagContainer
              onClick={() => {
                setInputVisible(true);
                setMenuVisible(true);
              }}
            >
              <PlusOutlined /> New Tag
            </NewTagContainer>
          )}
        </NoteTagView>
        <Input.TextArea
          autoSize
          bordered={false}
          defaultValue={note?.title}
          className="modal-title"
          placeholder="Title"
          onChange={(e) =>
            dispatch(putNoteTitle({ id: noteId, title: e.target.value }))
          }
        />
        <Input.TextArea
          autoSize
          bordered={false}
          defaultValue={note?.content}
          placeholder="Content"
          onChange={(e) =>
            dispatch(putNoteContent({ id: noteId, content: e.target.value }))
          }
        />
        <FooterContainer>
          <Popconfirm
            title="Are you sure you want to delete?"
            okText="Delete"
            placement="bottom"
            onConfirm={() => dispatch(deleteNote(noteId))}
          >
            <Button icon={<DeleteOutlined />} type="text"></Button>
          </Popconfirm>
        </FooterContainer>
      </ModalContainer>
    </div>
  );
};

const NoteContainer = styled(Card)`
  background-color: darkblue;
  display: flex;
  flex-direction: column;
  border: solid gray 1px;
  padding: 15px;
  border-radius: 5px;
  width: 200px;
  max-height: 300px;
  overflow: hidden;
  margin: 10px;
`;

const ModalContainer = styled(Modal)`
  .modal-title {
    font-size: 1.2em;
  }
`;

const NewTagContainer = styled(Tag)`
  background-color: transparent;
  border-style: dashed;
`;

const FooterContainer = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const NoteTagView = styled.div``;

export default Note;
