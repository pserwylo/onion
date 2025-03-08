import { Link, useNavigate, useParams } from "react-router";
import { addSceneImage, loadProject, selectScenes } from "./projectSlice.ts";
import { useAppDispatch } from "../store/hooks.ts";
import { useSelector } from "react-redux";
import {
  Box,
  Button,
  Container,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import { CameraAlt, Cameraswitch, ChevronLeft } from "@mui/icons-material";
import { useCallback, useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import clsx from "clsx";

const ScenePhotoEditor = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { projectId, sceneId } = useParams<{
    projectId: string;
    sceneId: string;
  }>();
  const allScenes = useSelector(selectScenes);
  const [selfieCam, setSelfieCam] = useState(false);
  const [webcamStatus, setWebcamStatus] = useState<
    "initialising" | "connected" | "error"
  >("initialising");

  // https://github.com/mozmorris/react-webcam/issues/409#issuecomment-2404446979
  const webcamRef = useRef<Webcam>(null);

  const videoConstraints = {
    width: 640,
    facingMode: selfieCam ? "user" : "environment",
  };

  useEffect(() => {
    if (projectId) {
      dispatch(loadProject(projectId));
    }
  }, [dispatch, projectId]);

  const capture = useCallback(async () => {
    if (sceneId == null) {
      return;
    }

    const image = webcamRef.current?.getScreenshot();
    if (!image) {
      return;
    }

    await dispatch(addSceneImage({ sceneId, image }));
    navigate(`/project/${projectId}/storyboard`);
  }, [dispatch, sceneId, webcamRef]);

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

  const reverse = () => {
    setSelfieCam(!selfieCam);
  };

  return (
    <Container maxWidth="sm" className="flex flex-col gap-y-2">
      <Typography variant="h1">Animation Time</Typography>
      <Typography variant="h2">Scene {sceneIndex + 1}</Typography>
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
              <Tooltip title="Switch camera">
                <IconButton onClick={reverse}>
                  <Cameraswitch />
                </IconButton>
              </Tooltip>
            </Box>
          </>
        )}
      </div>
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
          to={capture}
          className="w-full"
          startIcon={<CameraAlt />}
          variant="contained"
          onClick={capture}
        >
          Take Picture of Scene {sceneIndex + 1}
        </Button>
      </Box>
    </Container>
  );
};

export default ScenePhotoEditor;
