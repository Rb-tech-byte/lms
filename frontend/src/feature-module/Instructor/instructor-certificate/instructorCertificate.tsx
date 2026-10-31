import React from 'react'
import Breadcrumb from '../../../core/common/Breadcrumb/breadcrumb'
import ProfileCard from '../common/profileCard'
import InstructorSidebar from '../common/instructorSidebar'
import ImageWithBasePath from '../../../core/common/imageWithBasePath'
import { Link } from 'react-router-dom'

const InstructorCertificate = () => {
  return (
    <>
      <Breadcrumb title='Certificates'/>
      <>
  <div className="content">
    <div className="container">
     <ProfileCard/>
      <div className="row">
        <InstructorSidebar/>
        <div className="col-lg-9">
          <div className="certificate">
            <div className="page-title d-flex align-items-center justify-content-between">
              <h5>Certificates</h5>
              <div>
                <Link
                  to="#"
                  className="btn btn-secondary d-flex align-items-center"
                  data-bs-toggle="modal"
                  data-bs-target="#add_certificate"
                >
                  <i className="isax isax-add-circle me-1" />
                  Add Certificate
                </Link>
              </div>
            </div>
            <div className="p-0">
              <div className="row">
                <div className="col-md-6">
                  <div className="card mb-4">
                    <div className="card-body">
                      <div className="mb-3">
                        <Link
                          to="#"
                          data-bs-toggle="modal"
                          data-bs-target="#view_certificate"
                        >
                          <ImageWithBasePath
                            className="img-fluid rounded"
                            src="./assets/img/instructor/certificate-1.jpg"
                            alt="img"
                          />
                        </Link>
                      </div>
                      <div className="d-flex align-items-center flex-wrap justify-content-between gap-2">
                        <h6>Certificate 01</h6>
                        <ul className="edit-delete-icon d-flex align-items-center">
                          <li>
                            <Link
                              to="#"
                              data-bs-toggle="modal"
                              data-bs-target="#view_certificate"
                            >
                              <i className="isax isax-eye" />
                            </Link>
                          </li>
                          <li>
                            <Link to="#">
                              <i className="isax isax-edit-2" />
                            </Link>
                          </li>
                          <li>
                            <Link
                              to="#"
                              data-bs-toggle="modal"
                              data-bs-target="#delete_modal"
                            >
                              <i className="isax isax-trash" />
                            </Link>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="card mb-4">
                    <div className="card-body">
                      <div className="mb-3">
                        <Link
                          to="#"
                          data-bs-toggle="modal"
                          data-bs-target="#view_certificate"
                        >
                          <ImageWithBasePath
                            className="img-fluid rounded"
                            src="./assets/img/instructor/certificate-2.jpg"
                            alt="img"
                          />
                        </Link>
                      </div>
                      <div className="d-flex align-items-center flex-wrap justify-content-between gap-2">
                        <h6>Certificate 02</h6>
                        <ul className="edit-delete-icon d-flex align-items-center">
                          <li>
                            <Link
                              to="#"
                              data-bs-toggle="modal"
                              data-bs-target="#view_certificate"
                            >
                              <i className="isax isax-eye" />
                            </Link>
                          </li>
                          <li>
                            <Link to="#">
                              <i className="isax isax-edit-2" />
                            </Link>
                          </li>
                          <li>
                            <Link
                              to="#"
                              data-bs-toggle="modal"
                              data-bs-target="#delete_modal"
                            >
                              <i className="isax isax-trash" />
                            </Link>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="card mb-4">
                    <div className="card-body">
                      <div className="mb-3">
                        <Link
                          to="#"
                          data-bs-toggle="modal"
                          data-bs-target="#view_certificate"
                        >
                          <ImageWithBasePath
                            className="img-fluid rounded"
                            src="./assets/img/instructor/certificate-3.jpg"
                            alt="img"
                          />
                        </Link>
                      </div>
                      <div className="d-flex align-items-center flex-wrap justify-content-between gap-2">
                        <h6>Certificate 03</h6>
                        <ul className="edit-delete-icon d-flex align-items-center">
                          <li>
                            <Link
                              to="#"
                              data-bs-toggle="modal"
                              data-bs-target="#view_certificate"
                            >
                              <i className="isax isax-eye" />
                            </Link>
                          </li>
                          <li>
                            <Link to="#">
                              <i className="isax isax-edit-2" />
                            </Link>
                          </li>
                          <li>
                            <Link
                              to="#"
                              data-bs-toggle="modal"
                              data-bs-target="#delete_modal"
                            >
                              <i className="isax isax-trash" />
                            </Link>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="card mb-4">
                    <div className="card-body">
                      <div className="mb-3">
                        <Link
                          to="#"
                          data-bs-toggle="modal"
                          data-bs-target="#view_certificate"
                        >
                          <ImageWithBasePath
                            className="img-fluid rounded"
                            src="./assets/img/instructor/certificate-4.jpg"
                            alt="img"
                          />
                        </Link>
                      </div>
                      <div className="d-flex align-items-center flex-wrap justify-content-between gap-2">
                        <h6>Certificate 04</h6>
                        <ul className="edit-delete-icon d-flex align-items-center">
                          <li>
                            <Link
                              to="#"
                              data-bs-toggle="modal"
                              data-bs-target="#view_certificate"
                            >
                              <i className="isax isax-eye" />
                            </Link>
                          </li>
                          <li>
                            <Link to="#">
                              <i className="isax isax-edit-2" />
                            </Link>
                          </li>
                          <li>
                            <Link
                              to="#"
                              data-bs-toggle="modal"
                              data-bs-target="#delete_modal"
                            >
                              <i className="isax isax-trash" />
                            </Link>
                          </li>
                        </ul>
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
  </div>
  {/* Add Question */}
  <div className="modal fade" id="add_certificate">
    <div className="modal-dialog modal-dialog-centered modal-lg">
      <div className="modal-content">
        <div className="modal-header">
          <h5>Add New Certificate</h5>
          <button
            type="button"
            className="btn-close custom-btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          >
            <i className="isax isax-close-circle5" />
          </button>
        </div>
        <form >
          <div className="modal-body pb-0">
            <div className="mb-3">
              <label className="form-label">Attachments</label>
              <div className="file-upload drag-file w-100 d-flex align-items-center justify-content-center flex-column">
                <span className="upload-img mb-2">
                  <i className="isax isax-folder5 fs-24" />
                </span>
                <p className="mb-1 fs-12">Drag and drop your files</p>
                <p className="mb-2 fs-12">
                  Accept File Type: doc,docx,jpg,jpeg,png,txt,pdf
                </p>
                <input type="file" accept="video/image" />
                <span className="btn btn-secondary rounded-pill">
                  <i className="isax isax-document-upload me-1" />
                  Upload
                </span>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button
              className="btn btn-light rounded-pill me-2"
              type="button"
              data-bs-dismiss="modal"
            >
              Cancel
            </button>
            <button className="btn btn-secondary rounded-pill" type="button" data-bs-dismiss="modal">
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
  {/* /Add Question */}
  <div className="modal fade" id="view_certificate">
    <div className="modal-dialog modal-dialog-centered modal-lg">
      <div className="modal-content">
        <div className="modal-header">
          <h5>View Certificate</h5>
          <button
            type="button"
            className="btn-close custom-btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          >
            <i className="isax isax-close-circle5" />
          </button>
        </div>
        <div className="modal-body">
          <div>
            <ImageWithBasePath
              src="assets/img/icon/certificate.svg"
              className="img-fluid"
              alt=""
            />
          </div>
          <div className="text-end mt-4">
            <Link to="#" className="btn btn-secondary rounded-pill">
              <i className="isax isax-import me-2" />
              Download
            </Link>
          </div>
        </div>
      </div>
    </div>
  </div>
  {/* Delete Modal */}
  <div className="modal fade" id="delete_modal">
    <div className="modal-dialog modal-dialog-centered">
      <div className="modal-content">
        <div className="modal-body text-center custom-modal-body">
          <span className="avatar avatar-lg bg-gray-100 rounded-circle mb-2">
            <i className="isax isax-trash fs-24 text-danger" />
          </span>
          <div>
            <h4 className="mb-2">Delete Certificate</h4>
            <p className="mb-3">Are you sure you want to delete certificate?</p>
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

export default InstructorCertificate
