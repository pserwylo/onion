import {
  Button,
  Container,
  Grid2 as Grid,
  Paper,
  Typography,
} from "@mui/material";
import { useAppDispatch } from "../store/hooks.ts";
import {
  addProject,
  loadProjects,
  ProjectSummaryDTO,
  selectProjects,
} from "./homeSlice.ts";
import { Link, useNavigate } from "react-router";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import clsx from "clsx";

export const HomePage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const projects = useSelector(selectProjects);

  useEffect(() => {
    dispatch(loadProjects());
  }, [dispatch]);

  const handleNewMovie = async () => {
    const { payload: projectId } = await dispatch(addProject());
    navigate(`/project/${projectId}`);
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h1">Animation Time</Typography>
      <Typography variant="h2" className="flex-grow">
        Movies
      </Typography>
      <Grid container spacing={2}>
        <Grid size={6}>
          <Item className="flex flex-col">
            <Button onClick={handleNewMovie} className="w-full flex-grow">
              New Movie
            </Button>
          </Item>
        </Grid>
        {projects.toReversed().map((p) => (
          <Grid size={6} key={p.id}>
            <Item className="flex flex-col">
              <ProjectTile project={p} />
            </Item>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

type IProjectTileProps = {
  project: ProjectSummaryDTO;
};

const ProjectTile = ({ project }: IProjectTileProps) => {
  return (
    <Button
      component={Link}
      className="border-1 m-3 p-3 flex-grow"
      to={`/project/${project.id}`}
      style={{
        backgroundImage: project.thumbnail
          ? `url("${project.thumbnail}")`
          : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {project.thumbnail ? null : "Open Movie"}
    </Button>
  );
};

type IItemProps = {
  className?: string;
  children: React.ReactNode;
};

const Item = ({ className, children }: IItemProps) => {
  return <Paper className={clsx("min-h-40", className)}>{children}</Paper>;
};
