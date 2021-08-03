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
import { message } from "antd";

import { RootState } from "./store";
import Api from "./api";
import { authCheck, selectIsAuthenticated, statusSet } from "./homeSlice";
import { notePut, selectNoteById } from "./noteSlice";

export interface TagObj {
  id: number;
  rank: number;
  label: string;
  section: number;
  notes: number[];
}

const tagAdapter = createEntityAdapter<TagObj>({
  selectId: (tag) => tag.id,
  sortComparer: (a, b) => a.rank - b.rank,
});

const initialState = tagAdapter.getInitialState({
  meta: {},
} as {
  meta: {
    [sectionId: number]: {
      isAndFilter: boolean;
      activeTagIds: number[];
      activeNoteIds: number[];
    };
  };
});

function* fetchTagsSaga({ payload }: ReturnType<typeof fetchTags>): any {
  try {
    yield call(authCheck);
    let res = yield call(Api.fetchTags, payload);
    yield put(statusSet("synced"));
    const allTags = yield select((state) =>
      selectTagsBySection(state, payload)
    );
    const allTagIds = allTags.map((tag: TagObj) => tag.id);
    yield put(tagsFetched({ add: res.data, remove: allTagIds }));
  } catch (err) {
    yield put(statusSet("offline"));
    yield put(tagsFetchError());
  }
}

function* watchFetchTags() {
  yield takeLatest(fetchTags.type, fetchTagsSaga);
}

function* postTagSaga({ payload }: ReturnType<typeof postTag>): any {
  try {
    const allTags = yield select((state) =>
      selectTagsBySection(state, payload.section)
    );
    const rank =
      allTags.reduce(
        (max: number, curr: TagObj) => (max = Math.max(max, curr.rank)),
        0
      ) + 10000;
    let data: any = { rank, ...payload };
    if (yield select(selectIsAuthenticated)) {
      yield call(authCheck);
      let res = yield call(Api.postTag, data);
      data = res.data;
      yield put(statusSet("synced"));
    } else {
      data = { id: rank, ...data, notes: [] };
    }
    yield put(tagPosted(data));
    for (let noteId of data.notes) {
      const note = yield select((state) => selectNoteById(state, noteId));
      yield put(notePut({ ...note, tag_set: [...note.tag_set, data.id] }));
    }
  } catch (err) {
    yield put(statusSet("offline"));
    yield put(tagPostError());
  }
}

function* watchPostTag() {
  yield takeEvery(postTag.type, postTagSaga);
}

function* deleteTagSaga({ payload }: ReturnType<typeof deleteTag>): any {
  try {
    let { tagId, notes } = payload;
    if (yield select(selectIsAuthenticated)) {
      yield call(authCheck);
      yield call(Api.deleteTag, tagId);
      yield put(statusSet("synced"));
    }
    yield put(tagDeleted(tagId));
    for (let noteId of notes) {
      const note = yield select((state) => selectNoteById(state, noteId));
      yield put(
        notePut({
          id: noteId,
          tag_set: note.tag_set.filter((id: number) => id !== tagId),
        })
      );
    }
  } catch (err) {
    yield put(statusSet("offline"));
    yield put(tagDeleteError());
  }
}

function* watchDeleteTag() {
  yield takeEvery(deleteTag.type, deleteTagSaga);
}

function* putTagSaga({ payload }: ReturnType<typeof putTag>): any {
  try {
    let data = payload;
    if (yield select(selectIsAuthenticated)) {
      yield call(authCheck);
      let res = yield call(Api.putTag, payload);
      data = res.data;
      yield put(statusSet("synced"));
    }
    yield put(tagPut(data));
  } catch (err) {
    yield put(statusSet("offline"));
    yield put(tagPutError());
  }
}

function* watchPutTag() {
  yield takeEvery(putTag.type, putTagSaga);
}

export function* tagRootSaga() {
  yield all([
    watchFetchTags(),
    watchPostTag(),
    watchDeleteTag(),
    watchPutTag(),
  ]);
}

const tagSlice = createSlice({
  name: "tag",
  initialState,
  reducers: {
    sectionMounted({ meta }, { payload }) {
      let sectionId = payload;
      if (!meta[sectionId]) {
        meta[sectionId] = {
          isAndFilter: true,
          activeTagIds: [],
          activeNoteIds: [],
        };
      }
    },
    isAndFilterToggled({ meta }, { payload }) {
      let tagMeta = meta[payload];
      tagMeta.isAndFilter = !tagMeta.isAndFilter;
    },
    tagToggled(state, action) {
      let { sectionId, tagId } = action.payload;
      let meta = state.meta[sectionId];
      meta.activeTagIds.includes(tagId)
        ? (meta.activeTagIds = meta.activeTagIds.filter((id) => id !== tagId))
        : meta.activeTagIds.push(tagId);

      let activeNotes: number[][] = meta.activeTagIds.map(
        (id) => state.entities[id]?.notes!
      );

      meta.activeNoteIds =
        activeNotes.length === 0
          ? []
          : activeNotes.reduce((first, curr) =>
              first.filter((id) => curr.includes(id))
            );
    },
    filterReset({ meta }, { payload }) {
      let sectionId = payload;
      meta[sectionId].activeTagIds = [];
      meta[sectionId].activeNoteIds = [];
    },
    fetchTags(state, action) {},
    tagsFetched(state, { payload }) {
      tagAdapter.removeMany(state, payload.remove);
      tagAdapter.upsertMany(state, payload.add);
    },
    tagsFetchError(state) {
      message.error("An error has occurred");
    },
    postTag(state, _) {},
    tagPosted(state, { payload }) {
      tagAdapter.addOne(state, payload);
    },
    tagPostError(state) {
      message.error("An error has occurred");
    },
    deleteTag(state, _) {},
    tagDeleted(state, { payload }) {
      tagAdapter.removeOne(state, payload);
    },
    tagDeleteError(state) {
      message.error("An error has occurred");
    },
    putTag(state, _) {},
    tagPut(state, { payload }) {
      tagAdapter.upsertOne(state, payload);
    },
    tagPutError(state) {
      message.error("An error has occurred");
    },
    tagSliceReset(state) {
      state.ids = initialState.ids;
      state.entities = initialState.entities;
      state.meta = initialState.meta;
    },
  },
});

export default tagSlice.reducer;

export const {
  sectionMounted,
  isAndFilterToggled,
  tagToggled,
  filterReset,
  fetchTags,
  tagsFetched,
  tagsFetchError,
  postTag,
  tagPosted,
  tagPostError,
  deleteTag,
  tagDeleted,
  tagDeleteError,
  putTag,
  tagPut,
  tagPutError,
  tagSliceReset,
} = tagSlice.actions;

export const {
  selectAll: selectAllTags,
  selectById: selectTagById,
  selectIds: selectTagIds,
} = tagAdapter.getSelectors((state: RootState) => state.tag);

export const selectTag = (state: RootState) => state.tag;
const selectTagMeta = (state: RootState) => state.tag.meta;

export const selectTagMetaBySection = createSelector(
  [selectTagMeta, (_: RootState, sectionId: number) => sectionId],
  (meta, sectionId) => meta[sectionId]
);

export const selectTagsBySection = createSelector(
  [selectAllTags, (_: RootState, sectionId: number) => sectionId],
  (tags, sectionId) => tags.filter((tag) => tag.section === sectionId)
);

export const selectSeparateTagsByOwnership = createSelector(
  (state: RootState, sectionId: number, tag_set: number[]) => ({
    tags: selectTagsBySection(state, sectionId),
    tag_set,
  }),
  ({ tags, tag_set }) =>
    tags.reduce(
      (res, tag) => {
        tag_set.includes(tag.id) ? res[0].push(tag) : res[1].push(tag);
        return res;
      },
      [[], []] as TagObj[][]
    )
);
