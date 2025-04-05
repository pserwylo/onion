import Container from "@mui/material/Container";
import PageHeading from "../components/PageHeading.tsx";
import { Link, useNavigate, useParams } from "react-router";
import { useEffect } from "react";
import {
  deleteScene,
  loadProject,
  makeSelectSceneSummary,
  selectProject,
  selectScene,
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
  const scene = useSelector(selectScene);
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

  // If there is no data for this scene, then just delete it without obtaining confirmation.
  // I'm not sure if we can ever get here, because we only actually show the delete button for a scene when you
  // are in the <ProjectEditor> for it, and this can only happen if you've already taken a photo of the storyboard
  // for it...
  // Also be extra defensive because sometimes these things are undefined while we wait for loadProject() to get
  // the details from the db, so we only do so if we've actually got all the details loaded first.
  if (
    scene !== undefined &&
    scene.image === undefined &&
    sceneDetails !== undefined &&
    sceneDetails.frames.length === 0
  ) {
    console.info(
      `Project ${projectId} scene ${sceneIndex} has no data. so deleting without confirmation.`,
    );
    handleDelete();
    return null;
  }

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
