import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ReactApexChart from 'react-apexcharts';
import { all_routes } from '../../router/all_routes';
import { instructorService, InstructorCourseItem, RecentSubmissionItem } from '../../../core/api/instructorService';
import { adminService } from '../../../core/api/adminService';
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

const gradeNum = (c: InstructorCourseItem) =>
  Number((c as any).averageGradeNum ?? parseFloat(String(c.averageGrade || '0'))) || 0;

/**
 * Instructor Teaching Dashboard — content only.
 * Rendered inside <InstructorLayout /> which provides the sidebar, header and live data.
 */
const InstructorDashboard: React.FC = () => {
  const shell = useInstructorShell();
  const navigate = useNavigate();

  const loading = shell?.loading ?? true;
  const instructor = shell?.instructor;
  const stats = shell?.stats;
  const courses = useMemo(() => shell?.courses ?? [], [shell?.courses]);
  const submissions = useMemo(() => shell?.submissions ?? [], [shell?.submissions]);
  const notify = shell?.notify ?? ((m: string) => window.alert(m));

  /* ---------- Courses table state ---------- */
  const [courseSearch, setCourseSearch] = useState('');
  const [faculty, setFaculty] = useState('all');

  const faculties = useMemo(
    () => Array.from(new Set(courses.map((c) => c.categoryName).filter(Boolean))) as string[],
    [courses]
  );

  const filteredCourses = useMemo(() => {
    const q = courseSearch.trim().toLowerCase();
    return courses.filter(
      (c) =>
        (faculty === 'all' || c.categoryName === faculty) &&
        (!q ||
          c.fullname.toLowerCase().includes(q) ||
          c.shortname.toLowerCase().includes(q) ||
          (c.categoryName || '').toLowerCase().includes(q))
    );
  }, [courses, faculty, courseSearch]);
  const coursePager = usePaged(filteredCourses, PAGE_SIZE, [courseSearch, faculty]);

  /* ---------- Submissions table state ---------- */
  const [subSearch, setSubSearch] = useState('');
  const [subFilter, setSubFilter] = useState('all');

  const pendingList = useMemo(() => submissions.filter((s) => s.status === 'Pending Review'), [submissions]);
  const filteredSubs = useMemo(() => {
    const q = subSearch.trim().toLowerCase();
    return submissions.filter(
      (s) =>
        (subFilter === 'all' ||
          (subFilter === 'pending' && s.status === 'Pending Review') ||
          (subFilter === 'graded' && s.status === 'Graded')) &&
        (!q ||
          s.studentName.toLowerCase().includes(q) ||
          s.assessmentName.toLowerCase().includes(q) ||
          s.courseCode.toLowerCase().includes(q))
    );
  }, [submissions, subFilter, subSearch]);
  const subPager = usePaged(filteredSubs, PAGE_SIZE, [subSearch, subFilter]);

  /* ---------- Grade modal ---------- */
  const [gradeTarget, setGradeTarget] = useState<RecentSubmissionItem | null>(null);
  const [gradeScore, setGradeScore] = useState(85);
  const [gradeFeedback, setGradeFeedback] = useState('');
  const [grading, setGrading] = useState(false);

  const openGrade = (s: RecentSubmissionItem) => {
    setGradeTarget(s);
    setGradeScore(s.score > 0 ? s.score : 85);
    setGradeFeedback(s.status === 'Graded' ? s.feedback : '');
  };

  const saveGrade = async () => {
    if (!gradeTarget || !shell) return;
    setGrading(true);
    try {
      const res = await instructorService.saveSubmissionGrade({
        studentId: gradeTarget.studentId || 0,
        courseId: gradeTarget.courseId || 0,
        score: Number(gradeScore),
        feedback: gradeFeedback,
      });
      if (!res.success) {
        notify(res.message || 'Failed to save grade.');
        return;
      }
      const wasPending = gradeTarget.status === 'Pending Review';
      shell.setSubmissions((prev) =>
        prev.map((s) =>
          s.id === gradeTarget.id
            ? { ...s, score: Number(gradeScore), percentage: Number(gradeScore), status: 'Graded', feedback: gradeFeedback, submittedAt: 'Just now' }
            : s
        )
      );
      if (wasPending) {
        shell.setStats((p) => ({ ...p, pendingSubmissions: Math.max(0, p.pendingSubmissions - 1) }));
      }
      notify(`Grade ${gradeScore}% saved to Moodle Gradebook for ${gradeTarget.studentName}.`);
      setGradeTarget(null);
    } finally {
      setGrading(false);
    }
  };

  /* ---------- Announcement modal ---------- */
  const [annOpen, setAnnOpen] = useState(false);
  const [annCourse, setAnnCourse] = useState<number>(0);
  const [annTitle, setAnnTitle] = useState('');
  const [annBody, setAnnBody] = useState('');
  const [annPriority, setAnnPriority] = useState<'Normal' | 'High'>('Normal');
  const [annSaving, setAnnSaving] = useState(false);

  const openAnnouncement = () => {
    setAnnCourse(courses[0]?.id || 0);
    setAnnOpen(true);
  };

  const postAnnouncement = async () => {
    if (!annTitle.trim()) return;
    setAnnSaving(true);
    try {
      const res = await instructorService.createAnnouncement({
        courseId: annCourse,
        title: annTitle,
        content: annBody,
        priority: annPriority,
      });
      notify(res.success ? 'Announcement broadcast to enrolled scholars.' : res.message);
      if (res.success) {
        setAnnOpen(false);
        setAnnTitle('');
        setAnnBody('');
      }
    } finally {
      setAnnSaving(false);
    }
  };

  /* ---------- Edit course modal ---------- */
  const [editCourse, setEditCourse] = useState<InstructorCourseItem | null>(null);
  const [editName, setEditName] = useState('');
  const [editCode, setEditCode] = useState('');
  const [editSummary, setEditSummary] = useState('');
  const [editSaving, setEditSaving] = useState(false);

  const openEdit = (c: InstructorCourseItem) => {
    navigate(`${all_routes.addNewCourse}?courseid=${c.id}`);
  };

  const saveCourse = async () => {
    if (!editCourse || !shell) return;
    setEditSaving(true);
    try {
      const res: any = await adminService.updateCourseSettings(editCourse.id, {
        fullname: editName,
        shortname: editCode,
        summary: editSummary,
      });
      if (res?.success === false) {
        notify(res.error || 'Failed to update course.');
        return;
      }
      shell.setCourses((prev) =>
        prev.map((c) => (c.id === editCourse.id ? { ...c, fullname: editName, shortname: editCode, summary: editSummary } : c))
      );
      notify(`Course ${editCode} updated.`);
      setEditCourse(null);
    } catch (e: any) {
      notify(e?.message || 'Failed to update course.');
    } finally {
      setEditSaving(false);
    }
  };

  /* ---------- New course modal ---------- */
  const [newOpen, setNewOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newCategory, setNewCategory] = useState<number>(0);
  const [newFee, setNewFee] = useState<number>(0);
  const [newSaving, setNewSaving] = useState(false);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    if (!newOpen || categories.length) return;
    adminService
      .getCourses()
      .then((r: any) => {
        const list = (r?.categories || []).map((c: any) => ({ id: Number(c.id), name: c.name }));
        setCategories(list);
        if (list.length) setNewCategory(list[0].id);
      })
      .catch(() => setCategories([]));
  }, [newOpen, categories.length]);

  const createCourse = async () => {
    if (!newName.trim() || !newCode.trim() || !shell) return;
    setNewSaving(true);
    try {
      const res: any = await adminService.createCourse({
        fullname: newName,
        shortname: newCode,
        category_id: newCategory || undefined,
        tuition_fee: newFee || undefined,
        summary: `Course proposed by ${instructor?.fullname || 'faculty'}`,
      });
      if (!res?.success) {
        notify(res?.error || 'Failed to create course.');
        return;
      }
      notify(`Course ${newCode} created in Moodle.`);
      setNewOpen(false);
      setNewName('');
      setNewCode('');
      await shell.reload();
    } catch (e: any) {
      notify(e?.message || 'Failed to create course.');
    } finally {
      setNewSaving(false);
    }
  };

  /* ---------- Chart ---------- */
  const chart = useMemo(
    () => ({
      options: {
        chart: { type: 'bar' as const, toolbar: { show: false }, fontFamily: 'inherit' },
        plotOptions: { bar: { borderRadius: 6, columnWidth: '42%' } },
        colors: ['#013BA6', '#228DDD'],
        xaxis: {
          categories: courses.map((c) => c.shortname),
          labels: { style: { colors: '#475569', fontSize: '11px', fontWeight: 600 } },
        },
        yaxis: { max: 100, labels: { formatter: (v: number) => `${Math.round(v)}%`, style: { colors: '#94a3b8', fontSize: '11px' } } },
        grid: { borderColor: '#f1f5f9', strokeDashArray: 3 },
        dataLabels: { enabled: false },
        legend: { position: 'top' as const, horizontalAlign: 'right' as const, fontSize: '11px' },
        responsive: [{ breakpoint: 576, options: { plotOptions: { bar: { columnWidth: '60%' } }, legend: { position: 'bottom' as const } } }],
      },
      series: [
        { name: 'Average Grade (%)', data: courses.map(gradeNum) },
        { name: 'Completion Rate (%)', data: courses.map((c) => Number(c.completionRate || 0)) },
      ],
    }),
    [courses]
  );

  const firstName = (instructor?.fullname || '').split(' ').slice(0, 2).join(' ');
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <>
      {/* ---------- Hero ---------- */}
      <div className="ins-hero">
        <div className="min-w-0">
          <h2>
            {greeting}, {firstName || 'Lecturer'} 👋
          </h2>
          <p>
            {instructor?.title}
            {instructor?.department ? ` • ${instructor.department}` : ''}
          </p>
        </div>
        <div className="d-flex flex-wrap gap-2">
          <button type="button" className="ins-btn ins-btn-ghost" onClick={openAnnouncement} disabled={!courses.length}>
            <i className="feather-volume-2" /> Broadcast
          </button>
          <button type="button" className="ins-btn ins-btn-accent" onClick={() => navigate(all_routes.addNewCourse)}>
            <i className="feather-plus" /> New Course (Full Wizard)
          </button>
        </div>
      </div>

      {/* ---------- KPIs ---------- */}
      <KpiGrid>
        <KpiCard
          label="Directed Courses"
          value={loading ? '—' : stats?.totalCourses ?? 0}
          unit="courses"
          icon="isax isax-book-1"
          tone="primary"
          hint={<><i className="feather-check-circle me-1" />All published in Moodle</>}
          onClick={() => navigate(all_routes.instructorCourse)}
        />
        <KpiCard
          label="Enrolled Students"
          value={loading ? '—' : stats?.totalStudents ?? 0}
          unit="scholars"
          icon="isax isax-profile-2user"
          tone="info"
          hint={`Across ${stats?.facultyCount ?? faculties.length} faculty departments`}
          onClick={() => navigate(all_routes.studentsList)}
        />
        <KpiCard
          label="Pending Reviews"
          value={loading ? '—' : stats?.pendingSubmissions ?? 0}
          unit="submissions"
          icon="isax isax-task-square"
          tone="warning"
          hint="Requires rubric evaluation"
          onClick={() => navigate(all_routes.instructorAssignment)}
        />
        <KpiCard
          label="Average Class Mark"
          value={loading ? '—' : stats?.averageClassMark || '—'}
          icon="isax isax-ranking"
          tone="success"
          hint="High academic standing"
          onClick={() => navigate(all_routes.instructorQuizResult)}
        />
        <KpiCard
          label="Instructor Rating"
          value={loading ? '—' : stats?.averageRating || '—'}
          icon="isax isax-star1"
          tone="violet"
          hint="Dean's teaching commendation"
        />
        <KpiCard
          label="Certificates"
          value={loading ? '—' : stats?.conferredCertificates ?? 0}
          unit="conferred"
          icon="isax isax-award"
          tone="dark"
          hint="OUT academic verified"
          onClick={() => navigate(all_routes.instructorCertificate)}
        />
      </KpiGrid>

      {/* ---------- Analytics + Grading queue ---------- */}
      <div className="ins-split">
        <SectionCard
          title="Course Performance & Completion"
          subtitle="Average grade and curriculum completion per directed course"
          actions={<span className="ins-chip ins-chip-neutral"><i className="isax isax-chart-2 me-1" />Moodle Analytics</span>}
        >
          {loading ? (
            <LoadingState text="Loading analytics..." />
          ) : courses.length ? (
            <ReactApexChart options={chart.options} series={chart.series} type="bar" height={280} />
          ) : (
            <EmptyState text="No directed courses yet." />
          )}
        </SectionCard>

        <SectionCard
          title="Grading Queue"
          subtitle={`${pendingList.length} awaiting your review`}
          actions={
            <Link to={all_routes.instructorAssignment} className="ins-btn ins-btn-ghost ins-btn-sm">
              View all
            </Link>
          }
        >
          {loading ? (
            <LoadingState />
          ) : pendingList.length === 0 ? (
            <EmptyState icon="feather-check-circle" text="All caught up — no pending submissions." />
          ) : (
            <div className="d-flex flex-column gap-2">
              {pendingList.slice(0, 4).map((s) => (
                <div key={s.id} className="d-flex align-items-center gap-2 p-2 rounded-3 border" style={{ borderColor: '#f1f5f9' }}>
                  <img src={s.studentAvatar || '/assets/img/user/user-02.jpg'} alt="" className="rounded-circle" style={{ width: 34, height: 34, objectFit: 'cover' }} />
                  <div className="min-w-0 flex-grow-1">
                    <strong className="d-block text-dark text-truncate" style={{ fontSize: 12.5 }}>{s.studentName}</strong>
                    <small className="d-block text-muted text-truncate" style={{ fontSize: 11 }}>{s.courseCode} • {s.assessmentName}</small>
                  </div>
                  <button type="button" className="ins-btn ins-btn-warn ins-btn-sm" onClick={() => openGrade(s)}>
                    Grade
                  </button>
                </div>
              ))}
            </div>
          )}

          {!loading && courses.length > 0 && (
            <div className="mt-3 pt-3 border-top">
              <div className="text-muted fw-semibold mb-2" style={{ fontSize: 11.5 }}>Completion by course</div>
              {courses.slice(0, 4).map((c) => (
                <div key={c.id} className="mb-2">
                  <div className="d-flex justify-content-between" style={{ fontSize: 11.5 }}>
                    <span className="fw-semibold text-dark">{c.shortname}</span>
                    <span className="text-muted">{Number(c.completionRate || 0)}%</span>
                  </div>
                  <div className="ins-progress"><span style={{ width: `${Number(c.completionRate || 0)}%` }} /></div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      {/* ---------- Courses table ---------- */}
      <SectionCard
        title="Assigned Courses & Enrolment"
        subtitle={`Official academic courses directed by ${instructor?.fullname || 'you'}`}
        actions={
          <>
            <button
              type="button"
              className="ins-btn ins-btn-ghost ins-btn-sm"
              disabled={!filteredCourses.length}
              onClick={() =>
                exportToCsv(
                  'out_instructor_courses',
                  filteredCourses.map((c) => ({
                    ID: c.id,
                    Code: c.shortname,
                    Name: c.fullname,
                    Faculty: c.categoryName,
                    Students: c.enrolledusercount,
                    AverageGrade: c.averageGrade,
                    Completion: `${c.completionRate || 0}%`,
                    Status: c.status,
                  }))
                )
              }
            >
              <i className="feather-download" /> Export
            </button>
            <button type="button" className="ins-btn ins-btn-primary ins-btn-sm" onClick={() => navigate(all_routes.addNewCourse)}>
              <i className="feather-plus" /> New Course
            </button>
          </>
        }
      >
        <div className="ins-toolbar">
          <FilterPills
            value={faculty}
            onChange={setFaculty}
            options={[
              { value: 'all', label: 'All Faculties', count: courses.length },
              ...faculties.map((f) => ({ value: f, label: f, count: courses.filter((c) => c.categoryName === f).length })),
            ]}
          />
          <SearchInput value={courseSearch} onChange={setCourseSearch} placeholder="Search courses..." />
        </div>

        {loading ? (
          <LoadingState text="Loading directed courses from Moodle..." />
        ) : filteredCourses.length === 0 ? (
          <EmptyState text="No courses match your filters." />
        ) : (
          <>
            <div className="ins-table-wrap">
              <table className="ins-table">
                <thead>
                  <tr>
                    <th>Course</th>
                    <th>Faculty / Code</th>
                    <th>Scholars</th>
                    <th>Avg. Grade</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {coursePager.slice.map((c) => (
                    <tr key={c.id}>
                      <td className="ins-td-main">
                        <div className="ins-cell-main">
                          <img src={c.courseimage || c.image} alt="" className="rounded-3 border" style={{ width: 44, height: 44 }} />
                          <div className="min-w-0">
                            <Link to={`${all_routes.courseWatch}?courseId=${c.id}`} className="ins-cell-title" title={c.fullname}>
                              {c.fullname}
                            </Link>
                            <span className="ins-cell-sub">
                              {(c as any).modulesCount ?? c.lessonsCount} modules • {c.quizzesCount} assessment{c.quizzesCount === 1 ? '' : 's'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td data-label="Faculty">
                        <div className="text-end text-md-start">
                          <span className="ins-chip ins-chip-neutral">{c.shortname}</span>
                          <span className="ins-cell-sub mt-1">{c.categoryName}</span>
                        </div>
                      </td>
                      <td data-label="Scholars">
                        <span className="fw-semibold text-dark"><i className="isax isax-profile-2user text-muted me-1" />{c.enrolledusercount}</span>
                      </td>
                      <td data-label="Avg. Grade"><span className="fw-bold text-success">{c.averageGrade}</span></td>
                      <td data-label="Status"><span className="ins-chip ins-chip-success">{c.status}</span></td>
                      <td data-label="Actions" className="text-end">
                        <div className="d-inline-flex gap-1">
                          <Link to={`${all_routes.courseWatch}?courseId=${c.id}`} className="ins-btn ins-btn-accent ins-btn-sm">
                            Classroom
                          </Link>
                          <button type="button" className="ins-action-btn is-edit" onClick={() => openEdit(c)} title="Edit course">
                            <i className="feather-edit-2" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={coursePager.page} pageSize={PAGE_SIZE} total={filteredCourses.length} onChange={coursePager.setPage} noun="courses" />
          </>
        )}
      </SectionCard>

      {/* ---------- Submissions table ---------- */}
      <SectionCard
        title="Recent Submissions & Grading Oversight"
        subtitle="Assessment attempts and lab deliverables submitted for your review"
        actions={
          <>
            <span className="ins-chip ins-chip-warning">{stats?.pendingSubmissions ?? 0} awaiting review</span>
            <button
              type="button"
              className="ins-btn ins-btn-ghost ins-btn-sm"
              disabled={!filteredSubs.length}
              onClick={() =>
                exportToCsv(
                  'out_instructor_submissions',
                  filteredSubs.map((s) => ({
                    ID: s.id,
                    Student: s.studentName,
                    Course: s.courseCode,
                    Assessment: s.assessmentName,
                    Score: s.status === 'Graded' ? s.score : '',
                    Status: s.status,
                    Submitted: s.submittedAt,
                    Feedback: s.feedback,
                  }))
                )
              }
            >
              <i className="feather-download" /> Export
            </button>
          </>
        }
      >
        <div className="ins-toolbar">
          <FilterPills
            value={subFilter}
            onChange={setSubFilter}
            options={[
              { value: 'all', label: 'All', count: submissions.length },
              { value: 'pending', label: 'Pending Review', count: pendingList.length },
              { value: 'graded', label: 'Graded', count: submissions.length - pendingList.length },
            ]}
          />
          <SearchInput value={subSearch} onChange={setSubSearch} placeholder="Search submissions..." />
        </div>

        {loading ? (
          <LoadingState text="Loading submissions from Moodle..." />
        ) : filteredSubs.length === 0 ? (
          <EmptyState text="No submissions match your filters." />
        ) : (
          <>
            <div className="ins-table-wrap">
              <table className="ins-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Course</th>
                    <th>Assessment</th>
                    <th>Score</th>
                    <th>Status</th>
                    <th>Submitted</th>
                    <th className="text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {subPager.slice.map((s) => (
                    <tr key={s.id}>
                      <td className="ins-td-main">
                        <div className="ins-cell-main">
                          <img src={s.studentAvatar || '/assets/img/user/user-02.jpg'} alt="" className="rounded-circle border" style={{ width: 34, height: 34 }} />
                          <div className="min-w-0">
                            <span className="ins-cell-title">{s.studentName}</span>
                            <span className="ins-cell-sub">{s.id}</span>
                          </div>
                        </div>
                      </td>
                      <td data-label="Course"><span className="ins-chip ins-chip-neutral">{s.courseCode}</span></td>
                      <td data-label="Assessment">
                        <div className="min-w-0 text-end text-md-start">
                          <span className="ins-cell-title fw-semibold" style={{ fontWeight: 600 }}>{s.assessmentName}</span>
                          <span className="ins-cell-sub">{s.feedback}</span>
                        </div>
                      </td>
                      <td data-label="Score">
                        {s.status === 'Graded' ? (
                          <span className="fw-bold text-success">{s.score}%</span>
                        ) : (
                          <span className="text-muted fst-italic">Unmarked</span>
                        )}
                      </td>
                      <td data-label="Status">
                        <span className={`ins-chip ${s.status === 'Graded' ? 'ins-chip-success' : 'ins-chip-warning'}`}>{s.status}</span>
                      </td>
                      <td data-label="Submitted" className="text-muted text-nowrap">{s.submittedAt}</td>
                      <td data-label="Action" className="text-end">
                        <button
                          type="button"
                          className={`ins-btn ins-btn-sm ${s.status === 'Pending Review' ? 'ins-btn-warn' : 'ins-btn-ghost'}`}
                          onClick={() => openGrade(s)}
                        >
                          {s.status === 'Pending Review' ? 'Review & Grade' : 'Re-grade'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={subPager.page} pageSize={PAGE_SIZE} total={filteredSubs.length} onChange={subPager.setPage} noun="submissions" />
          </>
        )}
      </SectionCard>

      {/* ---------- Modals ---------- */}
      <Modal
        open={!!gradeTarget}
        title="Grade Submission"
        subtitle="Saved directly to the Moodle Gradebook"
        onClose={() => setGradeTarget(null)}
        onSubmit={saveGrade}
        submitting={grading}
        submitLabel="Save to Gradebook"
      >
        {gradeTarget && (
          <>
            <div className="p-3 rounded-3 mb-3" style={{ background: '#f8fafc', border: '1px solid #edf1f7' }}>
              <div className="d-flex justify-content-between align-items-center mb-1">
                <strong className="text-dark" style={{ fontSize: 13 }}>{gradeTarget.studentName}</strong>
                <span className="ins-chip ins-chip-neutral">{gradeTarget.courseCode}</span>
              </div>
              <small className="text-muted">{gradeTarget.assessmentName}</small>
            </div>
            <label className="d-block">Score (%)</label>
            <div className="d-flex align-items-center gap-3 mb-3">
              <input type="range" min={0} max={100} value={gradeScore} onChange={(e) => setGradeScore(Number(e.target.value))} className="form-range flex-grow-1" />
              <input type="number" min={0} max={100} required value={gradeScore} onChange={(e) => setGradeScore(Number(e.target.value))} className="form-control form-control-sm fw-bold" style={{ width: 80 }} />
            </div>
            <label className="d-block">Rubric feedback</label>
            <textarea rows={3} required className="form-control form-control-sm" value={gradeFeedback} onChange={(e) => setGradeFeedback(e.target.value)} placeholder="Constructive feedback for the scholar..." />
          </>
        )}
      </Modal>

      <Modal
        open={annOpen}
        title="Broadcast Announcement"
        subtitle="Notify every scholar enrolled in the selected course"
        onClose={() => setAnnOpen(false)}
        onSubmit={postAnnouncement}
        submitting={annSaving}
        submitLabel="Broadcast"
      >
        <label className="d-block">Target course</label>
        <select className="form-select form-select-sm mb-3" value={annCourse} onChange={(e) => setAnnCourse(Number(e.target.value))}>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>{c.shortname} — {c.fullname}</option>
          ))}
        </select>
        <label className="d-block">Headline</label>
        <input required className="form-control form-control-sm mb-3" value={annTitle} onChange={(e) => setAnnTitle(e.target.value)} />
        <label className="d-block">Priority</label>
        <select className="form-select form-select-sm mb-3" value={annPriority} onChange={(e) => setAnnPriority(e.target.value as 'Normal' | 'High')}>
          <option value="Normal">Normal</option>
          <option value="High">High (urgent)</option>
        </select>
        <label className="d-block">Message</label>
        <textarea rows={3} className="form-control form-control-sm" value={annBody} onChange={(e) => setAnnBody(e.target.value)} />
      </Modal>

      <Modal
        open={!!editCourse}
        title="Edit Course Settings"
        subtitle={editCourse ? `Moodle course ID ${editCourse.id}` : ''}
        onClose={() => setEditCourse(null)}
        onSubmit={saveCourse}
        submitting={editSaving}
      >
        <label className="d-block">Full name</label>
        <input required className="form-control form-control-sm mb-3" value={editName} onChange={(e) => setEditName(e.target.value)} />
        <label className="d-block">Short code</label>
        <input required className="form-control form-control-sm mb-3" value={editCode} onChange={(e) => setEditCode(e.target.value)} />
        <label className="d-block">Summary</label>
        <textarea rows={3} className="form-control form-control-sm" value={editSummary} onChange={(e) => setEditSummary(e.target.value)} />
      </Modal>

      <Modal
        open={newOpen}
        title="New Academic Course"
        subtitle="Created live in Moodle"
        onClose={() => setNewOpen(false)}
        onSubmit={createCourse}
        submitting={newSaving}
        submitLabel="Create Course"
      >
        <label className="d-block">Course title</label>
        <input required className="form-control form-control-sm mb-3" value={newName} onChange={(e) => setNewName(e.target.value)} />
        <label className="d-block">Course code</label>
        <input required className="form-control form-control-sm mb-3" value={newCode} onChange={(e) => setNewCode(e.target.value)} />
        <label className="d-block">Faculty / category</label>
        <select className="form-select form-select-sm mb-3" value={newCategory} onChange={(e) => setNewCategory(Number(e.target.value))}>
          {categories.length === 0 && <option value={0}>Loading categories...</option>}
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <label className="d-block">Tuition fee (TZS)</label>
        <input type="number" min={0} className="form-control form-control-sm" value={newFee} onChange={(e) => setNewFee(Number(e.target.value))} />
      </Modal>
    </>
  );
};

export default InstructorDashboard;
