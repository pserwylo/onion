import {
  createAsyncThunk,
  createSelector,
  createSlice,
} from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store/store";
import Whammy from "ts-whammy";
import { blobToDataURL } from "./projectUtils.ts";
import { db, ImageDTO, ProjectDTO } from "../store/db.ts";
import { v7 as uuid } from "uuid";

const MAX_ONION_SKINS = 3;
const FRAME_RATES = [5, 15, 25];

export const toggleOnionSkin = createAsyncThunk(
  "project/toggleOnionSkin",
  async (_: void, { getState, dispatch }) => {
    const project = selectProject(getState() as RootState);
    const newProject: ProjectDTO = {
      ...project,
      numOnionSkins: (project.numOnionSkins + 1) % MAX_ONION_SKINS,
    };
    dispatch(projectSlice.actions.setProject(newProject));
    await db.put("projects", newProject);
  },
);

export const toggleFrameRate = createAsyncThunk(
  "project/toggleFrameRate",
  async (_: void, { getState, dispatch }) => {
    const project = selectProject(getState() as RootState);
    // Even if this is -1 for some reason, the +1 in the next line will make it safely get to 0.
    const i = FRAME_RATES.indexOf(project.frameRate);
    const newProject: ProjectDTO = {
      ...project,
      frameRate: FRAME_RATES[(i + 1) % FRAME_RATES.length],
    };

    dispatch(projectSlice.actions.setProject(newProject));
    await db.put("projects", newProject);
  },
);

export const loadProject = createAsyncThunk(
  "project/loadProject",
  async (projectId: string, { dispatch }) => {
    const project = await db.get("projects", projectId);
    if (project !== undefined) {
      const images = await db.getAll("images");
      dispatch(
        projectSlice.actions.initProject({
          project,
          images,
        }),
      );
    }
  },
);

export const loadFrame = createAsyncThunk(
  "project/loadFrame",
  async (frameId: string, { dispatch }) => {
    const frame = await db.get("images", frameId);
    if (frame === undefined) {
      return;
    }

    dispatch(projectSlice.actions.setFrameToEdit(frame));
  },
);

export const generatePreviewVideo = createAsyncThunk(
  "project/appendImageAndRefreshPreviewVideo",
  async (_: void, { getState, dispatch }) => {
    const { frameRate } = selectProject(getState() as RootState);
    const images = selectImages(getState() as RootState);
    const video = Whammy.fromImageArray(
      images.map((i) => i.data),
      frameRate,
    ) as Blob;
    const data = await blobToDataURL(video);

    dispatch(projectSlice.actions.updatePreviewVideo(data));
  },
);

export const addImage = createAsyncThunk(
  "project/addImage",
  async (data: string, { dispatch, getState }) => {
    const { id: project } = selectProject(getState() as RootState);
    const image: ImageDTO = {
      id: uuid(),
      data,
      project,
    };
    await db.put("images", image);
    dispatch(projectSlice.actions.addImage(image));
  },
);

export const removeImage = createAsyncThunk(
  "project/removeImage",
  async (imageId: string, { dispatch }) => {
    dispatch(projectSlice.actions.removeImage(imageId));

    await db.delete("images", imageId);
  },
);

export const projectSlice = createSlice({
  name: "project",
  initialState: {
    project: {
      id: "1",
      frameRate: 5,
      numOnionSkins: 1,
    } as ProjectDTO,
    frameToEdit: undefined as ImageDTO | undefined,
    images: [] as ImageDTO[],
    previewVideo: undefined as undefined | string,
  },
  reducers: {
    initProject: (
      state,
      action: PayloadAction<{ project: ProjectDTO; images: ImageDTO[] }>,
    ) => {
      state.images = action.payload.images;
      state.project = action.payload.project;
    },
    setProject: (state, action: PayloadAction<ProjectDTO>) => {
      state.project = action.payload;
    },
    addImage: (state, action: PayloadAction<ImageDTO>) => {
      state.images.push(action.payload);
    },
    removeImage: (state, action: PayloadAction<string>) => {
      state.images = state.images.filter((i) => i.id !== action.payload);
    },
    updatePreviewVideo: (state, action: PayloadAction<string>) => {
      state.previewVideo = action.payload;
    },
    setFrameToEdit: (state, action: PayloadAction<ImageDTO>) => {
      state.frameToEdit = action.payload;
    },
  },
});

// Other code such as selectors can use the imported `RootState` type
export const selectProject = (state: RootState) => state.projects.project;
export const selectImages = (state: RootState) => state.projects.images;
export const selectFrameToEdit = (state: RootState) =>
  state.projects.frameToEdit;
export const selectPreviewVideo = (state: RootState) =>
  state.projects.previewVideo;
export const selectOnionSkinImages = createSelector(
  [selectImages, selectProject],
  (images, { numOnionSkins }) =>
    images
      .slice(images.length - Math.min(numOnionSkins, images.length))
      .reverse(),
);

export default projectSlice.reducer;
