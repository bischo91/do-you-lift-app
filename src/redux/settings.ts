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
      const workout = Object.keys(action.payload)[0];
      console.log(state);
      // if (state[workout]) {
      //   state[workout].userDefinedSettings =
      //     action.payload[workout].userDefinedSettings;
      // } else
      state[workout] = {
        label: workout,
        userDefinedSettings: action.payload[workout].userDefinedSettings,
        isTwoSide: action.payload[workout].isTwoSide,
        bodyPoints: action.payload[workout].bodyPoints.value,
      };
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
