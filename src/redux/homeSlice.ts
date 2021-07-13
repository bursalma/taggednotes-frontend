import { createSlice, createSelector } from "@reduxjs/toolkit";
import { call, delay, put, select, takeLatest } from "redux-saga/effects";

import { RootState } from "./store";
import Api from "./api";
import { fetchSections } from "./sectionSlice";

function* fetchHealth(): any {
  try {
    let res = yield call(Api.fetchHealth);

    if (res.status === 200) {
      yield put(healthSet(true));
    } else {
      throw new Error("status not 200");
    }
  } catch (err) {
    yield put(healthSet(false));
  }
}

function* coordinatorSaga() {
  let health: boolean = yield select(selectHealth);

  if (!health) {
    yield call(fetchHealth);
    health = yield select(selectHealth);
  }

  if (health) {
    yield put(healthCountReset());
    yield put(fetchSections());

    while (true) {
      health = yield select(selectHealth);
      if (!health) break;

      console.log("coordinator in control");
      yield delay(5000);
    }
  }

  let healthCount: number = yield select(selectHealthCount);

  if (healthCount < 5) {
    yield put(healthCountIncrement());
    yield delay(10000);
    yield put(coordinator());
  }
}

export function* watchCoordinator() {
  yield takeLatest(coordinator.type, coordinatorSaga);
}

const homeSlice = createSlice({
  name: "home",
  initialState: {
    status: "offline",
    health: false,
    healthCount: 0,
    error: null,
  } as {
    status: string;
    health: boolean;
    healthCount: number;
    error: any;
  },
  reducers: {
    coordinator() {},
    healthSet(state, { payload }) {
      state.health = payload;
    },
    healthCountIncrement(state) {
      state.healthCount++;
    },
    healthCountReset(state) {
      state.healthCount = 0;
    },
  },
});

export default homeSlice.reducer;

export const {
  coordinator,
  healthSet,
  healthCountIncrement,
  healthCountReset,
} = homeSlice.actions;

const selectHome = (state: RootState) => state.home;

const baseSelector = (field: string) =>
  createSelector([selectHome], (home) => home[field]);

export const selectStatus = baseSelector("status");
export const selectHealth = baseSelector("health");
export const selectHealthCount = baseSelector("healthCount");
