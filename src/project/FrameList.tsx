import { Link, useParams } from "react-router";
import { useSelector } from "react-redux";
import { removeImage, selectImages, selectProject } from "./projectSlice.ts";
import { useAppDispatch } from "../store/hooks.ts";
import { Box } from "@mui/material";
import { Settings } from "@mui/icons-material";
import clsx from "clsx";

type IFrameListProps = {
  className?: string;
};

const FrameList = ({ className }: IFrameListProps) => {
  const { projectId } = useParams<{ projectId: string }>();
  const images = useSelector(selectImages);
  const dispatch = useAppDispatch();

  const handleDelete = (imageId: string) => {
    dispatch(removeImage(imageId));
  };

  return (
    <div className={className}>
      <ul className="flex list-none overflow-x-scroll flex-nowrap flex-row-reverse gap-2">
        {images.toReversed().map((image, i) => (
          <li key={image.id}>
            <Link to={`/project/${projectId!}/frame/${image.id}`}>
              <Frame
                image={image.data}
                key={i}
                index={images.length - i}
                onDelete={() => handleDelete(image.id)}
              />
            </Link>
          </li>
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

const Frame = ({ image, index }: IFrameProps) => {
  const { frameRate } = useSelector(selectProject);

  const calculateFrameTime = (index: number) => {
    return (index / frameRate).toFixed(1);
  };

  return (
    <Box className="relative">
      <img
        alt="thumbnail of animation frame"
        src={image}
        className="w-24 max-w-24"
      />
      <OverlayText className="absolute bottom-1 left-1">{index}</OverlayText>
      <OverlayText className="absolute bottom-1 right-1">
        {calculateFrameTime(index)}s
      </OverlayText>
      <div className="frame--actions">
        <Settings
          sx={{
            position: "absolute",
            display: "none",
            "&:hover": {
              display: "block",
            },
          }}
        />
      </div>
    </Box>
  );
};

type IOverlayText = {
  children: React.ReactNode;
  className?: string;
};

const OverlayText = ({ children, className }: IOverlayText) => (
  <Box
    className={clsx("text-white", className)}
    sx={{
      textShadow: "black 0 0 2px",
    }}
  >
    {children}
  </Box>
);

export default FrameList;
