import {createAsyncThunk, createSelector, createSlice} from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store/store'
import Whammy from "ts-whammy";
import {blobToDataURL} from "./projectUtils.ts";

export const generatePreviewVideo = createAsyncThunk('project/appendImageAndRefreshPreviewVideo', async (_: void, { getState, dispatch })=> {
    const { frameRate } = selectProjectOptions(getState() as RootState);
    const images = selectImages(getState() as RootState);
    const video = Whammy.fromImageArray(images, frameRate) as Blob;
    const data = await blobToDataURL(video);

    dispatch(projectSlice.actions.updatePreviewVideo(data));
})

export const projectSlice = createSlice({
    name: 'project',
    // `createSlice` will infer the state type from the `initialState` argument
    initialState: {
        options: {
            frameRate: 5,
            numOnionSkins: 1,
        },
        images: [] as string[],
        previewVideo: undefined as undefined | string,
    },
    reducers: {
        addImage: (state, action: PayloadAction<string>) => {
            state.images.push(action.payload);
        },
        removeImage: (state, action: PayloadAction<string>) => {
            state.images = state.images.filter(i => i !== action.payload)
        },
        updatePreviewVideo: (state, action: PayloadAction<string>) => {
            state.previewVideo = action.payload
        }
    },
})

export const { addImage, removeImage } = projectSlice.actions

// Other code such as selectors can use the imported `RootState` type
export const selectImages = (state: RootState) => state.projects.images
export const selectPreviewVideo = (state: RootState) => state.projects.previewVideo
export const selectProjectOptions = (state: RootState) => state.projects.options
export const selectOnionSkinImages = createSelector([selectImages, selectProjectOptions], (images, { numOnionSkins }) =>
    images.slice(images.length - Math.min(numOnionSkins, images.length)).reverse()
)

export default projectSlice.reducer