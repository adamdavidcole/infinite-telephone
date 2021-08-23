import React from "react";

import VisualizationPage from "./Visualization-Page";
import RecordPage from "./Record-Page.js";
import DashboardPage from "./dashboard-page";
import PosterPage from "./Poster-Page";

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

function showPosterPage() {
  const pathname = window.location.pathname;
  return pathname.includes("/poster");
}

function App() {
  if (showDashboardPage()) {
    return <DashboardPage />;
  }

  if (showVisualizationPage()) {
    return <VisualizationPage />;
  }

  if (showPosterPage()) {
    console.log("show posterpage?");
    return <PosterPage />;
  }

  return <RecordPage />;
}

export default App;
