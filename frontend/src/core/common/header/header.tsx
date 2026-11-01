import React, { useEffect, useState } from "react";
import ImageWithBasePath from "../imageWithBasePath";
import { getHeaderMenuByRole } from "../data/json/header";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/authContext";
import { all_routes } from "../../../feature-module/router/all_routes";
import { setDataTheme } from "../../redux/themeSettingSlice";
import { useDispatch, useSelector } from "react-redux";
const Header = () => {
  const navigate = useNavigate();
  const { user, role, isAuthenticated, logout } = useAuth();
  const navMenus = getHeaderMenuByRole(role);
  const handleLogout = () => {
    logout();
    navigate(all_routes.homeone);
  };
  const [scrolled, setScrolled] = useState(false);
  const dispatch = useDispatch();
  const location = useLocation();
  const dataTheme = useSelector((state: any) => state.themeSetting.dataTheme);
  const handleDataThemeChange = (theme: string) => {
    dispatch(setDataTheme(theme));
  };
  const onHandleMobileMenu = () => {
    const root = document.getElementsByTagName("html")[0];
    root.classList.add("menu-opened");
  };
  const onhandleCloseMenu = () => {
    const root = document.getElementsByTagName("html")[0];
    root.classList.remove("menu-opened");
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    // Add event listener
    window.addEventListener("scroll", handleScroll);

    // Cleanup on unmount
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  useEffect(() => {
    document.documentElement.setAttribute("class", dataTheme);
  }, [dataTheme])
  useEffect(() => {
    const path = location.pathname;
    const pathArray = path.split("/").filter(Boolean); // Removes empty strings from the split result
    setBasePath(pathArray[0])
  }, [location.pathname]);

  const isHome = location.pathname === '/' || location.pathname === '/index' || location.pathname === '/index-6';

  const DarkButton = () => {
    return (
      <div className={`icon-btn  ${isHome ? '' : 'me-2'}`}>
            <Link
              to="#"
              id="dark-mode-toggle"
              className={`theme-toggle ${dataTheme === 'light' && 'activate'}`}
              onClick={() => handleDataThemeChange("dark-mode")}
            >
              <i className="isax isax-sun-15" />
            </Link>
            <Link
              to="#"
              id="light-mode-toggle"
              className={`theme-toggle ${dataTheme === 'dark-mode' && 'activate'}`}
              onClick={() => handleDataThemeChange("light")}
            >
              <i className="isax isax-moon" />
            </Link>
          </div>
      
    )
  }
  return (
<>
  {/* Header Topbar*/}
  {isHome ? 
    <></>
  :
  <div className="header-topbar text-center">
    <div className="container">
      <div className="row">
        <div className="col-lg-6">
          <div className="d-flex align-items-center justify-content-center justify-content-lg-start">
            <p className="d-flex align-items-center fw-medium fs-14 mb-2 me-3">
              <i className="isax isax-location5 me-2" />
              1442 Crosswind Drive Madisonville
            </p>
            <p className="d-flex align-items-center fw-medium fs-14 mb-2">
              <i className="isax isax-call-calling5 me-2" />
              +1 45887 77874
            </p>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="d-flex align-items-center justify-content-center justify-content-lg-end">
            <div className="dropdown flag-dropdown mb-2 me-3">
              <Link
                to="#"
                className="dropdown-toggle d-inline-flex align-items-center"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <ImageWithBasePath
                  src="assets/img/flags/us-flag.svg"
                  className="me-2"
                  alt="flag"
                />
                ENG
              </Link>
              <ul className="dropdown-menu p-2 mt-2">
                <li>
                  <Link
                    className="dropdown-item rounded d-flex align-items-center"
                    to="#"
                  >
                    <ImageWithBasePath
                      src="assets/img/flags/us-flag.svg"
                      className="me-2"
                      alt="flag"
                    />
                    ENG
                  </Link>
                </li>
                <li>
                  <Link
                    className="dropdown-item rounded d-flex align-items-center"
                    to="#"
                  >
                    <ImageWithBasePath
                      src="assets/img/flags/arab-flag.svg"
                      className="me-2"
                      alt="flag"
                    />
                    ARA
                  </Link>
                </li>
                <li>
                  <Link
                    className="dropdown-item rounded d-flex align-items-center"
                    to="#"
                  >
                    <ImageWithBasePath
                      src="assets/img/flags/france-flag.svg"
                      className="me-2"
                      alt="flag"
                    />
                    FRE
                  </Link>
                </li>
              </ul>
            </div>
            <div className="dropdown mb-2 me-3">
              <Link
                to="#"
                className="dropdown-toggle"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                USD
              </Link>
              <ul className="dropdown-menu p-2 mt-2">
                <li>
                  <Link
                    className="dropdown-item rounded"
                    to="#"
                  >
                    USD
                  </Link>
                </li>
                <li>
                  <Link
                    className="dropdown-item rounded"
                    to="#"
                  >
                    YEN
                  </Link>
                </li>
                <li>
                  <Link
                    className="dropdown-item rounded"
                    to="#"
                  >
                    EURO
                  </Link>
                </li>
              </ul>
            </div>
            <ul className="social-icon d-flex align-items-center mb-2">
              <li className="me-2">
                <Link to="#">
                  <i className="fa-brands fa-facebook-f" />
                </Link>
              </li>
              <li className="me-2">
                <Link to="#">
                  <i className="fa-brands fa-instagram" />
                </Link>
              </li>
              <li className="me-2">
                <Link to="#">
                  <i className="fa-brands fa-x-twitter" />
                </Link>
              </li>
              <li className="me-2">
                <Link to="#">
                  <i className="fa-brands fa-youtube" />
                </Link>
              </li>
              <li>
                <Link to="#">
                  <i className="fa-brands fa-linkedin" />
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div> 
}
  
  {/* /Header Topbar*/}
  {/* Header */}
  <header className={`${isHome ? 'header-three' : 'header-two'} ${scrolled ? "fixed" : ""}`}>
    <div className="container">
      <div className="header-nav">
        <div className="navbar-header">
          <Link id="mobile_btn" to="#" onClick={() => onHandleMobileMenu()}>
            <span className="bar-icon">
              <i className="isax isax-menu"></i>
            </span>
          </Link>
          <div className="navbar-logo">
            <Link className="logo-white header-logo" to={all_routes.homeone}>
              <ImageWithBasePath src="assets/img/logo.svg" className="logo" alt="Logo" />
            </Link>
            <Link className="logo-dark header-logo" to={all_routes.homeone}>
              <ImageWithBasePath
                src="assets/img/logo-white.svg"
                className="logo"
                alt="Logo"
              />
            </Link>
          </div>
        </div>
        <div className={`main-menu-wrapper ${isMegaMenu ? 'active' : ''}`}>
          <div className="menu-header">
            <Link to={all_routes.homeone} className="menu-logo">
              <ImageWithBasePath src="assets/img/logo.svg" className="img-fluid" alt="Logo" />
            </Link>
            <Link
              id="menu_close"
              className="menu-close"
              to="#"
              onClick={() => onhandleCloseMenu()}
            >
              <i className="fas fa-times" />
            </Link>
          </div>
          <ul className={`main-nav ${isMegaMenu ? 'active' : ''}`}>
            {navMenus.map((mainMenus: any, mainIndex: number) => {
              const isActive = location.pathname === mainMenus.route;
              return (
                <li key={mainIndex} className={isActive ? "active" : ""}>
                  <Link to={mainMenus.route}>{mainMenus.tittle}</Link>
                </li>
              );
            })}
          </ul>
        </div>
        {isAuthenticated && user ? (
          <div className="header-btn d-flex align-items-center">
            {/* Dark Mode Toggle */}
            <DarkButton />

            {/* Cart Icon */}
            <div className="icon-btn me-2">
              <Link to={all_routes.cart} className="position-relative">
                <i className="isax isax-shopping-cart5" />
                <span className="count-icon bg-success p-1 rounded-pill text-white fs-10 fw-bold">
                  1
                </span>
              </Link>
            </div>

            {/* Role Badge Indicator */}
            <div className="d-none d-md-block me-2">
              {role === 'admin' ? (
                <span className="badge rounded-pill bg-danger-subtle text-danger border border-danger-subtle px-3 py-2 fs-12 fw-semibold d-inline-flex align-items-center">
                  <i className="isax isax-security-safe me-1 fs-14" /> Admin Portal
                </span>
              ) : role === 'instructor' ? (
                <span className="badge rounded-pill bg-primary-subtle text-primary border border-primary-subtle px-3 py-2 fs-12 fw-semibold d-inline-flex align-items-center">
                  <i className="isax isax-teacher me-1 fs-14" /> Instructor
                </span>
              ) : (
                <span className="badge rounded-pill bg-success-subtle text-success border border-success-subtle px-3 py-2 fs-12 fw-semibold d-inline-flex align-items-center">
                  <i className="isax isax-user-tag me-1 fs-14" /> Student
                </span>
              )}
            </div>

            {/* User Profile Dropdown */}
            <div className="dropdown profile-dropdown">
              <Link
                to="#"
                className="d-flex align-items-center"
                data-bs-toggle="dropdown"
              >
                <span className="avatar">
                  <ImageWithBasePath
                    src={user.avatar || "assets/img/user/user-02.jpg"}
                    alt={user.name}
                    className="img-fluid rounded-circle"
                  />
                </span>
              </Link>
              <div className="dropdown-menu dropdown-menu-end shadow">
                <div className="profile-header d-flex align-items-center p-3 border-bottom">
                  <div className="avatar me-2">
                    <ImageWithBasePath
                      src={user.avatar || "assets/img/user/user-02.jpg"}
                      alt={user.name}
                      className="img-fluid rounded-circle"
                    />
                  </div>
                  <div>
                    <h6 className="mb-0 fw-bold">{user.name}</h6>
                    <p className="text-muted fs-12 mb-0">{user.email}</p>
                    <span className={`badge mt-1 ${role === 'admin' ? 'bg-danger' : role === 'instructor' ? 'bg-primary' : 'bg-success'}`}>
                      {user.title}
                    </span>
                  </div>
                </div>

                <ul className="profile-body list-unstyled mb-0 py-2">
                  <li>
                    <Link
                      className="dropdown-item d-inline-flex align-items-center rounded fw-medium px-3 py-2"
                      to={user.dashboardUrl}
                    >
                      <i className="isax isax-element-4 me-2 text-primary fs-16" />
                      Dashboard
                    </Link>
                  </li>

                  {role === 'student' && (
                    <>
                      <li>
                        <Link
                          className="dropdown-item d-inline-flex align-items-center rounded fw-medium px-3 py-2"
                          to={all_routes.studentProfile}
                        >
                          <i className="isax isax-security-user me-2 text-primary fs-16" />
                          My Profile
                        </Link>
                      </li>
                      <li>
                        <Link
                          className="dropdown-item d-inline-flex align-items-center rounded fw-medium px-3 py-2"
                          to={all_routes.studentCourses}
                        >
                          <i className="isax isax-book me-2 text-primary fs-16" />
                          Enrolled Courses
                        </Link>
                      </li>
                      <li>
                        <Link
                          className="dropdown-item d-inline-flex align-items-center rounded fw-medium px-3 py-2"
                          to={all_routes.studentQuiz}
                        >
                          <i className="isax isax-award me-2 text-primary fs-16" />
                          Quiz Attempts
                        </Link>
                      </li>
                      <li>
                        <Link
                          className="dropdown-item d-inline-flex align-items-center rounded fw-medium px-3 py-2"
                          to={all_routes.studentSettings}
                        >
                          <i className="isax isax-setting-2 me-2 text-primary fs-16" />
                          Settings
                        </Link>
                      </li>
                    </>
                  )}

                  {role === 'instructor' && (
                    <>
                      <li>
                        <Link
                          className="dropdown-item d-inline-flex align-items-center rounded fw-medium px-3 py-2"
                          to={all_routes.instructorProfile}
                        >
                          <i className="isax isax-security-user me-2 text-primary fs-16" />
                          My Profile
                        </Link>
                      </li>
                      <li>
                        <Link
                          className="dropdown-item d-inline-flex align-items-center rounded fw-medium px-3 py-2"
                          to={all_routes.instructorCourse}
                        >
                          <i className="isax isax-teacher me-2 text-primary fs-16" />
                          Manage Courses
                        </Link>
                      </li>
                      <li>
                        <Link
                          className="dropdown-item d-inline-flex align-items-center rounded fw-medium px-3 py-2"
                          to={all_routes.addNewCourse}
                        >
                          <i className="isax isax-add-circle me-2 text-primary fs-16" />
                          Add New Course
                        </Link>
                      </li>
                      <li>
                        <Link
                          className="dropdown-item d-inline-flex align-items-center rounded fw-medium px-3 py-2"
                          to={all_routes.instructorEarning}
                        >
                          <i className="isax isax-dollar-circle me-2 text-primary fs-16" />
                          Earnings
                        </Link>
                      </li>
                      <li>
                        <Link
                          className="dropdown-item d-inline-flex align-items-center rounded fw-medium px-3 py-2"
                          to={all_routes.instructorsettings}
                        >
                          <i className="isax isax-setting-2 me-2 text-primary fs-16" />
                          Settings
                        </Link>
                      </li>
                    </>
                  )}

                  {role === 'admin' && (
                    <>
                      <li>
                        <Link
                          className="dropdown-item d-inline-flex align-items-center rounded fw-medium px-3 py-2"
                          to={all_routes.adminDashboard}
                        >
                          <i className="isax isax-shield-tick me-2 text-danger fs-16" />
                          Admin Overview
                        </Link>
                      </li>
                      <li>
                        <Link
                          className="dropdown-item d-inline-flex align-items-center rounded fw-medium px-3 py-2"
                          to={all_routes.studentsList}
                        >
                          <i className="isax isax-user-tag me-2 text-danger fs-16" />
                          Student Directory
                        </Link>
                      </li>
                      <li>
                        <Link
                          className="dropdown-item d-inline-flex align-items-center rounded fw-medium px-3 py-2"
                          to={all_routes.instructorList}
                        >
                          <i className="isax isax-teacher me-2 text-danger fs-16" />
                          Faculty Directory
                        </Link>
                      </li>
                      <li>
                        <Link
                          className="dropdown-item d-inline-flex align-items-center rounded fw-medium px-3 py-2"
                          to={all_routes.courseCategory}
                        >
                          <i className="isax isax-category me-2 text-danger fs-16" />
                          Academic Categories
                        </Link>
                      </li>
                    </>
                  )}
                </ul>

                <div className="profile-footer p-2 border-top">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="btn btn-secondary d-inline-flex align-items-center justify-content-center w-100"
                  >
                    <i className="isax isax-logout me-2" />
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="header-btn d-flex align-items-center">
            <DarkButton />
            <div className="icon-btn me-3">
              <Link to={all_routes.cart} className="bg-white text-primary position-relative">
                <i className="isax isax-shopping-cart5" />
                <span className="count-icon bg-success p-2 rounded-pill text-white fs-10 fw-bold">
                  1
                </span>
              </Link>
            </div>
            <div>
              <Link
                to={all_routes.login}
                className="btn btn-primary d-inline-flex align-items-center me-2 px-3"
              >
                <i className="isax isax-lock-circle me-2" />
                Sign In
              </Link>
            </div>
            <Link to={all_routes.register} className="btn btn-secondary me-0 px-3">
              <i className="isax isax-user-edit me-2" />
              Register
            </Link>
          </div>
        )}
        
      </div>
    </div>
  </header>
  {/* /Header */}
</>



  )
}

export default Header