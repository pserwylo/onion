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
import theme from "./theme.ts";
import VideoPreview from "./project/VideoPreview.tsx";
import FrameEditor from "./project/FrameEditor.tsx";
import { HomePage } from "./home/HomePage.tsx";
import { NewProjectPage } from "./new-project/NewProjectPage.tsx";
import { StoryboardEditorPage } from "./storyboard-editor/StoryboardEditorPage.tsx";
import ScenePhotoEditor from "./project/ScenePhotoEditor.tsx";
import DebugPage from "./components/DebugPage.tsx";
import ConfirmDeleteScene from "./delete/ConfirmDeleteScene.tsx";
import ConfirmDeleteProject from "./delete/ConfirmDeleteProject.tsx";

function App() {
  return (
    <>
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <HashRouter>
            <Routes>
              <Route index element={<HomePage />} />
              <Route path="/project/:projectId" element={<ProjectEditor />} />
              <Route
                path="/project/:projectId/storyboard"
                element={<StoryboardEditorPage />}
              />
              <Route path="/new" element={<NewProjectPage />} />
              <Route
                path="/project/:projectId/scene/:sceneIndex"
                element={<ProjectEditor />}
              />
              <Route
                path="/project/:projectId/scene/:sceneIndex/photo"
                element={<ScenePhotoEditor />}
              />
              <Route
                path="/project/:projectId/frame/:frameId"
                element={<FrameEditor />}
              />
              <Route
                path="/project/:projectId/scene/:sceneIndex/frame/:frameId"
                element={<FrameEditor />}
              />
              <Route
                path="/project/:projectId/preview"
                element={<VideoPreview />}
              />
              <Route
                path="/project/:projectId/scene/:sceneIndex/preview"
                element={<VideoPreview />}
              />
              <Route
                path="/project/:projectId/scene/:sceneIndex/delete"
                element={<ConfirmDeleteScene />}
              />
              <Route
                path="/project/:projectId/delete"
                element={<ConfirmDeleteProject />}
              />
              <Route path="/debug" element={<DebugPage />} />
            </Routes>
          </HashRouter>
        </ThemeProvider>
      </Provider>
    </>
  );
}

export default App;
