import { createSlice } from "@reduxjs/toolkit";
import workout from "../components/settings/workout.json";
const initialState = {
  ...workout,
};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setSettings: (state, action) => {
      console.log(action);
      const workout = Object.keys(action.payload)[0];
      state[workout].userDefinedSettings = action.payload[workout];
      //   state = {
      //     ...state,
      //     [workout]: {
      //       ...[workout],
      //       userDefinedSettings: action.payload[workout],
      //     },
      //   };
      console.log(state);
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
