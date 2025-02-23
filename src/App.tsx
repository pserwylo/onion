import "./App.css";
import ProjectEditor from "./project/ProjectEditor.tsx";
import { Provider } from "react-redux";
import { store } from "./store/store.ts";
import { HashRouter, Route, Routes, useNavigate } from "react-router";

import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

import { CssBaseline, ThemeProvider } from "@mui/material";
import React, { useEffect } from "react";
import theme from "./theme.tsx";
import VideoPreview from "./project/VideoPreview.tsx";
import FrameEditor from "./project/FrameEditor.tsx";
import { useAppDispatch } from "./store/hooks.ts";
import { initialiseNewProject } from "./project/projectSlice.ts";
import { getDB } from "./store/db.ts";

function App() {
  return (
    <>
      <React.StrictMode>
        <Provider store={store}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <HashRouter>
              <Routes>
                <Route index element={<HomePage />} />
                <Route path="/project/:projectId" element={<ProjectEditor />} />
                <Route
                  path="/project/:projectId/frame/:frameId"
                  element={<FrameEditor />}
                />
                <Route
                  path="/project/:projectId/preview"
                  element={<VideoPreview />}
                />
              </Routes>
            </HashRouter>
          </ThemeProvider>
        </Provider>
      </React.StrictMode>
    </>
  );
}

/**
 * For now, pick the first project in the store and redirect to it.
 */
const HomePage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useEffect(() => {
    (async function () {
      const db = await getDB();
      const tx = db.transaction("projects");
      for await (const cursor of tx.store) {
        console.info(`Navigating to first project: ${cursor.value.id}`);
        navigate(`/project/${cursor.value.id}`);
        return;
      }

      // If none were found, create one, then navigate there.
      console.info("No projects found yet. Creating new project.");
      const { payload: id } = await dispatch(initialiseNewProject());
      navigate(`/project/${id}`);
    })();
  }, [navigate, dispatch]);

  return null;
};

export default App;
