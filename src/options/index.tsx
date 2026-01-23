import React from "react";
import { createRoot } from "react-dom/client";
import Options from "./Options";
import "../styles/globals.css";

const root = createRoot(document.getElementById("root")!);
root.render(
  <React.StrictMode>
    <Options />
  </React.StrictMode>
);
