import {
  createAsyncThunk,
  createSelector,
  createSlice,
} from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store/store";
import { getDB, ProjectDTO, SceneDTO } from "../store/db.ts";
import { v7 as uuid } from "uuid";
import { FRAME_RATES } from "../project/projectSlice.ts";

export const addProject = createAsyncThunk(
  "project/initialiseNewProject",
  async (hasScenes: boolean, { dispatch }) => {
    const project: ProjectDTO = {
      id: uuid(),
      frameRate: FRAME_RATES[0],
      numOnionSkins: 1,
      title: "Movie",
    };

    const db = await getDB();
    await db.put("projects", project);

    if (hasScenes) {
      const scenes: SceneDTO[] = [];
      for (let i = 0; i < 4; i++) {
        scenes.push({
          id: uuid(),
          project: project.id,
        });
      }

      for (const scene of scenes) {
        await db.put("scenes", scene);
      }
    }

    dispatch(
      homeSlice.actions.addProject({
        ...project,
        thumbnail: undefined,
      }),
    );

    return project.id;
  },
);

export const loadProjectThumbnail = async (projectId: string) => {
  return (await thumbFromFrame(projectId)) ?? (await thumbFromScene(projectId));
};

const thumbFromFrame = async (projectId: string) => {
  const db = await getDB();
  const framesTx = db.transaction("frames");
  const framesStore = framesTx.objectStore("frames");
  const framesIndex = framesStore.index("project");

  const range = IDBKeyRange.only(projectId);
  let cursor = await framesIndex.openCursor(range);
  while (cursor) {
    const frame = cursor.value;
    if (frame.image) {
      return frame.image;
    }
    cursor = await cursor.continue();
  }

  return undefined;
};

const thumbFromScene = async (projectId: string) => {
  const db = await getDB();
  const scenesTx = db.transaction("scenes");
  const scenesStore = scenesTx.objectStore("scenes");
  const scenesIndex = scenesStore.index("project");

  const range = IDBKeyRange.only(projectId);
  let cursor = await scenesIndex.openCursor(range);
  while (cursor) {
    const scene = cursor.value;
    if (scene.image) {
      return scene.image;
    }
    cursor = await cursor.continue();
  }

  return undefined;
};

export const loadProjects = createAsyncThunk(
  "project/loadProject",
  async (_: void, { dispatch }) => {
    const db = await getDB();
    const plainProjects = await db.getAll("projects");
    const projectsWithThumbs: ProjectSummaryDTO[] = [];

    let thumbnail: string | undefined;
    for await (const project of plainProjects) {
      const projectId = project.id;
      thumbnail =
        (await thumbFromFrame(project.id)) ??
        (await thumbFromScene(project.id));

      if (thumbnail) {
        console.log(`${projectId}: found thumbnail.`);
      } else {
        console.log(`${projectId}: no thumbnail found.`);
      }

      projectsWithThumbs.push({
        ...project,
        thumbnail,
      });
    }

    dispatch(homeSlice.actions.initProjects(projectsWithThumbs));
  },
);

export type ProjectSummaryDTO = ProjectDTO & {
  thumbnail: string | undefined;
};

export const homeSlice = createSlice({
  name: "home",
  initialState: {
    projects: [] as ProjectSummaryDTO[],
  },
  reducers: {
    initProjects: (state, action: PayloadAction<ProjectSummaryDTO[]>) => {
      state.projects = action.payload;
    },
    addProject: (state, action: PayloadAction<ProjectSummaryDTO>) => {
      state.projects.push(action.payload);
    },
  },
});

// Other code such as selectors can use the imported `RootState` type
const selectAllProjects = ({ home }: RootState) => home.projects;
export const selectProjects = createSelector(
  [selectAllProjects],
  (projects) => ({
    projects: projects.filter((p) => !p.demo).toReversed(),
    examples: projects.filter((p) => p.demo),
  }),
);

export default homeSlice.reducer;
