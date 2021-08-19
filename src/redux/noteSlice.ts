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
  throttle,
} from "redux-saga/effects";
import { message } from "antd";

import { RootState } from "./store";
import Api from "./api";
import { authCheck, selectIsAuthenticated, statusSet } from "./homeSlice";
import { selectTagById, tagPut } from "./tagSlice";

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
  justCreated: undefined,
} as {
  justCreated?: number;
});

function* fetchNotesSaga({ payload }: ReturnType<typeof fetchNotes>): any {
  try {
    yield call(authCheck);
    let res = yield call(Api.fetchNotes, payload);
    yield put(statusSet("synced"));
    const allNotes = yield select((state) =>
      selectNotesBySection(state, payload)
    );
    const allNoteIds = allNotes.map((note: NoteObj) => note.id);
    yield put(notesFetched({ add: res.data, remove: allNoteIds }));
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
    const allNotes = yield select((state) =>
      selectNotesBySection(state, payload)
    );
    const rank =
      allNotes.reduce(
        (max: number, curr: NoteObj) => (max = Math.max(max, curr.rank)),
        0
      ) + 10000;
    let data: any = { section: payload, rank, tag_set: [] };
    if (yield select(selectIsAuthenticated)) {
      yield call(authCheck);
      let res = yield call(Api.postNote, data);
      data = res.data;
      yield put(statusSet("synced"));
    } else {
      data = { id: Date.now(), ...data, title: "", content: "" };
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
    let { noteId, tag_set } = payload;
    if (yield select(selectIsAuthenticated)) {
      yield call(authCheck);
      yield call(Api.deleteNote, noteId);
      yield put(statusSet("synced"));
    }
    yield put(noteDeleted(noteId));
    for (let tagId of tag_set) {
      const tag = yield select((state) => selectTagById(state, tagId));
      yield put(
        tagPut({
          id: tagId,
          notes: tag.notes.filter((id: number) => id !== noteId),
        })
      );
    }
  } catch (err) {
    yield put(statusSet("offline"));
    yield put(noteDeleteError());
  }
}

function* watchDeleteNote() {
  yield takeEvery(deleteNote.type, deleteNoteSaga);
}

function* putNoteSaga({ payload, type }: ReturnType<typeof putNoteTitle>): any {
  try {
    let { note, tag } = payload;
    let data = note;
    if (yield select(selectIsAuthenticated)) {
      yield call(authCheck);
      let res = yield call(Api.putNote, data);
      data = res.data;
      yield put(statusSet("synced"));
    }
    yield put(notePut(data));
    if (type === putNoteTagAdd.type)
      yield put(tagPut({ id: tag.id, notes: [...tag.notes, data.id] }));
    if (type === putNoteTagRemove.type)
      yield put(
        tagPut({
          id: tag.id,
          notes: tag.notes.filter((id: number) => id !== data.id),
        })
      );
  } catch (err) {
    yield put(statusSet("offline"));
    yield put(notePutError());
  }
}

function* watchPutNote() {
  yield throttle(3000, putNoteTitle.type, putNoteSaga);
  yield throttle(5000, putNoteContent.type, putNoteSaga);
  yield takeEvery(putNoteTagAdd.type, putNoteSaga);
  yield takeEvery(putNoteTagRemove.type, putNoteSaga);
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
    fetchNotes(state, _) {},
    notesFetched(state, { payload }) {
      noteAdapter.removeMany(state, payload.remove);
      noteAdapter.upsertMany(state, payload.add);
    },
    notesFetchError(state) {
      message.error("An error has occurred");
    },
    postNote(state, _) {},
    notePosted(state, { payload }) {
      state.justCreated = payload.id;
      noteAdapter.addOne(state, payload);
    },
    notePostError(state) {
      message.error("An error has occurred");
    },
    deleteNote(state, _) {},
    noteDeleted(state, { payload }) {
      noteAdapter.removeOne(state, payload);
    },
    noteDeleteError(state) {
      message.error("An error has occurred");
    },
    putNoteTitle(state, _) {},
    putNoteContent(state, _) {},
    putNoteTagAdd(state, _) {},
    putNoteTagRemove(state, _) {},
    notePut(state, { payload }) {
      noteAdapter.upsertOne(state, payload);
    },
    notePutError(state) {
      message.error("An error has occurred");
    },
    noteSliceReset(state) {
      state.ids = initialState.ids;
      state.entities = initialState.entities;
    },
    justCreatedReset(state) {
      state.justCreated = undefined;
    },
    sectionNotesDeleted(state, { payload }) {
      noteAdapter.removeMany(
        state,
        Object.values(state.entities)
          .filter((note) => note?.section === payload)
          .map((note) => note?.id!)
      );
    },
  },
});

export default noteSlice.reducer;

export const {
  fetchNotes,
  notesFetched,
  notesFetchError,
  postNote,
  notePosted,
  notePostError,
  deleteNote,
  noteDeleted,
  noteDeleteError,
  putNoteTitle,
  putNoteContent,
  putNoteTagAdd,
  putNoteTagRemove,
  notePut,
  notePutError,
  noteSliceReset,
  justCreatedReset,
  sectionNotesDeleted,
} = noteSlice.actions;

export const {
  selectAll: selectAllNotes,
  selectById: selectNoteById,
  selectIds: selectNoteIds,
} = noteAdapter.getSelectors((state: RootState) => state.note);

const selectNote = (state: RootState) => state.note;

export const selectNotesBySection = createSelector(
  [selectAllNotes, (state: RootState, sectionId: number) => sectionId],
  (notes, sectionId) => notes.filter((note) => note.section === sectionId)
);

export const selectJustCreatedNoteId = createSelector(
  [selectNote],
  (note) => note.justCreated
);
