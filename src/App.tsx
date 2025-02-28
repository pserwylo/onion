import "./App.css";
import ProjectEditor from "./project/ProjectEditor.tsx";
import { Provider } from "react-redux";
import { store } from "./store/store.ts";
import { HashRouter, Route, Routes } from "react-router";

import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

import { CssBaseline, ThemeProvider } from "@mui/material";
import React from "react";
import theme from "./theme.ts";
import VideoPreview from "./project/VideoPreview.tsx";
import FrameEditor from "./project/FrameEditor.tsx";
import { HomePage } from "./home/HomePage.tsx";

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

export default App;
