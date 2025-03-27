import { useNavigate, useParams } from "react-router";
import { addSceneImage, loadProject, selectScene } from "./projectSlice.ts";
import { useAppDispatch } from "../store/hooks.ts";
import { Container, Typography } from "@mui/material";
import { useCallback, useEffect } from "react";
import Camera from "../components/Camera.tsx";
import { useSelector } from "react-redux";
import PageHeading from "../components/PageHeading.tsx";

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

  if (scene == null || sceneIndex === undefined) {
    return null;
  }

  const sceneIndexInt = parseInt(sceneIndex, 10);

  const backLink = scene.image
    ? `/project/${projectId}/scene/${sceneIndex}`
    : `/project/${projectId}/storyboard`;

  return (
    <Container maxWidth="sm" className="flex flex-col gap-y-2 mt-4">
      <PageHeading title={`Scene ${sceneIndexInt + 1}`} backLink={backLink} />
      <Typography>
        Take a picture of the storyboard for Scene {sceneIndexInt + 1}. Once
        taken, you can then animate the scene.
      </Typography>
      <Camera onCapture={capture} />
    </Container>
  );
};

export default ScenePhotoEditor;
