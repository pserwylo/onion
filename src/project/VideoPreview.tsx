import {
  generateExportZip,
  generatePreviewVideo,
  selectPreviewVideo,
} from "./projectSlice.ts";
import { useAppDispatch } from "../store/hooks.ts";
import { useEffect } from "react";
import { Box, Button, Container, IconButton, Typography } from "@mui/material";
import { Close, CloudDownload, FolderZip } from "@mui/icons-material";
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

  const handleExport = () => {
    dispatch(generateExportZip());
  };

  return (
    <Container maxWidth="sm" className="flex flex-col gap-y-2">
      <Box className="flex gap-4 mt-4">
        <Typography variant="h2" className="flex-grow">
          Watch
        </Typography>
        <IconButton component={Link} to={backLink}>
          <Close />
        </IconButton>
      </Box>
      <Box className="flex gap-4">
        <Button
          component="a"
          href={previewVideo}
          download="video.webm"
          startIcon={<CloudDownload />}
          size="small"
          variant="contained"
        >
          Download
        </Button>
        <Button
          startIcon={<FolderZip />}
          onClick={handleExport}
          size="small"
          variant="outlined"
        >
          Export
        </Button>
      </Box>
      <video src={previewVideo} controls autoPlay={true} />
    </Container>
  );
};

export default VideoPreview;
