import { Navigate, Route } from "react-router-dom";
import { all_routes } from "./all_routes";
import Home from "../HomePages/home/home";
import CourseGrid from "../Courses/courses-grid/courseGrid";
import CourseList from "../Courses/course-list/courseList";
import CourseCategory from "../Courses/course-category/courseCategory";
import CourseDetails from "../Courses/course-details/courseDetails";
import CourseCart from "../Courses/course-cart/courseCart";
import CourseCheckout from "../Courses/course-checkout/courseCheckout";
import AddNewCourse from "../Courses/add-newCourse/addNewCourse";

// Student Components (Connected to /api/student_api.php)
import StudentDashboard from "../student/dashboard/studentDashboard";
import CourseWatch from "../Courses/course-watch/courseWatch";
import StudentQuizQuestion from "../student/student-quiz-question/studentQuizQuestion";

// Instructor Components (Connected to /api/instructor_api.php & /api/course_studio_api.php)
import InstructorDashboard from "../Instructor/instructor-dashboard/instructorDashboard";
import InstructorCourse from "../Instructor/instructor-course/instructorCourse";
import InstructorAnnouncements from "../Instructor/instructor-announcements/instructorAnnouncements";
import InstructorAssignment from "../Instructor/instructor-assignment/instructorAssignment";
import StudentList from "../Instructor/student-list/studentList";
import InstructorQuiz from "../Instructor/instructor-quiz/instructorQuiz";
import InstructorQuizResult from "../Instructor/instructor-quiz-result/instructorQuizResult";
import InstructorCertificate from "../Instructor/instructor-certificate/instructorCertificate";
import InstructorEarning from "../Instructor/instructor-earning/instructorEarning";
import InstructorPayout from "../Instructor/instructor-payout/instructorPayout";
import InstructorStatement from "../Instructor/instructor-statement/instructorStatement";
import InstructorMessage from "../Instructor/instructor-message/instructorMessage";
import InstructorTickets from "../Instructor/instructor-tickets/instructorTickets";
import InstructorProfile from "../Instructor/instructor-settings/instructor-profile-settings/instructorProfile";
import InstructorChangePassword from "../Instructor/instructor-settings/instructor-change-password/instructorChangePassoword";

// Admin Components (Connected to /api/admin_system_api.php & /api/course_studio_api.php)
import AdminDashboard from "../admin/adminDashboard";

// Academic Bulletins (Connected to /api/public_api.php)
import BlogGrid from "../blog/blog-layouts/blogGrid";
import BlogDetails from "../blog/blog-details/blogDetails";

// Public Pages & Informational (Connected to /api/public_api.php)
import AboutUs from "../Pages/about-us/aboutUs";
import ContactUs from "../Pages/contact-us/contactUs";
import Notification from "../Pages/notification/notification";
import BecomeInstructor from "../Pages/become-instructor/becomeInstructor";
import Testimonials from "../Pages/testimonials/testimonials";
import VerifyCertificate from "../Pages/verify-certificate/verifyCertificate";
import ApiDocs from "../Pages/api-docs/apiDocs";
import PricePlanning from "../Pages/price-planning/pricePlanning";
import Faq from "../Pages/faq/faq";
import TermsCondition from "../Pages/terms-condition/termsCondition";
import PrivacyPolicy from "../Pages/privacy-policy/privacyPolicy";
import InstructorGrid from "../Pages/instructor/instructor-grid/instructorGrid";
import InstructorListPublic from "../Pages/instructor/instructor-list/instructorList";
import InstructorDetails from "../Pages/instructor/instructor-details/instructor-details";

// Auth Components (Connected to /login/token.php, /api/public_api.php & /api/student_api.php)
import Login from "../auth/login/login";
import Register from "../auth/register/register";
import ForgortPassword from "../auth/forgot-password/forgortPassword";
import SetPassword from "../auth/set-password/setPassword";
import Otp from "../auth/otp/otp";
import Error404 from "../auth/error/error-404/error400";
import Error500 from "../auth/error/error-500/error500";

const routes = all_routes;

/**
 * 1. Public Routes: Connected to /api/public_api.php
 */
export const publicRoutes = [
  {
    path: "/",
    name: "Root",
    element: <Home />,
    route: Route,
  },
  {
    path: routes.homeone,
    element: <Home />,
    route: Route,
  },
  {
    path: routes.courseGrid,
    element: <CourseGrid />,
    route: Route,
  },
  {
    path: routes.courseList,
    element: <CourseList />,
    route: Route,
  },
  {
    path: routes.courseCategory,
    element: <CourseCategory />,
    route: Route,
  },
  {
    path: routes.courseDetails,
    element: <CourseDetails />,
    route: Route,
  },
  {
    path: routes.blogGrid,
    element: <BlogGrid />,
    route: Route,
  },
  {
    path: routes.blogDetails,
    element: <BlogDetails />,
    route: Route,
  },
  {
    path: routes.courseCart,
    element: <CourseCart />,
    route: Route,
  },
  {
    path: "/cart",
    element: <CourseCart />,
    route: Route,
  },
  {
    path: routes.courseCheckout,
    element: <CourseCheckout />,
    route: Route,
  },
  {
    path: "/course/course-checkout",
    element: <CourseCheckout />,
    route: Route,
  },
  {
    path: routes.about_us,
    element: <AboutUs />,
    route: Route,
  },
  {
    path: routes.contactUs,
    element: <ContactUs />,
    route: Route,
  },
  {
    path: routes.FAQ,
    element: <Faq />,
    route: Route,
  },
  {
    path: routes.termsConditions,
    element: <TermsCondition />,
    route: Route,
  },
  {
    path: routes.privacyPolicy,
    element: <PrivacyPolicy />,
    route: Route,
  },
  {
    path: routes.pricingPlan,
    element: <PricePlanning />,
    route: Route,
  },
  {
    path: routes.testimonials,
    element: <Testimonials />,
    route: Route,
  },
  {
    path: routes.verifyCertificate,
    element: <VerifyCertificate />,
    route: Route,
  },
  {
    path: routes.becomeAnInstructor,
    element: <BecomeInstructor />,
    route: Route,
  },
  {
    path: routes.notification,
    element: <Notification />,
    route: Route,
  },
  {
    path: routes.instructorGrid,
    element: <InstructorGrid />,
    route: Route,
  },
  {
    path: routes.instructorList,
    element: <InstructorListPublic />,
    route: Route,
  },
  {
    path: routes.instructorDetails,
    element: <InstructorDetails />,
    route: Route,
  },
  {
    path: "/home",
    element: <Home />,
    route: Route,
  },
  {
    path: "/course",
    element: <CourseGrid />,
    route: Route,
  },
  {
    path: "/courses",
    element: <CourseGrid />,
    route: Route,
  },
  {
    path: "/courses/course-grid",
    element: <CourseGrid />,
    route: Route,
  },
  {
    path: "/courses/course-list",
    element: <CourseList />,
    route: Route,
  },
  {
    path: "/courses/course-category",
    element: <CourseCategory />,
    route: Route,
  },
  {
    path: "/courses/course-details",
    element: <CourseDetails />,
    route: Route,
  },
  {
    path: "/pages/terms-conditions",
    element: <TermsCondition />,
    route: Route,
  },
  {
    path: "/pages/verify-certificate",
    element: <VerifyCertificate />,
    route: Route,
  },
  {
    path: "/verify-certificate",
    element: <VerifyCertificate />,
    route: Route,
  },
  {
    path: "/pages/api-docs",
    element: <ApiDocs />,
    route: Route,
  },
  {
    path: "/api-docs",
    element: <ApiDocs />,
    route: Route,
  },
];

/**
 * 2. Student Protected Routes: Connected to /api/student_api.php
 */
export const studentProtectedRoutes = [
  {
    path: routes.studentDashboard,
    element: <StudentDashboard />,
    route: Route,
  },
  {
    path: "/student/student-courses",
    element: <Navigate to="/student/student-dashboard?tab=courses" replace />,
    route: Route,
  },
  {
    path: routes.courseWatch,
    element: <CourseWatch />,
    route: Route,
  },
  {
    path: "/student/student-quiz",
    element: <Navigate to="/student/student-dashboard?tab=quizzes" replace />,
    route: Route,
  },
  {
    path: routes.studentQuizQuestion,
    element: <StudentQuizQuestion />,
    route: Route,
  },
  {
    path: "/student/student-certificates",
    element: <Navigate to="/student/student-dashboard?tab=certificates" replace />,
    route: Route,
  },
  {
    path: "/student/student-profile",
    element: <Navigate to="/student/student-dashboard?tab=profile" replace />,
    route: Route,
  },
  {
    path: "/student/student-settings",
    element: <Navigate to="/student/student-dashboard?tab=settings" replace />,
    route: Route,
  },
];

/**
 * 3. Instructor Protected Routes: Connected to /api/instructor_api.php & /api/course_studio_api.php
 */
export const instructorProtectedRoutes = [
  {
    path: routes.instructorDashboard,
    element: <InstructorDashboard />,
    route: Route,
  },
  {
    path: routes.instructorCourse,
    element: <InstructorCourse />,
    route: Route,
  },
  {
    path: routes.addNewCourse,
    element: <AddNewCourse />,
    route: Route,
  },
  {
    path: routes.instructorProfile,
    element: <InstructorProfile />,
    route: Route,
  },
  {
    path: routes.instructorsettings,
    element: <InstructorProfile />,
    route: Route,
  },
  {
    path: routes.instructorChangePassword,
    element: <InstructorChangePassword />,
    route: Route,
  },
  {
    path: routes.instructorAnnouncements,
    element: <InstructorAnnouncements />,
    route: Route,
  },
  {
    path: routes.instructorAssignment,
    element: <InstructorAssignment />,
    route: Route,
  },
  {
    path: routes.studentsList,
    element: <StudentList />,
    route: Route,
  },
  {
    path: routes.instructorQuiz,
    element: <InstructorQuiz />,
    route: Route,
  },
  {
    path: routes.instructorQuizResult,
    element: <InstructorQuizResult />,
    route: Route,
  },
  {
    path: routes.instructorCertificate,
    element: <InstructorCertificate />,
    route: Route,
  },
  {
    path: routes.instructorEarning,
    element: <InstructorEarning />,
    route: Route,
  },
  {
    path: routes.instructorPayout,
    element: <InstructorPayout />,
    route: Route,
  },
  {
    path: routes.instructorStatements,
    element: <InstructorStatement />,
    route: Route,
  },
  {
    path: routes.instructorMessage,
    element: <InstructorMessage />,
    route: Route,
  },
  {
    path: routes.instructorTickets,
    element: <InstructorTickets />,
    route: Route,
  },
];

/**
 * 4. Administrator Protected Routes: Connected to /api/admin_system_api.php & /api/course_studio_api.php
 */
export const adminProtectedRoutes = [
  {
    path: routes.adminDashboard,
    element: <AdminDashboard />,
    route: Route,
  },
];

/**
 * 5. Auth & Status Routes: Connected to /login/token.php, /api/public_api.php & /api/student_api.php
 */
export const authRoutes = [
  {
    path: routes.login,
    element: <Login />,
    route: Route,
  },
  {
    path: routes.register,
    element: <Register />,
    route: Route,
  },
  {
    path: routes.forgotpassword,
    element: <ForgortPassword />,
    route: Route,
  },
  {
    path: routes.setpassowrd,
    element: <SetPassword />,
    route: Route,
  },
  {
    path: routes.otp,
    element: <Otp />,
    route: Route,
  },
  {
    path: routes.Error404,
    element: <Error404 />,
    route: Route,
  },
  {
    path: routes.Error500,
    element: <Error500 />,
    route: Route,
  },
];
