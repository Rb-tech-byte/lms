import React, { useState } from 'react'
import Breadcrumb from '../../../core/common/Breadcrumb/breadcrumb'
import InstructorSidebar from '../common/instructorSidebar'
import ProfileCard from '../common/profileCard'
import ImageWithBasePath from '../../../core/common/imageWithBasePath'
import { Link } from 'react-router-dom'
import { all_routes } from '../../router/all_routes'

const InstructorMessage = () => {
  const [showSearch,setShowSearch] = useState<any>(false);
  return (
    <>
    <Breadcrumb title='Messages'/>
    <div className="content">
  <div className="container">
   <ProfileCard/>
    <div className="row">
      <InstructorSidebar/>
      <div className="col-lg-9">
  <div className="instructor-message">
    <h5 className="page-title">Messages</h5>
    <div className="row">
      {/* Chat User List */}
      <div className="col-lg-5">
        <div className="chat-cont-left">
          <div className="chat-card  mb-0 flex-fill">
            <div className="chat-header">
              <div className="input-icon">
                <span className="input-icon-addon">
                  <i className="isax isax-search-normal-1 fs-14" />
                </span>
                <input
                  type="email"
                  className="form-control form-control-md"
                  placeholder="Search"
                />
              </div>
            </div>
            <div className="chat-body chat-users-list chat-scroll">
              <Link
                to="#"
                className="d-flex justify-content-between align-items-center chat-member"
              >
                <div className="d-flex align-items-center">
                  <div className="avatar avatar-lg online avatar-rounded flex-shrink-0 me-2">
                    <ImageWithBasePath src="assets/img/user/user-29.jpg" alt="User Image" />
                  </div>
                  <div>
                    <h6 className="fs-16 fw-medium mb-1 d-flex align-items-center">
                      Andrea Jermian{" "}
                      <span className="msg-count badge badge-secondary d-flex align-items-center justify-content-center rounded-circle ms-2">
                        3
                      </span>
                    </h6>
                    <p>Just Now</p>
                  </div>
                </div>
                <div className="flex-grow-1">
                  <div className="text-end">
                    <div className="d-flex align-items-center justify-content-end">
                      <i className="fa-solid fa-check" />
                    </div>
                  </div>
                </div>
              </Link>
              <Link
                to="#"
                className="d-flex align-items-center justify-content-between chat-member"
              >
                <div className="d-flex align-items-center">
                  <div className="avatar avatar-lg avatar-rounded flex-shrink-0 me-2">
                    <ImageWithBasePath src="assets/img/user/user-31.jpg" alt="User Image" />
                  </div>
                  <div>
                    <h6 className="fs-16 fw-medium mb-1">Samuel James</h6>
                    <p className="fs-14 text-gray-6 text-truncate">12:30 PM</p>
                  </div>
                </div>
                <div className="flex-grow-1">
                  <div className="text-end">
                    <div className="d-flex align-items-center justify-content-end">
                      <i className="fa-solid fa-check-double text-success" />
                    </div>
                  </div>
                </div>
              </Link>
              <Link
                to="#"
                className="d-flex justify-content-between align-items-center chat-member"
              >
                <div className="d-flex align-items-center">
                  <div className="avatar avatar-lg online avatar-rounded flex-shrink-0 me-2">
                    <ImageWithBasePath src="assets/img/user/user-32.jpg" alt="User Image" />
                  </div>
                  <div>
                    <h6 className="fs-16 fw-medium mb-1 d-flex align-items-center">
                      Adrian Marshall{" "}
                      <span className="msg-count badge badge-secondary d-flex align-items-center justify-content-center rounded-circle ms-2">
                        3
                      </span>
                    </h6>
                    <p>Just Now</p>
                  </div>
                </div>
                <div className="flex-grow-1">
                  <div className="text-end">
                    <div className="d-flex align-items-center justify-content-end">
                      <i className="fa-solid fa-check" />
                    </div>
                  </div>
                </div>
              </Link>
              <Link
                to="#"
                className="d-flex align-items-center justify-content-between chat-member"
              >
                <div className="d-flex align-items-center">
                  <div className="avatar avatar-lg avatar-rounded flex-shrink-0 me-2">
                    <ImageWithBasePath src="assets/img/user/user-33.jpg" alt="User Image" />
                  </div>
                  <div>
                    <h6 className="fs-16 fw-medium mb-1">Peter Anderson</h6>
                    <p className="fs-14 text-gray-6 text-truncate">23/03/24</p>
                  </div>
                </div>
                <div className="flex-grow-1">
                  <div className="text-end">
                    <div className="d-flex align-items-center justify-content-end">
                      <i className="fa-solid fa-check-double text-success" />
                    </div>
                  </div>
                </div>
              </Link>
              <Link
                to="#"
                className="d-flex align-items-center justify-content-between chat-member"
              >
                <div className="d-flex align-items-center">
                  <div className="avatar avatar-lg avatar-rounded flex-shrink-0 me-2">
                    <ImageWithBasePath src="assets/img/user/user-34.jpg" alt="User Image" />
                  </div>
                  <div>
                    <h6 className="fs-16 fw-medium mb-1">Anderson</h6>
                    <p className="fs-14 text-gray-6 text-truncate">23/03/24</p>
                  </div>
                </div>
                <div className="flex-grow-1">
                  <div className="text-end">
                    <div className="d-flex align-items-center justify-content-end">
                      <i className="fa-solid fa-check-double text-success" />
                    </div>
                  </div>
                </div>
              </Link>
              <Link
                to="#"
                className="d-flex align-items-center justify-content-between chat-member"
              >
                <div className="d-flex align-items-center">
                  <div className="avatar avatar-lg avatar-rounded flex-shrink-0 me-2">
                    <ImageWithBasePath src="assets/img/user/user-35.jpg" alt="User Image" />
                  </div>
                  <div>
                    <h6 className="fs-16 fw-medium mb-1">Andrea</h6>
                    <p className="fs-14 text-gray-6 text-truncate">23/03/24</p>
                  </div>
                </div>
                <div className="flex-grow-1">
                  <div className="text-end">
                    <div className="d-flex align-items-center justify-content-end">
                      <i className="fa-solid fa-check-double text-success" />
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
      {/* Chat User List */}
      {/* Chat Content */}
      <div className="col-lg-7 chat-cont-right chat-window-long">
        {/* Chat History */}
        <div className="chat-two-card chat-window mb-0 shadow-none flex-fill">
          <div className="border-0 p-0 position-relative">
            <div className="msg_head">
              <div className="d-flex bd-highlight align-items-center">
                <Link
                  id="back_user_list"
                  to="#"
                  className="back-user-list"
                >
                  <i className="fas fa-chevron-left" />
                </Link>
                <div className="avatar avatar-lg avatar-rounded flex-shrink-0 me-2">
                  <ImageWithBasePath src="assets/img/user/user-02.jpg" alt="User" />
                </div>
                <div>
                  <h6 className="fs-16 mb-1">Ronald Richard</h6>
                </div>
              </div>
              <div className="d-flex align-items-center send-action">
                <Link
                  to="#"
                  className="btn chat-search-btn send-action-btn"
                  data-bs-toggle="tooltip"
                  data-bs-placement="bottom"
                  aria-label="Search"
                  data-bs-original-title="Search"
                  onClick={()=>setShowSearch(!showSearch)}
                >
                  <i className="isax isax-search-normal-14" />
                </Link>
                <Link
                  className="btn no-bg send-action-btn rounded-circle"
                  to="#"
                  data-bs-toggle="dropdown"
                >
                  <i className="fa-solid fa-ellipsis-vertical" />
                </Link>
                <ul className="dropdown-menu dropdown-menu-end p-3">
                  <li>
                    <Link to={all_routes.homeone} className="dropdown-item">
                      <i className="isax isax-close-circle me-2" />
                      Close Chat
                    </Link>
                  </li>
                  <li>
                    <Link to="#" className="dropdown-item">
                      <i className="fa-solid fa-volume-xmark me-2" />
                      Mute Notification
                    </Link>
                  </li>
                  <li>
                    <Link to="#" className="dropdown-item">
                      <i className="isax isax-clock me-2" />
                      Disappearing Message
                    </Link>
                  </li>
                  <li>
                    <Link to="#" className="dropdown-item">
                      <i className="isax isax-refresh me-2" />
                      Clear Message
                    </Link>
                  </li>
                  <li>
                    <Link to="#" className="dropdown-item">
                      <i className="isax isax-trash me-2" />
                      Delete Chat
                    </Link>
                  </li>
                  <li>
                    <Link to="#" className="dropdown-item">
                      <i className="fa-regular fa-thumbs-down me-2" />
                      Report
                    </Link>
                  </li>
                  <li>
                    <Link to="#" className="dropdown-item">
                      <i className="fa-solid fa-ban me-2" />
                      Block
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            {/* Chat Search */}
            <div className={`chat-search search-wrap contact-search ${showSearch ? 'visible-chat':''}`}>
              <form>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search Contacts"
                  />
                  <span className="input-group-text">
                    <i className="isax isax-search-normal-14" />
                  </span>
                </div>
              </form>
            </div>
            {/* /Chat Search */}
          </div>
          <div className="msg_card_body chat-scroll">
            <ul className="list-unstyled p-0">
              <li className="sent-message-group">
                <ul>
                  <li className="media sent d-flex align-items-end">
                    <div className="media-body flex-grow-1">
                      <div className="msg-box">
                        <div className="d-flex align-items-end justify-content-end mb-1">
                          <div className="avatar avatar-md avatar-rounded flex-shrink-0 ms-2">
                            <ImageWithBasePath
                              src="assets/img/user/user-01.jpg"
                              alt="User Image "
                            />
                          </div>
                          <div className="position-relative">
                            <div className="d-flex align-items-center justify-content-end mb-1">
                              <div className="d-flex align-items-center">
                                <i className="fa-solid fa-check-double me-2 text-success fs-12" />
                                <p className="mb-0">02:39 PM</p>
                                <i className="fa-solid fa-circle text-gray-1 fs-7 mx-1" />
                              </div>
                              <h6 className="fs-14 fw-normal d-flex align-items-center">
                                You
                              </h6>
                            </div>
                            <div>
                              <div className="sent-message">
                                <p>How’s the assignment coming along?</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                </ul>
              </li>
              <li className="media received">
                <div className="d-flex align-items-end mb-1">
                  <div className="avatar avatar-md avatar-rounded flex-shrink-0 me-2">
                    <ImageWithBasePath src="assets/img/user/user-02.jpg" alt="User Image " />
                  </div>
                  <div className="media-body flex-grow-1">
                    <div className="d-flex align-items-center mb-1">
                      <h6 className="fs-14 fw-normal d-flex align-items-center">
                        Ronald Richard
                      </h6>
                      <div className="d-flex align-items-center">
                        <i className="fa-solid fa-circle text-gray-1 fs-7 mx-1" />
                        <p>02:40 PM</p>
                      </div>
                    </div>
                    <div className="msg-box">
                      <div className="position-relative">
                        <div className="d-flex align-items-center ">
                          <div className="received-message me-2">
                            <p>
                              t’s going okay, but I’m stuck on the analysis
                              part.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
              <li className="sent-message-group">
                <ul>
                  <li className="media sent d-flex align-items-end">
                    <div className="media-body flex-grow-1">
                      <div className="msg-box">
                        <div className="d-flex align-items-end justify-content-end mb-1">
                          <div className="avatar avatar-md avatar-rounded flex-shrink-0 ms-2">
                            <ImageWithBasePath
                              src="assets/img/user/user-01.jpg"
                              alt="User Image "
                            />
                          </div>
                          <div className="position-relative">
                            <div className="d-flex align-items-center justify-content-end mb-1">
                              <div className="d-flex align-items-center">
                                <i className="fa-solid fa-check-double me-2 text-success fs-12" />
                                <p className="mb-0">02:39 PM</p>
                                <i className="fa-solid fa-circle text-gray-1 fs-7 mx-1" />
                              </div>
                              <h6 className="fs-14 fw-normal d-flex align-items-center">
                                You
                              </h6>
                            </div>
                            <div>
                              <div className="sent-message">
                                <p>Which part exactly?</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                </ul>
              </li>
              <li className="media received">
                <div className="d-flex align-items-end mb-1">
                  <div className="avatar avatar-md avatar-rounded flex-shrink-0 me-2">
                    <ImageWithBasePath src="assets/img/user/user-02.jpg" alt="User Image " />
                  </div>
                  <div className="media-body flex-grow-1">
                    <div className="d-flex align-items-center mb-1">
                      <h6 className="fs-14 fw-normal d-flex align-items-center">
                        Ronald Richard
                      </h6>
                      <div className="d-flex align-items-center">
                        <i className="fa-solid fa-circle text-gray-1 fs-7 mx-1" />
                        <p>02:40 PM</p>
                      </div>
                    </div>
                    <div className="msg-box">
                      <div className="position-relative">
                        <div className="d-flex align-items-center ">
                          <div className="received-message me-2">
                            <p>Understanding the variable relationships.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
              <li className="sent-message-group">
                <ul>
                  <li className="media sent d-flex align-items-end">
                    <div className="media-body flex-grow-1">
                      <div className="msg-box">
                        <div className="d-flex align-items-end justify-content-end mb-1">
                          <div className="avatar avatar-md avatar-rounded flex-shrink-0 ms-2">
                            <ImageWithBasePath
                              src="assets/img/user/user-01.jpg"
                              alt="User Image "
                            />
                          </div>
                          <div className="position-relative">
                            <div className="d-flex align-items-center justify-content-end mb-1">
                              <div className="d-flex align-items-center">
                                <i className="fa-solid fa-check-double me-2 text-success fs-12" />
                                <p className="mb-0">02:39 PM</p>
                                <i className="fa-solid fa-circle text-gray-1 fs-7 mx-1" />
                              </div>
                              <h6 className="fs-14 fw-normal d-flex align-items-center">
                                You
                              </h6>
                            </div>
                            <div>
                              <div className="sent-message">
                                <p>Try plotting them. Let’s check together.</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                </ul>
              </li>
              <li className="media received">
                <div className="d-flex align-items-end mb-1">
                  <div className="avatar avatar-md avatar-rounded flex-shrink-0 me-2">
                    <ImageWithBasePath src="assets/img/user/user-02.jpg" alt="User Image " />
                  </div>
                  <div className="media-body flex-grow-1">
                    <div className="d-flex align-items-center mb-1">
                      <h6 className="fs-14 fw-normal d-flex align-items-center">
                        Ronald Richard
                      </h6>
                      <div className="d-flex align-items-center">
                        <i className="fa-solid fa-circle text-gray-1 fs-7 mx-1" />
                        <p>02:40 PM</p>
                      </div>
                    </div>
                    <div className="msg-box">
                      <div className="position-relative">
                        <div className="d-flex align-items-center ">
                          <div className="received-message me-2">
                            <p>Sure!</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </div>
          <div className="chat-footer border-0 pt-0">
            <div className="d-flex align-items-center">
              <div className="d-flex align-items-center chat-input-icons">
                <Link
                  className="btn no-bg"
                  to="#"
                  data-bs-toggle="dropdown"
                >
                  <i className="text-gray-5 fa-solid fa-ellipsis-vertical" />
                </Link>
                <div className="dropdown-menu dropdown-menu-end p-3">
                  <Link to="#" className="dropdown-item">
                    <i className="isax isax-camera me-2" />
                    Camera
                  </Link>
                  <Link to="#" className="dropdown-item">
                    <i className="isax isax-gallery me-2" />
                    Gallery
                  </Link>
                  <Link to="#" className="dropdown-item">
                    <i className="isax isax-audio-square me-2" />
                    Audio
                  </Link>
                  <Link to="#" className="dropdown-item">
                    <i className="isax isax-location me-2" />
                    Location
                  </Link>
                  <Link to="#" className="dropdown-item">
                    <i className="isax isax-user-cirlce-add me-2" />
                    Contact
                  </Link>
                </div>
                <div className="form-item emoj-action-foot">
                  <Link to="javascrip:void(0);" className="action-circle">
                    <i className="text-gray-5  fa-regular fa-face-smile" />
                  </Link>
                  <div className="emoj-group-list-foot down-emoji-circle">
                    <ul>
                      <li>
                        <Link to="#">
                          <ImageWithBasePath
                            src="assets/img/icons/emonji-02.svg"
                            alt="Icon"
                          />
                        </Link>
                      </li>
                      <li>
                        <Link to="#">
                          <ImageWithBasePath
                            src="assets/img/icons/emonji-05.svg"
                            alt="Icon"
                          />
                        </Link>
                      </li>
                      <li>
                        <Link to="#">
                          <ImageWithBasePath
                            src="assets/img/icons/emonji-06.svg"
                            alt="Icon"
                          />
                        </Link>
                      </li>
                      <li>
                        <Link to="#">
                          <ImageWithBasePath
                            src="assets/img/icons/emonji-07.svg"
                            alt="Icon"
                          />
                        </Link>
                      </li>
                      <li>
                        <Link to="#">
                          <ImageWithBasePath
                            src="assets/img/icons/emonji-08.svg"
                            alt="Icon"
                          />
                        </Link>
                      </li>
                      <li className="add-emoj">
                        <Link to="#">
                          <i className="isax isax-add" />
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>
                <Link to="#">
                  <i className="isax isax-microphone-2 text-gray-5" />
                </Link>
              </div>
              <div className="chat-input me-2">
                <input
                  className="form-control"
                  placeholder="Type your message here..."
                />
              </div>
              <div>
                <button className="btn btn-secondary btn_send">
                  <i
                    className="isax isax-send-1 text-white"
                    aria-hidden="true"
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* /Chat Content */}
    </div>
  </div>
</div>

    </div>
  </div>
</div>
  </>
  )
}

export default InstructorMessage
