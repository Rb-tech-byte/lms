import { Navigate, Route } from "react-router-dom";
import { all_routes } from "./all_routes";
import Home from "../HomePages/home/home";
import CourseGrid from "../Courses/courses-grid/courseGrid";
import CourseList from "../Courses/course-list/courseList";
import CourseCategory from "../Courses/course-category/courseCategory";
import CourseDetails from "../Courses/course-details/courseDetails";
import CourseCart from "../Courses/course-cart/courseCart";
import CourseCheckout from "../Courses/course-checkout/courseCheckout";

// Student Components
import StudentDashboard from "../student/dashboard/studentDashboard";
import CourseWatch from "../Courses/course-watch/courseWatch";
import StudentQuizQuestion from "../student/student-quiz-question/studentQuizQuestion";

// Instructor Components
import InstructorDashboard from "../Instructor/instructor-dashboard/instructorDashboard";

// Admin Components
import AdminDashboard from "../admin/adminDashboard";

// Blog Components
import BlogGrid from "../blog/blog-layouts/blogGrid";
import BlogDetails from "../blog/blog-details/blogDetails";

// Public Pages & Informational
import AboutUs from "../Pages/about-us/aboutUs";
import ContactUs from "../Pages/contact-us/contactUs";
import Notification from "../Pages/notification/notification";
import BecomeInstructor from "../Pages/become-instructor/becomeInstructor";
import Testimonials from "../Pages/testimonials/testimonials";
import VerifyCertificate from "../Pages/verify-certificate/verifyCertificate";
import PricePlanning from "../Pages/price-planning/pricePlanning";
import Faq from "../Pages/faq/faq";
import TermsCondition from "../Pages/terms-condition/termsCondition";
import PrivacyPolicy from "../Pages/privacy-policy/privacyPolicy";
import InstructorGrid from "../Pages/instructor/instructor-grid/instructorGrid";
import InstructorListPublic from "../Pages/instructor/instructor-list/instructorList";
import InstructorDetails from "../Pages/instructor/instructor-details/instructor-details";

// Auth Components
import Login from "../auth/login/login";
import Register from "../auth/register/register";
import ForgortPassword from "../auth/forgot-password/forgortPassword";
import SetPassword from "../auth/set-password/setPassword";
import Otp from "../auth/otp/otp";
import Error404 from "../auth/error/error-404/error400";
import Error500 from "../auth/error/error-500/error500";

const routes = all_routes;

/**
 * 1. Public Routes: Accessible by Guests, Students, Instructors, and Administrators
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
    path: routes.hometwo,
    element: <Navigate to="/index" replace />,
    route: Route,
  },
  {
    path: routes.homethree,
    element: <Navigate to="/index" replace />,
    route: Route,
  },
  {
    path: routes.homefour,
    element: <Navigate to="/index" replace />,
    route: Route,
  },
  {
    path: routes.homefive,
    element: <Navigate to="/index" replace />,
    route: Route,
  },
  {
    path: routes.homesix,
    element: <Navigate to="/index" replace />,
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
    path: routes.courseCategory2,
    element: <Navigate to={routes.courseCategory} replace />,
    route: Route,
  },
  {
    path: routes.courseCategory3,
    element: <Navigate to={routes.courseCategory} replace />,
    route: Route,
  },
  {
    path: routes.courseDetails,
    element: <CourseDetails />,
    route: Route,
  },
  {
    path: routes.courseDetails2,
    element: <Navigate to={routes.courseDetails} replace />,
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
];

/**
 * 2. Student Protected Routes: Restricted to Scholars & Administrators (RBAC)
 */
export const studentProtectedRoutes = [
  {
    path: routes.studentDashboard,
    element: <StudentDashboard />,
    route: Route,
  },
  {
    path: routes.studentCourses,
    element: <Navigate to="/student/student-dashboard?tab=courses" replace />,
    route: Route,
  },
  {
    path: routes.courseWatch,
    element: <CourseWatch />,
    route: Route,
  },
  {
    path: routes.courseResume,
    element: <Navigate to="/course/course-watch?courseId=2" replace />,
    route: Route,
  },
  {
    path: routes.studentQuiz,
    element: <Navigate to="/student/student-dashboard?tab=quizzes" replace />,
    route: Route,
  },
  {
    path: routes.studentQuizQuestion,
    element: <StudentQuizQuestion />,
    route: Route,
  },
  {
    path: routes.studentCertificates,
    element: <Navigate to="/student/student-dashboard?tab=certificates" replace />,
    route: Route,
  },
  {
    path: routes.studentProfile,
    element: <Navigate to="/student/student-dashboard?tab=profile" replace />,
    route: Route,
  },
  {
    path: routes.studentSettings,
    element: <Navigate to="/student/student-dashboard?tab=settings" replace />,
    route: Route,
  },
  {
    path: routes.studentChangePassword,
    element: <Navigate to="/student/student-dashboard?tab=settings" replace />,
    route: Route,
  },
  {
    path: routes.studentSocialProfile,
    element: <Navigate to="/student/student-dashboard?tab=settings" replace />,
    route: Route,
  },
  {
    path: routes.studentLinkedAccounts,
    element: <Navigate to="/student/student-dashboard?tab=settings" replace />,
    route: Route,
  },
  {
    path: routes.studentNotification,
    element: <Navigate to="/student/student-dashboard?tab=settings" replace />,
    route: Route,
  },
  {
    path: routes.studentBillingAddress,
    element: <Navigate to="/student/student-dashboard?tab=settings" replace />,
    route: Route,
  },
  {
    path: routes.studentOrderHistory,
    element: <Navigate to="/student/student-dashboard?tab=orders" replace />,
    route: Route,
  },
  {
    path: routes.studentReviews,
    element: <Navigate to="/student/student-dashboard?tab=reviews" replace />,
    route: Route,
  },
  {
    path: routes.studentWishlist,
    element: <Navigate to="/student/student-dashboard?tab=wishlist" replace />,
    route: Route,
  },
  {
    path: routes.studentTickets,
    element: <Navigate to="/student/student-dashboard?tab=tickets" replace />,
    route: Route,
  },
  {
    path: routes.studentMessage,
    element: <Navigate to="/student/student-dashboard?tab=messages" replace />,
    route: Route,
  },
  {
    path: routes.studentReferral,
    element: <Navigate to="/student/student-dashboard?tab=referrals" replace />,
    route: Route,
  },
];

/**
 * 3. Instructor Protected Routes: Restricted to Faculty Teachers & Administrators (RBAC)
 */
export const instructorProtectedRoutes = [
  {
    path: routes.instructorDashboard,
    element: <InstructorDashboard />,
    route: Route,
  },
  {
    path: routes.instructorCourse,
    element: <Navigate to="/instructor/instructor-dashboard?tab=courses" replace />,
    route: Route,
  },
  {
    path: routes.instructorCourseGrid,
    element: <Navigate to="/instructor/instructor-dashboard?tab=courses" replace />,
    route: Route,
  },
  {
    path: routes.addNewCourse,
    element: <Navigate to="/instructor/instructor-dashboard?tab=courses" replace />,
    route: Route,
  },
  {
    path: routes.instructorProfile,
    element: <Navigate to="/instructor/instructor-dashboard?tab=profile" replace />,
    route: Route,
  },
  {
    path: routes.instructorsettings,
    element: <Navigate to="/instructor/instructor-dashboard?tab=settings" replace />,
    route: Route,
  },
  {
    path: routes.instructorChangePassword,
    element: <Navigate to="/instructor/instructor-dashboard?tab=settings" replace />,
    route: Route,
  },
  {
    path: routes.instructorAnnouncements,
    element: <Navigate to="/instructor/instructor-dashboard?tab=announcements" replace />,
    route: Route,
  },
  {
    path: routes.instructorAssignment,
    element: <Navigate to="/instructor/instructor-dashboard?tab=assignments" replace />,
    route: Route,
  },
  {
    path: routes.studentsList,
    element: <Navigate to="/instructor/instructor-dashboard?tab=students" replace />,
    route: Route,
  },
  {
    path: routes.studentsGrid,
    element: <Navigate to="/instructor/instructor-dashboard?tab=students" replace />,
    route: Route,
  },
  {
    path: routes.studentsDetails,
    element: <Navigate to="/instructor/instructor-dashboard?tab=students" replace />,
    route: Route,
  },
  {
    path: routes.instructorQuiz,
    element: <Navigate to="/instructor/instructor-dashboard?tab=quiz" replace />,
    route: Route,
  },
  {
    path: routes.instructorQuizResult,
    element: <Navigate to="/instructor/instructor-dashboard?tab=quiz-results" replace />,
    route: Route,
  },
  {
    path: routes.instructorQA,
    element: <Navigate to="/instructor/instructor-dashboard?tab=quiz" replace />,
    route: Route,
  },
  {
    path: routes.instructorCertificate,
    element: <Navigate to="/instructor/instructor-dashboard?tab=certificates" replace />,
    route: Route,
  },
  {
    path: routes.instructorEarning,
    element: <Navigate to="/instructor/instructor-dashboard?tab=earnings" replace />,
    route: Route,
  },
  {
    path: routes.instructorPayout,
    element: <Navigate to="/instructor/instructor-dashboard?tab=payout" replace />,
    route: Route,
  },
  {
    path: routes.instructorStatements,
    element: <Navigate to="/instructor/instructor-dashboard?tab=statements" replace />,
    route: Route,
  },
  {
    path: routes.instructorMessage,
    element: <Navigate to="/instructor/instructor-dashboard?tab=messages" replace />,
    route: Route,
  },
  {
    path: routes.instructorTickets,
    element: <Navigate to="/instructor/instructor-dashboard?tab=tickets" replace />,
    route: Route,
  },
  {
    path: routes.instructorPlan,
    element: <Navigate to="/instructor/instructor-dashboard?tab=settings" replace />,
    route: Route,
  },
  {
    path: routes.instructorSocialProfiles,
    element: <Navigate to="/instructor/instructor-dashboard?tab=settings" replace />,
    route: Route,
  },
  {
    path: routes.instructorLinkedAccounts,
    element: <Navigate to="/instructor/instructor-dashboard?tab=settings" replace />,
    route: Route,
  },
  {
    path: routes.instructorNotification,
    element: <Navigate to="/instructor/instructor-dashboard?tab=settings" replace />,
    route: Route,
  },
  {
    path: routes.instructorIntegrations,
    element: <Navigate to="/instructor/instructor-dashboard?tab=settings" replace />,
    route: Route,
  },
  {
    path: routes.instructorWithdraw,
    element: <Navigate to="/instructor/instructor-dashboard?tab=payout" replace />,
    route: Route,
  },
];

/**
 * 4. Administrator Protected Routes: Restricted Strictly to Super Administrators (RBAC)
 */
export const adminProtectedRoutes = [
  {
    path: routes.adminDashboard,
    element: <AdminDashboard />,
    route: Route,
  },
];

/**
 * 5. Auth & Status Routes: Login, Register, Recovery, Errors
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
    path: routes.lockscreen,
    element: <Navigate to={routes.login} replace />,
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
  {
    path: routes.underconstruction,
    element: <Navigate to={routes.homeone} replace />,
    route: Route,
  },
  {
    path: routes.comingSoon,
    element: <Navigate to={routes.homeone} replace />,
    route: Route,
  },
];
