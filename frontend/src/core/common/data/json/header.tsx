import { all_routes } from "../../../../feature-module/router/all_routes";
import { UserRole } from "../../../auth/demoUsers";

export interface MenuItem {
  tittle: string;
  route: string;
  isDirectLink?: boolean;
  base?: string;
  menu?: Array<{
    menuValue: string;
    route: string;
  }>;
}

/**
 * Guest / Public Navigation Menu (Unauthenticated visitors)
 */
export const guestHeaderMenu: MenuItem[] = [
  {
    tittle: "Home",
    route: all_routes.homeone,
    isDirectLink: true,
  },
  {
    tittle: "Faculties & Programs",
    route: all_routes.courseCategory,
    isDirectLink: true,
  },
  {
    tittle: "Course Catalog",
    route: all_routes.courseGrid,
    isDirectLink: true,
  },
  {
    tittle: "About OUT",
    route: all_routes.about_us,
    isDirectLink: true,
  },
  {
    tittle: "Admissions & Contact",
    route: all_routes.contactUs,
    isDirectLink: true,
  },
];

/**
 * Student Academic Navigation Menu
 */
export const studentHeaderMenu: MenuItem[] = [
  {
    tittle: "Home",
    route: all_routes.homeone,
    isDirectLink: true,
  },
  {
    tittle: "Faculties",
    route: all_routes.courseCategory,
    isDirectLink: true,
  },
  {
    tittle: "My Learning Dashboard",
    route: all_routes.studentDashboard,
    isDirectLink: true,
  },
  {
    tittle: "My Enrolled Courses",
    route: all_routes.studentCourses,
    isDirectLink: true,
  },
  {
    tittle: "Certificates & Transcript",
    route: all_routes.studentCertificates,
    isDirectLink: true,
  },
  {
    tittle: "Quizzes & Assessments",
    route: all_routes.studentQuiz,
    isDirectLink: true,
  },
];

/**
 * Instructor & Course Director Navigation Menu
 */
export const instructorHeaderMenu: MenuItem[] = [
  {
    tittle: "Teaching Dashboard",
    route: all_routes.instructorDashboard,
    isDirectLink: true,
  },
  {
    tittle: "Assigned Courses",
    route: all_routes.instructorCourse,
    isDirectLink: true,
  },
  {
    tittle: "Enrolled Scholars Roster",
    route: all_routes.studentsList,
    isDirectLink: true,
  },
  {
    tittle: "Grade Submissions",
    route: all_routes.instructorQuizResult,
    isDirectLink: true,
  },
  {
    tittle: "Faculty Announcements",
    route: all_routes.instructorAnnouncements,
    isDirectLink: true,
  },
];

/**
 * Super Administrator & Senate Registrar Navigation Menu
 */
export const adminHeaderMenu: MenuItem[] = [
  {
    tittle: "Senate Dashboard",
    route: all_routes.adminDashboard,
    isDirectLink: true,
  },
  {
    tittle: "Course Management",
    route: all_routes.courseCategory,
    isDirectLink: true,
  },
  {
    tittle: "Faculty Directory",
    route: all_routes.instructorList,
    isDirectLink: true,
  },
  {
    tittle: "Scholars Directory",
    route: all_routes.studentsList,
    isDirectLink: true,
  },
];

/**
 * Helper to dynamically retrieve navigation menus based on Moodle RBAC role
 */
export const getHeaderMenuByRole = (role: UserRole): MenuItem[] => {
  switch (role) {
    case 'admin':
      return adminHeaderMenu;
    case 'instructor':
      return instructorHeaderMenu;
    case 'student':
      return studentHeaderMenu;
    case 'guest':
    default:
      return guestHeaderMenu;
  }
};

// Default export for backward compatibility
export const header = guestHeaderMenu;
