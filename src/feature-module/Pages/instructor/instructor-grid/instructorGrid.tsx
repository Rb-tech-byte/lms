import React, { useState } from "react";
import Breadcrumb from "../../../../core/common/Breadcrumb/breadcrumb";
import { Link } from "react-router-dom";
import ImageWithBasePath from "../../../../core/common/imageWithBasePath";
import { Slider, SliderSingleProps } from "antd";
import { all_routes } from "../../../router/all_routes";

const InstructorGrid = () => {
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
      <Breadcrumb title="Instructor Grid" />
      <>
        {/* Instructor */}
        <section className="course-content">
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
                      <h2
                        className="accordion-header"
                        id="headingcustomicon1One"
                      >
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
                      <h2
                        className="accordion-header"
                        id="headingcustomicon1Three"
                      >
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
                      <h2
                        className="accordion-header"
                        id="headingcustomicon1Four"
                      >
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
                              <Link
                                to={route.instructorGrid}
                                className="grid-view active"
                              >
                                <i className="isax isax-element-3" />
                              </Link>
                              <Link
                                to={route.instructorList}
                                className="list-view"
                              >
                                <i className="isax isax-task" />
                              </Link>
                            </div>
                            <select className="form-select">
                              <option>Newly Published</option>
                              <option>Trending Courses</option>
                              <option>Top Rated</option>
                              <option>Free Courses</option>
                            </select>
                            <div className=" search-group">
                              <i className="feather-search" />
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
                <div className="row course-list-cover">
                  <div className="col-xl-4 col-md-6 d-flex">
                    <div className="instructor-item instructor-item-six flex-fill">
                      <div className="instructors-img ">
                        <Link to={route.instructorDetails} tabIndex={0}>
                          <ImageWithBasePath
                            className="img-fluid"
                            src="assets/img/user/user-61.jpg"
                            alt="img"
                          />
                        </Link>
                        <div
                          className="position-absolute start-0 top-0 d-flex align-items-start w-100 z-index-2 p-2"
                          key={1}
                          onClick={() => handleItemClick(1)}
                        >
                          <span className="verify">
                            <ImageWithBasePath
                              src="assets/img/icons/verify-icon.svg"
                              alt="img"
                              className="img-fluid"
                            />
                          </span>
                          <Link
                            to="#"
                            className={`favourite ms-auto ${
                              selectedItems[1] ? "selected" : ""
                            }`}
                            tabIndex={0}
                          >
                            <i className="isax isax-heart" />
                          </Link>
                        </div>
                      </div>
                      <div className="instructor-content">
                        <div>
                          <p className="rating mb-2">
                            <i className="fas fa-star me-1" />
                            4.9 (200 Reviews)
                          </p>
                          <h3 className="title mb-2">
                            <Link to={route.instructorDetails}>
                              Rolands Granger
                            </Link>
                          </h3>
                          <span className="designation">Developer</span>
                        </div>
                        <div className="d-flex justify-content-between align-items-center instructor-bottom">
                          <div className="d-flex align-items-center">
                            <span className="d-flex align-items-center">
                              <i className="isax isax-book-saved5 fs-16 text-secondary me-2" />
                              12+ Lesson
                            </span>
                          </div>
                          <div className="d-flex align-items-center">
                            <span className="d-flex align-items-center">
                              <i className="isax isax-timer-start5 fs-16 text-primary me-2" />
                              169hr 20min
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-4 col-md-6 d-flex">
                    <div className="instructor-item instructor-item-six flex-fill">
                      <div className="instructors-img ">
                        <Link to={route.instructorDetails} tabIndex={0}>
                          <ImageWithBasePath
                            className="img-fluid"
                            src="assets/img/user/user-62.jpg"
                            alt="img"
                          />
                        </Link>
                        <div
                          className="position-absolute start-0 top-0 d-flex align-items-start w-100 z-index-2 p-2"
                          key={2}
                          onClick={() => handleItemClick(2)}
                        >
                          <Link
                            to="#"
                            className={`favourite ms-auto ${
                              selectedItems[2] ? "selected" : ""
                            }`}
                            tabIndex={0}
                          >
                            <i className="isax isax-heart" />
                          </Link>
                        </div>
                      </div>
                      <div className="instructor-content">
                        <div>
                          <p className="rating mb-2">
                            <i className="fas fa-star me-1" />
                            4.4 (130 Reviews)
                          </p>
                          <h3 className="title mb-2">
                            <Link to={route.instructorDetails}>Lisa Lopez</Link>
                          </h3>
                          <span className="designation">Finance</span>
                        </div>
                        <div className="d-flex justify-content-between align-items-center instructor-bottom">
                          <div className="d-flex align-items-center">
                            <span className="d-flex align-items-center">
                              <i className="isax isax-book-saved5  me-2 fs-16 text-secondary" />
                              22+ Lesson
                            </span>
                          </div>
                          <div className="d-flex align-items-center">
                            <span className="d-flex align-items-center">
                              <i className="isax isax-timer-start5 me-2  fs-16 text-primary" />
                              15hr 06min
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-4 col-md-6 d-flex">
                    <div className="instructor-item instructor-item-six flex-fill">
                      <div className="instructors-img ">
                        <Link to={route.instructorDetails} tabIndex={0}>
                          <ImageWithBasePath
                            className="img-fluid"
                            src="assets/img/user/user-63.jpg"
                            alt="img"
                          />
                        </Link>
                        <div
                          className="position-absolute start-0 top-0 d-flex align-items-start w-100 z-index-2 p-2"
                          key={3}
                          onClick={() => handleItemClick(3)}
                        >
                          <Link
                            to="#"
                            className={`favourite ms-auto ${
                              selectedItems[3] ? "selected" : ""
                            }`}
                            tabIndex={0}
                          >
                            <i className="isax isax-heart" />
                          </Link>
                        </div>
                      </div>
                      <div className="instructor-content">
                        <div>
                          <p className="rating mb-2">
                            <i className="fas fa-star me-1" />
                            4.5 (120 Reviews)
                          </p>
                          <h3 className="title mb-2">
                            <Link to={route.instructorDetails}>
                              Charles Ruiz
                            </Link>
                          </h3>
                          <span className="designation">Cloud Engineer</span>
                        </div>
                        <div className="d-flex justify-content-between align-items-center instructor-bottom">
                          <div className="d-flex align-items-center">
                            <span className="d-flex align-items-center">
                              <i className="isax isax-book-saved5 fs-16 text-secondary me-2" />
                              16+ Lesson
                            </span>
                          </div>
                          <div className="d-flex align-items-center">
                            <span className="d-flex align-items-center">
                              <i className="isax isax-timer-start5 fs-16 text-primary me-2" />
                              2hr 25min
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-4 col-md-6 d-flex">
                    <div className="instructor-item instructor-item-six flex-fill">
                      <div className="instructors-img ">
                        <Link to={route.instructorDetails} tabIndex={0}>
                          <ImageWithBasePath
                            className="img-fluid"
                            src="assets/img/user/user-44.jpg"
                            alt="img"
                          />
                        </Link>
                        <div
                          className="position-absolute start-0 top-0 d-flex align-items-start w-100 z-index-2 p-2"
                          key={4}
                          onClick={() => handleItemClick(4)}
                        >
                          <Link
                            to="#"
                            className={`favourite ms-auto ${
                              selectedItems[4] ? "selected" : ""
                            }`}
                            tabIndex={0}
                          >
                            <i className="isax isax-heart" />
                          </Link>
                        </div>
                      </div>
                      <div className="instructor-content">
                        <div>
                          <p className="rating mb-2">
                            <i className="fas fa-star me-1" />
                            4.6 (180 Reviews)
                          </p>
                          <h3 className="title mb-2">
                            <Link to={route.instructorDetails}>
                              Rogerina Grogan
                            </Link>
                          </h3>
                          <span className="designation">Vocational</span>
                        </div>
                        <div className="d-flex justify-content-between align-items-center instructor-bottom">
                          <div className="d-flex align-items-center">
                            <span className="d-flex align-items-center">
                              <i className="isax isax-book-saved5 fs-16 text-secondary me-2" />
                              06+ Lesson
                            </span>
                          </div>
                          <div className="d-flex align-items-center">
                            <span className="d-flex align-items-center">
                              <i className="isax isax-timer-start5 fs-16 text-primary me-2" />
                              19hr 30min
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-4 col-md-6 d-flex">
                    <div className="instructor-item instructor-item-six flex-fill">
                      <div className="instructors-img ">
                        <Link to={route.instructorDetails} tabIndex={0}>
                          <ImageWithBasePath
                            className="img-fluid"
                            src="assets/img/user/user-45.jpg"
                            alt="img"
                          />
                        </Link>
                        <div
                          className="position-absolute start-0 top-0 d-flex align-items-start w-100 z-index-2 p-2"
                          key={4}
                          onClick={() => handleItemClick(4)}
                        >
                          <Link
                            to="#"
                            className={`favourite ms-auto ${
                              selectedItems[4] ? "selected" : ""
                            }`}
                            tabIndex={0}
                          >
                            <i className="isax isax-heart" />
                          </Link>
                        </div>
                      </div>
                      <div className="instructor-content">
                        <div>
                          <p className="rating mb-2">
                            <i className="fas fa-star me-1" />
                            4.2 (210 Reviews)
                          </p>
                          <h3 className="title mb-2">
                            <Link to={route.instructorDetails}>Ivana Tow</Link>
                          </h3>
                          <span className="designation">Corporate Trainer</span>
                        </div>
                        <div className="d-flex justify-content-between align-items-center instructor-bottom">
                          <div className="d-flex align-items-center">
                            <span className="d-flex align-items-center">
                              <i className="isax isax-book-saved5 fs-16 text-secondary me-2" />
                              25+ Lesson
                            </span>
                          </div>
                          <div className="d-flex align-items-center">
                            <span className="d-flex align-items-center">
                              <i className="isax isax-timer-start5 fs-16 text-primary me-2" />
                              4hr 20min
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-4 col-md-6 d-flex">
                    <div className="instructor-item instructor-item-six flex-fill">
                      <div className="instructors-img ">
                        <Link to={route.instructorDetails} tabIndex={0}>
                          <ImageWithBasePath
                            className="img-fluid"
                            src="assets/img/user/user-46.jpg"
                            alt="img"
                          />
                        </Link>
                        <div
                          className="position-absolute start-0 top-0 d-flex align-items-start w-100 z-index-2 p-2"
                          key={4}
                          onClick={() => handleItemClick(4)}
                        >
                          <Link
                            to="#"
                            className={`favourite ms-auto ${
                              selectedItems[4] ? "selected" : ""
                            }`}
                            tabIndex={0}
                          >
                            <i className="isax isax-heart" />
                          </Link>
                        </div>
                      </div>
                      <div className="instructor-content">
                        <div>
                          <p className="rating mb-2">
                            <i className="fas fa-star me-1" />
                            4.5 (140 Reviews)
                          </p>
                          <h3 className="title mb-2">
                            <Link to={route.instructorDetails}>
                              Kevin Leonard
                            </Link>
                          </h3>
                          <span className="designation">Developer</span>
                        </div>
                        <div className="d-flex justify-content-between align-items-center instructor-bottom">
                          <div className="d-flex align-items-center">
                            <span className="d-flex align-items-center">
                              <i className="isax isax-book-saved5 fs-16 text-secondary me-2" />
                              11+ Lesson
                            </span>
                          </div>
                          <div className="d-flex align-items-center">
                            <span className="d-flex align-items-center">
                              <i className="isax isax-timer-start5 fs-16 text-primary me-2" />
                              7hr 10min
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-4 col-md-6 d-flex">
                    <div className="instructor-item instructor-item-six flex-fill">
                      <div className="instructors-img ">
                        <Link to={route.instructorDetails} tabIndex={0}>
                          <ImageWithBasePath
                            className="img-fluid"
                            src="assets/img/user/user-47.jpg"
                            alt="img"
                          />
                        </Link>
                        <div
                          className="position-absolute start-0 top-0 d-flex align-items-start w-100 z-index-2 p-2"
                          key={5}
                          onClick={() => handleItemClick(5)}
                        >
                          <Link
                            to="#"
                            className={`favourite ms-auto ${
                              selectedItems[5] ? "selected" : ""
                            }`}
                            tabIndex={0}
                          >
                            <i className="isax isax-heart" />
                          </Link>
                        </div>
                      </div>
                      <div className="instructor-content">
                        <div>
                          <p className="rating mb-2">
                            <i className="fas fa-star me-1" />
                            4.3 (190 Reviews)
                          </p>
                          <h3 className="title mb-2">
                            <Link to={route.instructorDetails}>
                              David Roccoz
                            </Link>
                          </h3>
                          <span className="designation">Sports Coach</span>
                        </div>
                        <div className="d-flex justify-content-between align-items-center instructor-bottom">
                          <div className="d-flex align-items-center">
                            <span className="d-flex align-items-center">
                              <i className="isax isax-book-saved5 fs-16 text-secondary me-2" />
                              04+ Lesson
                            </span>
                          </div>
                          <div className="d-flex align-items-center">
                            <span className="d-flex align-items-center">
                              <i className="isax isax-timer-start5 fs-16 text-primary me-2" />
                              1hr 30min
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-4 col-md-6 d-flex">
                    <div className="instructor-item instructor-item-six flex-fill">
                      <div className="instructors-img ">
                        <Link to={route.instructorDetails} tabIndex={0}>
                          <ImageWithBasePath
                            className="img-fluid"
                            src="assets/img/user/user-48.jpg"
                            alt="img"
                          />
                        </Link>
                        <div
                          className="position-absolute start-0 top-0 d-flex align-items-start w-100 z-index-2 p-2"
                          key={5}
                          onClick={() => handleItemClick(5)}
                        >
                          <Link
                            to="#"
                            className={`favourite ms-auto ${
                              selectedItems[5] ? "selected" : ""
                            }`}
                            tabIndex={0}
                          >
                            <i className="isax isax-heart" />
                          </Link>
                        </div>
                      </div>
                      <div className="instructor-content">
                        <div>
                          <p className="rating mb-2">
                            <i className="fas fa-star me-1" />
                            4.3 (190 Reviews)
                          </p>
                          <h3 className="title mb-2">
                            <Link to={route.instructorDetails}>
                              Jeanette Dulaney
                            </Link>
                          </h3>
                          <span className="designation">Technical Traine</span>
                        </div>
                        <div className="d-flex justify-content-between align-items-center instructor-bottom">
                          <div className="d-flex align-items-center">
                            <span className="d-flex align-items-center">
                              <i className="isax isax-book-saved5 fs-16 text-secondary me-2" />
                              08+ Lesson
                            </span>
                          </div>
                          <div className="d-flex align-items-center">
                            <span className="d-flex align-items-center">
                              <i className="isax isax-timer-start5 fs-16 text-primary me-2" />
                              4hr 35min
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-4 col-md-6 d-flex">
                    <div className="instructor-item instructor-item-six flex-fill">
                      <div className="instructors-img ">
                        <Link to={route.instructorDetails} tabIndex={0}>
                          <ImageWithBasePath
                            className="img-fluid"
                            src="assets/img/user/user-49.jpg"
                            alt="img"
                          />
                        </Link>
                        <div
                          className="position-absolute start-0 top-0 d-flex align-items-start w-100 z-index-2 p-2"
                          key={5}
                          onClick={() => handleItemClick(5)}
                        >
                          <Link
                            to="#"
                            className={`favourite ms-auto ${
                              selectedItems[5] ? "selected" : ""
                            }`}
                            tabIndex={0}
                          >
                            <i className="isax isax-heart" />
                          </Link>
                        </div>
                      </div>
                      <div className="instructor-content">
                        <div>
                          <p className="rating mb-2">
                            <i className="fas fa-star me-1" />
                            4.3 (190 Reviews)
                          </p>
                          <h3 className="title mb-2">
                            <Link to={route.instructorDetails}>
                              Debran Andrew
                            </Link>
                          </h3>
                          <span className="designation">
                            Health and Wellness
                          </span>
                        </div>
                        <div className="d-flex justify-content-between align-items-center instructor-bottom">
                          <div className="d-flex align-items-center">
                            <span className="d-flex align-items-center">
                              <i className="isax isax-book-saved5 fs-16 text-secondary me-2" />
                              08+ Lesson
                            </span>
                          </div>
                          <div className="d-flex align-items-center">
                            <span className="d-flex align-items-center">
                              <i className="isax isax-timer-start5 fs-16 text-primary me-2" />
                              4hr 35min
                            </span>
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
        </section>
        {/* /Instructor */}
      </>
    </>
  );
};

export default InstructorGrid;
