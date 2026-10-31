import React from 'react'
import Breadcrumb from '../../../core/common/Breadcrumb/breadcrumb'
import ProfileCard from '../common/profileCard'
import InstructorSidebar from '../common/instructorSidebar'
import ImageWithBasePath from '../../../core/common/imageWithBasePath'
import { Link } from 'react-router-dom'
import { all_routes } from '../../router/all_routes'
import { studentListData } from '../../../core/common/data/json/studentListData'
import Table from "../../../core/common/dataTable/index";

const StudentList = () => {
   const data = studentListData;
     const columns = [
       {
         title: "Student ID",
         dataIndex: "StudentID",
         render: (text: string) => (
          <Link to={all_routes.studentsDetails} className="text-primary">
          {text}
        </Link>
         ),
         sorter: (a: any, b: any) => a.StudentID.length - b.StudentID.length,
       },
       {
         title: "Student Name",
         dataIndex: "StudentName",
         render: (text: string,record:any) => (
          <div className="d-flex align-items-center">
          <Link
            to={all_routes.studentsDetails}
            className="avatar avatar-md avatar-rounded flex-shrink-0 me-2"
          >
            <ImageWithBasePath src={`assets/img/user/${record.Img}`} alt="" />
          </Link>
          <Link to={all_routes.studentsDetails}>
            <p className="fs-14">{text}</p>
          </Link>
        </div>
         ),
         sorter: (a: any, b: any) => a.StudentName.length - b.StudentName.length,
       },
       
       {
         title: "Enroll Date",
         dataIndex: "EnrollDate",
         sorter: (a: any, b: any) => a.EnrollDate.length - b.EnrollDate.length,
       },
       {
        title: "Progress",
        dataIndex: "Progress",
        render: (text: string) => (
          <div className="d-flex align-items-center">
            <div
              className="progress progress-xs flex-shrink-0"
              role="progressbar"
              style={{ height: 4, width: 110 }}
            >
              <div
                className="progress-bar bg-success"
                style={{ width: text }}
              />
            </div>
            <span className="ms-2">{text}</span>
          </div>
        ),
        sorter: (a: any, b: any) => a.Progress.length - b.Progress.length,
      },
       {
         title: "Courses",
         dataIndex: "Courses",
         sorter: (a: any, b: any) => a.Courses.length - b.Courses.length,
       },
       
       {
         title: "Action",
         dataIndex: "",
         render: () => (
          <div className="d-flex align-items-center">
          <Link
            to={all_routes.studentsDetails}
            className="d-inline-flex fs-14 me-1 action-icon"
          >
            <i className="isax isax-eye" />
          </Link>
          <Link to="#" className="d-inline-flex fs-14 action-icon">
            <i className="isax isax-messages-3" />
          </Link>
        </div>
         ),
       },
       
     ]
  return (
    <>
    <Breadcrumb title='Students List'/>
    <div className="content">
      <div className="container">
        <ProfileCard/>
        <div className="row">
          {/* Sidebar */}
          <InstructorSidebar/>
          {/* /Sidebar */}
          <div className="col-lg-9">
            <div className="page-title d-flex align-items-center justify-content-between">
              <h5 className="fw-bold">Students</h5>
              <div className="d-flex align-items-center list-icons">
                <Link to={all_routes.studentsList} className="active me-2">
                  <i className="isax isax-task" />
                </Link>
                <Link to={all_routes.studentsGrid}>
                  <i className="isax isax-element-3" />
                </Link>
              </div>
            </div>
            <div className="row justify-content-end">
              <div className="col-md-4">
                <div className="input-icon mb-3 invisible">
                  <span className="input-icon-addon">
                    <i className="isax isax-search-normal-14" />
                  </span>
                  <input
                    type="email"
                    className="form-control form-control-md"
                    placeholder="Search"
                  />
                </div>
              </div>
            </div>
            <Table dataSource={data} columns={columns} Search={true} />
          </div>
        </div>
      </div>
    </div>

    </>
  )
}

export default StudentList
