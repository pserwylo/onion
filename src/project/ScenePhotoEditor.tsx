import { Link, useNavigate, useParams } from "react-router";
import { addSceneImage, loadProject, selectScenes } from "./projectSlice.ts";
import { useAppDispatch } from "../store/hooks.ts";
import { useSelector } from "react-redux";
import { Button, Container, Typography } from "@mui/material";
import { useCallback, useEffect } from "react";
import Camera from "../components/Camera.tsx";
import { ChevronLeft } from "@mui/icons-material";

const ScenePhotoEditor = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { projectId, sceneId } = useParams<{
    projectId: string;
    sceneId: string;
  }>();
  const allScenes = useSelector(selectScenes);

  useEffect(() => {
    if (projectId) {
      dispatch(loadProject({ projectId, sceneId }));
    }
  }, [dispatch, projectId, sceneId]);

  const capture = useCallback(
    async (image: string | null) => {
      if (sceneId == null || image == null) {
        return;
      }

      await dispatch(addSceneImage({ sceneId, image }));
      navigate(`/project/${projectId}/storyboard`);
    },
    [navigate, dispatch, sceneId, projectId],
  );

  if (sceneId == null) {
    console.warn("No scene ID provided to FrameEditor URL.");
    return null;
  }

  let sceneIndex = 0;
  const scene = allScenes.find((f, i) => {
    if (f.id === sceneId) {
      sceneIndex = i;
      return true;
    }

    return false;
  });

  if (scene === undefined) {
    console.warn(`Couldn't find sceneId ${sceneId} in scenes: `, {
      scenes: allScenes,
    });
    return null;
  }

  return (
    <Container maxWidth="sm" className="flex flex-col gap-y-2">
      <Typography variant="h1">Animation Time</Typography>
      <Typography variant="h2">Scene {sceneIndex + 1}</Typography>
      <Camera onCapture={capture} />
      <Button
        startIcon={<ChevronLeft />}
        component={Link}
        variant="outlined"
        size="large"
        to={`/project/${projectId}/storyboard`}
      >
        Back
      </Button>
    </Container>
  );
};

export default ScenePhotoEditor;
