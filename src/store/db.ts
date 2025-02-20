import { DBSchema, openDB } from "idb";
import { v7 as uuid } from "uuid";

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

let shouldInit = false;

export const db = await openDB<OnionDB>("db", 1, {
  upgrade(d) {
    shouldInit = true;

    const images = d.createObjectStore("images", {
      keyPath: "id",
    });

    images.createIndex("project", "project");

    d.createObjectStore("projects", {
      keyPath: "id",
    });
  },
});

if (shouldInit) {
  await db.put("projects", {
    id: uuid(),
    numOnionSkins: 1,
    frameRate: 15,
  });
}
