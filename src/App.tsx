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
import { db } from "./store/db.ts";
import FrameEditor from "./project/FrameEditor.tsx";

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
  useEffect(() => {
    const tx = db.transaction("projects");
    (async function () {
      for await (const cursor of tx.store) {
        navigate(`/project/${cursor.value.id}`);
        break;
      }
    })();
  }, [navigate]);

  return null;
};

export default App;
