import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import { DarkModeProvider } from "./contexts/DarkModeContext";
import LandingPage from "./Pages/LandingPage";
import Register from "./Pages/Authentication/Register";
import GoogleCallback from "./Pages/Authentication/GoogleCallback";
import "./App.css";
import Dashboard from "./Pages/MainCrm/Dashboard/Dashboard";
import Overview from "./Pages/MainCrm/Dashboard/Overview";
import Analytics from "./Pages/MainCrm/Analytics/Analytics";
import Users from "./Pages/MainCrm/Users/Users";
import Settings from "./Pages/MainCrm/Settings/Settings";
import Notifications from "./Pages/MainCrm/Notifications/Notifications";
import Segments from "./Pages/MainCrm/Segments/Segments";
import SegmentBuilder from "./Pages/MainCrm/Segments/SegmentBuilder";
import Campaign from "./Pages/MainCrm/Campaign/Campaign";

function App() {

  return (
    <Provider store={store}>
      <DarkModeProvider>
        <BrowserRouter>
          <div className="App">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/register" element={<Register />} />
              <Route path="/auth/google/callback" element={<GoogleCallback />} />
              {/* Keep dashboard overview at /dashboard */}
              <Route path="/dashboard" element={<Dashboard />}>
                <Route index element={<Overview />} />
              </Route>

              {/* Render other sections at top-level paths using the same Dashboard layout */}
              <Route element={<Dashboard />}>
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/users" element={<Users />} />
                <Route path="/segments" element={<Segments />} />
                <Route path="/segments/builder" element={<SegmentBuilder />} />
                <Route path="/campaigns" element={<Campaign />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/notifications" element={<Notifications />} />
              </Route>
            </Routes>
          </div>
        </BrowserRouter>
      </DarkModeProvider>
    </Provider>
  );
}

export default App;