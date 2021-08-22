import React from "react";

import VisualizationPage from "./Visualization-Page";
import RecordPage from "./Record-Page.js";
import DashboardPage from "./dashboard-page";

import "modern-normalize/modern-normalize.css";
import "./App.scss";

function showVisualizationPage() {
  const pathname = window.location.pathname;
  return pathname === "/listen";
}

function showDashboardPage() {
  const pathname = window.location.pathname;
  return pathname === "/dashboard";
}

function App() {
  if (showDashboardPage()) {
    return <DashboardPage />;
  }

  if (showVisualizationPage()) {
    return <VisualizationPage />;
  }

  return <RecordPage />;
}

export default App;
