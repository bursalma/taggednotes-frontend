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
  toDelete: [],
  meta: {},
} as {
  toDelete: number[];
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
    yield put(tagsFetched(res.data));
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
    let data = payload;
    if (yield select(selectIsAuthenticated)) {
      yield call(authCheck);
      let res = yield call(Api.postTag, data);
      data = res.data;
      yield put(statusSet("synced"));
    } else {
      let id = 1;
      data = { id, ...data, rank: id };
    }
    yield put(tagPosted(data));
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
    let id: number = payload;
    if (yield select(selectIsAuthenticated)) {
      yield call(authCheck);
      yield call(Api.deleteTag, id);
      yield put(statusSet("synced"));
    }
    yield put(tagDeleted(id));
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
      let sectionId = payload;
      let tagMeta = meta[sectionId];
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
      tagAdapter.upsertMany(state, payload);
    },
    tagsFetchError(state) {},
    addToDelete(state, { payload }) {
      state.toDelete.push(payload);
    },
    deleted(state) {
      state.toDelete = [];
    },
    tagSliceReset(state) {
      state.ids = initialState.ids;
      state.entities = initialState.entities;
      state.meta = initialState.meta;
    },
    postTag(state, _) {},
    tagPosted(state, { payload }) {
      tagAdapter.addOne(state, payload);
    },
    tagPostError(state) {},
    deleteTag(state, _) {},
    tagDeleted(state, { payload }) {
      tagAdapter.removeOne(state, payload);
    },
    tagDeleteError(state) {},
    putTag(state, _) {},
    tagPut(state, { payload }) {
      tagAdapter.upsertOne(state, payload);
    },
    tagPutError(state) {},
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
  addToDelete,
  deleted,
  tagSliceReset,
  postTag,
  tagPosted,
  tagPostError,
  deleteTag,
  tagDeleted,
  tagDeleteError,
  putTag,
  tagPut,
  tagPutError,
} = tagSlice.actions;

export const {
  selectAll: selectAllTags,
  selectById: selectTagById,
  selectIds: selectTagIds,
} = tagAdapter.getSelectors((state: RootState) => state.tag);

const selectTag = (state: RootState) => state.tag;
const selectTagMeta = (state: RootState) => state.tag.meta;

export const selectTagMetaBySection = createSelector(
  [selectTagMeta, (state: RootState, sectionId: number) => sectionId],
  (meta, sectionId) => meta[sectionId]
);

export const selectTagsBySection = createSelector(
  [selectAllTags, (state: RootState, sectionId: number) => sectionId],
  (tags, sectionId) => tags.filter((tag) => tag.section === sectionId)
);

export const selectTagsToDelete = createSelector(
  [selectTag],
  (tag) => tag.toDelete
);
