import React, { useState, useEffect } from "react";
import Breadcrumb from "../../../core/common/Breadcrumb/breadcrumb";
import { Link } from "react-router-dom";
import { all_routes } from "../../router/all_routes";
import StudentSidebar from "../common/studentSidebar";
import ProfileCard from "../common/profileCard";
import { useAuth } from "../../../core/auth/authContext";
import { getMoodleUserId } from "../../../core/api/courseService";
import { quizService, MoodleQuiz, QuizAttempt } from "../../../core/api/quizService";

type QuizFilter = "all" | "pending" | "completed";

interface QuizWithAttempt extends MoodleQuiz {
  courseCode: string;
  courseTitle: string;
  questionCount: number;
  attempts: number;
  latestAttempt?: QuizAttempt | null;
}

const StudentQuiz: React.FC = () => {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState<QuizWithAttempt[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<QuizFilter>("all");

  useEffect(() => {
    let isMounted = true;
    const fetchQuizzesAndAttempts = async () => {
      setLoading(true);
      setError(null);
      try {
        const uid = getMoodleUserId(user);
        const moodleQuizzes = await quizService.getQuizzesByCourses([2, 3, 4]);

        const courseDetails: Record<number, { code: string; title: string }> = {
          2: { code: "CS101", title: "Data Structures & Algorithms in Python" },
          3: { code: "CS202", title: "Cloud Computing & Distributed Systems" },
          4: { code: "BBA301", title: "Financial Management & Strategic Planning" },
        };

        const enriched: QuizWithAttempt[] = await Promise.all(
          moodleQuizzes.map(async (q) => {
            const userAttempts = await quizService.getUserAttempts(q.id, uid);
            const latest = userAttempts.length > 0 ? userAttempts[userAttempts.length - 1] : null;
            const qCount = quizService.getQuestionsForQuiz(q.id).length;

            return {
              ...q,
              courseCode: courseDetails[q.course]?.code || `Course ${q.course}`,
              courseTitle: courseDetails[q.course]?.title || "Open University of Tanzania",
              questionCount: qCount,
              latestAttempt: latest,
            };
          })
        );

        if (isMounted) {
          setQuizzes(enriched);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err?.message || "Failed to load quizzes from Moodle");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchQuizzesAndAttempts();
    return () => {
      isMounted = false;
    };
  }, [user]);

  const allCount = quizzes.length;
  const completedCount = quizzes.filter((q) => Boolean(q.latestAttempt)).length;
  const pendingCount = quizzes.filter((q) => !q.latestAttempt).length;

  const filteredQuizzes = quizzes.filter((q) => {
    if (activeTab === "pending") return !q.latestAttempt;
    if (activeTab === "completed") return Boolean(q.latestAttempt);
    return true;
  });

  const formatDuration = (seconds: number) => {
    if (!seconds) return "No time limit";
    const mins = Math.floor(seconds / 60);
    return `${mins} Mins`;
  };

  return (
    <>
      <Breadcrumb title="My Quiz Assessments" />

      <div className="content">
        <div className="container">
          {/* Student Profile Header Box */}
          <ProfileCard />

          <div className="row">
            {/* Student Left Sidebar */}
            <StudentSidebar />

            {/* Main Quiz Content */}
            <div className="col-lg-9">
              {/* Header Box & Tabs */}
              <div className="card border-0 shadow-sm mb-4">
                <div className="card-body p-4">
                  <div className="d-flex flex-wrap gap-3 align-items-center justify-content-between mb-3 pb-3 border-bottom">
                    <div>
                      <h4 className="fs-20 fw-bold mb-1 text-dark">Knowledge Checks & Quizzes</h4>
                      <p className="text-muted small mb-0">
                        Interactive academic assessments powered by Moodle 5.x Web Services.
                      </p>
                    </div>

                    <div className="badge bg-primary-subtle text-primary border border-primary px-3 py-2">
                      <i className="isax isax-task me-1" />
                      Moodle Assessment Engine
                    </div>
                  </div>

                  {/* Filter Pills */}
                  <div className="d-flex flex-wrap gap-2 align-items-center justify-content-between">
                    <ul className="nav nav-pills gap-2" role="tablist">
                      <li className="nav-item" role="presentation">
                        <button
                          type="button"
                          className={`nav-link rounded-pill px-3 py-2 small fw-semibold ${
                            activeTab === "all" ? "active bg-primary text-white" : "bg-light text-muted"
                          }`}
                          onClick={() => setActiveTab("all")}
                        >
                          All Quizzes ({allCount})
                        </button>
                      </li>
                      <li className="nav-item" role="presentation">
                        <button
                          type="button"
                          className={`nav-link rounded-pill px-3 py-2 small fw-semibold ${
                            activeTab === "pending" ? "active bg-primary text-white" : "bg-light text-muted"
                          }`}
                          onClick={() => setActiveTab("pending")}
                        >
                          Pending / Ready ({pendingCount})
                        </button>
                      </li>
                      <li className="nav-item" role="presentation">
                        <button
                          type="button"
                          className={`nav-link rounded-pill px-3 py-2 small fw-semibold ${
                            activeTab === "completed" ? "active bg-primary text-white" : "bg-light text-muted"
                          }`}
                          onClick={() => setActiveTab("completed")}
                        >
                          Completed / Attempted ({completedCount})
                        </button>
                      </li>
                    </ul>

                    <span className="text-muted small">
                      Showing <strong>{filteredQuizzes.length}</strong> of {quizzes.length} assessments
                    </span>
                  </div>
                </div>
              </div>

              {/* Quiz Items Container */}
              {loading ? (
                <div className="text-center py-5 bg-white rounded-3 shadow-sm mb-4">
                  <div className="spinner-border text-primary mb-3" role="status" />
                  <p className="text-muted small mb-0">Loading course quizzes from Moodle...</p>
                </div>
              ) : error ? (
                <div className="alert alert-danger mb-4" role="alert">
                  <i className="isax isax-danger me-2" />
                  {error}
                </div>
              ) : filteredQuizzes.length === 0 ? (
                <div className="text-center py-5 bg-white rounded-3 shadow-sm mb-4">
                  <i className="isax isax-task fs-32 text-muted mb-2 d-block" />
                  <h6 className="fw-bold text-dark">No Quizzes in this Category</h6>
                  <p className="text-muted small mb-3">
                    {activeTab === "completed"
                      ? "You haven't attempted any quizzes yet. Choose a pending quiz below to begin."
                      : "All quizzes in your enrolled courses have been completed."}
                  </p>
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm rounded-pill px-4"
                    onClick={() => setActiveTab("all")}
                  >
                    View All Quizzes
                  </button>
                </div>
              ) : (
                <div className="d-flex flex-column gap-3 mb-4">
                  {filteredQuizzes.map((quiz) => {
                    const hasAttempt = Boolean(quiz.latestAttempt);
                    const score = quiz.latestAttempt?.sumgrades ?? 0;
                    const passed = score >= 70;

                    return (
                      <div
                        key={quiz.id}
                        className="card border shadow-sm rounded-3 overflow-hidden transition-all"
                      >
                        <div className="card-body p-4">
                          <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3">
                            <div className="flex-grow-1">
                              <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                                <span className="badge bg-primary text-uppercase px-2 py-1">
                                  {quiz.courseCode}
                                </span>
                                <span className="text-muted small fw-medium">
                                  {quiz.courseTitle}
                                </span>
                                {hasAttempt ? (
                                  <span
                                    className={`badge ms-md-2 ${
                                      passed
                                        ? "bg-success-subtle text-success border border-success"
                                        : "bg-danger-subtle text-danger border border-danger"
                                    }`}
                                  >
                                    <i
                                      className={`isax ${
                                        passed ? "isax-tick-circle" : "isax-close-circle"
                                      } me-1`}
                                    />
                                    {score}% Score • {passed ? "Passed" : "Retake Recommended"}
                                  </span>
                                ) : (
                                  <span className="badge bg-warning-subtle text-warning border border-warning ms-md-2">
                                    <i className="isax isax-clock me-1" />
                                    Not Attempted Yet
                                  </span>
                                )}
                              </div>

                              <h5 className="fs-17 fw-bold mb-2">
                                <Link
                                  to={`${all_routes.studentQuizQuestion}?quizId=${quiz.id}`}
                                  className="text-dark text-decoration-none"
                                >
                                  {quiz.name.replace(/&amp;/g, "&")}
                                </Link>
                              </h5>

                              <p className="text-muted small mb-3">
                                {quiz.intro
                                  ? quiz.intro.replace(/<[^>]*>?/gm, "")
                                  : "Mastery check for core course concepts and problem-solving."}
                              </p>

                              <div className="d-flex flex-wrap align-items-center gap-3 text-muted small">
                                <span>
                                  <i className="isax isax-document-text text-primary me-1" />
                                  <strong>{quiz.questionCount}</strong> Questions
                                </span>
                                <span>
                                  <i className="isax isax-timer-1 text-primary me-1" />
                                  Duration: <strong>{formatDuration(quiz.timelimit)}</strong>
                                </span>
                                <span>
                                  <i className="isax isax-award text-primary me-1" />
                                  Pass Mark: <strong>70%</strong>
                                </span>
                                <span>
                                  <i className="isax isax-repeat text-primary me-1" />
                                  Max Attempts: <strong>{quiz.attempts || "Unlimited"}</strong>
                                </span>
                              </div>
                            </div>

                            <div className="flex-shrink-0 text-md-end w-100 w-md-auto pt-3 pt-md-0 border-top border-top-md-0">
                              <Link
                                to={`${all_routes.studentQuizQuestion}?quizId=${quiz.id}`}
                                className={`btn rounded-pill px-4 py-2 d-inline-flex align-items-center gap-2 shadow-sm ${
                                  hasAttempt
                                    ? passed
                                      ? "btn-outline-success"
                                      : "btn-warning text-white"
                                    : "btn-primary"
                                }`}
                              >
                                <span>
                                  {hasAttempt ? (passed ? "Retake / Review" : "Retake Assessment") : "Start Assessment"}
                                </span>
                                <i className="isax isax-arrow-right-3" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StudentQuiz;
