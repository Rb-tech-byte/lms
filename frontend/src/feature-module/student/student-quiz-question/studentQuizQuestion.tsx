import React, { useState } from "react";
import { all_routes } from "../../router/all_routes";
import Breadcrumb from "../../../core/common/Breadcrumb/breadcrumb";
import ProfileCard from "../common/profileCard";
import StudentSidebar from "../common/studentSidebar";
import { Link } from "react-router-dom";
import ImageWithBasePath from "../../../core/common/imageWithBasePath";
import CircleProgress from "../../Instructor/instructor-dashboard/circleProgress";

const StudentQuizQuestion = () => {
  const route = all_routes;

  const [currentStep, setCurrentStep] = useState(1);
  const handleNext = () => {
    setCurrentStep(currentStep + 1);
  };

  const handlePrev = () => {
    setCurrentStep(currentStep - 1);
  };





  return (
    <>
      <Breadcrumb title="Settings" />
      <div className="content">
        <div className="container">
          {/* profile box */}
          <ProfileCard />
          {/* profile box */}
          <div className="row">
            {/* sidebar */}
            <StudentSidebar />
            {/* sidebar */}
            <div className="col-lg-9 ">
              
              {currentStep === 1 && (
                <fieldset id="first-field">
                  <div className="page-title d-flex align-items-center justify-content-between">
                    <h5>My Quiz Attempts</h5>
                  </div>
                  <div className="quiz-attempt-card border-0">
                    <div className="quiz-attempt-body p-0">
                      <div className="border p-3 mb-3 rounded-2">
                        <div className="bg-light border p-3 mb-3 rounded-2 flex-wrap">
                          <div className="row align-items-center">
                            <div className="col-md-8">
                              <div className="mb-2 mb-md-0">
                                <div className="d-flex align-items-center">
                                  <div className="avatar avatar-lg me-3 flex-shrink-0">
                                    <ImageWithBasePath
                                      className="img-fluid rounded-3"
                                      src="assets/img/students/quiz.jpg"
                                      alt=""
                                    />
                                  </div>
                                  <h5 className="fs-18">
                                    Information About UI/UX Design Degree
                                  </h5>
                                </div>
                              </div>
                            </div>
                            <div className="col-md-4">
                              <div className="text-md-end">
                                <p className="d-inline-flex align-items-center mb-0">
                                  <i className="isax isax-clock me-1" />
                                  00:02:21
                                  <span className="text-dark ms-1">
                                    {" "}
                                    / 00:03:00
                                  </span>
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="mb-3">
                          <div className="d-flex align-items-center justify-content-between mb-1">
                            <span className="fw-semibold text-gray-9">
                              Quiz Progress
                            </span>
                            <span>Question 1 out of 5</span>
                          </div>
                          <div className="progress progress-xs  flex-grow-1 mb-1">
                            <div
                              className="progress-bar bg-success rounded"
                              role="progressbar"
                              style={{ width: "20%" }}
                              aria-valuenow={20}
                              aria-valuemin={0}
                              aria-valuemax={100}
                            />
                          </div>
                        </div>
                        <div className="mb-0">
                          <h6 className="mb-3">What does UI stand for?</h6>
                          <div className="form-check mb-2">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="qusetion-1"
                              id="Radio-sm-1"
                            />
                            <label
                              className="form-check-label"
                              htmlFor="Radio-sm-1"
                            >
                              User Intention
                            </label>
                          </div>
                          <div className="form-check mb-2">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="qusetion-1"
                              id="Radio-sm-2"
                            />
                            <label
                              className="form-check-label"
                              htmlFor="Radio-sm-2"
                            >
                              User Interface
                            </label>
                          </div>
                          <div className="form-check mb-2">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="qusetion-1"
                              id="Radio-sm-3"
                            />
                            <label
                              className="form-check-label"
                              htmlFor="Radio-sm-3"
                            >
                              Universal Interaction
                            </label>
                          </div>
                          <div className="form-check mb-0">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="qusetion-1"
                              id="Radio-sm-4"
                            />
                            <label
                              className="form-check-label"
                              htmlFor="Radio-sm-4"
                            >
                              Usability Information
                            </label>
                          </div>
                        </div>
                      </div>
                      <div className="text-end">
                        <button
                          type="button"
                          className="btn btn-secondary rounded-pill next_btn"
                          onClick={handleNext}
                        >
                          Next
                          <i className="isax isax-arrow-right-3 ms-1 fs-10" />
                        </button>
                      </div>
                    </div>
                  </div>
                </fieldset>
              )}
              {currentStep === 2 && (
                <fieldset style={{display:'block'}}>
                  <div className="page-title d-flex align-items-center justify-content-between">
                    <h5>My Quiz Attempts</h5>
                  </div>
                  <div className="quiz-attempt-card border-0">
                    <div className="quiz-attempt-body p-0">
                      <div className="border p-3 mb-3 rounded-2">
                        <div className="bg-light border p-3 mb-3 rounded-2 flex-wrap">
                          <div className="row align-items-center">
                            <div className="col-md-8">
                              <div className="mb-2 mb-md-0">
                                <div className="d-flex align-items-center">
                                  <div className="avatar avatar-lg me-3 flex-shrink-0">
                                    <ImageWithBasePath
                                      className="img-fluid rounded-3"
                                      src="assets/img/students/quiz.jpg"
                                      alt=""
                                    />
                                  </div>
                                  <h5 className="fs-18">
                                    Information About UI/UX Design Degree
                                  </h5>
                                </div>
                              </div>
                            </div>
                            <div className="col-md-4">
                              <div className="text-md-end">
                                <p className="d-inline-flex align-items-center mb-0">
                                  <i className="isax isax-clock me-1" />
                                  00:02:21
                                  <span className="text-dark ms-1">
                                    {" "}
                                    / 00:03:00
                                  </span>
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="mb-3">
                          <div className="d-flex align-items-center justify-content-between mb-1">
                            <span className="fw-semibold text-gray-9">
                              Quiz Progress
                            </span>
                            <span>Question 2 out of 5</span>
                          </div>
                          <div className="progress progress-xs  flex-grow-1 mb-1">
                            <div
                              className="progress-bar bg-success rounded"
                              role="progressbar"
                              style={{ width: "40%" }}
                              aria-valuenow={40}
                              aria-valuemin={0}
                              aria-valuemax={100}
                            />
                          </div>
                        </div>
                        <div className="mb-0">
                          <h6 className="mb-3">
                            Which of the following is a principle of UX design?
                          </h6>
                          <div className="form-check mb-2">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="qusetion-2"
                              id="Radio-sm-5"
                            />
                            <label
                              className="form-check-label"
                              htmlFor="Radio-sm-5"
                            >
                              Minimalistic Design
                            </label>
                          </div>
                          <div className="form-check mb-2">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="qusetion-2"
                              id="Radio-sm-6"
                            />
                            <label
                              className="form-check-label"
                              htmlFor="Radio-sm-6"
                            >
                              User-Centered Design
                            </label>
                          </div>
                          <div className="form-check mb-2">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="qusetion-2"
                              id="Radio-sm-7"
                            />
                            <label
                              className="form-check-label"
                              htmlFor="Radio-sm-7"
                            >
                              Gradient Usage
                            </label>
                          </div>
                          <div className="form-check mb-0">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="qusetion-2"
                              id="Radio-sm-8"
                            />
                            <label
                              className="form-check-label"
                              htmlFor="Radio-sm-8"
                            >
                              Typography Hierarchy
                            </label>
                          </div>
                        </div>
                      </div>
                      <div className="d-flex align-items-center justify-content-between">
                        <Link
                          to="#"
                          className="btn bg-gray-100 d-inline-flex rounded-pill align-items-center prev_btn me-1"
                          onClick={handlePrev}
                        >
                          <i className="isax isax-arrow-left-2 me-1 fs-10" />
                          Previous
                        </Link>
                        <button
                          type="button"
                          className="btn btn-secondary rounded-pill next_btn"
                          onClick={handleNext}
                        >
                          Next
                          <i className="isax isax-arrow-right-3 ms-1 fs-10" />
                        </button>
                      </div>
                    </div>
                  </div>
                </fieldset>
              )}
              {currentStep === 3 && (
                <fieldset style={{ display: 'block' }}>
                  <div className="page-title d-flex align-items-center justify-content-between" >
                    <h5>My Quiz Attempts</h5>
                  </div>
                  <div className="quiz-attempt-card border-0">
                    <div className="quiz-attempt-body p-0">
                      <div className="border p-3 mb-3 rounded-2">
                        <div className="bg-light border p-3 mb-3 rounded-2 flex-wrap">
                          <div className="row align-items-center">
                            <div className="col-md-8">
                              <div className="mb-2 mb-md-0">
                                <div className="d-flex align-items-center">
                                  <div className="avatar avatar-lg me-3 flex-shrink-0">
                                    <ImageWithBasePath
                                      className="img-fluid rounded-3"
                                      src="assets/img/students/quiz.jpg"
                                      alt=""
                                    />
                                  </div>
                                  <h5 className="fs-18">
                                    Information About UI/UX Design Degree
                                  </h5>
                                </div>
                              </div>
                            </div>
                            <div className="col-md-4">
                              <div className="text-md-end">
                                <p className="d-inline-flex align-items-center mb-0">
                                  <i className="isax isax-clock me-1" />
                                  00:02:21
                                  <span className="text-dark ms-1">
                                    {" "}
                                    / 00:03:00
                                  </span>
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="mb-3">
                          <div className="d-flex align-items-center justify-content-between mb-1">
                            <span className="fw-semibold text-gray-9">
                              Quiz Progress
                            </span>
                            <span>Question 3 out of 5</span>
                          </div>
                          <div className="progress progress-xs  flex-grow-1 mb-1">
                            <div
                              className="progress-bar bg-success rounded"
                              role="progressbar"
                              style={{ width: "60%" }}
                              aria-valuenow={60}
                              aria-valuemin={0}
                              aria-valuemax={100}
                            />
                          </div>
                        </div>
                        <div className="mb-0">
                          <h6 className="mb-3">
                            Which tool is commonly used for wireframing?
                          </h6>
                          <div className="form-check mb-2">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="qusetion-3"
                              id="Radio-sm-9"
                            />
                            <label
                              className="form-check-label"
                              htmlFor="Radio-sm-9"
                            >
                              Adobe Photoshop
                            </label>
                          </div>
                          <div className="form-check mb-2">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="qusetion-3"
                              id="Radio-sm-10"
                            />
                            <label
                              className="form-check-label"
                              htmlFor="Radio-sm-10"
                            >
                              Figma
                            </label>
                          </div>
                          <div className="form-check mb-2">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="qusetion-3"
                              id="Radio-sm-11"
                            />
                            <label
                              className="form-check-label"
                              htmlFor="Radio-sm-11"
                            >
                              Visual Studio Code
                            </label>
                          </div>
                          <div className="form-check mb-0">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="qusetion-3"
                              id="Radio-sm-12"
                            />
                            <label
                              className="form-check-label"
                              htmlFor="Radio-sm-12"
                            >
                              GitHub
                            </label>
                          </div>
                        </div>
                      </div>
                      <div className="d-flex align-items-center justify-content-between">
                       <Link
                          to="#"
                          className="btn bg-gray-100 d-inline-flex rounded-pill align-items-center prev_btn me-1"
                          onClick={handlePrev}
                        >
                          <i className="isax isax-arrow-left-2 me-1 fs-10" />
                          Previous
                        </Link>
                        <button
                          type="button"
                          className="btn btn-secondary rounded-pill next_btn"
                          onClick={handleNext}
                        >
                          Next
                          <i className="isax isax-arrow-right-3 ms-1 fs-10" />
                        </button>
                      </div>
                    </div>
                  </div>
                </fieldset>
              )}

              {currentStep === 4 && (
                <fieldset style={{ display: 'block' }}>
                  <div className="page-title d-flex align-items-center justify-content-between" >
                    <h5>My Quiz Attempts</h5>
                  </div>
                  <div className="quiz-attempt-card border-0">
                    <div className="quiz-attempt-body p-0">
                      <div className="border p-3 mb-3 rounded-2">
                        <div className="bg-light border p-3 mb-3 rounded-2 flex-wrap">
                          <div className="row align-items-center">
                            <div className="col-md-8">
                              <div className="mb-2 mb-md-0">
                                <div className="d-flex align-items-center">
                                  <div className="avatar avatar-lg me-3 flex-shrink-0">
                                    <ImageWithBasePath
                                      className="img-fluid rounded-3"
                                      src="assets/img/students/quiz.jpg"
                                      alt=""
                                    />
                                  </div>
                                  <h5 className="fs-18">
                                    Information About UI/UX Design Degree
                                  </h5>
                                </div>
                              </div>
                            </div>
                            <div className="col-md-4">
                              <div className="text-md-end">
                                <p className="d-inline-flex align-items-center mb-0">
                                  <i className="isax isax-clock me-1" />
                                  00:02:21
                                  <span className="text-dark ms-1">
                                    {" "}
                                    / 00:03:00
                                  </span>
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="mb-3">
                          <div className="d-flex align-items-center justify-content-between mb-1">
                            <span className="fw-bold text-gray-9">
                              Quiz Progress
                            </span>
                            <span>Question 4 out of 5</span>
                          </div>
                          <div className="progress progress-xs  flex-grow-1 mb-1">
                            <div
                              className="progress-bar bg-success rounded"
                              role="progressbar"
                              style={{ width: "80%" }}
                              aria-valuenow={80}
                              aria-valuemin={0}
                              aria-valuemax={100}
                            />
                          </div>
                        </div>
                        <div className="mb-0">
                          <h6 className="mb-3">What is a wireframe?</h6>
                          <div className="form-check mb-2">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="qusetion-4"
                              id="Radio-sm-13"
                            />
                            <label
                              className="form-check-label"
                              htmlFor="Radio-sm-13"
                            >
                              A detailed, interactive prototype
                            </label>
                          </div>
                          <div className="form-check mb-2">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="qusetion-4"
                              id="Radio-sm-14"
                            />
                            <label
                              className="form-check-label"
                              htmlFor="Radio-sm-14"
                            >
                              A low-fidelity representation of a design
                            </label>
                          </div>
                          <div className="form-check mb-2">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="qusetion-4"
                              id="Radio-sm-15"
                            />
                            <label
                              className="form-check-label"
                              htmlFor="Radio-sm-15"
                            >
                              The codebase of a website
                            </label>
                          </div>
                          <div className="form-check mb-0">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="qusetion-4"
                              id="Radio-sm-16"
                            />
                            <label
                              className="form-check-label"
                              htmlFor="Radio-sm-16"
                            >
                              A high-fidelity design concept
                            </label>
                          </div>
                        </div>
                      </div>
                      <div className="d-flex align-items-center justify-content-between">
                       <Link
                          to="#"
                          className="btn btn-light d-inline-flex rounded-pill align-items-center prev_btn me-1"
                          onClick={handlePrev}
                        >
                          <i className="isax isax-arrow-left-2 me-1 fs-10" />
                          Back
                        </Link>
                        <button
                          type="button"
                          className="btn btn-secondary rounded-pill next_btn"
                          onClick={handleNext}
                        >
                          Next
                          <i className="isax isax-arrow-right-3 ms-1 fs-10" />
                        </button>
                      </div>
                    </div>
                  </div>
                </fieldset>
              )}
              {currentStep === 5 && (
                <fieldset style={{ display: 'block' }}>
                  <div className="page-title d-flex align-items-center justify-content-between" >
                    <h5>My Quiz Attempts</h5>
                  </div>
                  <div className="quiz-attempt-card border-0">
                    <div className="quiz-attempt-body p-0">
                      <div className="border p-3 mb-3 rounded-2">
                        <div className="bg-light border p-3 mb-3 rounded-2 flex-wrap">
                          <div className="row align-items-center">
                            <div className="col-md-8">
                              <div className="mb-2 mb-md-0">
                                <div className="d-flex align-items-center">
                                  <div className="avatar avatar-lg me-3 flex-shrink-0">
                                    <ImageWithBasePath
                                      className="img-fluid rounded-3"
                                      src="assets/img/students/quiz.jpg"
                                      alt=""
                                    />
                                  </div>
                                  <h5 className="fs-18">
                                    Information About UI/UX Design Degree
                                  </h5>
                                </div>
                              </div>
                            </div>
                            <div className="col-md-4">
                              <div className="text-md-end">
                                <p className="d-inline-flex align-items-center mb-0">
                                  <i className="isax isax-clock me-1" />
                                  00:02:21
                                  <span className="text-dark ms-1">
                                    {" "}
                                    / 00:03:00
                                  </span>
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="mb-3">
                          <div className="d-flex align-items-center justify-content-between mb-1">
                            <span className="fw-bold text-gray-9">
                              Quiz Progress
                            </span>
                            <span>Question 5 out of 5</span>
                          </div>
                          <div className="progress progress-xs  flex-grow-1 mb-1">
                            <div
                              className="progress-bar bg-success rounded"
                              role="progressbar"
                              style={{ width: "100%" }}
                              aria-valuenow={100}
                              aria-valuemin={0}
                              aria-valuemax={100}
                            />
                          </div>
                        </div>
                        <div className="mb-0">
                          <h6 className="mb-3">
                            What is the primary goal of UX design?
                          </h6>
                          <div className="form-check mb-2">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="qusetion-4"
                              id="Radio-sm-17"
                            />
                            <label
                              className="form-check-label"
                              htmlFor="Radio-sm-17"
                            >
                              To create a visually appealing design
                            </label>
                          </div>
                          <div className="form-check mb-2">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="qusetion-4"
                              id="Radio-sm-18"
                            />
                            <label
                              className="form-check-label"
                              htmlFor="Radio-sm-18"
                            >
                              To enhance user satisfaction and usability
                            </label>
                          </div>
                          <div className="form-check mb-2">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="qusetion-4"
                              id="Radio-sm-19"
                            />
                            <label
                              className="form-check-label"
                              htmlFor="Radio-sm-19"
                            >
                              To develop complex navigation flows
                            </label>
                          </div>
                          <div className="form-check mb-0">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="qusetion-4"
                              id="Radio-sm-20"
                            />
                            <label
                              className="form-check-label"
                              htmlFor="Radio-sm-20"
                            >
                              To optimize code performance
                            </label>
                          </div>
                        </div>
                      </div>
                      <div className="d-flex align-items-center justify-content-between">
                       <Link
                          to="#"
                          className="btn bg-gray-100 d-inline-flex rounded-pill align-items-center prev_btn me-1"
                          onClick={handlePrev}
                        >
                          <i className="isax isax-arrow-left-2 me-1 fs-10" />
                          Back
                        </Link>
                        <button
                          type="button"
                          className="btn btn-secondary rounded-pill next_btn"
                          onClick={handleNext}
                        >
                          Finish
                        </button>
                      </div>
                    </div>
                  </div>
                </fieldset>
              )}
              {currentStep === 6 && (
                <fieldset  style={{ display: 'block' }}>
                  <div className="page-title d-flex align-items-center justify-content-between">
                    <h5>My Quiz Attempts</h5>
                  </div>
                  <div className="card">
                    <div className="card-body">
                      <div className="quiz-circle-progress m-0 mb-3">
                      <CircleProgress value={80}/>
                        <p className="text-center fs-14">Pass Score : 80%</p>
                      </div>
                      <div className="text-center mb-3">
                        <h6 className="mb-1">Congratulations! You Passed</h6>
                        <p className="fs-14">
                          You’ve successfully passed the quiz. Keep up the great
                          work!
                        </p>
                      </div>
                      <div className="d-flex align-items-center justify-content-center">
                       <Link
                          to={route.studentDashboard}
                          className="btn btn-secondary rounded-pill"
                        >
                          <i className="isax isax-arrow-left-2 me-1 fs-10" />
                          Back to Dashboard
                        </Link>
                      </div>
                    </div>
                  </div>
                </fieldset>
              )}
              {currentStep === 7 && (
                <fieldset style={{ display: 'block' }}>
                  <div className="page-title d-flex align-items-center justify-content-between">
                    <h5>My Quiz Attempts</h5>
                  </div>
                  <div className="quiz-attempt-card">
                    <div className="quiz-attempt-body">
                      <div className="quiz-circle-progress m-0 mb-3">
                        <div className="circle-progress mb-2" data-value={20}>
                          <span className="progress-left">
                            <span className="progress-bar border-danger" />
                          </span>
                          <span className="progress-right">
                            <span className="progress-bar border-danger" />
                          </span>
                          <div className="progress-value text-danger fw-bold fs-24">
                            20%
                          </div>
                        </div>
                        <p className="text-center fs-14">Pass Score : 20%</p>
                      </div>
                      <div className="text-center mb-3">
                        <h6 className="mb-1">
                          Sorry, You Didn't Pass This Time
                        </h6>
                        <p className="fs-14">
                          Don't worry, learn from this attempt and come back
                          stronger next time!
                        </p>
                      </div>
                      <div className="d-flex align-items-center justify-content-center">
                       <Link
                          to={route.studentDashboard}
                          className="btn btn-secondary rounded-pill"
                        >
                          <i className="isax isax-arrow-left-2 me-1 fs-10" />
                          Back to Dashboard
                        </Link>
                      </div>
                    </div>
                  </div>
                </fieldset>
              )}
            </div>
          </div>
        </div>
      </div>
      <>
        {/* Edit Review */}
        <div className="modal fade" id="edit_review">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h4 className="modal-title">Edit Review</h4>
                <button
                  type="button"
                  className="btn-close custom-btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                >
                  <i className="isax isax-close-circle" />
                </button>
              </div>
              <div className="modal-body pb-0">
                <div className="mb-3">
                  <label className="form-label fs-14">
                    Your Rating <span className="text-danger">*</span>
                  </label>
                  <div className="selection-wrap">
                    <div className="d-inline-block">
                      <div className="rating-selction">
                        <input
                          type="radio"
                          name="rating"
                          defaultValue={5}
                          id="rating5"
                          defaultChecked
                        />
                        <label htmlFor="rating5">
                          <i className="fa-solid fa-star" />
                        </label>
                        <input
                          type="radio"
                          name="rating"
                          defaultValue={4}
                          id="rating4"
                          defaultChecked
                        />
                        <label htmlFor="rating4">
                          <i className="fa-solid fa-star" />
                        </label>
                        <input
                          type="radio"
                          name="rating"
                          defaultValue={3}
                          id="rating3"
                          defaultChecked
                        />
                        <label htmlFor="rating3">
                          <i className="fa-solid fa-star" />
                        </label>
                        <input
                          type="radio"
                          name="rating"
                          defaultValue={2}
                          id="rating2"
                        />
                        <label htmlFor="rating2">
                          <i className="fa-solid fa-star" />
                        </label>
                        <input
                          type="radio"
                          name="rating"
                          defaultValue={1}
                          id="rating1"
                        />
                        <label htmlFor="rating1">
                          <i className="fa-solid fa-star" />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label fs-14">
                    Write Your Review <span className="text-danger">*</span>
                  </label>
                  <textarea
                    className="form-control"
                    rows={3}
                    defaultValue={
                      "This is the second Photoshop course I have completed with Nancy Duarte. Worth every penny and recommend it highly. To get the most out of this course, its best to to take the Beginner to Advanced course first. The sound and video quality is of a good standard. Thank you Nancy Duarte."
                    }
                  />
                </div>
              </div>
              <div className="modal-footer">
               <Link
                  to="#"
                  className="btn btn-md btn-light rounded-pill me-2"
                  data-bs-dismiss="modal"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  className="btn btn-md btn-secondary rounded-pill"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* /Edit Review */}
        {/* Delete Modal */}
        <div className="modal fade" id="delete_modal">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-body text-center custom-modal-body">
                <span className="avatar avatar-lg bg-light rounded-circle mb-2">
                  <i className="isax isax-trash fs-24 text-danger" />
                </span>
                <div>
                  <h4 className="mb-2">Delete Review</h4>
                  <p className="mb-3">
                    Are you sure you want to delete review?
                  </p>
                  <div className="d-flex align-items-center justify-content-center">
                   <Link
                      to="#"
                      className="btn btn-light rounded-pill me-2"
                      data-bs-dismiss="modal"
                    >
                      Cancel
                    </Link>
                   <Link to="#" className="btn btn-secondary rounded-pill">
                      Yes, Remove All
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* /Delete Modal */}
      </>
    </>
  );
};

export default StudentQuizQuestion;
