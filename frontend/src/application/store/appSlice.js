import { createSlice } from "@reduxjs/toolkit";
import { PROFILE_ENTRY_SECTIONS } from "../../domain/profile/profileDefaults";

const appSlice = createSlice({
  name: "app",
  initialState: {
    user: null,
    profile: {},
    readinessChecked: false,
    latestReadinessResult: null,
  },
  reducers: {
    initializeApp(state, action) {
      state.user = action.payload.user;
      state.profile = action.payload.profile;
    },
    signIn(state, action) {
      state.user = {
        name: action.payload.name,
        email: action.payload.email,
      };
      state.profile.name = action.payload.name;
      state.profile.email = action.payload.email;
      if (action.payload.profile) {
        Object.assign(state.profile, action.payload.profile);
      }
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
    setAnalyzedJob(state, action) {
      const analysis =
        typeof action.payload === "string"
          ? { title: action.payload }
          : action.payload;
      state.profile.analyzedJob = analysis.title;
      state.profile.jobAnalyses = [
        ...(state.profile.jobAnalyses || []),
        analysis,
      ].slice(-10);
    },
    saveResumeExtraction(state, action) {
      const previousCount =
        state.profile.resumeExtractionCount ||
        (state.profile.resumeExtractedAt ? 1 : 0);
      state.profile.resumeName = action.payload.filename;
      state.profile.resumeExtractedAt = action.payload.extractedAt;
      state.profile.resumeTextLength = action.payload.textLength;
      state.profile.resumeExtractionCount = previousCount + 1;
    },
    setMatchingResults(state, action) {
      state.profile.lastMatchingResult = action.payload;
    },
    markReadinessChecked(state, action) {
      state.readinessChecked = true;
      state.latestReadinessResult = action.payload;
      state.profile.talentCheckCount =
        (state.profile.talentCheckCount || 0) + 1;
      state.profile.latestReadinessScore =
        action.payload?.readiness_score ?? null;
    },
  },
});

export const {
  initializeApp,
  signIn,
  signOut,
  updateProfile,
  addProfileEntry,
  setAnalyzedJob,
  saveResumeExtraction,
  setMatchingResults,
  markReadinessChecked,
} = appSlice.actions;

export default appSlice.reducer;
