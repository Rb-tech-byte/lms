# Open University of Tanzania (OUT) LMS
## Master Implementation Plan: Step-by-Step Execution Guide

> [!IMPORTANT]
> **Execution Policy**: Every step in this plan is executed sequentially. **No step is started without explicit user review, confirmation, and approval of the preceding step.**

---

## Progress Overview

| Phase | Description | Status | Approval Gate |
|---|---|:---:|:---:|
| **Step 1** | Create proposed directory architecture in workspace | 🟢 **Completed** | Approved & Committed (658fdf3) |
| **Step 2** | Clone official Moodle, configure WAMP DB, and run migrations | 🟡 **Ready to Start** | Awaiting User Approval |
| **Step 3** | Enable Web Services, create Service User/Tokens & wire React API | ⚪ Pending Step 2 | Required before Step 3 |
| **Step 4** | Adapt Payment Plugin template for Pesapal & Selcom (M-Pesa/Airtel/Tigo) | ⚪ Pending Step 3 | Required before Step 4 |

---

## Detailed Step Specifications

### 🔹 STEP 1: Workspace Directory Structure Scaffolding
* **Objective:** Establish clean structural boundaries for Frontend, Gateway Bridge, and Moodle Backend without disrupting the active React application.
* **Actions:**
  1. **Frontend API Layer:**
     - Create `src/core/api/` with:
       - `apiClient.ts` (Axios / Fetch client with Moodle token injection and environment switcher)
       - `moodleEndpoints.ts` (centralized registry of Moodle external function names and paths)
       - `courseService.ts`, `studentService.ts`, `instructorService.ts`, `adminService.ts`, `paymentService.ts`
  2. **Gateway Bridge:**
     - Create `gateway-bridge/` scaffold with PHP 8.3 (`index.php`, `config.php`, `MoodleClient.php`, and `PaymentController.php`) for token brokering, payments (Pesapal/Selcom), and IPN webhooks.
  3. **Backend Root Preparation:**
     - Create `/moodle-backend` mount point and `/moodledata` secure storage folder (`c:\wamp64\moodledata`).
* **Verification & Checkpoint:**
  - Verify folder structure with directory tree check.
  - Run `npx tsc --noEmit` on React frontend to ensure zero compilation regressions.
  - **👉 User Approval Gate 1**: User reviews and approves before starting Step 2.

---

### 🔹 STEP 2: Official Moodle 5.x Clone, Database Setup & Verification
* **Objective:** Deploy clean official Moodle 5.x backend on the local WAMP environment with active database migrations.
* **Environment Detected:**
  - PHP: **8.3.28** (Zend OPcache, Xdebug, CLI active)
  - Database: **MariaDB 11.4.9** / **MySQL 8.4.7** in WAMP (`wampmariadb64` / `wampmysqld64`)
  - Web Server: WAMP Apache (`wampapache64`) / PHP CLI server
* **Actions:**
  1. Clone official Moodle git repository (`https://github.com/moodle/moodle.git`) with standard plugins into `moodle-backend/`.
  2. Start WAMP database service (`wampmariadb64` on port `3306`/`3307`).
  3. Create dedicated database: `moodle_out` with character set `utf8mb4` and collation `utf8mb4_unicode_ci`.
  4. Create `c:\wamp64\moodledata` directory with full read/write permissions.
  5. Run non-interactive Moodle CLI installation:
     ```powershell
     php moodle-backend/admin/cli/install.php --lang=en --wwwroot="http://localhost:8080/moodle" --dataroot="c:/wamp64/moodledata" --dbtype="mariadb" --dbname="moodle_out" --dbuser="root" --dbpass="" --fullname="Open University of Tanzania LMS" --shortname="OUTLMS" --adminuser="admin" --adminpass="OutLms@2026!" --adminemail="ict@out.ac.tz" --non-interactive --agree-license
     ```
  6. Verify database tables (over 400+ Moodle tables created) and verify Moodle engine responds via CLI and HTTP.
* **Verification & Checkpoint:**
  - Verify `php admin/cli/checks.php` status is OK.
  - **👉 User Approval Gate 2**: User reviews Moodle backend status and confirms before starting Step 3.

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
