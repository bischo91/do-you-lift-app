import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  angleUp: null,
  angleDown: null,
  thresholdTime: null,
};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setSettings: (state, action) => {
      console.log(action);

      state.angleUp = action.payload.angleUp;
      state.angleDown = action.payload.angleDown;
      state.thresholdTime = action.payload.thresholdTime;
    },
  },
});
// const { reducer, actions } = settingsSlice;
const { reducer } = settingsSlice;

export const { setSettings } = settingsSlice.actions;

export default reducer;
// const store = configureStore({
//   reducer: settingsSlice.reducer,
// });

// store.subscribe(() => console.log(store.getState()));

// store.dispatch(setSettings());
// store.dispatch(getSettings());

// https://redux.js.org/introduction/getting-started
