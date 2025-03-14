import Webcam from "react-webcam";
import { useCallback, useRef, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import { CameraAlt, Cameraswitch } from "@mui/icons-material";
import clsx from "clsx";

type IProps = {
  onCapture: (image: string | null) => void;
  overlay?: React.ReactNode;
  actions?: React.ReactNode;
};

const Camera = ({ onCapture, overlay, actions }: IProps) => {
  const [selfieCam, setSelfieCam] = useState(false);
  const [webcamStatus, setWebcamStatus] = useState<
    "initialising" | "connected" | "error"
  >("initialising");

  // https://github.com/mozmorris/react-webcam/issues/409#issuecomment-2404446979
  const webcamRef = useRef<Webcam>(null);

  const capture = useCallback(async () => {
    const image = webcamRef.current?.getScreenshot();
    onCapture(image ?? null);
  }, [onCapture, webcamRef]);

  const reverse = () => {
    setSelfieCam(!selfieCam);
  };

  const videoConstraints = {
    width: 640,
    facingMode: selfieCam ? "user" : "environment",
  };

  return (
    <div>
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

      <a
        href="#"
        className="block relative max-w-full"
        onClick={(e) => {
          e.preventDefault();
          capture();
        }}
      >
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
            {overlay && (
              <Box className="absolute max-w-full max-h-full inset-0">
                {overlay}
              </Box>
            )}

            <Box className="absolute flex top-4 right-4 px-1 font-md bg-white/20 color-white text-white">
              {actions}
              <Tooltip title="Switch camera">
                <IconButton onClick={reverse}>
                  <Cameraswitch />
                </IconButton>
              </Tooltip>
            </Box>
          </>
        )}
      </a>

      {webcamStatus === "connected" && (
        <div className="mb-4">
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
    </div>
  );
};

export default Camera;
