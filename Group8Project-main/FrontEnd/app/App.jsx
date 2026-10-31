import React from "react";
import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";

/* SESSION */
import { useSession } from "./services/session";

/* PUBLIC PAGES */
import Home from "./pages/Home";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import RegistrationPending from "./pages/Auth/RegistrationPending";

/* PROPERTY */
import Property from "./pages/Property/Property";
import MyProperty from "./pages/Property/MyProperty";
import Properties from "./pages/Property/Properties";
import PropertyRequests from "./pages/Property/PropertyRequests";
import PropertyApprovals from "./pages/Property/PropertyApprovals";
import PropertyManagement from "./pages/Property/PropertyManagement";

/* DASHBOARDS */
import ResidentDashboard from "./pages/Dashboards/Resident/ResidentDashboard";
import HeadAdminDashboard from "./pages/Dashboards/HeadAdmin/HeadAdminDashboard";
import HOAAdminDashboard from "./pages/Dashboards/HOAAdmin/HOAAdminDashboard";
import EstateAgentDashboard from "./pages/Dashboards/EstateAgent/EstateAgentDashboard";
import InvestorDashboard from "./pages/Dashboards/Investor/InvestorDashboard";

/* HOA ADMIN */
import LandingPageSettings from "./pages/Dashboards/HOAAdmin/LandingPageSettings";

/* RESIDENT */
import RequestToSell from "./pages/RequestToSell";
import Complaints from "./pages/Complaints";
import ResidentComplaints from "./pages/Complaints/ResidentComplaints";
import ResidentDirectory from "./pages/Resident/ResidentDirectory";

/* MAINTENANCE */
import Maintenance from "./pages/Maintenance/Maintenance";

/* COMMUNITY */
import Providers from "./pages/Community/Providers";
import CommunityAnnouncements from "./pages/Announcements/CommunityAnnouncements";
import Announcements from "./pages/Announcements/Announcements";
import CommunityAnalytics from "./pages/Community/CommunityAnalytics";

/* AI */
import AITrainingData from "./pages/AI/AITrainingData";

/* ESTATE AGENT */
import AgentListings from "./pages/EstateAgent/AgentListings";
import AgentEditListings from "./pages/EstateAgent/AgentEditListings";
import AgentInquiries from "./pages/EstateAgent/AgentInquiries";

/* INVESTOR */
import Valuation from "./pages/Investor/Valuation";
import ROI from "./pages/Investor/ROI";

/* HEAD ADMIN */
import RegistrationRequests from "./pages/HeadAdmin/RegistrationRequests";
import UserManagement from "./pages/HeadAdmin/UserManagement";

/* PROFILE */
import Profile from "./pages/Profile";

/* GLOBAL CSS */
import "./App.css";


/* =========================================================
   ROUTE GUARDS 
========================================================= */

function ProtectedRoute({ children }) {
    const { user, isAuthenticated } = useSession();
    
    if (user === undefined) return <div style={{ padding: "50px" }}>Loading...</div>; // Session is loading
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    
    return children;
}

function HOAAdminRoute({ children }) {
    const { user, isAuthenticated } = useSession();
    
    if (user === undefined) return <div style={{ padding: "50px" }}>Loading...</div>;
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    
    const role = String(user.role || "").toLowerCase();
    if (!["head_admin", "hoa_admin"].includes(role)) {
        return <Navigate to="/dashboard" replace />;
    }
    
    return children;
}

function HeadAdminRoute({ children }) {
    const { user, isAuthenticated } = useSession();
    
    if (user === undefined) return <div style={{ padding: "50px" }}>Loading...</div>;
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    
    const role = String(user.role || "").toLowerCase();
    if (role !== "head_admin") {
        return <Navigate to="/dashboard" replace />;
    }
    
    return children;
}

function InvestorRoute({ children }) {
    const { user, isAuthenticated } = useSession();
    
    if (user === undefined) return <div style={{ padding: "50px" }}>Loading...</div>;
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    
    const role = String(user.role || "").toLowerCase();
    if (role !== "investor") {
        return <Navigate to="/dashboard" replace />;
    }
    
    return children;
}


/* =========================================================
   DASHBOARD WRAPPERS
========================================================= */

function HOADashboardWrapper() {
    const { user } = useSession();
    return <HOAAdminDashboard user={user} />;
}

function InvestorDashboardWrapper() {
    const { user } = useSession();
    return <InvestorDashboard user={user} />;
}

function AgentDashboardWrapper() {
    const { user } = useSession();
    return <EstateAgentDashboard user={user} />;
}

function ResidentDashboardWrapper() {
    // The dashboard already uses useSession internally, so we just render it
    return <Dashboard />;
}


/* =========================================================
   APP
========================================================= */
function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* LANDING PAGE */}
                <Route path="/" element={<Home />} />

                {/* AUTHENTICATION */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/registration-pending" element={<RegistrationPending />} />

                {/* PUBLIC PROPERTY BROWSING */}
                <Route path="/properties" element={<Properties />} />
                <Route path="/property/:propertyId" element={<Property />} />

                {/* MAIN DASHBOARD (Resident) */}
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <ResidentDashboard/>
                        </ProtectedRoute>
                    }
                />

                {/* MY PROPERTY */}
                <Route
                    path="/property"
                    element={
                        <ProtectedRoute>
                            <MyProperty />
                        </ProtectedRoute>
                    }
                />

                {/* PROPERTY MANAGEMENT (HOA Only) */}
                <Route
                    path="/property-management"
                    element={
                        <HOAAdminRoute>
                            <PropertyManagement />
                        </HOAAdminRoute>
                    }
                />

                {/* HEAD ADMIN DASHBOARD */}
                <Route
                    path="/head-admin"
                    element={
                        <HeadAdminRoute>
                            <HeadAdminDashboard />
                        </HeadAdminRoute>
                    }
                />

                {/* HOA ADMIN DASHBOARD */}
                <Route
                    path="/hoa-admin"
                    element={
                        <HOAAdminRoute>
                            <HOADashboardWrapper />
                        </HOAAdminRoute>
                    }
                />

                {/* ESTATE AGENT DASHBOARD */}
                <Route
                    path="/agent-dashboard"
                    element={
                        <ProtectedRoute>
                            <AgentDashboardWrapper />
                        </ProtectedRoute>
                    }
                />

                {/* INVESTOR DASHBOARD */}
                <Route
                    path="/investor-dashboard"
                    element={
                        <InvestorRoute>
                            <InvestorDashboardWrapper />
                        </InvestorRoute>
                    }
                />

                {/* LANDING PAGE SETTINGS */}
                <Route
                    path="/landing-page-settings"
                    element={
                        <HOAAdminRoute>
                            <LandingPageSettings />
                        </HOAAdminRoute>
                    }
                />

                {/* REQUEST TO SELL / RENT */}
                <Route
                    path="/request-to-sell"
                    element={
                        <ProtectedRoute>
                            <RequestToSell />
                        </ProtectedRoute>
                    }
                />

                {/* COMPLAINTS */}
                <Route
                    path="/complaints"
                    element={
                        <ProtectedRoute>
                            <Complaints />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/resident-complaints"
                    element={
                        <HOAAdminRoute>
                            <ResidentComplaints />
                        </HOAAdminRoute>
                    }
                />

                {/* MAINTENANCE */}
                <Route
                    path="/maintenance"
                    element={
                        <ProtectedRoute>
                            <Maintenance />
                        </ProtectedRoute>
                    }
                />

                {/* SERVICE PROVIDERS */}
                <Route
                    path="/providers"
                    element={
                        <ProtectedRoute>
                            <Providers />
                        </ProtectedRoute>
                    }
                />

                {/* COMMUNITY ANNOUNCEMENTS */}
                <Route
                    path="/announcements"
                    element={
                        <ProtectedRoute>
                            <Announcements />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/community-announcements"
                    element={
                        <ProtectedRoute>
                            <CommunityAnnouncements />
                        </ProtectedRoute>
                    }
                />

                {/* COMMUNITY ANALYTICS */}
                <Route
                    path="/community-analytics"
                    element={
                        <HOAAdminRoute>
                            <CommunityAnalytics />
                        </HOAAdminRoute>
                    }
                />

                {/* RESIDENT DIRECTORY */}
                <Route
                    path="/resident-directory"
                    element={
                        <HOAAdminRoute>
                            <ResidentDirectory />
                        </HOAAdminRoute>
                    }
                />

                {/* PROPERTY REQUESTS */}
                <Route
                    path="/property-requests"
                    element={
                        <HOAAdminRoute>
                            <PropertyRequests />
                        </HOAAdminRoute>
                    }
                />

                {/* PROPERTY APPROVALS */}
                <Route
                    path="/property-approvals"
                    element={
                        <HOAAdminRoute>
                            <PropertyApprovals />
                        </HOAAdminRoute>
                    }
                />

                {/* AI TRAINING DATA */}
                <Route
                    path="/ai-training-data"
                    element={
                        <HOAAdminRoute>
                            <AITrainingData />
                        </HOAAdminRoute>
                    }
                />

                {/* AI VALUATION */}
                <Route
                    path="/valuation"
                    element={
                        <ProtectedRoute>
                            <Valuation />
                        </ProtectedRoute>
                    }
                />

                {/* INVESTOR ROI */}
                <Route
                    path="/roi"
                    element={
                        <ProtectedRoute>
                            <ROI />
                        </ProtectedRoute>
                    }
                />

                {/* ESTATE AGENT */}
                <Route
                    path="/agent-listings"
                    element={
                        <ProtectedRoute>
                            <AgentListings />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/agent-edit-listings"
                    element={
                        <ProtectedRoute>
                            <AgentEditListings />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/agent-inquiries"
                    element={
                        <ProtectedRoute>
                            <AgentInquiries />
                        </ProtectedRoute>
                    }
                />

                {/* REGISTRATION REQUESTS */}
                <Route
                    path="/registration-requests"
                    element={
                        <HOAAdminRoute>
                            <RegistrationRequests />
                        </HOAAdminRoute>
                    }
                />

                {/* USER MANAGEMENT */}
                <Route
                    path="/user-management"
                    element={
                        <HeadAdminRoute>
                            <UserManagement />
                        </HeadAdminRoute>
                    }
                />

                {/* PROFILE */}
                <Route
                    path="/profile"
                    element={
                        <ProtectedRoute>
                            <Profile />
                        </ProtectedRoute>
                    }
                />

                {/* FALLBACK */}
                <Route
                    path="*"
                    element={<Navigate to="/" replace />}
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;