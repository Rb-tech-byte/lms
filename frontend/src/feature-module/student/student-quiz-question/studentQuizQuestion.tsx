import React, { useEffect, useState, useMemo, useCallback } from 'react';
import Breadcrumb from '../../../core/common/Breadcrumb/breadcrumb';
import ProfileCard from '../common/profileCard';
import StudentSidebar from '../common/studentSidebar';
import { Link, useSearchParams } from 'react-router-dom';
import { all_routes } from '../../router/all_routes';
import { useAuth } from '../../../core/auth/authContext';
import { getMoodleUserId } from '../../../core/api/courseService';
import { quizService, QuizAttemptSession, QuizResultSummary } from '../../../core/api/quizService';

const StudentQuizQuestion: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const quizId = Number(searchParams.get('quizId') || 1);

  const [session, setSession] = useState<QuizAttemptSession | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [flagged, setFlagged] = useState<Record<number, boolean>>({});
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [result, setResult] = useState<QuizResultSummary | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Countdown timer state (seconds remaining)
  const [timeLeft, setTimeLeft] = useState<number>(15 * 60);
  const [timerStarted, setTimerStarted] = useState<boolean>(false);

  const startQuiz = useCallback(async () => {
    setResult(null);
    setAnswers({});
    setFlagged({});
    setCurrentIdx(0);
    const uid = getMoodleUserId(user);
    const sess = await quizService.startQuizAttempt(quizId, uid);
    setSession(sess);
    // Allocate 3 minutes per question or minimum 10 minutes
    const allocatedSeconds = Math.max(600, (sess.questions?.length || 5) * 180);
    setTimeLeft(allocatedSeconds);
    setTimerStarted(true);
  }, [quizId, user]);

  useEffect(() => {
    startQuiz();
  }, [startQuiz]);

  const handleSubmit = useCallback(async () => {
    if (!session || submitting) return;
    setSubmitting(true);
    setShowConfirmModal(false);
    try {
      const allocatedSeconds = Math.max(600, (session.questions?.length || 5) * 180);
      const timeSpent = Math.max(1, allocatedSeconds - timeLeft);
      const summary = await quizService.submitQuizAttempt(session, answers, timeSpent);
      setResult(summary);
      setTimerStarted(false);
    } catch (err) {
      console.error('Quiz submission error:', err);
    } finally {
      setSubmitting(false);
    }
  }, [session, submitting, timeLeft, answers]);

  // Countdown timer effect
  useEffect(() => {
    if (!timerStarted || !session || result) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timerStarted, session, result, handleSubmit]);

  const questions = session?.questions || [];
  const currentQ = questions[currentIdx];

  const totalAnswered = useMemo(() => {
    return Object.keys(answers).length;
  }, [answers]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (questionId: number, optionId: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const handleClearAnswer = (questionId: number) => {
    setAnswers((prev) => {
      const copy = { ...prev };
      delete copy[questionId];
      return copy;
    });
  };

  const handleToggleFlag = (questionId: number) => {
    setFlagged((prev) => ({ ...prev, [questionId]: !prev[questionId] }));
  };

  return (
    <>
      <Breadcrumb title="Interactive Moodle Quiz Assessment" />
      <div className="content">
        <div className="container">
          <ProfileCard />
          <div className="row">
            <StudentSidebar />
            <div className="col-lg-9">
              {!session ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary spinner-border-sm me-2" role="status" />
                  <span className="text-muted small">Initializing Moodle assessment session...</span>
                </div>
              ) : result ? (
                /* ========================================================== */
                /* GRADED RESULT VIEW                                         */
                /* ========================================================== */
                <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                  <div
                    className="p-4 text-center text-white"
                    style={{
                      background: result.passed
                        ? 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                        : 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                    }}
                  >
                    <div className="mb-2">
                      <i
                        className={`feather-${result.passed ? 'check-circle' : 'alert-circle'}`}
                        style={{ fontSize: '3rem' }}
                      />
                    </div>
                    <span
                      className="badge rounded-pill px-3 py-1 mb-2 fw-bold"
                      style={{ background: 'rgba(255,255,255,0.2)', fontSize: '0.78rem' }}
                    >
                      {session.courseName}
                    </span>
                    <h3 className="fw-bold mb-1 text-white">{session.quizName}</h3>
                    <p className="small mb-0" style={{ color: 'rgba(255,255,255,0.9)' }}>
                      Attempt Evaluated &amp; Recorded in OUT Official Academic Gradebook
                    </p>
                  </div>

                  <div className="card-body p-4">
                    {/* Score Summary Metrics */}
                    <div className="row g-3 mb-4 text-center">
                      <div className="col-sm-3 col-6">
                        <div className="p-3 bg-light rounded-3 border">
                          <span className="text-muted small d-block mb-1">Score Mark</span>
                          <h4 className="fw-bold text-dark mb-0">{result.percentage}%</h4>
                        </div>
                      </div>
                      <div className="col-sm-3 col-6">
                        <div className="p-3 bg-light rounded-3 border">
                          <span className="text-muted small d-block mb-1">Letter Grade</span>
                          <h4 className="fw-bold text-primary mb-0">{result.letterGrade}</h4>
                        </div>
                      </div>
                      <div className="col-sm-3 col-6">
                        <div className="p-3 bg-light rounded-3 border">
                          <span className="text-muted small d-block mb-1">Accuracy</span>
                          <h4 className="fw-bold text-success mb-0">
                            {result.correctAnswers} / {result.totalQuestions}
                          </h4>
                        </div>
                      </div>
                      <div className="col-sm-3 col-6">
                        <div className="p-3 bg-light rounded-3 border">
                          <span className="text-muted small d-block mb-1">Standing</span>
                          <span
                            className={`badge px-2.5 py-1.5 fw-semibold ${
                              result.passed
                                ? 'bg-success-subtle text-success border border-success'
                                : 'bg-danger-subtle text-danger border border-danger'
                            }`}
                            style={{ fontSize: '0.82rem' }}
                          >
                            {result.passed ? 'PASSED (COMMENDED)' : 'REVISION REQUIRED'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Detailed Question Review Breakdown */}
                    <h5 className="fw-bold text-dark mb-3">Academic Review &amp; Explanations</h5>
                    <div className="d-flex flex-column gap-3 mb-4">
                      {questions.map((q, idx) => {
                        const studentChoiceId = answers[q.id];
                        const studentChoice = q.options.find((o) => o.id === studentChoiceId);
                        const correctOpt = q.options.find((o) => o.id === q.correctOptionId);
                        const isCorrect = studentChoiceId === q.correctOptionId;

                        return (
                          <div
                            key={q.id}
                            className="p-3 rounded-3 border"
                            style={{
                              background: isCorrect ? '#f0fdf4' : '#fef2f2',
                              borderColor: isCorrect ? '#bbf7d0' : '#fecaca',
                            }}
                          >
                            <div className="d-flex align-items-center justify-content-between mb-2">
                              <span className="fw-bold text-dark fs-14">
                                Question {idx + 1}. {q.question}
                              </span>
                              <span
                                className={`badge px-2 py-1 ${
                                  isCorrect ? 'bg-success text-white' : 'bg-danger text-white'
                                }`}
                                style={{ fontSize: '0.72rem' }}
                              >
                                {isCorrect ? 'Correct' : 'Incorrect'}
                              </span>
                            </div>

                            <div className="small mb-1">
                              <strong>Your Answer:</strong>{' '}
                              <span className={isCorrect ? 'text-success fw-semibold' : 'text-danger fw-semibold'}>
                                {studentChoice ? studentChoice.text : 'No answer submitted'}
                              </span>
                            </div>

                            {!isCorrect && correctOpt && (
                              <div className="small text-success mb-1">
                                <strong>Correct Academic Answer:</strong> {correctOpt.text}
                              </div>
                            )}

                            {q.explanation && (
                              <div
                                className="small mt-2 pt-2 border-top text-muted"
                                style={{ fontSize: '0.78rem', lineHeight: 1.5 }}
                              >
                                <strong className="text-dark">Dean's Feedback:</strong> {q.explanation}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Action Buttons */}
                    <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 pt-3 border-top">
                      <button
                        type="button"
                        onClick={startQuiz}
                        className="btn btn-outline-primary rounded-pill px-4"
                      >
                        <i className="feather-refresh-cw me-1" /> Retake Assessment
                      </button>

                      <div className="d-flex gap-2">
                        <Link
                          to={all_routes.studentQuiz}
                          className="btn btn-primary rounded-pill px-4"
                        >
                          All Assessments
                        </Link>
                        <Link
                          to={all_routes.studentCertificates}
                          className="btn btn-secondary rounded-pill px-4"
                        >
                          Gradebook Transcript
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* ========================================================== */
                /* INTERACTIVE ASSESSMENT PLAYER                              */
                /* ========================================================== */
                <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                  {/* Top Header Bar */}
                  <div className="p-3.5 bg-dark text-white d-flex flex-wrap align-items-center justify-content-between gap-3 border-bottom">
                    <div>
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <span
                          className="badge rounded-pill px-2.5 py-0.5 fw-bold"
                          style={{ background: '#f59e0b', color: '#0f172a', fontSize: '0.7rem' }}
                        >
                          {session.courseName}
                        </span>
                        <span className="small text-light" style={{ fontSize: '0.78rem' }}>
                          Question {currentIdx + 1} of {questions.length}
                        </span>
                      </div>
                      <h5 className="fw-bold text-white mb-0 fs-16">{session.quizName}</h5>
                    </div>

                    {/* Countdown Timer */}
                    <div className="d-flex align-items-center gap-3">
                      <div
                        className={`d-flex align-items-center gap-2 px-3 py-1.5 rounded-pill border fw-bold ${
                          timeLeft <= 60
                            ? 'bg-danger text-white border-danger'
                            : timeLeft <= 300
                            ? 'bg-warning-subtle text-warning border-warning'
                            : 'bg-light text-dark border-light'
                        }`}
                        style={{ fontSize: '0.85rem' }}
                      >
                        <i className="feather-clock" />
                        <span>{formatTime(timeLeft)}</span>
                      </div>

                      <Link
                        to={all_routes.studentQuiz}
                        className="btn btn-sm btn-outline-light rounded-pill px-3"
                        style={{ fontSize: '0.78rem' }}
                      >
                        Exit
                      </Link>
                    </div>
                  </div>

                  <div className="card-body p-4">
                    {/* Question Navigation Matrix Pills */}
                    <div className="d-flex flex-wrap align-items-center gap-2 mb-4 pb-3 border-bottom">
                      <span className="small text-muted fw-semibold me-2" style={{ fontSize: '0.75rem' }}>
                        JUMP TO QUESTION:
                      </span>
                      {questions.map((q, idx) => {
                        const isCurrent = idx === currentIdx;
                        const isAnswered = answers[q.id] !== undefined;
                        const isFlagged = flagged[q.id] === true;

                        return (
                          <button
                            key={q.id}
                            type="button"
                            onClick={() => setCurrentIdx(idx)}
                            className={`btn btn-sm rounded-pill px-3 fw-bold position-relative ${
                              isCurrent
                                ? 'btn-primary text-white'
                                : isAnswered
                                ? 'btn-success text-white'
                                : 'btn-light text-dark border'
                            }`}
                            style={{ fontSize: '0.78rem', minWidth: 38 }}
                          >
                            {idx + 1}
                            {isFlagged && (
                              <span
                                className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-warning text-dark border border-white"
                                style={{ fontSize: '0.55rem', padding: '2px 4px' }}
                              >
                                ★
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Active Question Section */}
                    {currentQ && (
                      <div className="mb-4">
                        <div className="d-flex align-items-center justify-content-between mb-3">
                          <span
                            className="badge bg-primary-subtle text-primary border border-primary-subtle px-2.5 py-1 fw-semibold"
                            style={{ fontSize: '0.78rem' }}
                          >
                            Slot {currentQ.slot || currentIdx + 1} • Continuous Assessment
                          </span>

                          <button
                            type="button"
                            onClick={() => handleToggleFlag(currentQ.id)}
                            className={`btn btn-sm rounded-pill px-3 ${
                              flagged[currentQ.id]
                                ? 'btn-warning text-dark'
                                : 'btn-outline-secondary'
                            }`}
                            style={{ fontSize: '0.76rem' }}
                          >
                            <i className="feather-bookmark me-1" />
                            {flagged[currentQ.id] ? 'Flagged for Review' : 'Flag Question'}
                          </button>
                        </div>

                        <h5 className="fw-semibold text-dark mb-4" style={{ lineHeight: 1.5, fontSize: '1.05rem' }}>
                          {currentIdx + 1}. {currentQ.questionText || currentQ.question}
                        </h5>

                        {/* Options Cards */}
                        <div className="d-flex flex-column gap-2.5 mb-3">
                          {currentQ.options.map((opt, oIdx) => {
                            const isSelected = answers[currentQ.id] === opt.id;
                            const optionLetter = String.fromCharCode(65 + oIdx);

                            return (
                              <div
                                key={opt.id}
                                onClick={() => handleSelectOption(currentQ.id, opt.id)}
                                className={`p-3 rounded-3 border d-flex align-items-center gap-3 cursor-pointer transition ${
                                  isSelected
                                    ? 'bg-primary-subtle border-primary text-dark'
                                    : 'bg-white border-light text-dark hover-light'
                                }`}
                                style={{
                                  cursor: 'pointer',
                                  transition: 'all 0.15s ease-in-out',
                                  boxShadow: isSelected ? '0 0 0 1px #013BA6' : 'none',
                                }}
                              >
                                <div
                                  className={`avatar avatar-xs rounded-circle d-flex align-items-center justify-content-center fw-bold ${
                                    isSelected
                                      ? 'bg-primary text-white'
                                      : 'bg-light text-muted border'
                                  }`}
                                  style={{ width: 28, height: 28, fontSize: '0.8rem' }}
                                >
                                  {optionLetter}
                                </div>
                                <div className="flex-grow-1 fw-medium" style={{ fontSize: '0.9rem' }}>
                                  {opt.text}
                                </div>
                                <input
                                  type="radio"
                                  className="form-check-input mt-0"
                                  checked={isSelected}
                                  onChange={() => handleSelectOption(currentQ.id, opt.id)}
                                  style={{ cursor: 'pointer' }}
                                />
                              </div>
                            );
                          })}
                        </div>

                        {answers[currentQ.id] !== undefined && (
                          <div className="mb-4">
                            <button
                              type="button"
                              onClick={() => handleClearAnswer(currentQ.id)}
                              className="btn btn-sm btn-link text-muted text-decoration-none p-0"
                              style={{ fontSize: '0.78rem' }}
                            >
                              <i className="feather-trash-2 me-1" /> Clear choice
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Bottom Action / Navigation Bar */}
                    <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 pt-3 border-top">
                      <button
                        type="button"
                        onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
                        disabled={currentIdx === 0}
                        className="btn btn-outline-secondary rounded-pill px-4"
                        style={{ fontSize: '0.82rem' }}
                      >
                        <i className="feather-arrow-left me-1" /> Previous
                      </button>

                      <div className="text-muted small" style={{ fontSize: '0.78rem' }}>
                        Answered <strong>{totalAnswered}</strong> of <strong>{questions.length}</strong> questions
                      </div>

                      <div className="d-flex align-items-center gap-2">
                        {currentIdx < questions.length - 1 ? (
                          <button
                            type="button"
                            onClick={() => setCurrentIdx((prev) => Math.min(questions.length - 1, prev + 1))}
                            className="btn btn-primary rounded-pill px-4"
                            style={{ fontSize: '0.82rem' }}
                          >
                            Next <i className="feather-arrow-right ms-1" />
                          </button>
                        ) : null}

                        <button
                          type="button"
                          onClick={() => setShowConfirmModal(true)}
                          className="btn btn-success rounded-pill px-4 fw-semibold"
                          style={{ fontSize: '0.82rem' }}
                        >
                          Submit Quiz
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Confirmation Modal */}
              {showConfirmModal && (
                <div className="modal d-block" style={{ background: 'rgba(15,23,42,0.6)' }}>
                  <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content border-0 rounded-4 shadow">
                      <div className="modal-header border-0 pb-0">
                        <h5 className="modal-title fw-bold text-dark">Submit Assessment Attempt</h5>
                        <button
                          type="button"
                          className="btn-close"
                          onClick={() => setShowConfirmModal(false)}
                        />
                      </div>
                      <div className="modal-body py-3">
                        <p className="text-muted small mb-3">
                          Are you sure you want to finalize and submit this attempt for official evaluation?
                        </p>

                        <div className="p-3 bg-light rounded-3 border mb-3">
                          <div className="d-flex justify-content-between small mb-1">
                            <span>Total Questions:</span>
                            <strong>{questions.length}</strong>
                          </div>
                          <div className="d-flex justify-content-between small mb-1">
                            <span>Answered:</span>
                            <strong className="text-success">{totalAnswered}</strong>
                          </div>
                          <div className="d-flex justify-content-between small mb-1">
                            <span>Unanswered:</span>
                            <strong className={questions.length - totalAnswered > 0 ? 'text-warning' : 'text-muted'}>
                              {questions.length - totalAnswered}
                            </strong>
                          </div>
                          <div className="d-flex justify-content-between small">
                            <span>Time Remaining:</span>
                            <strong>{formatTime(timeLeft)}</strong>
                          </div>
                        </div>

                        {questions.length - totalAnswered > 0 && (
                          <div className="alert alert-warning py-2 px-3 small mb-0 rounded-3">
                            <i className="feather-alert-triangle me-1" />
                            You have {questions.length - totalAnswered} unanswered question(s). Unanswered questions will receive 0 marks.
                          </div>
                        )}
                      </div>
                      <div className="modal-footer border-0 pt-0">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary rounded-pill px-3"
                          onClick={() => setShowConfirmModal(false)}
                        >
                          Return to Quiz
                        </button>
                        <button
                          type="button"
                          disabled={submitting}
                          onClick={handleSubmit}
                          className="btn btn-sm btn-success rounded-pill px-4 fw-semibold"
                        >
                          {submitting ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-1" role="status" />
                              Submitting...
                            </>
                          ) : (
                            'Confirm & Record Attempt'
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StudentQuizQuestion;
