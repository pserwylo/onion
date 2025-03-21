import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "./store/store";
import { CameraDevice, getDB, SettingsDTO } from "./store/db.ts";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useAppDispatch } from "./store/hooks.ts";

const IDB_KEY = "1";

export const loadSettings = createAsyncThunk(
  "settings/loadSettings",
  async (_: void, { dispatch, getState }) => {
    const cached = selectSettings(getState() as RootState);
    if (cached) {
      return cached;
    }

    const settings = (await readSettings()) ?? {
      preferredCamera: undefined,
      cameras: undefined,
    };

    const db = await getDB();
    await db.put("settings", settings, IDB_KEY);
    dispatch(settingsSlice.actions.initSettings(settings));
    return settings;
  },
);

const readSettings = async () => {
  const db = await getDB();
  return db.get("settings", IDB_KEY);
};

export const setCameras = createAsyncThunk(
  "settings/setPreferredDeviceId",
  async (cameras: CameraDevice[], { dispatch }) => {
    const db = await getDB();
    const settings: SettingsDTO = {
      ...(await readSettings()),
      cameras,
    };

    await db.put("settings", settings, IDB_KEY);
    dispatch(settingsSlice.actions.initSettings(settings));
    return settings;
  },
);

export const setPreferredDeviceId = createAsyncThunk(
  "settings/setPreferredDeviceId",
  async (deviceId: string, { dispatch }) => {
    const db = await getDB();
    const settings: SettingsDTO = {
      ...(await readSettings()),
      preferredCamera: deviceId,
    };

    await db.put("settings", settings, IDB_KEY);
    dispatch(settingsSlice.actions.initSettings(settings));
    return settings;
  },
);

export const settingsSlice = createSlice({
  name: "settings",
  initialState: {
    settings: undefined as undefined | SettingsDTO,
  },
  reducers: {
    initSettings: (state, action: PayloadAction<SettingsDTO | undefined>) => {
      state.settings = action.payload;
    },
  },
});

export const useSettings = () => {
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(loadSettings());
  }, [dispatch]);

  return useSelector(selectSettings);
};

// Other code such as selectors can use the imported `RootState` type
const selectSettings = ({ settings }: RootState) => settings.settings;

export default settingsSlice.reducer;
