import React from 'react'
import Breadcrumb from '../../../core/common/Breadcrumb/breadcrumb'
import ProfileCard from '../common/profileCard'
import InstructorSidebar from '../common/instructorSidebar'
import { all_routes } from '../../router/all_routes'
import { Link } from 'react-router-dom'
import CustomSelect from '../../../core/common/commonSelect'
import { TimePicker } from 'antd'
import dayjs from 'dayjs';
const InstructorQuiz = () => {
  const Course = [
    {  label: "Information About UI/UX Design Degree" ,value: "1"},
    {  label: "Wordpress for Beginners - Master Wordpress Quickly" ,value: "2"},
    {  label: "Introduction to Python Programming" ,value: "3"},
  ];
  const getModalContainer = () => {
    const modalElement = document.getElementById('add_quiz');
    return modalElement ? modalElement : document.body; // Fallback to document.body if modalElement is null
};
  const getModalContainer2 = () => {
    const modalElement = document.getElementById('edit_quiz');
    return modalElement ? modalElement : document.body; // Fallback to document.body if modalElement is null
};
  return (
    <>
      <Breadcrumb title='Quiz'/>
      <div className="content">
				<div className="container">
					<ProfileCard/>
					<div className="row">
						<InstructorSidebar/>
						<div className="col-lg-9">
							<div className="page-title d-flex align-items-center justify-content-between">
								<h5 className="fw-bold">Quiz</h5>
								<div>
									<Link to="#" className="btn btn-secondary" data-bs-toggle="modal" data-bs-target="#add_quiz">Add Quiz</Link>
								</div>
							</div>
							<div className="border rounded-2 p-3 mb-3">
								<div className="row align-items-center">
									<div className="col-md-8">
										<div>
											<h6 className="mb-2"><Link to={all_routes.instructorQA}>Information About UI/UX Design Degree</Link></h6>
											<div className="question-info d-flex align-items-center">
												<p className="d-flex align-items-center fs-14 me-2 pe-2 border-end mb-0"><i className="isax isax-message-question5 text-primary-soft me-2"></i>25 Questions</p>
												<p className="d-flex align-items-center fs-14 mb-0"><i className="isax isax-clock5 text-secondary-soft me-2"></i>30 Minutes</p>
											</div>
										</div>
									</div>
									<div className="col-md-4">
										<div className="d-flex align-items-center justify-content-end mt-2 mt-md-0">
											<Link to={all_routes.instructorQuizResult} className="text-info text-decoration-underline fs-12 fw-medium me-3">View Results</Link>
											<Link to="#" className="d-inline-flex fs-14 me-1 action-icon" data-bs-toggle="modal" data-bs-target="#edit_quiz"><i className="isax isax-edit-2"></i></Link>
											<Link to="#" className="d-inline-flex fs-14 action-icon" data-bs-toggle="modal" data-bs-target="#delete_modal"><i className="isax isax-trash"></i></Link>
										</div>
									</div>
								</div>
							</div>
							<div className="border rounded-2 p-3 mb-3">
								<div className="row align-items-center gy-3">
									<div className="col-md-8">
										<div>
											<h6 className="mb-2"><Link to={all_routes.instructorQA}>Learn JavaScript and Express to become a Expert</Link></h6>
											<div className="question-info d-flex align-items-center">
												<p className="d-flex align-items-center fs-14 me-2 pe-2 border-end mb-0"><i className="isax isax-message-question5 text-primary-soft me-2"></i>15 Questions</p>
												<p className="d-flex align-items-center fs-14 mb-0"><i className="isax isax-clock5 text-secondary-soft me-2"></i>25 Minutes</p>
											</div>
										</div>
									</div>
									<div className="col-md-4">
										<div className="d-flex align-items-center justify-content-end mt-2 mt-md-0">
											<Link to={all_routes.instructorQuizResult} className="text-info text-decoration-underline fs-12 fw-medium me-3">View Results</Link>
											<Link to="#" className="d-inline-flex fs-14 me-1 action-icon" data-bs-toggle="modal" data-bs-target="#edit_quiz"><i className="isax isax-edit-2"></i></Link>
											<Link to="#" className="d-inline-flex fs-14 action-icon" data-bs-toggle="modal" data-bs-target="#delete_modal"><i className="isax isax-trash"></i></Link>
										</div>
									</div>
								</div>
							</div>
							<div className="border rounded-2 p-3 mb-3">
								<div className="row align-items-center gy-3">
									<div className="col-md-8">
										<div>
											<h6 className="mb-2"><Link to={all_routes.instructorQA}>Introduction to Python Programming</Link></h6>
											<div className="question-info d-flex align-items-center">
												<p className="d-flex align-items-center fs-14 me-2 pe-2 border-end mb-0"><i className="isax isax-message-question5 text-primary-soft me-2"></i>22 Questions</p>
												<p className="d-flex align-items-center fs-14 mb-0"><i className="isax isax-clock5 text-secondary-soft me-2"></i>15 Minutes</p>
											</div>
										</div>
									</div>
									<div className="col-md-4">
										<div className="d-flex align-items-center justify-content-end mt-2 mt-md-0">
											<Link to={all_routes.instructorQuizResult} className="text-info text-decoration-underline fs-12 fw-medium me-3">View Results</Link>
											<Link to="#" className="d-inline-flex fs-14 me-1 action-icon" data-bs-toggle="modal" data-bs-target="#edit_quiz"><i className="isax isax-edit-2"></i></Link>
											<Link to="#" className="d-inline-flex fs-14 action-icon" data-bs-toggle="modal" data-bs-target="#delete_modal"><i className="isax isax-trash"></i></Link>
										</div>
									</div>
								</div>
							</div>
							<div className="border rounded-2 p-3 mb-3">
								<div className="row align-items-center gy-3">
									<div className="col-md-8">
										<div>
											<h6 className="mb-2"><Link to={all_routes.instructorQA}>Build Responsive Websites with HTML5 and CSS3</Link></h6>
											<div className="question-info d-flex align-items-center">
												<p className="d-flex align-items-center fs-14 me-2 pe-2 border-end mb-0"><i className="isax isax-message-question5 text-primary-soft me-2"></i>30 Questions</p>
												<p className="d-flex align-items-center fs-14 mb-0"><i className="isax isax-clock5 text-secondary-soft me-2"></i>50 Minutes</p>
											</div>
										</div>
									</div>
									<div className="col-md-4">
										<div className="d-flex align-items-center justify-content-end mt-2 mt-md-0">
											<Link to={all_routes.instructorQuizResult} className="text-info text-decoration-underline fs-12 fw-medium me-3">View Results</Link>
											<Link to="#" className="d-inline-flex fs-14 me-1 action-icon"><i className="isax isax-edit-2"></i></Link>
											<Link to="#" className="d-inline-flex fs-14 action-icon"><i className="isax isax-trash"></i></Link>
										</div>
									</div>
								</div>
							</div>
							<div className="border rounded-2 p-3 mb-3 mb-0">
								<div className="row align-items-center gy-3">
									<div className="col-md-8">
										<div>
											<h6 className="mb-2"><Link to={all_routes.instructorQA}>Information About Photoshop Design Degree</Link></h6>
											<div className="question-info d-flex align-items-center">
												<p className="d-flex align-items-center fs-14 me-2 pe-2 border-end mb-0"><i className="isax isax-message-question5 text-primary-soft me-2"></i>20 Questions</p>
												<p className="d-flex align-items-center fs-14 mb-0"><i className="isax isax-clock5 text-secondary-soft me-2"></i>20 Minutes</p>
											</div>
										</div>
									</div>
									<div className="col-md-4">
										<div className="d-flex align-items-center justify-content-end mt-2 mt-md-0">
											<Link to={all_routes.instructorQuizResult} className="text-info text-decoration-underline fs-12 fw-medium me-3">View Results</Link>
											<Link to="#" className="d-inline-flex fs-14 me-1 action-icon" data-bs-toggle="modal" data-bs-target="#edit_quiz"><i className="isax isax-edit-2"></i></Link>
											<Link to="#" className="d-inline-flex fs-14 action-icon" data-bs-toggle="modal" data-bs-target="#delete_modal"><i className="isax isax-trash"></i></Link>
										</div>
									</div>
								</div>
							</div>
							
						</div>
					</div>
				</div>
			</div>
      <>
  {/* Add Question */}
  <div className="modal fade" id="add_quiz">
    <div className="modal-dialog modal-dialog-centered modal-lg">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="fw-bold">Add New Quiz</h5>
          <button
            type="button"
            className="btn-close custom-btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          >
            <i className="isax isax-close-circle5" />
          </button>
        </div>
        <form action={all_routes.instructorQA}>
          <div className="modal-body pb-0">
            <div className="mb-3">
              <label className="form-label">
                Course <span className="text-danger"> *</span>
              </label>
              <CustomSelect
                      className="select"
                      options={Course}
                    />
            </div>
            <div className="mb-3">
              <label className="form-label">
                Quiz Title <span className="text-danger"> *</span>
              </label>
              <input type="text" className="form-control" />
            </div>
            <div className="row">
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">
                    No of Questions <span className="text-danger"> *</span>
                  </label>
                  <input type="text" className="form-control" />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">
                    Total Marks <span className="text-danger"> *</span>
                  </label>
                  <input type="text" className="form-control" />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">
                    Pass Mark <span className="text-danger"> *</span>
                  </label>
                  <input type="text" className="form-control" />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">
                    Duration <span className="text-danger"> *</span>
                  </label>
                  <div className="input-icon-end position-relative">
                  <TimePicker  getPopupContainer={getModalContainer} className="form-control timepicker"/>
                    <span className="input-icon-addon">
                      <i className="isax isax-clock" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button
              className="btn bg-gray-100 rounded-pill me-2"
              type="button"
              data-bs-dismiss="modal"
            >
              Cancel
            </button>
            <button className="btn btn-secondary rounded-pill" type="button"  data-bs-dismiss="modal">
              Add Quiz
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
  {/* /Add Question */}
  {/* Edit Question */}
  <div className="modal fade" id="edit_quiz">
    <div className="modal-dialog modal-dialog-centered modal-lg">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="fw-bold">Edit Quiz</h5>
          <button
            type="button"
            className="btn-close custom-btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          >
            <i className="isax isax-close-circle5" />
          </button>
        </div>
        <form action={all_routes.instructorQA}>
          <div className="modal-body pb-0">
            <div className="mb-3">
              <label className="form-label">
                Course <span className="text-danger"> *</span>
              </label>
              <CustomSelect
                      className="select"
                      options={Course}
                      modal={true}
                      defaultValue={Course[1]}
                    />
            </div>
            <div className="mb-3">
              <label className="form-label">
                Quiz Title <span className="text-danger"> *</span>
              </label>
              <input
                type="text"
                className="form-control"
                defaultValue="Information About UI/UX Design Degree"
              />
            </div>
            <div className="row">
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">
                    No of Questions <span className="text-danger"> *</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    defaultValue={10}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">
                    Total Marks <span className="text-danger"> *</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    defaultValue={100}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">
                    Pass Mark <span className="text-danger"> *</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    defaultValue={50}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">
                    Duration <span className="text-danger"> *</span>
                  </label>
                  <div className="input-icon-end position-relative">
                    
                    <TimePicker  getPopupContainer={getModalContainer2} defaultValue={dayjs('12:08:23', 'HH:mm:ss')} className="form-control timepicker"/>
                    <span className="input-icon-addon">
                      <i className="isax isax-clock" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button
              className="btn bg-gray-100 rounded-pill me-2"
              type="button"
              data-bs-dismiss="modal"
            >
              Cancel
            </button>
            <button className="btn btn-secondary rounded-pill" type="button"  data-bs-dismiss="modal">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
  {/* /Edit Question */}
  {/* Delete Modal */}
  <div className="modal fade" id="delete_modal">
    <div className="modal-dialog modal-dialog-centered">
      <div className="modal-content">
        <div className="modal-body text-center custom-modal-body">
          <span className="avatar avatar-lg bg-danger-transparent rounded-circle mb-2">
            <i className="isax isax-trash fs-24 text-danger" />
          </span>
          <div>
            <h4 className="mb-2">Delete Quiz</h4>
            <p className="mb-3">Are you sure you want to delete Quiz?</p>
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

    </>
  )
}

export default InstructorQuiz
