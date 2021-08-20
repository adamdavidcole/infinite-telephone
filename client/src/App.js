import React from "react";

import VisualizationPage from "./Visualization-Page";
import RecordPage from "./Record-Page.js";
import DashboardPage from "./dashboard-page";

import "modern-normalize/modern-normalize.css";
import "./App.scss";

function showRecordPage() {
  const pathname = window.location.pathname;
  return pathname === "/record";
}

function showDashboardPage() {
  const pathname = window.location.pathname;
  return pathname === "/dashboard";
}

function App() {
  if (showRecordPage()) {
    return <RecordPage />;
  }

  if (showDashboardPage()) {
    return <DashboardPage />;
  }

  return <VisualizationPage />;
}

export default App;
