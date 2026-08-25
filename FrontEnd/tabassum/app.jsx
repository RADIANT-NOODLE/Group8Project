import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";

import Dashboard from "./pages/Dashboard.jsx";
import Property from "./pages/Property.jsx";
import Valuation from "./pages/Valuation.jsx";
import Complaints from "./pages/Complaints.jsx";
import Providers from "./pages/Providers.jsx";
import Announcements from "./pages/Announcements.jsx";
import Profile from "./pages/Profile.jsx";
import ROI from "./pages/ROI.jsx";

import "./App.css";

function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* AISHWARIYA'S HOMEPAGE */}
        <Route path="/" element={<Home />} />

        {/* LINDA'S LOGIN & REGISTRATION */}
        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        {/* YOUR VALORA DASHBOARD */}
        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/property" element={<Property />} />

        <Route path="/valuation" element={<Valuation />} />

        <Route path="/complaints" element={<Complaints />} />

        <Route path="/providers" element={<Providers />} />

        <Route
          path="/announcements"
          element={<Announcements />}
        />

        <Route
          path="/profile"
          element={<Profile />}
        />

        <Route path="/roi" element={<ROI />} />

      </Routes>

    </BrowserRouter>
  );
}

export default App;
