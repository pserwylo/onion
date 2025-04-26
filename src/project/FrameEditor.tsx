import { selectFrame, setFrameDuration } from "./projectSlice.ts";
import { useAppDispatch } from "../store/hooks.ts";
import { useSelector } from "react-redux";
import {
  Button,
  Container,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
} from "@mui/material";
import { Close, Pause } from "@mui/icons-material";
import PageHeading from "../components/PageHeading.tsx";
import { useProjectRoute } from "../hooks/useProjectRoute.ts";

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
        <FormControl variant="outlined">
          <InputLabel htmlFor="input-duration">Duration (seconds)</InputLabel>
          <OutlinedInput
            id="input-duration"
            type="number"
            label="Duration (seconds)"
            onChange={(e) =>
              dispatch(
                setFrameDuration({
                  frameId: frameId,
                  duration: parseFloat(e.target.value),
                }),
              )
            }
            value={frame.duration}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  onClick={() =>
                    dispatch(
                      setFrameDuration({
                        frameId: frameId,
                        duration: 0,
                      }),
                    )
                  }
                >
                  <Close />
                </IconButton>
              </InputAdornment>
            }
          />
        </FormControl>
      )}
      <img src={frame.image} alt="image of a video frame" />
    </Container>
  );
};

export default FrameEditor;
