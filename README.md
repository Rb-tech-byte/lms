# OUT LMS — Enterprise Open University of Tanzania Learning Management System

> **Official TCU & SARIS Accredited National Distance & Blended Learning Ecosystem**  
> *Affordable Quality Education for All (Chuo Kikuu Huria cha Tanzania)*

---

## 🏛️ Executive Overview

**OUT LMS** is a next-generation, headless enterprise Learning Management System engineered specifically for **The Open University of Tanzania (OUT)**. It bridges the academic depth of **Moodle 5.x core** with a reactive, ultra-responsive **React 18 + TypeScript** portal designed for high concurrency, zero-flicker client-side navigation, mobile-first distance scholars, and corporate cohorts.

### 🌟 Key Highlights
- **100% Dynamic Real Data**: Zero hardcoded values. Every statistic, KPI, student submission, grade, and course catalog item is queried live via internal high-performance REST APIs joining Moodle database tables.
- **Topic-Specific Thematic Visual Identity**: Eliminates uniform card monotony ("kachumbali"). Every course discipline (Cybersecurity, Data Science, Web & Mobile, GIS, FinTech, Cloud, AI, Law, Pedagogy) features its own custom SVG vector illustration and authentic domain palette, anchored by the official OUT Royal Azure (`#0171BB`) and Academic Gold (`#FFD200`).
- **Comprehensive Administrative Command Center**: Full Administrative CUD (Create, Read, Update, Delete) with real-time multi-criteria filtering, live search, and multi-format data exports (CSV, Excel, PDF, Print).
- **Instructor Teaching Console**: Streamlined assessment oversight, rubric marking, student submissions review, live announcements, and grading workflows.
- **National & International Payment Integration**: Native **Pesapal 3.0** payment gateway supporting Tanzanian Mobile Money (M-Pesa, Airtel Money, Tigo Pesa, HaloPesa) and International Cards (Visa / Mastercard).
- **Automated Verifiable Digital Credentials**: Instant certificate issuance with unique QR verification codes complying with university standards.

---

## 🛠️ Technology Stack

| Layer | Technologies | Purpose |
| :--- | :--- | :--- |
| **Frontend UI** | **React 18**, **TypeScript**, **React Router 6** | Fast Single-Page Application (SPA) with zero page reloads |
| **Styling & UX** | **Bootstrap 5**, **SCSS**, **Isax Icons**, **Feather Icons** | Responsive, mobile-first design system with OUT branding |
| **Backend Core** | **PHP 8.2+**, **Moodle 5.x Headless Architecture** | Course management, enrolment tracking, gradebook, and completions |
| **REST API Engine** | **Custom Native OUT API (`admin_api.php`, `sso.php`)** | Sub-50ms REST API bridge with RBAC authorization and CORS |
| **Database** | **MariaDB 11.4 / MySQL 8.x** | High-performance relational database with 400+ academic tables |
| **Payment Gateway**| **Pesapal 3.0 API (Direct & IPN)** | Automated order generation, webhooks, and payment receipting |
| **Containerization**| **Docker**, **Docker Compose** | One-command portable multi-container stack |

---

## 🚀 Deployment Options

### Option 1: One-Click Docker Compose (Recommended for Production & Cloud)

The fastest and most portable deployment method. Automatically provisions MariaDB, initialises and seeds the database, sets up PHP Apache, and compiles the React frontend.

```bash
# 1. Clone the repository
git clone https://lms.out.ac.tz/git/lms.git
cd lms

# 2. Copy environment template
cp .env.example .env

# 3. Launch the complete stack
docker compose up -d --build
```

- **Frontend Web Portal**: [http://localhost:3000](http://localhost:3000)
- **Backend API & Admin**: [http://localhost:8080](http://localhost:8080)
- **Database Server**: `localhost:3306` (Database: `moodle_out`)

---

### Option 2: Cross-Platform Native Deploy (Linux / macOS / Git Bash)

Deploy locally using the provided deployment script:

```bash
# Make script executable
chmod +x deploy.sh

# Run full deployment (checks environment, seeds database, and boots server)
./deploy.sh

# Additional deployment flags:
./deploy.sh --docker       # Run with Docker Compose
./deploy.sh --seed-only    # Only run the database seeder
./deploy.sh --build-only   # Only recompile the frontend bundle
```

---

### Option 3: Windows PowerShell Deployment

For Windows environments (including WAMP / XAMPP / native PHP):

```powershell
# Run default deployment
.\deploy.ps1

# With options:
.\deploy.ps1 -Docker       # Deploy via Docker
.\deploy.ps1 -SeedOnly     # Run only database seeder
.\deploy.ps1 -BuildOnly    # Rebuild frontend assets
```

---

### Option 4: Zero-Dependency Node.js Launcher

```bash
node start.js
```

---

## 🗄️ Database & Automated Seeding

The repository ships with the complete database schema and seed data containing all **19 official academic courses**, faculties, roles, demo users, enrolled scholars, gradebook items, quizzes, and thematic SVGs.

### Seeding Manually via CLI
```bash
# Seed with default environment credentials
php database/seed.php

# Or specify custom host, port, and credentials:
php database/seed.php --host=127.0.0.1 --port=3306 --user=root --pass=secret --db=moodle_out
```

### Key Pre-Seeded Course Disciplines

| Shortname | Programme Title | Faculty | Palette |
| :--- | :--- | :--- | :--- |
| **PSC-CYBER** | Cybersecurity & Ethical Hacking | IEMT / Science | Crimson (`#dc2626`) |
| **PSC-DATASCI**| Data Science & Machine Learning | IEMT / Science | Deep Violet (`#8b5cf6`) |
| **PSC-WEBMOB** | Modern Web & Mobile App Dev | IEMT / Science | Sky Cyan (`#06b6d4`) |
| **PSC-GIS** | GIS & Remote Sensing with Python | Science & Tech | Emerald (`#10b981`) |
| **PSC-CLOUD** | Cloud Computing & DevOps Architecture | Science & Tech | Cobalt Azure (`#2563eb`)|
| **PSC-FINTECH**| FinTech & Digital Financial Services | Business Mgmt | Gold / Amber (`#f59e0b`)|
| **PSC-ITPM** | Agile IT Project Management | Business Mgmt | Rose (`#ec4899`) |
| **MOOC-AI** | Generative AI in Higher Education | IEMT MOOCs | Cosmic Purple (`#a855f7`)|
| **CS101** | Data Structures & Algorithms in Python | Science & Tech | Emerald Green (`#10b981`)|
| **CS202** | Cloud Computing & Distributed Systems | Science & Tech | Tech Azure (`#0284c7`) |
| **BBA301** | Strategic Financial Management | Business Mgmt | Corporate Amber (`#d97706`)|

---

## 🔑 Default Credentials & Role Profiles

| Role | Username | Password | Dashboard URL | Capabilities |
| :--- | :--- | :--- | :--- | :--- |
| **Super Administrator** | `admin` | `Admin@123` | `/admin/dashboard` | Full system CUD, user management, site settings, telemetry, reports |
| **Senior Lecturer** | `teacher` | `Teacher@123` | `/instructor/instructor-dashboard` | Course director console, rubric grading, assignment reviews, announcements |
| **Student Scholar** | `student` | `Student@123` | `/student/student-dashboard` | Enrolled courses, lessons, quizzes, exam attempts, verifiable certificates |
| **Corporate Manager** | `corporate` | `Corporate@123` | `/admin/dashboard?view=cohorts` | Enterprise cohort sponsorship, employee enrollment, progress tracking |

---

## 📁 Repository Directory Structure

```
├── backend/                        # Custom Moodle 5.x REST APIs and Plugins
│   ├── admin_api.php               # High-performance native administration & catalog API
│   ├── sso.php                     # Zero-prompt single sign-on action bridge
│   ├── config.php                  # Environment-aware Moodle configuration
│   ├── install_to_moodle.php       # Plugin overlay script for Moodle directories
│   └── plugins/                    # Custom Moodle plugins (Pesapal, Selcom, XP, Certificates)
├── database/                       # Database Schemas & Portable Seeders
│   ├── init.sql                    # Full SQL schema & seed data (Docker auto-import)
│   ├── moodle_out_full.sql         # Sanitized production SQL dump
│   └── seed.php                    # Cross-platform CLI database seeder
├── docker/                         # Docker Container Definitions
│   ├── Dockerfile.frontend         # Multi-stage React 18 production image
│   └── Dockerfile.backend          # PHP 8.2 + Apache Moodle API runtime image
├── frontend/                       # React 18 + TypeScript Application
│   ├── public/assets/              # SVGs, course thumbnails, category covers, icon fonts
│   ├── src/                        # React source code (Admin, Instructor, Student, Courses)
│   ├── serve_build.js              # Production asset server with proxy
│   └── package.json                # Frontend dependencies and build scripts
├── docker-compose.yml              # Multi-container orchestration definition
├── deploy.sh                       # Linux / macOS / Bash deployment engine
├── deploy.ps1                      # Windows PowerShell deployment engine
├── start.js                        # Zero-dependency Node.js cross-platform launcher
├── .env.example                    # Environment configuration template
└── README.md                       # Comprehensive system documentation
```

---

## ⚙️ Environment Configuration (`.env`)

```ini
# Application Ports
FRONTEND_PORT=3000
BACKEND_PORT=8080
DB_PORT=3306

# Database Connection (MySQL / MariaDB)
MOODLE_DB_TYPE=mariadb
MOODLE_DB_HOST=127.0.0.1
MOODLE_DB_PORT=3306
MOODLE_DB_NAME=moodle_out
MOODLE_DB_USER=root
MOODLE_DB_PASSWORD=
MOODLE_DB_PREFIX=mdl_

# Base URLs
APP_URL=http://localhost:3000
BACKEND_URL=http://localhost:8080
MOODLE_WWWROOT=http://127.0.0.1/outlmstheme/moodle-backend

# Pesapal 3.0 API Configuration
PESAPAL_CONSUMER_KEY=qk1uFZjfQ2HrggvOoN4BuPoJYQw2iHyM
PESAPAL_CONSUMER_SECRET=29IPT6ZnDeEBtk7mCrNOzShEHx8=
PESAPAL_ENVIRONMENT=sandbox
PESAPAL_CURRENCY=TZS
```

---

## 🌐 Brand Guidelines & Design Tokens

- **OUT Royal Azure**: `#0171BB` (Primary institutional brand color)
- **OUT Academic Gold**: `#FFD200` / `#FEF207` (Secondary university ribbon & badge accent)
- **Deep Navy Base**: `#003B66` (High-contrast typography and prominent headings)
- **Canvas Background**: `#F8FAFC` / `#FFFFFF` (Clean, professional academic aesthetic)

---

## 📄 License & Attribution

Developed for **The Open University of Tanzania (OUT)**.  
*All rights reserved.*

