# VALORA Project Progress & Integration Tracker

> **Last Updated:** November 2, 2026  
> **Status:** Active Deployment Preparation (`main` branch)  
> **Reference Branch:** `valora_new` (by `radiant_noodle` / `Kaiii-zen` / Kaitlin Biggas)

This document tracks all features, APIs, and architectural improvements brought over from `radiant_noodle` into the primary **`main`** branch, along with the remaining backlog required for complete end-to-end production functionality.

---

## 1. What We Took from radiant_noodle (Integrated into `main`)

The following functionality was merged from the `valora_new` branch into `main`. It successfully moves the application from browser `localStorage` prototypes to an integrated, database-backed system:

### 1.1 Resident Directory & Occupancy Linking
* **Backend Models & Schemas:**
  * Added `ResidentDirectory` database model (`Group8Project-main/backend/app/community/models/resident_directory.py`) establishing relationships between registered users and physical property units.
  * Added schemas for directory record creation, updates, and responses (`Group8Project-main/backend/app/community/schemas/resident_directory.py`).
* **Backend API Endpoints (`/api/v1/resident-directory`):**
  * `GET /`: Lists all directory assignments with joined user details (name, email, role) and property details (unit number, complex, address).
  * `POST /`: Assigns an approved resident or investor to a property unit (restricts admins from improper unit assignment).
  * `PATCH /{id}`: Updates occupancy status (`Occupied`, `Vacant`, `Under Renovation`) and HOA notes.
  * `DELETE /{id}`: Unassigns a resident from a unit.
  * `GET /eligible-users` & `GET /eligible-properties`: Helper queries returning unassigned approved members and unassigned units.
* **Frontend Integration:**
  * Fully refactored `ResidentDirectory.jsx` to consume live FastAPI endpoints.
  * Replaced over 1,000 lines of fragile mock storage code with real API queries and error states.

### 1.2 Property Management & Live Updates
* **Backend:**
  * Created `PATCH /api/v1/properties/{property_id}` endpoint in `properties.py` restricted to HOA Admins.
  * Added `PropertyUpdate` schema in `schemas/property.py` allowing partial updates to unit number, complex name, street address, suburb, floor size ($m^2$), bedrooms, and bathrooms.
  * Added `update_property()` in `PropertyService`.
* **Frontend:**
  * Refactored `PropertyManagement.jsx` to load properties directly from `GET /api/v1/properties`.
  * Added interactive edit modals connected to `PATCH /properties/{id}` and property addition connected to `POST /properties`.
  * In `App.jsx`, aligned route protection for `/property-management` to `HOAAdminRoute`.
  * Added an inline "Add Property" quick-form card directly onto `HOAAdminDashboard.jsx`.

### 1.3 Live "My Property" Page for Residents
* Refactored `MyProperty.jsx` away from fake hardcoded unit cards.
* Connected to authenticated resident sessions (`useSession()`): the page queries `/api/v1/resident-directory` to identify the logged-in user's assigned property ID and fetches live unit details from `/api/v1/properties/{id}`.

### 1.4 User Profile & Password Management
* **Backend:**
  * Added `PUT /api/users/me` allowing authenticated users to update their full name and email in the database.
  * Added `PUT /api/users/me/password` verifying the current password via bcrypt and updating to a new password with minimum length enforcement.
* **Frontend:**
  * Updated `Profile.jsx` to bind to real session data instead of static placeholder values.
  * Added an interactive "Change Password" modal with validation and live feedback.
  * Connected sign-out button to `logout()` and login redirect.

### 1.5 Service Provider & Review Moderation
* **Backend:**
  * Added `DELETE /api/v1/providers/{provider_id}` for HOA Admins to remove service providers.
  * Added `DELETE /api/v1/providers/{provider_id}/reviews/{review_id}` with automatic background recalculation of the provider's total reviews and average star rating (`avg_rating`).
  * Added `description` field to `ServiceProvider` schema and database model.
* **Frontend:**
  * Connected `Providers.jsx` to live provider and review endpoints.
  * Added review moderation and deletion confirmation dialog for HOA Admins.

### 1.6 Database Connection Stability & CORS
* **Database Pooling:** Updated `session.py` with SQLAlchemy connection pooling configuration:
  * `pool_pre_ping=True` (checks database connection health before checkout)
  * `pool_recycle=300` (recycles connections every 5 minutes to prevent stale dropped connections)
  * `timeout=30`, `pool_size=5`, `max_overflow=10`
* **CORS Settings:** Configured `main.py` CORS origins to explicitly whitelist local Vite development ports (`5173` and `4173`).

### 1.7 Repository Hygiene & Cleanup
* Untracked over 4,500 accidentally committed virtual environment files (`backend/venv`) and cached `.pyc` files.
* Added a comprehensive root `.gitignore` and `backend/.gitignore`.
* Preserved the developer's local `.env` database and JWT settings safely on disk.

---

## 2. What's Left to Get Fully Working on the Actual Live System

While the core operational architecture is now connected to the live database, the following items remain to achieve complete end-to-end functionality across all screens:

### 2.1 User Administration & Registration Requests (Priority 1)
* **Current State:** Backend has async endpoints (`/users/pending`, `/users/approved`, `/users/{id}/approve`, `/users/{id}/reject`, and `UserRepository.list_all`).
* **What's Left:**
  * Verify `RegistrationRequests.jsx` and `UserManagement.jsx` are cleanly calling these endpoints with JWT authentication.
  * Ensure user role mappings (`hoa_admin`, `resident`, `investor`, `estate_agent`) are consistently handled between frontend select menus and database records.

### 2.2 Property Sale & Rent Requests (Priority 2)
* **Current State:** Frontend screens exist (`RequestToSell.jsx` for residents and `PropertyRequests.jsx` for HOA Admins), but they currently use local state.
* **What's Left:**
  * Create backend database model and endpoints (`POST /api/v1/property-requests`, `GET /api/v1/property-requests`, `PATCH /api/v1/property-requests/{id}/status`).
  * Wire resident submissions to the database and allow HOA Admins to approve/reject requests before converting them into public listings.

### 2.3 Real File & Photo Uploads (Priority 3)
* **Current State:** Photos are currently referenced via external image URLs, base64 strings, or SVG placeholders.
* **What's Left:**
  * Implement file upload API endpoints (using FastAPI `UploadFile` or cloud/static storage).
  * Allow residents to attach photo evidence to maintenance complaints (`Complaints.jsx`).
  * Allow HOA Admins and agents to upload real property listing photos.

### 2.4 Buyer & Agent Inquiries (Priority 4)
* **Current State:** `AgentInquiries.jsx` and public property inquiry forms store logs in browser memory.
* **What's Left:**
  * Implement inquiry database table and router (`POST /api/v1/inquiries`, `GET /api/v1/inquiries`).
  * Enable prospective buyers/investors to submit questions about listed properties and allow assigned estate agents to view and reply.

### 2.5 Dedicated Service Provider Portal & Login (Priority 5)
* **Current State:** Service providers are listed in the public/resident directory (`Providers.jsx`), but cannot log in to an independent dashboard.
* **What's Left:**
  * Enable service provider authentication or work order dispatch view (`ProviderWork.jsx`).
  * Allow contractors to view assigned jobs, update job status (`In Progress`, `Completed`), and submit completion notes.

### 2.6 Extended Operational Analytics (Priority 6)
* **Current State:** The Living Score engine (`/api/v1/analytics/living-score`) is functional. However, `CommunityAnalytics.jsx` still relies on hardcoded example statistics.
* **What's Left:**
  * Add aggregated database reporting endpoints: complaint resolution turnaround time, occupancy percentage, monthly maintenance expenditure, and resident satisfaction score.
  * Connect charts and metric cards in `CommunityAnalytics.jsx` to live aggregates.

### 2.7 Visual Polish & Responsive Styling (Priority 7)
* **Current State:** Core desktop layouts are responsive, but secondary screens need refinement.
* **What's Left:**
  * Responsive pass for tablet and mobile viewport widths across all dashboards.
  * Audit and replace temporary placeholder badge counters with live badge counts.
  * Standardize high-resolution logo and SVG icons across sidebar navigation.

---

## 3. Current System Health & Verification Summary

| Component | Status | Notes |
| :--- | :--- | :--- |
| **Frontend Production Build** | **PASSING** | Built cleanly via `npm run build` (`dist/`) |
| **Backend Python Compilation** | **PASSING** | Compiled with 0 syntax or import errors via `compileall` |
| **Git Working Tree** | **CLEAN** | On `main` branch; `venv` and `.pyc` clutter untracked |
| **Authentication Flow** | **LIVE** | JWT authentication, session persistence, role routing active |
| **Resident Directory** | **LIVE** | Fully connected to PostgreSQL database |
| **Property Management** | **LIVE** | Create, view, and patch updates functional |
| **Complaints & Issues** | **LIVE** | Basic complaint submission and list connected to API |
