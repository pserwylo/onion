import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  List,
  ListItem,
  Typography,
} from "@mui/material";
import { Cameraswitch, Error } from "@mui/icons-material";
import { createError, ICameraError } from "./camera-utils";
import CameraList from "./CameraList.tsx";
import { useAppDispatch } from "../store/hooks.ts";
import {
  setCameras,
  setPreferredDeviceId,
  useSettings,
} from "../settingsSlice.ts";
import { CameraDevice } from "../store/db.ts";

const CameraInit = () => {
  const [status, setStatus] = useState<
    "require-permission" | "asking" | "rejected" | "granted"
  >("require-permission");
  const [showTechnicalPermissionDetails, setShowTechnicalPermissionDetails] =
    useState(false);

  const dispatch = useAppDispatch();
  const [error, setError] = useState<ICameraError | undefined>();

  const [devices, setDevices] = useState<CameraDevice[] | undefined>();

  const settings = useSettings();

  if (settings?.cameras !== undefined && devices === undefined) {
    setDevices(settings.cameras);
    return null;
  }

  const ask = async () => {
    setStatus("asking");
    try {
      // Asking for permission to user media is important so that when we enumerate devices, then
      // we get meaningful information for each device (i.e. deviceId, label, etc.
      await navigator.mediaDevices.getUserMedia({ video: true });
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices: CameraDevice[] = allDevices
        .filter((device) => device.kind === "videoinput")
        .map((device) => ({
          id: device.deviceId,
          label: device.label,
        }));
      console.log({ allDevices, videoDevices });
      setDevices(videoDevices);
      setStatus("granted");
      dispatch(setCameras(videoDevices));
    } catch (e) {
      setError(createError(e as Error));
      console.error(e);
      setStatus("rejected");
    }
  };

  const askAgain = async () => {
    ask();
  };

  const handleSelectDevice = async (camera: CameraDevice) => {
    await dispatch(setPreferredDeviceId(camera.id));
  };

  if (devices === undefined) {
    if (status === "asking") {
      return (
        <Box className="flex flex-col py-24 px-12 text-center">
          <Box className="flex gap-4 justify-center items-center">
            <CircularProgress />
            <Typography>Searching for cameras</Typography>
          </Box>
        </Box>
      );
    }

    return (
      <Box className="flex flex-col gap-4">
        <Typography variant="h4">Camera Permissions</Typography>
        <Alert color="success">
          <Box>
            This app is for you to make stop motion movies. Doing so requires
            access to your camera. Your privacy is the number one priority -
            your photos remain on your device.
          </Box>
          {showTechnicalPermissionDetails ? (
            <Box className="mt-4">
              This app is a progressive web app. All of the photo's are stored
              in your browser using IndexedDB. This app does not have any server
              component beyond what is required to send the static HTML/JS/CSS
              files for the progressive web app. The source code is free
              software and available at{" "}
              <a href="https://github.com/pserwylo/onion">
                https://github.com/pserwylo/onion
              </a>
              .
            </Box>
          ) : (
            <Box className="mt-4">
              <Button
                variant="text"
                onClick={() => setShowTechnicalPermissionDetails(true)}
                size="small"
              >
                Technical Details
              </Button>
            </Box>
          )}
        </Alert>
        <Button
          variant="contained"
          color="primary"
          onClick={() => ask()}
          className="self-start"
        >
          Request Camera Permission
        </Button>
      </Box>
    );
  }

  if (status === "rejected") {
    return (
      <>
        {error && (
          <Alert color="error" icon={<Error />}>
            <Typography>
              <strong>{error.message}</strong>
            </Typography>
            {error.help && <Typography>{error.help}</Typography>}
          </Alert>
        )}
        <Button
          variant="contained"
          onClick={() => askAgain()}
          className="self-start"
        >
          Try Again
        </Button>
      </>
    );
  }

  if (devices != null && devices.length === 0) {
    return (
      <div className="flex flex-col gap-y-4">
        <Alert color="error" icon={<Error />}>
          <Typography>
            <strong>No camera found</strong>
          </Typography>
          <Typography>Unable to find any camera on your device.</Typography>
        </Alert>
        <Button variant="contained" onClick={() => askAgain()}>
          Try Again
        </Button>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-y-4">
      <Typography variant="h4">Choose a camera</Typography>
      <Alert color="info">
        <strong>Tips:</strong>
        <List sx={{ listStyleType: "disc", pl: 4 }}>
          <ListItem sx={{ display: "list-item", padding: 0 }}>
            You can always change later using the{" "}
            <Cameraswitch className="!w-4" /> button.
          </ListItem>
          <ListItem sx={{ display: "list-item", padding: 0 }}>
            Modern phones have many cameras. Experiment to find works for you.
          </ListItem>
        </List>
      </Alert>
      <Typography></Typography>
      <CameraList cameras={devices} onSelect={handleSelectDevice} />
    </div>
  );
};

export default CameraInit;
