import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App.jsx";
import HistoryPage from "./HistoryPage.jsx";
import HabitsPage from "./HabitsPage.jsx";
import StatsPage from "./StatsPage.jsx";
import WeeklyDigest from "./WeeklyDigest.jsx";
import CustomizationPage from "./CustomizationPage.jsx";
import BadgesPage from "./BadgesPage.jsx";
import WeeklyPlan from "./WeeklyPlan.jsx";
import CategoriesPage from "./CategoriesPage.jsx";
import AdventureMapPage from "./AdventureMapPage.jsx";
import { Toaster } from "react-hot-toast";

import "./index.css";
import LandingPage from "./LandingPage.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/app" element={<App />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/habits" element={<HabitsPage />} />
        <Route path="/stats" element={<StatsPage />} />
        <Route path="/weekly-digest" element={<WeeklyDigest />} />
        <Route path="/customization" element={<CustomizationPage />} />
        <Route path="/badges" element={<BadgesPage />} />
        <Route path="/weekly-plan" element={<WeeklyPlan />} />
        <Route path="/adventure-map" element={<AdventureMapPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/" element={<LandingPage />} />
      </Routes>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#1f2937",
            color: "#fff",
            border: "1px solid #374151",
          },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>,
);
