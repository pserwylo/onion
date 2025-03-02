import { Link, useNavigate, useParams } from "react-router";
import { loadProject, selectScenes } from "./projectSlice.ts";
import { useAppDispatch } from "../store/hooks.ts";
import { useSelector } from "react-redux";
import { Box, Button, Container, Typography } from "@mui/material";
import { CameraAlt, ChevronLeft } from "@mui/icons-material";
import { useEffect } from "react";

const SceneEditor = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { projectId, sceneId } = useParams<{
    projectId: string;
    sceneId: string;
  }>();
  const allScenes = useSelector(selectScenes);

  useEffect(() => {
    if (projectId) {
      dispatch(loadProject(projectId));
    }
  }, [dispatch, projectId]);

  if (sceneId == null) {
    console.warn("No scene ID provided to SceneEditor URL.");
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

  if (!scene.image) {
    navigate(`/project/${projectId}/scene/${scene.id}/photo`);
    return null;
  }

  return (
    <Container maxWidth="sm" className="flex flex-col gap-y-2">
      <Typography variant="h1">Animation Time</Typography>
      <Typography variant="h2">Scene {sceneIndex + 1}</Typography>
      <img src={scene.image} alt="image of a scene" />
      <Box className="flex gap-4">
        <Button
          component={Link}
          to={`/project/${projectId}/storyboard`}
          className="w-full"
          startIcon={<ChevronLeft />}
          variant="contained"
        >
          Back
        </Button>
        <Button
          component={Link}
          to={`/project/${projectId}/scene/${sceneId}/photo`}
          className="w-full"
          startIcon={<CameraAlt />}
          variant="contained"
        >
          {scene.image ? "Update Image" : "Take picture of scene"}
        </Button>
      </Box>
    </Container>
  );
};

export default SceneEditor;
