import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import RegistrationPending from "./pages/RegistrationPending.jsx";

import Dashboard from "./pages/Dashboard.jsx";

import Property from "./pages/Property.jsx";
import Valuation from "./pages/Valuation.jsx";
import Complaints from "./pages/Complaints.jsx";

import ResidentComplaints from "./pages/ResidentComplaints.jsx";
import ResidentDirectory from "./pages/ResidentDirectory.jsx";

import Maintenance from "./pages/Maintenance.jsx";
import CommunityAnnouncements from "./pages/CommunityAnnouncements.jsx";
import AITrainingData from "./pages/AITrainingData.jsx";
import CommunityAnalytics from "./pages/CommunityAnalytics.jsx";

import AgentListings from "./pages/AgentListings.jsx";
import AgentEditListings from "./pages/AgentEditListings.jsx";
import AgentInquiries from "./pages/AgentInquiries.jsx";

import Providers from "./pages/Providers.jsx";
import Announcements from "./pages/Announcements.jsx";

import Profile from "./pages/Profile.jsx";
import ROI from "./pages/ROI.jsx";

import HeadAdminDashboard from "./pages/HeadAdminDashboard.jsx";
import RegistrationRequests from "./pages/RegistrationRequests.jsx";
import UserManagement from "./pages/UserManagement.jsx";

import "./App.css";



// HEAD ADMIN ACCOUNT
// This account is NOT available through public registration.


const headAdminAccount = {
  id: "head-admin-001",
  firstName: "Head",
  lastName: "Administrator",
  email: "admin@valora.co.za",
  password: "Admin12345",
  role: "Head Admin",
  status: "Approved",
};



// ROLE-BASED DASHBOARD
// Only approved and logged-in users can access dashboards.


function RoleDashboard() {

  const loggedIn =
    localStorage.getItem("valoraLoggedIn") === "true";

  const storedUser =
    JSON.parse(localStorage.getItem("valoraUser"));


  // User is not logged in
  if (!loggedIn || !storedUser) {
    return <Navigate to="/login" replace />;
  }


  // User has not been approved
  if (storedUser.status !== "Approved") {

    localStorage.removeItem("valoraLoggedIn");
    localStorage.removeItem("valoraUserEmail");
    localStorage.removeItem("valoraUser");

    return <Navigate to="/login" replace />;
  }


  // Head Admin has a separate dashboard
  if (storedUser.role === "Head Admin") {
    return <Navigate to="/head-admin" replace />;
  }


  // Send the user to their correct role dashboard
  switch (storedUser.role) {

    case "Resident":
      return <Dashboard role="Resident" />;

    case "Investor":
      return <Dashboard role="Investor" />;

    case "Estate Agent":
      return <Dashboard role="Estate Agent" />;

    case "HOA Admin":
      return <Dashboard role="HOA Admin" />;

    default:

      localStorage.removeItem("valoraLoggedIn");
      localStorage.removeItem("valoraUserEmail");
      localStorage.removeItem("valoraUser");

      return <Navigate to="/login" replace />;
  }
}



// HEAD ADMIN ROUTE
// Only an approved, logged-in Head Admin can access
// Head Admin pages.


function HeadAdminRoute({ children }) {

  const loggedIn =
    localStorage.getItem("valoraLoggedIn") === "true";

  const storedUser =
    JSON.parse(localStorage.getItem("valoraUser"));


  // Not logged in
  if (!loggedIn || !storedUser) {
    return <Navigate to="/login" replace />;
  }


  // Account is not approved
  if (storedUser.status !== "Approved") {

    localStorage.removeItem("valoraLoggedIn");
    localStorage.removeItem("valoraUserEmail");
    localStorage.removeItem("valoraUser");

    return <Navigate to="/login" replace />;
  }


  // Logged-in user is not Head Admin
  if (storedUser.role !== "Head Admin") {
    return <Navigate to="/dashboard" replace />;
  }


  // Approved Head Admin
  return children;
}



// MAIN APP


function App() {

  // Get all registered users
  const users =
    JSON.parse(localStorage.getItem("valoraUsers")) || [];


  // Check whether the Head Admin account already exists
  const headAdminExists = users.some(
    (user) => user.role === "Head Admin"
  );


  // Create the Head Admin account automatically
  // if it does not already exist.
  if (!headAdminExists) {

    localStorage.setItem(
      "valoraUsers",
      JSON.stringify([
        ...users,
        headAdminAccount,
      ])
    );

  }


  return (
    <BrowserRouter>

      <Routes>


        {/* VALORA HOMEPAGE */}

        <Route
          path="/"
          element={<Home />}
        />


        {/* LOGIN & REGISTRATION */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/registration-pending"
          element={<RegistrationPending />}
        />


        {/* ROLE-BASED USER DASHBOARD */}

        <Route
          path="/dashboard"
          element={<RoleDashboard />}
        />


        {/* HEAD ADMIN
            Protected - Head Admin ONLY */}

        <Route
          path="/head-admin"
          element={
            <HeadAdminRoute>
              <HeadAdminDashboard />
            </HeadAdminRoute>
          }
        />

        <Route
          path="/registration-requests"
          element={
            <HeadAdminRoute>
              <RegistrationRequests />
            </HeadAdminRoute>
          }
        />

        <Route
          path="/user-management"
          element={
            <HeadAdminRoute>
              <UserManagement />
            </HeadAdminRoute>
          }
        />


        {/* PROPERTY */}

        <Route
          path="/property"
          element={<Property />}
        />


        {/* AI VALUATION */}

        <Route
          path="/valuation"
          element={<Valuation />}
        />


        {/* COMPLAINTS */}

        <Route
          path="/complaints"
          element={<Complaints />}
        />

        <Route
          path="/resident-complaints"
          element={<ResidentComplaints />}
        />


        {/* HOA ADMIN */}

        <Route
          path="/resident-directory"
          element={<ResidentDirectory />}
        />

        <Route
          path="/maintenance"
          element={<Maintenance />}
        />

        <Route
          path="/community-announcements"
          element={<CommunityAnnouncements />}
        />

        <Route
          path="/ai-training-data"
          element={<AITrainingData />}
        />

        <Route
          path="/community-analytics"
          element={<CommunityAnalytics />}
        />


        {/* ESTATE AGENT */}

        <Route
          path="/agent-listings"
          element={<AgentListings />}
        />

        <Route
          path="/agent-edit-listings"
          element={<AgentEditListings />}
        />

        <Route
          path="/agent-inquiries"
          element={<AgentInquiries />}
        />


        {/* SERVICE PROVIDERS */}

        <Route
          path="/providers"
          element={<Providers />}
        />


        {/* ANNOUNCEMENTS */}

        <Route
          path="/announcements"
          element={<Announcements />}
        />


        {/* PROFILE */}

        <Route
          path="/profile"
          element={<Profile />}
        />


        {/* INVESTOR ROI */}

        <Route
          path="/roi"
          element={<ROI />}
        />


      </Routes>

    </BrowserRouter>
  );
}


export default App;
