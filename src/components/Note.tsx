import { useEffect, useState } from "react";
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
  putNoteTagAdd,
  NoteObj,
  justCreatedReset,
} from "../redux/noteSlice";
import {
  postTag,
  selectSeparateTagsByOwnership,
  TagObj,
} from "../redux/tagSlice";
import NoteTag from "./NoteTag";

const Note: React.FC<{ noteId: number }> = ({ noteId }) => {
  const dispatch = useAppDispatch();
  const justCreatedId = useAppSelector(selectJustCreatedNoteId);
  const [open, setOpen] = useState<boolean>(false);
  const [inputVisible, setInputVisible] = useState<boolean>(false);
  const [menuVisible, setMenuVisible] = useState<boolean>(false);
  const [newTag, setNewTag] = useState<string>("");
  const note: NoteObj = useAppSelector((state) =>
    selectNoteById(state, noteId)
  )!;
  const [ownedTags, unownedTags]: TagObj[][] = useAppSelector((state) =>
    selectSeparateTagsByOwnership(state, note.section, note.tag_set)
  );
  const [options, setOptions] = useState<TagObj[]>(unownedTags);

  useEffect(() => {
    if (justCreatedId === noteId) {
      setOpen(true);
      dispatch(justCreatedReset());
    }
  }, [dispatch, justCreatedId, noteId]);

  const handleClose = () => {
    setMenuVisible(false);
    setInputVisible(false);
    setNewTag("");
  };

  const handleChange = (e: any) => {
    let value = e.target.value;
    setNewTag(value);
    setOptions(
      unownedTags.filter(({ label }) => label.includes(value.toLowerCase()))
    );
  };

  const handleCreate = (tagToAdd = newTag.toLowerCase()) => {
    let isNewTag = ownedTags.every(({ label }) => label !== tagToAdd);
    if (tagToAdd && isNewTag) {
      let existingTag = unownedTags.find(({ label }) => label === tagToAdd);
      if (existingTag) {
        dispatch(
          putNoteTagAdd({
            note: { id: noteId, tag_set: [...note.tag_set, existingTag.id] },
            tag: existingTag,
          })
        );
      } else {
        dispatch(
          postTag({ label: tagToAdd, section: note.section, notes: [noteId] })
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
        <Typography.Title level={5}>{note.title}</Typography.Title>
        <p>{note.content}</p>
      </NoteContainer>
      <ModalContainer
        visible={open}
        closable={false}
        footer={null}
        onCancel={() => setOpen(false)}
      >
        <NoteTagView>
          {ownedTags.map((tag) => (
            <NoteTag
              key={tag.id}
              tag={tag}
              noteId={noteId}
              tag_set={note.tag_set}
            />
          ))}
          {inputVisible ? (
            <Dropdown
              visible={options.length ? menuVisible : false}
              overlay={menu}
            >
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
                setOptions(unownedTags);
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
            dispatch(
              putNoteTitle({ note: { id: noteId, title: e.target.value } })
            )
          }
        />
        <Input.TextArea
          autoSize
          bordered={false}
          defaultValue={note?.content}
          placeholder="Content"
          onChange={(e) =>
            dispatch(
              putNoteContent({ note: { id: noteId, content: e.target.value } })
            )
          }
        />
        <FooterContainer>
          <Popconfirm
            title="Are you sure you want to delete?"
            okText="Delete"
            placement="bottom"
            onConfirm={() =>
              dispatch(deleteNote({ noteId, tag_set: note.tag_set }))
            }
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
