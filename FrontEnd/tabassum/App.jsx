import React from "react";

import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";


/* =========================================================
   PUBLIC PAGES
========================================================= */

import Home from "./pages/Home";

import Login
    from "./pages/Auth/Login";

import Register
    from "./pages/Auth/Register";

import RegistrationPending
    from "./pages/Auth/RegistrationPending";


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


/* =========================================================
   GLOBAL APP CSS
========================================================= */

import "./App.css";


/* =========================================================
   GET CURRENT USER
========================================================= */

function getCurrentUser() {

    const storedUser =
        localStorage.getItem("valoraUser");


    if (!storedUser) {

        return null;

    }


    try {

        const user =
            JSON.parse(storedUser);


        if (!user || typeof user !== "object") {

            return null;

        }


        /* =====================================================
           NORMALISE ROLE
        ===================================================== */

        let normalizedRole =
            user.role || "";


        const roleLower =
            String(normalizedRole)
                .trim()
                .toLowerCase();


        if (
            roleLower === "hoa" ||
            roleLower === "hoa admin" ||
            roleLower === "hoa administrator"
        ) {

            normalizedRole =
                "HOA Admin";

        }


        else if (
            roleLower === "administrator"
        ) {

            normalizedRole =
                "HOA Admin";

        }


        else if (
            roleLower === "property owner"
        ) {

            normalizedRole =
                "Resident";

        }


        else if (
            roleLower === "buyer"
        ) {

            normalizedRole =
                "Investor";

        }


        /* =====================================================
           NORMALISE NAME
        ===================================================== */

        const firstName =
            user.firstName ||
            user.firstname ||
            "";


        const lastName =
            user.lastName ||
            user.lastname ||
            "";


        const fullName =
            user.fullName ||
            user.name ||
            `${firstName} ${lastName}`.trim();


        /* =====================================================
           NORMALISE INITIALS
        ===================================================== */

        let initials =
            user.initials ||
            "";


        if (!initials) {

            initials =
                `${firstName.charAt(0)}${lastName.charAt(0)}`
                    .toUpperCase();

        }


        if (!initials && fullName) {

            const nameParts =
                fullName
                    .trim()
                    .split(/\s+/);


            initials =
                nameParts
                    .slice(0, 2)
                    .map(
                        (part) =>
                            part.charAt(0)
                    )
                    .join("")
                    .toUpperCase();

        }


        return {
            ...user,

            role:
                normalizedRole,

            firstName,
            lastName,
            fullName,
            initials,
        };

    }

    catch (error) {

        console.error(
            "Unable to read VALORA user:",
            error
        );

        return null;

    }

}


/* =========================================================
   PROTECTED ROUTE
========================================================= */

function ProtectedRoute({ children }) {

    const user =
        getCurrentUser();


    if (!user) {

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
   HEAD ADMIN ROUTE
========================================================= */

function HeadAdminRoute({ children }) {

    const user =
        getCurrentUser();


    /* =====================================================
       NOT LOGGED IN
    ===================================================== */

    if (!user) {

        return (
            <Navigate
                to="/login"
                replace
            />
        );

    }


    /* =====================================================
       CHECK ROLE
    ===================================================== */

    const role =
        String(user.role || "")
            .trim()
            .toLowerCase();


    const isHeadAdmin =
        role === "head admin" ||
        role === "headadministrator" ||
        role === "head administrator";


    if (!isHeadAdmin) {

        return (
            <Navigate
                to="/dashboard"
                replace
            />
        );

    }


    /* =====================================================
       CHECK APPROVAL STATUS
    ===================================================== */

    const status =
        String(user.status || "")
            .trim()
            .toLowerCase();


    const isApproved =
        status === "approved" ||
        status === "active";


    if (!isApproved) {

        return (
            <Navigate
                to="/registration-pending"
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


                <Route
                    path="/registration-pending"
                    element={<RegistrationPending />}
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
                        <ProtectedRoute>
                            <MyProperty />
                        </ProtectedRoute>
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
                        <ProtectedRoute>
                            <RequestToSell />
                        </ProtectedRoute>
                    }
                />


                {/* =================================================
                    COMPLAINTS
                ================================================= */}

                <Route
                    path="/complaints"
                    element={
                        <ProtectedRoute>
                            <Complaints />
                        </ProtectedRoute>
                    }
                />


                {/* =================================================
                    RESIDENT COMPLAINTS
                ================================================= */}

                <Route
                    path="/resident-complaints"
                    element={
                        <ProtectedRoute>
                            <ResidentComplaints />
                        </ProtectedRoute>
                    }
                />


                {/* =================================================
                    MAINTENANCE
                ================================================= */}

                <Route
                    path="/maintenance"
                    element={
                        <ProtectedRoute>
                            <Maintenance />
                        </ProtectedRoute>
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
                        <ProtectedRoute>
                            <CommunityAnalytics />
                        </ProtectedRoute>
                    }
                />


                {/* =================================================
                    RESIDENT DIRECTORY
                ================================================= */}

                <Route
                    path="/resident-directory"
                    element={
                        <ProtectedRoute>
                            <ResidentDirectory />
                        </ProtectedRoute>
                    }
                />


                {/* =================================================
                    PROPERTY REQUESTS
                ================================================= */}

                <Route
                    path="/property-requests"
                    element={
                        <ProtectedRoute>
                            <PropertyRequests />
                        </ProtectedRoute>
                    }
                />


                {/* =================================================
                    PROPERTY APPROVALS
                ================================================= */}

                <Route
                    path="/property-approvals"
                    element={
                        <ProtectedRoute>
                            <PropertyApprovals />
                        </ProtectedRoute>
                    }
                />


                {/* =================================================
                    AI TRAINING DATA
                ================================================= */}

                <Route
                    path="/ai-training-data"
                    element={
                        <ProtectedRoute>
                            <AITrainingData />
                        </ProtectedRoute>
                    }
                />


                {/* =================================================
                    AI VALUATION
                ================================================= */}

                <Route
                    path="/valuation"
                    element={
                        <ProtectedRoute>
                            <Valuation />
                        </ProtectedRoute>
                    }
                />


                {/* =================================================
                    INVESTOR ROI
                ================================================= */}

                <Route
                    path="/roi"
                    element={
                        <ProtectedRoute>
                            <ROI />
                        </ProtectedRoute>
                    }
                />


                {/* =================================================
                    ESTATE AGENT
                ================================================= */}

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


                {/* =================================================
                    HEAD ADMIN DASHBOARD
                ================================================= */}

                <Route
                    path="/head-admin"
                    element={
                        <HeadAdminRoute>
                            <HeadAdminDashboard />
                        </HeadAdminRoute>
                    }
                />


                {/* =================================================
                    HEAD ADMIN REGISTRATION REQUESTS
                ================================================= */}

                <Route
                    path="/registration-requests"
                    element={
                        <HeadAdminRoute>
                            <RegistrationRequests />
                        </HeadAdminRoute>
                    }
                />


                {/* =================================================
                    HEAD ADMIN USER MANAGEMENT
                ================================================= */}

                <Route
                    path="/user-management"
                    element={
                        <HeadAdminRoute>
                            <UserManagement />
                        </HeadAdminRoute>
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

        </BrowserRouter>

    );

}


export default App;
