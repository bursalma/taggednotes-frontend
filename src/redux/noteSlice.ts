import {
  createSlice,
  createEntityAdapter,
  createSelector,
} from "@reduxjs/toolkit";
import {
  all,
  call,
  put,
  select,
  takeEvery,
  takeLatest,
} from "redux-saga/effects";

import { RootState } from "./store";
import Api from "./api";
import { authCheck, selectIsAuthenticated, statusSet } from "./homeSlice";

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
  localId: 0,
  loading: false,
  error: null,
  toDelete: [],
} as {
  localId: number;
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

function* watchFetchNotes() {
  yield takeLatest(fetchNotes.type, fetchNotesSaga);
}

function* postNoteSaga({ payload }: ReturnType<typeof postNote>): any {
  try {
    let data = payload;
    if (yield select(selectIsAuthenticated)) {
      yield call(authCheck);
      let res = yield call(Api.postNote, data);
      data = res.data;
      yield put(statusSet("synced"));
    } else {
      const id = yield select(selectLocalId);
      data = { id, ...data, rank: id };
      yield put(localIdIncrement());
    }
    yield put(notePosted(data));
  } catch (err) {
    yield put(statusSet("offline"));
    yield put(notePostError());
  }
}

function* watchPostNote() {
  yield takeEvery(postNote.type, postNoteSaga);
}

function* deleteNoteSaga({ payload }: ReturnType<typeof deleteNote>): any {
  try {
    let id: number = payload;
    if (yield select(selectIsAuthenticated)) {
      yield call(authCheck);
      yield call(Api.deleteNote, id);
      yield put(statusSet("synced"));
    }
    yield put(noteDeleted(id));
  } catch (err) {
    yield put(statusSet("offline"));
    yield put(noteDeleteError());
  }
}

function* watchDeleteNote() {
  yield takeEvery(deleteNote.type, deleteNoteSaga);
}

function* putNoteSaga({ payload }: ReturnType<typeof putNote>): any {
  try {
    let data = payload;
    if (yield select(selectIsAuthenticated)) {
      yield call(authCheck);
      let res = yield call(Api.putNote, payload);
      data = res.data;
      yield put(statusSet("synced"));
    }
    yield put(notePut(data));
  } catch (err) {
    yield put(statusSet("offline"));
    yield put(notePutError());
  }
}

function* watchPutNote() {
  yield takeEvery(putNote.type, putNoteSaga);
}

export function* noteRootSaga() {
  yield all([
    watchFetchNotes(),
    watchPostNote(),
    watchDeleteNote(),
    watchPutNote(),
  ]);
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
    postNote(state, _) {
      state.loading = true;
    },
    notePosted(state, { payload }) {
      noteAdapter.addOne(state, payload);
      state.loading = false;
    },
    notePostError(state) {
      state.loading = false;
    },
    deleteNote(state, _) {
      state.loading = true;
    },
    noteDeleted(state, { payload }) {
      noteAdapter.removeOne(state, payload);
      state.loading = false;
    },
    noteDeleteError(state) {
      state.loading = false;
    },
    putNote(state, _) {
      state.loading = true;
    },
    notePut(state, { payload }) {
      noteAdapter.upsertOne(state, payload);
      state.loading = false;
    },
    notePutError(state) {
      state.loading = false;
    },
    localIdIncrement(state) {
      state.localId++;
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
  postNote,
  notePosted,
  notePostError,
  deleteNote,
  noteDeleted,
  noteDeleteError,
  putNote,
  notePut,
  notePutError,
  localIdIncrement,
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

export const selectLocalId = createSelector(
  [selectNote],
  (note) => note.localId
);
