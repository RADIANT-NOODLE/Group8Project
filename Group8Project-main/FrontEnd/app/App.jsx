import React from "react";
import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";

/* SESSION */
import { useSession } from "./services/session";
import { canAccessRoute } from "./services/roleMap";

/* PUBLIC PAGES */
import Home from "./pages/Home";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import ResetPassword from "./pages/Auth/ResetPassword";
import RegistrationPending from "./pages/Auth/RegistrationPending";

/* PROPERTY */
import Property from "./pages/Property/Property";
import Properties from "./pages/Property/Properties";
import PropertyRequests from "./pages/Property/PropertyRequests";
import PropertyApprovals from "./pages/Property/PropertyApprovals";
import PropertyManagement from "./pages/Property/PropertyManagement";

/* DASHBOARDS */
import ResidentDashboard from "./pages/Dashboards/Resident/ResidentDashboard";
import HeadAdminDashboard from "./pages/Dashboards/HeadAdmin/HeadAdminDashboard";
import HOAAdminDashboard from "./pages/Dashboards/HOAAdmin/HOAAdminDashboard";
import EstateAgentDashboard from "./pages/Dashboards/EstateAgent/EstateAgentDashboard";

/* HOA ADMIN */

/* RESIDENT */
import RequestToSell from "./pages/RequestToSell";
import Complaints from "./pages/Complaints";
import ResidentComplaints from "./pages/Complaints/ResidentComplaints";
import ResidentDirectory from "./pages/Resident/ResidentDirectory";

/* MAINTENANCE */
import Maintenance from "./pages/Maintenance/Maintenance";
import CreateAgentAccount from "./pages/EstateAgent/CreateAgentAccount";

/* COMMUNITY */
import Providers from "./pages/Community/Providers";
import CommunityAnnouncements from "./pages/Announcements/CommunityAnnouncements";
import Announcements from "./pages/Announcements/Announcements";

/* AI */
import Intelligence from "./pages/AI/Intelligence";

/* ESTATE AGENT */
import AgentListings from "./pages/EstateAgent/AgentListings";
import AgentEditListings from "./pages/EstateAgent/AgentEditListings";
import AgentInquiries from "./pages/EstateAgent/AgentInquiries";

/* AI VALUATION */
import Valuation from "./pages/Valuation/Valuation";

/* HEAD ADMIN */
import RegistrationRequests from "./pages/HeadAdmin/RegistrationRequests";
import UserManagement from "./pages/HeadAdmin/UserManagement";

/* PROFILE */
import Profile from "./pages/Profile";

/* GLOBAL CSS */
import DialogHost from "./components/AppDialog";
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

/* Role-restricted screens. Who may open what lives in roleMap.js, so the
   sidebar and the guard can never disagree. */
function RoleRoute({ path, children }) {
    const { user, isAuthenticated } = useSession();

    if (user === undefined) return <div style={{ padding: "50px" }}>Loading...</div>;
    if (!isAuthenticated) return <Navigate to="/login" replace />;

    if (!canAccessRoute(user.role, path)) {
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

function AgentDashboardWrapper() {
    const { user } = useSession();
    return <EstateAgentDashboard user={user} />;
}

function ResidentDashboardWrapper() {
    // The dashboard already uses useSession internally, so we just render it
    return <ResidentDashboard />;
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
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route
                    path="/registration-pending"
                    element={<RegistrationPending />}
                />

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

                {/* PROPERTY MANAGEMENT (HOA Only) */}
                <Route
                    path="/property-management"
                    element={
                        <RoleRoute path="/property-management">
                            <PropertyManagement />
                        </RoleRoute>
                    }
                />

                {/* HEAD ADMIN DASHBOARD */}
                <Route
                    path="/head-admin"
                    element={
                        <RoleRoute path="/head-admin">
                            <HeadAdminDashboard />
                        </RoleRoute>
                    }
                />

                {/* HOA ADMIN DASHBOARD */}
                <Route
                    path="/hoa-admin"
                    element={
                        <RoleRoute path="/hoa-admin">
                            <HOADashboardWrapper />
                        </RoleRoute>
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
                        <RoleRoute path="/resident-complaints">
                            <ResidentComplaints />
                        </RoleRoute>
                    }
                />

                {/* MAINTENANCE */}
                <Route
                    path="/maintenance"
                    element={
                        <RoleRoute path="/maintenance">
                            <Maintenance />
                        </RoleRoute>
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

                {/* RESIDENT DIRECTORY */}
                <Route
                    path="/resident-directory"
                    element={
                        <RoleRoute path="/resident-directory">
                            <ResidentDirectory />
                        </RoleRoute>
                    }
                />

                {/* PROPERTY REQUESTS */}
                <Route
                    path="/property-requests"
                    element={
                        <RoleRoute path="/property-requests">
                            <PropertyRequests />
                        </RoleRoute>
                    }
                />

                {/* PROPERTY APPROVALS */}
                <Route
                    path="/property-approvals"
                    element={
                        <RoleRoute path="/property-approvals">
                            <PropertyApprovals />
                        </RoleRoute>
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
                        <RoleRoute path="/agent-inquiries">
                            <AgentInquiries />
                        </RoleRoute>
                    }
                />

                {/* REGISTRATION REQUESTS */}
                <Route
                    path="/registration-requests"
                    element={
                        <RoleRoute path="/registration-requests">
                            <RegistrationRequests />
                        </RoleRoute>
                    }
                />

                {/* CREATE ESTATE AGENT ACCOUNT */}
                <Route
                    path="/create-agent"
                    element={
                        <RoleRoute path="/create-agent">
                            <CreateAgentAccount />
                        </RoleRoute>
                    }
                />

                {/* USER MANAGEMENT */}
                <Route
                    path="/user-management"
                    element={
                        <RoleRoute path="/user-management">
                            <UserManagement />
                        </RoleRoute>
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

                {/* VALORA INTELLIGENCE */}
                <Route
                    path="/intelligence"
                    element={
                        <ProtectedRoute>
                            <Intelligence />
                        </ProtectedRoute>
                    }
                />

                {/* FALLBACK */}
                <Route
                    path="*"
                    element={<Navigate to="/" replace />}
                />
            </Routes>
            <DialogHost />
        </BrowserRouter>
    );
}

export default App;