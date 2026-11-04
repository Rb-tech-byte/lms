import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Breadcrumb from '../../../core/common/Breadcrumb/breadcrumb';
import { all_routes } from '../../router/all_routes';
import { courseService, MoodleCategory } from '../../../core/api/courseService';
import { adminService } from '../../../core/api/adminService';
import { useAuth } from '../../../core/auth/authContext';

const AddNewCourse: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [categories, setCategories] = useState<MoodleCategory[]>([]);
  const [fullname, setFullname] = useState('');
  const [shortname, setShortname] = useState('');
  const [categoryid, setCategoryid] = useState<number>(1);
  const [format, setFormat] = useState('topics');
  const [numsections, setNumsections] = useState<number>(6);
  const [summary, setSummary] = useState('');
  const [visible, setVisible] = useState<number>(1);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);
  const [createdCourseId, setCreatedCourseId] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    courseService.getCategories().then((cats) => {
      if (!mounted) return;
      setCategories(cats || []);
      if (cats && cats.length > 0) {
        setCategoryid(cats[0].id);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    if (!fullname.trim() || !shortname.trim()) {
      setFeedback({ type: 'danger', text: 'Course full title and course code (short name) are required.' });
      return;
    }
    setSubmitting(true);
    try {
      const res: any = await adminService.createCourse({
        fullname: fullname.trim(),
        shortname: shortname.trim().toUpperCase(),
        category_id: categoryid,
        summary: summary.trim(),
        format,
        num_sections: numsections,
      });
      if (res && (res.status === 'success' || res.courseid || res.id)) {
        const cid = Number(res.courseid || res.id || 0);
        setCreatedCourseId(cid);
        setFeedback({
          type: 'success',
          text: `Course "${fullname}" (${shortname.toUpperCase()}) created in Moodle (ID #${cid}).`,
        });
      } else {
        setFeedback({
          type: 'danger',
          text: res?.message || 'Unable to create course in Moodle. Check your role permissions.',
        });
      }
    } catch (err: any) {
      setFeedback({
        type: 'danger',
        text: err?.message || 'Error communicating with Moodle course creation service.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Breadcrumb title="Create New Academic Course" />
      <div className="content">
        <div className="container">
          <div className="row">
            <div className="col-lg-10 mx-auto">
              <div className="add-course-item card border-0 shadow-sm p-4">
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 border-bottom pb-3 mb-4">
                  <div>
                    <h4 className="mb-1 fw-bold">Create Official OUT Moodle Course</h4>
                    <p className="text-muted small mb-0">
                      Signed in as <strong>{user?.name || 'Academic Staff'}</strong> ({user?.role || 'instructor'})
                    </p>
                  </div>
                  <div className="d-flex gap-2">
                    <Link
                      to={
                        user?.role === 'admin'
                          ? all_routes.adminDashboard
                          : all_routes.instructorDashboard
                      }
                      className="btn btn-outline-secondary btn-sm"
                    >
                      <i className="isax isax-arrow-left-2 me-1" />
                      Back to Console
                    </Link>
                  </div>
                </div>

                {feedback && (
                  <div className={`alert alert-${feedback.type} d-flex justify-content-between align-items-center`}>
                    <span>{feedback.text}</span>
                    {createdCourseId ? (
                      <div className="d-flex gap-2">
                        <button
                          type="button"
                          onClick={() => navigate(`${all_routes.courseDetails}?id=${createdCourseId}`)}
                          className="btn btn-sm btn-primary"
                        >
                          View Course Page
                        </button>
                        <button
                          type="button"
                          onClick={() => navigate(`${all_routes.courseWatch}?id=${createdCourseId}`)}
                          className="btn btn-sm btn-dark"
                        >
                          Open Classroom
                        </button>
                      </div>
                    ) : null}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    <div className="col-md-8">
                      <label className="form-label fw-semibold">
                        Course Full Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g., Bachelor of Science in ICT — Distributed Systems"
                        value={fullname}
                        onChange={(e) => setFullname(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold">
                        Course Code (Short Name) <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g., OIT-304"
                        value={shortname}
                        onChange={(e) => setShortname(e.target.value)}
                        required
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label fw-semibold">Academic Faculty / Category</label>
                      <select
                        className="form-select"
                        value={categoryid}
                        onChange={(e) => setCategoryid(Number(e.target.value))}
                      >
                        {categories.length === 0 ? (
                          <option value={1}>General Academic Programmes</option>
                        ) : (
                          categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name} ({cat.coursecount} courses)
                            </option>
                          ))
                        )}
                      </select>
                    </div>

                    <div className="col-md-4">
                      <label className="form-label fw-semibold">Moodle Course Format</label>
                      <select
                        className="form-select"
                        value={format}
                        onChange={(e) => setFormat(e.target.value)}
                      >
                        <option value="topics">Custom Sections / Topics Format</option>
                        <option value="weeks">Weekly Academic Schedule Format</option>
                        <option value="singleactivity">Single Activity Assessment Format</option>
                      </select>
                    </div>

                    <div className="col-md-2">
                      <label className="form-label fw-semibold">Modules / Weeks</label>
                      <input
                        type="number"
                        min={1}
                        max={24}
                        className="form-control"
                        value={numsections}
                        onChange={(e) => setNumsections(Number(e.target.value))}
                      />
                    </div>

                    <div className="col-md-2">
                      <label className="form-label fw-semibold">Visibility</label>
                      <select
                        className="form-select"
                        value={visible}
                        onChange={(e) => setVisible(Number(e.target.value))}
                      >
                        <option value={1}>Published</option>
                        <option value={0}>Hidden Draft</option>
                      </select>
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold">Course Syllabus & Overview</label>
                      <textarea
                        rows={5}
                        className="form-control"
                        placeholder="Describe learning outcomes, assessment structure, and reading requirements..."
                        value={summary}
                        onChange={(e) => setSummary(e.target.value)}
                      />
                    </div>

                    <div className="col-12 d-flex justify-content-end gap-2 pt-3 border-top">
                      <Link to={all_routes.courseGrid} className="btn btn-light border">
                        Cancel
                      </Link>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="btn btn-primary px-4"
                      >
                        {submitting ? 'Provisioning in Moodle...' : 'Create Moodle Course'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddNewCourse;
