import {
  Box,
  Button,
  Container,
  Grid2 as Grid,
  IconButton,
  styled,
  Typography,
} from "@mui/material";
import { useAppDispatch } from "../store/hooks.ts";
import { Link, useNavigate, useParams } from "react-router";
import { useSelector } from "react-redux";
import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { loadProject, selectScenes } from "../project/projectSlice.ts";
import { SceneDTO } from "../store/db.ts";
import { CameraAlt, Help } from "@mui/icons-material";

export const StoryboardEditorPage = () => {
  const dispatch = useAppDispatch();
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const scenes = useSelector(selectScenes);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    if (projectId) {
      dispatch(loadProject({ projectId }));
    }
  }, [dispatch, projectId]);

  const hasScene = useMemo(() => {
    return scenes.some((s) => s.image !== undefined);
  }, [scenes]);

  if (!projectId) {
    navigate("/");
    return null;
  }

  return (
    <Container maxWidth="sm">
      <Typography variant="h1">Animation Time</Typography>
      <Box className="flex gap-4">
        <Typography variant="h2" className="flex-grow">
          Storyboard
        </Typography>
        <IconButton onClick={() => setShowHelp(!showHelp)}>
          <Help />
        </IconButton>
      </Box>
      {(!hasScene || showHelp) && (
        <Typography>
          A storyboard is a way of planning animated films, movies, or
          television shows. A storyboard shows examples of what the artist wants
          to make before they are animated. It also lets artists organize their
          stories before they start to make the animation.
        </Typography>
      )}
      <Grid container spacing={1}>
        {scenes.map((s) => (
          <Grid size={6} key={s.id}>
            <Item className="flex flex-col">
              <SceneTile projectId={projectId} scene={s} />
            </Item>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

const SceneButton = styled(Button)({
  border: "solid 3px #41403E",
  borderTopLeftRadius: "255px 8px",
  borderTopRightRadius: "10px 225px",
  borderBottomRightRadius: "225px 10px",
  borderBottomLeftRadius: "8px 255px",
  "&:hover": {
    boxShadow: "2px 8px 4px -6px hsla(0,0%,0%,.3)",
  },
}) as typeof Button; // https://github.com/mui/material-ui/issues/22728

type ISceneTileProps = {
  projectId: string;
  scene: SceneDTO;
};

const SceneTile = ({ projectId, scene }: ISceneTileProps) => {
  return (
    <SceneButton
      component={Link}
      className="border-1 m-3 p-3 flex-grow"
      variant="outlined"
      to={`/project/${projectId}/scene/${scene.id}`}
      style={{
        backgroundImage: scene.image ? `url("${scene.image}")` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {scene.image ? null : <CameraAlt />}
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
