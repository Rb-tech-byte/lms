# Open University of Tanzania (OUT) LMS
## Enterprise Headless Architecture & System Design Document

> [!IMPORTANT]
> **Mission Statement**: Transform the Open University of Tanzania's e-learning experience by marrying a **Coursera/Udemy-grade modern React frontend** with the **Moodle 5.3 academic, compliance, and grading engine**. The end user never sees or interacts with Moodle's default interface; all operations are executed via secure REST APIs and custom bridge plugins.

---

## 1. High-Level System Architecture

```mermaid
flowchart TB
    subgraph ClientLayer ["1. Presentation Layer (outlmstheme React SPA)"]
        A1["Public Portal<br/>(Coursera/Udemy Catalog)"]
        A2["Student Portal<br/>(Timeline, Quizzes, Grades)"]
        A3["Instructor Portal<br/>(Course Builder, Submissions)"]
        A4["Admin Portal<br/>(Users, Financials, Plugins)"]
        A5["Checkout Flow<br/>(Mobile Money / Cards)"]
    end

    subgraph GatewayLayer ["2. API Gateway & Middleware Bridge"]
        B1["Reverse Proxy / SSL<br/>(Nginx / Caddy)"]
        B2["OUT API Gateway<br/>(PHP 8.3 REST Bridge)"]
        B3["Token & Session Vault<br/>(Redis / JWT)"]
        B4["IPN Webhook Listener<br/>(Pesapal / Selcom Callbacks)"]
    end

    subgraph MoodleLayer ["3. Backend Core (Moodle 5.3 LMS Engine)"]
        C1["Moodle Core REST API<br/>(/webservice/rest/server.php)"]
        C2["Custom Bridge Plugin<br/>(local/outlms_bridge)"]
        C3["Payment Subsystem<br/>(payment/gateway/pesapal & selcom)"]
        C4["Assessment Engines<br/>(mod_quiz, mod_assign, mod_h5p)"]
        C5["Gradebook & Tracking<br/>(Completion, Badges, Analytics)"]
        C6["Moodle Database<br/>(PostgreSQL / MariaDB) & Moodledata"]
    end

    subgraph PaymentGateways ["4. East African Payment Providers"]
        D1["Pesapal Gateway<br/>(Cards, Bank, MPESA)"]
        D2["Selcom Paypoint<br/>(M-Pesa, Airtel, Tigo, HaloPesa)"]
    end

    %% Flow Connections
    ClientLayer -->|HTTPS / JSON REST| B1
    B1 --> B2
    B2 -->|Session & Auth| B3
    B2 -->|Moodle Web Services| C1
    B2 -->|Privileged Admin APIs| C2
    A5 -->|Initiate Payment| D1 & D2
    D1 & D2 -->|Instant Payment Notification / IPN| B4
    B4 -->|Auto-Enrol Student| C1
    C1 --> C4 & C5
    C2 --> C4 & C5
    C4 & C5 --> C6
```

---

## 2. Comprehensive Directory & File Structure

Here is the exact structural organization for the complete enterprise ecosystem, cleanly segregated between the **Frontend Application**, the **Middleware / Gateway**, and the **Moodle 5.3 Backend Engine**.

```text
/out-lms-platform/
│
├── 📂 frontend/                           # Current React Application (outlmstheme)
│   ├── 📂 public/
│   │   ├── favicon.png
│   │   ├── index.html                    # Root HTML with OUT branding & meta tags
│   │   └── assets/                       # Static images, university logos, webfonts
│   ├── 📂 src/
│   │   ├── 📂 core/                      # Core infrastructure
│   │   │   ├── 📂 api/                   # [NEW] Moodle API Client & Service Abstraction
│   │   │   │   ├── apiClient.ts          # Axios / Fetch client with Moodle token injection
│   │   │   │   ├── moodleEndpoints.ts    # URLs for core and custom web service functions
│   │   │   │   ├── courseService.ts      # Categories, courses, course contents, syllabus
│   │   │   │   ├── studentService.ts     # Enrolled courses, timeline, quiz attempts, grades
│   │   │   │   ├── instructorService.ts  # Grading, submissions, course moderation
│   │   │   │   ├── adminService.ts       # User creation, role assignment, plugin status
│   │   │   │   └── paymentService.ts     # Pesapal & Selcom checkout initialization
│   │   │   ├── 📂 auth/                  # State management for users and roles
│   │   │   │   ├── authContext.tsx       # AuthProvider, useAuth hook, session persistence
│   │   │   │   ├── demoUsers.ts          # Realistic mock profiles (fallback/offline mode)
│   │   │   │   └── tokenStorage.ts       # Secure storage for Moodle WS tokens & cookies
│   │   │   ├── 📂 common/                # Shared layout components
│   │   │   │   ├── 📂 header/            # Dynamic Role-Based Header (Student, Instructor, Admin)
│   │   │   │   ├── 📂 footer/            # Unified OUT LMS Footer
│   │   │   │   ├── 📂 modal/             # Video modals, confirmation dialogs, payment prompts
│   │   │   │   └── 📂 breadcrumb/        # Contextual breadcrumbs
│   │   │   └── 📂 data/                  # Static navigation JSON & dictionary lookups
│   │   │
│   │   ├── 📂 feature-module/            # Role-Specific Feature Modules
│   │   │   ├── 📂 HomePages/             # Marketing & Public Discovery
│   │   │   │   └── 📂 home/              # Hero banner, category browser, top courses, testimonials
│   │   │   ├── 📂 courses/               # Course catalog, search filters, course details
│   │   │   ├── 📂 classroom/             # [NEW] Headless Course Player (Videos, PDFs, H5P, Quiz)
│   │   │   │   ├── CourseViewer.tsx      # Main lesson viewer container
│   │   │   │   ├── VideoPlayer.tsx       # Embedded video player with progress ping
│   │   │   │   ├── QuizAttempt.tsx       # Headless quiz engine consuming mod_quiz
│   │   │   │   └── AssignmentSubmit.tsx  # File upload & text submission to Moodle
│   │   │   ├── 📂 student/               # Student Portal
│   │   │   │   ├── 📂 common/            # studentSidebar.tsx, profileCard.tsx
│   │   │   │   ├── 📂 dashboard/         # studentDashboard.tsx (Progress, upcoming exams)
│   │   │   │   ├── 📂 student-course/    # Enrolled courses & completed certificates
│   │   │   │   └── 📂 student-quiz/      # Past exam results and grading breakdowns
│   │   │   ├── 📂 Instructor/            # Instructor / Faculty Portal
│   │   │   │   ├── 📂 common/            # instructorSidebar.tsx, profileCard.tsx
│   │   │   │   ├── 📂 instructor-dashboard/ # Student roster, submission alerts, analytics
│   │   │   │   ├── 📂 course-builder/    # Headless course creator (sections, modules)
│   │   │   │   └── 📂 grading/           # Assignment rubric evaluation & grade entry
│   │   │   ├── 📂 admin/                 # Super Administrator Portal
│   │   │   │   ├── 📂 common/            # adminSidebar.tsx
│   │   │   │   ├── adminDashboard.tsx    # University metrics, enrollment counters
│   │   │   │   ├── userManagement.tsx    # Add/edit students, lecturers, assign roles
│   │   │   │   ├── pluginDirectory.tsx   # View Moodle plugins status (enabled/disabled)
│   │   │   │   └── systemSettings.tsx    # University academic calendar, semester locks
│   │   │   ├── 📂 checkout/              # Payment & Enrollment Workflow
│   │   │   │   ├── Cart.tsx              # Course basket
│   │   │   │   ├── Checkout.tsx          # Tanzanian Mobile Money / Card selector
│   │   │   │   └── PaymentCallback.tsx   # Receipt verification & auto-redirect to course
│   │   │   └── 📂 router/                # All application routes and protected route guards
│   │   ├── App.tsx                       # Root React router
│   │   └── index.tsx                     # Entry point wrapping Redux & AuthProvider
│   ├── package.json
│   └── tsconfig.json
│
├── 📂 gateway-bridge/                     # [NEW] Lightweight Middleware / Orchestrator (PHP 8.3)
│   ├── 📂 src/
│   │   ├── 📂 Controllers/
│   │   │   ├── AuthController.php        # Exchanges user credentials for Moodle WS Token
│   │   │   └── PaymentController.php     # Pesapal & Selcom checkout + IPN webhooks
│   │   └── 📂 Services/
│   │       └── MoodleClient.php          # Secure server-to-server call to Moodle Web Services
│   ├── index.php                         # Front controller / REST router
│   ├── config.php                        # Environment & Moodle credentials
│   └── .env.example
│
└── 📂 moodle-backend/                     # Moodle 5.3 Core Engine
    ├── 📂 admin/                         # Native Moodle site administration & CLI scripts
    │   └── 📂 cli/                       # purge_caches.php, upgrade.php, install_plugin.php
    ├── 📂 local/
    │   └── 📂 outlms_bridge/             # [NEW] Custom OUT LMS Moodle Plugin
    │       ├── version.php               # Plugin version & Moodle requirements
    │       ├── db/
    │       │   ├── services.php          # Declares custom External Functions for Web Services
    │       │   └── access.php            # Defines custom capabilities
    │       ├── classes/
    │       │   └── external/
    │       │       ├── admin_api.php     # Exposes plugin management & site config to React
    │       │       ├── payment_api.php   # Handles custom fee transactions
    │       │       └── analytics_api.php # Generates aggregated university statistics
    │       └── lang/en/local_outlms_bridge.php
    ├── 📂 payment/
    │   └── 📂 gateway/
    │       ├── 📂 pesapal/               # [NEW] Moodle Native Pesapal Gateway Plugin
    │       │   ├── version.php
    │       │   ├── classes/gateway.php   # Implements \core_payment\gateway
    │       │   └── ipn.php               # IPN listener endpoint
    │       └── 📂 selcom/                # [NEW] Moodle Native Selcom Gateway Plugin
    │           ├── version.php
    │           ├── classes/gateway.php
    │           └── webhook.php
    ├── 📂 webservice/                    # Native Moodle REST endpoint (/webservice/rest/server.php)
    ├── config.php                        # Database connection & filedir configuration
    └── ... (Standard Moodle 5.3 core directories: course, mod, enrol, user, theme)
```

---

## 3. End-to-End Operational Workflows

### Workflow 1: Authentication & Role Discovery
```mermaid
sequenceDiagram
    autonumber
    actor User as Student / Lecturer / Admin
    participant React as React Frontend (OUT LMS)
    participant Bridge as Gateway Bridge
    participant Moodle as Moodle 5.3 Backend

    User->>React: Enters username/email & password on /login
    React->>Bridge: POST /api/auth/login { username, password }
    Bridge->>Moodle: POST /login/token.php?service=outlms_mobile_service
    Moodle-->>Bridge: Returns { token, private_token }
    Bridge->>Moodle: Call core_webservice_get_site_info(token)
    Moodle-->>Bridge: Returns { userid, fullname, userrole, usercanmanage, department }
    Bridge-->>React: Set HttpOnly Cookie / Returns UserProfile + Token
    React->>React: AuthContext updates state (role = 'student' | 'instructor' | 'admin')
    React->>User: Instant redirect to role-specific dashboard!
```

---

### Workflow 2: Course Purchase & Instant Enrollment via Mobile Money (Pesapal / Selcom)
```mermaid
sequenceDiagram
    autonumber
    actor Student as Student (Tanzania)
    participant React as React Checkout (/checkout)
    participant Bridge as Gateway Bridge
    participant Selcom as Selcom / Pesapal API
    participant Moodle as Moodle 5.3 Backend

    Student->>React: Selects "Pay with M-Pesa / Tigo Pesa" & enters phone number
    React->>Bridge: POST /api/payment/checkout { courseId, amount, phone, gateway }
    Bridge->>Selcom: Initiate Push USSD / Card Order (reference: OUT-ORD-9842)
    Selcom-->>Student: USSD Prompt appears on phone: "Enter M-Pesa PIN to pay TZS 150,000"
    Student->>Selcom: Enters PIN & confirms payment
    Selcom->>Bridge: Webhook / IPN: Payment Successful { reference, status: COMPLETED }
    Bridge->>Moodle: Call enrol_manual_enrol_users(roleid: 5, userid, courseid)
    Moodle-->>Bridge: Confirmation { status: true, enrolled_at: timestamp }
    Bridge-->>React: WebSocket / SSE: Payment Verified!
    React->>Student: Success Animation: "Enrolled! Welcome to the course."
    React->>Student: Direct redirect to /classroom/course-view?id=42
```

---

### Workflow 3: Headless Course Consumption (Classroom Engine)
```mermaid
sequenceDiagram
    autonumber
    actor Student as Student
    participant React as React Classroom (/classroom)
    participant Moodle as Moodle 5.3 Backend

    Student->>React: Opens enrolled course
    React->>Moodle: core_course_get_contents(courseid)
    Moodle-->>React: Returns JSON: Sections, Modules, Lessons, Videos, Quizzes
    React->>React: Renders custom Coursera-style video player & sidebar checklist
    Student->>React: Clicks "Take Module Quiz"
    React->>Moodle: mod_quiz_start_attempt(quizid)
    Moodle-->>React: Returns questions array & attempt ID
    Student->>React: Selects answers & clicks "Submit Exam"
    React->>Moodle: mod_quiz_process_attempt(attemptid, answers, finish: 1)
    Moodle-->>React: Returns grade, feedback, and logs completion to Gradebook!
    React->>Student: Displays instant score summary & completion badge
```

---

### Workflow 4: Administrator Headless Operations
```mermaid
sequenceDiagram
    autonumber
    actor Admin as Super Administrator
    participant React as React Admin (/admin/dashboard)
    participant Bridge as Gateway Bridge
    participant CustomPlugin as Moodle local_outlms_bridge
    participant Moodle as Moodle Core

    Admin->>React: Views "System & Plugin Health" in Admin Portal
    React->>Bridge: GET /api/admin/plugins
    Bridge->>CustomPlugin: Call local_outlms_get_plugin_status()
    CustomPlugin->>Moodle: Queries core_plugin_manager::get_plugins()
    Moodle-->>CustomPlugin: Returns plugin matrix (versions, updates available, enabled state)
    CustomPlugin-->>React: Renders sleek modern table with 1-click Toggle switches
    Admin->>React: Clicks "Toggle Maintenance Mode" or "Approve New Course"
    React->>Bridge: POST /api/admin/toggle-maintenance { enabled: true }
    Bridge->>CustomPlugin: Call local_outlms_set_config('maintenance_enabled', 1)
    CustomPlugin->>Moodle: admin_apply_default_settings() & purge_caches()
    CustomPlugin-->>React: Status updated with zero direct Moodle logins needed!
```

---

## 4. Moodle Core Web Services Function Mapping

Below is the definitive reference table connecting every React view directly to its corresponding Moodle 5.3 Web Service function:

| React View / Feature | Moodle 5.3 Core Web Service Function | Purpose |
|---|---|---|
| **Course Catalog & Categories** | `core_course_get_categories`<br/>`core_course_get_courses` | Fetches faculties, departments, and course list with thumbnails and prices |
| **Course Details Page** | `core_course_get_course_module`<br/>`core_course_get_contents` | Retrieves full course syllabus, sections, lessons, and activity outlines |
| **Student Dashboard** | `core_course_get_enrolled_courses_by_timeline`<br/>`core_completion_get_course_completion_status` | Returns active courses, percentage complete, and upcoming due dates |
| **Headless Quiz Player** | `mod_quiz_get_quizzes_by_courses`<br/>`mod_quiz_start_attempt`<br/>`mod_quiz_process_attempt` | Starts an exam attempt, records student answers, submits and auto-grades |
| **Assignment Submission** | `mod_assign_get_assignments`<br/>`mod_assign_save_submission` | Displays essay prompts, rubric guides, and accepts PDF/file uploads |
| **Gradebook & Results** | `gradereport_user_get_grade_items`<br/>`core_grades_get_grades` | Pulls weighted grades, GPA metrics, lecturer remarks, and certificates |
| **Instructor Course Builder** | `core_course_create_courses`<br/>`core_course_update_courses`<br/>`core_course_create_categories` | Allows lecturers to publish new courses and structure modules headlessly |
| **Instructor Grading Desk** | `mod_assign_get_submissions`<br/>`mod_assign_save_grade` | Displays student submissions and saves marks directly into Moodle gradebook |
| **Admin User Management** | `core_user_create_users`<br/>`core_user_update_users`<br/>`core_role_assign_roles` | Provisions student, teacher, and administrative accounts with roles |
| **Instant Enrollment (Post-Pay)**| `enrol_manual_enrol_users` | Instantly enrols student into course upon Pesapal/Selcom payment confirmation |
| **Messaging & Announcements** | `core_message_send_instant_messages`<br/>`mod_forum_get_forum_discussions` | Real-time notifications, university broadcast news, and forum threads |

---

## 5. Security & Multi-Role Access Model

1. **Token Scope Segregation:**
   * **Students:** Issue tokens restricted strictly to student-level services (`moodle/course:view`, `mod/quiz:attempt`, `mod/assign:submit`).
   * **Instructors:** Issue tokens with editing capabilities (`moodle/course:update`, `mod/assign:grade`).
   * **Administrators:** Require Multi-Factor Authentication (MFA) via SMS OTP / Authenticator before granting admin bridge tokens.
2. **Data Privacy & Compliance (TCU & Data Protection):**
   * All student academic records, exam logs, and grade data remain strictly within Moodle's relational database.
   * Student payment information (card numbers, PINs) is handled 100% off-site by Pesapal and Selcom compliant PCI-DSS gateways.

---

## 6. Recommended Phased Implementation Roadmap

```text
[Phase 1: React API Service Layer]
  └── Centralize current mock data into `src/core/api/` with Moodle response models.
  └── Enable live switching between Mock Mode and Moodle API Mode via .env.

[Phase 2: Moodle 5.3 Local Instance & Web Services Setup]
  └── Install clean Moodle 5.3 (PHP 8.2+, MariaDB/Postgres).
  └── Enable Web Services and create the `outlms_mobile_service` service user.
  └── Test basic endpoints (getCategories, getCourses) via Postman/cURL.

[Phase 3: The Custom Moodle Bridge Plugin (`local_outlms_bridge`)]
  └── Scaffold `local/outlms_bridge/` in Moodle.
  └── Expose custom administrative functions (plugin manager status, site settings).

[Phase 4: Tanzanian Payment Gateway Integration (Pesapal & Selcom)]
  └── Implement IPN Webhook listener in the gateway bridge.
  └── Test sandbox M-Pesa, Airtel Money, and Card checkouts with auto-enrolment.

[Phase 5: Final Headless Polish & University UAT]
  └── Conduct load testing for simultaneous quiz submissions.
  └── Roll out to the Open University of Tanzania staging server.
```
