import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import logger from "redux-logger";
import createSagaMiddleware from "redux-saga";
import { all } from "redux-saga/effects";

import homeReducer, { homeRootSaga, signedOut } from "./homeSlice";
import sectionReducer, { sectionRootSaga } from "./sectionSlice";
import tagReducer, { tagRootSaga } from "./tagSlice";
import noteReducer, { noteRootSaga } from "./noteSlice";

const persistConfig = {
  key: "root",
  storage,
  // whitelist: [],
};

const appReducer = combineReducers({
  home: homeReducer,
  section: sectionReducer,
  tag: tagReducer,
  note: noteReducer,
});

const rootReducer = (state: RootState, action: any) => {
  if (action.type === signedOut.type) {
    return appReducer(undefined, action);
  }
  return appReducer(state, action);
};

let midConfig = {
  serializableCheck: {
    ignoredActions: ["persist/PERSIST"],
  },
};

const saga = createSagaMiddleware();

export const store: any = configureStore({
  reducer: persistReducer<RootState>(persistConfig, rootReducer),
  middleware: (getDefaultMiddleware) =>
    process.env.NODE_ENV === "development"
      ? getDefaultMiddleware(midConfig).concat(saga).concat(logger)
      : getDefaultMiddleware(midConfig).concat(saga),
  devTools: process.env.NODE_ENV === "development",
});

function* rootSaga() {
  yield all([
    homeRootSaga(),
    sectionRootSaga(),
    tagRootSaga(),
    noteRootSaga(),
  ]);
}

saga.run(rootSaga);

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
