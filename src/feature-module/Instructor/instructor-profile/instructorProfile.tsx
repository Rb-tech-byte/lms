import React from 'react'
import Breadcrumb from '../../../core/common/Breadcrumb/breadcrumb'
import ProfileCard from '../common/profileCard'
import InstructorSidebar from '../common/instructorSidebar'
import { Link } from 'react-router-dom'

const InstructorProfile = () => {
  return (
    <>
    <Breadcrumb title='My Profile'/>
    <div className="content">
      <div className="container">
        <ProfileCard/>
        <div className="row">
        {/* Sidebar */}
        <InstructorSidebar/>
        {/* /Sidebar */}
        <div className="col-lg-9">
          <div className="page-title d-flex align-items-center justify-content-between">
            <h5 className="fw-bold">My Profile</h5>
            <Link to="#" className="edit-profile-icon">
              <i className="isax isax-edit-2" />
            </Link>
          </div>
          <div className="card">
            <div className="card-body">
              <h5 className="fs-18 pb-3 border-bottom mb-3">Basic Information</h5>
              <div className="row">
                <div className="col-md-4">
                  <div className="mb-3">
                    <h6>First Name</h6>
                    <span>Eugene</span>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="mb-3">
                    <h6>Last Name</h6>
                    <span>Andre</span>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="mb-3">
                    <h6>Registration Date</h6>
                    <span>16 Jan 2024, 11:15 AM</span>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="mb-3">
                    <h6>User Name</h6>
                    <span>instructordemo</span>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="mb-3">
                    <h6>Phone Number</h6>
                    <span>89104-71829</span>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="mb-3">
                    <h6>Email</h6>
                    <span>instructordemo@example.com</span>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="mb-3">
                    <h6>Gender</h6>
                    <span>Male</span>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="mb-3">
                    <h6>DOB</h6>
                    <span>16 Jan 2020</span>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="mb-3">
                    <h6>Age</h6>
                    <span>24</span>
                  </div>
                </div>
                <div className="col-md-12">
                  <div>
                    <h6>Bio</h6>
                    <span>
                      I am a web developer with a vast array of knowledge in many
                      different front end and back end languages, responsive
                      frameworks, databases, and best code practices.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-body">
              <h5 className="fs-18 pb-3 border-bottom mb-3">Education</h5>
              <div className="education-flow">
                <div className="ps-4 pb-3 timeline-flow">
                  <div>
                    <h6 className="mb-1">BCA - Bachelor of Computer Applications</h6>
                    <p>International University - (2004 - 2010)</p>
                  </div>
                </div>
                <div className="ps-4 pb-3 timeline-flow">
                  <div>
                    <h6 className="mb-1">MCA - Master of Computer Application</h6>
                    <p>International University - (2010 - 2012)</p>
                  </div>
                </div>
                <div className="ps-4 pb-0 timeline-flow">
                  <div>
                    <h6 className="mb-1">Design Communication Visual</h6>
                    <p>International University - (2012-2015)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="card mb-0">
            <div className="card-body">
              <h5 className="fs-18 pb-3 border-bottom mb-3">Experience</h5>
              <div className="d-flex align-items-center mb-4">
                <span className="bg-light border avatar avatar-lg text-gray-9 flex-shrink-0 me-3">
                  <i className="isax isax-briefcase fw-bold" />
                </span>
                <div>
                  <h6 className="mb-1">Web Design &amp; Development Team Leader</h6>
                  <p>Creative Agency - (2013 - 2016)</p>
                </div>
              </div>
              <div className="d-flex align-items-center">
                <span className="bg-light border avatar avatar-lg text-gray-9 flex-shrink-0 me-3">
                  <i className="isax isax-briefcase fw-bold" />
                </span>
                <div>
                  <h6 className="mb-1">Project Manager</h6>
                  <p>CJobcy Technology Pvt.Ltd - (Present)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      </div>
    </div>
    </>
  )
}

export default InstructorProfile
