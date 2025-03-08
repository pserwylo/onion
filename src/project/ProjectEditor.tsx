import { useCallback, useEffect } from "react";
import { useAppDispatch } from "../store/hooks.ts";
import {
  addFrame,
  loadProject,
  selectFrames,
  selectOnionSkinImages,
  selectProject,
  toggleFrameRate,
  toggleOnionSkin,
} from "./projectSlice.ts";
import { useSelector } from "react-redux";
import { Badge, Container, IconButton, Tooltip } from "@mui/material";
import { Layers, LayersClear, Speed } from "@mui/icons-material";
import { useParams } from "react-router";
import VideoPreviewLink from "./VideoPreviewLink.tsx";
import FrameList from "./FrameList.tsx";
import Camera from "../components/Camera.tsx";

const ProjectEditor = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const dispatch = useAppDispatch();
  const onionSkinImages = useSelector(selectOnionSkinImages);
  const frames = useSelector(selectFrames);
  const project = useSelector(selectProject);

  useEffect(() => {
    if (projectId) {
      dispatch(loadProject(projectId));
    }
  }, [dispatch, projectId]);

  const capture = useCallback(
    async (image: string | null) => {
      if (image) {
        dispatch(addFrame(image));
      }
    },
    [dispatch],
  );

  if (project == null) {
    return null;
  }

  return (
    <Container maxWidth="sm">
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
