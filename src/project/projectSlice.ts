import {createAsyncThunk, createSelector, createSlice} from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store/store'
import Whammy from "ts-whammy";
import {blobToDataURL} from "./projectUtils.ts";
import {db} from "../store/db.ts";

export const loadImages = createAsyncThunk('project/loadImages', async (_: void, { dispatch }) => {
    const d = await db();
    const keys = await d.getAllKeys('images') as string[];
    const images: IImageDTO[] = await Promise.all(keys.map(async id => {
        const src = await d.get('images', id);
        return { id, src }
    }));

    dispatch(projectSlice.actions.setImages(images));
});

export const generatePreviewVideo = createAsyncThunk('project/appendImageAndRefreshPreviewVideo', async (_: void, { getState, dispatch })=> {
    const { frameRate } = selectProjectOptions(getState() as RootState);
    const images = selectImages(getState() as RootState);
    const video = Whammy.fromImageArray(images.map(i => i.src), frameRate) as Blob;
    const data = await blobToDataURL(video);

    dispatch(projectSlice.actions.updatePreviewVideo(data));
})

export const addImage = createAsyncThunk('project/addImage', async (image: string, { dispatch }) => {

    const d = await db();
    const id = await d.put('images', image) as string;

    const imageDto: IImageDTO = {id, src: image};
    dispatch(projectSlice.actions.addImage(imageDto));
});

export const removeImage = createAsyncThunk('project/removeImage', async (imageId: string, { dispatch }) => {
    dispatch(projectSlice.actions.removeImage(imageId));

    const d = await db();
    await d.delete('images', imageId);
})

export type IImageDTO = {
    id: string;
    src: string;
}

export const projectSlice = createSlice({
    name: 'project',
    // `createSlice` will infer the state type from the `initialState` argument
    initialState: {
        options: {
            frameRate: 5,
            numOnionSkins: 1,
        },
        images: [] as IImageDTO[],
        previewVideo: undefined as undefined | string,
    },
    reducers: {
        setImages: (state, action: PayloadAction<IImageDTO[]>) => {
            state.images = action.payload;
        },
        addImage: (state, action: PayloadAction<IImageDTO>) => {
            state.images.push(action.payload);
        },
        removeImage: (state, action: PayloadAction<string>) => {
            state.images = state.images.filter(i => i.id !== action.payload)
        },
        updatePreviewVideo: (state, action: PayloadAction<string>) => {
            state.previewVideo = action.payload
        }
    },
})

export const {} = projectSlice.actions

// Other code such as selectors can use the imported `RootState` type
export const selectImages = (state: RootState) => state.projects.images
export const selectPreviewVideo = (state: RootState) => state.projects.previewVideo
export const selectProjectOptions = (state: RootState) => state.projects.options
export const selectOnionSkinImages = createSelector([selectImages, selectProjectOptions], (images, { numOnionSkins }) =>
    images.slice(images.length - Math.min(numOnionSkins, images.length)).reverse()
)

export default projectSlice.reducer