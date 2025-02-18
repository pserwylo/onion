import { openDB } from "idb";

export const db = await openDB("db", 1, {
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
