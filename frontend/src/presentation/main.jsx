import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { RouterProvider } from "react-router-dom";
import { createSessionService } from "../application/session/sessionService";
import { configureAppStore } from "../application/store/configureStore";
import { createSessionRepository } from "../infrastructure/repositories/sessionRepository";
import { createBrowserStorage } from "../infrastructure/storage/browserStorage";
import { createAppRouter } from "./routes/router";
import "./styles/styles.css";

const storage = createBrowserStorage();
const sessionRepository = createSessionRepository(storage);
const store = configureAppStore({ storage, sessionRepository });
const sessionService = createSessionService(sessionRepository);
const router = createAppRouter(sessionService);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </React.StrictMode>,
);
