import { useState } from "react";
import styled from "styled-components";
import { Button, Card, Modal, Input, Typography, Popconfirm } from "antd";

import { useAppDispatch, useAppSelector } from "../redux/store";
import {
  deleteNote,
  // putNote,
  putNoteTitle,
  putNoteContent,
  selectJustCreatedNoteId,
  selectNoteById,
} from "../redux/noteSlice";
import { DeleteOutlined } from "@ant-design/icons";

const Note: React.FC<{ noteId: number; sectionId: number }> = ({
  noteId,
  sectionId,
}) => {
  const dispatch = useAppDispatch();
  const justCreatedId = useAppSelector(selectJustCreatedNoteId);
  const [open, setOpen] = useState<boolean>(justCreatedId === noteId);
  const { Title } = Typography;
  const { TextArea } = Input;
  const note = useAppSelector((state) => selectNoteById(state, noteId));

  return (
    <div>
      <NoteContainer size="small" onClick={() => setOpen(true)} hoverable>
        <Title level={5}>
          {note?.title} {/* {note?.rank} */}
        </Title>
        <p>{note?.content}</p>
      </NoteContainer>
      <ModalContainer
        visible={open}
        closable={false}
        footer={null}
        onCancel={() => setOpen(false)}
      >
        <TextArea
          autoSize
          bordered={false}
          defaultValue={note?.title}
          className="modal-title"
          onChange={(e) =>
            dispatch(
              putNoteTitle({
                id: noteId,
                section: sectionId,
                title: e.target.value,
              })
            )
          }
          placeholder="Title"
        />
        <TextArea
          autoSize
          bordered={false}
          defaultValue={note?.content}
          onChange={(e) =>
            dispatch(
              putNoteContent({
                id: noteId,
                section: sectionId,
                content: e.target.value,
              })
            )
          }
          placeholder="Content"
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

const FooterContainer = styled.div`
  display: flex;
  justify-content: flex-end;
`;

export default Note;
