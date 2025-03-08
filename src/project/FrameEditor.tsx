import { Link, useNavigate, useParams } from "react-router";
import { loadProject, selectFrame, setFrameDuration } from "./projectSlice.ts";
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
  const navigate = useNavigate();
  const { projectId, frameId } = useParams<{
    projectId: string;
    frameId: string;
  }>();
  const frame = useSelector(selectFrame);

  useEffect(() => {
    if (projectId) {
      dispatch(loadProject({ projectId, frameId }));
    }
  }, [dispatch, projectId, frameId]);

  if (projectId == null) {
    console.warn("No project ID provided to FrameEditor URL.");
    navigate(`/`);
    return null;
  }

  if (frameId == null) {
    console.warn("No frame ID provided to FrameEditor URL.");
    navigate(`/project/${projectId}`);
    return null;
  }

  if (frame == null) {
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
