import { useCallback } from "react";
import { useAppDispatch } from "../store/hooks.ts";
import {
  addFrame,
  makeSelectSceneSummary,
  selectFrames,
  selectOnionSkinImages,
  selectProject,
  selectScene,
  selectScenes,
  toggleFrameRate,
  toggleOnionSkin,
  updateTitle,
} from "./projectSlice.ts";
import { useSelector } from "react-redux";
import {
  Badge,
  Box,
  Button,
  Container,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  CameraAlt,
  ChevronLeft,
  ChevronRight,
  Delete,
  Layers,
  LayersClear,
  PlayCircle,
  Speed,
} from "@mui/icons-material";
import { Link, useNavigate } from "react-router";
import FrameList from "./FrameList.tsx";
import Camera from "../components/Camera.tsx";
import { useProjectRoute } from "../hooks/useProjectRoute.ts";
import PageHeading from "../components/PageHeading.tsx";

const ProjectEditor = () => {
  const { projectId, sceneIndex } = useProjectRoute();

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const onionSkinImages = useSelector(selectOnionSkinImages);
  const allFrames = useSelector(selectFrames);
  const sceneDetails = useSelector(makeSelectSceneSummary(sceneIndex));
  const scene = useSelector(selectScene);
  const scenes = useSelector(selectScenes);
  const project = useSelector(selectProject);

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
          <PageHeading
            thumbnail={scene.image}
            title={project.title}
            subtitle={`Scene ${sceneIndexInt + 1}`}
            backLink={`/project/${projectId}/storyboard`}
            actions={
              <>
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
              </>
            }
          />
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
          <PageHeading
            title={project.title}
            backLink="/"
            onTitleChange={
              project.demo ? undefined : (title) => dispatch(updateTitle(title))
            }
            className="w-full"
          />
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
