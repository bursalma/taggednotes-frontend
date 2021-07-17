import {
  createSlice,
  createEntityAdapter,
  createSelector,
} from "@reduxjs/toolkit";
import { all, call, put, takeEvery, takeLatest } from "redux-saga/effects";

import { RootState } from "./store";
import Api from "./api";
import { statusSet } from "./homeSlice";

export interface SectionObj {
  id: number;
  rank: number;
  name: string;
  tag_rank: number;
  note_rank: number;
}

const sectionAdapter = createEntityAdapter<SectionObj>({
  selectId: (section) => section.id,
  sortComparer: (a, b) => a.rank - b.rank,
});

const initialState = sectionAdapter.getInitialState({
  activeKey: "default",
  loading: false,
  error: null,
  toDelete: [],
} as {
  activeKey: String;
  loading: boolean;
  error: any;
  toDelete: number[];
});

function* fetchSectionsSaga(): any {
  try {
    let res = yield call(Api.fetchSections);

    if (res.status === 200) {
      yield put(statusSet("synced"));
      yield put(sectionsFetched(res.data));
    } else {
      throw new Error("status not 200");
    }
  } catch (err) {
    yield put(statusSet("offline"));
    yield put(sectionsFetchError());
  }
}

function* watchFetchSections() {
  yield takeLatest(fetchSections.type, fetchSectionsSaga);
}

function* postSectionSaga({ payload }: ReturnType<typeof postSection>): any {
  try {
    let name: string = payload;
    let res = yield call(Api.postSection, name);

    if (res.status === 201) {
      yield put(statusSet("synced"));
      yield put(sectionPosted(res.data));
    } else {
      throw new Error("status not 201");
    }
  } catch (err) {
    yield put(statusSet("offline"));
    yield put(sectionPostError());
  }
}

function* watchPostSection() {
  yield takeEvery(postSection.type, postSectionSaga);
}

function* deleteSectionSaga({
  payload,
}: ReturnType<typeof deleteSection>): any {
  try {
    let id: number = payload;
    let res = yield call(Api.deleteSection, id);

    if (res.status === 204) {
      yield put(statusSet("synced"));
      yield put(sectionDeleted(id));
    } else {
      throw new Error("status not 204");
    }
  } catch (err) {
    yield put(statusSet("offline"));
    yield put(sectionDeleteError());
  }
}

function* watchDeleteSection() {
  yield takeEvery(deleteSection.type, deleteSectionSaga);
}

function* putSectionSaga({ payload }: ReturnType<typeof putSection>): any {
  try {
    let { sectionId, putVal } = payload;
    let res = yield call(Api.putSection, sectionId, putVal);

    if (res.status === 200) {
      yield put(statusSet("synced"));
      yield put(sectionPut(res.data));
    } else {
      throw new Error("status not 200");
    }
  } catch (err) {
    yield put(statusSet("offline"));
    yield put(sectionPutError());
  }
}

function* watchPutSection() {
  yield takeEvery(putSection.type, putSectionSaga);
}

export function* sectionRootSaga() {
  yield all([
    watchFetchSections(),
    watchPostSection(),
    watchDeleteSection(),
    watchPutSection(),
  ]);
}

const sectionSlice = createSlice({
  name: "section",
  initialState,
  reducers: {
    fetchSections(state) {
      state.loading = true;
    },
    sectionsFetched(state, { payload }) {
      sectionAdapter.setAll(state, payload);
      state.loading = false;
    },
    sectionsFetchError(state) {
      state.loading = false;
    },
    postSection(state, action) {
      state.loading = true;
    },
    sectionPosted(state, { payload }) {
      sectionAdapter.addOne(state, payload);
      state.loading = false;
    },
    sectionPostError(state) {
      state.loading = false;
    },
    deleteSection(state, action) {
      state.loading = true;
    },
    sectionDeleted(state, { payload }) {
      sectionAdapter.removeOne(state, payload);
      state.loading = false;
    },
    sectionDeleteError(state) {
      state.loading = false;
    },
    putSection(state, action) {
      state.loading = true;
    },
    sectionPut(state, { payload }) {
      sectionAdapter.upsertOne(state, payload);
      state.loading = false;
    },
    sectionPutError(state) {
      state.loading = false;
    },
    addToDelete(state, { payload }) {
      state.toDelete.push(payload);
    },
    deleted(state, { payload }) {
      state.toDelete = state.toDelete.filter((id) => id !== payload);
    },
  },
});

export default sectionSlice.reducer;

export const {
  fetchSections,
  sectionsFetched,
  sectionsFetchError,
  postSection,
  sectionPosted,
  sectionPostError,
  deleteSection,
  sectionDeleted,
  sectionDeleteError,
  putSection,
  sectionPut,
  sectionPutError,
  addToDelete,
  deleted,
} = sectionSlice.actions;

export const {
  selectAll: selectAllSections,
  selectById: selectSectionById,
  selectIds: selectSectionIds,
} = sectionAdapter.getSelectors((state: RootState) => state.section);

const selectSection = (state: RootState) => state.section;

export const selectSectionLoading = createSelector(
  [selectSection],
  (section) => section.loading
);

export const selectSectionsToDelete = createSelector(
  [selectSection],
  (section) => section.toDelete
);
