import {
  createSlice,
  createEntityAdapter,
  createSelector,
} from "@reduxjs/toolkit";
import { call, put, takeLatest } from "redux-saga/effects";

import { RootState } from "./store";
import Api from "./api";
import { authCheck, statusSet } from "./homeSlice";

export interface NoteObj {
  id: number;
  rank: number;
  title: string;
  content: string;
  section: number;
  tag_set: number[];
}

const noteAdapter = createEntityAdapter<NoteObj>({
  selectId: (note) => note.id,
  sortComparer: (a, b) => b.rank - a.rank,
});

const initialState = noteAdapter.getInitialState({
  loading: false,
  error: null,
  toDelete: [],
} as {
  loading: boolean;
  error: any;
  toDelete: number[];
});

function* fetchNotesSaga({ payload }: ReturnType<typeof fetchNotes>): any {
  try {
    yield call(authCheck);
    let res = yield call(Api.fetchNotes, payload);
    yield put(statusSet("synced"));
    yield put(notesFetched(res.data));
  } catch (err) {
    yield put(statusSet("offline"));
    yield put(notesFetchError());
  }
}

export function* watchFetchNotes() {
  yield takeLatest(fetchNotes.type, fetchNotesSaga);
}

const noteSlice = createSlice({
  name: "note",
  initialState,
  reducers: {
    fetchNotes(state, _) {
      state.loading = true;
    },
    notesFetched(state, { payload }) {
      noteAdapter.upsertMany(state, payload);
      state.loading = false;
    },
    notesFetchError(state) {
      state.loading = false;
    },
    addToDelete(state, { payload }) {
      state.toDelete.push(payload);
    },
    deleted(state) {
      state.toDelete = [];
    },
    noteSliceReset(state) {
      state = initialState;
    },
  },
});

export default noteSlice.reducer;

export const {
  fetchNotes,
  notesFetched,
  notesFetchError,
  addToDelete,
  deleted,
  noteSliceReset,
} = noteSlice.actions;

export const {
  selectAll: selectAllNotes,
  selectById: selectNoteById,
  selectIds: selectNoteIds,
} = noteAdapter.getSelectors((state: RootState) => state.note);

const selectNote = (state: RootState) => state.note;

export const selectNoteLoading = createSelector(
  [selectNote],
  (note) => note.loading
);

export const selectNotesBySection = createSelector(
  [selectAllNotes, (state: RootState, sectionId: number) => sectionId],
  (notes, sectionId) => notes.filter((note) => note.section === sectionId)
);

export const selectNotesToDelete = createSelector(
  [selectNote],
  (note) => note.toDelete
);
