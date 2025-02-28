import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store/store";
import { getDB, ProjectDTO } from "../store/db.ts";
import { v7 as uuid } from "uuid";
import { FRAME_RATES } from "../project/projectSlice.ts";

export const addProject = createAsyncThunk(
  "project/initialiseNewProject",
  async (_: void, { dispatch }) => {
    const project: ProjectDTO = {
      id: uuid(),
      frameRate: FRAME_RATES[0],
      numOnionSkins: 1,
    };

    const db = await getDB();
    await db.put("projects", project);

    dispatch(
      homeSlice.actions.addProject({
        ...project,
        thumbnail: undefined,
      }),
    );

    return project.id;
  },
);

export const loadProjects = createAsyncThunk(
  "project/loadProject",
  async (_: void, { dispatch }) => {
    const db = await getDB();
    const plainProjects = await db.getAll("projects");
    const projectsWithThumbs: ProjectSummaryDTO[] = [];
    const tx = db.transaction("images");
    const store = tx.objectStore("images");
    const index = store.index("project");

    for (const project of plainProjects) {
      const range = IDBKeyRange.only(project.id);
      const req = await index.openCursor(range);
      const image = req?.value;
      projectsWithThumbs.push({
        ...project,
        thumbnail: image?.data,
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
export const selectProjects = ({ home }: RootState) => home.projects;

export default homeSlice.reducer;
