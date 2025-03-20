import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "./store/store";
import { getDB, SettingsDTO } from "./store/db.ts";
import { useEffect } from "react";
import { useSelector } from "react-redux";

export const loadSettings = createAsyncThunk(
  "settings/loadSettings",
  async (_: void, { dispatch, getState }) => {
    const cached = selectSettings(getState() as RootState);
    if (cached) {
      return cached;
    }

    const db = await getDB();
    const cursor = await db
      .transaction("settings")
      .objectStore("settings")
      .openCursor();

    let settings: SettingsDTO | undefined = cursor?.value;

    if (!settings) {
      console.log(
        "settingsSlice::loadSettings() creating settings for the first time (it wasn't in the store)",
      );
      settings = {
        preferredCameraDeviceId: undefined,
      };
    }

    console.log("settingsSlice::loadSettings() calling initSettings() ", {
      settings,
    });
    dispatch(settingsSlice.actions.initSettings(settings));
    return settings;
  },
);

export const setPreferredDeviceId = createAsyncThunk(
  "settings/setPreferredDeviceId",
  async (deviceId: string, { dispatch }) => {
    const db = await getDB();
    const settings: SettingsDTO = {
      preferredCameraDeviceId: deviceId,
    };

    console.log(
      "settingsSlice::setPreferredDeviceId() Updating preferredCameraDeviceId. Will persist settings. ",
      settings,
    );

    db.put("settings", settings);

    console.log(
      "settingsSlice::setPreferredDeviceId() calling initSettings() ",
      settings,
    );
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
  useEffect(() => {
    loadSettings();
  }, []);

  const settings = useSelector(selectSettings);

  console.log("useSettings ", settings);

  return settings;
};

// Other code such as selectors can use the imported `RootState` type
const selectSettings = ({ settings }: RootState) => settings.settings;

export default settingsSlice.reducer;
