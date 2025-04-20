import { DBSchema, IDBPDatabase, openDB } from "idb";
import metadataDuploDemo from "./movies/metadata.duplo-demo.json";
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
  let addDuploDemo = false;
  const db = await openDB<OnionDB>("db", 2, {
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
          addDuploDemo = true;
        }
      } catch (e) {
        console.error(e);
      }
    },
  });

  if (addDuploDemo) {
    console.log("Need to add duplo demo.");
    console.log({ db });
    await addDemoMovie("duplo-demo", db);
  }

  return db;
};

export const demoMovies = {
  "duplo-demo": metadataDuploDemo,
};

export const addDemoMovie = async (
  id: keyof typeof demoMovies,
  db: IDBPDatabase<OnionDB>,
) => {
  console.log(`addDemoMovie('${id}'): a`);
  const metadata = demoMovies[id] as MetadataJson;
  console.log(`addDemoMovie('${id}'): b`, { metadata });
  const path = `${import.meta.env.BASE_URL}/movies/${id}/`;
  console.log(`addDemoMovie('${id}'): c`, { path });
  const project = {
    id,
    demo: true,
    frameRate: metadata.project.frameRate,
    numOnionSkins: 1,
  };
  console.log(`addDemoMovie('${id}'): d`, { project });
  db.put("projects", project);
  console.log(`addDemoMovie('${id}'): e`);

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
