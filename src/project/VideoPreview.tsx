import { generatePreviewVideo, selectPreviewVideo } from "./projectSlice.ts";
import { useAppDispatch } from "../store/hooks.ts";
import { useEffect } from "react";
import { Box, Button, Container } from "@mui/material";
import { ChevronLeft, CloudDownload } from "@mui/icons-material";
import { useSelector } from "react-redux";
import { Link, useParams } from "react-router";

const VideoPreview = () => {
  const previewVideo = useSelector(selectPreviewVideo);
  const dispatch = useAppDispatch();
  const { projectId, sceneIndex } = useParams<{
    projectId: string;
    sceneIndex?: string;
  }>();

  useEffect(() => {
    dispatch(generatePreviewVideo({ projectId: projectId!, sceneIndex }));
  }, [dispatch, projectId, sceneIndex]);

  let backLink = `/project/${projectId}`;
  if (sceneIndex) {
    backLink += `/scene/${sceneIndex}`;
  }

  return (
    <Container maxWidth="sm" className="flex flex-col gap-y-2">
      <video src={previewVideo} controls autoPlay={true} />
      <Box className="flex gap-4">
        <Button
          component={Link}
          to={backLink}
          startIcon={<ChevronLeft />}
          size="large"
          sx={{ flexGrow: 1 }}
          variant="contained"
        >
          Back
        </Button>
        <Button
          component="a"
          href={previewVideo}
          download="video.webm"
          startIcon={<CloudDownload />}
          size="large"
          variant="outlined"
        >
          Download
        </Button>
      </Box>
    </Container>
  );
};

export default VideoPreview;
