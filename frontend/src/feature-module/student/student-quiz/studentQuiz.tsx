import React from "react";
import Breadcrumb from "../../../core/common/Breadcrumb/breadcrumb";
import { Link } from "react-router-dom";
import { all_routes } from "../../router/all_routes";
import StudentSidebar from "../common/studentSidebar";
import ProfileCard from "../common/profileCard";

const StudentQuiz = () => {
  const route = all_routes;

  return (
    <>
      <Breadcrumb title="My Quiz Attempts" />

      <div className="content">
        <div className="container">
          {/* profile box */}
        <ProfileCard />
          {/* profile box */}
          <div className="row">
            {/* sidebar */}
            <StudentSidebar />
            {/* sidebar */}
            <div className="col-lg-9">
              <div className="page-title d-flex align-items-center justify-content-between">
                <h5>My Quiz Attempts</h5>
              </div>
              <div className="d-flex align-items-center justify-content-between border p-3 mb-3 rounded-2">
                <div>
                  <h6 className="mb-1">
                    <Link to={route.studentQuizQuestion}>
                      Information About UI/UX Design Degree
                    </Link>
                  </h6>
                  <p className="fs-14">Number of Questions : 05</p>
                </div>
                <div>
                  <Link to={route.studentQuizQuestion} className="arrow-next">
                    <i className="isax isax-arrow-right-1" />
                  </Link>
                </div>
              </div>
              <div className="d-flex align-items-center justify-content-between border p-3 pb-3 mb-3 rounded-2">
                <div>
                  <h6 className="mb-1">
                    <Link to={route.studentQuizQuestion}>
                      Learn JavaScript and Express to become a Expert
                    </Link>
                  </h6>
                  <p className="fs-14">Number of Questions : 10</p>
                </div>
                <div>
                  <Link to={route.studentQuizQuestion} className="arrow-next">
                    <i className="isax isax-arrow-right-1" />
                  </Link>
                </div>
              </div>
              <div className="d-flex align-items-center justify-content-between border p-3 pb-3 mb-3 rounded-2">
                <div>
                  <h6 className="mb-1">
                    <Link to={route.studentQuizQuestion}>
                      Introduction to Python Programming
                    </Link>
                  </h6>
                  <p className="fs-14">Number of Questions : 08</p>
                </div>
                <div>
                  <Link to={route.studentQuizQuestion} className="arrow-next">
                    <i className="isax isax-arrow-right-1" />
                  </Link>
                </div>
              </div>
              <div className="d-flex align-items-center justify-content-between border p-3 pb-3 mb-3 rounded-2">
                <div>
                  <h6 className="mb-1">
                    <Link to={route.studentQuizQuestion}>
                      Build Responsive Websites with HTML5 and CSS3
                    </Link>
                  </h6>
                  <p className="fs-14">Number of Questions : 05</p>
                </div>
                <div>
                  <Link to={route.studentQuizQuestion} className="arrow-next">
                    <i className="isax isax-arrow-right-1" />
                  </Link>
                </div>
              </div>
              <div className="d-flex align-items-center justify-content-between border p-3 pb-3 mb-3 rounded-2">
                <div>
                  <h6 className="mb-1">
                    <Link to={route.studentQuizQuestion}>
                      Information About Photoshop Design Degree
                    </Link>
                  </h6>
                  <p className="fs-14">Number of Questions : 10</p>
                </div>
                <div>
                  <Link to={route.studentQuizQuestion} className="arrow-next">
                    <i className="isax isax-arrow-right-1" />
                  </Link>
                </div>
              </div>
              <div className="d-flex align-items-center justify-content-between border p-3 rounded-2">
                <div>
                  <h6 className="mb-1">
                    <Link to={route.studentQuizQuestion}>
                      C# Developers Double Your Coding with Visual Studio
                    </Link>
                  </h6>
                  <p className="fs-14">Number of Questions : 07</p>
                </div>
                <div>
                  <Link to={route.studentQuizQuestion} className="arrow-next">
                    <i className="isax isax-arrow-right-1" />
                  </Link>
                </div>
              </div>
              {/* /pagination */}
              <div className="row align-items-center mt-3">
                <div className="col-md-2">
                  <p className="pagination-text">Page 1 of 2</p>
                </div>
                <div className="col-md-10">
                  <ul className="pagination lms-page justify-content-center justify-content-md-end mt-2 mt-md-0">
                    <li className="page-item prev">
                      <Link className="page-link" to="#" tabIndex={-1}>
                        <i className="fas fa-angle-left" />
                      </Link>
                    </li>
                    <li className="page-item first-page active">
                      <Link className="page-link" to="#">
                        1
                      </Link>
                    </li>
                    <li className="page-item">
                      <Link className="page-link" to="#">
                        2
                      </Link>
                    </li>
                    <li className="page-item">
                      <Link className="page-link" to="#">
                        3
                      </Link>
                    </li>
                    <li className="page-item next">
                      <Link className="page-link" to="#">
                        <i className="fas fa-angle-right" />
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
              {/* /pagination */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StudentQuiz;
