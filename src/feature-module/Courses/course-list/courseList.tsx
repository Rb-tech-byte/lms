import React, { useState } from 'react'
import Breadcrumb from '../../../core/common/Breadcrumb/breadcrumb'
import { Link } from 'react-router-dom'
import ImageWithBasePath from '../../../core/common/imageWithBasePath'
import { Slider } from 'antd'
import type { SliderSingleProps } from 'antd';
import { all_routes } from '../../router/all_routes'

const CourseList = () => {

  const [selectedItems, setSelectedItems] = useState(Array(10).fill(false));
  const handleItemClick = (index: number) => {
      setSelectedItems((prevSelectedItems) => {
          const updatedSelectedItems = [...prevSelectedItems];
          updatedSelectedItems[index] = !updatedSelectedItems[index];
          return updatedSelectedItems;
      });
  };

  const route = all_routes;

  const formatter: NonNullable<SliderSingleProps['tooltip']>['formatter'] = (value) => `$${value}`;
  return (
    <>
      <Breadcrumb title='Course List' />
      <>
        {/* Course */}
        <section className="course-content course-list-content">
          <div className="container">
            <div className="row align-items-baseline">
              <div className="col-lg-3 theiaStickySidebar">
                <div className="filter-clear">
                  <div className="clear-filter mb-4 pb-lg-2 d-flex align-items-center justify-content-between">
                    <h5>
                      <i className="feather-filter me-2" />
                      Filters
                    </h5>
                    <Link to="#" className="clear-text">
                      Clear
                    </Link>
                  </div>
                  <div className="accordion accordion-customicon1 accordions-items-seperate">
                    <div className="accordion-item">
                      <h2 className="accordion-header" id="headingcustomicon1One">
                        <Link
                          to="#"
                          className="accordion-button"
                          data-bs-toggle="collapse"
                          data-bs-target="#collapsecustomicon1One"
                          aria-expanded="false"
                          aria-controls="collapsecustomicon1One"
                        >
                          Categories <i className="fa-solid fa-chevron-down" />
                        </Link>
                      </h2>
                      <div
                        id="collapsecustomicon1One"
                        className="accordion-collapse collapse show"
                        aria-labelledby="headingcustomicon1One"
                        data-bs-parent="#accordioncustomicon1Example"
                        style={{}}
                      >
                        <div className="accordion-body">
                          <div>
                            <label className="custom_check">
                              <input type="checkbox" name="select_specialist" />
                              <span className="checkmark" /> Backend (3)
                            </label>
                          </div>
                          <div>
                            <label className="custom_check">
                              <input type="checkbox" name="select_specialist" />
                              <span className="checkmark" /> CSS (2)
                            </label>
                          </div>
                          <div>
                            <label className="custom_check">
                              <input type="checkbox" name="select_specialist" />
                              <span className="checkmark" /> Frontend (2)
                            </label>
                          </div>
                          <div>
                            <label className="custom_check">
                              <input type="checkbox" name="select_specialist" />
                              <span className="checkmark" /> General (2)
                            </label>
                          </div>
                          <div>
                            <label className="custom_check">
                              <input
                                type="checkbox"
                                name="select_specialist"
                                defaultChecked
                              />
                              <span className="checkmark" /> IT &amp; Software (2)
                            </label>
                          </div>
                          <div>
                            <label className="custom_check">
                              <input type="checkbox" name="select_specialist" />
                              <span className="checkmark" /> Photography (2)
                            </label>
                          </div>
                          <div>
                            <label className="custom_check">
                              <input type="checkbox" name="select_specialist" />
                              <span className="checkmark" /> Programming Language (3)
                            </label>
                          </div>
                          <div>
                            <label className="custom_check mb-0">
                              <input type="checkbox" name="select_specialist" />
                              <span className="checkmark" /> Technology (2)
                            </label>
                          </div>
                          <Link to="#" className="see-more-btn">
                            See More
                          </Link>
                        </div>
                      </div>
                    </div>
                    <div className="accordion-item">
                      <h2 className="accordion-header" id="headingcustomicon1Two">
                        <Link
                          to="#"
                          className="accordion-button"
                          data-bs-toggle="collapse"
                          data-bs-target="#collapsecustomicon1Two"
                          aria-expanded="false"
                          aria-controls="collapsecustomicon1Two"
                        >
                          Instructors
                          <i className="fa-solid fa-chevron-down" />
                        </Link>
                      </h2>
                      <div
                        id="collapsecustomicon1Two"
                        className="accordion-collapse collapse show"
                        aria-labelledby="headingcustomicon1Two"
                        data-bs-parent="#accordioncustomicon1Example"
                      >
                        <div className="accordion-body">
                          <div>
                            <label className="custom_check">
                              <input type="checkbox" name="select_specialist" />
                              <span className="checkmark" /> Keny White (10)
                            </label>
                          </div>
                          <div>
                            <label className="custom_check">
                              <input type="checkbox" name="select_specialist" />
                              <span className="checkmark" /> Hinata Hyuga (5)
                            </label>
                          </div>
                          <div>
                            <label className="custom_check">
                              <input type="checkbox" name="select_specialist" />
                              <span className="checkmark" /> John Doe (3)
                            </label>
                          </div>
                          <div>
                            <label className="custom_check mb-0">
                              <input
                                type="checkbox"
                                name="select_specialist"
                                defaultChecked
                              />
                              <span className="checkmark" /> Nicole Brown
                            </label>
                          </div>
                          <Link to="#" className="see-more-btn">
                            See More
                          </Link>
                        </div>
                      </div>
                    </div>
                    <div className="accordion-item">
                      <h2 className="accordion-header" id="headingcustomicon1Three">
                        <Link
                          to="#"
                          className="accordion-button"
                          data-bs-toggle="collapse"
                          data-bs-target="#collapsecustomicon1Three"
                          aria-expanded="false"
                          aria-controls="collapsecustomicon1Three"
                        >
                          Price
                          <i className="fa-solid fa-chevron-down" />
                        </Link>
                      </h2>
                      <div
                        id="collapsecustomicon1Three"
                        className="accordion-collapse collapse show"
                        aria-labelledby="headingcustomicon1Three"
                        data-bs-parent="#accordioncustomicon1Example"
                      >
                        <div className="accordion-body">
                          <div>
                            <label className="custom_check custom_one">
                              <input type="checkbox" name="select_specialist" />
                              <span className="checkmark" /> All (10)
                            </label>
                          </div>
                          <div>
                            <label className="custom_check custom_one">
                              <input type="checkbox" name="select_specialist" />
                              <span className="checkmark" /> Free (5)
                            </label>
                          </div>
                          <div>
                            <label className="custom_check custom_one mb-0">
                              <input type="checkbox" name="select_specialist" />
                              <span className="checkmark" /> Paid (3)
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="accordion-item">
                      <h2 className="accordion-header" id="headingcustomicon1Four">
                        <Link
                          to="#"
                          className="accordion-button"
                          data-bs-toggle="collapse"
                          data-bs-target="#collapsecustomicon1Four"
                          aria-expanded="false"
                          aria-controls="collapsecustomicon1Four"
                        >
                          Range
                          <i className="fa-solid fa-chevron-down" />
                        </Link>
                      </h2>
                      <div
                        id="collapsecustomicon1Four"
                        className="accordion-collapse collapse show"
                        aria-labelledby="headingcustomicon1Four"
                        data-bs-parent="#accordioncustomicon1Example"
                      >
                        <div className="accordion-body">
                          <div className="filter-range">
                            <Slider range tooltip={{ formatter }} min={50} max={5695} defaultValue={[50, 2000]} />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="accordion-item">
                      <h2 className="accordion-header" id="headingcustomicon1Five">
                        <Link
                          to="#"
                          className="accordion-button"
                          data-bs-toggle="collapse"
                          data-bs-target="#collapsecustomicon1Five"
                          aria-expanded="false"
                          aria-controls="collapsecustomicon1Five"
                        >
                          Level
                          <i className="fa-solid fa-chevron-down" />
                        </Link>
                      </h2>
                      <div
                        id="collapsecustomicon1Five"
                        className="accordion-collapse collapse show"
                        aria-labelledby="headingcustomicon1Five"
                        data-bs-parent="#accordioncustomicon1Example"
                      >
                        <div className="accordion-body">
                          <div>
                            <label className="custom_check custom_one">
                              <input type="checkbox" name="select_specialist" />
                              <span className="checkmark" />
                              Beginner (10)
                            </label>
                          </div>
                          <div>
                            <label className="custom_check custom_one">
                              <input type="checkbox" name="select_specialist" />
                              <span className="checkmark" /> Intermediate (5)
                            </label>
                          </div>
                          <div>
                            <label className="custom_check custom_one">
                              <input type="checkbox" name="select_specialist" />
                              <span className="checkmark" />
                              Advanced (21)
                            </label>
                          </div>
                          <div>
                            <label className="custom_check custom_one mb-0">
                              <input type="checkbox" name="select_specialist" />
                              <span className="checkmark" />
                              Expert (3)
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="accordion-item">
                      <h2 className="accordion-header" id="headingcustomicon1Six">
                        <Link
                          to="#"
                          className="accordion-button"
                          data-bs-toggle="collapse"
                          data-bs-target="#collapsecustomicon1Six"
                          aria-expanded="false"
                          aria-controls="collapsecustomicon1Six"
                        >
                          Reviews <i className="fa-solid fa-chevron-down" />
                        </Link>
                      </h2>
                      <div
                        id="collapsecustomicon1Six"
                        className="accordion-collapse collapse show"
                        aria-labelledby="headingcustomicon1Six"
                        data-bs-parent="#accordioncustomicon1Example"
                      >
                        <div className="accordion-body">
                          <div>
                            <label className="custom_check custom_one">
                              <input type="checkbox" name="select_specialist" />
                              <span className="checkmark" />
                              <i className="fa-solid fa-star text-warning me-1" />
                              <i className="fa-solid fa-star text-warning me-1" />
                              <i className="fa-solid fa-star text-warning me-1" />
                              <i className="fa-solid fa-star text-warning me-1" />
                              <i className="fa-solid fa-star text-warning" />
                            </label>
                          </div>
                          <div>
                            <label className="custom_check custom_one">
                              <input type="checkbox" name="select_specialist" />
                              <span className="checkmark" />
                              <i className="fa-solid fa-star text-warning me-1" />
                              <i className="fa-solid fa-star text-warning me-1" />
                              <i className="fa-solid fa-star text-warning me-1" />
                              <i className="fa-solid fa-star text-warning me-1" />
                              <i className="fa-solid fa-star text-light" />
                            </label>
                          </div>
                          <div>
                            <label className="custom_check custom_one">
                              <input type="checkbox" name="select_specialist" />
                              <span className="checkmark" />
                              <i className="fa-solid fa-star text-warning me-1" />
                              <i className="fa-solid fa-star text-warning me-1" />
                              <i className="fa-solid fa-star text-warning me-1" />
                              <i className="fa-solid fa-star text-light me-1" />
                              <i className="fa-solid fa-star text-light" />
                            </label>
                          </div>
                          <div>
                            <label className="custom_check custom_one">
                              <input type="checkbox" name="select_specialist" />
                              <span className="checkmark" />
                              <i className="fa-solid fa-star text-warning me-1" />
                              <i className="fa-solid fa-star text-warning me-1" />
                              <i className="fa-solid fa-star text-light me-1" />
                              <i className="fa-solid fa-star text-light me-1" />
                              <i className="fa-solid fa-star text-light" />
                            </label>
                          </div>
                          <div>
                            <label className="custom_check custom_one mb-0">
                              <input type="checkbox" name="select_specialist" />
                              <span className="checkmark" />
                              <i className="fa-solid fa-star text-warning me-1" />
                              <i className="fa-solid fa-star text-light me-1" />
                              <i className="fa-solid fa-star text-light me-1" />
                              <i className="fa-solid fa-star text-light me-1" />
                              <i className="fa-solid fa-star text-light" />
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-lg-9">
                {/* Filter */}
                <div className="showing-list mb-4">
                  <div className="row align-items-center">
                    <div className="col-lg-4">
                      <div className="show-result text-center text-lg-start">
                        <h6 className="fw-medium">Showing 1-9 of 50 results</h6>
                      </div>
                    </div>
                    <div className="col-lg-8">
                      <div className="show-filter add-course-info">
                        <form action="#">
                          <div className="d-sm-flex justify-content-center justify-content-lg-end mb-1 mb-lg-0">
                            <div className="view-icons mb-2 mb-sm-0">
                              <Link to={route.courseGrid} className="grid-view">
                                <i className="feather-grid" />
                              
                              </Link>
                              <Link to={route.courseList} className="list-view active">
                                <i className="isax isax-task" />
                              </Link>
                            </div>
                            <select className="form-select">
                              <option>Newly Published </option>
                              <option>Trending Courses</option>
                              <option>Top Rated</option>
                              <option>Free Courses</option>
                            </select>
                            <div className=" search-group">
                              <i className="isax isax-search-normal-1" />
                              <input
                                type="text"
                                className="form-control"
                                placeholder="Search"
                              />
                            </div>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
                {/* /Filter */}
                <div className="row course-list-wrap">
                  <div className="col-12">
                    <div className="courses-list-item">
                      <div className="d-md-flex align-items-center">
                        <div className="position-relative overflow-hidden rounded-3 card-image">
                          <Link to={route.courseDetails}>
                            <ImageWithBasePath
                              className="img-fluid rounded-3"
                              src="./assets/img/course/course-01.jpg"
                              alt="img"
                            />
                          </Link>
                          <div className="position-absolute start-0 top-0 d-flex align-items-start w-100 z-index-2 p-2" key={1} onClick={() => handleItemClick(1)}>
                            <Link to="#" className={`like ${selectedItems[1]? 'selected':''}`}>
                              <i className="isax isax-heart" />
                            </Link>
                          </div>
                        </div>
                        <div className="course-list-contents w-100 ps-0 ps-md-3 pt-4 pt-md-0">
                          <div className="d-flex flex-wrap align-items-center justify-content-between">
                            <div className="d-flex align-items-center">
                              <div className="avatar avatar-sm rounded-circle">
                                <Link to="#">
                                  <ImageWithBasePath
                                    className="img-fluid rounded-circle"
                                    src="./assets/img/avatar/avatar1.jpg"
                                    alt="img"
                                  />
                                </Link>
                              </div>
                              <p className="ms-2">
                                <Link to={route.instructorDetails}>David Benitez</Link>
                              </p>
                            </div>
                            <span>
                              <Link className="tag-btn" to="#">
                                Design
                              </Link>
                            </span>
                          </div>
                          <h4 className="mt-3 mb-2">
                            <Link to={route.courseDetails}>
                              Information About UI/UX Design Degree
                            </Link>
                          </h4>
                          <div className="d-flex align-items-center">
                            <p className="d-flex align-items-center mb-0">
                              <i className="fa-solid fa-star text-warning me-2" /> 4.9
                              (200 Reviews)
                            </p>
                            <span className="dot" />
                            <p>Intermediate</p>
                          </div>
                          <div className="d-flex justify-content-between mt-3 align-items-center">
                            <h5 className="text-secondary">$120</h5>
                            <Link
                              to={route.courseDetails}
                              className="btn btn-dark btn-sm d-inline-flex align-items-center"
                            >
                              Get Course
                              <i className="fs-8 fas fa-angle-right ms-2" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="courses-list-item">
                      <div className="d-md-flex align-items-center">
                        <div className="position-relative overflow-hidden rounded-3 card-image">
                          <Link to={route.courseDetails}>
                            <ImageWithBasePath
                              className="img-fluid rounded-3"
                              src="./assets/img/course/course-02.jpg"
                              alt="img"
                            />
                          </Link>
                          <div className="position-absolute start-0 top-0 d-flex align-items-start w-100 z-index-2 p-2" key={2} onClick={() => handleItemClick(1)}>
                            <Link to="#" className={`like ${selectedItems[2]? 'selected':''}`}>
                              <i className="isax isax-heart" />
                            </Link>
                          </div>
                        </div>
                        <div className="course-list-contents w-100 ps-0 ps-md-3 pt-4 pt-md-0">
                          <div className="d-flex flex-wrap align-items-center justify-content-between">
                            <div className="d-flex align-items-center">
                              <div className="avatar avatar-sm rounded-circle">
                                <Link to="#">
                                  <ImageWithBasePath
                                    className="img-fluid rounded-circle"
                                    src="./assets/img/avatar/avatar2.jpg"
                                    alt="img"
                                  />
                                </Link>
                              </div>
                              <p className="ms-2">
                                <Link to={route.instructorDetails}>Ana Reyes</Link>
                              </p>
                            </div>
                            <span>
                              <Link to="#" className="tag-btn">
                                Wordpress
                              </Link>
                            </span>
                          </div>
                          <h4 className="mt-3 mb-2">
                            <Link to={route.courseDetails}>
                              Wordpress for Beginners - Master Wordpress Quickly
                            </Link>
                          </h4>
                          <div className="d-flex align-items-center">
                            <p className="d-flex align-items-center mb-0">
                              <i className="fa-solid fa-star text-warning me-2" />
                              4.4 (160 Reviews)
                            </p>
                            <span className="dot" />
                            <p>Advanced</p>
                          </div>
                          <div className="d-flex justify-content-between mt-3 align-items-center">
                            <h5 className="text-secondary">$140</h5>
                            <Link
                              to={route.courseDetails}
                              className="btn btn-dark btn-sm d-inline-flex align-items-center"
                            >
                              Get Course
                              <i className="fs-8 fas fa-angle-right ms-2" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="courses-list-item">
                      <div className="d-md-flex align-items-center">
                        <div className="position-relative overflow-hidden rounded-3 card-image">
                          <Link to={route.courseDetails}>
                            <ImageWithBasePath
                              className="img-fluid rounded-3"
                              src="./assets/img/course/course-03.jpg"
                              alt="img"
                            />
                          </Link>
                          <div className="position-absolute start-0 top-0 d-flex align-items-start w-100 z-index-2 p-2" key={3} onClick={() => handleItemClick(1)}>
                            <Link to="#" className={`like ${selectedItems[3]? 'selected':''}`}>
                              <i className="isax isax-heart" />
                            </Link>
                          </div>
                        </div>
                        <div className="course-list-contents w-100 ps-0 ps-md-3 pt-4 pt-md-0">
                          <div className="d-flex flex-wrap align-items-center justify-content-between">
                            <div className="d-flex align-items-center">
                              <div className="avatar avatar-sm rounded-circle">
                                <Link to="#">
                                  <ImageWithBasePath
                                    className="img-fluid rounded-circle"
                                    src="./assets/img/avatar/avatar3.jpg"
                                    alt="img"
                                  />
                                </Link>
                              </div>
                              <p className="ms-2">
                                <Link to={route.instructorDetails}>Andrew Pirtle</Link>
                              </p>
                            </div>
                            <span>
                              <Link to="#" className="tag-btn">
                                Design
                              </Link>
                            </span>
                          </div>
                          <h4 className="mt-3 mb-2">
                            <Link to={route.courseDetails}>
                              Sketch from A to Z (2024): Become an app designer
                            </Link>
                          </h4>
                          <div className="d-flex align-items-center">
                            <p className="d-flex align-items-center mb-0">
                              <i className="fa-solid fa-star text-warning me-2" />
                              4.6 (170 Reviews)
                            </p>
                            <span className="dot" />
                            <p>Basic</p>
                          </div>
                          <div className="d-flex justify-content-between mt-3 align-items-center">
                            <h5 className="text-secondary">$160</h5>
                            <Link
                              to={route.courseDetails}
                              className="btn btn-dark btn-sm d-inline-flex align-items-center"
                            >
                              Get Course
                              <i className="fs-8 fas fa-angle-right ms-2" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="courses-list-item">
                      <div className="d-md-flex align-items-center">
                        <div className="position-relative overflow-hidden rounded-3 card-image">
                          <Link to={route.courseDetails}>
                            <ImageWithBasePath
                              className="img-fluid rounded-3"
                              src="./assets/img/course/course-04.jpg"
                              alt="img"
                            />
                          </Link>
                          <div className="position-absolute start-0 top-0 d-flex align-items-start w-100 z-index-2 p-2" key={4} onClick={() => handleItemClick(1)}>
                            <Link to="#" className={`like ${selectedItems[4]? 'selected':''}`}>
                              <i className="isax isax-heart" />
                            </Link>
                          </div>
                        </div>
                        <div className="course-list-contents w-100 ps-0 ps-md-3 pt-4 pt-md-0">
                          <div className="d-flex flex-wrap align-items-center justify-content-between">
                            <div className="d-flex align-items-center">
                              <div className="avatar avatar-sm rounded-circle">
                                <Link to="#">
                                  <ImageWithBasePath
                                    className="img-fluid rounded-circle"
                                    src="./assets/img/avatar/avatar4.jpg"
                                    alt="img"
                                  />
                                </Link>
                              </div>
                              <p className="ms-2">
                                <Link to={route.instructorDetails}>Christy Garner</Link>
                              </p>
                            </div>
                            <span>
                              <Link to="#" className="tag-btn">
                                Programming
                              </Link>
                            </span>
                          </div>
                          <h4 className="mt-3 mb-2">
                            <Link to={route.courseDetails}>
                              Build Responsive Real World Websites with Crash Course
                            </Link>
                          </h4>
                          <div className="d-flex align-items-center">
                            <p className="d-flex align-items-center mb-0">
                              <i className="fa-solid fa-star text-warning me-2" />
                              4.2 (220 Reviews)
                            </p>
                            <span className="dot" />
                            <p>Advanced</p>
                          </div>
                          <div className="d-flex justify-content-between mt-3 align-items-center">
                            <h5 className="text-secondary">$200</h5>
                            <Link
                              to={route.courseDetails}
                              className="btn btn-dark btn-sm d-inline-flex align-items-center"
                            >
                              Get Course
                              <i className="fs-8 fas fa-angle-right ms-2" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="courses-list-item">
                      <div className="d-md-flex align-items-center">
                        <div className="position-relative overflow-hidden rounded-3 card-image">
                          <Link to={route.courseDetails}>
                            <ImageWithBasePath
                              className="img-fluid rounded-3"
                              src="./assets/img/course/course-05.jpg"
                              alt="img"
                            />
                          </Link>
                          <div className="position-absolute start-0 top-0 d-flex align-items-start w-100 z-index-2 p-2" key={5} onClick={() => handleItemClick(1)}>
                            <Link to="#" className={`like ${selectedItems[5]? 'selected':''}`}>
                              <i className="isax isax-heart" />
                            </Link>
                          </div>
                        </div>
                        <div className="course-list-contents w-100 ps-0 ps-md-3 pt-4 pt-md-0">
                          <div className="d-flex flex-wrap align-items-center justify-content-between">
                            <div className="d-flex align-items-center">
                              <div className="avatar avatar-sm rounded-circle">
                                <Link to="#">
                                  <ImageWithBasePath
                                    className="img-fluid rounded-circle"
                                    src="./assets/img/avatar/avatar5.jpg"
                                    alt="img"
                                  />
                                </Link>
                              </div>
                              <p className="ms-2">
                                <Link to={route.instructorDetails}>Justin Gregory</Link>
                              </p>
                            </div>
                            <span>
                              <Link to="#" className="tag-btn">
                                Programming
                              </Link>
                            </span>
                          </div>
                          <h4 className="mt-3 mb-2">
                            <Link to={route.courseDetails}>
                              Learn JavaScript and Express to become a Expert
                            </Link>
                          </h4>
                          <div className="d-flex align-items-center">
                            <p className="d-flex align-items-center mb-0">
                              <i className="fa-solid fa-star text-warning me-2" />
                              4.4 (180 Reviews)
                            </p>
                            <span className="dot" />
                            <p>Intermediate</p>
                          </div>
                          <div className="d-flex justify-content-between mt-3 align-items-center">
                            <h5 className="text-secondary">$130</h5>
                            <Link
                              to={route.courseDetails}
                              className="btn btn-dark btn-sm d-inline-flex align-items-center"
                            >
                              Get Course
                              <i className="fs-8 fas fa-angle-right ms-2" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="courses-list-item">
                      <div className="d-md-flex align-items-center">
                        <div className="position-relative overflow-hidden rounded-3 card-image">
                          <Link to={route.courseDetails}>
                            <ImageWithBasePath
                              className="img-fluid rounded-3"
                              src="./assets/img/course/course-06.jpg"
                              alt="img"
                            />
                          </Link>
                          <div className="position-absolute start-0 top-0 d-flex align-items-start w-100 z-index-2 p-2" key={6} onClick={() => handleItemClick(1)}>
                            <Link to="#" className={`like ${selectedItems[6]? 'selected':''}`}>
                              <i className="isax isax-heart" />
                            </Link>
                          </div>
                        </div>
                        <div className="course-list-contents w-100 ps-0 ps-md-3 pt-4 pt-md-0">
                          <div className="d-flex flex-wrap align-items-center justify-content-between">
                            <div className="d-flex align-items-center">
                              <div className="avatar avatar-sm rounded-circle">
                                <Link to="#">
                                  <ImageWithBasePath
                                    className="img-fluid rounded-circle"
                                    src="./assets/img/avatar/avatar6.jpg"
                                    alt="img"
                                  />
                                </Link>
                              </div>
                              <p className="ms-2">
                                <Link to={route.instructorDetails}>Carolyn Hines</Link>
                              </p>
                            </div>
                            <span>
                              <Link to="#" className="tag-btn">
                                Programming
                              </Link>
                            </span>
                          </div>
                          <h4 className="mt-3 mb-2">
                            <Link to={route.courseDetails}>
                              Introduction to Python Programming
                            </Link>
                          </h4>
                          <div className="d-flex align-items-center">
                            <p className="d-flex align-items-center mb-0">
                              <i className="fa-solid fa-star text-warning me-2" />
                              4.7 (130 Reviews)
                            </p>
                            <span className="dot" />
                            <p>Expert</p>
                          </div>
                          <div className="d-flex justify-content-between mt-3 align-items-center">
                            <h5 className="text-secondary">$150</h5>
                            <Link
                              to={route.courseDetails}
                              className="btn btn-dark btn-sm d-inline-flex align-items-center"
                            >
                              Get Course
                              <i className="fs-8 fas fa-angle-right ms-2" />
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
        </section>
        {/* /Course */}
      </>

    </>
  )
}

export default CourseList
