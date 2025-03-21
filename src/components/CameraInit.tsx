import { useState } from "react";
import {
  Alert,
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
    return (
      <>
        <h3>Need permission</h3>
        <Button onClick={() => ask()}>Ask</Button>
      </>
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
        <Button variant="contained" onClick={() => askAgain()}>
          Try Again
        </Button>
      </>
    );
  }

  if (status === "asking") {
    return (
      <div className="w-full h-full min-h-48">
        <CircularProgress variant="indeterminate" />
      </div>
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
      <Typography variant="h2">Choose a camera</Typography>
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
