import { DBSchema, IDBPDatabase, openDB } from "idb";
import metadataTheVet from "./movies/metadata.the-vet.json";
import metadataBloom from "./movies/metadata.bloom.json";
import { v7 as uuid } from "uuid";

export type CameraDevice = {
  id: string;
  label: string;
};

export type SettingsDTO = {
  cameras?: CameraDevice[];
  preferredCamera?: string;
};

export type ProjectDTO = {
  id: string;
  title?: string;
  frameRate: number;
  numOnionSkins: number;
  demo?: boolean;
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

export type MetadataJson =
  | {
      type: "simple";
      project: {
        frameRate: number;
        title: string;
      };
      frames: {
        filename: string;
        duration?: number;
      }[];
    }
  | {
      type: "storyboard";
      project: {
        frameRate: number;
        title: string;
      };
      scenes: {
        filename: string;
        frames: {
          filename: string;
          duration?: number;
        }[];
      }[];
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

export const getDB = async () => {
  let addTheVet = false;
  let addBloom = false;
  const db = await openDB<OnionDB>("db", 3, {
    upgrade(d, oldVersion) {
      try {
        if (oldVersion < 1) {
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
        }

        if (oldVersion < 2) {
          addTheVet = true;
        }

        if (oldVersion < 3) {
          addBloom = true;
        }
      } catch (e) {
        console.error(e);
      }
    },
  });

  if (addTheVet) {
    await addDemoMovie("the-vet", db);
  }

  if (addBloom) {
    await addDemoMovie("bloom", db);
  }

  return db;
};

export const demoMovies = {
  "the-vet": metadataTheVet,
  bloom: metadataBloom,
};

export const addDemoMovie = async (
  id: keyof typeof demoMovies,
  db: IDBPDatabase<OnionDB>,
) => {
  console.info(`Adding demo movie: ${id}`);
  const metadata = demoMovies[id] as MetadataJson;
  const path = `${import.meta.env.BASE_URL}/movies/${id}/`;
  const project = {
    id,
    demo: true,
    frameRate: metadata.project.frameRate,
    numOnionSkins: 1,
    title: metadata.project.title,
  };
  await db.put("projects", project);

  if (metadata.type === "simple") {
    await Promise.all(
      metadata.frames.map((f) =>
        db.put("frames", {
          id: uuid(),
          project: id,
          image: `${path}/${f.filename}`,
          duration: f.duration,
        }),
      ),
    );
  } else {
    await Promise.all(
      metadata.scenes.map(async (s) => {
        const sceneId = uuid();
        await db.put("scenes", {
          id: sceneId,
          description: "",
          project: id,
          image: `${path}/${s.filename}`,
        });

        await Promise.all(
          s.frames.map((f) =>
            db.put("frames", {
              id: uuid(),
              project: id,
              image: `${path}/${f.filename}`,
              duration: f.duration,
              scene: sceneId,
            }),
          ),
        );
      }),
    );
  }

  return project;
};
