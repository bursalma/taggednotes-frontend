import { useState } from 'react';
import styled from 'styled-components';
import { Card, Modal, Input, Typography } from 'antd';

import { useAppSelector } from '../redux/store';
import { selectNoteById } from '../redux/noteSlice';

const Note: React.FC<{ noteId: number }> = ({ noteId }) => {
  const [open, setOpen] = useState<boolean>(false);
  const { Title } = Typography;
  const { TextArea } = Input;
  const note = useAppSelector(state => selectNoteById(state, noteId));

  const handleChange = (param: any) => {
    // console.log(param);
  }

  return (
    <div>
      <NoteContainer 
        size="small"
        onClick={() => setOpen(true)}
        hoverable
      >
        <Title level={5}>{note?.rank} {note?.title}</Title>
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
          onChange={handleChange}
        />
        <TextArea 
          autoSize
          bordered={false}
          defaultValue={note?.content}
          onChange={handleChange}
        />
      </ModalContainer>
    </div>
  )
}

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
`

const ModalContainer = styled(Modal)`
  .modal-title {
    font-size: 1.2em;
  }
`

export default Note;
