# Open University of Tanzania (OUT) LMS
## Master Implementation Plan: Step-by-Step Execution Guide

> [!IMPORTANT]
> **Execution Policy**: Every step in this plan is executed sequentially. **No step is started without explicit user review, confirmation, and approval of the preceding step.**

---

## Progress Overview

| Phase | Description | Status | Approval Gate |
|---|---|:---:|:---:|
| **Step 1** | Create proposed directory architecture in workspace | 🟢 **Completed** | Approved & Committed (658fdf3) |
| **Step 2** | Clone official Moodle, configure WAMP DB, run migrations & align structure | 🟢 **Completed** | **Awaiting User Review / Approval Gate 2** |
| **Step 3** | Enable Web Services, create Service User/Tokens & wire React API | ⚪ Ready for Step 3 | Required before Step 3 |
| **Step 4** | Adapt Payment Plugin template for Pesapal & Selcom (M-Pesa/Airtel/Tigo) | ⚪ Pending Step 3 | Required before Step 4 |

---

## Detailed Step Specifications

### 🔹 STEP 1: Workspace Directory Structure Scaffolding
* **Objective:** Establish clean structural boundaries for Frontend, Gateway Bridge, and Moodle Backend without disrupting the active React application.
* **Status:** 🟢 **Completed** (Frontend isolated in `frontend/`, Gateway Bridge in PHP 8.3, `src/core/api/` TypeScript service layer).

---

### 🔹 STEP 2: Official Moodle 5.3 Clone, Database Setup, Ecosystem Alignment & Verification
* **Objective:** Deploy clean official Moodle 5.3 backend on local WAMP with active database migrations and align architecture with official Moodle repositories (`moodle/moodle.git`, `moodle/integration.git`, `moodle/seed.git`, `moodle/composer-installer.git`, `moodlehq/moodleapp.git`, and the Moodle App plugin guide).
* **Completed Actions & Findings:**
  1. **Cloned Moodle 5.3 STABLE:** Cloned official Moodle 5.3 (`MOODLE_503_STABLE`) into `moodle-backend/`.
  2. **Ecosystem & Structure Alignment:**
     - **`moodle/integration.git`:** Moodle upstream integration mirror tracked for weekly integration rollups and security cherry-picks.
     - **`moodle/seed.git` & `moodle/composer-installer.git`:** Configured Composer-managed dependencies inside `moodle-backend/`. Run `composer install --no-dev` resolving 60 vendor packages (`league/oauth2-server`, `slim/slim`, `guzzlehttp/psr7`, `firebase/php-jwt`, etc.). Moodle plugin types (`moodle-payment-gateway`, `moodle-local`) will be handled through Composer installers.
     - **`moodlehq/moodleapp.git`:** Frontend API layer (`frontend/src/core/api/`) aligned with official TypeScript interfaces and REST endpoints (`core_course_*`, `core_enrol_*`, `core_user_*`, `core_webservice_*`).
     - **Plugin Development Guide (`db/mobile.php` & `classes/output/mobile.php`):** Identified standard mechanism for plugins (e.g. Pesapal / Selcom payment gateways) to expose headless checkout data via `tool_mobile_get_content`.
  3. **WAMP Database Migrated:**
     - MariaDB 11.4.9 on `127.0.0.1:3307` configured for database `moodle_out` with `utf8mb4_unicode_ci`.
     - Executed full database migration creating all **499 database tables** and default admin user (`admin` / `OutLms@2026!`).
  4. **Data Directory:** Created secure dataroot `C:\wamp64\moodledata` outside public webroot.
  5. **Moodle 5.3 Router & Apache Rewrite:** Configured `moodle-backend/.htaccess` routing to `public/r.php`.
  6. **Verification Checks:**
     - `http://localhost/outlmstheme/moodle-backend/login/index.php` -> **HTTP 200 OK**
     - `http://localhost/outlmstheme/moodle-backend/api/rest/v2/openapi.json` -> **HTTP 200 OK (OpenAPI JSON specification served)**
     - `php admin/cli/checks.php` -> Router configuration check: **PASSED (OK)**
* **👉 User Approval Gate 2**: User reviews Moodle backend status and confirms before starting Step 3.

---

### 🔹 STEP 3: Moodle Web Services API Setup & React Frontend Integration
* **Objective:** Turn Moodle into a 100% headless API engine and connect our modern React frontend.
* **Actions:**
  1. **Moodle Configuration:**
     - Enable Web Services (`enablewebservices = 1`).
     - Enable REST protocol (`webservice_rest`).
     - Enable Mobile Services (`enablemobilewebservice = 1`).
     - Create an External Service: `out_lms_service` containing all student, instructor, and admin function capabilities.
     - Generate persistent Web Service API Token for the application.
  2. **React Connection:**
     - Add `.env` file to React with:
       ```env
       REACT_APP_MOODLE_URL=http://localhost:8080/moodle
       REACT_APP_MOODLE_TOKEN=your_generated_token_here
       REACT_APP_USE_MOCK=false
       ```
     - Wire `src/core/api/courseService.ts` to call `core_course_get_categories` and `core_course_get_courses`.
     - Wire `src/core/auth/authContext.tsx` to authenticate against Moodle's `/login/token.php`.
     - Connect student dashboard timeline and enrolled courses to `core_course_get_enrolled_courses_by_timeline`.
* **Verification & Checkpoint:**
  - Test login in React frontend with Moodle user credentials.
  - Verify courses created in Moodle appear dynamically on the React homepage and catalog.
  - **👉 User Approval Gate 3**: User tests live data synchronization and approves before starting Step 4.

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

We are currently standing by at **Approval Gate 1**. Upon your go-ahead, we will execute **Step 1 (Workspace Directory Structure Scaffolding)**.
