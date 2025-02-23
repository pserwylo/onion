import { useNavigate, useParams } from "react-router";
import { useSelector } from "react-redux";
import {
  removeSelectedImages,
  selectImages,
  selectProject,
  selectSelectedImageIds,
  setImageSelected,
} from "./projectSlice.ts";
import { useAppDispatch } from "../store/hooks.ts";
import { Box, Button, Checkbox } from "@mui/material";
import { Delete, Edit, Settings } from "@mui/icons-material";
import clsx from "clsx";

type IFrameListProps = {
  className?: string;
};

const FrameList = ({ className }: IFrameListProps) => {
  const { projectId } = useParams<{ projectId: string }>();
  const images = useSelector(selectImages);
  const dispatch = useAppDispatch();
  const selectedImageIds = useSelector(selectSelectedImageIds);
  const navigate = useNavigate();

  const handleDelete = () => {
    dispatch(removeSelectedImages());
  };

  const handleEdit = () => {
    if (selectedImageIds.length !== 1) {
      return;
    }

    const id = selectedImageIds[0];
    const url = `/project/${projectId!}/frame/${id}`;
    navigate(url);
  };

  return (
    <div className={className}>
      <ul className="flex list-none overflow-x-scroll flex-nowrap flex-row-reverse gap-2">
        {images.toReversed().map((image, i) => (
          <li key={image.id}>
            <Frame
              imageId={image.id}
              imageData={image.data}
              key={i}
              index={images.length - i}
              selected={selectedImageIds.includes(image.id)}
            />
          </li>
        ))}
      </ul>

      {selectedImageIds.length > 0 && (
        <div className="mt-2 mb-4 flex gap-2">
          <Button
            onClick={handleDelete}
            startIcon={<Delete />}
            variant="outlined"
            color="error"
          >
            Delete {selectedImageIds.length} Frame
            {selectedImageIds.length === 1 ? "" : "s"}
          </Button>
          {selectedImageIds.length === 1 && (
            <Button
              onClick={handleEdit}
              startIcon={<Edit />}
              variant="outlined"
            >
              Edit Frame
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

type IFrameProps = {
  imageId: string;
  imageData: string;
  index: number;
  selected: boolean;
};

const Frame = ({ imageId, imageData, index, selected }: IFrameProps) => {
  const { frameRate } = useSelector(selectProject);
  const selectedImageIds = useSelector(selectSelectedImageIds);
  const isAnySelected = selectedImageIds.length > 0;
  const dispatch = useAppDispatch();

  const calculateFrameTime = (index: number) => {
    return (index / frameRate).toFixed(1);
  };

  return (
    <Box
      className={clsx(
        "relative cursor-pointer",
        selected ? "border-3 border-blue-500" : "m-[3px]",
      )}
      sx={{
        "& .MuiCheckbox-root": {
          display: isAnySelected ? undefined : "none",
        },
        "&:hover .MuiCheckbox-root": {
          display: "inline",
        },
      }}
      onClick={() =>
        dispatch(
          setImageSelected({
            imageId,
            selected: !selected,
          }),
        )
      }
    >
      <img
        alt="thumbnail of animation frame"
        src={imageData}
        className="w-24 max-w-24"
      />
      <Checkbox
        checked={selected}
        className="text-white !absolute top-0 right-0"
        size="small"
        disabled
        sx={{
          color: "white",
          "&.Mui-checked": {
            color: "white",
          },
        }}
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
