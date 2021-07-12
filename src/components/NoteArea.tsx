import { useEffect } from 'react';
import styled from 'styled-components';
import { Spin } from 'antd';

import { useAppDispatch, useAppSelector } from '../redux/store';
import { 
  fetchNotes, 
  selectNoteLoading, 
  selectNotesBySection,
  selectNotesToDelete } from '../redux/noteSlice';
import { selectTagMetaBySection } from '../redux/tagSlice';
import Note from './Note';

const NoteArea: React.FC<{ sectionId: number }> = ({ sectionId }) => {
  const dispatch = useAppDispatch()
  const loading = useAppSelector(selectNoteLoading)
  const toDelete = useAppSelector(selectNotesToDelete);
  const allNotes = useAppSelector(state => selectNotesBySection(state, sectionId))
  const { isAndFilter, activeTagIds } = useAppSelector(state => selectTagMetaBySection(state, sectionId))

  useEffect(() => {
    dispatch(fetchNotes(sectionId))
  }, [dispatch, sectionId]);

  return(
    <NoteAreaContainer>
      {loading === 'loading' ?
      <Spin size='large' /> :
      <NotesViewContainer>
        {allNotes
          .filter(({ id }) => !toDelete.includes(id))
          // .map(note => Object.assign({title: `${note.title} hey`}, note))
          .filter(note => activeTagIds.length === 0 ? true : isAndFilter ?
            activeTagIds.every((tagId: number) => note.tag_set.includes(tagId)) :
            note.tag_set.some(tagId => activeTagIds.includes(tagId))
          )
          .map(note => <Note key={note.id} noteId={note.id} />)
        }
      </NotesViewContainer>}
    </NoteAreaContainer>
  );
}

const NoteAreaContainer = styled.div`
`

const NotesViewContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  padding: 20px;
`

export default NoteArea;
