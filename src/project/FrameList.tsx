import { useNavigate } from "react-router";
import { useSelector } from "react-redux";
import {
  removeSelectedFrames,
  selectFrames,
  selectSelectedFrameIds,
  setFrameSelected,
} from "./projectSlice.ts";
import { useAppDispatch } from "../store/hooks.ts";
import { Box, Button, Checkbox } from "@mui/material";
import { Delete, Edit, Pause, Settings } from "@mui/icons-material";
import clsx from "clsx";
import { FrameDTO, ProjectDTO } from "../store/db.ts";

type IFrameListProps = {
  project: ProjectDTO;
  className?: string;
};

const FrameList = ({ project, className }: IFrameListProps) => {
  const frames = useSelector(selectFrames);
  const dispatch = useAppDispatch();
  const selectedFrameIds = useSelector(selectSelectedFrameIds);
  const navigate = useNavigate();

  const handleDelete = () => {
    dispatch(removeSelectedFrames());
  };

  const handleEdit = () => {
    if (selectedFrameIds.length !== 1) {
      return;
    }

    const id = selectedFrameIds[0];
    const url = `/project/${project.id!}/frame/${id}`;
    navigate(url);
  };

  let frameTime = 0;
  return (
    <div className={className}>
      <ul className="flex list-none overflow-x-scroll flex-nowrap gap-2">
        {frames.map((frame, i) => (
          <li key={frame.id}>
            <Frame
              frame={frame}
              time={
                (frameTime =
                  frameTime +
                  (frame.duration ? frame.duration : 1 / project.frameRate))
              }
              key={i}
              index={frames.length - i}
              selected={selectedFrameIds.includes(frame.id)}
            />
          </li>
        ))}
      </ul>

      {selectedFrameIds.length > 0 && (
        <div className="mt-2 mb-4 flex gap-2">
          <Button
            onClick={handleDelete}
            startIcon={<Delete />}
            variant="outlined"
            color="error"
          >
            Delete {selectedFrameIds.length} Frame
            {selectedFrameIds.length === 1 ? "" : "s"}
          </Button>
          {selectedFrameIds.length === 1 && (
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
  frame: FrameDTO;
  time: number;
  index: number;
  selected: boolean;
};

const Frame = ({ frame, index, time, selected }: IFrameProps) => {
  const selectedFrameIds = useSelector(selectSelectedFrameIds);
  const isAnySelected = selectedFrameIds.length > 0;
  const dispatch = useAppDispatch();

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
          setFrameSelected({
            frameId: frame.id,
            selected: !selected,
          }),
        )
      }
    >
      <img
        alt="thumbnail of animation frame"
        src={frame.image}
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
      {frame.duration !== undefined && frame.duration > 0 && (
        <OverlayText className="absolute top-1 left-1">
          <Pause />
        </OverlayText>
      )}
      <OverlayText className="absolute bottom-1 left-2">{index}</OverlayText>
      <OverlayText className="absolute bottom-1 right-2">
        {time.toFixed(1)}s
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
