import {
  createAsyncThunk,
  createSelector,
  createSlice,
} from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store/store";
import Whammy from "ts-whammy";
import { blobToDataURL } from "./projectUtils.ts";
import { getDB, FrameDTO, ProjectDTO, SceneDTO } from "../store/db.ts";
import { v7 as uuid } from "uuid";

const MAX_ONION_SKINS = 3;
export const FRAME_RATES = [5, 15, 25];

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
    { frameId, duration }: { frameId: string; duration: number | undefined },
    { getState, dispatch },
  ) => {
    const frame = selectFrames(getState() as RootState).find(
      (i) => i.id === frameId,
    );

    if (frame === undefined) {
      return;
    }

    const newFrame: FrameDTO = {
      ...frame,
      duration,
    };

    dispatch(projectSlice.actions.updateFrame(newFrame));
    const db = await getDB();
    await db.put("frames", newFrame);
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

    console.log(`Loading project ${projectId} from db.`);
    const db = await getDB();
    const project = await db.get("projects", projectId);
    if (project === undefined) {
      return;
    }

    const frames = await db.getAllFromIndex("frames", "project", project.id);
    const scenes = await db.getAllFromIndex("scenes", "project", project.id);

    dispatch(
      projectSlice.actions.initProject({
        project,
        scenes,
        frames,
      }),
    );
  },
);

export const generatePreviewVideo = createAsyncThunk(
  "project/generatePreviewVideo",
  async (_: void, { getState, dispatch }) => {
    const { frameRate } = selectProject(getState() as RootState);
    const frames = selectFrames(getState() as RootState);
    const video = Whammy.fromImageArray(
      frames
        .map((frame) =>
          frame.duration
            ? new Array<string>(frameRate * frame.duration).fill(frame.image)
            : frame.image,
        )
        .flat(),
      frameRate,
    ) as Blob;
    const data = await blobToDataURL(video);

    dispatch(projectSlice.actions.updatePreviewVideo(data));
  },
);

export const addSceneImage = createAsyncThunk(
  "project/addSceneImage",
  async (
    { sceneId, image }: { sceneId: string; image: string },
    { dispatch },
  ) => {
    const db = await getDB();
    const scene = await db.get("scenes", sceneId);
    if (scene == null) {
      return;
    }

    scene.image = image;
    dispatch(projectSlice.actions.updateScene(scene));

    db.put("scenes", scene);
  },
);

export const addFrame = createAsyncThunk(
  "project/addFrame",
  async (image: string, { dispatch, getState }) => {
    const { id: project } = selectProject(getState() as RootState);
    const frame: FrameDTO = {
      id: uuid(),
      image,
      project,
    };
    dispatch(projectSlice.actions.addFrame(frame));

    // Do this last and don't wait for it - it slows the UX down too much.
    const db = await getDB();
    db.put("frames", frame);
  },
);

export const removeSelectedFrames = createAsyncThunk(
  "project/removeSelectedFrames",
  async (_: void, { dispatch, getState }) => {
    const framesToRemove = selectSelectedFrameIds(getState() as RootState);
    console.info(`Deleting frames: ${framesToRemove.join(", ")}`);

    // Do this last and don't wait for it - it slows the UX down too much.
    const db = await getDB();
    const tx = db.transaction("frames", "readwrite");
    for (const frameId of framesToRemove) {
      console.info(`Removing frame: ${frameId}`);
      tx.store.delete(frameId);
    }

    dispatch(projectSlice.actions.removeSelectedFrames());
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
    frames: [] as FrameDTO[],
    scenes: [] as SceneDTO[],
    selectedFrameIds: [] as string[],
    previewVideo: undefined as undefined | string,
  },
  reducers: {
    initProject: (
      state,
      action: PayloadAction<{
        project: ProjectDTO;
        scenes: SceneDTO[];
        frames: FrameDTO[];
      }>,
    ) => {
      state.frames = action.payload.frames;
      state.scenes = action.payload.scenes;
      state.project = action.payload.project;
    },
    updateFrame: (state, action: PayloadAction<FrameDTO>) => {
      const frame = action.payload;
      state.frames = state.frames.map((i) => (i.id === frame.id ? frame : i));
    },
    setProject: (state, action: PayloadAction<ProjectDTO>) => {
      state.project = action.payload;
    },
    setFrameSelected: (
      state,
      action: PayloadAction<{ frameId: string; selected: boolean }>,
    ) => {
      const { frameId, selected } = action.payload;
      if (selected && !state.selectedFrameIds.includes(frameId)) {
        state.selectedFrameIds.push(frameId);
      } else if (!selected && state.selectedFrameIds.includes(frameId)) {
        state.selectedFrameIds = state.selectedFrameIds.filter(
          (i) => i !== frameId,
        );
      }
    },
    addFrame: (state, action: PayloadAction<FrameDTO>) => {
      state.frames.push(action.payload);
    },
    removeSelectedFrames: (state) => {
      state.frames = state.frames.filter(
        (i) => !state.selectedFrameIds.includes(i.id),
      );
      state.selectedFrameIds = [];
    },
    updatePreviewVideo: (state, action: PayloadAction<string>) => {
      state.previewVideo = action.payload;
    },
    updateScene: (state, action: PayloadAction<SceneDTO>) => {
      const scene = action.payload;
      state.scenes = state.scenes.map((s) => (s.id === scene.id ? scene : s));
    },
  },
});

// Other code such as selectors can use the imported `RootState` type
export const selectProject = (state: RootState) => state.projects.project;
export const selectFrames = (state: RootState) => state.projects.frames;
export const selectScenes = (state: RootState) => state.projects.scenes;
export const selectPreviewVideo = (state: RootState) =>
  state.projects.previewVideo;
export const selectOnionSkinImages = createSelector(
  [selectFrames, selectProject],
  (frames, { numOnionSkins }) =>
    frames
      .slice(frames.length - Math.min(numOnionSkins, frames.length))
      .reverse(),
);
export const selectSelectedFrameIds = (state: RootState) =>
  state.projects.selectedFrameIds;

export const { setFrameSelected } = projectSlice.actions;
export default projectSlice.reducer;
