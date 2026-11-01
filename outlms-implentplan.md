# Open University of Tanzania (OUT) LMS
## Master Implementation Plan: Step-by-Step Execution Guide

> [!IMPORTANT]
> **Execution Policy**: Every step in this plan is executed sequentially. **No step is started without explicit user review, confirmation, and approval of the preceding step.**

---

## Progress Overview

| Phase | Description | Status | Approval Gate |
|---|---|:---:|:---:|
| **Step 1** | Create proposed directory architecture in workspace | 🟢 **Completed** | Approved & Committed (658fdf3) |
| **Step 2** | Clone official Moodle, configure WAMP DB, run migrations & dynamic config | 🟢 **Completed** | Approved (cba0aa8) |
| **Step 3** | Enable Web Services, dynamic tokens, live React auth & course catalog | 🟢 **Completed** | **Awaiting Review / Approval Gate 3** |
| **Step 4** | Adapt Payment Plugin template for Pesapal & Selcom (M-Pesa/Airtel/Tigo) | ⚪ Ready for Step 4 | Required before Step 4 |

---

## Detailed Step Specifications

### 🔹 STEP 1: Workspace Directory Structure Scaffolding
* **Objective:** Establish clean structural boundaries for Frontend, Gateway Bridge, and Moodle Backend without disrupting the active React application.
* **Status:** 🟢 **Completed** (Frontend isolated in `frontend/`, Gateway Bridge in PHP 8.3, `src/core/api/` TypeScript service layer).

---

### 🔹 STEP 2: Official Moodle 5.3 Clone, Database Setup, Dynamic Config & Verification
* **Objective:** Deploy clean official Moodle 5.3 backend on local WAMP with active database migrations and align architecture with official Moodle repositories (`moodle/moodle.git`, `moodle/integration.git`, `moodle/seed.git`, `moodle/composer-installer.git`, `moodlehq/moodleapp.git`, and the Moodle App plugin guide).
* **Completed Actions & Findings:**
  1. **Cloned Moodle 5.3 STABLE:** Cloned official Moodle 5.3 (`MOODLE_503_STABLE`) into `moodle-backend/`.
  2. **Ecosystem & Structure Alignment:**
     - **`moodle/integration.git`:** Moodle upstream integration mirror tracked for weekly integration rollups and security cherry-picks.
     - **`moodle/seed.git` & `moodle/composer-installer.git`:** Configured Composer-managed dependencies inside `moodle-backend/`. Run `composer install --no-dev` resolving 60 vendor packages (`league/oauth2-server`, `slim/slim`, `guzzlehttp/psr7`, `firebase/php-jwt`, etc.).
     - **`moodlehq/moodleapp.git`:** Frontend API layer (`frontend/src/core/api/`) aligned with official TypeScript interfaces and REST endpoints (`core_course_*`, `core_enrol_*`, `core_user_*`, `core_webservice_*`).
  3. **WAMP Database Migrated:**
     - MariaDB 11.4.9 on `127.0.0.1:3307` configured for database `moodle_out` with `utf8mb4_unicode_ci`.
     - Executed full database migration creating all **499 database tables** and default admin user (`admin` / `OutLms@2026!`).
  4. **Strict Zero-Hardcoding Architecture:**
     - Refactored `moodle-backend/config.php` to dynamically compute `$CFG->wwwroot` from `$_SERVER['DOCUMENT_ROOT']` / `$_SERVER['HTTP_HOST']` or `MOODLE_WWWROOT` / `APP_URL`.
     - Refactored `$CFG->dataroot` to auto-discover parent storage directories or read `MOODLE_DATAROOT` from `.env`. No hardcoded drive letters or folder paths.
     - Created `moodle-backend/.env` and `.env.example`.
  5. **Moodle 5.3 Router & Apache Rewrite:** Configured `moodle-backend/.htaccess` routing to `public/r.php`.
  6. **Verification Checks:**
     - `http://localhost/outlmstheme/moodle-backend/login/index.php` -> **HTTP 200 OK**
     - `http://localhost/outlmstheme/moodle-backend/api/rest/v2/openapi.json` -> **HTTP 200 OK (OpenAPI JSON specification served)**
     - `php admin/cli/checks.php` -> Router configuration check: **PASSED (OK)**

---

### 🔹 STEP 3: Moodle Web Services API Setup & React Frontend Integration
* **Objective:** Turn Moodle into a 100% headless API engine and connect our modern React frontend.
* **Completed Actions:**
  1. **Moodle Configuration:**
     - Enabled Web Services (`enablewebservices = 1`).
     - Enabled REST protocol (`webserviceprotocols = rest`).
     - Enabled Mobile Services (`enablemobilewebservice = 1`).
     - Activated external service `moodle_mobile_app`.
     - Generated persistent Web Service API Token for admin: `cac3488049fb0d8247867a568bea7c79`.
  2. **Academic Seeding:**
     - Seeded faculties: Faculty of Science, Technology and Environmental Studies (FSTES) & Faculty of Business Management (FBM).
     - Seeded courses: CS101 (Data Structures & Algorithms in Python), CS202 (Cloud Computing & Distributed Systems), BBA301 (Financial Management & Strategic Planning).
  3. **React Connection & Zero-Hardcoding:**
     - Added `frontend/.env` and `frontend/.env.example` with dynamic base URL, service name, and token keys.
     - Upgraded `frontend/src/core/api/apiClient.ts` to support runtime configuration (`window.__OUT_LMS_CONFIG__`) and dynamic host-relative path fallback.
     - Updated `frontend/src/core/auth/authContext.tsx` and `login.tsx` to authenticate against Moodle's live token endpoint (`/login/token.php`) and retrieve full profile via `core_webservice_get_site_info`.
     - Updated `frontend/src/feature-module/courses/courses-grid/courseGrid.tsx` with live Moodle integration: dynamically queries categories and courses, supports search, category filtering, and real-time status.
     - Validated TypeScript: `npx tsc --noEmit` passed with **0 errors**.
* **👉 User Approval Gate 3**: User reviews live data synchronization, dynamic configuration, and confirms before starting Step 4.

---

### 🔹 STEP 4: Tanzanian Payment Gateway Adaptation (Pesapal & Selcom)
* **Objective:** Enable direct student checkout and instant enrollment via East African payment channels (M-Pesa, Airtel Money, Tigo Pesa, HaloPesa, and credit/debit cards).
* **Strategy:**
  - User will provide a clean open-source payment gateway plugin template (e.g., Moodle Stripe gateway `payment/gateway/stripe`).
  - We will duplicate and adapt the structure to:
    1. `moodle-backend/payment/gateway/pesapal/`
    2. `moodle-backend/payment/gateway/selcom/`
* **Actions:**
  1. Refactor plugin metadata (`version.php`, language strings, gateway classes implementing `\core_payment\gateway`).
  2. Implement Pesapal API v3 / Selcom Paypoint integration classes:
     - Authentication token generation.
     - Order registration with phone number & amount in TZS.
     - USSD Push trigger for M-Pesa / Tigo / Airtel.
  3. Create Instant Payment Notification (IPN) webhook listener (`ipn.php`):
     - Validates callback signature from Pesapal/Selcom.
     - Calls Moodle's `\core_payment\helper::deliver_order()`.
     - Triggers Moodle Enrolment API (`enrol_fee` / `enrol_manual_enrol_users`) to instantly grant student access.
  4. Connect the React checkout screen (`/checkout`) with interactive Tanzanian payment buttons and live transaction polling.
* **Verification & Checkpoint:**
  - Run end-to-end sandbox test: Student selects course $\rightarrow$ Enters test M-Pesa phone number $\rightarrow$ Payment confirmed $\rightarrow$ Course opens immediately in student dashboard!
  - **👉 User Approval Gate 4**: Final review and sign-off.

---

## Current Status & Next Action

We have completed **Step 2** and **Step 3**, with all hardcoded paths completely eradicated from configuration and API layers. We are currently at **Approval Gate 3**. Upon your confirmation and provision/reference to the payment plugin template, we will execute **Step 4 (Pesapal & Selcom Payment Gateway Adaptation)**.

