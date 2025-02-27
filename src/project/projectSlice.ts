import {
  createAsyncThunk,
  createSelector,
  createSlice,
} from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store/store";
import Whammy from "ts-whammy";
import { blobToDataURL } from "./projectUtils.ts";
import { getDB, ImageDTO, ProjectDTO } from "../store/db.ts";
import { v7 as uuid } from "uuid";

const MAX_ONION_SKINS = 3;
const FRAME_RATES = [5, 15, 25];

export const initialiseNewProject = createAsyncThunk(
  "project/initialiseNewProject",
  async () => {
    const project: ProjectDTO = {
      id: uuid(),
      frameRate: FRAME_RATES[0],
      numOnionSkins: 1,
    };

    const db = await getDB();
    await db.put("projects", project);
    return project.id;
  },
);

export const toggleOnionSkin = createAsyncThunk(
  "project/toggleOnionSkin",
  async (_: void, { getState, dispatch }) => {
    const project = selectProject(getState() as RootState);
    const newProject: ProjectDTO = {
      ...project,
      numOnionSkins: (project.numOnionSkins + 1) % MAX_ONION_SKINS,
    };
    dispatch(projectSlice.actions.setProject(newProject));
    const db = await getDB();
    await db.put("projects", newProject);
  },
);

export const setFrameDuration = createAsyncThunk(
  "project/setFrameDuration",
  async (
    { imageId, duration }: { imageId: string; duration: number | undefined },
    { getState, dispatch },
  ) => {
    const image = selectImages(getState() as RootState).find(
      (i) => i.id === imageId,
    );

    if (image === undefined) {
      return;
    }

    const newImage: ImageDTO = {
      ...image,
      duration,
    };

    dispatch(projectSlice.actions.updateImage(newImage));
    const db = await getDB();
    await db.put("images", newImage);
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
    const db = await getDB();
    await db.put("projects", newProject);
  },
);

export const loadProject = createAsyncThunk(
  "project/loadProject",
  async (projectId: string, { dispatch, getState }) => {
    const existingProject = selectProject(getState() as RootState);
    if (existingProject?.id === projectId) {
      console.debug(`No need to load project ${projectId}, already loaded.`);
      return;
    }

    const db = await getDB();
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

export const generatePreviewVideo = createAsyncThunk(
  "project/appendImageAndRefreshPreviewVideo",
  async (_: void, { getState, dispatch }) => {
    const { frameRate } = selectProject(getState() as RootState);
    const images = selectImages(getState() as RootState);
    const video = Whammy.fromImageArray(
      images
        .map((i) =>
          i.duration
            ? new Array<string>(frameRate * i.duration).fill(i.data)
            : i.data,
        )
        .flat(),
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
    dispatch(projectSlice.actions.addImage(image));

    // Do this last and don't wait for it - it slows the UX down too much.
    const db = await getDB();
    db.put("images", image);
  },
);

export const removeSelectedImages = createAsyncThunk(
  "project/removeSelectedImages",
  async (_: void, { dispatch, getState }) => {
    const imagesToRemove = selectSelectedImageIds(getState() as RootState);
    console.info(`Deleting frames: ${imagesToRemove.join(", ")}`);

    // Do this last and don't wait for it - it slows the UX down too much.
    const db = await getDB();
    const tx = db.transaction("images", "readwrite");
    for (const imageId of imagesToRemove) {
      console.info(`Removing frame: ${imageId}`);
      tx.store.delete(imageId);
    }

    dispatch(projectSlice.actions.removeSelectedImages());
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
    images: [] as ImageDTO[],
    selectedImageIds: [] as string[],
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
    updateImage: (state, action: PayloadAction<ImageDTO>) => {
      const image = action.payload;
      state.images = state.images.map((i) => (i.id === image.id ? image : i));
    },
    setProject: (state, action: PayloadAction<ProjectDTO>) => {
      state.project = action.payload;
    },
    setImageSelected: (
      state,
      action: PayloadAction<{ imageId: string; selected: boolean }>,
    ) => {
      const { imageId, selected } = action.payload;
      if (selected && !state.selectedImageIds.includes(imageId)) {
        state.selectedImageIds.push(imageId);
      } else if (!selected && state.selectedImageIds.includes(imageId)) {
        state.selectedImageIds = state.selectedImageIds.filter(
          (i) => i !== imageId,
        );
      }
    },
    addImage: (state, action: PayloadAction<ImageDTO>) => {
      state.images.push(action.payload);
    },
    removeImage: (state, action: PayloadAction<string>) => {
      state.images = state.images.filter((i) => i.id !== action.payload);
    },
    removeSelectedImages: (state) => {
      state.images = state.images.filter(
        (i) => !state.selectedImageIds.includes(i.id),
      );
      state.selectedImageIds = [];
    },
    updatePreviewVideo: (state, action: PayloadAction<string>) => {
      state.previewVideo = action.payload;
    },
  },
});

// Other code such as selectors can use the imported `RootState` type
export const selectProject = (state: RootState) => state.projects.project;
export const selectImages = (state: RootState) => state.projects.images;
export const selectPreviewVideo = (state: RootState) =>
  state.projects.previewVideo;
export const selectOnionSkinImages = createSelector(
  [selectImages, selectProject],
  (images, { numOnionSkins }) =>
    images
      .slice(images.length - Math.min(numOnionSkins, images.length))
      .reverse(),
);
export const selectSelectedImageIds = (state: RootState) =>
  state.projects.selectedImageIds;

export const { setImageSelected } = projectSlice.actions;
export default projectSlice.reducer;
