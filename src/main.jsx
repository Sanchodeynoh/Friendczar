import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { SocketProvider } from "./context/SocketContext.jsx";
import { CallProvider } from "./context/CallContext.jsx";
import CallOverlay from "./components/CallOverlay.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HashRouter>
      <AuthProvider>
        <SocketProvider>
          <CallProvider>
            <App />
            <CallOverlay />
          </CallProvider>
        </SocketProvider>
      </AuthProvider>
    </HashRouter>
  </React.StrictMode>
);
