import { generatePreviewVideo, selectPreviewVideo } from "./projectSlice.ts";
import { useAppDispatch } from "../store/hooks.ts";
import { useEffect } from "react";
import { Box, Button, Container } from "@mui/material";
import { ChevronLeft, CloudDownload } from "@mui/icons-material";
import { useSelector } from "react-redux";
import { Link } from "react-router";

const VideoPreview = () => {
  const previewVideo = useSelector(selectPreviewVideo);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(generatePreviewVideo());
  }, [dispatch]);

  return (
    <Container maxWidth="sm" className="flex flex-col gap-y-2">
      <video src={previewVideo} controls autoPlay={true} />
      <Box className="flex gap-4">
        <Button
          component={Link}
          to="/"
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
