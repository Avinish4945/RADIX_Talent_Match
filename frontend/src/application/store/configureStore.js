import { configureStore } from "@reduxjs/toolkit";
import { createDefaultProfile } from "../../domain/profile/profileDefaults";
import { createPersistenceMiddleware } from "./persistenceMiddleware";
import appReducer, {
  addProfileEntry,
  setAnalyzedJob,
  setResumeName,
  signIn,
  signOut,
  updateProfile,
} from "./appSlice";

export function configureAppStore({ storage, sessionRepository }) {
  const user = sessionRepository.readSession();
  const savedProfile = storage.readJson("radix-profile");

  return configureStore({
    reducer: { app: appReducer },
    preloadedState: {
      app: {
        user,
        profile: createDefaultProfile(user, savedProfile),
        readinessChecked: false,
      },
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(
        createPersistenceMiddleware(
          [
            signIn,
            signOut,
            updateProfile,
            addProfileEntry,
            setResumeName,
            setAnalyzedJob,
          ],
          storage,
        ),
      ),
  });
}
