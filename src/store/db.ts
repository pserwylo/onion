import { DBSchema, openDB } from "idb";

export type ProjectDTO = {
  id: string;
  frameRate: number;
  numOnionSkins: number;
};

export type FrameDTO = {
  id: string;
  image: string;
  project: string;
  duration?: number;
};

interface OnionDB extends DBSchema {
  frames: {
    key: string;
    value: FrameDTO;
    indexes: { project: string };
  };
  projects: {
    key: string;
    value: ProjectDTO;
  };
}

export const getDB = async () =>
  await openDB<OnionDB>("db", 1, {
    upgrade(d) {
      const frames = d.createObjectStore("frames", {
        keyPath: "id",
      });

      frames.createIndex("project", "project");

      d.createObjectStore("projects", {
        keyPath: "id",
      });
    },
  });
