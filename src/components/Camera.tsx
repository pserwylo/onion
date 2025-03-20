import Webcam from "react-webcam";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Tooltip,
  Typography,
} from "@mui/material";
import { CameraAlt, Cameraswitch, Close, Help } from "@mui/icons-material";
import clsx from "clsx";
import { useAppDispatch } from "../store/hooks.ts";
import { setPreferredDeviceId, useSettings } from "../settingsSlice.ts";

type IProps = {
  onCapture: (image: string | null) => void;
  overlay?: React.ReactNode;
  actions?: React.ReactNode;
};

const Camera = ({ onCapture, overlay, actions }: IProps) => {
  const [showCameraSelect, setShowCameraSelect] = useState(false);
  const [webcamStatus, setWebcamStatus] = useState<
    "initialising" | "connected" | "error"
  >("initialising");

  const settings = useSettings();

  // https://github.com/mozmorris/react-webcam/issues/409#issuecomment-2404446979
  const webcamRef = useRef<Webcam>(null);

  const dispatch = useAppDispatch();

  console.log("Settings: ", settings);

  const capture = useCallback(async () => {
    const image = webcamRef.current?.getScreenshot();
    onCapture(image ?? null);
  }, [onCapture, webcamRef]);

  const videoConstraints = {
    width: 640,
    facingMode: settings?.preferredCameraDeviceId ? "environment" : undefined,
    deviceId: settings?.preferredCameraDeviceId,
  };

  return (
    <div>
      {webcamStatus === "error" && (
        <Box className="flex flex-col py-24 px-12 text-center">
          <Typography className="!mt-8 block">Unable to use webcam</Typography>
          <Button
            variant="text"
            size="small"
            onClick={() => setShowCameraSelect(true)}
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
            onClick={() => setShowCameraSelect(true)}
            startIcon={<Cameraswitch />}
          >
            Try different webcam
          </Button>
        </Box>
      )}

      <a
        href="#"
        className="block relative max-w-full"
        onClick={() => capture()}
      >
        <Webcam
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/webp"
          onUserMediaError={() => setWebcamStatus("error")}
          onUserMedia={(stream) => {
            setWebcamStatus("connected");
          }}
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
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setShowCameraSelect(true);
                  }}
                >
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

      <CameraSelector
        open={showCameraSelect}
        selectedDeviceId={settings?.preferredCameraDeviceId}
        onClose={async (deviceId) => {
          if (deviceId) {
            dispatch(setPreferredDeviceId(deviceId));
          }

          setShowCameraSelect(false);
        }}
      />
    </div>
  );
};

export interface ICameraSelectorProps {
  open: boolean;
  selectedDeviceId?: string;
  onClose: (deviceId?: string) => void;
}

const CameraSelector = (props: ICameraSelectorProps) => {
  const { onClose, selectedDeviceId, open } = props;
  const [status, setStatus] = useState<"pending" | "fulfilled" | "error">(
    "pending",
  );
  const [showHelp, setShowHelp] = useState(false);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);

  useEffect(() => {
    (async function () {
      try {
        const enumeratedDevices =
          await navigator.mediaDevices.enumerateDevices();
        console.log("Devices: ", enumeratedDevices);
        setDevices(enumeratedDevices.filter((d) => d.kind === "videoinput"));
        setStatus("fulfilled");
      } catch (e) {
        console.error(e);
        setStatus("error");
      }
    })();
  }, []);

  const handleClose = () => {
    onClose(selectedDeviceId);
  };

  const renderContent = () => {
    if (status === "error") {
      return (
        <Alert color="error">
          An error occurred trying to list cameras. Have you granted access to
          view your camera?
        </Alert>
      );
    }

    if (status === "pending") {
      return <CircularProgress variant="indeterminate" />;
    }

    return (
      <List sx={{ pt: 0 }}>
        {devices.map((device) => (
          <ListItem disablePadding key={device.deviceId}>
            <ListItemButton onClick={() => onClose(device.deviceId)}>
              <ListItemAvatar>
                <Avatar>
                  <CameraAlt />
                </Avatar>
              </ListItemAvatar>
              <ListItemText primary={device.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    );
  };

  return (
    <Dialog onClose={handleClose} open={open}>
      <div className="flex w-full pr-4">
        <div className="flex-grow">
          <DialogTitle>Select Camera</DialogTitle>
        </div>
        <IconButton onClick={() => setShowHelp(!showHelp)}>
          <Help />
        </IconButton>
        <IconButton onClick={handleClose}>
          <Close />
        </IconButton>
      </div>
      {showHelp && (
        <Typography className="py-4 px-4 pt-4">
          If the camera is always blury, try choosing a different one. Most
          modern smart phones have multiple cameras on the back, each with
          different lenses (e.g. wide-angle, super-macro, etc). Some laptops
          even have infrared cameras.
        </Typography>
      )}
      {renderContent()}
    </Dialog>
  );
};

export default Camera;
