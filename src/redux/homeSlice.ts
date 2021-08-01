import { createSlice, createSelector } from "@reduxjs/toolkit";
import { all, call, put, takeLatest, select } from "redux-saga/effects";

import { RootState } from "./store";
import Api, { http } from "./api";
import { sectionSliceReset } from "./sectionSlice";
import { tagSliceReset } from "./tagSlice";
import { noteSliceReset } from "./noteSlice";

const ACCESS_LIFE: number = 50; // ~1 hour
const REFRESH_LIFE: number = 40000; // ~4 weeks

function* fetchHealthSaga(): any {
  try {
    yield call(Api.fetchHealth);
    yield put(healthFetched());
  } catch (err) {
    yield put(healthFetchError());
  }
}

function* watchFetchHealth() {
  yield takeLatest(fetchHealth.type, fetchHealthSaga);
}

function* signUpSaga({ payload }: ReturnType<typeof signUp>): any {
  try {
    let res = yield call(Api.register, payload);
    yield call(slicesReset);
    yield put(signedIn(res.data));
  } catch (err) {
    yield put(signUpError());
  }
}

function* watchSignUp() {
  yield takeLatest(signUp.type, signUpSaga);
}

function* signInSaga({ payload }: ReturnType<typeof signIn>): any {
  try {
    let res = yield call(Api.login, payload);
    yield call(slicesReset);
    yield put(signedIn(res.data));
  } catch (err) {
    yield put(signInError());
  }
}

function* watchSignIn() {
  yield takeLatest(signIn.type, signInSaga);
}

function* signOutSaga(): any {
  try {
    yield call(authCheck);
    yield call(Api.logout);
    yield put(statusSet("synced"));
  } catch (err) {
    yield put(statusSet("offline"));
  }
  yield put(signedOut());
}

function* watchSignOut() {
  yield takeLatest(signOut.type, signOutSaga);
}

function* authSetupSaga(): any {
  let refreshExpire: number = yield select(selectRefreshExpire);
  let now = Date.now() / 60000;

  if (now > refreshExpire) {
    yield put(signOut());
  } else {
    let accessToken: string = yield select(selectAccessToken);
    http.defaults.headers["Authorization"] = `Token ${accessToken}`;
  }
}

function* watchAuthSetup() {
  yield takeLatest(authSetup.type, authSetupSaga);
}

export function* authCheck(): any {
  let accessExpire: number = yield select(selectAccessExpire);
  let now = Date.now() / 60000;

  if (now > accessExpire) {
    try {
      let refreshToken: string = yield select(selectRefreshToken);
      let res = yield call(Api.refresh, refreshToken);
      let access = res.data.access;
      http.defaults.headers["Authorization"] = `Token ${access}`;
      yield put(accessTokenSet({ access, expire: now + ACCESS_LIFE }));
      yield put(statusSet("synced"));
    } catch (err) {
      yield put(statusSet("offline"));
    }
  }
}

export function* slicesReset(): any {
  yield put(sectionSliceReset());
  yield put(tagSliceReset());
  yield put(noteSliceReset());
}

export function* homeRootSaga() {
  yield all([
    watchFetchHealth(),
    watchSignUp(),
    watchSignIn(),
    watchSignOut(),
    watchAuthSetup(),
  ]);
}

const homeSlice = createSlice({
  name: "home",
  initialState: {
    username: "",
    email: "",
    accessToken: "",
    accessExpire: 0,
    refreshToken: "",
    refreshExpire: 0,
    isAuthenticated: false,
    status: "synced",
  } as {
    username: string;
    email: string;
    accessToken: string;
    accessExpire: number;
    refreshToken: string;
    refreshExpire: number;
    isAuthenticated: boolean;
    status: string;
  },
  reducers: {
    fetchHealth(state) {
      state.status = "syncing";
    },
    healthFetched(state) {
      state.status = "synced";
    },
    healthFetchError(state) {
      state.status = "offline";
    },
    signUp(state, _) {
      state.status = "syncing";
    },
    signUpError(state) {
      state.status = "offline";
    },
    signIn(state, _) {
      state.status = "syncing";
    },
    signedIn(state, { payload }) {
      const now = Date.now() / 60000;
      state.status = "synced";
      state.username = payload.user.username;
      state.email = payload.user.email;
      state.accessToken = payload.access_token;
      state.accessExpire = now + ACCESS_LIFE;
      state.refreshToken = payload.refresh_token;
      state.refreshExpire = now + REFRESH_LIFE;
      http.defaults.headers["Authorization"] = `Token ${payload.access_token}`;
      state.isAuthenticated = true;
    },
    signInError(state) {
      state.status = "offline";
    },
    signOut(state) {
      state.status = "syncing";
    },
    signedOut() {
      delete http.defaults.headers["Authorization"];
    },
    isAuthenticatedSet(state, { payload }) {
      state.isAuthenticated = payload;
    },
    accessTokenSet(state, { payload }) {
      state.accessToken = payload.access;
      state.accessExpire = payload.expire;
    },
    statusSet(state, { payload }) {
      state.status = payload;
    },
    authSetup(state) {
      state.status = "syncing";
    },
  },
});

export default homeSlice.reducer;

export const {
  fetchHealth,
  healthFetched,
  healthFetchError,
  signUp,
  signUpError,
  signIn,
  signedIn,
  signInError,
  signOut,
  signedOut,
  isAuthenticatedSet,
  accessTokenSet,
  statusSet,
  authSetup,
} = homeSlice.actions;

const selectHome = (state: RootState) => state.home;

const baseSelector = (field: string) =>
  createSelector([selectHome], (home) => home[field]);

export const selectUsername = baseSelector("username");
export const selectEmail = baseSelector("email");
export const selectAccessToken = baseSelector("accessToken");
export const selectAccessExpire = baseSelector("accessExpire");
export const selectRefreshToken = baseSelector("refreshToken");
export const selectRefreshExpire = baseSelector("refreshExpire");
export const selectIsAuthenticated = baseSelector("isAuthenticated");
export const selectStatus = baseSelector("status");
