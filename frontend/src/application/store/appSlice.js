import { createSlice } from "@reduxjs/toolkit";
import { PROFILE_ENTRY_SECTIONS } from "../../domain/profile/profileDefaults";

const appSlice = createSlice({
  name: "app",
  initialState: {
    user: null,
    profile: {},
    readinessChecked: false,
  },
  reducers: {
    initializeApp(state, action) {
      state.user = action.payload.user;
      state.profile = action.payload.profile;
    },
    signIn(state, action) {
      state.user = action.payload;
      state.profile.name = action.payload.name;
      state.profile.email = action.payload.email;
    },
    signOut(state) {
      state.user = null;
    },
    updateProfile(state, action) {
      state.profile = { ...state.profile, ...action.payload };
      if (state.user) {
        state.user.name = state.profile.name;
        state.user.email = state.profile.email;
      }
    },
    addProfileEntry(state, action) {
      const { section, entry } = action.payload;
      if (PROFILE_ENTRY_SECTIONS.includes(section)) {
        state.profile[section].push(entry);
      }
    },
    setResumeName(state, action) {
      state.profile.resumeName = action.payload;
    },
    setAnalyzedJob(state, action) {
      state.profile.analyzedJob = action.payload;
    },
    markReadinessChecked(state) {
      state.readinessChecked = true;
    },
  },
});

export const {
  initializeApp,
  signIn,
  signOut,
  updateProfile,
  addProfileEntry,
  setResumeName,
  setAnalyzedJob,
  markReadinessChecked,
} = appSlice.actions;

export default appSlice.reducer;
