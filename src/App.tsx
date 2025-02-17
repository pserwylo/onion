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
import theme from "./theme.tsx";
import VideoPreview from "./project/VideoPreview.tsx";

function App() {
  return (
    <>
      <React.StrictMode>
        <Provider store={store}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <HashRouter>
              <Routes>
                <Route index element={<ProjectEditor />} />
                <Route path="/preview" element={<VideoPreview />} />
              </Routes>
            </HashRouter>
          </ThemeProvider>
        </Provider>
      </React.StrictMode>
    </>
  );
}

export default App;
