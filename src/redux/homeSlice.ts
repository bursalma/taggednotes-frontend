import { createSlice, createSelector } from "@reduxjs/toolkit";
import { all, call, put, takeLatest, select } from "redux-saga/effects";

import { RootState } from "./store";
import Api, { http } from "./api";

function* fetchHealthSaga(): any {
  try {
    let res = yield call(Api.fetchHealth);

    if (res.status === 200) {
      yield put(healthFetched());
    } else {
      throw new Error("status not 200");
    }
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

    if (res.status === 201) {
      yield put(signedIn(res.data));
    } else {
      throw new Error("status not 201");
    }
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
    console.log(res);

    if (res.status === 200) {
      yield put(signedIn(res.data));
    } else {
      throw new Error("status not 200");
    }
  } catch (err) {
    yield put(signInError());
  }
}

function* watchSignIn() {
  yield takeLatest(signIn.type, signInSaga);
}

function* signOutSaga(): any {
  try {
    let res = yield call(Api.logout);
    console.log(res);

    if (res.status === 200) {
      yield put(statusSet("synced"));
    } else {
      throw new Error("status not 200");
    }
  } catch (err) {
    yield put(statusSet("offline"));
  }
  yield put(signedOut());
}

function* watchSignOut() {
  yield takeLatest(signOut.type, signOutSaga);
}

function* authSetupSaga(): any {
  try {
    let accessToken: string = yield select(selectAccessToken);
    http.defaults.headers["Authorization"] = `Token ${accessToken}`;
    let res = yield call(Api.verify, accessToken);
    console.log(res);

    if (res.status === 200) {
      yield put(statusSet("synced"));
    } else {
      throw new Error("status not 200");
    }
  } catch (err) {
    if (err.response && err.response.status === 401) {
      let refreshToken: string = yield select(selectRefreshToken);
      let res = yield call(Api.refresh, refreshToken);
      console.log(res);
      let access = res.data.access;
      http.defaults.headers["Authorization"] = `Token ${access}`;
      yield put(accessTokenSet(access));
    }
    yield put(statusSet("offline"));
  }
}

function* watchAuthSetup() {
  yield takeLatest(authSetup.type, authSetupSaga);
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
    accessExpiration: 0,
    refreshToken: "",
    refreshExpiration: 0,
    isAuthenticated: false,
    status: "synced",
  } as {
    username: string;
    email: string;
    accessToken: string;
    accessExpiration: number,
    refreshToken: string;
    refreshExpiration: number,
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
      state.status = "synced";
      state.username = payload.user.username;
      state.email = payload.user.email;
      state.accessToken = payload.access_token;
      state.accessExpiration = 0
      state.refreshToken = payload.refresh_token;
      state.refreshExpiration = 0
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
    statusSet(state, { payload }) {
      state.status = payload;
    },
    authSetup(state) {
      state.status = 'syncing'
    },
    accessTokenSet(state, { payload }) {
      state.accessToken = payload;
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
  statusSet,
  authSetup,
  accessTokenSet,
} = homeSlice.actions;

const selectHome = (state: RootState) => state.home;

const baseSelector = (field: string) =>
  createSelector([selectHome], (home) => home[field]);

export const selectUsername = baseSelector("username");
export const selectEmail = baseSelector("email");
export const selectAccessToken = baseSelector("accessToken");
export const selectRefreshToken = baseSelector("refreshToken");
export const selectIsAuthenticated = baseSelector("isAuthenticated");
export const selectStatus = baseSelector("status");
