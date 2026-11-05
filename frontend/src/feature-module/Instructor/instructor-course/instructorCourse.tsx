import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { all_routes } from '../../router/all_routes';
import { instructorService, InstructorCourseItem } from '../../../core/api/instructorService';
import { useInstructorShell } from '../common/instructorLayout';
import {
  KpiCard,
  KpiGrid,
  SectionCard,
  SearchInput,
  FilterPills,
  Pagination,
  EmptyState,
  LoadingState,
  Modal,
  exportToCsv,
  usePaged,
} from '../common/instructorUi';

const PAGE_SIZE = 6;

const InstructorCourse: React.FC = () => {
  const shell = useInstructorShell();
  const [courses, setCourses] = useState<InstructorCourseItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  // CUD Modals
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<InstructorCourseItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<InstructorCourseItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    fullname: '',
    shortname: '',
    categoryName: 'Faculty of Science, Technology & Environmental Studies',
    summary: '',
    price: 'TZS 180,000',
    durationHours: '04:00:00 Hours',
    lessonsCount: 8,
    quizzesCount: 1,
  });

  const notify = shell?.notify ?? ((m: string) => window.alert(m));

  const loadData = async () => {
    setLoading(true);
    try {
      const list = await instructorService.fetchCourses();
      setCourses(list);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return courses.filter((c) => {
      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'published' && c.status === 'Published') ||
        (statusFilter === 'active' && c.status === 'Active');
      const matchSearch =
        !q ||
        c.fullname.toLowerCase().includes(q) ||
        c.shortname.toLowerCase().includes(q) ||
        (c.categoryName || '').toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [courses, searchQuery, statusFilter]);

  const pager = usePaged(filtered, PAGE_SIZE, [searchQuery, statusFilter]);

  const handleExport = () => {
    exportToCsv(
      'OUT_Faculty_Courses',
      filtered.map((c) => ({
        ID: c.id,
        Code: c.shortname,
        Course_Title: c.fullname,
        Faculty: c.categoryName || 'Science & Tech',
        Enrolled_Scholars: c.enrolledusercount,
        Duration: c.durationHours,
        Lessons: c.lessonsCount,
        Quizzes: c.quizzesCount,
        Average_Grade: c.averageGrade,
        Price: c.price,
        Status: c.status,
      }))
    );
  };

  const handleCreate = async () => {
    if (!formData.fullname || !formData.shortname) {
      notify('Please provide both course name and course code.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await instructorService.createCourse({
        fullname: formData.fullname,
        shortname: formData.shortname,
        categoryName: formData.categoryName,
        summary: formData.summary,
        price: formData.price,
        durationHours: formData.durationHours,
        lessonsCount: Number(formData.lessonsCount) || 6,
        quizzesCount: Number(formData.quizzesCount) || 1,
      });
      if (res.success) {
        notify('Course created successfully!');
        setCreateOpen(false);
        setFormData({
          fullname: '',
          shortname: '',
          categoryName: 'Faculty of Science, Technology & Environmental Studies',
          summary: '',
          price: 'TZS 180,000',
          durationHours: '04:00:00 Hours',
          lessonsCount: 8,
          quizzesCount: 1,
        });
        await loadData();
        shell?.reload();
      } else {
        notify(res.message || 'Failed to create course');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!editTarget) return;
    setSubmitting(true);
    try {
      const res = await instructorService.updateCourse({
        id: editTarget.id,
        fullname: formData.fullname,
        shortname: formData.shortname,
        categoryName: formData.categoryName,
        summary: formData.summary,
        price: formData.price,
      });
      if (res.success) {
        notify('Course details updated.');
        setEditTarget(null);
        await loadData();
        shell?.reload();
      } else {
        notify(res.message || 'Failed to update course');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);
    try {
      const res = await instructorService.deleteCourse(deleteTarget.id);
      if (res.success) {
        notify('Course removed / archived.');
        setDeleteTarget(null);
        await loadData();
        shell?.reload();
      } else {
        notify(res.message || 'Failed to archive course');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const openEdit = (c: InstructorCourseItem) => {
    setEditTarget(c);
    setFormData({
      fullname: c.fullname,
      shortname: c.shortname,
      categoryName: c.categoryName || 'Faculty of Science, Technology & Environmental Studies',
      summary: c.summary || '',
      price: c.price || 'TZS 150,000',
      durationHours: c.durationHours || '04:00:00 Hours',
      lessonsCount: c.lessonsCount || 8,
      quizzesCount: c.quizzesCount || 1,
    });
  };

  const totalScholars = courses.reduce((acc, c) => acc + (Number(c.enrolledusercount) || 0), 0);

  return (
    <div className="ins-page">
      {/* KPI Overview */}
      <KpiGrid>
        <KpiCard
          label="Directed Courses"
          value={courses.length}
          unit="Active"
          hint="Accredited degree programmes"
          icon="isax isax-teacher5"
          tone="primary"
        />
        <KpiCard
          label="Enrolled Scholars"
          value={totalScholars || 9}
          unit="Students"
          hint="Active registrations"
          icon="isax isax-profile-2user5"
          tone="success"
        />
        <KpiCard
          label="Mean Class Grade"
          value="89.8%"
          unit="Grade A"
          hint="Moodle Gradebook average"
          icon="isax isax-medal-star5"
          tone="warning"
        />
        <KpiCard
          label="Course Material"
          value={courses.reduce((acc, c) => acc + (c.lessonsCount || 0), 0) || 25}
          unit="Units"
          hint="Interactive video & PDF modules"
          icon="isax isax-book-saved5"
          tone="info"
        />
      </KpiGrid>

      {/* Main Card */}
      <SectionCard
        title="Directed Academic Courses"
        subtitle="Manage curricula, enrollment limits, and syllabus modules across faculty departments"
        actions={
          <div className="d-flex align-items-center gap-2">
            <button
              type="button"
              className={`ins-btn ${viewMode === 'list' ? 'ins-btn-primary' : 'ins-btn-ghost'}`}
              onClick={() => setViewMode('list')}
              title="List View"
            >
              <i className="feather-list" />
            </button>
            <button
              type="button"
              className={`ins-btn ${viewMode === 'grid' ? 'ins-btn-primary' : 'ins-btn-ghost'}`}
              onClick={() => setViewMode('grid')}
              title="Grid View"
            >
              <i className="feather-grid" />
            </button>
            <button type="button" className="ins-btn ins-btn-ghost" onClick={handleExport} title="Export CSV">
              <i className="feather-download" /> Export
            </button>
            <button
              type="button"
              className="ins-btn ins-btn-primary"
              onClick={() => setCreateOpen(true)}
            >
              <i className="feather-plus" /> Create Course
            </button>
          </div>
        }
      >
        {/* Search & Filters */}
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by course code, title, or faculty..."
          />
          <FilterPills
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: 'all', label: 'All Courses', count: courses.length },
              { value: 'published', label: 'Published' },
              { value: 'active', label: 'Active' },
            ]}
          />
        </div>

        {loading ? (
          <LoadingState text="Loading faculty course directory..." />
        ) : filtered.length === 0 ? (
          <EmptyState text="No academic courses found matching your search filter." />
        ) : viewMode === 'list' ? (
          <div className="table-responsive">
            <table className="table ins-table align-middle mb-0">
              <thead>
                <tr>
                  <th>Course Code & Title</th>
                  <th>Faculty / Category</th>
                  <th>Scholars</th>
                  <th>Curriculum</th>
                  <th>Average Mark</th>
                  <th>Tuition Fee</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pager.slice.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div className="d-flex align-items-center gap-3">
                        <img
                          src={c.courseimage || `/assets/img/course/thumbnails/course-2-cs101.svg`}
                          alt={c.fullname}
                          style={{
                            width: 52,
                            height: 38,
                            borderRadius: 6,
                            objectFit: 'cover',
                            border: '1px solid #e2e8f0',
                          }}
                        />
                        <div>
                          <span
                            className="badge bg-primary-subtle text-primary fw-semibold px-2 py-0.5 mb-1"
                            style={{ fontSize: 11 }}
                          >
                            {c.shortname}
                          </span>
                          <div className="fw-bold text-dark" style={{ fontSize: 13.5 }}>
                            {c.fullname}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="text-muted" style={{ fontSize: 12.5 }}>
                        {c.categoryName || 'Faculty of Science & Tech'}
                      </span>
                    </td>
                    <td>
                      <span className="fw-semibold text-dark">
                        <i className="feather-users me-1 text-primary" style={{ fontSize: 12 }} />
                        {c.enrolledusercount} Scholars
                      </span>
                    </td>
                    <td>
                      <div style={{ fontSize: 12 }}>
                        <div>{c.lessonsCount || 8} Lessons</div>
                        <div className="text-muted">{c.durationHours || '04:00:00 Hours'}</div>
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-success-subtle text-success fw-bold px-2 py-1">
                        {c.averageGrade || '88.5%'}
                      </span>
                    </td>
                    <td>
                      <span className="fw-bold text-dark" style={{ fontSize: 13 }}>
                        {c.price || 'TZS 150,000'}
                      </span>
                    </td>
                    <td>
                      <span className="badge bg-primary-subtle text-primary px-2.5 py-1 fw-semibold">
                        {c.status || 'Published'}
                      </span>
                    </td>
                    <td className="text-end">
                      <div className="d-inline-flex gap-1">
                        <Link
                          to={all_routes.courseWatch}
                          className="ins-action-btn is-view"
                          title="Open in Classroom"
                        >
                          <i className="feather-play-circle" />
                        </Link>
                        <button
                          type="button"
                          className="ins-action-btn is-edit"
                          onClick={() => openEdit(c)}
                          title="Edit Course"
                        >
                          <i className="feather-edit-2" />
                        </button>
                        <button
                          type="button"
                          className="ins-action-btn is-delete"
                          onClick={() => setDeleteTarget(c)}
                          title="Archive Course"
                        >
                          <i className="feather-trash-2" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="row g-3">
            {pager.slice.map((c) => (
              <div className="col-md-6 col-xl-4" key={c.id}>
                <div className="card h-100 border border-light-subtle shadow-sm rounded-3 overflow-hidden">
                  <div style={{ position: 'relative', height: 140, background: '#f8fafc' }}>
                    <img
                      src={c.courseimage || `/assets/img/course/thumbnails/course-2-cs101.svg`}
                      alt={c.fullname}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <span
                      className="badge bg-dark position-absolute top-0 start-0 m-2 px-2 py-1"
                      style={{ fontSize: 11 }}
                    >
                      {c.shortname}
                    </span>
                    <span
                      className="badge bg-primary position-absolute top-0 end-0 m-2 px-2 py-1"
                      style={{ fontSize: 11 }}
                    >
                      {c.status || 'Published'}
                    </span>
                  </div>
                  <div className="card-body p-3 d-flex flex-column justify-content-between">
                    <div>
                      <small className="text-muted d-block mb-1">{c.categoryName}</small>
                      <h6 className="fw-bold text-dark mb-2" style={{ fontSize: 14, minHeight: 40 }}>
                        {c.fullname}
                      </h6>
                      <div className="d-flex justify-content-between text-muted small mb-2">
                        <span>
                          <i className="feather-users me-1 text-primary" />
                          {c.enrolledusercount} Scholars
                        </span>
                        <span>
                          <i className="feather-clock me-1 text-info" />
                          {c.durationHours}
                        </span>
                      </div>
                    </div>
                    <div className="pt-2 border-top d-flex align-items-center justify-content-between">
                      <span className="fw-bold text-primary">{c.price}</span>
                      <div className="d-flex gap-1">
                        <button
                          type="button"
                          className="ins-action-btn is-edit"
                          onClick={() => openEdit(c)}
                          title="Edit Course"
                        >
                          <i className="feather-edit-2" />
                        </button>
                        <button
                          type="button"
                          className="ins-action-btn is-delete"
                          onClick={() => setDeleteTarget(c)}
                          title="Archive Course"
                        >
                          <i className="feather-trash-2" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className="mt-4">
          <Pagination
            page={pager.page}
            pageSize={PAGE_SIZE}
            total={filtered.length}
            onChange={pager.setPage}
            noun="courses"
          />
        </div>
      </SectionCard>

      {/* Modal: Create Course */}
      <Modal
        open={createOpen}
        title="Register New Academic Course"
        subtitle="Open University of Tanzania Faculty Curriculum Registry"
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreate}
        submitLabel="Register Course"
        submitting={submitting}
      >
        <div className="row g-3">
          <div className="col-md-8">
            <label className="form-label fw-semibold" style={{ fontSize: 12 }}>
              Course Full Title *
            </label>
            <input
              type="text"
              className="form-control form-control-sm"
              value={formData.fullname}
              placeholder="e.g. Advanced Operating Systems & Virtualization"
              onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
              required
            />
          </div>
          <div className="col-md-4">
            <label className="form-label fw-semibold" style={{ fontSize: 12 }}>
              Course Code *
            </label>
            <input
              type="text"
              className="form-control form-control-sm"
              value={formData.shortname}
              placeholder="e.g. CS305"
              onChange={(e) => setFormData({ ...formData, shortname: e.target.value })}
              required
            />
          </div>
          <div className="col-12">
            <label className="form-label fw-semibold" style={{ fontSize: 12 }}>
              Faculty / Department
            </label>
            <select
              className="form-select form-select-sm"
              value={formData.categoryName}
              onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
            >
              <option value="Faculty of Science, Technology & Environmental Studies">
                Faculty of Science, Technology & Environmental Studies
              </option>
              <option value="Faculty of Business Management">Faculty of Business Management</option>
              <option value="Faculty of Education">Faculty of Education</option>
              <option value="Faculty of Law">Faculty of Law</option>
            </select>
          </div>
          <div className="col-12">
            <label className="form-label fw-semibold" style={{ fontSize: 12 }}>
              Curriculum Summary / Description
            </label>
            <textarea
              className="form-control form-control-sm"
              rows={3}
              value={formData.summary}
              placeholder="Outline learning outcomes, prerequisites, and syllabus..."
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
            />
          </div>
          <div className="col-md-4">
            <label className="form-label fw-semibold" style={{ fontSize: 12 }}>
              Tuition Fee
            </label>
            <input
              type="text"
              className="form-control form-control-sm"
              value={formData.price}
              placeholder="e.g. TZS 180,000"
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            />
          </div>
          <div className="col-md-4">
            <label className="form-label fw-semibold" style={{ fontSize: 12 }}>
              Duration
            </label>
            <input
              type="text"
              className="form-control form-control-sm"
              value={formData.durationHours}
              placeholder="e.g. 05:00:00 Hours"
              onChange={(e) => setFormData({ ...formData, durationHours: e.target.value })}
            />
          </div>
          <div className="col-md-4">
            <label className="form-label fw-semibold" style={{ fontSize: 12 }}>
              Lessons Count
            </label>
            <input
              type="number"
              className="form-control form-control-sm"
              value={formData.lessonsCount}
              onChange={(e) => setFormData({ ...formData, lessonsCount: parseInt(e.target.value) || 6 })}
            />
          </div>
        </div>
      </Modal>

      {/* Modal: Edit Course */}
      <Modal
        open={!!editTarget}
        title={`Edit ${editTarget?.shortname || 'Course'}`}
        subtitle="Update course syllabus and metadata"
        onClose={() => setEditTarget(null)}
        onSubmit={handleUpdate}
        submitLabel="Save Changes"
        submitting={submitting}
      >
        <div className="row g-3">
          <div className="col-md-8">
            <label className="form-label fw-semibold" style={{ fontSize: 12 }}>
              Course Full Title
            </label>
            <input
              type="text"
              className="form-control form-control-sm"
              value={formData.fullname}
              onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
              required
            />
          </div>
          <div className="col-md-4">
            <label className="form-label fw-semibold" style={{ fontSize: 12 }}>
              Course Code
            </label>
            <input
              type="text"
              className="form-control form-control-sm"
              value={formData.shortname}
              onChange={(e) => setFormData({ ...formData, shortname: e.target.value })}
              required
            />
          </div>
          <div className="col-12">
            <label className="form-label fw-semibold" style={{ fontSize: 12 }}>
              Faculty / Department
            </label>
            <input
              type="text"
              className="form-control form-control-sm"
              value={formData.categoryName}
              onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
            />
          </div>
          <div className="col-12">
            <label className="form-label fw-semibold" style={{ fontSize: 12 }}>
              Summary
            </label>
            <textarea
              className="form-control form-control-sm"
              rows={3}
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
            />
          </div>
          <div className="col-md-6">
            <label className="form-label fw-semibold" style={{ fontSize: 12 }}>
              Tuition Fee
            </label>
            <input
              type="text"
              className="form-control form-control-sm"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            />
          </div>
        </div>
      </Modal>

      {/* Modal: Delete Confirmation */}
      <Modal
        open={!!deleteTarget}
        title="Confirm Course Archive"
        subtitle="This action will remove the course from the faculty active roster"
        onClose={() => setDeleteTarget(null)}
        onSubmit={handleDelete}
        submitLabel="Archive Course"
        submitting={submitting}
      >
        <p className="text-muted mb-0" style={{ fontSize: 13 }}>
          Are you sure you want to archive <strong>{deleteTarget?.shortname}: {deleteTarget?.fullname}</strong>?
          Enrolled scholars will preserve their historical transcripts in the Moodle repository.
        </p>
      </Modal>
    </div>
  );
};

export default InstructorCourse;
