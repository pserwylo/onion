import {
  Box,
  Button,
  Checkbox,
  Container,
  FormControlLabel,
  Paper,
  Radio,
  RadioGroup,
  Typography,
} from "@mui/material";
import { useAppDispatch } from "../store/hooks.ts";
import { useNavigate } from "react-router";
import { addProject } from "../home/homeSlice.ts";
import { GridView } from "@mui/icons-material";

export const NewProjectPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleStoryboard = () => {};

  const handleNoStoryboard = async () => {
    const { payload: projectId } = await dispatch(addProject());
    navigate(`/project/${projectId}`);
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h1">Get started</Typography>
      <RadioGroup name="project-type" className="flex flex-col gap-4 mt-8">
        <Paper className="flex gap-4">
          <FormControlLabel
            className="p-8 w-full"
            control={<Radio value="storyboard" />}
            label={
              <>
                <GridView />
                Story Board
              </>
            }
          />
        </Paper>
        <Paper className="flex gap-4">
          <FormControlLabel
            className="p-8 w-full"
            control={<Radio value="plain" />}
            label={
              <>
                <GridView />
                Story Board
              </>
            }
          />
        </Paper>
      </RadioGroup>
    </Container>
  );
};
