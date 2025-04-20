import {
  createAsyncThunk,
  createSelector,
  createSlice,
} from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store/store";
import Whammy from "ts-whammy";
import { blobToDataURL } from "./projectUtils.ts";
import {
  getDB,
  FrameDTO,
  ProjectDTO,
  SceneDTO,
  MetadataJson,
} from "../store/db.ts";
import { v7 as uuid } from "uuid";
import { downloadZip, InputWithSizeMeta } from "client-zip";
import "core-js/actual/typed-array/from-base64";
import "core-js/actual/typed-array/to-base64";

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
    let index: number | undefined = undefined;

    const frame = selectFrames(getState() as RootState).find((f, i) => {
      if (f.id === frameId) {
        // Uh... these frames don't seem sorted. Why does selecting the first frame in the project editor end up with
        // the third index selected here sometimes?
        index = i;
        return true;
      }

      return false;
    });

    if (frame === undefined) {
      return;
    }

    const newFrame: FrameDTO = {
      ...frame,
      duration,
    };

    // Initial thoughts were that this should be persisted throughout editing a frame then navigating back to
    // the frame list. In practice, while making a movie, I rarely wanted the frame to be selected after I had
    // finished editing it. This is because I would take all my photo's, then *afterward* I would: select a frame,
    // set a duration, select another frame, add a duration. Each time having to de-select the previous frame was
    // a hassle.
    dispatch(projectSlice.actions.clearSelectedFrames());

    // Return the user to the same position they were editing. Even though we removed the selection, we probably
    // want to continue editing from subsequent frames near the same position.
    dispatch(projectSlice.actions.setFrameListScrollIndex(index));

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

type IDeleteProjectArgs = {
  projectId: string;
};

export const deleteProject = createAsyncThunk(
  "project/deleteProject",
  async ({ projectId }: IDeleteProjectArgs) => {
    console.log(`Deleting project ${projectId}`);
    const db = await getDB();

    // Delete scenes belonging to the project.
    // If it is a simple movie without scenes, this will just run and delete nothing.
    const txScene = db.transaction("scenes", "readwrite");
    const indexScene = txScene.store.index("project");
    let cursorScene = await indexScene.openCursor(projectId);
    while (cursorScene) {
      cursorScene.delete();
      cursorScene = await cursorScene.continue();
    }

    // Delete frames belonging to the project
    const txFrame = db.transaction("frames", "readwrite");
    const indexFrame = txFrame.store.index("project");
    let cursorFrame = await indexFrame.openCursor(projectId);
    while (cursorFrame) {
      cursorFrame.delete();
      cursorFrame = await cursorFrame.continue();
    }

    await db.delete("projects", projectId);
  },
);

type IDeleteSceneArgs = {
  projectId: string;
  sceneIndex: number;
};

export const deleteScene = createAsyncThunk(
  "project/deleteScene",
  async ({ projectId, sceneIndex }: IDeleteSceneArgs, { dispatch }) => {
    console.log(`Deleting scene ${sceneIndex + 1} from project ${projectId}`);
    const db = await getDB();
    const scenes = await db.getAllFromIndex("scenes", "project", projectId);
    const toDelete = scenes[sceneIndex];
    await db.delete("scenes", toDelete.id);

    // Delete frames belonging to the scene.
    const tx = db.transaction("frames", "readwrite");
    const index = tx.store.index("scene");
    let cursor = await index.openCursor(toDelete.id);
    while (cursor) {
      cursor.delete();
      cursor = await cursor.continue();
    }

    await dispatch(
      loadProject({ projectId, sceneIndex: sceneIndex.toString() }),
    );
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
    { dispatch, getState },
  ) => {
    console.log(`Loading project ${projectId} from db.`);
    const db = await getDB();
    const project = await db.get("projects", projectId);
    if (project === undefined) {
      return;
    }

    // If we already have loaded this project, and this project already has a specific scroll index set for the
    // frame list, then we will respect that. Makes editing a set of frames easier because you don't keep getting
    // pushed to the end of the list.
    // However, if we are loading a different project, all bets are off and just scroll to the last frame.
    const previousProject = selectProject(getState() as RootState);
    const previousFrameListScrollIndex = selectFrameListScrollIndex(
      getState() as RootState,
    );

    const frames = await db.getAllFromIndex("frames", "project", project.id);
    const scenes = await db.getAllFromIndex("scenes", "project", project.id);
    const scene =
      sceneIndex === undefined ? undefined : scenes[parseInt(sceneIndex, 10)];

    const framesToUse =
      scene === undefined ? frames : frames.filter((f) => f.scene === scene.id);

    dispatch(
      projectSlice.actions.initProject({
        project,
        scenes,
        frames: framesToUse,
        sceneIndex,
        frameId,
        frameListScrollIndex:
          previousProject?.id === projectId
            ? previousFrameListScrollIndex
            : frames.length,
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
  requiresDownload?: boolean,
) => {
  console.log("generateVideoFromFrames: About to generate video. ", {
    frames,
    frameRate,
  });

  if (requiresDownload) {
    try {
      console.log("Need to download frames for demo before proceeding.");
      frames = await Promise.all(
        frames.map(async (f) => {
          const result = await fetch(f.image);
          const imageBytes = await result.bytes();
          const image = encodeDataUrl(imageBytes);
          return { ...f, image };
        }),
      );
    } catch (error) {
      console.error("Error downloading frames for demo video: ", error);
    }
  }

  const finalFrames = frames
    .map((frame) =>
      frame.duration
        ? new Array<string>(frameRate * frame.duration).fill(frame.image)
        : frame.image,
    )
    .flat();

  const video = Whammy.fromImageArray(finalFrames, frameRate) as Blob;
  return blobToDataURL(video);
};

const encodeDataUrl = (data: Uint8Array): string => {
  const prefix = "data:image/webp;base64,";

  // @ts-expect-error polyfil from core-js without types
  return prefix + data.toBase64();
};

const decodeDataUrl = (url: string): Uint8Array => {
  const prefix = "data:image/webp;base64,";

  // @ts-expect-error polyfil from core-js without types
  return Uint8Array.fromBase64(url.substring(prefix.length));
};

export const generateExportZip = createAsyncThunk(
  "project/generateExportZip",
  async (_: void, { getState }) => {
    // No need to "loadProject()" here, because to get to the video export functionality you must
    // be on the video preview ,which will already have loaded the project in question.
    const project = selectProject(getState() as RootState);
    const frames = selectFrames(getState() as RootState);
    const scenes = selectScenes(getState() as RootState);

    const files: InputWithSizeMeta[] = [];
    let metadata: MetadataJson;

    const padNumber = (num: number, maxNum: number) => {
      let pad = 1;
      while (maxNum > 10) {
        maxNum /= 10;
        pad++;
      }

      return (num + 1).toString().padStart(pad, "0");
    };

    if (scenes.length === 0) {
      // Simple movie, no scenes
      files.push(
        ...frames.map((f, i) => ({
          name: `frame.${padNumber(i, frames.length)}.webp`,
          input: decodeDataUrl(f.image),
        })),
      );

      metadata = {
        type: "simple",
        project: {
          frameRate: project.frameRate,
        },
        frames: frames.map((f, i) => ({
          filename: `frame.${padNumber(i, frames.length)}.webp`,
          duration: f.duration,
        })),
      };
    } else {
      // Full movie, including scenes.
      metadata = {
        type: "storyboard",
        project: {
          frameRate: project.frameRate,
        },
        scenes: [],
      };
      for (let i = 0; i < scenes.length; i++) {
        const scene = scenes[i];

        // Skip the scene if there is no image in the storyboard.
        // We don't allow frames to be added when there is no scene image, instead
        // we redirect them to the "take photo of scene for storyboard" screen.
        if (!scene.image) {
          continue;
        }

        const sceneFrames = frames.filter((f) => f.scene === scene.id);

        const sceneFilename = `${padNumber(i, scenes.length)}.${padNumber(-1, sceneFrames.length)}.storyboard-image.webp`;
        const frameFilename = (fi: number) =>
          `${padNumber(i, scenes.length)}.${padNumber(fi, sceneFrames.length)}.frame.webp`;

        files.push({
          name: sceneFilename,
          input: decodeDataUrl(scene.image),
        });

        files.push(
          ...sceneFrames.map((f, fi) => ({
            name: frameFilename(fi),
            input: decodeDataUrl(f.image),
          })),
        );

        metadata.scenes.push({
          filename: sceneFilename,
          frames: sceneFrames.map((f, fi) => ({
            filename: frameFilename(fi),
            duration: f.duration,
          })),
        });
      }
    }

    files.push({
      name: `metadata.json`,
      input: JSON.stringify(metadata, null, 2),
    });

    // get the ZIP stream in a Blob
    console.log("Zipping files: ", files);
    const blob = await downloadZip(files, { buffersAreUTF8: false }).blob();

    // make and click a temporary link to download the Blob
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "Movie.export.zip";
    link.click();
    link.remove();
  },
);

export const generatePreviewVideo = createAsyncThunk(
  "project/generatePreviewVideo",
  async (
    { projectId, sceneIndex }: IGeneratePreviewVideoArgs,
    { getState, dispatch },
  ) => {
    dispatch(projectSlice.actions.updatePreviewVideo());
    await dispatch(loadProject({ projectId, sceneIndex }));
    const project = selectProject(getState() as RootState);
    const frames = selectFrames(getState() as RootState);
    const scenes = selectScenes(getState() as RootState);
    const { frameRate } = selectProject(getState() as RootState);

    let video: string;
    if (scenes.length === 0) {
      // Simple movie, no scenes
      video = await generateVideoFromFrames(frames, frameRate, project.demo);
    } else if (sceneIndex !== undefined) {
      // Individual scene.
      const scene = scenes[parseInt(sceneIndex, 10)];
      const sceneFrames = frames.filter((f) => f.scene === scene.id);
      video = await generateVideoFromFrames(
        sceneFrames,
        frameRate,
        project.demo,
      );
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

      video = await generateVideoFromFrames(
        framesToRender,
        frameRate,
        project.demo,
      );
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

    await db.put("scenes", updatedScene);

    // When the last scene has an image, then we will automatically add one new empty one ready
    // to be setup.
    // In the future perhaps this is best left to the UI. i.e. when the UI renders all the scenes, check
    // the last one and if it has an image, then render a placeholder "add scene" button which does this.
    const scenes = await db.getAllFromIndex("scenes", "project", scene.project);
    const lastScene = scenes[scenes.length - 1]; // There is at least one scene. i.e. "scene.project"
    if (lastScene.image) {
      await db.put("scenes", {
        project: scene.project,
        image: undefined,
        id: uuid(),
        description: undefined,
      });
    }
  },
);

export const addFrame = createAsyncThunk(
  "project/addFrame",
  async (image: string, { dispatch, getState }) => {
    const { id: project } = selectProject(getState() as RootState);
    const frames = selectFrames(getState() as RootState);
    const scene = selectScene(getState() as RootState);
    const frame: FrameDTO = {
      id: uuid(),
      image,
      project,
      scene: scene?.id,
    };
    dispatch(projectSlice.actions.addFrame(frame));
    dispatch(projectSlice.actions.setFrameListScrollIndex(frames.length + 1));

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
    frameListScrollIndex: undefined as number | undefined,
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
        frameListScrollIndex?: number;
      }>,
    ) => {
      state.frames = action.payload.frames;
      state.scenes = action.payload.scenes;
      state.project = action.payload.project;
      state.frameId = action.payload.frameId;
      state.sceneIndex = action.payload.sceneIndex;
      state.frameListScrollIndex = action.payload.frameListScrollIndex;
    },
    updateFrame: (state, action: PayloadAction<FrameDTO>) => {
      const frame = action.payload;
      state.frames = state.frames.map((i) => (i.id === frame.id ? frame : i));
    },
    setProject: (state, action: PayloadAction<ProjectDTO>) => {
      state.project = action.payload;
    },
    setFrameListScrollIndex: (
      state,
      action: PayloadAction<number | undefined>,
    ) => {
      state.frameListScrollIndex = action.payload;
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
    clearSelectedFrames: (state) => {
      state.selectedFrameIds = [];
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

export const selectFrameListScrollIndex = (state: RootState) =>
  state.projects.frameListScrollIndex;

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

export const { setFrameSelected, setFrameListScrollIndex } =
  projectSlice.actions;
export default projectSlice.reducer;
