import { configureStore } from "@reduxjs/toolkit";
import projects from "../project/projectSlice";
import home from "../home/homeSlice";
import settings from "../settingsSlice";

export const store = configureStore({
  reducer: {
    projects,
    home,
    settings,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
