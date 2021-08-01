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
  localId: 0,
  activeKey: "default",
  loading: false,
  error: null,
  toDelete: [],
} as {
  localId: number;
  activeKey: string;
  loading: boolean;
  error: any;
  toDelete: number[];
});

function* fetchSectionsSaga(): any {
  try {
    yield call(authCheck);
    let res = yield call(Api.fetchSections);
    yield put(statusSet("synced"));
    yield put(sectionsFetched(res.data));
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
    let data: any = { name: payload, rank: 0 };

    if (yield select(selectIsAuthenticated)) {
      yield call(authCheck);
      let res = yield call(Api.postSection, data);
      data = res.data;
      yield put(statusSet("synced"));
    } else {
      const id = yield select(selectLocalId);
      data = { id, ...data, rank: id, tag_rank: 0, note_rank: 0 };
      yield put(localIdIncrement());
    }

    yield put(sectionPosted(data));
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
    if (yield select(selectIsAuthenticated)) {
      yield call(authCheck);
      yield call(Api.deleteSection, id);
      yield put(statusSet("synced"));
    }
    yield put(sectionDeleted(id));
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
    let data = { id: sectionId, name: putVal };
    if (yield select(selectIsAuthenticated)) {
      yield call(authCheck);
      let res = yield call(Api.putSection, data);
      data = res.data;
      yield put(statusSet("synced"));
    }
    yield put(sectionPut(data));
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
    postSection(state, _) {
      state.loading = true;
    },
    sectionPosted(state, { payload }) {
      sectionAdapter.addOne(state, payload);
      state.loading = false;
    },
    sectionPostError(state) {
      state.loading = false;
    },
    deleteSection(state, _) {
      state.loading = true;
    },
    sectionDeleted(state, { payload }) {
      sectionAdapter.removeOne(state, payload);
      state.loading = false;
    },
    sectionDeleteError(state) {
      state.loading = false;
    },
    putSection(state, _) {
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
    sectionSliceReset(state) {
      state = initialState;
    },
    localIdIncrement(state) {
      state.localId++;
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
  sectionSliceReset,
  localIdIncrement,
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

export const selectLocalId = createSelector(
  [selectSection],
  (section) => section.localId
);
