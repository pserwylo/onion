import { DBSchema, openDB } from "idb";

export type ProjectDTO = {
  id: string;
  frameRate: number;
  numOnionSkins: number;
};

export type ImageDTO = {
  id: string;
  data: string;
  project: string;
  duration?: number;
};

interface OnionDB extends DBSchema {
  images: {
    key: string;
    value: ImageDTO;
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
      const images = d.createObjectStore("images", {
        keyPath: "id",
      });

      images.createIndex("project", "project");

      d.createObjectStore("projects", {
        keyPath: "id",
      });
    },
  });
