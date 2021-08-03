import { useEffect } from "react";
import styled from "styled-components";
import { Affix, Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";

import { useAppDispatch, useAppSelector } from "../redux/store";
import { selectTagMetaBySection } from "../redux/tagSlice";
import { fetchNotes, postNote, selectNotesBySection } from "../redux/noteSlice";
import { selectIsAuthenticated } from "../redux/homeSlice";
import Note from "./Note";

const NoteArea: React.FC<{ sectionId: number }> = ({ sectionId }) => {
  const dispatch = useAppDispatch();
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
      <Affix style={{ position: "fixed", right: 40, bottom: 100 }}>
        <Button
          type="primary"
          shape="circle"
          onClick={() => dispatch(postNote(sectionId))}
          size="large"
          icon={<PlusOutlined />}
        />
      </Affix>
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
