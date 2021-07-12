import { 
  createSlice, 
  createEntityAdapter,
  createSelector } from '@reduxjs/toolkit';
import { put, takeLatest } from 'redux-saga/effects';

import { RootState, GenRes } from './store';
import Api from './api';

export interface NoteObj {
  id: number,
  rank: number, 
  title: string,
  content: string,
  section: number,
  tag_set: number[]
}

const noteAdapter = createEntityAdapter<NoteObj>({
  selectId: (note) => note.id,
  sortComparer: (a, b) =>  b.rank - a.rank
});

const initialState = noteAdapter.getInitialState({
  loading: 'idle',
  error: null,
  toDelete: []
} as {
  loading: String,
  error: any,
  toDelete: number[]
});

function* fetchNotesSaga({ payload }: ReturnType<typeof fetchNotes>) {
  const res: GenRes = yield Api.fetchNotes(payload);
  yield put(notesFetched(res.data));
}

export function* watchFetchNotes() {
  yield takeLatest(fetchNotes.type, fetchNotesSaga);
}

const noteSlice = createSlice({
  name: 'note',
  initialState,
  reducers: {
    fetchNotes(state, action) {
      state.loading = 'loading';
    },
    notesFetched(state, { payload }) {
      noteAdapter.upsertMany(state, payload);
      state.loading = 'idle';
    },
    addToDelete(state, { payload }) {
      state.toDelete.push(payload)
    },
    deleted(state) {
      state.toDelete = []
    }
  }
});

export default noteSlice.reducer;

export const {
  fetchNotes, 
  notesFetched,
  addToDelete,
  deleted } = noteSlice.actions;

export const {
  selectAll: selectAllNotes,  
  selectById: selectNoteById,
  selectIds: selectNoteIds
} = noteAdapter.getSelectors((state: RootState) => state.note);

const selectNote = (state: RootState) => state.note;

export const selectNoteLoading = createSelector(
  [selectNote],
  note => note.loading
);

export const selectNotesBySection = createSelector(
  [selectAllNotes, (state: RootState, sectionId: number) => sectionId],
  (notes, sectionId) => notes.filter(note => note.section === sectionId)
);

export const selectNotesToDelete = createSelector(
  [selectNote],
  note => note.toDelete
);