import Webcam from "react-webcam";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAppDispatch } from "../store/hooks.ts";
import {
  addImage,
  loadProject,
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
  CircularProgress,
  Container,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  CameraAlt,
  Cameraswitch,
  Layers,
  LayersClear,
  Speed,
} from "@mui/icons-material";
import { useParams } from "react-router";
import clsx from "clsx";
import VideoPreviewLink from "./VideoPreviewLink.tsx";
import FrameList from "./FrameList.tsx";

const ProjectEditor = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const dispatch = useAppDispatch();
  const onionSkinImages = useSelector(selectOnionSkinImages);
  const images = useSelector(selectImages);
  const project = useSelector(selectProject);
  const [selfieCam, setSelfieCam] = useState(false);
  const [webcamStatus, setWebcamStatus] = useState<
    "initialising" | "connected" | "error"
  >("initialising");

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
      {webcamStatus === "error" && (
        <Box className="flex flex-col py-24 px-12 text-center">
          <Typography className="!mt-8 block">Unable to use webcam</Typography>
          <Button
            variant="text"
            size="small"
            onClick={() => setSelfieCam(!selfieCam)}
            startIcon={<Cameraswitch />}
          >
            Try different webcam
          </Button>
        </Box>
      )}

      {webcamStatus === "initialising" && (
        <Box className="flex flex-col py-24 px-12 text-center">
          <Box className="flex gap-4 justify-center items-center">
            <CircularProgress />
            <Typography>Initialising webcam</Typography>
          </Box>
          <Typography className="!mt-8 block">Taking too long?</Typography>
          <Button
            variant="text"
            size="small"
            onClick={() => setSelfieCam(!selfieCam)}
            startIcon={<Cameraswitch />}
          >
            Try different webcam
          </Button>
        </Box>
      )}

      <div className="camera-wrapper">
        <Webcam
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/webp"
          onUserMediaError={() => setWebcamStatus("error")}
          onUserMedia={() => setWebcamStatus("connected")}
          width={640}
          disablePictureInPicture
          className={clsx("camera camera--feed", {
            hidden: webcamStatus !== "connected",
          })}
          videoConstraints={videoConstraints}
        />

        {webcamStatus === "connected" && (
          <>
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
          </>
        )}
      </div>

      {webcamStatus === "connected" && (
        <div className="mt-2 mb-4">
          <Button
            onClick={capture}
            startIcon={<CameraAlt />}
            variant="contained"
            className="w-full py-4"
            size="large"
          >
            Take Picture
          </Button>
        </div>
      )}

      {images.length > 0 && (
        <>
          <FrameList className="w-full mb-2" />
          <VideoPreviewLink projectId={project.id} imageData={images[0].data} />
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
