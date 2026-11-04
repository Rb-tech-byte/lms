import React, { useEffect, useState } from 'react';
import InstructorSettingsLink from '../settings-link/instructorSettingsLink';
import {
  instructorService,
  InstructorPlanWorkload,
} from '../../../../core/api/instructorService';
import { SectionCard } from '../../common/instructorUi';

const InstructorPlanSettings: React.FC = () => {
  const [plan, setPlan] = useState<InstructorPlanWorkload | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    let mounted = true;
    instructorService.fetchPlanSettings().then((data) => {
      if (mounted) {
        setPlan(data);
        setLoading(false);
      }
    });
    return () => { mounted = false; };
  }, []);

  const handleChange = (field: keyof InstructorPlanWorkload, value: any) => {
    if (!plan) return;
    setPlan({ ...plan, [field]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plan) return;
    setSaving(true);
    setMessage(null);

    try {
      const res = await instructorService.updatePlanSettings(plan);
      setMessage({ type: 'success', text: res.message || 'Workload schedule updated.' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to update workload.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading || !plan) {
    return (
      <div className="ins-content p-4">
        <InstructorSettingsLink />
        <div className="ins-empty">
          <span className="spinner-border spinner-border-sm text-primary me-2" />
          Loading faculty appointment &amp; workload...
        </div>
      </div>
    );
  }

  return (
    <div className="ins-content">
      <InstructorSettingsLink />

      {message && (
        <div
          className={`alert ${
            message.type === 'success' ? 'alert-success border-success' : 'alert-danger border-danger'
          } d-flex align-items-center justify-content-between py-2 px-3 mb-4 rounded-3`}
        >
          <div className="d-flex align-items-center gap-2">
            <i className={`feather-${message.type === 'success' ? 'check-circle' : 'alert-circle'}`} />
            <span>{message.text}</span>
          </div>
          <button
            type="button"
            className="btn-close btn-close-sm"
            onClick={() => setMessage(null)}
            aria-label="Close"
          />
        </div>
      )}

      <SectionCard
        title="Faculty Academic Appointment &amp; Teaching Workload"
        subtitle="Review your institutional tenure track, assigned teaching hours, and regional examination center commitments."
      >
        <form onSubmit={handleSubmit}>
          {/* Appointment Banner */}
          <div className="p-3 mb-4 rounded-3 border bg-light d-flex flex-wrap align-items-center justify-content-between gap-3">
            <div>
              <div className="d-flex align-items-center gap-2 mb-1">
                <span className="badge bg-primary px-2.5 py-1">Permanent &amp; Pensionable</span>
                <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-0.5">
                  Academic Year {plan.academicYear} • {plan.semester}
                </span>
              </div>
              <h5 className="fw-bold text-dark mb-0">{plan.facultyRank}</h5>
              <div className="text-muted small">
                The Open University of Tanzania • Faculty of Science, Technology &amp; Environmental Studies
              </div>
            </div>

            <div className="d-flex gap-3 text-center">
              <div className="p-2 px-3 rounded-3 bg-white border">
                <div className="fw-bold text-primary fs-18">{plan.assignedCoursesCount}</div>
                <div className="text-muted" style={{ fontSize: 11 }}>Active Courses</div>
              </div>
              <div className="p-2 px-3 rounded-3 bg-white border">
                <div className="fw-bold text-dark fs-18">{plan.allocatedTeachingHours}h</div>
                <div className="text-muted" style={{ fontSize: 11 }}>Weekly Hours</div>
              </div>
            </div>
          </div>

          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label fw-semibold text-dark small mb-1">
                Maximum Approved Course Load (Courses per Semester)
              </label>
              <input
                type="number"
                min={1}
                max={8}
                className="form-control"
                value={plan.maxCourseLoad}
                onChange={(e) => handleChange('maxCourseLoad', parseInt(e.target.value) || 1)}
              />
              <small className="text-muted">Standard Senate teaching guideline is 3 to 5 courses.</small>
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold text-dark small mb-1">
                Weekly Teaching &amp; Consultation Hours
              </label>
              <input
                type="number"
                min={4}
                max={40}
                className="form-control"
                value={plan.allocatedTeachingHours}
                onChange={(e) => handleChange('allocatedTeachingHours', parseInt(e.target.value) || 10)}
              />
              <small className="text-muted">Includes online lectures, BBB tutorials, and grading.</small>
            </div>

            <div className="col-12">
              <label className="form-label fw-semibold text-dark small mb-1">
                Virtual &amp; Physical Office Hours Schedule
              </label>
              <input
                type="text"
                className="form-control"
                value={plan.officeHours}
                onChange={(e) => handleChange('officeHours', e.target.value)}
                placeholder="e.g. Tuesdays & Thursdays, 10:00 – 13:00 EAT"
              />
              <small className="text-muted">Published directly on all course syllabi for distance learners.</small>
            </div>

            <div className="col-12">
              <label className="form-label fw-semibold text-dark small mb-1">
                Assigned Regional Centers for In-Person Examinations
              </label>
              <div className="d-flex flex-column gap-2 p-3 rounded-3 border bg-white">
                {plan.regionalCenters.map((rc, idx) => (
                  <div key={idx} className="d-flex align-items-center gap-2 text-dark small">
                    <i className="feather-check text-success" />
                    <span>{rc}</span>
                  </div>
                ))}
              </div>
              <small className="text-muted">Regional center invigilation assignments are managed in collaboration with the Directorate of Examinations (DEA).</small>
            </div>

            <div className="col-12 pt-3 border-top d-flex justify-content-end gap-2">
              <button
                type="button"
                className="ins-btn ins-btn-ghost"
                onClick={() => instructorService.fetchPlanSettings().then(setPlan)}
              >
                Reset
              </button>
              <button type="submit" className="ins-btn ins-btn-primary" disabled={saving}>
                {saving && <span className="spinner-border spinner-border-sm me-1" />}
                {saving ? 'Updating...' : 'Save Workload Preferences'}
              </button>
            </div>
          </div>
        </form>
      </SectionCard>
    </div>
  );
};

export default InstructorPlanSettings;
