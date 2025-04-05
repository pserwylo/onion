import Container from "@mui/material/Container";
import PageHeading from "../components/PageHeading.tsx";
import { Link, useNavigate, useParams } from "react-router";
import { Alert, AlertTitle, Box, Button, Typography } from "@mui/material";
import { useAppDispatch } from "../store/hooks.ts";
import { useSelector } from "react-redux";
import {
  deleteProject,
  loadProject,
  selectProject,
} from "../project/projectSlice.ts";
import { useEffect, useState } from "react";
import { Warning } from "@mui/icons-material";
import { loadProjectThumbnail } from "../home/homeSlice.ts";

const ConfirmDeleteProject = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();
  const project = useSelector(selectProject);

  const [thumbnail, setThumbnail] = useState<string | undefined>();

  useEffect(() => {
    if (projectId) {
      dispatch(loadProject({ projectId }));
      loadProjectThumbnail(projectId).then((thumb) => setThumbnail(thumb));
    }
  }, [dispatch, projectId]);

  const handleDelete = async () => {
    await dispatch(deleteProject({ projectId: projectId! }));
    navigate("/");
  };

  // If there is no data for this scene, then just delete it without obtaining confirmation.
  // I'm not srue if we can ever get here, because we only actually show the delete button for a scene when you
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
      <PageHeading title="Delete Movie" backLink={`/project/${projectId}`} />
      {project && (
        <>
          <Alert icon={<Warning />} color="error">
            <Box className="flex gap-4">
              <Box>
                <AlertTitle>Are you sure?</AlertTitle>
                <Typography>
                  Do you really want to{" "}
                  <strong>delete this entire movie?</strong>
                </Typography>
              </Box>
              {thumbnail && (
                <img
                  src={thumbnail}
                  alt="thumbnail of movie"
                  className="w-24 max-w-24"
                />
              )}
            </Box>
          </Alert>
          <Box className="flex w-full justify-between">
            <Button
              color="primary"
              variant="outlined"
              component={Link}
              to={`/project/${projectId}`}
            >
              Cancel
            </Button>
            <Button color="error" variant="outlined" onClick={handleDelete}>
              Delete Entire Movie
            </Button>
          </Box>
        </>
      )}
    </Container>
  );
};

export default ConfirmDeleteProject;
