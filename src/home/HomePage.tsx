import {
  Button,
  Container,
  Grid2 as Grid,
  Paper,
  Typography,
} from "@mui/material";
import { useAppDispatch } from "../store/hooks.ts";
import {
  loadProjects,
  ProjectSummaryDTO,
  selectProjects,
} from "./homeSlice.ts";
import { Link } from "react-router";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import clsx from "clsx";

export const HomePage = () => {
  const dispatch = useAppDispatch();
  const { projects, examples } = useSelector(selectProjects);

  useEffect(() => {
    dispatch(loadProjects());
  }, [dispatch]);

  return (
    <Container maxWidth="sm" className="flex flex-col gap-4">
      <Typography variant="h1">Animation Time</Typography>
      <Typography variant="h2" className="flex-grow">
        Your Movies
      </Typography>
      <Grid container spacing={2}>
        <Grid size={6}>
          <Item className="flex flex-col">
            <Button component={Link} to="/new" className="w-full flex-grow">
              New Movie
            </Button>
          </Item>
        </Grid>
        {projects.map((p) => (
          <Grid size={6} key={p.id}>
            <Item className="flex flex-col">
              <ProjectTile project={p} />
            </Item>
          </Grid>
        ))}
      </Grid>
      <Typography variant="h2" className="flex-grow">
        Examples
      </Typography>
      <Grid container spacing={2}>
        {examples.map((p) => (
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
      className="border-1 m-3 p-3 flex-grow relative"
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
      <Typography className="absolute left-0 bottom-0 text-white px-4 py-2 bg-slate-800/25">
        {project.title}
      </Typography>
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
