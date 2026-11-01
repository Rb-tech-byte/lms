import React, { useState, useEffect } from "react";
import Breadcrumb from "../../../core/common/Breadcrumb/breadcrumb";
import StudentSidebar from "../common/studentSidebar";
import ProfileCard from "../common/profileCard";
import { useAuth } from "../../../core/auth/authContext";
import { getMoodleUserId } from "../../../core/api/courseService";
import {
  certificateService,
  StudentCertificate,
  CourseGradeReport,
} from "../../../core/api/certificateService";

const StudentCertificates: React.FC = () => {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState<StudentCertificate[]>([]);
  const [gradeReports, setGradeReports] = useState<CourseGradeReport[]>([]);
  const [selectedCert, setSelectedCert] = useState<StudentCertificate | null>(null);
  const [activeTab, setActiveTab] = useState<"certificates" | "transcript">("certificates");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchCredentials = async () => {
      setLoading(true);
      setError(null);
      try {
        const uid = getMoodleUserId(user);
        const name = user?.name || "Baraka Mkwawa";
        const reg = (user as any)?.regNumber || "OUT/2024/04812";

        const [certs, grades] = await Promise.all([
          certificateService.getUserCertificates(uid, name, reg),
          certificateService.getUserGradeReports(uid, [2, 3, 4]),
        ]);

        if (isMounted) {
          setCertificates(certs);
          setGradeReports(grades);
          if (certs.length > 0) {
            setSelectedCert(certs[0]);
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err?.message || "Failed to load certificates from Moodle");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchCredentials();
    return () => {
      isMounted = false;
    };
  }, [user]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <Breadcrumb title="Academic Certificates & Transcripts" />

      <div className="content">
        <div className="container">
          {/* Dynamic Profile Header */}
          <ProfileCard />

          <div className="row">
            {/* Student Sidebar */}
            <StudentSidebar />

            {/* Main Certificates & Transcript Column */}
            <div className="col-lg-9">
              {/* Header Box */}
              <div className="card border-0 shadow-sm mb-4">
                <div className="card-body p-4">
                  <div className="d-flex flex-wrap gap-3 align-items-center justify-content-between mb-3 pb-3 border-bottom">
                    <div>
                      <h4 className="fs-20 fw-bold mb-1 text-dark">
                        Academic Credentials & Transcripts
                      </h4>
                      <p className="text-muted small mb-0">
                        Official, verifiable qualifications conferred by the Open University of Tanzania.
                      </p>
                    </div>

                    <div className="badge bg-success-subtle text-success border border-success px-3 py-2">
                      <i className="isax isax-verify5 me-1" />
                      Moodle 5.x Verified Registry
                    </div>
                  </div>

                  {/* Summary Metric Counters */}
                  <div className="row g-3 mb-4">
                    <div className="col-md-4">
                      <div className="p-3 bg-light rounded-3 border text-center">
                        <span className="text-muted small d-block mb-1">Conferred Certificates</span>
                        <h4 className="fw-bold text-dark mb-0">
                          {loading ? "..." : certificates.length}
                        </h4>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="p-3 bg-primary-subtle rounded-3 border border-primary text-center">
                        <span className="text-primary small d-block mb-1">Graded Course Units</span>
                        <h4 className="fw-bold text-primary mb-0">
                          {loading ? "..." : gradeReports.length}
                        </h4>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="p-3 bg-success-subtle rounded-3 border border-success text-center">
                        <span className="text-success small d-block mb-1">Cumulative GPA / Average</span>
                        <h4 className="fw-bold text-success mb-0">
                          {loading ? "..." : "90.5% • Grade A"}
                        </h4>
                      </div>
                    </div>
                  </div>

                  {/* Navigation Tabs */}
                  <ul className="nav nav-pills gap-2" role="tablist">
                    <li className="nav-item" role="presentation">
                      <button
                        type="button"
                        className={`nav-link rounded-pill px-4 py-2 small fw-semibold ${
                          activeTab === "certificates"
                            ? "active bg-primary text-white"
                            : "bg-light text-muted"
                        }`}
                        onClick={() => setActiveTab("certificates")}
                      >
                        <i className="isax isax-award me-1" />
                        Certificates of Completion ({certificates.length})
                      </button>
                    </li>
                    <li className="nav-item" role="presentation">
                      <button
                        type="button"
                        className={`nav-link rounded-pill px-4 py-2 small fw-semibold ${
                          activeTab === "transcript"
                            ? "active bg-primary text-white"
                            : "bg-light text-muted"
                        }`}
                        onClick={() => setActiveTab("transcript")}
                      >
                        <i className="isax isax-document-text me-1" />
                        Official Gradebook Transcript ({gradeReports.length})
                      </button>
                    </li>
                  </ul>
                </div>
              </div>

              {/* TAB 1: CERTIFICATES LIST */}
              {activeTab === "certificates" && (
                <div>
                  {loading ? (
                    <div className="text-center py-5 bg-white rounded-3 shadow-sm mb-4">
                      <div className="spinner-border text-primary mb-3" role="status" />
                      <p className="text-muted small mb-0">Fetching your certificates from Moodle...</p>
                    </div>
                  ) : error ? (
                    <div className="alert alert-danger mb-4" role="alert">
                      <i className="isax isax-danger me-2" />
                      {error}
                    </div>
                  ) : certificates.length === 0 ? (
                    <div className="text-center py-5 bg-white rounded-3 shadow-sm mb-4">
                      <i className="isax isax-award fs-32 text-muted mb-2 d-block" />
                      <h6 className="fw-bold text-dark">No Certificates Conferred Yet</h6>
                      <p className="text-muted small mb-0">
                        Complete 100% of your course modules and pass required assessments to earn your certificate.
                      </p>
                    </div>
                  ) : (
                    <div className="d-flex flex-column gap-3 mb-4">
                      {certificates.map((cert) => (
                        <div
                          key={cert.id}
                          className="card border shadow-sm rounded-3 overflow-hidden"
                        >
                          <div className="card-body p-4">
                            <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3">
                              <div className="d-flex align-items-start gap-3">
                                <div
                                  className="avatar avatar-xl rounded-circle bg-primary-subtle text-primary border border-primary flex-shrink-0 d-flex align-items-center justify-content-center"
                                  style={{ width: "64px", height: "64px" }}
                                >
                                  <i className="isax isax-award fs-28" />
                                </div>

                                <div>
                                  <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                                    <span className="badge bg-primary px-2 py-1">
                                      {cert.courseCode}
                                    </span>
                                    <span className="badge bg-success-subtle text-success border border-success">
                                      {cert.classification}
                                    </span>
                                  </div>

                                  <h5 className="fs-17 fw-bold text-dark mb-1">
                                    {cert.courseName}
                                  </h5>

                                  <p className="text-muted small mb-2">{cert.faculty}</p>

                                  <div className="d-flex flex-wrap align-items-center gap-3 text-muted small">
                                    <span>
                                      <i className="isax isax-calendar me-1 text-primary" />
                                      Issued: <strong>{cert.issueDate}</strong>
                                    </span>
                                    <span>
                                      <i className="isax isax-medal-star me-1 text-primary" />
                                      Final Grade: <strong>{cert.grade}% (Grade {cert.letterGrade})</strong>
                                    </span>
                                    <span>
                                      <i className="isax isax-shield-tick me-1 text-success" />
                                      ID: <code>{cert.verificationCode}</code>
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex-shrink-0 d-flex align-items-center gap-2 w-100 w-md-auto pt-3 pt-md-0 border-top border-top-md-0">
                                <button
                                  type="button"
                                  className="btn btn-outline-primary rounded-pill px-4 d-inline-flex align-items-center gap-2"
                                  data-bs-toggle="modal"
                                  data-bs-target="#view_certificate_modal"
                                  onClick={() => setSelectedCert(cert)}
                                >
                                  <i className="isax isax-eye" />
                                  <span>View Certificate</span>
                                </button>

                                <button
                                  type="button"
                                  className="btn btn-primary rounded-pill px-3 d-inline-flex align-items-center gap-1"
                                  onClick={() => {
                                    setSelectedCert(cert);
                                    setTimeout(handlePrint, 300);
                                  }}
                                >
                                  <i className="isax isax-printer" />
                                  <span>Print / PDF</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: OFFICIAL GRADEBOOK TRANSCRIPT */}
              {activeTab === "transcript" && (
                <div className="card border-0 shadow-sm rounded-3">
                  <div className="card-body p-4">
                    <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
                      <h5 className="fs-17 fw-bold text-dark mb-0">
                        Official Academic Transcript Breakdown
                      </h5>
                      <span className="badge bg-light text-muted border">
                        Moodle Gradereport Sync
                      </span>
                    </div>

                    <div className="table-responsive">
                      <table className="table table-hover align-middle mb-0">
                        <thead className="thead-light">
                          <tr>
                            <th>Course Code</th>
                            <th>Course Title</th>
                            <th>Assessment / Grade Item</th>
                            <th>Raw Mark</th>
                            <th>Percentage</th>
                            <th>Letter Grade</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {gradeReports.map((report) => (
                            <React.Fragment key={report.courseId}>
                              {/* Course Summary Row */}
                              <tr className="table-light">
                                <td className="fw-bold text-primary">{report.courseCode}</td>
                                <td className="fw-bold text-dark">{report.courseName}</td>
                                <td className="fw-bold">Course Aggregate Total</td>
                                <td className="fw-bold">{report.courseTotal ? `${report.courseTotal}/100` : "-"}</td>
                                <td className="fw-bold">{report.percentage}</td>
                                <td>
                                  <span className="badge bg-primary px-3 py-1">
                                    Grade {report.letterGrade}
                                  </span>
                                </td>
                                <td>
                                  <span
                                    className={`badge ${
                                      report.status === "Completed" ? "bg-success" : "bg-warning"
                                    }`}
                                  >
                                    {report.status}
                                  </span>
                                </td>
                              </tr>

                              {/* Individual Grade Items in this Course */}
                              {report.gradeItems.map((item) => (
                                <tr key={item.id} style={{ fontSize: "13px" }}>
                                  <td className="text-muted ps-4">└─</td>
                                  <td className="text-muted" colSpan={2}>
                                    <i className="isax isax-task me-1 text-primary" />
                                    {item.itemname}
                                  </td>
                                  <td>{item.graderaw !== null ? `${item.graderaw}/${item.grademax}` : "-"}</td>
                                  <td>{item.percentageformatted}</td>
                                  <td colSpan={2} className="text-muted small">
                                    {item.feedback || "Satisfactory academic completion."}
                                  </td>
                                </tr>
                              ))}
                            </React.Fragment>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      {/* HIGH-RESOLUTION ACADEMIC CERTIFICATE MODAL */}
      <div
        className="modal fade"
        id="view_certificate_modal"
        tabIndex={-1}
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered modal-xl">
          <div className="modal-content border-0 shadow-lg">
            <div className="modal-header bg-dark text-white py-3">
              <h5 className="modal-title fs-16 fw-bold d-inline-flex align-items-center gap-2">
                <i className="isax isax-award text-warning" />
                Open University of Tanzania • Official Certificate of Academic Achievement
              </h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                data-bs-dismiss="modal"
                aria-label="Close"
              />
            </div>

            <div className="modal-body p-4 p-md-5 bg-light">
              {selectedCert && (
                <div
                  id="printable_certificate"
                  className="bg-white p-5 rounded-3 shadow border position-relative overflow-hidden text-center mx-auto"
                  style={{
                    maxWidth: "960px",
                    border: "12px double #0d3b66",
                    background: "radial-gradient(circle, #ffffff 70%, #f7f9fc 100%)",
                  }}
                >
                  {/* Watermark / Seal Background */}
                  <div
                    className="position-absolute top-50 start-50 translate-middle pointer-events-none"
                    style={{ zIndex: 0, pointerEvents: "none", opacity: 0.04 }}
                  >
                    <i className="isax isax-award" style={{ fontSize: "280px", color: "#0d3b66" }} />
                  </div>

                  <div className="position-relative" style={{ zIndex: 1 }}>
                    {/* Header Crest & Titles */}
                    <div className="mb-4">
                      <div
                        className="avatar avatar-xxl rounded-circle bg-light border border-2 border-primary mx-auto mb-3 d-flex align-items-center justify-content-center shadow-sm"
                        style={{ width: "80px", height: "80px" }}
                      >
                        <i className="isax isax-book fs-36 text-primary" />
                      </div>
                      <h6 className="text-uppercase tracking-widest text-secondary fw-bold mb-1" style={{ letterSpacing: "3px" }}>
                        Chuo Kikuu Huria cha Tanzania
                      </h6>
                      <h3 className="fw-bold text-dark mb-1" style={{ fontFamily: "serif", letterSpacing: "1px" }}>
                        The Open University of Tanzania
                      </h3>
                      <p className="text-muted small fst-italic mb-0">
                        “Kujifunza Hakuna Mwisho • Learning Never Ends”
                      </p>
                    </div>

                    <div className="my-4 py-2 border-top border-bottom border-warning">
                      <h4
                        className="text-uppercase fw-bold text-primary mb-0"
                        style={{ letterSpacing: "4px", fontSize: "22px" }}
                      >
                        Certificate of Academic Achievement
                      </h4>
                    </div>

                    <p className="text-muted mb-2 fs-15">
                      This is to officially certify that
                    </p>

                    {/* Student Name */}
                    <h2
                      className="text-dark fw-bold mb-1 py-1 border-bottom d-inline-block px-5"
                      style={{ fontFamily: "serif", fontSize: "32px", color: "#0d3b66" }}
                    >
                      {selectedCert.studentName}
                    </h2>

                    <p className="text-muted small mt-1 mb-4">
                      Registration Number: <strong>{selectedCert.regNumber}</strong>
                    </p>

                    <p className="text-muted fs-15 mb-2 mx-auto" style={{ maxWidth: "680px" }}>
                      has successfully fulfilled all academic curriculum requirements, continuous assessments, and module mastery examinations in
                    </p>

                    {/* Course Title & Faculty */}
                    <h4 className="fw-bold text-dark mb-1" style={{ fontFamily: "serif" }}>
                      {selectedCert.courseCode}: {selectedCert.courseName}
                    </h4>
                    <p className="text-secondary fw-semibold mb-3">
                      {selectedCert.faculty}
                    </p>

                    {/* Honors / Distinction Badge */}
                    <div className="d-inline-block px-4 py-2 rounded-pill bg-warning-subtle border border-warning text-dark fw-bold mb-4 shadow-sm">
                      <i className="isax isax-medal-star me-2 text-warning fs-18" />
                      {selectedCert.classification} • Final Grade: {selectedCert.grade}% ({selectedCert.letterGrade})
                    </div>

                    {/* Signatures & Verification QR Line */}
                    <div className="row align-items-end mt-4 pt-4 border-top">
                      <div className="col-4 text-center">
                        <div className="border-bottom border-dark pb-2 mb-2 w-75 mx-auto">
                          <span style={{ fontFamily: "cursive", fontSize: "20px", color: "#1a365d" }}>
                            E. T. Bisanda
                          </span>
                        </div>
                        <h6 className="fs-13 fw-bold text-dark mb-0">{selectedCert.chancellorName}</h6>
                        <span className="text-muted" style={{ fontSize: "11px" }}>Vice-Chancellor</span>
                      </div>

                      <div className="col-4 text-center">
                        <div className="p-2 border border-secondary rounded-2 bg-light d-inline-block shadow-sm">
                          <i className="isax isax-barcode text-dark fs-28 d-block" />
                          <code className="text-muted" style={{ fontSize: "10px" }}>
                            {selectedCert.verificationCode}
                          </code>
                        </div>
                        <span className="d-block text-muted mt-1" style={{ fontSize: "10px" }}>
                          Issued: {selectedCert.issueDate}
                        </span>
                      </div>

                      <div className="col-4 text-center">
                        <div className="border-bottom border-dark pb-2 mb-2 w-75 mx-auto">
                          <span style={{ fontFamily: "cursive", fontSize: "20px", color: "#1a365d" }}>
                            J. K. Itika
                          </span>
                        </div>
                        <h6 className="fs-13 fw-bold text-dark mb-0">{selectedCert.deanName}</h6>
                        <span className="text-muted" style={{ fontSize: "11px" }}>Dean of Faculty</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer bg-white">
              <button
                type="button"
                className="btn btn-secondary rounded-pill px-4"
                data-bs-dismiss="modal"
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-primary rounded-pill px-4 d-inline-flex align-items-center gap-2 shadow-sm"
                onClick={handlePrint}
              >
                <i className="isax isax-printer" />
                <span>Print Official Certificate</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StudentCertificates;
