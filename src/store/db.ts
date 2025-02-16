import {openDB} from "idb";

export const db = async () => openDB('db', 1, {
    upgrade(d) {
        console.log('Creating initial object store: images');
        d.createObjectStore('images', {
            autoIncrement: true,
        });
    }
});

