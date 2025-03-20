import { DBSchema, openDB } from "idb";

export type SettingsDTO = {
  preferredCameraDeviceId: string | undefined;
};

export type ProjectDTO = {
  id: string;
  frameRate: number;
  numOnionSkins: number;
};

export type FrameDTO = {
  id: string;
  image: string;
  project: string;
  scene?: string;
  duration?: number;
};

export type SceneDTO = {
  id: string;
  project: string;
  image?: string;
  description?: string;
};

interface OnionDB extends DBSchema {
  frames: {
    key: string;
    value: FrameDTO;
    indexes: { project: string; scene: string };
  };
  scenes: {
    key: string;
    value: SceneDTO;
    indexes: { project: string };
  };
  projects: {
    key: string;
    value: ProjectDTO;
  };
  settings: {
    key: string;
    value: SettingsDTO;
  };
}

export const getDB = async () =>
  await openDB<OnionDB>("db", 1, {
    upgrade(d) {
      const frames = d.createObjectStore("frames", {
        keyPath: "id",
      });

      frames.createIndex("project", "project");
      frames.createIndex("scene", "scene");

      const scenes = d.createObjectStore("scenes", {
        keyPath: "id",
      });

      scenes.createIndex("project", "project");

      d.createObjectStore("projects", {
        keyPath: "id",
      });

      d.createObjectStore("settings");
    },
  });
