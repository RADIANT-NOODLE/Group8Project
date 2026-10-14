import React from "react";
import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";

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
import Dashboard from "./pages/Dashboard";
import HeadAdminDashboard
    from "./pages/Dashboards/HeadAdmin/HeadAdminDashboard";

/* HOA ADMIN */
import LandingPageSettings
    from "./pages/Dashboards/HOAAdmin/LandingPageSettings";

/* RESIDENT */
import RequestToSell from "./pages/RequestToSell";
import Complaints from "./pages/Complaints";
import ResidentComplaints
    from "./pages/Complaints/ResidentComplaints";
import ResidentDirectory
    from "./pages/Resident/ResidentDirectory";

/* MAINTENANCE */
import Maintenance from "./pages/Maintenance/Maintenance";

/* COMMUNITY */
import Providers from "./pages/Community/Providers";
import CommunityAnnouncements
    from "./pages/Announcements/CommunityAnnouncements";
import Announcements
    from "./pages/Announcements/Announcements";
import CommunityAnalytics
    from "./pages/Community/CommunityAnalytics";

/* AI */
import AITrainingData from "./pages/AI/AITrainingData";

/* ESTATE AGENT */
import AgentListings from "./pages/EstateAgent/AgentListings";
import AgentEditListings
    from "./pages/EstateAgent/AgentEditListings";
import AgentInquiries from "./pages/EstateAgent/AgentInquiries";

/* INVESTOR */
import Valuation from "./pages/Investor/Valuation";
import ROI from "./pages/Investor/ROI";

/* HEAD ADMIN */
import RegistrationRequests
    from "./pages/HeadAdmin/RegistrationRequests";
import UserManagement
    from "./pages/HeadAdmin/UserManagement";

/* PROFILE */
import Profile from "./pages/Profile";

/* GLOBAL CSS */
import "./App.css";

/* DEFAULT HEAD ADMIN ACCOUNT */
const headAdminAccount = {
    id: "head-admin-001",
    firstName: "Head",
    lastName: "Administrator",
    email: "admin@valora.co.za",
    password: "Admin12345",
    role: "Head Admin",
    status: "Approved",
};

/* DEFAULT HOA ADMIN ACCOUNT */
const hoaAdminAccount = {
    id: "hoa-admin-001",
    firstName: "HOA",
    lastName: "Administrator",
    email: "hoa.admin@valora.co.za",
    password: "HOAAdmin12345",
    role: "HOA Admin",
    status: "Approved",
};

/* INITIALISE DEFAULT ACCOUNTS */
function initialiseDefaultAccounts() {
    let existingUsers = [];

    try {
        const savedUsers = JSON.parse(
            localStorage.getItem("valoraUsers") || "[]"
        );

        if (Array.isArray(savedUsers)) {
            existingUsers = savedUsers;
        }
    } catch (error) {
        console.error("Unable to read VALORA users:", error);
    }

    const defaultAccounts = [
        headAdminAccount,
        hoaAdminAccount,
    ];

    let usersChanged = false;

    defaultAccounts.forEach((defaultAccount) => {
        const accountExists = existingUsers.some(
            (user) =>
                String(user.email || "").trim().toLowerCase() ===
                defaultAccount.email.toLowerCase()
        );

        if (!accountExists) {
            existingUsers.push(defaultAccount);
            usersChanged = true;
        }
    });

    if (
        usersChanged ||
        !localStorage.getItem("valoraUsers")
    ) {
        localStorage.setItem(
            "valoraUsers",
            JSON.stringify(existingUsers)
        );
    }
}

/* NORMALISE ROLE */
function normalizeRole(roleValue) {
    const role = String(roleValue || "").trim().toLowerCase();

    if (
        [
            "hoa",
            "hoa admin",
            "hoa administrator",
            "administrator",
        ].includes(role)
    ) {
        return "HOA Admin";
    }

    if (
        [
            "head admin",
            "headadministrator",
            "head administrator",
        ].includes(role)
    ) {
        return "Head Admin";
    }

    if (
        ["property owner", "resident"].includes(role)
    ) {
        return "Resident";
    }

    if (["buyer", "investor"].includes(role)) {
        return "Investor";
    }

    if (role === "estate agent") {
        return "Estate Agent";
    }

    return String(roleValue || "").trim();
}

/* GET CURRENT USER */
function getCurrentUser() {
    const storedUser = localStorage.getItem("valoraUser");

    if (!storedUser) {
        return null;
    }

    try {
        const user = JSON.parse(storedUser);

        if (!user || typeof user !== "object") {
            return null;
        }

        const normalizedRole = normalizeRole(user.role);

        const firstName =
            user.firstName ||
            user.firstname ||
            user.first_name ||
            "";

        const lastName =
            user.lastName ||
            user.lastname ||
            user.last_name ||
            "";

        const fullName =
            user.fullName ||
            user.name ||
            `${firstName} ${lastName}`.trim();

        let initials = user.initials || "";

        if (!initials) {
            initials =
                `${firstName.charAt(0)}${lastName.charAt(0)}`
                    .toUpperCase();
        }

        if (!initials && fullName) {
            initials = fullName
                .trim()
                .split(/\s+/)
                .slice(0, 2)
                .map((part) => part.charAt(0))
                .join("")
                .toUpperCase();
        }

        return {
            ...user,
            role: normalizedRole,
            firstName,
            lastName,
            fullName,
            initials,
        };
    } catch (error) {
        console.error("Unable to read VALORA user:", error);
        return null;
    }
}

/* CHECK APPROVAL STATUS */
function isUserApproved(user) {
    const status = String(user?.status || "")
        .trim()
        .toLowerCase();

    return status === "approved" || status === "active";
}

/* PROTECTED ROUTE */
function ProtectedRoute({ children }) {
    const user = getCurrentUser();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (!isUserApproved(user)) {
        return <Navigate to="/registration-pending" replace />;
    }

    return children;
}

/* HEAD ADMIN ROUTE */
function HeadAdminRoute({ children }) {
    const user = getCurrentUser();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (!isUserApproved(user)) {
        return <Navigate to="/registration-pending" replace />;
    }

    if (user.role !== "Head Admin") {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}

/* HOA ADMIN ROUTE */
function HOAAdminRoute({ children }) {
    const user = getCurrentUser();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (!isUserApproved(user)) {
        return <Navigate to="/registration-pending" replace />;
    }

    if (!["Head Admin", "HOA Admin"].includes(user.role)) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}

/* ADMIN MANAGEMENT ROUTE */
function AdminManagementRoute({ children }) {
    const user = getCurrentUser();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (!isUserApproved(user)) {
        return <Navigate to="/registration-pending" replace />;
    }

    if (!["Head Admin", "HOA Admin"].includes(user.role)) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}

/* APP */
function App() {
    initialiseDefaultAccounts();

    return (
        <BrowserRouter>
            <Routes>
                {/* LANDING PAGE */}
                <Route path="/" element={<Home />} />

                {/* AUTHENTICATION */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                    path="/registration-pending"
                    element={<RegistrationPending />}
                />

                {/* PUBLIC PROPERTY BROWSING */}
                <Route
                    path="/properties"
                    element={<Properties />}
                />

                <Route
                    path="/property/:propertyId"
                    element={<Property />}
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

                {/* HEAD ADMIN PROPERTY MANAGEMENT */}
                <Route
                    path="/property-management"
                    element={
                        <HeadAdminRoute>
                            <PropertyManagement />
                        </HeadAdminRoute>
                    }
                />

                {/* MAIN DASHBOARD */}
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
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
                        <ProtectedRoute>
                            <ResidentComplaints />
                        </ProtectedRoute>
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
                        <AdminManagementRoute>
                            <PropertyRequests />
                        </AdminManagementRoute>
                    }
                />

                {/* PROPERTY APPROVALS */}
                <Route
                    path="/property-approvals"
                    element={
                        <AdminManagementRoute>
                            <PropertyApprovals />
                        </AdminManagementRoute>
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
                        <AdminManagementRoute>
                            <RegistrationRequests />
                        </AdminManagementRoute>
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
