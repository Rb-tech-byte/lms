import React, { useState } from 'react'
import Breadcrumb from '../../../core/common/Breadcrumb/breadcrumb'
import ProfileCard from '../common/profileCard'
import StudentSidebar from '../common/studentSidebar'
import CircleProgress from '../../Instructor/instructor-dashboard/circleProgress'
import { Link } from 'react-router-dom'
import ImageWithBasePath from '../../../core/common/imageWithBasePath'
import { all_routes } from '../../router/all_routes'

const StudentDashboard = () => {
    const [selectedItems, setSelectedItems] = useState(Array(4).fill(false));
    const handleItemClick = (index: number) => {
        setSelectedItems((prevSelectedItems) => {
            const updatedSelectedItems = [...prevSelectedItems];
            updatedSelectedItems[index] = !updatedSelectedItems[index];
            return updatedSelectedItems;
        });
    };
  return (
    <>
    <Breadcrumb title='Dashboard'/>
    <div className="content">
  <div className="container">
    {/* profile box */}
   <ProfileCard/>
    {/* profile box */}
    <div className="row">
      {/* sidebar */}
      <StudentSidebar/>
      {/* sidebar */}
      <div className="col-lg-9">
        <div className="card bg-light quiz-ans-card">
          <ImageWithBasePath
            src="./assets/img/shapes/withdraw-bg1.svg"
            className="quiz-ans-bg1"
            alt="img"
          />
          <ImageWithBasePath
            src="./assets/img/shapes/withdraw-bg2.svg"
            className="quiz-ans-bg2"
            alt="img"
          />
          <div className="card-body">
            <div className="row align-items-center">
              <div className="col-md-8">
                <div>
                  <h6 className="mb-1">Quiz : Build Responsive Real World </h6>
                  <p>Answered : 15/22</p>
                </div>
              </div>
              <div className="col-md-4">
                <div className="text-end">
                  <Link
                    to={all_routes.studentQuiz}
                    className="btn btn-primary rounded-pill"
                  >
                    Continue Quiz
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-md-6 col-xl-4">
            <div className="card">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <span className="icon-box bg-primary-transparent me-2 me-xxl-3 flex-shrink-0">
                    <ImageWithBasePath src="assets/img/icon/graduation.svg" alt="" />
                  </span>
                  <div>
                    <span className="d-block">Enrolled Courses</span>
                    <h4 className="fs-24 mt-1">12</h4>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-6 col-xl-4">
            <div className="card">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <span className="icon-box bg-secondary-transparent me-2 me-xxl-3 flex-shrink-0">
                    <ImageWithBasePath src="assets/img/icon/book.svg" alt="" />
                  </span>
                  <div>
                    <span className="d-block">Active Courses</span>
                    <h4 className="fs-24 mt-1">03</h4>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-6 col-xl-4">
            <div className="card">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <span className="icon-box bg-success-transparent me-2 me-xxl-3 flex-shrink-0">
                    <ImageWithBasePath src="assets/img/icon/bookmark.svg" alt="" />
                  </span>
                  <div>
                    <span className="d-block">Completed Courses</span>
                    <h4 className="fs-24 mt-1">10</h4>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <h5 className="mb-3 fs-18">Recently Enrolled Courses</h5>
        <div className="row">
          <div className="col-xl-4 col-md-6">
            <div className="course-item-two course-item mx-0">
              <div className="course-img">
                <Link to={all_routes.courseDetails}>
                  <ImageWithBasePath
                    src="assets/img/course/course-01.jpg"
                    alt="img"
                    className="img-fluid"
                  />
                </Link>
                <div className="position-absolute start-0 top-0 d-flex align-items-start w-100 z-index-2 p-3">
                  <div className="badge text-bg-danger">15% off</div>
                  <Link to="#" 
                  onClick={() => handleItemClick(1)}
                  className={`fav-icon ${selectedItems[1] ? 'selected' : ''} ms-auto`}>
                    <i className="isax isax-heart" />
                  </Link>
                </div>
              </div>
              <div className="course-content">
                <div className="d-flex justify-content-between mb-2">
                  <div className="d-flex align-items-center">
                    <Link
                      to={all_routes.instructorDetails}
                      className="avatar avatar-sm"
                    >
                      <ImageWithBasePath
                        src="assets/img/user/user-29.jpg"
                        alt="img"
                        className="img-fluid avatar avatar-sm rounded-circle"
                      />
                    </Link>
                    <div className="ms-2">
                      <Link
                        to={all_routes.instructorDetails}
                        className="link-default fs-14"
                      >
                        Brenda Slaton
                      </Link>
                    </div>
                  </div>
                  <span className="badge badge-light rounded-pill bg-light d-inline-flex align-items-center fs-13 fw-medium mb-0">
                    Design
                  </span>
                </div>
                <h6 className="title mb-2">
                  <Link to={all_routes.courseDetails}>
                    Information About UI/UX Design Degree
                  </Link>
                </h6>
                <p className="d-flex align-items-center mb-3">
                  <i className="fa-solid fa-star text-warning me-2" />
                  4.9 (200 Reviews)
                </p>
                <div className="d-flex align-items-center justify-content-between">
                  <h5 className="text-secondary mb-0">$120</h5>
                  <Link
                    to={all_routes.courseDetails}
                    className="btn btn-dark btn-sm d-inline-flex align-items-center"
                  >
                    View Course
                    <i className="isax isax-arrow-right-3 ms-1" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <div className="col-xl-4 col-md-6">
            <div className="course-item-two course-item mx-0">
              <div className="course-img">
                <Link to={all_routes.courseDetails}>
                  <ImageWithBasePath
                    src="assets/img/course/course-02.jpg"
                    alt="img"
                    className="img-fluid"
                  />
                </Link>
                <div className="position-absolute start-0 top-0 d-flex align-items-start w-100 z-index-2 p-3">
                  <Link to="#" 
                  onClick={() => handleItemClick(2)}
                  className={`fav-icon ${selectedItems[2] ? 'selected' : ''} ms-auto`}>
                    <i className="isax isax-heart" />
                  </Link>
                </div>
              </div>
              <div className="course-content">
                <div className="d-flex justify-content-between mb-2">
                  <div className="d-flex align-items-center">
                    <Link
                      to={all_routes.instructorDetails}
                      className="avatar avatar-sm"
                    >
                      <ImageWithBasePath
                        src="assets/img/user/user-30.jpg"
                        alt="img"
                        className="img-fluid avatar avatar-sm rounded-circle"
                      />
                    </Link>
                    <div className="ms-2">
                      <Link
                        to={all_routes.instructorDetails}
                        className="link-default fs-14"
                      >
                        Ana Reyes
                      </Link>
                    </div>
                  </div>
                  <span className="badge badge-light rounded-pill bg-light d-inline-flex align-items-center fs-13 fw-medium mb-0">
                    Wordpress
                  </span>
                </div>
                <h6 className="title mb-2">
                  <Link to={all_routes.courseDetails}>
                    Wordpress for Beginners - Master Wordpress Quickly
                  </Link>
                </h6>
                <p className="d-flex align-items-center mb-3">
                  <i className="fa-solid fa-star text-warning me-2" />
                  4.4 (160 Reviews)
                </p>
                <div className="d-flex align-items-center justify-content-between">
                  <h5 className="text-secondary mb-0">$140</h5>
                  <Link
                    to={all_routes.courseDetails}
                    className="btn btn-dark btn-sm d-inline-flex align-items-center"
                  >
                    View Course
                    <i className="isax isax-arrow-right-3 ms-1" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <div className="col-xl-4 col-md-6">
            <div className="course-item-two course-item mx-0">
              <div className="course-img">
                <Link to={all_routes.courseDetails}>
                  <ImageWithBasePath
                    src="assets/img/course/course-03.jpg"
                    alt="img"
                    className="img-fluid"
                  />
                </Link>
                <div className="position-absolute start-0 top-0 d-flex align-items-start w-100 z-index-2 p-3">
                  <Link to="#" 
                  onClick={() => handleItemClick(3)}
                  className={`fav-icon ${selectedItems[3] ? 'selected' : ''} ms-auto`}>
                    <i className="isax isax-heart" />
                  </Link>
                </div>
              </div>
              <div className="course-content">
                <div className="d-flex justify-content-between mb-2">
                  <div className="d-flex align-items-center">
                    <Link
                      to={all_routes.instructorDetails}
                      className="avatar avatar-sm"
                    >
                      <ImageWithBasePath
                        src="assets/img/user/user-31.jpg"
                        alt="img"
                        className="img-fluid avatar avatar-sm rounded-circle"
                      />
                    </Link>
                    <div className="ms-2">
                      <Link
                        to={all_routes.instructorDetails}
                        className="link-default fs-14"
                      >
                        Andrew Pirtle
                      </Link>
                    </div>
                  </div>
                  <span className="badge badge-light rounded-pill bg-light d-inline-flex align-items-center fs-13 fw-medium mb-0">
                    Design
                  </span>
                </div>
                <h6 className="title mb-2">
                  <Link to={all_routes.courseDetails}>
                    Sketch from A to Z (2024): Become an app designer
                  </Link>
                </h6>
                <p className="d-flex align-items-center mb-3">
                  <i className="fa-solid fa-star text-warning me-2" />
                  4.4 (160 Reviews)
                </p>
                <div className="d-flex align-items-center justify-content-between">
                  <h5 className="text-secondary mb-0">$140</h5>
                  <Link
                    to={all_routes.courseDetails}
                    className="btn btn-dark btn-sm d-inline-flex align-items-center"
                  >
                    View Course
                    <i className="isax isax-arrow-right-3 ms-1" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div>
          <div className="row">
            <div className="col-xl-7">
              <div className="card">
                <div className="card-body">
                  <h5 className="mb-3 border-bottom pb-3 fs-18">
                    Recent Invoices
                  </h5>
                  <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-2 mb-3">
                    <div>
                      <h6 className="mb-1">
                        Build Responsive Real World Websites..
                      </h6>
                      <div className="d-flex align-items-center">
                        <span className="badge badge-sm bg-light border d-inline-flex me-3">
                          #INV001
                        </span>
                        <p className="small">
                          Amount :{" "}
                          <span className="heading-color fw-semibold">
                            $200
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="d-flex align-items-center">
                      <span className="badge fw-normal bg-success d-inline-flex align-items-center me-1">
                        <i className="fa-solid fa-circle fs-5 me-1" />
                        Paid
                      </span>
                      <Link to="#" className="action-icon">
                        <i className="isax isax-document-download" />
                      </Link>
                    </div>
                  </div>
                  <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-2 mb-3">
                    <div>
                      <h6 className="mb-1">Wordpress for Beginners</h6>
                      <div className="d-flex align-items-center">
                        <span className="badge badge-sm bg-light border d-inline-flex me-3">
                          #INV002
                        </span>
                        <p className="small">
                          Amount :{" "}
                          <span className="heading-color fw-semibold">
                            $310
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="d-flex align-items-center">
                      <span className="badge fw-normal bg-success d-inline-flex align-items-center me-1">
                        <i className="fa-solid fa-circle fs-5 me-1" />
                        Paid
                      </span>
                      <Link to="#" className="action-icon">
                        <i className="isax isax-document-download" />
                      </Link>
                    </div>
                  </div>
                  <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-2 mb-3">
                    <div>
                      <h6 className="mb-1">
                        Information About UI/UX Design Degree
                      </h6>
                      <div className="d-flex align-items-center">
                        <span className="badge badge-sm bg-light border d-inline-flex me-3">
                          #INV003
                        </span>
                        <p className="small">
                          Amount :{" "}
                          <span className="heading-color fw-semibold">
                            $270
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="d-flex align-items-center">
                      <span className="badge fw-normal bg-success d-inline-flex align-items-center me-1">
                        <i className="fa-solid fa-circle fs-5 me-1" />
                        Paid
                      </span>
                      <Link to="#" className="action-icon">
                        <i className="isax isax-document-download" />
                      </Link>
                    </div>
                  </div>
                  <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-2 mb-3">
                    <div>
                      <h6 className="mb-1">Sketch from A to Z (2024)</h6>
                      <div className="d-flex align-items-center">
                        <span className="badge badge-sm bg-light border d-inline-flex me-3">
                          #INV004
                        </span>
                        <p className="small">
                          Amount :{" "}
                          <span className="heading-color fw-semibold">
                            $180
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="d-flex align-items-center">
                      <span className="badge fw-normal bg-success d-inline-flex align-items-center me-1">
                        <i className="fa-solid fa-circle fs-5 me-1" />
                        Paid
                      </span>
                      <Link to="#" className="action-icon">
                        <i className="isax isax-document-download" />
                      </Link>
                    </div>
                  </div>
                  <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-2">
                    <div>
                      <h6 className="mb-1">Become an app designer</h6>
                      <div className="d-flex align-items-center">
                        <span className="badge badge-sm bg-light border d-inline-flex me-3">
                          #INV005
                        </span>
                        <p className="small">
                          Amount :{" "}
                          <span className="heading-color fw-semibold">
                            $220
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="d-flex align-items-center">
                      <span className="badge fw-normal bg-success d-inline-flex align-items-center me-1">
                        <i className="fa-solid fa-circle fs-5 me-1" />
                        Paid
                      </span>
                      <Link to="#" className="action-icon">
                        <i className="isax isax-document-download" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-5">
              <div className="card mb-0">
                <div className="card-body">
                  <h5 className="mb-3 fs-18 border-bottom pb-3">
                    Latest Quizes
                  </h5>
                  <div className="d-flex align-items-center flex-wrap flex-md-nowrap justify-content-between row-gap-2 mb-3">
                    <div>
                      <h6 className="mb-1">Sketch from A to Z (2024)</h6>
                      <div className="d-flex align-items-center">
                        <p>Correct Answer : 15/22</p>
                      </div>
                    </div>
                    
                    <CircleProgress value={95}/>
                  </div>
                  <div className="d-flex align-items-center flex-wrap flex-md-nowrap justify-content-between row-gap-2 mb-3">
                    <div>
                      <h6 className="mb-1">Build Responsive Real World </h6>
                      <div className="d-flex align-items-center">
                        <p>Correct Answer : 18/22</p>
                      </div>
                    </div>
                    <CircleProgress value={100}/>
                  </div>
                  <div className="d-flex align-items-center flex-wrap flex-md-nowrap justify-content-between row-gap-2 mb-3">
                    <div>
                      <h6 className="mb-1">UI/UX Design Degree</h6>
                      <div className="d-flex align-items-center">
                        <p>Correct Answer : 25/30</p>
                      </div>
                    </div>
                    <CircleProgress value={80}/>
                  </div>
                  <div className="d-flex align-items-center flex-wrap flex-md-nowrap justify-content-between row-gap-2 mb-3">
                    <div>
                      <h6 className="mb-1">Build Responsive Real World </h6>
                      <div className="d-flex align-items-center">
                        <p>Correct Answer : 15/20</p>
                      </div>
                    </div>
                    <CircleProgress value={85}/>
                  </div>
                  <div className="d-flex align-items-center flex-wrap flex-md-nowrap justify-content-between row-gap-2">
                    <div>
                      <h6 className="mb-1">Become an app designer</h6>
                      <div className="d-flex align-items-center">
                        <p>Correct Answer : 12/20</p>
                      </div>
                    </div>
                    <CircleProgress value={20}/>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

    </>
  )
}

export default StudentDashboard