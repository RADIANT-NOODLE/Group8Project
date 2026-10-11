import React from "react";

import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
    useLocation,
} from "react-router-dom";

import ErrorBoundary
    from "./components/ErrorBoundary";


/* =========================================================
   PUBLIC PAGES
========================================================= */

import Home from "./pages/Home";

import Login
    from "./pages/Auth/Login";

import Register
    from "./pages/Auth/Register";

/* =========================================================
   PROPERTY
========================================================= */

import Property
    from "./pages/Property/Property";

import MyProperty
    from "./pages/Property/MyProperty";

import Properties
    from "./pages/Property/Properties";

import PropertyRequests
    from "./pages/Property/PropertyRequests";

import PropertyApprovals
    from "./pages/Property/PropertyApprovals";


/* =========================================================
   DASHBOARDS
========================================================= */

import Dashboard
    from "./pages/Dashboard";

import HeadAdminDashboard
    from "./pages/Dashboards/HeadAdmin/HeadAdminDashboard";


/* =========================================================
   RESIDENT
========================================================= */

import RequestToSell
    from "./pages/RequestToSell";

import Complaints
    from "./pages/Complaints";

import ResidentComplaints
    from "./pages/Complaints/ResidentComplaints";

import ResidentDirectory
    from "./pages/Resident/ResidentDirectory";


/* =========================================================
   MAINTENANCE
========================================================= */

import Maintenance
    from "./pages/Maintenance/Maintenance";


/* =========================================================
   COMMUNITY
========================================================= */

import Providers
    from "./pages/Community/Providers";

import CommunityAnnouncements
    from "./pages/Announcements/CommunityAnnouncements";

import Announcements
    from "./pages/Announcements/Announcements";

import CommunityAnalytics
    from "./pages/Community/CommunityAnalytics";


/* =========================================================
   AI
========================================================= */

import AITrainingData
    from "./pages/AI/AITrainingData";


/* =========================================================
   ESTATE AGENT
========================================================= */

import AgentListings
    from "./pages/EstateAgent/AgentListings";

import AgentEditListings
    from "./pages/EstateAgent/AgentEditListings";

import AgentInquiries
    from "./pages/EstateAgent/AgentInquiries";


/* =========================================================
   INVESTOR
========================================================= */

import Valuation
    from "./pages/Investor/Valuation";

import ROI
    from "./pages/Investor/ROI";


/* =========================================================
   HEAD ADMIN
========================================================= */

import RegistrationRequests
    from "./pages/HeadAdmin/RegistrationRequests";

import UserManagement
    from "./pages/HeadAdmin/UserManagement";


/* =========================================================
   PROFILE
========================================================= */

import Profile
    from "./pages/Profile";


import { canAccessRoute, defaultRouteForRole } from "./services/roleMap.js";
import { useSession } from "./services/session.js";


/* =========================================================
   GLOBAL APP CSS
========================================================= */

import "./App.css";


/* =========================================================
   PROTECTED ROUTE

   The session is the token the API issued, so a page is
   protected exactly when that session exists.
========================================================= */

function ProtectedRoute({ children }) {

    const { isAuthenticated } =
        useSession();


    if (!isAuthenticated) {

        return (
            <Navigate
                to="/login"
                replace
            />
        );

    }


    return children;

}


/* =========================================================
   ROLE ROUTE

   Signed in, and allowed to open this screen for the role
   the API returned. A refused route sends the person to
   their own workspace instead.
========================================================= */

function RoleRoute({ path, children }) {

    const { isAuthenticated, user } =
        useSession();


    if (!isAuthenticated) {

        return (
            <Navigate
                to="/login"
                replace
            />
        );

    }


    if (!canAccessRoute(user?.role, path)) {

        return (
            <Navigate
                to={defaultRouteForRole(user?.role)}
                replace
            />
        );

    }


    return children;

}


/* =========================================================
   APP
========================================================= */

function App() {

    return (

        <BrowserRouter>

            <AppRoutes />

        </BrowserRouter>

    );

}


/*
=========================================================
ROUTES

Keyed on the current path so that navigating away from a
crashed page clears the error boundary and mounts the next
page fresh, instead of leaving the error on screen.
=========================================================
*/

function AppRoutes() {

    const location =
        useLocation();


    return (

        <ErrorBoundary key={location.pathname}>

            <Routes>


                {/* =================================================
                    LANDING PAGE
                ================================================= */}

                <Route
                    path="/"
                    element={<Home />}
                />


                {/* =================================================
                    AUTHENTICATION
                ================================================= */}

                <Route
                    path="/login"
                    element={<Login />}
                />


                <Route
                    path="/register"
                    element={<Register />}
                />


                {/* =================================================
                    PUBLIC PROPERTY BROWSING

                    IMPORTANT:
                    /properties = Properties.jsx

                    This is NOT Home.jsx.
                ================================================= */}

                <Route
                    path="/properties"
                    element={<Properties />}
                />


                {/* =================================================
                    PUBLIC INDIVIDUAL PROPERTY

                    Example:
                    /property/VAL-001
                ================================================= */}

                <Route
                    path="/property/:propertyId"
                    element={<Property />}
                />


                {/* =================================================
                    RESIDENT MY PROPERTY

                    /property = MyProperty.jsx
                ================================================= */}

                <Route
                    path="/property"
                    element={
                        <RoleRoute path="/property">
                            <MyProperty />
                        </RoleRoute>
                    }
                />


                {/* =================================================
                    MAIN DASHBOARD
                ================================================= */}

                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />


                {/* =================================================
                    REQUEST TO SELL / RENT
                ================================================= */}

                <Route
                    path="/request-to-sell"
                    element={
                        <RoleRoute path="/request-to-sell">
                            <RequestToSell />
                        </RoleRoute>
                    }
                />


                {/* =================================================
                    COMPLAINTS
                ================================================= */}

                <Route
                    path="/complaints"
                    element={
                        <RoleRoute path="/complaints">
                            <Complaints />
                        </RoleRoute>
                    }
                />


                {/* =================================================
                    RESIDENT COMPLAINTS
                ================================================= */}

                <Route
                    path="/resident-complaints"
                    element={
                        <RoleRoute path="/resident-complaints">
                            <ResidentComplaints />
                        </RoleRoute>
                    }
                />


                {/* =================================================
                    MAINTENANCE
                ================================================= */}

                <Route
                    path="/maintenance"
                    element={
                        <RoleRoute path="/maintenance">
                            <Maintenance />
                        </RoleRoute>
                    }
                />


                {/* =================================================
                    PROVIDERS
                ================================================= */}

                <Route
                    path="/providers"
                    element={
                        <ProtectedRoute>
                            <Providers />
                        </ProtectedRoute>
                    }
                />


                {/* =================================================
                    COMMUNITY ANNOUNCEMENTS
                ================================================= */}

                <Route
                    path="/announcements"
                    element={
                        <ProtectedRoute>
                            <CommunityAnnouncements />
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


                {/* =================================================
                    COMMUNITY ANALYTICS
                ================================================= */}

                <Route
                    path="/community-analytics"
                    element={
                        <RoleRoute path="/community-analytics">
                            <CommunityAnalytics />
                        </RoleRoute>
                    }
                />


                {/* =================================================
                    RESIDENT DIRECTORY
                ================================================= */}

                <Route
                    path="/resident-directory"
                    element={
                        <RoleRoute path="/resident-directory">
                            <ResidentDirectory />
                        </RoleRoute>
                    }
                />


                {/* =================================================
                    PROPERTY REQUESTS
                ================================================= */}

                <Route
                    path="/property-requests"
                    element={
                        <RoleRoute path="/property-requests">
                            <PropertyRequests />
                        </RoleRoute>
                    }
                />


                {/* =================================================
                    PROPERTY APPROVALS
                ================================================= */}

                <Route
                    path="/property-approvals"
                    element={
                        <RoleRoute path="/property-approvals">
                            <PropertyApprovals />
                        </RoleRoute>
                    }
                />


                {/* =================================================
                    AI TRAINING DATA
                ================================================= */}

                <Route
                    path="/ai-training-data"
                    element={
                        <RoleRoute path="/ai-training-data">
                            <AITrainingData />
                        </RoleRoute>
                    }
                />


                {/* =================================================
                    AI VALUATION
                ================================================= */}

                <Route
                    path="/valuation"
                    element={
                        <RoleRoute path="/valuation">
                            <Valuation />
                        </RoleRoute>
                    }
                />


                {/* =================================================
                    INVESTOR ROI
                ================================================= */}

                <Route
                    path="/roi"
                    element={
                        <RoleRoute path="/roi">
                            <ROI />
                        </RoleRoute>
                    }
                />


                {/* =================================================
                    ESTATE AGENT
                ================================================= */}

                <Route
                    path="/agent-listings"
                    element={
                        <RoleRoute path="/agent-listings">
                            <AgentListings />
                        </RoleRoute>
                    }
                />


                <Route
                    path="/agent-edit-listings"
                    element={
                        <RoleRoute path="/agent-edit-listings">
                            <AgentEditListings />
                        </RoleRoute>
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


                {/* =================================================
                    HEAD ADMIN DASHBOARD
                ================================================= */}

                <Route
                    path="/head-admin"
                    element={
                        <RoleRoute path="/head-admin">
                            <HeadAdminDashboard />
                        </RoleRoute>
                    }
                />


                {/* =================================================
                    HEAD ADMIN REGISTRATION REQUESTS
                ================================================= */}

                <Route
                    path="/registration-requests"
                    element={
                        <RoleRoute path="/registration-requests">
                            <RegistrationRequests />
                        </RoleRoute>
                    }
                />


                {/* =================================================
                    HEAD ADMIN USER MANAGEMENT
                ================================================= */}

                <Route
                    path="/user-management"
                    element={
                        <RoleRoute path="/user-management">
                            <UserManagement />
                        </RoleRoute>
                    }
                />


                {/* =================================================
                    PROFILE
                ================================================= */}

                <Route
                    path="/profile"
                    element={
                        <ProtectedRoute>
                            <Profile />
                        </ProtectedRoute>
                    }
                />


                {/* =================================================
                    FALLBACK
                ================================================= */}

                <Route
                    path="*"
                    element={
                        <Navigate
                            to="/"
                            replace
                        />
                    }
                />

            </Routes>

        </ErrorBoundary>

    );

}


export default App;
