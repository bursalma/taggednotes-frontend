import {
  createSlice,
  createEntityAdapter,
  createSelector,
} from "@reduxjs/toolkit";
import { call, put, takeLatest } from "redux-saga/effects";

import { RootState } from "./store";
import Api from "./api";
import { authCheck, statusSet } from "./homeSlice";

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
  loading: false,
  error: null,
  toDelete: [],
  meta: {},
} as {
  loading: boolean;
  error: any;
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

export function* watchFetchTags() {
  yield takeLatest(fetchTags.type, fetchTagsSaga);
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
    fetchTags(state, action) {
      state.loading = true;
    },
    tagsFetched(state, { payload }) {
      tagAdapter.upsertMany(state, payload);
      state.loading = false;
    },
    tagsFetchError(state) {
      state.loading = false;
    },
    addToDelete(state, { payload }) {
      state.toDelete.push(payload);
    },
    deleted(state) {
      state.toDelete = [];
    },
    tagSliceReset(state) {
      state = initialState;
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
  addToDelete,
  deleted,
  tagSliceReset,
} = tagSlice.actions;

export const {
  selectAll: selectAllTags,
  selectById: selectTagById,
  selectIds: selectTagIds,
} = tagAdapter.getSelectors((state: RootState) => state.tag);

const selectTag = (state: RootState) => state.tag;

export const selectTagLoading = createSelector(
  [selectTag],
  (tag) => tag.loading
);

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
