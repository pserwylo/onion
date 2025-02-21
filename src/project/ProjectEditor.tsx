import Webcam from "react-webcam";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAppDispatch } from "../store/hooks.ts";
import {
  addImage,
  loadProject,
  removeImage,
  selectImages,
  selectOnionSkinImages,
  selectProject,
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
} from "@mui/material";
import {
  CameraAlt,
  Cameraswitch,
  Layers,
  LayersClear,
  PlayCircle,
  Speed,
} from "@mui/icons-material";
import { Link, useParams } from "react-router";

const ProjectEditor = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const dispatch = useAppDispatch();
  const onionSkinImages = useSelector(selectOnionSkinImages);
  const images = useSelector(selectImages);
  const project = useSelector(selectProject);
  const [selfieCam, setSelfieCam] = useState(false);

  // https://github.com/mozmorris/react-webcam/issues/409#issuecomment-2404446979
  const webcamRef = useRef<Webcam>(null);

  useEffect(() => {
    if (projectId) {
      dispatch(loadProject(projectId));
    }
  }, [dispatch, projectId]);

  const capture = useCallback(async () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      dispatch(addImage(imageSrc));
    }
  }, [dispatch, webcamRef]);

  const reverse = () => {
    setSelfieCam(!selfieCam);
  };

  const videoConstraints = {
    width: 640,
    facingMode: selfieCam ? "user" : "environment",
  };

  if (project == null) {
    return null;
  }

  return (
    <Container maxWidth="sm">
      <div className="camera-wrapper">
        <Webcam
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/webp"
          width={640}
          disablePictureInPicture
          className="camera camera--feed"
          videoConstraints={videoConstraints}
        />

        {onionSkinImages.map((image) => (
          <img className="onion-skin" src={image.data} key={image.id} />
        ))}
        <Box
          sx={{
            padding: "0.1em 0.2em",
            fontSize: "1.5em",
            position: "absolute",
            display: "flex",
            top: "1em",
            right: "1em",
          }}
        >
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
          <Tooltip title="Switch camera">
            <IconButton onClick={reverse}>
              <Cameraswitch />
            </IconButton>
          </Tooltip>
        </Box>
      </div>
      <div className="main-actions">
        <Button
          onClick={capture}
          startIcon={<CameraAlt />}
          variant="contained"
          size="large"
          sx={{
            width: "100%",
          }}
        >
          Take Picture
        </Button>
      </div>
      <FrameList />
      {images.length > 0 && (
        <Link
          className="video-preview--wrapper"
          to={`/project/${project.id}/preview`}
        >
          <img className="video-preview--image" src={images[0].data} />
          <PlayCircle
            sx={{
              position: "absolute",
              top: "calc(50% - 0.5em)",
              left: "calc(50% - 0.5em)",
              fontSize: "8em",
              opacity: 0.8,
              color: "white",
            }}
          />
        </Link>
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

const FrameList = () => {
  const images = useSelector(selectImages);
  const dispatch = useAppDispatch();

  const handleDelete = (imageId: string) => {
    dispatch(removeImage(imageId));
  };

  return (
    <div className="frame-wrapper">
      <ul className="frames">
        {images.toReversed().map((image, i) => (
          <Frame
            image={image.data}
            key={i}
            index={images.length - i}
            onDelete={() => handleDelete(image.id)}
          />
        ))}
      </ul>
    </div>
  );
};

type IFrameProps = {
  image: string;
  index: number;
  onDelete: () => void;
};

const Frame = ({ image, index, onDelete }: IFrameProps) => {
  const { frameRate } = useSelector(selectProject);

  const calculateFrameTime = (index: number) => {
    return (index / frameRate).toFixed(1);
  };

  return (
    <li className="frame">
      <img src={image} className="thumbnail" />
      <div className="frame--index">{index}</div>
      <div className="frame--time">{calculateFrameTime(index)}s</div>
      <div className="frame--actions">
        <button
          className="frame-action frame-action--delete-frame"
          onClick={onDelete}
        >
          ❌
        </button>
      </div>
    </li>
  );
};

export default ProjectEditor;
