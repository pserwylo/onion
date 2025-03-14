import { Link, useNavigate, useParams } from "react-router";
import { addSceneImage, loadProject, selectScene } from "./projectSlice.ts";
import { useAppDispatch } from "../store/hooks.ts";
import { Container, IconButton, Typography } from "@mui/material";
import { useCallback, useEffect } from "react";
import Camera from "../components/Camera.tsx";
import { Close } from "@mui/icons-material";
import { useSelector } from "react-redux";

const ScenePhotoEditor = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const scene = useSelector(selectScene);
  const { projectId, sceneIndex } = useParams<{
    projectId: string;
    sceneIndex: string;
  }>();

  useEffect(() => {
    if (projectId) {
      dispatch(loadProject({ projectId, sceneIndex }));
    }
  }, [dispatch, projectId, sceneIndex]);

  const capture = useCallback(
    async (image: string | null) => {
      if (sceneIndex == null || image == null) {
        return;
      }

      await dispatch(addSceneImage(image));
      navigate(`/project/${projectId}/storyboard`);
    },
    [navigate, dispatch, sceneIndex, projectId],
  );

  if (scene == null) {
    return null;
  }

  const backLink = scene.image
    ? `/project/${projectId}/scene/${sceneIndex}`
    : `/project/${projectId}/storyboard`;

  // TODO: Taking photo of scene not working...
  return (
    <Container maxWidth="sm" className="flex flex-col gap-y-2 mt-4">
      <div className="flex">
        <Typography variant="h2" className="flex-grow">
          Scene {sceneIndex}
        </Typography>
        <IconButton component={Link} to={backLink}>
          <Close />
        </IconButton>
      </div>
      <Camera onCapture={capture} />
    </Container>
  );
};

export default ScenePhotoEditor;
