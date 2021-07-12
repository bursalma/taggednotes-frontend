import { 
  createSlice, 
  createEntityAdapter, 
  createSelector } from '@reduxjs/toolkit';
import { put, takeLatest } from 'redux-saga/effects';

import { GenRes, RootState } from './store';
import Api from './api';

export interface SectionObj {
  id: number,
  rank: number,
  name: string,
  // user: number,
  tag_rank: number,
  note_rank: number
}

const sectionAdapter = createEntityAdapter<SectionObj>({
  selectId: (section) => section.id,
  sortComparer: (a, b) => a.rank - b.rank
});

const initialState = sectionAdapter.getInitialState({
  activeKey: 'default',
  loading: 'idle',
  error: null,
  toDelete: []
} as {
  activeKey: String,
  loading: String,
  error: any,
  toDelete: number[]
});

function* fetchSectionsSaga() {
  const res: GenRes = yield Api.fetchSections();
  yield put(sectionsFetched(res.data));
}

export function* watchFetchSections() {
  yield takeLatest(fetchSections.type, fetchSectionsSaga);
}

const sectionSlice = createSlice({
  name: 'section',
  initialState,
  reducers: {
    fetchSections(state) {
      state.loading = 'loading'
    },
    sectionsFetched(state, { payload }) {
      sectionAdapter.setAll(state, payload);
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

export default sectionSlice.reducer;

export const {
  fetchSections, 
  sectionsFetched,
  addToDelete,
  deleted } = sectionSlice.actions;

export const {
  selectAll: selectAllSections,  
  selectById: selectSectionById,
  selectIds: selectSectionIds
} = sectionAdapter.getSelectors((state: RootState) => state.section);

const selectSection = (state: RootState) => state.section;

export const selectSectionLoading = createSelector(
  [selectSection],
  section => section.loading
);

export const selectSectionsToDelete = createSelector(
  [selectSection],
  section => section.toDelete
);