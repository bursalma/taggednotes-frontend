import { createSlice, createSelector } from "@reduxjs/toolkit";
import { all, call, put, takeLatest } from "redux-saga/effects";

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
    // delete payload["remember"];
    let res = yield call(Api.login, payload);

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
      yield put(signedOut());
    } else {
      throw new Error("status not 200");
    }
  } catch (err) {
    yield put(statusSet("offline"));
    yield put(signedOut());
  }
}

function* watchSignOut() {
  yield takeLatest(signOut.type, signOutSaga);
}

export function* homeRootSaga() {
  yield all([watchFetchHealth(), watchSignUp(), watchSignIn(), watchSignOut()]);
}

const homeSlice = createSlice({
  name: "home",
  initialState: {
    username: "",
    email: "",
    accessToken: "",
    refreshToken: "",
    isAuthenticated: false,
    status: "synced",
  } as {
    username: string;
    email: string;
    accessToken: string;
    refreshToken: string;
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
    // signedUp(state, { payload }) {
    //   state.status = "synced";
    //   state.username = payload.user.username;
    //   state.email = payload.user.email;
    //   state.accessToken = payload.access_token;
    //   state.refreshToken = payload.refresh_token;
    //   state.isAuthenticated = true;
    // },
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
      state.refreshToken = payload.refresh_token;
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
    // signOutError() {},
    isAuthenticatedSet(state, { payload }) {
      state.isAuthenticated = payload;
    },
    statusSet(state, { payload }) {
      state.status = payload;
    },
  },
});

export default homeSlice.reducer;

export const {
  fetchHealth,
  healthFetched,
  healthFetchError,
  signUp,
  // signedUp,
  signUpError,
  signIn,
  signedIn,
  signInError,
  signOut,
  signedOut,
  // signOutError,
  isAuthenticatedSet,
  statusSet,
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

// function* coordinatorSaga() {
//   let health: boolean = yield select(selectHealth);

//   if (!health) {
//     yield call(fetchHealth);
//     health = yield select(selectHealth);
//   }

//   if (health) {
//     yield put(healthCountReset());
//     yield put(fetchSections());

//     while (true) {
//       health = yield select(selectHealth);
//       if (!health) break;

//       console.log("coordinator in control");
//       yield delay(5000);
//     }
//   }

//   let healthCount: number = yield select(selectHealthCount);

//   if (healthCount < 5) {
//     yield put(healthCountIncrement());
//     yield delay(10000);
//     yield put(coordinator());
//   }
// }

// export function* watchCoordinator() {
//   yield takeLatest(coordinator.type, coordinatorSaga);
// }

// const [token, setToken] = useState('')

// useEffect(() => {
//   console.log(health);

//   const http = axios.create({
//     baseURL: process.env.REACT_APP_SERVER_URL,
//     timeout: 10000,
//     headers: {
//       "content-type": "application/json",
//       // "WWW-Authenticate": token
//       //   'app-id': 'GET-THE-SECRET-KEY'
//     },
//   });

//   let data = {
//     username: 'user1',
//     password: 'test.123'
//   }

//   http.post('auth/login/', data).then(res => setToken(res.data.key))

//   console.log(token)

//   const http2 = axios.create({
//     baseURL: process.env.REACT_APP_SERVER_URL,
//     timeout: 10000,
//     headers: {
//       "content-type": "application/json",
//       "Authorization" : `Token ${token}`,
//       // "WWW-Authenticate": token
//     },
//   });

//   http2.get('auth/user/').then(res => console.log(res))
// }, []);
