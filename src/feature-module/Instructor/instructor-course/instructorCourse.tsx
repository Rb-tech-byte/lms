import React from 'react'
import Breadcrumb from '../../../core/common/Breadcrumb/breadcrumb'
import ProfileCard from '../common/profileCard'
import InstructorSidebar from '../common/instructorSidebar'
import { Link } from 'react-router-dom'
import ImageWithBasePath from '../../../core/common/imageWithBasePath'
import { all_routes } from '../../router/all_routes'
import { courseListData } from '../../../core/common/data/json/courseListData'
import Table from "../../../core/common/dataTable/index";

const InstructorCourse = () => {
  const data = courseListData;
  const columns = [
    {
      title: "Course Name",
      dataIndex: "CourseName",
      render: (text: string,record:any) => (
        <div className="d-flex align-items-center">
          <Link
            to={all_routes.courseDetails}
            className="avatar avatar-lg me-2 flex-shrink-0"
          >
            <ImageWithBasePath
              className="img-fluid object-fit-cover"
              src={`assets/img/course/${record.Img}`}
              alt=""
            />
          </Link>
          <div>
            <h6 className="fw-medium mb-2">
              <Link to={all_routes.courseDetails}>
                {text}
              </Link>
            </h6>
            <div className="d-flex align-items-center">
              <span className="d-inline-flex fs-12 align-items-center me-2 pe-2 border-end">
                <i className="isax isax-video-circle me-1 text-gray-9 fw-bold" />
                11 Lessons
              </span>
              <span className="d-inline-flex fs-12 align-items-center me-2 pe-2 border-end">
                <i className="isax isax-message-question me-1 text-gray-9 fw-bold" />
                2 Quizzes
              </span>
              <span className="d-inline-flex fs-12 align-items-center">
                <i className="isax isax-clock me-1 text-gray-9 fw-bold" />
                03:15:00 Hours
              </span>
            </div>
          </div>
        </div>
      ),
      sorter: (a: any, b: any) => a.CourseName.length - b.CourseName.length,
    },
    
    {
      title: "Students",
      dataIndex: "Students",
      sorter: (a: any, b: any) => a.Students.length - b.Students.length,
    },
    {
      title: "Price",
      dataIndex: "Price",
      sorter: (a: any, b: any) => a.Price.length - b.Price.length,
    },
    {
      title: "Ratings",
      dataIndex: "Ratings",
      render: (text: string) => (
        <div className="d-flex align-items-center">
          <i className="fa-solid fa-star fs-12 filled text-warning me-1" />
          <span>{text}</span>
        </div>
      ),
      sorter: (a: any, b: any) => a.Ratings.length - b.Ratings.length,
    },
    {
      title: "Status",
      dataIndex: "Status",
      render: (text: string) => (
        <span 
        className={`badge badge-sm ${text === 'Pending'?'bg-skyblue':text === 'Draft'?'bg-info':'bg-success'} d-inline-flex align-items-center me-1`}>
          <i className="fa-solid fa-circle fs-5 me-1" />
          {text}
        </span>
      ),
      sorter: (a: any, b: any) => a.Status.length - b.Status.length,
    },
    {
      title: "Action",
      dataIndex: "",
      render: (text: string) => (
        <div className="d-flex align-items-center">
          <Link
            to="#"
            className="d-inline-flex fs-14 me-1 action-icon"
          >
            <i className="isax isax-edit-2" />
          </Link>
          <Link
            to="#"
            className="d-inline-flex fs-14 action-icon"
            data-bs-toggle="modal"
            data-bs-target="#delete_modal"
          >
            <i className="isax isax-trash" />
          </Link>
        </div>
      ),
    },
    
  ]
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
                <h4 className="fw-bold text-white">45</h4>
              </div>
            </div>
          </div>
          <div className="col-xxl col-lg-4 col-md-6">
            <div className="card bg-secondary">
              <div className="card-body">
                <h6 className="fw-medium mb-1 text-white">Pending Courses</h6>
                <h4 className="fw-bold text-white">21</h4>
              </div>
            </div>
          </div>
          <div className="col-xxl col-lg-4 col-md-6">
            <div className="card bg-info">
              <div className="card-body">
                <h6 className="fw-medium mb-1 text-white">Draft Courses</h6>
                <h4 className="fw-bold text-white">15</h4>
              </div>
            </div>
          </div>
          <div className="col-xxl col-lg-4 col-md-6">
            <div className="card bg-skyblue">
              <div className="card-body">
                <h6 className="fw-medium mb-1 text-white">Free Courses</h6>
                <h4 className="fw-bold text-white">16</h4>
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
            <Link to="#" className="active me-2">
              <i className="isax isax-task" />
            </Link>
            <Link to={all_routes.instructorCourseGrid}>
              <i className="isax isax-element-3" />
            </Link>
          </div>
        </div>
        <div className="row">
          <div className="col-md-8">
            <div className="mb-3">
              <div className="dropdown">
                <Link
                  to="#"
                  className="dropdown-toggle text-gray-6 btn  rounded border d-inline-flex align-items-center"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  Status
                </Link>
                <ul className="dropdown-menu dropdown-menu-end p-3">
                  <li>
                    <Link
                      to="#"
                      className="dropdown-item rounded-1"
                    >
                      Published
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="#"
                      className="dropdown-item rounded-1"
                    >
                      Pending
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="#"
                      className="dropdown-item rounded-1"
                    >
                      Draft
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            
          </div>
        </div>
        <Table dataSource={data} columns={columns} Search={true} />
      </div>
    </div>
  </div>
  
</div>
<>
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

    </>
  )
}

export default InstructorCourse
