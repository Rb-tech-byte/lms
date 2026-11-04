import React, { useState } from 'react';
import Breadcrumb from '../../../core/common/Breadcrumb/breadcrumb';
import ImageWithBasePath from '../../../core/common/imageWithBasePath';
import CountUp from 'react-countup';
import { callInternalApi } from '../../../core/api/apiClient';

const BecomeInstructor: React.FC = () => {
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('Faculty of Science, Technology & Environmental Studies');
  const [qualification, setQualification] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resultMsg, setResultMsg] = useState<{ type: 'success' | 'danger'; text: string } | null>(
    null
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResultMsg(null);
    if (!fullname.trim() || !email.trim()) {
      setResultMsg({ type: 'danger', text: 'Full name and official email are required.' });
      return;
    }
    setSubmitting(true);
    try {
      const res = await callInternalApi<{ status: string; applicationId: string; message: string }>(
        'submit_instructor_application',
        {
          fullname: fullname.trim(),
          email: email.trim(),
          phone: phone.trim(),
          department,
          qualification: qualification.trim(),
        }
      );
      setResultMsg({
        type: 'success',
        text: `${res.message} (Reference: ${res.applicationId})`,
      });
      setFullname('');
      setEmail('');
      setPhone('');
      setQualification('');
    } catch (err: any) {
      setResultMsg({
        type: 'danger',
        text: err?.message || 'Unable to submit application at this time.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Breadcrumb title="Apply as an OUT Academic Lecturer" />
      <div className="become-an-instructor py-5">
        <div className="container">
          <div className="row align-items-center g-4 mb-5">
            <div className="col-lg-6">
              <span className="badge bg-primary-transparent text-primary mb-2">
                Open University of Tanzania Directorate of Academic Services
              </span>
              <h2 className="fw-bold mb-3">Join Our Pan-African Distance Learning Faculty</h2>
              <p className="text-muted mb-4">
                The Open University of Tanzania welcomes qualified professors, senior lecturers,
                and subject-matter specialists to author, moderate, and supervise courses on our
                headless Moodle 5.3 platform.
              </p>
              <div className="row g-3">
                <div className="col-sm-6">
                  <div className="border rounded-3 p-3 bg-white">
                    <h6 className="fw-bold mb-1">
                      <i className="isax isax-teacher text-primary me-2" />
                      30 Regional Centres
                    </h6>
                    <p className="text-muted small mb-0">
                      Supervise undergraduate and postgraduate students nationwide.
                    </p>
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="border rounded-3 p-3 bg-white">
                    <h6 className="fw-bold mb-1">
                      <i className="isax isax-monitor-mobbile text-secondary me-2" />
                      Moodle 5.3 Studio
                    </h6>
                    <p className="text-muted small mb-0">
                      Author interactive quizzes, video modules, and grading rubrics.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="card border-0 shadow-sm p-4">
                <h4 className="fw-bold mb-1">Lecturer Application Form</h4>
                <p className="text-muted small mb-3">
                  Submit your academic credentials for review by the OUT Faculty Board.
                </p>

                {resultMsg && (
                  <div className={`alert alert-${resultMsg.type} py-2 small`}>
                    {resultMsg.text}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label">
                      Full Name &amp; Academic Title <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g., Dr. Juma Mwakasege"
                      value={fullname}
                      onChange={(e) => setFullname(e.target.value)}
                      required
                    />
                  </div>
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label">
                        Email Address <span className="text-danger">*</span>
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        placeholder="name@out.ac.tz"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Phone Number (Tanzania)</label>
                      <input
                        type="tel"
                        className="form-control"
                        placeholder="+255 7XX XXX XXX"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Target Academic Faculty</label>
                    <select
                      className="form-select"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                    >
                      <option value="Faculty of Science, Technology & Environmental Studies">
                        Faculty of Science, Technology &amp; Environmental Studies (FSTES)
                      </option>
                      <option value="Faculty of Business Management">
                        Faculty of Business Management (FBM)
                      </option>
                      <option value="Faculty of Education">Faculty of Education (FED)</option>
                      <option value="Faculty of Law">Faculty of Law (FLW)</option>
                      <option value="Faculty of Arts & Social Sciences">
                        Faculty of Arts &amp; Social Sciences (FASS)
                      </option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Highest Qualification &amp; Specialization</label>
                    <textarea
                      rows={3}
                      className="form-control"
                      placeholder="Summarize your PhD/Master's specialization, teaching experience, and proposed courses..."
                      value={qualification}
                      onChange={(e) => setQualification(e.target.value)}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn btn-secondary w-100 py-2"
                  >
                    {submitting ? 'Submitting Application...' : 'Submit Academic Application'}
                  </button>
                </form>
              </div>
            </div>
          </div>

          <div className="counter-sec">
            <div className="row row-gap-4">
              <div className="col-xl-3 col-md-6">
                <div className="card border-0 mb-0">
                  <div className="card-body d-flex align-items-center">
                    <div className="counter-icon">
                      <ImageWithBasePath src="./assets/img/icons/counter-icon1.svg" alt="Students" />
                    </div>
                    <div className="count-content">
                      <h4 className="text-info count-digit">
                        <CountUp end={15} />K+
                      </h4>
                      <p>Active OUT Students</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-xl-3 col-md-6">
                <div className="card border-0 mb-0">
                  <div className="card-body d-flex align-items-center">
                    <div className="counter-icon">
                      <ImageWithBasePath src="./assets/img/icons/counter-icon2.svg" alt="Courses" />
                    </div>
                    <div className="count-content">
                      <h4 className="text-warning count-digit">
                        <CountUp end={120} />+
                      </h4>
                      <p>Accredited Modules</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-xl-3 col-md-6">
                <div className="card border-0 mb-0">
                  <div className="card-body d-flex align-items-center">
                    <div className="counter-icon">
                      <ImageWithBasePath src="./assets/img/icons/counter-icon3.svg" alt="Centres" />
                    </div>
                    <div className="count-content">
                      <h4 className="text-skyblue count-digit">
                        <CountUp end={30} />
                      </h4>
                      <p>Regional Centres</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-xl-3 col-md-6">
                <div className="card border-0 mb-0">
                  <div className="card-body d-flex align-items-center">
                    <div className="counter-icon">
                      <ImageWithBasePath src="./assets/img/icons/counter-icon4.svg" alt="Faculty" />
                    </div>
                    <div className="count-content">
                      <h4 className="text-lightgreen count-digit">
                        <CountUp end={5} />
                      </h4>
                      <p>University Faculties</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BecomeInstructor;
