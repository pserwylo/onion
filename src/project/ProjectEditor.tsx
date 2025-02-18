import Webcam from "react-webcam";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAppDispatch } from "../store/hooks.ts";
import {
  addImage,
  loadImages,
  removeImage,
  selectImages,
  selectOnionSkinImages,
  selectProjectOptions,
} from "./projectSlice.ts";
import { useSelector } from "react-redux";
import { Button, Container, IconButton } from "@mui/material";
import { CameraAlt, Cameraswitch, PlayCircle } from "@mui/icons-material";
import { Link } from "react-router";

const ProjectEditor = () => {
  const dispatch = useAppDispatch();
  const onionSkinImages = useSelector(selectOnionSkinImages);
  const images = useSelector(selectImages);
  const [selfieCam, setSelfieCam] = useState(false);

  // https://github.com/mozmorris/react-webcam/issues/409#issuecomment-2404446979
  const webcamRef = useRef<Webcam>(null);

  useEffect(() => {
    dispatch(loadImages());
  }, [dispatch]);

  const capture = useCallback(async () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      dispatch(addImage(imageSrc));
    }
  }, [dispatch, webcamRef]);

  const reverse = () => {
    setSelfieCam(!selfieCam);
  };

  const videoConstraints = {
    width: 640,
    facingMode: selfieCam ? "user" : "environment",
  };

  return (
    <Container maxWidth="sm">
      <div className="camera-wrapper">
        <Webcam
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/webp"
          width={640}
          disablePictureInPicture
          className="camera camera--feed"
          videoConstraints={videoConstraints}
        />

        {onionSkinImages.map((image) => (
          <img className="onion-skin" src={image.data} key={image.id} />
        ))}
        <IconButton
          onClick={reverse}
          sx={{
            padding: "0.1em 0.2em",
            fontSize: "1.5em",
            position: "absolute",
            top: "1em",
            right: "1em",
          }}
        >
          <Cameraswitch />
        </IconButton>
      </div>
      <div className="main-actions">
        <Button
          onClick={capture}
          startIcon={<CameraAlt />}
          variant="contained"
          size="large"
          sx={{
            width: "100%",
          }}
        >
          Take Picture
        </Button>
      </div>
      <FrameList />
      {images.length > 0 && (
        <Link className="video-preview--wrapper" to="/preview">
          <img className="video-preview--image" src={images[0].data} />
          <PlayCircle
            sx={{
              position: "absolute",
              top: "calc(50% - 0.5em)",
              left: "calc(50% - 0.5em)",
              fontSize: "8em",
              opacity: 0.8,
              color: "white",
            }}
          />
        </Link>
      )}
    </Container>
  );
};

const FrameList = () => {
  const images = useSelector(selectImages);
  const dispatch = useAppDispatch();

  const handleDelete = (imageId: string) => {
    dispatch(removeImage(imageId));
  };

  return (
    <div className="frame-wrapper">
      <ul className="frames">
        {images.toReversed().map((image, i) => (
          <Frame
            image={image.data}
            key={i}
            index={images.length - i}
            onDelete={() => handleDelete(image.id)}
          />
        ))}
      </ul>
    </div>
  );
};

type IFrameProps = {
  image: string;
  index: number;
  onDelete: () => void;
};

const Frame = ({ image, index, onDelete }: IFrameProps) => {
  const { frameRate } = useSelector(selectProjectOptions);

  const calculateFrameTime = (index: number) => {
    return index / frameRate;
  };

  return (
    <li className="frame">
      <img src={image} className="thumbnail" />
      <div className="frame--index">{index}</div>
      <div className="frame--time">{calculateFrameTime(index)}s</div>
      <div className="frame--actions">
        <button
          className="frame-action frame-action--delete-frame"
          onClick={onDelete}
        >
          ❌
        </button>
      </div>
    </li>
  );
};

export default ProjectEditor;
