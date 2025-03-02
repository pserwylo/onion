import { Link, useParams } from "react-router";
import { loadProject, selectFrames, setFrameDuration } from "./projectSlice.ts";
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
} from "@mui/material";
import { ChevronLeft, Close, Pause } from "@mui/icons-material";
import { useEffect } from "react";

const FrameEditor = () => {
  const dispatch = useAppDispatch();
  const { projectId, frameId } = useParams<{
    projectId: string;
    frameId: string;
  }>();
  const allFrames = useSelector(selectFrames);

  useEffect(() => {
    if (projectId) {
      dispatch(loadProject(projectId));
    }
  }, [dispatch, projectId]);

  if (frameId == null) {
    console.warn("No frame ID provided to FrameEditor URL.");
    return null;
  }

  const frame = allFrames.find((f) => f.id === frameId);

  if (frame === undefined) {
    console.warn(`Couldn't find frameId ${frameId} in frames: `, {
      images: allFrames,
    });
    return null;
  }

  const handlePause = () => {
    dispatch(
      setFrameDuration({
        frameId: frameId,
        duration: frame.duration ? undefined : 1,
      }),
    );
  };

  return (
    <Container maxWidth="sm" className="flex flex-col gap-y-2">
      <img src={frame.image} alt="image of a video frame" />
      <Box className="flex gap-4">
        <div className="flex-grow">
          <Button
            component={Link}
            to={`/project/${projectId}`}
            className="w-full"
            startIcon={<ChevronLeft />}
            variant="contained"
          >
            Back
          </Button>
        </div>
        {!frame.duration ? (
          <Button
            startIcon={<Pause />}
            variant="outlined"
            onClick={handlePause}
          >
            Pause here
          </Button>
        ) : (
          <>
            <FormControl variant="outlined">
              <InputLabel htmlFor="input-duration">
                Duration (seconds)
              </InputLabel>
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
          </>
        )}
      </Box>
    </Container>
  );
};

export default FrameEditor;
