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

type ILoadProjectArgs = {
  projectId: string;
  sceneIndex?: string;
  frameId?: string;
};

export const loadProject = createAsyncThunk(
  "project/loadProject",
  async (
    { projectId, sceneIndex, frameId }: ILoadProjectArgs,
    { dispatch },
  ) => {
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
        sceneIndex,
        frameId,
      }),
    );
  },
);

type IGeneratePreviewVideoArgs = {
  projectId: string;
  sceneIndex?: string;
};

const generateVideoFromFrames = async (
  frames: FrameDTO[],
  frameRate: number,
) => {
  console.log("generateVideoFromFrames: About to generate video. ", {
    frames,
    frameRate,
  });

  const finalFrames = frames
    .map((frame) =>
      frame.duration
        ? new Array<string>(frameRate * frame.duration).fill(frame.image)
        : frame.image,
    )
    .flat();

  console.log(
    "Final frames for generation, after taking into account frame duration: ",
    finalFrames,
  );

  const video = Whammy.fromImageArray(finalFrames, frameRate) as Blob;
  console.log("Generated video blob: ", video);
  const videoDataUrl = await blobToDataURL(video);
  console.log("Genrerated data URL: ", videoDataUrl);
  return videoDataUrl;
};

export const generatePreviewVideo = createAsyncThunk(
  "project/generatePreviewVideo",
  async (
    { projectId, sceneIndex }: IGeneratePreviewVideoArgs,
    { getState, dispatch },
  ) => {
    dispatch(projectSlice.actions.updatePreviewVideo());
    await dispatch(loadProject({ projectId, sceneIndex }));
    const frames = selectFrames(getState() as RootState);
    const scenes = selectScenes(getState() as RootState);
    const { frameRate } = selectProject(getState() as RootState);

    let video: string;
    if (scenes.length === 0) {
      // Simple movie, no scenes
      video = await generateVideoFromFrames(frames, frameRate);
    } else if (sceneIndex !== undefined) {
      // Individual scene.
      const scene = scenes[parseInt(sceneIndex, 10)];
      const sceneFrames = frames.filter((f) => f.scene === scene.id);
      video = await generateVideoFromFrames(sceneFrames, frameRate);
    } else {
      // Full movie, including scenes (will render storyboards in place of scene with no frames).
      const framesToRender: FrameDTO[] = [];
      for (let i = 0; i < scenes.length; i++) {
        const scene = scenes[i];

        const sceneFrames = frames.filter((f) => f.scene === scene.id);

        if (sceneFrames.length === 0) {
          // Skip the scene if there is no image in the storyboard.
          // We don't allow frames to be added when there is no scene image, instead
          // we redirect them to the "take photo of scene for storyboard" screen.
          if (!scene.image) {
            continue;
          }

          // Render the storyboard picture for 2 seconds in lieu of any frames being available.
          framesToRender.push({
            scene: scene.id,
            image: scene.image,
            project: scene.project,
            duration: 2,
            id: uuid(),
          } as FrameDTO);
        } else {
          framesToRender.push(...sceneFrames);
        }
      }

      video = await generateVideoFromFrames(framesToRender, frameRate);
    }

    dispatch(projectSlice.actions.updatePreviewVideo(video));
  },
);

export const addSceneImage = createAsyncThunk(
  "project/addSceneImage",
  async (image: string, { getState, dispatch }) => {
    const db = await getDB();
    const scene = selectScene(getState() as RootState);
    if (scene == null) {
      console.log("No scene found, not adding image");
      return;
    }

    console.log("Adding image to scene: ", { scene, image });

    const updatedScene: SceneDTO = {
      ...scene,
      image,
    };

    console.log("Updated scene: ", { updatedScene });
    dispatch(projectSlice.actions.updateScene(updatedScene));

    db.put("scenes", updatedScene);
  },
);

export const addFrame = createAsyncThunk(
  "project/addFrame",
  async (image: string, { dispatch, getState }) => {
    const { id: project } = selectProject(getState() as RootState);
    const scene = selectScene(getState() as RootState);
    const frame: FrameDTO = {
      id: uuid(),
      image,
      project,
      scene: scene?.id,
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
    frameId: undefined as string | undefined,
    sceneIndex: undefined as string | undefined,
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
        frameId?: string;
        sceneIndex?: string;
      }>,
    ) => {
      state.frames = action.payload.frames;
      state.scenes = action.payload.scenes;
      state.project = action.payload.project;
      state.frameId = action.payload.frameId;
      state.sceneIndex = action.payload.sceneIndex;
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
    updatePreviewVideo: (state, action: PayloadAction<string | undefined>) => {
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

const selectSceneIndex = (state: RootState) =>
  state.projects.sceneIndex
    ? parseInt(state.projects.sceneIndex, 10)
    : undefined;
const selectFrameId = (state: RootState) => state.projects.frameId;

export const selectScene = createSelector(
  [selectSceneIndex, selectScenes],
  (sceneIndex, scenes) => {
    return sceneIndex !== undefined && scenes.length > sceneIndex
      ? scenes[sceneIndex]
      : undefined;
  },
);

export const selectFrame = createSelector(
  [selectFrameId, selectFrames],
  (frameId, frames) => {
    return frames.find((s) => s.id === frameId);
  },
);

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

export const makeSelectSceneSummary =
  (index: string | undefined) => (state: RootState) => {
    if (index === undefined) {
      return undefined;
    }

    const i = parseInt(index, 10);

    const project = selectProject(state);
    const scene = selectScenes(state)[i];
    const frames = selectFrames(state).filter((f) => f.scene === scene.id);
    const duration = frames
      .reduce(
        (acc, f) => acc + (f.duration ? f.duration : 1 / project.frameRate),
        0,
      )
      .toFixed(1);

    return {
      scene,
      frames,
      duration,
    };
  };

export const { setFrameSelected } = projectSlice.actions;
export default projectSlice.reducer;
