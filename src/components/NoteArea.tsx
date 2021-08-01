import { useEffect } from "react";
import styled from "styled-components";

import { useAppDispatch, useAppSelector } from "../redux/store";
import {
  fetchNotes,
  selectNotesBySection,
  selectNotesToDelete,
} from "../redux/noteSlice";
import { selectTagMetaBySection } from "../redux/tagSlice";
import Note from "./Note";
import { selectIsAuthenticated } from "../redux/homeSlice";

const NoteArea: React.FC<{ sectionId: number }> = ({ sectionId }) => {
  const dispatch = useAppDispatch();
  const toDelete = useAppSelector(selectNotesToDelete);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const allNotes = useAppSelector((state) =>
    selectNotesBySection(state, sectionId)
  );
  const { isAndFilter, activeTagIds } = useAppSelector((state) =>
    selectTagMetaBySection(state, sectionId)
  );

  useEffect(() => {
    if (isAuthenticated) dispatch(fetchNotes(sectionId));
  }, [dispatch, sectionId, isAuthenticated]);

  return (
    <NoteAreaContainer>
      <NotesViewContainer>
        {allNotes
          .filter(({ id }) => !toDelete.includes(id))
          .filter((note) =>
            activeTagIds.length === 0
              ? true
              : isAndFilter
              ? activeTagIds.every((tagId: number) =>
                  note.tag_set.includes(tagId)
                )
              : note.tag_set.some((tagId) => activeTagIds.includes(tagId))
          )
          .map((note) => (
            <Note key={note.id} noteId={note.id} />
          ))}
      </NotesViewContainer>
    </NoteAreaContainer>
  );
};

const NoteAreaContainer = styled.div``;

const NotesViewContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  padding: 20px;
`;

export default NoteArea;
