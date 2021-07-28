import React from "react";

import VisualizationPage from "./Visualization-Page";
import RecordPage from "./Record-Page.js";

import "./App.css";

function showRecordPage() {
  const pathname = window.location.pathname;
  return pathname === "/record";
}

function App() {
  if (showRecordPage()) {
    return <RecordPage />;
  }

  return <VisualizationPage />;
}

export default App;
