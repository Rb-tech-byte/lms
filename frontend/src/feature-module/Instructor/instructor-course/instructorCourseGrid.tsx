import React from 'react'
import Breadcrumb from '../../../core/common/Breadcrumb/breadcrumb'
import { all_routes } from '../../router/all_routes'
import ProfileCard from '../common/profileCard'
import InstructorSidebar from '../common/instructorSidebar'
import { Link } from 'react-router-dom'
import ImageWithBasePath from '../../../core/common/imageWithBasePath'

const InstructorCourseGrid = () => {
  return (
    <>
    <Breadcrumb title='Courses'/>
    <div className="content">
  <div className="container">
    <ProfileCard/>
    <div className="row">
      {/* Sidebar */}
     <InstructorSidebar/>
      {/* /Sidebar */}
      <div className="col-lg-9">
        <div className="row">
          <div className="col-xxl col-lg-4 col-md-6">
            <div className="card bg-success">
              <div className="card-body">
                <h6 className="fw-medium mb-1 text-white">Active Courses</h6>
                <h4 className="text-white fw-bold">45</h4>
              </div>
            </div>
          </div>
          <div className="col-xxl col-lg-4 col-md-6">
            <div className="card bg-secondary">
              <div className="card-body">
                <h6 className="fw-medium mb-1 text-white">Pending Courses</h6>
                <h4 className="text-white fw-bold">21</h4>
              </div>
            </div>
          </div>
          <div className="col-xxl col-lg-4 col-md-6">
            <div className="card bg-info">
              <div className="card-body">
                <h6 className="fw-medium mb-1 text-white">Draft Courses</h6>
                <h4 className="text-white fw-bold">15</h4>
              </div>
            </div>
          </div>
          <div className="col-xxl col-lg-4 col-md-6">
            <div className="card bg-skyblue">
              <div className="card-body">
                <h6 className="fw-medium mb-1 text-white">Free Courses</h6>
                <h4 className="text-white fw-bold">16</h4>
              </div>
            </div>
          </div>
          <div className="col-xxl col-lg-4 col-md-6">
            <div className="card bg-purple">
              <div className="card-body">
                <h6 className="fw-medium mb-1 text-white">Paid Courses</h6>
                <h4 className="fw-bold text-white">21</h4>
              </div>
            </div>
          </div>
        </div>
        <div className="page-title d-flex align-items-center justify-content-between">
          <h5 className="fw-bold">Courses</h5>
          <div className="d-flex align-items-center list-icons">
            <Link to={all_routes.instructorCourse} className="me-2">
              <i className="isax isax-task" />
            </Link>
            <Link to="#" className="active ">
              <i className="isax isax-element-3" />
            </Link>
          </div>
        </div>
        <div className="tab-list course-tab">
          <ul className="nav mb-2" role="tablist">
            <li className="nav-item" role="presentation">
              <Link
                to="#"
                className="active"
                data-bs-toggle="tab"
                data-bs-target="#enroll-courses"
                aria-selected="true"
                role="tab"
              >
                Publish (45)
              </Link>
            </li>
            <li className="nav-item" role="presentation">
              <Link
                to="#"
                data-bs-toggle="tab"
                data-bs-target="#active-courses"
                aria-selected="false"
                role="tab"
                tabIndex={-1}
              >
                Pending (2)
              </Link>
            </li>
            <li className="nav-item" role="presentation">
              <Link
                to="#"
                data-bs-toggle="tab"
                data-bs-target="#complete-courses"
                aria-selected="false"
                role="tab"
                tabIndex={-1}
              >
                Draft (1)
              </Link>
            </li>
            <li className="nav-item" role="presentation">
              <Link
                to="#"
                data-bs-toggle="tab"
                data-bs-target="#inactive-course"
                aria-selected="false"
                role="tab"
                tabIndex={-1}
              >
                Inactive (3)
              </Link>
            </li>
          </ul>
        </div>
        <div className="tab-content">
          <div
            className="tab-pane fade active show"
            id="enroll-courses"
            role="tabpanel"
          >
            <div className="row">
              <div className="col-xl-4 col-md-6">
                <div className="course-item course-item-three">
                  <div className="position-relative overflow-hidden rounded-3 mb-3 course-image">
                    <Link to="#">
                      <ImageWithBasePath
                        className="img-fluid rounded-3"
                        src="./assets/img/course/course-16.jpg"
                        alt="img"
                      />
                    </Link>
                    <span className="fs-20 price-top d-inline-flex align-items-center">
                      $200 <del className="fs-14 ms-2">$990.00</del>
                    </span>
                  </div>
                  <h6 className="mt-3 mb-3 fs-18 fw-bold text-truncate line-clamb-2">
                    <Link to="#">
                      Information About UI/UX Design Degree
                    </Link>
                  </h6>
                  <div className="d-flex align-items-center justify-content-between border-bottom mb-3 pb-3">
                    <span className="d-inline-flex align-items-center text-gray-5">
                      <ImageWithBasePath
                        src="assets/img/icon/book-3.svg"
                        className="me-1"
                        alt=""
                      />
                      12+ Lesson
                    </span>
                    <span className="d-inline-flex align-items-center text-gray-5">
                      <ImageWithBasePath
                        src="assets/img/icon/timer-start.svg"
                        className="me-1"
                        alt=""
                      />
                      9hr 30min
                    </span>
                  </div>
                  <div className="d-flex justify-content-between mt-3 align-items-center">
                    <Link
                      to="#"
                      className="d-inline-flex align-items-center fs-14 text-gray-5"
                      data-bs-toggle="modal"
                      data-bs-target="#delete_modal"
                    >
                      <i className="isax isax-trash me-2" />
                      Delete
                    </Link>
                    <Link
                      to="#"
                      className="d-inline-flex align-items-center fs-14 text-gray-5"
                    >
                      <i className="isax isax-edit-2 me-2" />
                      Edit
                    </Link>
                  </div>
                </div>
              </div>
              <div className="col-xl-4 col-md-6">
                <div className="course-item course-item-three">
                  <div className="position-relative overflow-hidden rounded-3 mb-3 course-image">
                    <Link to="#">
                      <ImageWithBasePath
                        className="img-fluid rounded-3"
                        src="./assets/img/course/course-17.jpg"
                        alt="img"
                      />
                    </Link>
                    <span className="fs-20 price-top d-inline-flex align-items-center">
                      $156
                    </span>
                  </div>
                  <h6 className="mt-3 mb-3 fs-18 fw-bold text-truncate line-clamb-2">
                    <Link to="#">
                      Wordpress for Beginners - Master Wordpress Quickly
                    </Link>
                  </h6>
                  <div className="d-flex align-items-center justify-content-between border-bottom mb-3 pb-3">
                    <span className="d-inline-flex align-items-center text-gray-5">
                      <ImageWithBasePath
                        src="assets/img/icon/book-3.svg"
                        className="me-1"
                        alt=""
                      />
                      12+ Lesson
                    </span>
                    <span className="d-inline-flex align-items-center text-gray-5">
                      <ImageWithBasePath
                        src="assets/img/icon/timer-start.svg"
                        className="me-1"
                        alt=""
                      />
                      9hr 30min
                    </span>
                  </div>
                  <div className="d-flex justify-content-between mt-3 align-items-center">
                    <Link
                      to="#"
                      className="d-inline-flex align-items-center fs-14 text-gray-5"
                      data-bs-toggle="modal"
                      data-bs-target="#delete_modal"
                    >
                      <i className="isax isax-trash me-2" />
                      Delete
                    </Link>
                    <Link
                      to="#"
                      className="d-inline-flex align-items-center fs-14 text-gray-5"
                    >
                      <i className="isax isax-edit-2 me-2" />
                      Edit
                    </Link>
                  </div>
                </div>
              </div>
              <div className="col-xl-4 col-md-6">
                <div className="course-item course-item-three">
                  <div className="position-relative overflow-hidden rounded-3 mb-3 course-image">
                    <Link to="#">
                      <ImageWithBasePath
                        className="img-fluid rounded-3"
                        src="./assets/img/course/course-18.jpg"
                        alt="img"
                      />
                    </Link>
                    <span className="fs-20 price-top d-inline-flex text-success align-items-center">
                      Free
                    </span>
                  </div>
                  <h6 className="mt-3 mb-3 fs-18 fw-bold text-truncate line-clamb-2">
                    <Link to="#">
                      Sketch from A to Z (2022): Become an app designer
                    </Link>
                  </h6>
                  <div className="d-flex align-items-center justify-content-between border-bottom mb-3 pb-3">
                    <span className="d-inline-flex align-items-center text-gray-5">
                      <ImageWithBasePath
                        src="assets/img/icon/book-3.svg"
                        className="me-1"
                        alt=""
                      />
                      12+ Lesson
                    </span>
                    <span className="d-inline-flex align-items-center text-gray-5">
                      <ImageWithBasePath
                        src="assets/img/icon/timer-start.svg"
                        className="me-1"
                        alt=""
                      />
                      9hr 30min
                    </span>
                  </div>
                  <div className="d-flex justify-content-between mt-3 align-items-center">
                    <Link
                      to="#"
                      className="d-inline-flex align-items-center fs-14 text-gray-5"
                      data-bs-toggle="modal"
                      data-bs-target="#delete_modal"
                    >
                      <i className="isax isax-trash me-2" />
                      Delete
                    </Link>
                    <Link
                      to="#"
                      className="d-inline-flex align-items-center fs-14 text-gray-5"
                    >
                      <i className="isax isax-edit-2 me-2" />
                      Edit
                    </Link>
                  </div>
                </div>
              </div>
              <div className="col-xl-4 col-md-6">
                <div className="course-item course-item-three">
                  <div className="position-relative overflow-hidden rounded-3 mb-3 course-image">
                    <Link to="#">
                      <ImageWithBasePath
                        className="img-fluid rounded-3"
                        src="./assets/img/course/course-19.jpg"
                        alt="img"
                      />
                    </Link>
                    <span className="fs-20 price-top d-inline-flex align-items-center">
                      $145
                    </span>
                  </div>
                  <h6 className="mt-3 mb-3 fs-18 fw-bold text-truncate line-clamb-2">
                    <Link to="#">
                      Learn Angular Fundamental From beginning to adv
                    </Link>
                  </h6>
                  <div className="d-flex align-items-center justify-content-between border-bottom mb-3 pb-3">
                    <span className="d-inline-flex align-items-center text-gray-5">
                      <ImageWithBasePath
                        src="assets/img/icon/book-3.svg"
                        className="me-1"
                        alt=""
                      />
                      12+ Lesson
                    </span>
                    <span className="d-inline-flex align-items-center text-gray-5">
                      <ImageWithBasePath
                        src="assets/img/icon/timer-start.svg"
                        className="me-1"
                        alt=""
                      />
                      9hr 30min
                    </span>
                  </div>
                  <div className="d-flex justify-content-between mt-3 align-items-center">
                    <Link
                      to="#"
                      className="d-inline-flex align-items-center fs-14 text-gray-5"
                      data-bs-toggle="modal"
                      data-bs-target="#delete_modal"
                    >
                      <i className="isax isax-trash me-2" />
                      Delete
                    </Link>
                    <Link
                      to="#"
                      className="d-inline-flex align-items-center fs-14 text-gray-5"
                    >
                      <i className="isax isax-edit-2 me-2" />
                      Edit
                    </Link>
                  </div>
                </div>
              </div>
              <div className="col-xl-4 col-md-6">
                <div className="course-item course-item-three">
                  <div className="position-relative overflow-hidden rounded-3 mb-3 course-image">
                    <Link to="#">
                      <ImageWithBasePath
                        className="img-fluid rounded-3"
                        src="./assets/img/course/course-20.jpg"
                        alt="img"
                      />
                    </Link>
                  </div>
                  <h6 className="mt-3 mb-3 fs-18 fw-bold text-truncate line-clamb-2">
                    <Link to="#">
                      C# Developers Double Your Coding Speed
                    </Link>
                  </h6>
                  <div className="d-flex align-items-center justify-content-between border-bottom mb-3 pb-3">
                    <span className="d-inline-flex align-items-center text-gray-5">
                      <ImageWithBasePath
                        src="assets/img/icon/book-3.svg"
                        className="me-1"
                        alt=""
                      />
                      12+ Lesson
                    </span>
                    <span className="d-inline-flex align-items-center text-gray-5">
                      <ImageWithBasePath
                        src="assets/img/icon/timer-start.svg"
                        className="me-1"
                        alt=""
                      />
                      9hr 30min
                    </span>
                  </div>
                  <div className="d-flex justify-content-between mt-3 align-items-center">
                    <Link
                      to="#"
                      className="d-inline-flex align-items-center fs-14 text-gray-5"
                      data-bs-toggle="modal"
                      data-bs-target="#delete_modal"
                    >
                      <i className="isax isax-trash me-2" />
                      Delete
                    </Link>
                    <Link
                      to="#"
                      className="d-inline-flex align-items-center fs-14 text-gray-5"
                    >
                      <i className="isax isax-edit-2 me-2" />
                      Edit
                    </Link>
                  </div>
                </div>
              </div>
              <div className="col-xl-4 col-md-6">
                <div className="course-item course-item-three">
                  <div className="position-relative overflow-hidden rounded-3 mb-3 course-image">
                    <Link to="#">
                      <ImageWithBasePath
                        className="img-fluid rounded-3"
                        src="./assets/img/course/course-21.jpg"
                        alt="img"
                      />
                    </Link>
                    <span className="fs-20 price-top d-inline-flex align-items-center">
                      $200 <del className="fs-14 ms-2">$990.00</del>
                    </span>
                  </div>
                  <h6 className="mt-3 mb-3 fs-18 fw-bold text-truncate line-clamb-2">
                    <Link to="#">
                      Build Responsive Real World Websites
                    </Link>
                  </h6>
                  <div className="d-flex align-items-center justify-content-between border-bottom mb-3 pb-3">
                    <span className="d-inline-flex align-items-center text-gray-5">
                      <ImageWithBasePath
                        src="assets/img/icon/book-3.svg"
                        className="me-1"
                        alt=""
                      />
                      12+ Lesson
                    </span>
                    <span className="d-inline-flex align-items-center text-gray-5">
                      <ImageWithBasePath
                        src="assets/img/icon/timer-start.svg"
                        className="me-1"
                        alt=""
                      />
                      9hr 30min
                    </span>
                  </div>
                  <div className="d-flex justify-content-between mt-3 align-items-center">
                    <Link
                      to="#"
                      className="d-inline-flex align-items-center fs-14 text-gray-5"
                      data-bs-toggle="modal"
                      data-bs-target="#delete_modal"
                    >
                      <i className="isax isax-trash me-2" />
                      Delete
                    </Link>
                    <Link
                      to="#"
                      className="d-inline-flex align-items-center fs-14 text-gray-5"
                    >
                      <i className="isax isax-edit-2 me-2" />
                      Edit
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="tab-pane fade" id="active-courses" role="tabpanel">
            <div className="row">
              <div className="col-xl-4 col-md-6">
                <div className="course-item course-item-three">
                  <div className="position-relative overflow-hidden rounded-3 mb-3 course-image">
                    <Link to="#">
                      <ImageWithBasePath
                        className="img-fluid rounded-3"
                        src="./assets/img/course/course-16.jpg"
                        alt="img"
                      />
                    </Link>
                    <span className="fs-20 price-top d-inline-flex align-items-center">
                      $200 <del className="fs-14 ms-2">$990.00</del>
                    </span>
                  </div>
                  <h6 className="mt-3 mb-3 fs-18 fw-bold text-truncate line-clamb-2">
                    <Link to="#">
                      Information About UI/UX Design Degree
                    </Link>
                  </h6>
                  <div className="d-flex align-items-center justify-content-between border-bottom mb-3 pb-3">
                    <span className="d-inline-flex align-items-center text-gray-5">
                      <ImageWithBasePath
                        src="assets/img/icon/book-3.svg"
                        className="me-1"
                        alt=""
                      />
                      12+ Lesson
                    </span>
                    <span className="d-inline-flex align-items-center text-gray-5">
                      <ImageWithBasePath
                        src="assets/img/icon/timer-start.svg"
                        className="me-1"
                        alt=""
                      />
                      9hr 30min
                    </span>
                  </div>
                  <div className="d-flex justify-content-between mt-3 align-items-center">
                    <Link
                      to="#"
                      className="d-inline-flex align-items-center fs-14 text-gray-5"
                      data-bs-toggle="modal"
                      data-bs-target="#delete_modal"
                    >
                      <i className="isax isax-trash me-2" />
                      Delete
                    </Link>
                    <Link
                      to="#"
                      className="d-inline-flex align-items-center fs-14 text-gray-5"
                    >
                      <i className="isax isax-edit-2 me-2" />
                      Edit
                    </Link>
                  </div>
                </div>
              </div>
              <div className="col-xl-4 col-md-6">
                <div className="course-item course-item-three">
                  <div className="position-relative overflow-hidden rounded-3 mb-3 course-image">
                    <Link to="#">
                      <ImageWithBasePath
                        className="img-fluid rounded-3"
                        src="./assets/img/course/course-17.jpg"
                        alt="img"
                      />
                    </Link>
                    <span className="fs-20 price-top d-inline-flex align-items-center">
                      $156
                    </span>
                  </div>
                  <h6 className="mt-3 mb-3 fs-18 fw-bold text-truncate line-clamb-2">
                    <Link to="#">
                      Wordpress for Beginners - Master Wordpress Quickly
                    </Link>
                  </h6>
                  <div className="d-flex align-items-center justify-content-between border-bottom mb-3 pb-3">
                    <span className="d-inline-flex align-items-center text-gray-5">
                      <ImageWithBasePath
                        src="assets/img/icon/book-3.svg"
                        className="me-1"
                        alt=""
                      />
                      12+ Lesson
                    </span>
                    <span className="d-inline-flex align-items-center text-gray-5">
                      <ImageWithBasePath
                        src="assets/img/icon/timer-start.svg"
                        className="me-1"
                        alt=""
                      />
                      9hr 30min
                    </span>
                  </div>
                  <div className="d-flex justify-content-between mt-3 align-items-center">
                    <Link
                      to="#"
                      className="d-inline-flex align-items-center fs-14 text-gray-5"
                      data-bs-toggle="modal"
                      data-bs-target="#delete_modal"
                    >
                      <i className="isax isax-trash me-2" />
                      Delete
                    </Link>
                    <Link
                      to="#"
                      className="d-inline-flex align-items-center fs-14 text-gray-5"
                    >
                      <i className="isax isax-edit-2 me-2" />
                      Edit
                    </Link>
                  </div>
                </div>
              </div>
              <div className="col-xl-4 col-md-6">
                <div className="course-item course-item-three">
                  <div className="position-relative overflow-hidden rounded-3 mb-3 course-image">
                    <Link to="#">
                      <ImageWithBasePath
                        className="img-fluid rounded-3"
                        src="./assets/img/course/course-18.jpg"
                        alt="img"
                      />
                    </Link>
                    <span className="fs-20 price-top d-inline-flex text-success align-items-center">
                      Free
                    </span>
                  </div>
                  <h6 className="mt-3 mb-3 fs-18 fw-bold text-truncate line-clamb-2">
                    <Link to="#">
                      Sketch from A to Z (2022): Become an app designer
                    </Link>
                  </h6>
                  <div className="d-flex align-items-center justify-content-between border-bottom mb-3 pb-3">
                    <span className="d-inline-flex align-items-center text-gray-5">
                      <ImageWithBasePath
                        src="assets/img/icon/book-3.svg"
                        className="me-1"
                        alt=""
                      />
                      12+ Lesson
                    </span>
                    <span className="d-inline-flex align-items-center text-gray-5">
                      <ImageWithBasePath
                        src="assets/img/icon/timer-start.svg"
                        className="me-1"
                        alt=""
                      />
                      9hr 30min
                    </span>
                  </div>
                  <div className="d-flex justify-content-between mt-3 align-items-center">
                    <Link
                      to="#"
                      className="d-inline-flex align-items-center fs-14 text-gray-5"
                      data-bs-toggle="modal"
                      data-bs-target="#delete_modal"
                    >
                      <i className="isax isax-trash me-2" />
                      Delete
                    </Link>
                    <Link
                      to="#"
                      className="d-inline-flex align-items-center fs-14 text-gray-5"
                    >
                      <i className="isax isax-edit-2 me-2" />
                      Edit
                    </Link>
                  </div>
                </div>
              </div>
              <div className="col-xl-4 col-md-6">
                <div className="course-item course-item-three">
                  <div className="position-relative overflow-hidden rounded-3 mb-3 course-image">
                    <Link to="#">
                      <ImageWithBasePath
                        className="img-fluid rounded-3"
                        src="./assets/img/course/course-19.jpg"
                        alt="img"
                      />
                    </Link>
                    <span className="fs-20 price-top d-inline-flex align-items-center">
                      $145
                    </span>
                  </div>
                  <h6 className="mt-3 mb-3 fs-18 fw-bold text-truncate line-clamb-2">
                    <Link to="#">
                      Learn Angular Fundamental From beginning to adv
                    </Link>
                  </h6>
                  <div className="d-flex align-items-center justify-content-between border-bottom mb-3 pb-3">
                    <span className="d-inline-flex align-items-center text-gray-5">
                      <ImageWithBasePath
                        src="assets/img/icon/book-3.svg"
                        className="me-1"
                        alt=""
                      />
                      12+ Lesson
                    </span>
                    <span className="d-inline-flex align-items-center text-gray-5">
                      <ImageWithBasePath
                        src="assets/img/icon/timer-start.svg"
                        className="me-1"
                        alt=""
                      />
                      9hr 30min
                    </span>
                  </div>
                  <div className="d-flex justify-content-between mt-3 align-items-center">
                    <Link
                      to="#"
                      className="d-inline-flex align-items-center fs-14 text-gray-5"
                      data-bs-toggle="modal"
                      data-bs-target="#delete_modal"
                    >
                      <i className="isax isax-trash me-2" />
                      Delete
                    </Link>
                    <Link
                      to="#"
                      className="d-inline-flex align-items-center fs-14 text-gray-5"
                    >
                      <i className="isax isax-edit-2 me-2" />
                      Edit
                    </Link>
                  </div>
                </div>
              </div>
              <div className="col-xl-4 col-md-6">
                <div className="course-item course-item-three">
                  <div className="position-relative overflow-hidden rounded-3 mb-3 course-image">
                    <Link to="#">
                      <ImageWithBasePath
                        className="img-fluid rounded-3"
                        src="./assets/img/course/course-20.jpg"
                        alt="img"
                      />
                    </Link>
                  </div>
                  <h6 className="mt-3 mb-3 fs-18 fw-bold text-truncate line-clamb-2">
                    <Link to="#">
                      C# Developers Double Your Coding Speed
                    </Link>
                  </h6>
                  <div className="d-flex align-items-center justify-content-between border-bottom mb-3 pb-3">
                    <span className="d-inline-flex align-items-center text-gray-5">
                      <ImageWithBasePath
                        src="assets/img/icon/book-3.svg"
                        className="me-1"
                        alt=""
                      />
                      12+ Lesson
                    </span>
                    <span className="d-inline-flex align-items-center text-gray-5">
                      <ImageWithBasePath
                        src="assets/img/icon/timer-start.svg"
                        className="me-1"
                        alt=""
                      />
                      9hr 30min
                    </span>
                  </div>
                  <div className="d-flex justify-content-between mt-3 align-items-center">
                    <Link
                      to="#"
                      className="d-inline-flex align-items-center fs-14 text-gray-5"
                      data-bs-toggle="modal"
                      data-bs-target="#delete_modal"
                    >
                      <i className="isax isax-trash me-2" />
                      Delete
                    </Link>
                    <Link
                      to="#"
                      className="d-inline-flex align-items-center fs-14 text-gray-5"
                    >
                      <i className="isax isax-edit-2 me-2" />
                      Edit
                    </Link>
                  </div>
                </div>
              </div>
              <div className="col-xl-4 col-md-6">
                <div className="course-item course-item-three">
                  <div className="position-relative overflow-hidden rounded-3 mb-3 course-image">
                    <Link to="#">
                      <ImageWithBasePath
                        className="img-fluid rounded-3"
                        src="./assets/img/course/course-21.jpg"
                        alt="img"
                      />
                    </Link>
                    <span className="fs-20 price-top d-inline-flex align-items-center">
                      $200 <del className="fs-14 ms-2">$990.00</del>
                    </span>
                  </div>
                  <h6 className="mt-3 mb-3 fs-18 fw-bold text-truncate line-clamb-2">
                    <Link to="#">
                      Build Responsive Real World Websites
                    </Link>
                  </h6>
                  <div className="d-flex align-items-center justify-content-between border-bottom mb-3 pb-3">
                    <span className="d-inline-flex align-items-center text-gray-5">
                      <ImageWithBasePath
                        src="assets/img/icon/book-3.svg"
                        className="me-1"
                        alt=""
                      />
                      12+ Lesson
                    </span>
                    <span className="d-inline-flex align-items-center text-gray-5">
                      <ImageWithBasePath
                        src="assets/img/icon/timer-start.svg"
                        className="me-1"
                        alt=""
                      />
                      9hr 30min
                    </span>
                  </div>
                  <div className="d-flex justify-content-between mt-3 align-items-center">
                    <Link
                      to="#"
                      className="d-inline-flex align-items-center fs-14 text-gray-5"
                      data-bs-toggle="modal"
                      data-bs-target="#delete_modal"
                    >
                      <i className="isax isax-trash me-2" />
                      Delete
                    </Link>
                    <Link
                      to="#"
                      className="d-inline-flex align-items-center fs-14 text-gray-5"
                    >
                      <i className="isax isax-edit-2 me-2" />
                      Edit
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="tab-pane fade" id="complete-courses" role="tabpanel">
            <div className="row">
              <div className="col-xl-4 col-md-6">
                <div className="course-item course-item-three">
                  <div className="position-relative overflow-hidden rounded-3 mb-3 course-image">
                    <Link to="#">
                      <ImageWithBasePath
                        className="img-fluid rounded-3"
                        src="./assets/img/course/course-16.jpg"
                        alt="img"
                      />
                    </Link>
                    <span className="fs-20 price-top d-inline-flex align-items-center">
                      $200 <del className="fs-14 ms-2">$990.00</del>
                    </span>
                  </div>
                  <h6 className="mt-3 mb-3 fs-18 fw-bold text-truncate line-clamb-2">
                    <Link to="#">
                      Information About UI/UX Design Degree
                    </Link>
                  </h6>
                  <div className="d-flex align-items-center justify-content-between border-bottom mb-3 pb-3">
                    <span className="d-inline-flex align-items-center text-gray-5">
                      <ImageWithBasePath
                        src="assets/img/icon/book-3.svg"
                        className="me-1"
                        alt=""
                      />
                      12+ Lesson
                    </span>
                    <span className="d-inline-flex align-items-center text-gray-5">
                      <ImageWithBasePath
                        src="assets/img/icon/timer-start.svg"
                        className="me-1"
                        alt=""
                      />
                      9hr 30min
                    </span>
                  </div>
                  <div className="d-flex justify-content-between mt-3 align-items-center">
                    <Link
                      to="#"
                      className="d-inline-flex align-items-center fs-14 text-gray-5"
                      data-bs-toggle="modal"
                      data-bs-target="#delete_modal"
                    >
                      <i className="isax isax-trash me-2" />
                      Delete
                    </Link>
                    <Link
                      to="#"
                      className="d-inline-flex align-items-center fs-14 text-gray-5"
                    >
                      <i className="isax isax-edit-2 me-2" />
                      Edit
                    </Link>
                  </div>
                </div>
              </div>
              <div className="col-xl-4 col-md-6">
                <div className="course-item course-item-three">
                  <div className="position-relative overflow-hidden rounded-3 mb-3 course-image">
                    <Link to="#">
                      <ImageWithBasePath
                        className="img-fluid rounded-3"
                        src="./assets/img/course/course-17.jpg"
                        alt="img"
                      />
                    </Link>
                    <span className="fs-20 price-top d-inline-flex align-items-center">
                      $156
                    </span>
                  </div>
                  <h6 className="mt-3 mb-3 fs-18 fw-bold text-truncate line-clamb-2">
                    <Link to="#">
                      Wordpress for Beginners - Master Wordpress Quickly
                    </Link>
                  </h6>
                  <div className="d-flex align-items-center justify-content-between border-bottom mb-3 pb-3">
                    <span className="d-inline-flex align-items-center text-gray-5">
                      <ImageWithBasePath
                        src="assets/img/icon/book-3.svg"
                        className="me-1"
                        alt=""
                      />
                      12+ Lesson
                    </span>
                    <span className="d-inline-flex align-items-center text-gray-5">
                      <ImageWithBasePath
                        src="assets/img/icon/timer-start.svg"
                        className="me-1"
                        alt=""
                      />
                      9hr 30min
                    </span>
                  </div>
                  <div className="d-flex justify-content-between mt-3 align-items-center">
                    <Link
                      to="#"
                      className="d-inline-flex align-items-center fs-14 text-gray-5"
                      data-bs-toggle="modal"
                      data-bs-target="#delete_modal"
                    >
                      <i className="isax isax-trash me-2" />
                      Delete
                    </Link>
                    <Link
                      to="#"
                      className="d-inline-flex align-items-center fs-14 text-gray-5"
                    >
                      <i className="isax isax-edit-2 me-2" />
                      Edit
                    </Link>
                  </div>
                </div>
              </div>
              <div className="col-xl-4 col-md-6">
                <div className="course-item course-item-three">
                  <div className="position-relative overflow-hidden rounded-3 mb-3 course-image">
                    <Link to="#">
                      <ImageWithBasePath
                        className="img-fluid rounded-3"
                        src="./assets/img/course/course-18.jpg"
                        alt="img"
                      />
                    </Link>
                    <span className="fs-20 price-top d-inline-flex text-success align-items-center">
                      Free
                    </span>
                  </div>
                  <h6 className="mt-3 mb-3 fs-18 fw-bold text-truncate line-clamb-2">
                    <Link to="#">
                      Sketch from A to Z (2022): Become an app designer
                    </Link>
                  </h6>
                  <div className="d-flex align-items-center justify-content-between border-bottom mb-3 pb-3">
                    <span className="d-inline-flex align-items-center text-gray-5">
                      <ImageWithBasePath
                        src="assets/img/icon/book-3.svg"
                        className="me-1"
                        alt=""
                      />
                      12+ Lesson
                    </span>
                    <span className="d-inline-flex align-items-center text-gray-5">
                      <ImageWithBasePath
                        src="assets/img/icon/timer-start.svg"
                        className="me-1"
                        alt=""
                      />
                      9hr 30min
                    </span>
                  </div>
                  <div className="d-flex justify-content-between mt-3 align-items-center">
                    <Link
                      to="#"
                      className="d-inline-flex align-items-center fs-14 text-gray-5"
                      data-bs-toggle="modal"
                      data-bs-target="#delete_modal"
                    >
                      <i className="isax isax-trash me-2" />
                      Delete
                    </Link>
                    <Link
                      to="#"
                      className="d-inline-flex align-items-center fs-14 text-gray-5"
                    >
                      <i className="isax isax-edit-2 me-2" />
                      Edit
                    </Link>
                  </div>
                </div>
              </div>
              <div className="col-xl-4 col-md-6">
                <div className="course-item course-item-three">
                  <div className="position-relative overflow-hidden rounded-3 mb-3 course-image">
                    <Link to="#">
                      <ImageWithBasePath
                        className="img-fluid rounded-3"
                        src="./assets/img/course/course-19.jpg"
                        alt="img"
                      />
                    </Link>
                    <span className="fs-20 price-top d-inline-flex align-items-center">
                      $145
                    </span>
                  </div>
                  <h6 className="mt-3 mb-3 fs-18 fw-bold text-truncate line-clamb-2">
                    <Link to="#">
                      Learn Angular Fundamental From beginning to adv
                    </Link>
                  </h6>
                  <div className="d-flex align-items-center justify-content-between border-bottom mb-3 pb-3">
                    <span className="d-inline-flex align-items-center text-gray-5">
                      <ImageWithBasePath
                        src="assets/img/icon/book-3.svg"
                        className="me-1"
                        alt=""
                      />
                      12+ Lesson
                    </span>
                    <span className="d-inline-flex align-items-center text-gray-5">
                      <ImageWithBasePath
                        src="assets/img/icon/timer-start.svg"
                        className="me-1"
                        alt=""
                      />
                      9hr 30min
                    </span>
                  </div>
                  <div className="d-flex justify-content-between mt-3 align-items-center">
                    <Link
                      to="#"
                      className="d-inline-flex align-items-center fs-14 text-gray-5"
                      data-bs-toggle="modal"
                      data-bs-target="#delete_modal"
                    >
                      <i className="isax isax-trash me-2" />
                      Delete
                    </Link>
                    <Link
                      to="#"
                      className="d-inline-flex align-items-center fs-14 text-gray-5"
                    >
                      <i className="isax isax-edit-2 me-2" />
                      Edit
                    </Link>
                  </div>
                </div>
              </div>
              <div className="col-xl-4 col-md-6">
                <div className="course-item course-item-three">
                  <div className="position-relative overflow-hidden rounded-3 mb-3 course-image">
                    <Link to="#">
                      <ImageWithBasePath
                        className="img-fluid rounded-3"
                        src="./assets/img/course/course-20.jpg"
                        alt="img"
                      />
                    </Link>
                  </div>
                  <h6 className="mt-3 mb-3 fs-18 fw-bold text-truncate line-clamb-2">
                    <Link to="#">
                      C# Developers Double Your Coding Speed
                    </Link>
                  </h6>
                  <div className="d-flex align-items-center justify-content-between border-bottom mb-3 pb-3">
                    <span className="d-inline-flex align-items-center text-gray-5">
                      <ImageWithBasePath
                        src="assets/img/icon/book-3.svg"
                        className="me-1"
                        alt=""
                      />
                      12+ Lesson
                    </span>
                    <span className="d-inline-flex align-items-center text-gray-5">
                      <ImageWithBasePath
                        src="assets/img/icon/timer-start.svg"
                        className="me-1"
                        alt=""
                      />
                      9hr 30min
                    </span>
                  </div>
                  <div className="d-flex justify-content-between mt-3 align-items-center">
                    <Link
                      to="#"
                      className="d-inline-flex align-items-center fs-14 text-gray-5"
                      data-bs-toggle="modal"
                      data-bs-target="#delete_modal"
                    >
                      <i className="isax isax-trash me-2" />
                      Delete
                    </Link>
                    <Link
                      to="#"
                      className="d-inline-flex align-items-center fs-14 text-gray-5"
                    >
                      <i className="isax isax-edit-2 me-2" />
                      Edit
                    </Link>
                  </div>
                </div>
              </div>
              <div className="col-xl-4 col-md-6">
                <div className="course-item course-item-three">
                  <div className="position-relative overflow-hidden rounded-3 mb-3 course-image">
                    <Link to="#">
                      <ImageWithBasePath
                        className="img-fluid rounded-3"
                        src="./assets/img/course/course-21.jpg"
                        alt="img"
                      />
                    </Link>
                    <span className="fs-20 price-top d-inline-flex align-items-center">
                      $200 <del className="fs-14 ms-2">$990.00</del>
                    </span>
                  </div>
                  <h6 className="mt-3 mb-3 fs-18 fw-bold text-truncate line-clamb-2">
                    <Link to="#">
                      Build Responsive Real World Websites
                    </Link>
                  </h6>
                  <div className="d-flex align-items-center justify-content-between border-bottom mb-3 pb-3">
                    <span className="d-inline-flex align-items-center text-gray-5">
                      <ImageWithBasePath
                        src="assets/img/icon/book-3.svg"
                        className="me-1"
                        alt=""
                      />
                      12+ Lesson
                    </span>
                    <span className="d-inline-flex align-items-center text-gray-5">
                      <ImageWithBasePath
                        src="assets/img/icon/timer-start.svg"
                        className="me-1"
                        alt=""
                      />
                      9hr 30min
                    </span>
                  </div>
                  <div className="d-flex justify-content-between mt-3 align-items-center">
                    <Link
                      to="#"
                      className="d-inline-flex align-items-center fs-14 text-gray-5"
                      data-bs-toggle="modal"
                      data-bs-target="#delete_modal"
                    >
                      <i className="isax isax-trash me-2" />
                      Delete
                    </Link>
                    <Link
                      to="#"
                      className="d-inline-flex align-items-center fs-14 text-gray-5"
                    >
                      <i className="isax isax-edit-2 me-2" />
                      Edit
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="tab-pane fade" id="inactive-course" role="tabpanel">
            <div className="row">
              <div className="col-xl-4 col-md-6">
                <div className="course-item course-item-three">
                  <div className="position-relative overflow-hidden rounded-3 mb-3 course-image">
                    <Link to="#">
                      <ImageWithBasePath
                        className="img-fluid rounded-3"
                        src="./assets/img/course/course-16.jpg"
                        alt="img"
                      />
                    </Link>
                    <span className="fs-20 price-top d-inline-flex align-items-center">
                      $200 <del className="fs-14 ms-2">$990.00</del>
                    </span>
                  </div>
                  <h6 className="mt-3 mb-3 fs-18 fw-bold text-truncate line-clamb-2">
                    <Link to="#">
                      Information About UI/UX Design Degree
                    </Link>
                  </h6>
                  <div className="d-flex align-items-center justify-content-between border-bottom mb-3 pb-3">
                    <span className="d-inline-flex align-items-center text-gray-5">
                      <ImageWithBasePath
                        src="assets/img/icon/book-3.svg"
                        className="me-1"
                        alt=""
                      />
                      12+ Lesson
                    </span>
                    <span className="d-inline-flex align-items-center text-gray-5">
                      <ImageWithBasePath
                        src="assets/img/icon/timer-start.svg"
                        className="me-1"
                        alt=""
                      />
                      9hr 30min
                    </span>
                  </div>
                  <div className="d-flex justify-content-between mt-3 align-items-center">
                    <Link
                      to="#"
                      className="d-inline-flex align-items-center fs-14 text-gray-5"
                      data-bs-toggle="modal"
                      data-bs-target="#delete_modal"
                    >
                      <i className="isax isax-trash me-2" />
                      Delete
                    </Link>
                    <Link
                      to="#"
                      className="d-inline-flex align-items-center fs-14 text-gray-5"
                    >
                      <i className="isax isax-edit-2 me-2" />
                      Edit
                    </Link>
                  </div>
                </div>
              </div>
              <div className="col-xl-4 col-md-6">
                <div className="course-item course-item-three">
                  <div className="position-relative overflow-hidden rounded-3 mb-3 course-image">
                    <Link to="#">
                      <ImageWithBasePath
                        className="img-fluid rounded-3"
                        src="./assets/img/course/course-17.jpg"
                        alt="img"
                      />
                    </Link>
                    <span className="fs-20 price-top d-inline-flex align-items-center">
                      $156
                    </span>
                  </div>
                  <h6 className="mt-3 mb-3 fs-18 fw-bold text-truncate line-clamb-2">
                    <Link to="#">
                      Wordpress for Beginners - Master Wordpress Quickly
                    </Link>
                  </h6>
                  <div className="d-flex align-items-center justify-content-between border-bottom mb-3 pb-3">
                    <span className="d-inline-flex align-items-center text-gray-5">
                      <ImageWithBasePath
                        src="assets/img/icon/book-3.svg"
                        className="me-1"
                        alt=""
                      />
                      12+ Lesson
                    </span>
                    <span className="d-inline-flex align-items-center text-gray-5">
                      <ImageWithBasePath
                        src="assets/img/icon/timer-start.svg"
                        className="me-1"
                        alt=""
                      />
                      9hr 30min
                    </span>
                  </div>
                  <div className="d-flex justify-content-between mt-3 align-items-center">
                    <Link
                      to="#"
                      className="d-inline-flex align-items-center fs-14 text-gray-5"
                      data-bs-toggle="modal"
                      data-bs-target="#delete_modal"
                    >
                      <i className="isax isax-trash me-2" />
                      Delete
                    </Link>
                    <Link
                      to="#"
                      className="d-inline-flex align-items-center fs-14 text-gray-5"
                    >
                      <i className="isax isax-edit-2 me-2" />
                      Edit
                    </Link>
                  </div>
                </div>
              </div>
              <div className="col-xl-4 col-md-6">
                <div className="course-item course-item-three">
                  <div className="position-relative overflow-hidden rounded-3 mb-3 course-image">
                    <Link to="#">
                      <ImageWithBasePath
                        className="img-fluid rounded-3"
                        src="./assets/img/course/course-18.jpg"
                        alt="img"
                      />
                    </Link>
                    <span className="fs-20 price-top d-inline-flex text-success align-items-center">
                      Free
                    </span>
                  </div>
                  <h6 className="mt-3 mb-3 fs-18 fw-bold text-truncate line-clamb-2">
                    <Link to="#">
                      Sketch from A to Z (2022): Become an app designer
                    </Link>
                  </h6>
                  <div className="d-flex align-items-center justify-content-between border-bottom mb-3 pb-3">
                    <span className="d-inline-flex align-items-center text-gray-5">
                      <ImageWithBasePath
                        src="assets/img/icon/book-3.svg"
                        className="me-1"
                        alt=""
                      />
                      12+ Lesson
                    </span>
                    <span className="d-inline-flex align-items-center text-gray-5">
                      <ImageWithBasePath
                        src="assets/img/icon/timer-start.svg"
                        className="me-1"
                        alt=""
                      />
                      9hr 30min
                    </span>
                  </div>
                  <div className="d-flex justify-content-between mt-3 align-items-center">
                    <Link
                      to="#"
                      className="d-inline-flex align-items-center fs-14 text-gray-5"
                      data-bs-toggle="modal"
                      data-bs-target="#delete_modal"
                    >
                      <i className="isax isax-trash me-2" />
                      Delete
                    </Link>
                    <Link
                      to="#"
                      className="d-inline-flex align-items-center fs-14 text-gray-5"
                    >
                      <i className="isax isax-edit-2 me-2" />
                      Edit
                    </Link>
                  </div>
                </div>
              </div>
              <div className="col-xl-4 col-md-6">
                <div className="course-item course-item-three">
                  <div className="position-relative overflow-hidden rounded-3 mb-3 course-image">
                    <Link to="#">
                      <ImageWithBasePath
                        className="img-fluid rounded-3"
                        src="./assets/img/course/course-19.jpg"
                        alt="img"
                      />
                    </Link>
                    <span className="fs-20 price-top d-inline-flex align-items-center">
                      $145
                    </span>
                  </div>
                  <h6 className="mt-3 mb-3 fs-18 fw-bold text-truncate line-clamb-2">
                    <Link to="#">
                      Learn Angular Fundamental From beginning to adv
                    </Link>
                  </h6>
                  <div className="d-flex align-items-center justify-content-between border-bottom mb-3 pb-3">
                    <span className="d-inline-flex align-items-center text-gray-5">
                      <ImageWithBasePath
                        src="assets/img/icon/book-3.svg"
                        className="me-1"
                        alt=""
                      />
                      12+ Lesson
                    </span>
                    <span className="d-inline-flex align-items-center text-gray-5">
                      <ImageWithBasePath
                        src="assets/img/icon/timer-start.svg"
                        className="me-1"
                        alt=""
                      />
                      9hr 30min
                    </span>
                  </div>
                  <div className="d-flex justify-content-between mt-3 align-items-center">
                    <Link
                      to="#"
                      className="d-inline-flex align-items-center fs-14 text-gray-5"
                      data-bs-toggle="modal"
                      data-bs-target="#delete_modal"
                    >
                      <i className="isax isax-trash me-2" />
                      Delete
                    </Link>
                    <Link
                      to="#"
                      className="d-inline-flex align-items-center fs-14 text-gray-5"
                    >
                      <i className="isax isax-edit-2 me-2" />
                      Edit
                    </Link>
                  </div>
                </div>
              </div>
              <div className="col-xl-4 col-md-6">
                <div className="course-item course-item-three">
                  <div className="position-relative overflow-hidden rounded-3 mb-3 course-image">
                    <Link to="#">
                      <ImageWithBasePath
                        className="img-fluid rounded-3"
                        src="./assets/img/course/course-20.jpg"
                        alt="img"
                      />
                    </Link>
                  </div>
                  <h6 className="mt-3 mb-3 fs-18 fw-bold text-truncate line-clamb-2">
                    <Link to="#">
                      C# Developers Double Your Coding Speed
                    </Link>
                  </h6>
                  <div className="d-flex align-items-center justify-content-between border-bottom mb-3 pb-3">
                    <span className="d-inline-flex align-items-center text-gray-5">
                      <ImageWithBasePath
                        src="assets/img/icon/book-3.svg"
                        className="me-1"
                        alt=""
                      />
                      12+ Lesson
                    </span>
                    <span className="d-inline-flex align-items-center text-gray-5">
                      <ImageWithBasePath
                        src="assets/img/icon/timer-start.svg"
                        className="me-1"
                        alt=""
                      />
                      9hr 30min
                    </span>
                  </div>
                  <div className="d-flex justify-content-between mt-3 align-items-center">
                    <Link
                      to="#"
                      className="d-inline-flex align-items-center fs-14 text-gray-5"
                      data-bs-toggle="modal"
                      data-bs-target="#delete_modal"
                    >
                      <i className="isax isax-trash me-2" />
                      Delete
                    </Link>
                    <Link
                      to="#"
                      className="d-inline-flex align-items-center fs-14 text-gray-5"
                    >
                      <i className="isax isax-edit-2 me-2" />
                      Edit
                    </Link>
                  </div>
                </div>
              </div>
              <div className="col-xl-4 col-md-6">
                <div className="course-item course-item-three">
                  <div className="position-relative overflow-hidden rounded-3 mb-3 course-image">
                    <Link to="#">
                      <ImageWithBasePath
                        className="img-fluid rounded-3"
                        src="./assets/img/course/course-21.jpg"
                        alt="img"
                      />
                    </Link>
                    <span className="fs-20 price-top d-inline-flex align-items-center">
                      $200 <del className="fs-14 ms-2">$990.00</del>
                    </span>
                  </div>
                  <h6 className="mt-3 mb-3 fs-18 fw-bold text-truncate line-clamb-2">
                    <Link to="#">
                      Build Responsive Real World Websites
                    </Link>
                  </h6>
                  <div className="d-flex align-items-center justify-content-between border-bottom mb-3 pb-3">
                    <span className="d-inline-flex align-items-center text-gray-5">
                      <ImageWithBasePath
                        src="assets/img/icon/book-3.svg"
                        className="me-1"
                        alt=""
                      />
                      12+ Lesson
                    </span>
                    <span className="d-inline-flex align-items-center text-gray-5">
                      <ImageWithBasePath
                        src="assets/img/icon/timer-start.svg"
                        className="me-1"
                        alt=""
                      />
                      9hr 30min
                    </span>
                  </div>
                  <div className="d-flex justify-content-between mt-3 align-items-center">
                    <Link
                      to="#"
                      className="d-inline-flex align-items-center fs-14 text-gray-5"
                      data-bs-toggle="modal"
                      data-bs-target="#delete_modal"
                    >
                      <i className="isax isax-trash me-2" />
                      Delete
                    </Link>
                    <Link
                      to="#"
                      className="d-inline-flex align-items-center fs-14 text-gray-5"
                    >
                      <i className="isax isax-edit-2 me-2" />
                      Edit
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* /pagination */}
        <div className="row align-items-center">
          <div className="col-md-2">
            <p className="pagination-text">Page 1 of 2</p>
          </div>
          <div className="col-md-10">
            <ul className="pagination lms-page justify-content-center justify-content-md-end mt-2 mt-md-0">
              <li className="page-item prev">
                <Link
                  className="page-link"
                  to="#"
                  tabIndex={-1}
                >
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
  {/* Delete Modal */}
  <div className="modal fade" id="delete_modal">
    <div className="modal-dialog modal-dialog-centered">
      <div className="modal-content">
        <div className="modal-body text-center custom-modal-body">
          <span className="avatar avatar-lg bg-danger-transparent rounded-circle mb-2">
            <i className="isax isax-trash fs-24 text-danger" />
          </span>
          <div>
            <h4 className="mb-2">Delete Course</h4>
            <p className="mb-3">Are you sure you want to delete course?</p>
            <div className="d-flex align-items-center justify-content-center">
              <Link
                to="#"
                className="btn bg-gray-100 rounded-pill me-2"
                data-bs-dismiss="modal"
              >
                Cancel
              </Link>
              <Link
                to="#"
                className="btn btn-secondary rounded-pill"
                data-bs-dismiss="modal"
              >
                Yes, Delete
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  {/* /Delete Modal */}
    </>
  )
}

export default InstructorCourseGrid