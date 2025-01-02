import { configureStore } from "@reduxjs/toolkit";
import { combineReducers } from "redux";
import activeReducers from "./slices/modalSlice";
import themeReducers from "./slices/themeSlice";
import songReducer from "./slices/songSlice";

const rootReducer = combineReducers({
  active: activeReducers,
  theme: themeReducers,
  song: songReducer,
  // any other reducers here
});

const store = configureStore({
  reducer: rootReducer,
});

export default store;

// store.subscribe(() => console.log("Store updated:", store.getState()));
