import { useCallback, useEffect } from "react";
import { useAppDispatch } from "../store/hooks.ts";
import {
  addFrame,
  loadProject,
  selectFrames,
  selectOnionSkinImages,
  selectProject,
  selectScene,
  selectScenes,
  toggleFrameRate,
  toggleOnionSkin,
} from "./projectSlice.ts";
import { useSelector } from "react-redux";
import {
  Badge,
  Box,
  Button,
  Container,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  CameraAlt,
  GridView,
  Layers,
  LayersClear,
  Speed,
} from "@mui/icons-material";
import { Link, useNavigate, useParams } from "react-router";
import VideoPreviewLink from "./VideoPreviewLink.tsx";
import FrameList from "./FrameList.tsx";
import Camera from "../components/Camera.tsx";

const ProjectEditor = () => {
  const { projectId, sceneId } = useParams<{
    projectId: string;
    sceneId: string;
  }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const onionSkinImages = useSelector(selectOnionSkinImages);
  const frames = useSelector(selectFrames);
  const scene = useSelector(selectScene);
  const scenes = useSelector(selectScenes);
  const project = useSelector(selectProject);

  useEffect(() => {
    if (projectId) {
      dispatch(loadProject({ projectId, sceneId }));
    }
  }, [dispatch, projectId, sceneId]);

  const capture = useCallback(
    async (image: string | null) => {
      if (image) {
        dispatch(addFrame(image));
      }
    },
    [dispatch],
  );

  if (project == null || (sceneId !== undefined && scene === undefined)) {
    return null;
  }

  if (scene && scene.image === undefined) {
    navigate(`/project/${projectId}/scene/${sceneId}/photo`, {
      replace: true,
    });
    return null;
  }

  if (scenes.length > 0 && sceneId === undefined) {
    navigate(`/project/${projectId}/storyboard`, {
      replace: true,
    });
    return null;
  }

  return (
    <Container maxWidth="sm">
      {scene && (
        <Box className="flex gap-4 mb-4">
          <img alt="scene image" src={scene.image} className="h-24" />
          <Box className="flex flex-col gap-4">
            <Typography variant="h3">Scene</Typography>
            <Box className="flex gap-4">
              <Button
                startIcon={<GridView />}
                variant="outlined"
                component={Link}
                to={`/project/${projectId}/storyboard`}
              >
                Back to Storyboard
              </Button>
              <Button
                startIcon={<CameraAlt />}
                variant="outlined"
                component={Link}
                to={`/project/${projectId}/scene/${sceneId}/photo`}
              >
                Edit
              </Button>
            </Box>
          </Box>
        </Box>
      )}

      <Camera
        onCapture={capture}
        overlay={onionSkinImages.map((image) => (
          <img
            alt="overlay of previous frame"
            className="onion-skin"
            src={image.image}
            key={image.id}
          />
        ))}
        actions={
          <>
            <Tooltip title="Frame rate (fps)">
              <IconButton onClick={() => dispatch(toggleFrameRate())}>
                <Badge badgeContent={project.frameRate}>
                  <Speed />
                </Badge>
              </IconButton>
            </Tooltip>
            <Tooltip title="Onion skin">
              <IconButton onClick={() => dispatch(toggleOnionSkin())}>
                <OnionSkinIcon numOnionSkins={project.numOnionSkins} />
              </IconButton>
            </Tooltip>
          </>
        }
      />

      {frames.length > 0 && (
        <>
          <FrameList project={project} className="w-full mb-2" />
          <VideoPreviewLink
            projectId={project.id}
            imageData={frames[0].image}
          />
        </>
      )}
    </Container>
  );
};

type IOnionSkinButtons = {
  numOnionSkins: number;
};

const OnionSkinIcon = ({ numOnionSkins }: IOnionSkinButtons) => {
  if (numOnionSkins === 0) {
    return <LayersClear />;
  }

  if (numOnionSkins === 1) {
    return <Layers />;
  }

  return (
    <Badge badgeContent={numOnionSkins}>
      <Layers />
    </Badge>
  );
};

export default ProjectEditor;
