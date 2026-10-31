import React from 'react'
import Breadcrumb from '../../../core/common/Breadcrumb/breadcrumb'
import ProfileCard from '../common/profileCard'
import InstructorSidebar from '../common/instructorSidebar'
import ImageWithBasePath from '../../../core/common/imageWithBasePath'
import { Link } from 'react-router-dom'
import { all_routes } from '../../router/all_routes'
import { studentResultData } from '../../../core/common/data/json/studentresult'
import Table from "../../../core/common/dataTable/index";

const InstructorQuizResult = () => {
  const data = studentResultData;
  const columns = [
    
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
      title: "Score",
      dataIndex: "Score",
      sorter: (a: any, b: any) => a.Score.length - b.Score.length,
    },
    {
      title: "Attempts",
      dataIndex: "Attempts",
      sorter: (a: any, b: any) => a.Attempts.length - b.Attempts.length,
    },
    {
      title: "Finish Time",
      dataIndex: "FinishTime",
      sorter: (a: any, b: any) => a.FinishTime.length - b.FinishTime.length,
    },
  
    
  ]
  return (
    <>
      <Breadcrumb title='Quiz Results'/>
      <div className="content">
        <div className="container">
          <ProfileCard/>
          <div className="row">
            {/* Sidebar */}
            <InstructorSidebar/>
            {/* /Sidebar */}
            <div className="col-lg-9">
              <h5 className="page-title">Quiz Results</h5>
              <div className="card">
                <div className="card-body">
                  <div className="d-sm-flex align-items-center">
                    <div className="quiz-img me-3 mb-2 mb-sm-0">
                      <ImageWithBasePath src="assets/img/students/quiz.jpg" alt="" />
                    </div>
                    <div>
                      <h5 className="mb-2">
                        <Link to="#">Information About UI/UX Design Degree</Link>
                      </h5>
                      <div className="question-info d-flex align-items-center">
                        <p className="d-flex align-items-center fs-14 me-2 pe-2 border-end mb-0">
                          <i className="isax isax-message-question5 text-primary-soft me-2" />
                          25 Questions
                        </p>
                        <p className="d-flex align-items-center fs-14 mb-0">
                          <i className="isax isax-clock5 text-secondary-soft me-2" />
                          30 Minutes
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-lg-4 col-md-6">
                  <div className="card bg-secondary-transparent border-0">
                    <div className="card-body">
                      <div className="d-flex align-items-center justify-content-between">
                        <div>
                          <h6 className="mb-1 fw-normal text-gray-5">
                            Total Particpants
                          </h6>
                          <span className="fs-20 fw-bold mb-1 d-block text-gray-9">
                            30
                          </span>
                        </div>
                        <div className="icon-box bg-soft-secondary">
                          <ImageWithBasePath src="assets/img/icon/user-tick.svg" alt="" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-lg-4 col-md-6">
                  <div className="card bg-info-transparent border-0">
                    <div className="card-body">
                      <div className="d-flex align-items-center justify-content-between">
                        <div>
                          <h6 className="mb-1 fw-normal text-gray-5">Scores</h6>
                          <span className="fs-20 fw-bold mb-1 d-block text-gray-9">
                            03
                          </span>
                        </div>
                        <div className="icon-box  bg-soft-info">
                          <ImageWithBasePath src="assets/img/icon/document.svg" alt="" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-lg-4 col-md-6">
                  <div className="card bg-purple-transparent border-0">
                    <div className="card-body">
                      <div className="d-flex align-items-center justify-content-between">
                        <div>
                          <h6 className="mb-1 fw-normal text-gray-5">Average Time</h6>
                          <span className="fs-20 fw-bold mb-1 d-block text-gray-9">
                            00:00:55
                          </span>
                        </div>
                        <div className="icon-box  bg-soft-purple">
                          <ImageWithBasePath src="assets/img/icon/clock.svg" alt="" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <Table dataSource={data} columns={columns} Search={false} />
              
            </div>
          </div>
        </div>
      </div>

    </>
  )
}

export default InstructorQuizResult
