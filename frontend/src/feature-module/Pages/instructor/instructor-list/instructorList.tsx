import { Slider, SliderSingleProps } from "antd";
import React, { useState } from "react";
import { all_routes } from "../../../router/all_routes";
import Breadcrumb from "../../../../core/common/Breadcrumb/breadcrumb";
import { Link } from "react-router-dom";
import ImageWithBasePath from "../../../../core/common/imageWithBasePath";

const InstructorList = () => {
  const formatter: NonNullable<SliderSingleProps["tooltip"]>["formatter"] = (
    value
  ) => `$${value}`;

  const [selectedItems, setSelectedItems] = useState(Array(10).fill(false));
  const handleItemClick = (index: number) => {
    setSelectedItems((prevSelectedItems) => {
      const updatedSelectedItems = [...prevSelectedItems];
      updatedSelectedItems[index] = !updatedSelectedItems[index];
      return updatedSelectedItems;
    });
  };

  const route = all_routes;

  return (
    <>
      <Breadcrumb title="Instructor List" />
      <div className="main-wrapper">
        {/* Course */}
        <div className="instructor-list">
          <div className="container">
            <div className="row align-items-baseline">
              <div className="col-lg-3">
                <div className="clear-filter mb-4 pb-lg-2 d-flex align-items-center justify-content-between">
                  <h5>
                    <i className="feather-filter me-2" />
                    Filters
                  </h5>
                  <Link to="#" className="clear-text">
                    Clear
                  </Link>
                </div>
                <div className="filter-clear">
                  <div className="accordion accordion-customicon1 accordions-items-seperate">
                    <div className="accordion-item">
                      <h2
                        className="accordion-header"
                        id="headingcustomicon1One"
                      >
                        <button
                          className="accordion-button"
                          type="button"
                          data-bs-toggle="collapse"
                          data-bs-target="#collapsecustomicon1One"
                          aria-expanded="true"
                          aria-controls="collapsecustomicon1One"
                        >
                          Categories <i className="fa-solid fa-chevron-down" />
                        </button>
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
                              <span className="checkmark" /> IT &amp; Software
                              (2)
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
                              <span className="checkmark" /> Programming
                              Language (3)
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
                      <h2
                        className="accordion-header"
                        id="headingcustomicon1Two"
                      >
                        <button
                          className="accordion-button"
                          type="button"
                          data-bs-toggle="collapse"
                          data-bs-target="#collapsecustomicon1Two"
                          aria-expanded="true"
                          aria-controls="collapsecustomicon1Two"
                        >
                          Instructors
                          <i className="fa-solid fa-chevron-down" />
                        </button>
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
                      <h2
                        className="accordion-header"
                        id="headingcustomicon1Three"
                      >
                        <button
                          className="accordion-button"
                          type="button"
                          data-bs-toggle="collapse"
                          data-bs-target="#collapsecustomicon1Three"
                          aria-expanded="true"
                          aria-controls="collapsecustomicon1Three"
                        >
                          Price
                          <i className="fa-solid fa-chevron-down" />
                        </button>
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
                      <h2
                        className="accordion-header"
                        id="headingcustomicon1Four"
                      >
                        <button
                          className="accordion-button"
                          type="button"
                          data-bs-toggle="collapse"
                          data-bs-target="#collapsecustomicon1Four"
                          aria-expanded="true"
                          aria-controls="collapsecustomicon1Four"
                        >
                          Range
                          <i className="fa-solid fa-chevron-down" />
                        </button>
                      </h2>
                      <div
                        id="collapsecustomicon1Four"
                        className="accordion-collapse collapse show"
                        aria-labelledby="headingcustomicon1Four"
                        data-bs-parent="#accordioncustomicon1Example"
                      >
                        <div className="accordion-body">
                          <div className="filter-range">
                            <Slider
                              range
                              tooltip={{ formatter }}
                              min={50}
                              max={5695}
                              defaultValue={[50, 2000]}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="accordion-item">
                      <h2
                        className="accordion-header"
                        id="headingcustomicon1Five"
                      >
                        <button
                          className="accordion-button"
                          type="button"
                          data-bs-toggle="collapse"
                          data-bs-target="#collapsecustomicon1Five"
                          aria-expanded="true"
                          aria-controls="collapsecustomicon1Five"
                        >
                          Level
                          <i className="fa-solid fa-chevron-down" />
                        </button>
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
                                <i className="isax isax-element-3" />
                              </Link>
                              <Link
                                to={route.courseList}
                                className="list-view active"
                              >
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
                <div className="instructor-item instructor-item-seven">
                  <div className="instructor-img">
                    <Link to={route.instructorDetails}>
                      <ImageWithBasePath
                        src="assets/img/user/user-61.jpg"
                        alt="img"
                        className="img-fluid"
                      />
                    </Link>
                    <div
                      className="position-absolute start-0 top-0 d-flex align-items-start w-100 z-index-2 p-2"
                      key={1}
                      onClick={() => handleItemClick(1)}
                    >
                      <Link
                        className={`favourite ${
                          selectedItems[1] ? "selected" : ""
                        }`}
                        to="#"
                      >
                        <i className="isax isax-heart color-active" />
                      </Link>
                    </div>
                  </div>
                  <div className="instructor-content flex-fill">
                    <div className="pb-3 border-bottom mb-3">
                      <div className="d-flex align-items-center justify-content-between flex-wrap gap-1 mb-1">
                        <div>
                          <h6 className="title">
                            <Link to={route.instructorDetails}>
                              Rolands Granger
                            </Link>
                          </h6>
                          <span className="designation">Developer</span>
                        </div>
                        <div>
                          <p className="rating">
                            <i className="fas fa-star me-1" />
                            4.9 (200 Reviews)
                          </p>
                        </div>
                      </div>
                      <p>
                        I am a web developer with a vast array of knowledge in
                        many different front end and back end languages,
                        responsive frameworks, databases, and best code
                        practices.
                      </p>
                    </div>
                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                      <div className="d-flex align-items-center flex-wrap gap-y-2 fs-14 counts-details">
                        <span className="d-flex align-items-center me-4">
                          <span className="d-flex align-items-center">
                            <i className="isax isax-book-saved5 fs-16 text-secondary me-2" />
                          </span>
                          12+ Lesson
                        </span>
                        <span className="d-flex align-items-center me-4">
                          <span className="d-flex align-items-center">
                            <i className="isax isax-timer-start5 fs-16 text-primary me-2" />
                          </span>
                          169hr 20min
                        </span>
                        <span className="d-flex align-items-center">
                          <span className="d-flex align-items-center">
                            <i className="isax isax-profile-2user5 fs-16 text-secondary me-2" />
                          </span>
                          50 Students
                        </span>
                      </div>
                      <div className="d-flex align-items-center flex-wrap gap-1">
                        <div className="badge bg-gray-100 text-dark badge-md fs-10 fw-medium rounded">
                          Web Design
                        </div>
                        <div className="badge bg-gray-100 text-dark badge-md fs-10 fw-medium rounded">
                          Development
                        </div>
                        <div className="badge bg-gray-100 text-dark badge-md fs-10 fw-medium rounded">
                          Re-Design
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="instructor-item instructor-item-seven">
                  <div className="instructor-img">
                    <Link to={route.instructorDetails}>
                      <ImageWithBasePath
                        src="assets/img/user/user-62.jpg"
                        alt="img"
                        className="img-fluid"
                      />
                    </Link>
                    <div
                      className="position-absolute start-0 top-0 d-flex align-items-start w-100 z-index-2 p-2"
                      key={2}
                      onClick={() => handleItemClick(2)}
                    >
                      <Link
                        className={`favourite ${
                          selectedItems[2] ? "selected" : ""
                        }`}
                        to="#"
                      >
                        <i className="isax isax-heart color-active" />
                      </Link>
                    </div>
                  </div>
                  <div className="instructor-content flex-fill">
                    <div className="pb-3 border-bottom mb-3">
                      <div className="d-flex align-items-center justify-content-between flex-wrap gap-1 mb-1">
                        <div>
                          <h6 className="title">
                            <Link to={route.instructorDetails}>
                              Lisa Lopezr
                            </Link>
                          </h6>
                          <span className="designation">Finance</span>
                        </div>
                        <div>
                          <p className="rating">
                            <i className="fas fa-star me-1" />
                            4.4 (130 Reviews)
                          </p>
                        </div>
                      </div>
                      <p>
                        I am a web developer with a vast array of knowledge in
                        many different front end....
                      </p>
                    </div>
                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                      <div className="d-flex align-items-center flex-wrap gap-y-2 fs-14 counts-details">
                        <span className="d-flex align-items-center me-4">
                          <span className="d-flex align-items-center">
                            <i className="isax isax-book-saved5 fs-16 text-secondary me-2" />
                          </span>
                          22+ Lesson
                        </span>
                        <span className="d-flex align-items-center me-4">
                          <span className="d-flex align-items-center">
                            <i className="isax isax-timer-start5 fs-16 text-primary me-2" />
                          </span>
                          15hr 06min
                        </span>
                        <span className="d-flex align-items-center">
                          <span className="d-flex align-items-center">
                            <i className="isax isax-profile-2user5 fs-16 text-secondary me-2" />
                          </span>
                          22 Students
                        </span>
                      </div>
                      <div className="d-flex align-items-center flex-wrap gap-1">
                        <div className="badge bg-gray-100 text-dark badge-md fs-10 fw-medium rounded">
                          Accounting
                        </div>
                        <div className="badge bg-gray-100 text-dark badge-md fs-10 fw-medium rounded">
                          Commerce
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="instructor-item instructor-item-seven">
                  <div className="instructor-img">
                    <Link to={route.instructorDetails}>
                      <ImageWithBasePath
                        src="assets/img/user/user-63.jpg"
                        alt="img"
                        className="img-fluid"
                      />
                    </Link>
                    <div
                      className="position-absolute start-0 top-0 d-flex align-items-start w-100 z-index-2 p-2"
                      key={3}
                      onClick={() => handleItemClick(3)}
                    >
                      <Link
                        className={`favourite ${
                          selectedItems[3] ? "selected" : ""
                        }`}
                        to="#"
                      >
                        <i className="isax isax-heart color-active" />
                      </Link>
                    </div>
                  </div>
                  <div className="instructor-content flex-fill">
                    <div className="pb-3 border-bottom mb-3">
                      <div className="d-flex align-items-center justify-content-between flex-wrap gap-1 mb-1">
                        <div>
                          <h6 className="title">
                            <Link to={route.instructorDetails}>
                              Charles Ruizr
                            </Link>
                          </h6>
                          <span className="designation">Cloud Engineer</span>
                        </div>
                        <div>
                          <p className="rating">
                            <i className="fas fa-star me-1" />
                            4.4 (130 Reviews)
                          </p>
                        </div>
                      </div>
                      <p>
                        I am a web developer with a vast array of knowledge in
                        many different front end
                      </p>
                    </div>
                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                      <div className="d-flex align-items-center flex-wrap gap-y-2 fs-14 counts-details">
                        <span className="d-flex align-items-center me-4">
                          <span className="d-flex align-items-center">
                            <i className="isax isax-book-saved5 fs-16 text-secondary me-2" />
                          </span>
                          16+ Lesson
                        </span>
                        <span className="d-flex align-items-center me-4">
                          <span className="d-flex align-items-center">
                            <i className="isax isax-timer-start5 fs-16 text-primary me-2" />
                          </span>
                          2hr 25min
                        </span>
                        <span className="d-flex align-items-center">
                          <span className="d-flex align-items-center">
                            <i className="isax isax-profile-2user5 fs-16 text-secondary me-2" />
                          </span>
                          10 Students
                        </span>
                      </div>
                      <div className="d-flex align-items-center flex-wrap gap-1">
                        <div className="badge bg-gray-100 text-dark badge-md fs-10 fw-medium rounded">
                          DevOps
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="instructor-item instructor-item-seven">
                  <div className="instructor-img">
                    <Link to={route.instructorDetails}>
                      <ImageWithBasePath
                        src="assets/img/user/user-44.jpg"
                        alt="img"
                        className="img-fluid"
                      />
                    </Link>
                    <div
                      className="position-absolute start-0 top-0 d-flex align-items-start w-100 z-index-2 p-2"
                      key={4}
                      onClick={() => handleItemClick(4)}
                    >
                      <Link
                        className={`favourite ${
                          selectedItems[4] ? "selected" : ""
                        }`}
                        to="#"
                      >
                        <i className="isax isax-heart color-active" />
                      </Link>
                    </div>
                  </div>
                  <div className="instructor-content flex-fill">
                    <div className="pb-3 border-bottom mb-3">
                      <div className="d-flex align-items-center justify-content-between flex-wrap gap-1 mb-1">
                        <div>
                          <h6 className="title">
                            <Link to={route.instructorDetails}>
                              Rogerina Grogan
                            </Link>
                          </h6>
                          <span className="designation">Vocational</span>
                        </div>
                        <div>
                          <p className="rating">
                            <i className="fas fa-star me-1" />
                            4.6 (180 Reviews)
                          </p>
                        </div>
                      </div>
                      <p>
                        I am a web developer with a vast array of knowledge in
                        many different front end
                      </p>
                    </div>
                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                      <div className="d-flex align-items-center flex-wrap gap-y-2 fs-14 counts-details">
                        <span className="d-flex align-items-center me-4">
                          <span className="d-flex align-items-center">
                            <i className="isax isax-book-saved5 fs-16 text-secondary me-2" />
                          </span>
                          06+ Lesson
                        </span>
                        <span className="d-flex align-items-center me-4">
                          <span className="d-flex align-items-center">
                            <i className="isax isax-timer-start5 fs-16 text-primary me-2" />
                          </span>
                          19hr 30min
                        </span>
                        <span className="d-flex align-items-center">
                          <span className="d-flex align-items-center">
                            <i className="isax isax-profile-2user5 fs-16 text-secondary me-2" />
                          </span>
                          50 Students
                        </span>
                      </div>
                      <div className="d-flex align-items-center flex-wrap gap-1">
                        <div className="badge bg-gray-100 text-dark badge-md fs-10 fw-medium rounded">
                          Language
                        </div>
                        <div className="badge bg-gray-100 text-dark badge-md fs-10 fw-medium rounded">
                          Voice
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="instructor-item instructor-item-seven">
                  <div className="instructor-img">
                    <Link to={route.instructorDetails}>
                      <ImageWithBasePath
                        src="assets/img/user/user-45.jpg"
                        alt="img"
                        className="img-fluid"
                      />
                    </Link>
                    <div
                      className="position-absolute start-0 top-0 d-flex align-items-start w-100 z-index-2 p-2"
                      key={5}
                      onClick={() => handleItemClick(5)}
                    >
                      <Link
                        className={`favourite ${
                          selectedItems[5] ? "selected" : ""
                        }`}
                        to="#"
                      >
                        <i className="isax isax-heart color-active" />
                      </Link>
                    </div>
                  </div>
                  <div className="instructor-content flex-fill">
                    <div className="pb-3 border-bottom mb-3">
                      <div className="d-flex align-items-center justify-content-between flex-wrap gap-1 mb-1">
                        <div>
                          <h6 className="title">
                            <Link to={route.instructorDetails}>Ivana Tow</Link>
                          </h6>
                          <span className="designation">Corporate Trainer</span>
                        </div>
                        <div>
                          <p className="rating">
                            <i className="fas fa-star me-1" />
                            4.2 (210 Reviews)
                          </p>
                        </div>
                      </div>
                      <p>
                        I am a web developer with a vast array of knowledge in
                        many different front
                      </p>
                    </div>
                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                      <div className="d-flex align-items-center flex-wrap gap-y-2 fs-14 counts-details">
                        <span className="d-flex align-items-center me-4">
                          <span className="d-flex align-items-center">
                            <i className="isax isax-book-saved5 fs-16 text-secondary me-2" />
                          </span>
                          25+ Lesson
                        </span>
                        <span className="d-flex align-items-center me-4">
                          <span className="d-flex align-items-center">
                            <i className="isax isax-timer-start5 fs-16 text-primary me-2" />
                          </span>
                          4hr 20min
                        </span>
                        <span className="d-flex align-items-center">
                          <span className="d-flex align-items-center">
                            <i className="isax isax-profile-2user5 fs-16 text-secondary me-2" />
                          </span>
                          50 Students
                        </span>
                      </div>
                      <div className="d-flex align-items-center flex-wrap gap-1">
                        <div className="badge bg-gray-100 text-dark badge-md fs-10 fw-medium rounded">
                          Professional
                        </div>
                        <div className="badge bg-gray-100 text-dark badge-md fs-10 fw-medium rounded">
                          Training
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="instructor-item instructor-item-seven">
                  <div className="instructor-img">
                    <Link to={route.instructorDetails}>
                      <ImageWithBasePath
                        src="assets/img/user/user-46.jpg"
                        alt="img"
                        className="img-fluid"
                      />
                    </Link>
                    <div
                      className="position-absolute start-0 top-0 d-flex align-items-start w-100 z-index-2 p-2"
                      key={6}
                      onClick={() => handleItemClick(6)}
                    >
                      <Link
                        className={`favourite ${
                          selectedItems[6] ? "selected" : ""
                        }`}
                        to="#"
                      >
                        <i className="isax isax-heart color-active" />
                      </Link>
                    </div>
                  </div>
                  <div className="instructor-content flex-fill">
                    <div className="pb-3 border-bottom mb-3">
                      <div className="d-flex align-items-center justify-content-between flex-wrap gap-1 mb-1">
                        <div>
                          <h6 className="title">
                            <Link to={route.instructorDetails}>
                              Kevin Leonard
                            </Link>
                          </h6>
                          <span className="designation">Developer</span>
                        </div>
                        <div>
                          <p className="rating">
                            <i className="fas fa-star me-1" />
                            4.5 (140 Reviews)
                          </p>
                        </div>
                      </div>
                      <p>
                        I am a web developer with a vast array of knowledge in
                        many different front
                      </p>
                    </div>
                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                      <div className="d-flex align-items-center flex-wrap gap-y-2 fs-14 counts-details">
                        <span className="d-flex align-items-center me-4">
                          <span className="d-flex align-items-center">
                            <i className="isax isax-book-saved5 fs-16 text-secondary me-2" />
                          </span>
                          11+ Lesson
                        </span>
                        <span className="d-flex align-items-center me-4">
                          <span className="d-flex align-items-center">
                            <i className="isax isax-timer-start5 fs-16 text-primary me-2" />
                          </span>
                          7hr 10min
                        </span>
                        <span className="d-flex align-items-center">
                          <span className="d-flex align-items-center">
                            <i className="isax isax-profile-2user5 fs-16 text-secondary me-2" />
                          </span>
                          21 Students
                        </span>
                      </div>
                      <div className="d-flex align-items-center flex-wrap gap-1">
                        <div className="badge bg-gray-100 text-dark badge-md fs-10 fw-medium rounded">
                          Web Design
                        </div>
                        <div className="badge bg-gray-100 text-dark badge-md fs-10 fw-medium rounded">
                          Functionality
                        </div>
                        <div className="badge bg-gray-100 text-dark badge-md fs-10 fw-medium rounded">
                          Modules
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="instructor-item instructor-item-seven">
                  <div className="instructor-img">
                    <Link to={route.instructorDetails}>
                      <ImageWithBasePath
                        src="assets/img/user/user-47.jpg"
                        alt="img"
                        className="img-fluid"
                      />
                    </Link>
                    <div
                      className="position-absolute start-0 top-0 d-flex align-items-start w-100 z-index-2 p-2"
                      key={7}
                      onClick={() => handleItemClick(7)}
                    >
                      <Link
                        className={`favourite ${
                          selectedItems[7] ? "selected" : ""
                        }`}
                        to="#"
                      >
                        <i className="isax isax-heart color-active" />
                      </Link>
                    </div>
                  </div>
                  <div className="instructor-content flex-fill">
                    <div className="pb-3 border-bottom mb-3">
                      <div className="d-flex align-items-center justify-content-between flex-wrap gap-1 mb-1">
                        <div>
                          <h6 className="title">
                            <Link to={route.instructorDetails}>
                              Jeanette Dulaneyr
                            </Link>
                          </h6>
                          <span className="designation">Technical Traine</span>
                        </div>
                        <div>
                          <p className="rating">
                            <i className="fas fa-star me-1" />
                            4.7 (220 Reviews)
                          </p>
                        </div>
                      </div>
                      <p>
                        I am a web developer with a vast array of knowledge in
                        many different front
                      </p>
                    </div>
                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                      <div className="d-flex align-items-center flex-wrap gap-y-2 fs-14 counts-details">
                        <span className="d-flex align-items-center me-4">
                          <span className="d-flex align-items-center">
                            <i className="isax isax-book-saved5 fs-16 text-secondary me-2" />
                          </span>
                          12+ Lesson
                        </span>
                        <span className="d-flex align-items-center me-4">
                          <span className="d-flex align-items-center">
                            <i className="isax isax-timer-start5 fs-16 text-primary me-2" />
                          </span>
                          9hr 30min
                        </span>
                        <span className="d-flex align-items-center">
                          <span className="d-flex align-items-center">
                            <i className="isax isax-profile-2user5 fs-16 text-secondary me-2" />
                          </span>
                          32 Students
                        </span>
                      </div>
                      <div className="d-flex align-items-center flex-wrap gap-1">
                        <div className="badge bg-gray-100 text-dark badge-md fs-10 fw-medium rounded">
                          IT
                        </div>
                        <div className="badge bg-gray-100 text-dark badge-md fs-10 fw-medium rounded">
                          Development
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* /pagination */}
                <div className="row align-items-center mt-sm-4 mt-md-5 mt-3">
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
          {/* /Course */}
        </div>
      </div>
    </>
  );
};

export default InstructorList;
