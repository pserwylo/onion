import { useCallback, useEffect } from "react";
import { useAppDispatch } from "../store/hooks.ts";
import {
  addFrame,
  loadProject,
  makeSelectSceneSummary,
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
  ChevronLeft,
  ChevronRight,
  Close,
  Delete,
  Layers,
  LayersClear,
  PlayCircle,
  Speed,
} from "@mui/icons-material";
import { Link, useNavigate, useParams } from "react-router";
import FrameList from "./FrameList.tsx";
import Camera from "../components/Camera.tsx";

const ProjectEditor = () => {
  const { projectId, sceneIndex } = useParams<{
    projectId: string;
    sceneIndex: string;
  }>();

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const onionSkinImages = useSelector(selectOnionSkinImages);
  const allFrames = useSelector(selectFrames);
  const sceneDetails = useSelector(makeSelectSceneSummary(sceneIndex));
  const scene = useSelector(selectScene);
  const scenes = useSelector(selectScenes);
  const project = useSelector(selectProject);

  useEffect(() => {
    if (projectId) {
      dispatch(loadProject({ projectId, sceneIndex }));
    }
  }, [dispatch, projectId, sceneIndex]);

  const capture = useCallback(
    async (image: string | null) => {
      if (image) {
        dispatch(addFrame(image));
      }
    },
    [dispatch],
  );

  if (project == null || (sceneIndex !== undefined && scene === undefined)) {
    return null;
  }

  if (scene && scene.image === undefined) {
    navigate(`/project/${projectId}/scene/${sceneIndex}/photo`, {
      replace: true,
    });
    return null;
  }

  if (scenes.length > 0 && sceneIndex === undefined) {
    navigate(`/project/${projectId}/storyboard`, {
      replace: true,
    });
    return null;
  }

  const frames = sceneDetails ? sceneDetails.frames : allFrames;

  const sceneIndexInt =
    sceneIndex !== undefined ? parseInt(sceneIndex, 10) : undefined;

  return (
    <Container maxWidth="sm">
      {scene && sceneIndexInt !== undefined ? (
        <Box className="flex flex-col gap-4 my-4 w-full">
          <Box className="flex gap-4 w-full">
            <img alt="scene image" src={scene.image} className="h-24" />
            <Typography variant="h3" className="flex-grow">
              Scene {sceneIndexInt + 1}
            </Typography>
            <IconButton
              disabled={sceneIndex === "0"}
              component={Link}
              className="self-start"
              to={
                sceneIndexInt !== 0
                  ? `/project/${projectId}/scene/${sceneIndexInt - 1}`
                  : "/"
              }
            >
              <ChevronLeft />
            </IconButton>
            <IconButton
              component={Link}
              className="self-start"
              to={
                sceneIndexInt < scenes.length - 1
                  ? `/project/${projectId}/scene/${sceneIndexInt + 1}`
                  : "/"
              }
            >
              <ChevronRight />
            </IconButton>
            <IconButton
              component={Link}
              to={`/project/${projectId}/storyboard`}
              className="self-start"
            >
              <Close />
            </IconButton>
          </Box>
          <Box className="flex gap-4">
            <Button
              startIcon={<PlayCircle />}
              variant="contained"
              size="small"
              component={Link}
              to={`/project/${projectId}/scene/${sceneIndex}/preview`}
            >
              Watch
            </Button>
            <Button
              startIcon={<CameraAlt />}
              variant="contained"
              size="small"
              component={Link}
              to={`/project/${projectId}/scene/${sceneIndex}/photo`}
            >
              Edit
            </Button>
            {project.demo || (
              <Button
                startIcon={<Delete />}
                variant="outlined"
                color="error"
                size="small"
                component={Link}
                to={`/project/${projectId}/scene/${sceneIndex}/delete`}
              >
                Delete
              </Button>
            )}
          </Box>
        </Box>
      ) : (
        <Box className="flex flex-col gap-4 mb-4 mt-4 w-full items-start">
          <Box className="flex w-full">
            <Typography variant="h3" className="flex-grow">
              {project.title ?? "Movie"}
            </Typography>
            <IconButton component={Link} to="/">
              <Close />
            </IconButton>
          </Box>
          <Box className="flex gap-4">
            <Button
              startIcon={<PlayCircle />}
              variant="contained"
              size="small"
              component={Link}
              to={`/project/${projectId}/preview`}
            >
              Watch
            </Button>
            {project.demo || (
              <Button
                startIcon={<Delete />}
                variant="outlined"
                color="error"
                size="small"
                component={Link}
                to={`/project/${projectId}/delete`}
              >
                Delete
              </Button>
            )}
          </Box>
        </Box>
      )}

      {frames.length > 0 && (
        <>
          <FrameList
            project={project}
            frames={frames}
            sceneIndex={sceneIndex}
            className="w-full mb-2"
            readOnly={project.demo}
          />
        </>
      )}

      {project.demo || (
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
                <IconButton
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    dispatch(toggleFrameRate());
                  }}
                >
                  <Badge badgeContent={project.frameRate}>
                    <Speed />
                  </Badge>
                </IconButton>
              </Tooltip>
              <Tooltip title="Onion skin">
                <IconButton
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    dispatch(toggleOnionSkin());
                  }}
                >
                  <OnionSkinIcon numOnionSkins={project.numOnionSkins} />
                </IconButton>
              </Tooltip>
            </>
          }
        />
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
