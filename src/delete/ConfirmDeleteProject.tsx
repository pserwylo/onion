import Container from "@mui/material/Container";
import PageHeading from "../components/PageHeading.tsx";
import { Link, useNavigate, useParams } from "react-router";
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  CircularProgress,
  Typography,
} from "@mui/material";
import { useAppDispatch } from "../store/hooks.ts";
import { useSelector } from "react-redux";
import {
  deleteProject,
  loadProject,
  selectProject,
} from "../project/projectSlice.ts";
import { useCallback, useEffect, useState } from "react";
import { Warning } from "@mui/icons-material";
import { loadProjectThumbnail } from "../home/homeSlice.ts";

const ConfirmDeleteProject = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();
  const project = useSelector(selectProject);

  const [thumbnail, setThumbnail] = useState<string | undefined>();

  const handleDelete = useCallback(async () => {
    await dispatch(deleteProject({ projectId: projectId! }));
    navigate("/");
  }, [dispatch, navigate, projectId]);

  useEffect(() => {
    if (projectId) {
      (async function () {
        await dispatch(loadProject({ projectId }));
        const thumb = await loadProjectThumbnail(projectId);
        if (thumb) {
          setThumbnail(thumb);
        } else {
          // If there is no thumbnail, then there is no frames and no scene images. At this point,
          // it seems silly to even ask permission, so lets just delete it and return back.
          await handleDelete();
        }
      })();
    }
  }, [dispatch, projectId, handleDelete]);

  if (project == null || thumbnail == null) {
    return (
      <Box className="flex flex-col">
        <CircularProgress />
      </Box>
    );
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
