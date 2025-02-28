import { configureStore } from "@reduxjs/toolkit";
import projects from "../project/projectSlice";
import home from "../home/homeSlice";

export const store = configureStore({
  reducer: {
    projects,
    home,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
