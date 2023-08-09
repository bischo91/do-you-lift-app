import { configureStore, createSlice } from "@reduxjs/toolkit";

const initialState = {
  angleUp: null,
  angleDown: null,
  thresholdTime: null,
};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setSettings: () => {
      console.log("test");
    },
    getSettings: () => {
      console.log("getSettings");
    },
  },
});

export const { setSettings, getSettings } = settingsSlice.actions;

const store = configureStore({
  reducer: settingsSlice.reducer,
});

store.subscribe(() => console.log(store.getState()));

store.dispatch(setSettings());
store.dispatch(getSettings());
