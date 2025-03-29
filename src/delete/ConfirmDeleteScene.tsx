import Container from "@mui/material/Container";
import PageHeading from "../components/PageHeading.tsx";
import { Link, useNavigate, useParams } from "react-router";
import { useEffect } from "react";
import {
  deleteScene,
  loadProject,
  makeSelectSceneSummary,
  selectProject,
} from "../project/projectSlice.ts";
import { useAppDispatch } from "../store/hooks.ts";
import { useSelector } from "react-redux";
import { Alert, AlertTitle, Box, Button, Typography } from "@mui/material";
import { Warning } from "@mui/icons-material";
import FrameList from "../project/FrameList.tsx";

const ConfirmDeleteScene = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { projectId, sceneIndex } = useParams<{
    projectId: string;
    sceneIndex: string;
  }>();
  const sceneDetails = useSelector(makeSelectSceneSummary(sceneIndex));
  const project = useSelector(selectProject);

  const sceneIndexInt = parseInt(sceneIndex!, 10);

  useEffect(() => {
    if (projectId) {
      dispatch(loadProject({ projectId, sceneIndex }));
    }
  }, [dispatch, projectId, sceneIndex]);

  const handleDelete = async () => {
    await dispatch(
      deleteScene({ projectId: projectId!, sceneIndex: sceneIndexInt }),
    );
    navigate(`/project/${projectId}`);
  };

  return (
    <Container maxWidth="sm" className="flex flex-col gap-4">
      <PageHeading
        title="Delete Scene"
        backLink={`/project/${projectId}/scene/${sceneIndexInt}`}
      />
      {sceneDetails && (
        <>
          <Alert icon={<Warning />} color="error">
            <AlertTitle>Are you sure?</AlertTitle>
            <Typography>
              Do you really want to delete{" "}
              <strong>Scene {sceneIndexInt + 1}?</strong>
            </Typography>
            <Typography>
              It has {sceneDetails.frames.length} frame
              {sceneDetails.frames.length === 1 ? "" : "s"} and is{" "}
              {sceneDetails.duration} seconds long.
            </Typography>
            <FrameList
              project={project}
              frames={sceneDetails.frames}
              className="mt-4"
              readOnly
            />
          </Alert>
          <Box className="flex w-full justify-between">
            <Button
              color="primary"
              variant="outlined"
              component={Link}
              to={`/project/${projectId}/scene/${sceneIndex}`}
            >
              Cancel
            </Button>
            <Button color="error" variant="outlined" onClick={handleDelete}>
              Delete Scene
            </Button>
          </Box>
        </>
      )}
    </Container>
  );
};

export default ConfirmDeleteScene;
