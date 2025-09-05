import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./Pages/LandingPage";
import Register from "./Pages/Authentication/Register";
import "./App.css";
import Dashboard from "./Pages/MainCrm/Dashboard/Dashboard";
import Overview from "./Pages/MainCrm/Dashboard/Overview";
import Analytics from "./Pages/MainCrm/Analytics/Analytics";
import Users from "./Pages/MainCrm/Users/Users";
import Settings from "./Pages/MainCrm/Settings/Settings";
import Notifications from "./Pages/MainCrm/Notifications/Notifications";
import Segments from "./Pages/MainCrm/Segments/Segments";
import SegmentBuilder from "./Pages/MainCrm/Segments/SegmentBuilder";

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />}>
            <Route index element={<Overview />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="users" element={<Users />} />
            <Route path="segments" element={<Segments />} />
            <Route path="segments/builder" element={<SegmentBuilder />} />
            <Route path="settings" element={<Settings />} />
            <Route path="notifications" element={<Notifications />} />
          </Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
