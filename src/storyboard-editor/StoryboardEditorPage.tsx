import {
  Box,
  Button,
  ButtonProps,
  Container,
  Grid2 as Grid,
  IconButton,
  styled,
  Typography,
} from "@mui/material";
import { Link, LinkProps } from "react-router";
import { useSelector } from "react-redux";
import { useMemo, useState } from "react";
import clsx from "clsx";
import {
  selectScenes,
  makeSelectSceneSummary,
  selectProject,
  updateTitle,
} from "../project/projectSlice.ts";
import { SceneDTO } from "../store/db.ts";
import {
  AccessTime,
  BurstMode,
  CameraAlt,
  Delete,
  Help,
  PlayCircle,
} from "@mui/icons-material";
import { OverlayText } from "../project/FrameList.tsx";
import PageHeading from "../components/PageHeading.tsx";
import { useProjectRoute } from "../hooks/useProjectRoute.ts";
import { useAppDispatch } from "../store/hooks.ts";

export const StoryboardEditorPage = () => {
  const { projectId } = useProjectRoute();
  const dispatch = useAppDispatch();
  const scenes = useSelector(selectScenes);
  const [showHelp, setShowHelp] = useState(false);
  const project = useSelector(selectProject);

  const hasScene = useMemo(() => {
    return scenes.some((s) => s.image !== undefined);
  }, [scenes]);

  return (
    <Container maxWidth="sm">
      <PageHeading
        title={project ? project.title : ""}
        subtitle="Storyboard"
        onTitleChange={
          project.demo ? undefined : (title) => dispatch(updateTitle(title))
        }
        backLink="/"
        actions={
          hasScene ? (
            <IconButton onClick={() => setShowHelp(!showHelp)}>
              <Help />
            </IconButton>
          ) : undefined
        }
      />
      {(!hasScene || showHelp) && (
        <Typography className="pt-4">
          A storyboard is a way of planning animated films, movies, or
          television shows. A storyboard shows examples of what the artist wants
          to make before they are animated. It also lets artists organize their
          stories before they start to make the animation.
          <a href="https://simple.wikipedia.org/wiki/Storyboard">
            <sup>[1]</sup>
          </a>
        </Typography>
      )}
      <Box className="pt-4 flex gap-4">
        <Button
          startIcon={<PlayCircle />}
          variant="contained"
          size="small"
          component={Link}
          to={`/project/${projectId}/preview`}
        >
          Watch
        </Button>
        <Button
          startIcon={<Delete />}
          variant="outlined"
          color="error"
          size="small"
          component={Link}
          to={`/project/${projectId}/delete`}
        >
          Delete
        </Button>
      </Box>
      <Grid container spacing={1} className="my-8">
        {scenes.map((s, i) => (
          <Grid size={6} key={s.id}>
            <Item className="flex flex-col">
              <SceneTile projectId={projectId} scene={s} index={i} />
            </Item>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

type ISceneButtonProps = {
  hasImage?: boolean;
};

const SceneButton: React.FC<ButtonProps & ISceneButtonProps & LinkProps> =
  styled(Button)<ISceneButtonProps>((props) => ({
    border: "solid 3px",
    borderColor: props.hasImage ? "#41403E" : "#d3d3d3",
    borderTopLeftRadius: "255px 8px",
    borderTopRightRadius: "10px 225px",
    borderBottomRightRadius: "225px 10px",
    borderBottomLeftRadius: "8px 255px",
    "&:hover": {
      boxShadow: "2px 8px 4px -6px hsla(0,0%,0%,.3)",
    },
  }));

type ISceneTileProps = {
  projectId: string;
  scene: SceneDTO;
  index: number;
};

const SceneTile = ({ projectId, scene, index }: ISceneTileProps) => {
  const sceneDetails = useSelector(makeSelectSceneSummary(index.toString()));

  if (sceneDetails === undefined) {
    return null;
  }

  const renderSceneDetails = () => {
    return (
      <Box className="absolute bottom-2 right-2 flex gap-4 bg-black/20 px-2 py-1 rounded">
        <OverlayText>
          <BurstMode /> {sceneDetails.frames.length}
        </OverlayText>
        <OverlayText className="lowercase">
          <AccessTime /> {sceneDetails.duration}s
        </OverlayText>
      </Box>
    );
  };

  return (
    <SceneButton
      component={Link}
      hasImage={Boolean(scene.image)}
      className="border-1 m-3 p-3 flex-grow relative"
      variant="outlined"
      to={`/project/${projectId}/scene/${index}`}
      style={{
        backgroundImage: scene.image ? `url("${scene.image}")` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {scene.image ? renderSceneDetails() : <CameraAlt />}
    </SceneButton>
  );
};

type IItemProps = {
  className?: string;
  children: React.ReactNode;
};

const Item = ({ className, children }: IItemProps) => {
  return <div className={clsx("min-h-40", className)}>{children}</div>;
};
