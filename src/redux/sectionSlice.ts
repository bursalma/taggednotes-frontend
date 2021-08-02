import { createSlice, createEntityAdapter } from "@reduxjs/toolkit";
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

const initialState = sectionAdapter.getInitialState({} as {});

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
    const allSections = yield select(selectAllSections);
    const rank =
      allSections.reduce(
        (max: number, curr: SectionObj) => (max = Math.max(max, curr.rank)),
        0
      ) + 1;
    let data: any = { name: payload, rank };
    if (yield select(selectIsAuthenticated)) {
      yield call(authCheck);
      let res = yield call(Api.postSection, data);
      data = res.data;
      yield put(statusSet("synced"));
    } else {
      data = { id: rank, ...data, tag_rank: 1, note_rank: 1 };
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
    let data = payload;
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
    fetchSections(state) {},
    sectionsFetched(state, { payload }) {
      sectionAdapter.setAll(state, payload);
    },
    sectionsFetchError(state) {},
    postSection(state, _) {},
    sectionPosted(state, { payload }) {
      sectionAdapter.addOne(state, payload);
    },
    sectionPostError(state) {},
    deleteSection(state, _) {},
    sectionDeleted(state, { payload }) {
      sectionAdapter.removeOne(state, payload);
    },
    sectionDeleteError(state) {},
    putSection(state, _) {},
    sectionPut(state, { payload }) {
      sectionAdapter.upsertOne(state, payload);
    },
    sectionPutError(state) {},
    sectionSliceReset(state) {
      state.ids = initialState.ids;
      state.entities = initialState.entities;
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
  sectionSliceReset,
} = sectionSlice.actions;

export const {
  selectAll: selectAllSections,
  selectById: selectSectionById,
  selectIds: selectSectionIds,
} = sectionAdapter.getSelectors((state: RootState) => state.section);

export const selectSection = (state: RootState) => state.section;
