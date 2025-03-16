import { Close } from "@mui/icons-material";
import {
  Card,
  CardContent,
  CircularProgress,
  Container,
  IconButton,
  Slider,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { Link } from "react-router";

type IDeviceSummary = {
  stream: MediaStream;
  track: MediaStreamTrack;
  capabilities: MediaTrackCapabilities;
  settings: MediaTrackSettings;
};

export default function DebugPage() {
  const [devices, setDevices] = useState<MediaDeviceInfo[] | null>(null);
  const [device, setDevice] = useState<IDeviceSummary | null>(null);

  const checkDevices = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
    });

    const track = stream.getTracks()[0];

    setDevice({
      stream,
      track,
      capabilities: track.getCapabilities(),
      settings: track.getSettings(),
    });

    const enumeratedDevices = await navigator.mediaDevices.enumerateDevices();
    setDevices(enumeratedDevices);
  };

  useEffect(() => {
    checkDevices();
  }, []);

  return (
    <Container maxWidth="sm" className="flex flex-col gap-y-2 mt-4">
      <div className="flex">
        <Typography variant="h2" className="flex-grow">
          Debug Information
        </Typography>
        <IconButton component={Link} to="/">
          <Close />
        </IconButton>
      </div>
      {devices == null ? (
        <CircularProgress variant="indeterminate" />
      ) : (
        devices.map((d) =>
          device?.settings?.deviceId === d.deviceId ? (
            <DeviceInfo device={d} key={d.deviceId} details={device} />
          ) : (
            <DeviceInfo device={d} key={d.deviceId} />
          ),
        )
      )}
    </Container>
  );
}

type IDeviceInfoProps = {
  device: MediaDeviceInfo;
  details?: IDeviceSummary;
};

const DeviceInfo = ({ device, details }: IDeviceInfoProps) => {
  return (
    <Card>
      <CardContent className="flex flex-col gap-y-4">
        {device.deviceId && (
          <Typography>
            Device ID:
            {device.deviceId}
          </Typography>
        )}
        {device.label && <Typography>Label: {device.label}</Typography>}
        {device.groupId && (
          <Typography>
            Group ID:
            {device.groupId}
          </Typography>
        )}
        {device.kind && <Typography>Kind: {device.kind}</Typography>}
        {details?.capabilities?.displaySurface && (
          <Typography>
            Display Surface: {details.settings.displaySurface}
          </Typography>
        )}
        {details?.capabilities?.facingMode && (
          <Typography>
            Display Surface: {details.settings.facingMode}
          </Typography>
        )}
        {details?.capabilities?.width && details?.capabilities?.height && (
          <div className="flex gap-x-8 w-full px-4">
            <div className="flex flex-col flex-grow">
              <Typography gutterBottom className="w-full text-right">
                Width
              </Typography>
              <CapabilitiesSlider
                min={details.capabilities.width.min}
                max={details.capabilities.width.max}
                value={details.settings.width}
                unit="px"
              />
            </div>
            <Typography className="align-self-center">X</Typography>
            <div className="flex flex-col flex-grow">
              <Typography gutterBottom>Height</Typography>
              <CapabilitiesSlider
                min={details.capabilities.height.min}
                max={details.capabilities.height.max}
                value={details.settings.height}
                unit="px"
              />
            </div>
          </div>
        )}
        {details?.capabilities?.frameRate && (
          <>
            <Typography gutterBottom>Frame Rate</Typography>
            <div className="w-full px-4">
              <CapabilitiesSlider
                className="w-full"
                min={details.capabilities.frameRate.min}
                max={details.capabilities.frameRate.max}
                value={details.settings.frameRate}
                unit="fps"
              />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

type ICapabilitiesSliderProps = {
  min?: number;
  max?: number;
  value?: number;
  unit?: string;
  className?: string;
};

const CapabilitiesSlider = ({
  min,
  value,
  max,
  unit,
  className,
}: ICapabilitiesSliderProps) => {
  return (
    <Slider
      className={className}
      disabled
      min={min}
      max={max}
      value={value ?? 0}
      marks={[
        {
          value: min ?? 0,
          label: `${min ?? 0}${unit}`,
        },
        { value: value ?? 0, label: `${value ?? 0}${unit}` },
        {
          value: max ?? 0,
          label: `${max ?? 0}${unit}`,
        },
      ]}
    />
  );
};
