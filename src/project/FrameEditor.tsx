import { selectFrame, setFrameDuration } from "./projectSlice.ts";
import { useAppDispatch } from "../store/hooks.ts";
import { useSelector } from "react-redux";
import {
  Box,
  Button,
  Container,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  Typography,
} from "@mui/material";
import { Add, Check, Close, Edit, Pause, Remove } from "@mui/icons-material";
import PageHeading from "../components/PageHeading.tsx";
import { useProjectRoute } from "../hooks/useProjectRoute.ts";
import { useState } from "react";

type IDurationInputProps = {
  value: number | undefined;
  onChange: (value: number | undefined) => void;
};

const DurationInput = ({ value, onChange }: IDurationInputProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingValue, setEditingValue] = useState(
    value ? value.toString() : "",
  );

  const handleAccept = () => {
    setIsEditing(false);
    const newValue = parseFloat(editingValue);
    onChange(isNaN(newValue) ? undefined : newValue);
  };

  const handleClear = () => {
    setIsEditing(false);
    onChange(undefined);
  };

  const handleStartEditing = () => {
    setIsEditing(true);
    setEditingValue(value === undefined ? "1.00" : value.toFixed(2));
    onChange(value);
  };

  if (isEditing) {
    const editingValueNumber = parseFloat(editingValue);
    const isValid = !isNaN(editingValueNumber);

    const handlePlus = () => {
      if (!isValid) {
        setEditingValue("1.00");
      }

      setEditingValue((editingValueNumber + 0.25).toFixed(2));
    };

    const handleMinus = () => {
      if (!isValid) {
        setEditingValue("1.00");
      }

      setEditingValue((editingValueNumber - 0.25).toFixed(2));
    };

    return (
      <Box className="flex">
        <FormControl
          variant="outlined"
          className={"max-w-[180px]"}
          error={!isValid}
        >
          <InputLabel htmlFor="input-duration">Duration (secs)</InputLabel>
          <OutlinedInput
            id="input-duration"
            value={editingValue}
            error={!isValid}
            onChange={(e) => setEditingValue(e.target.value)}
            startAdornment={
              <InputAdornment position="start">
                <IconButton edge="start" onClick={handleMinus}>
                  <Remove />
                </IconButton>
              </InputAdornment>
            }
            endAdornment={
              <InputAdornment position="end">
                <IconButton edge="end" onClick={handlePlus}>
                  <Add />
                </IconButton>
              </InputAdornment>
            }
            label="Duration (secs)"
          />
        </FormControl>
        <IconButton onClick={handleAccept} disabled={!isValid}>
          <Check />
        </IconButton>
        <IconButton onClick={handleClear}>
          <Close />
        </IconButton>
      </Box>
    );
  }

  return (
    <Box className="flex items-center gap-2">
      <Typography>
        Pause for {value} second{value === 1 ? "" : "s"}
      </Typography>
      <IconButton onClick={handleStartEditing}>
        <Edit />
      </IconButton>
    </Box>
  );
};

const FrameEditor = () => {
  const dispatch = useAppDispatch();
  const { projectId, sceneIndex, frameId } = useProjectRoute({
    requireFrame: true,
  });
  const frame = useSelector(selectFrame);

  if (frame == null || frameId === undefined) {
    return null;
  }

  const backLink = sceneIndex
    ? `/project/${projectId}/scene/${sceneIndex}`
    : `/project/${projectId}`;

  const handlePause = async () => {
    await dispatch(
      setFrameDuration({
        frameId: frameId,
        duration: frame.duration ? undefined : 1,
      }),
    );
  };

  return (
    <Container maxWidth="sm" className="flex flex-col gap-y-2 items-start">
      <PageHeading title="Frame" backLink={backLink} className="w-full" />
      {!frame.duration ? (
        <Button startIcon={<Pause />} variant="outlined" onClick={handlePause}>
          Pause here
        </Button>
      ) : (
        <DurationInput
          value={frame.duration}
          onChange={(value) =>
            dispatch(
              setFrameDuration({
                frameId: frameId,
                duration: value,
              }),
            )
          }
        />
      )}
      <img src={frame.image} alt="image of a video frame" />
    </Container>
  );
};

export default FrameEditor;
