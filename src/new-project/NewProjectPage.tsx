import {
  Box,
  Button,
  Container,
  FormControlLabel,
  Paper,
  Radio,
  RadioGroup,
  Typography,
} from "@mui/material";
import { useAppDispatch } from "../store/hooks.ts";
import { Link, useNavigate } from "react-router";
import { addProject } from "../home/homeSlice.ts";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import { useState } from "react";

export const NewProjectPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [type, setType] = useState<"simple" | "storyboard">("simple");

  const handleNext = async () => {
    if (type === "simple") {
      const { payload: projectId } = await dispatch(addProject(false));
      navigate(`/project/${projectId}`);
    } else {
      const { payload: projectId } = await dispatch(addProject(true));
      navigate(`/project/${projectId}/storyboard`);
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h1">Get started</Typography>
      <RadioGroup name="project-type" className="flex flex-col gap-4 mt-8">
        <Paper className="flex gap-4">
          <FormControlLabel
            className="p-8 w-full"
            control={
              <Radio
                value="simple"
                checked={type === "simple"}
                onChange={(e) =>
                  setType(e.target.checked ? "simple" : "storyboard")
                }
              />
            }
            label={
              <Box className="flex flex-col gap-4 ml-4">
                <Typography variant="h5">Simple Movie</Typography>
                <Typography variant="caption">...</Typography>
              </Box>
            }
          />
        </Paper>
        <Paper className="flex gap-4">
          <FormControlLabel
            className="p-8 w-full"
            control={
              <Radio
                value="storyboard"
                checked={type === "storyboard"}
                onChange={(e) =>
                  setType(e.target.checked ? "storyboard" : "simple")
                }
              />
            }
            label={
              <Box className="flex flex-col gap-4 ml-4">
                <Typography variant="h5">Story Board + Scenes</Typography>
                <Typography variant="caption">
                  A storyboard is a way of planning animated films, movies, or
                  television shows. A storyboard shows examples of what the
                  artist wants to make before they are animated. It also lets
                  artists organize their stories before they start to make the
                  animation.
                </Typography>
              </Box>
            }
          />
        </Paper>
      </RadioGroup>
      <Box className="flex gap-4 !mt-12 h-14">
        <Button
          component={Link}
          to="/"
          startIcon={<ChevronLeft />}
          variant="outlined"
        >
          Back
        </Button>
        <Button
          variant="contained"
          endIcon={<ChevronRight />}
          className="flex-grow"
          onClick={handleNext}
        >
          {type === "simple" ? "Start Animating!" : "Add storyboard"}
        </Button>
      </Box>
    </Container>
  );
};
