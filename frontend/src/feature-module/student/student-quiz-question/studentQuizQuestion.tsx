import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Breadcrumb from "../../../core/common/Breadcrumb/breadcrumb";
import ProfileCard from "../common/profileCard";
import StudentSidebar from "../common/studentSidebar";
import CircleProgress from "../../Instructor/instructor-dashboard/circleProgress";
import { all_routes } from "../../router/all_routes";
import { useAuth } from "../../../core/auth/authContext";
import { getMoodleUserId } from "../../../core/api/courseService";
import { quizService, MoodleQuiz, QuizQuestion, QuizResult } from "../../../core/api/quizService";

const StudentQuizQuestion: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const quizIdParam = parseInt(searchParams.get("quizId") || "1", 10);
  const quizId = isNaN(quizIdParam) ? 1 : quizIdParam;

  const [quiz, setQuiz] = useState<MoodleQuiz | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [flagged, setFlagged] = useState<Set<number>>(new Set());
  const [timeRemaining, setTimeRemaining] = useState<number>(300);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  // Load quiz details and question items
  useEffect(() => {
    let isMounted = true;
    const initQuiz = async () => {
      setLoading(true);
      try {
        const quizzes = await quizService.getQuizzesByCourses([2, 3, 4]);
        const found = quizzes.find((q) => q.id === quizId) || quizzes[0] || null;
        const qItems = quizService.getQuestionsForQuiz(quizId);

        if (isMounted) {
          setQuiz(found);
          setQuestions(qItems);
          const limit = found?.timelimit && found.timelimit > 0 ? found.timelimit : 300;
          setTimeRemaining(limit);
          startTimeRef.current = Date.now();
        }
      } catch (err) {
        console.error("Failed to initialize quiz:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initQuiz();
    return () => {
      isMounted = false;
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [quizId]);

  // Countdown Timer
  useEffect(() => {
    if (loading || isCompleted) return;

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [loading, isCompleted]);

  const handleSelectOption = (questionId: number, optionId: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleToggleFlag = (questionId: number) => {
    setFlagged((prev) => {
      const next = new Set(prev);
      if (next.has(questionId)) {
        next.delete(questionId);
      } else {
        next.add(questionId);
      }
      return next;
    });
  };

  const handleAutoSubmit = async () => {
    await handleSubmitQuiz();
  };

  const handleSubmitQuiz = async () => {
    setIsSubmitting(true);
    if (timerRef.current) clearInterval(timerRef.current);

    const uid = getMoodleUserId(user);
    const timeSpent = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));
    const evalResult = await quizService.submitQuizAttempt(quizId, uid, answers, timeSpent);

    setResult(evalResult);
    setIsCompleted(true);
    setIsSubmitting(false);
  };

  const handleRetake = () => {
    setAnswers({});
    setFlagged(new Set());
    setCurrentIndex(0);
    setIsCompleted(false);
    setResult(null);
    const limit = quiz?.timelimit && quiz.timelimit > 0 ? quiz.timelimit : 300;
    setTimeRemaining(limit);
    startTimeRef.current = Date.now();
  };

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <>
        <Breadcrumb title="Assessment Player" />
        <div className="content py-5 text-center">
          <div className="spinner-border text-primary mb-3" role="status" />
          <p className="text-muted small">Loading assessment questions from Moodle...</p>
        </div>
      </>
    );
  }

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;
  const progressPercent = Math.round((answeredCount / totalQuestions) * 100);
  const isTimeCritical = timeRemaining <= 60;

  return (
    <>
      <Breadcrumb title={quiz?.name || "Quiz Assessment"} />

      <div className="content">
        <div className="container">
          <ProfileCard />

          <div className="row">
            <StudentSidebar />

            <div className="col-lg-9">
              {/* QUIZ TAKING STAGE */}
              {!isCompleted ? (
                <div>
                  {/* Top Assessment Header Card */}
                  <div className="card border-0 shadow-sm mb-4">
                    <div className="card-body p-4">
                      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3 pb-3 border-bottom">
                        <div>
                          <div className="d-flex align-items-center gap-2 mb-1">
                            <span className="badge bg-primary px-3 py-1 text-uppercase">
                              {quiz?.course === 2 ? "CS101" : quiz?.course === 3 ? "CS202" : "BBA301"}
                            </span>
                            <span className="badge bg-light text-muted border">
                              Moodle Knowledge Check
                            </span>
                          </div>
                          <h4 className="fs-18 fw-bold text-dark mb-0">
                            {quiz?.name.replace(/&amp;/g, "&")}
                          </h4>
                        </div>

                        {/* Live Countdown Timer */}
                        <div
                          className={`badge px-3 py-2 fs-15 d-inline-flex align-items-center gap-2 border ${
                            isTimeCritical
                              ? "bg-danger text-white border-danger animate-pulse"
                              : "bg-light text-dark border-secondary-subtle"
                          }`}
                        >
                          <i className="isax isax-clock" />
                          <span>Time Left: <strong>{formatTimer(timeRemaining)}</strong></span>
                        </div>
                      </div>

                      {/* Question Progress Meter */}
                      <div>
                        <div className="d-flex align-items-center justify-content-between small text-muted mb-2">
                          <span>
                            Question <strong>{currentIndex + 1}</strong> of {totalQuestions}
                          </span>
                          <span>
                            <strong>{answeredCount}</strong> of {totalQuestions} Answered ({progressPercent}%)
                          </span>
                        </div>
                        <div className="progress" style={{ height: "6px" }}>
                          <div
                            className="progress-bar bg-success"
                            role="progressbar"
                            style={{ width: `${progressPercent}%` }}
                            aria-valuenow={progressPercent}
                            aria-valuemin={0}
                            aria-valuemax={100}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="row g-4">
                    {/* Main Question Stage */}
                    <div className="col-lg-8">
                      {currentQuestion && (
                        <div className="card border-0 shadow-sm rounded-3">
                          <div className="card-body p-4">
                            <div className="d-flex align-items-start justify-content-between gap-3 mb-3">
                              <span className="badge bg-primary-subtle text-primary border border-primary px-3 py-1">
                                Question {currentQuestion.slot} • {currentQuestion.type === "multichoice" ? "Multiple Choice" : "True / False"}
                              </span>
                              <button
                                type="button"
                                className={`btn btn-sm rounded-pill d-inline-flex align-items-center gap-1 ${
                                  flagged.has(currentQuestion.id)
                                    ? "btn-warning text-white"
                                    : "btn-light text-muted border"
                                }`}
                                onClick={() => handleToggleFlag(currentQuestion.id)}
                              >
                                <i className="isax isax-flag" />
                                <span>{flagged.has(currentQuestion.id) ? "Flagged" : "Flag for Review"}</span>
                              </button>
                            </div>

                            <h5 className="fs-17 fw-bold text-dark mb-4 lh-base">
                              {currentQuestion.question}
                            </h5>

                            {/* Question Options */}
                            <div className="d-flex flex-column gap-3 mb-4">
                              {currentQuestion.options.map((opt) => {
                                const isSelected = answers[currentQuestion.id] === opt.id;
                                return (
                                  <div
                                    key={opt.id}
                                    onClick={() => handleSelectOption(currentQuestion.id, opt.id)}
                                    className={`p-3 rounded-3 border transition-all cursor-pointer d-flex align-items-center gap-3 ${
                                      isSelected
                                        ? "bg-primary-subtle border-primary text-primary fw-semibold shadow-sm"
                                        : "bg-light border-light-subtle hover-bg-white text-dark"
                                    }`}
                                    style={{ cursor: "pointer" }}
                                  >
                                    <div
                                      className={`rounded-circle d-flex align-items-center justify-content-center border ${
                                        isSelected ? "bg-primary text-white border-primary" : "bg-white text-muted border"
                                      }`}
                                      style={{ width: "24px", height: "24px", minWidth: "24px" }}
                                    >
                                      {isSelected && <i className="isax isax-tick-circle fs-14" />}
                                    </div>
                                    <span className="fs-15">{opt.text}</span>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Stepper Navigation Buttons */}
                            <div className="d-flex align-items-center justify-content-between pt-3 border-top">
                              <button
                                type="button"
                                className="btn btn-outline-secondary rounded-pill px-4 d-inline-flex align-items-center gap-2"
                                disabled={currentIndex === 0}
                                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                              >
                                <i className="isax isax-arrow-left-2" />
                                <span>Previous</span>
                              </button>

                              {currentIndex < totalQuestions - 1 ? (
                                <button
                                  type="button"
                                  className="btn btn-primary rounded-pill px-4 d-inline-flex align-items-center gap-2"
                                  onClick={() => setCurrentIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
                                >
                                  <span>Next Question</span>
                                  <i className="isax isax-arrow-right-3" />
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  className="btn btn-success rounded-pill px-4 d-inline-flex align-items-center gap-2 shadow-sm"
                                  disabled={isSubmitting}
                                  onClick={handleSubmitQuiz}
                                >
                                  <span>{isSubmitting ? "Submitting..." : "Submit Assessment"}</span>
                                  <i className="isax isax-verify5" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Question Palette Matrix */}
                    <div className="col-lg-4">
                      <div className="card border-0 shadow-sm rounded-3">
                        <div className="card-body p-4">
                          <h6 className="fs-15 fw-bold text-dark mb-3 pb-2 border-bottom">
                            Question Matrix
                          </h6>
                          <div className="d-flex flex-wrap gap-2 mb-4">
                            {questions.map((q, idx) => {
                              const isAnswered = answers[q.id] !== undefined;
                              const isCurrent = idx === currentIndex;
                              const isFlag = flagged.has(q.id);

                              return (
                                <button
                                  key={q.id}
                                  type="button"
                                  className={`btn rounded-3 fw-bold p-0 position-relative ${
                                    isCurrent
                                      ? "btn-primary"
                                      : isAnswered
                                      ? "btn-success"
                                      : "btn-outline-secondary"
                                  }`}
                                  style={{ width: "42px", height: "42px" }}
                                  onClick={() => setCurrentIndex(idx)}
                                >
                                  {idx + 1}
                                  {isFlag && (
                                    <span
                                      className="position-absolute top-0 start-100 translate-middle p-1 bg-warning border border-light rounded-circle"
                                      style={{ width: "10px", height: "10px" }}
                                    />
                                  )}
                                </button>
                              );
                            })}
                          </div>

                          {/* Legend */}
                          <div className="small text-muted d-flex flex-column gap-2 pt-3 border-top">
                            <div className="d-flex align-items-center gap-2">
                              <span className="badge bg-success rounded-circle p-1" style={{ width: "12px", height: "12px" }} />
                              <span>Answered</span>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                              <span className="badge bg-primary rounded-circle p-1" style={{ width: "12px", height: "12px" }} />
                              <span>Current Question</span>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                              <span className="badge bg-warning rounded-circle p-1" style={{ width: "12px", height: "12px" }} />
                              <span>Flagged for Review</span>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                              <span className="badge bg-light border rounded-circle p-1" style={{ width: "12px", height: "12px" }} />
                              <span>Unanswered</span>
                            </div>
                          </div>

                          <div className="mt-4 pt-3 border-top">
                            <button
                              type="button"
                              className="btn btn-outline-success w-100 rounded-pill py-2 fw-semibold d-inline-flex align-items-center justify-content-center gap-2"
                              disabled={isSubmitting}
                              onClick={handleSubmitQuiz}
                            >
                              <span>Finish & Submit</span>
                              <i className="isax isax-send-2" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* RESULT & REVIEW SCREEN */
                result && (
                  <div className="card border-0 shadow-sm rounded-3">
                    <div className="card-body p-4 p-md-5">
                      <div className="text-center mb-5 pb-4 border-bottom">
                        <div className="d-inline-flex justify-content-center mb-3">
                          <CircleProgress value={result.scorePercentage} />
                        </div>
                        <h3 className="fw-bold text-dark mb-2">
                          {result.passed ? "Assessment Passed!" : "Assessment Completed"}
                        </h3>
                        <p className="text-muted small mb-3">
                          {result.passed
                            ? "Congratulations! You have satisfied the mastery criteria for this module."
                            : "You scored below the 70% passing threshold. You can review the questions below and retake the assessment."}
                        </p>
                        <span
                          className={`badge fs-14 px-4 py-2 ${
                            result.passed
                              ? "bg-success text-white"
                              : "bg-danger-subtle text-danger border border-danger"
                          }`}
                        >
                          Score: {result.scorePercentage}% ({result.correctCount} of {result.totalQuestions} Correct)
                        </span>
                      </div>

                      {/* Performance Metric Cards */}
                      <div className="row g-3 mb-5">
                        <div className="col-6 col-md-3">
                          <div className="p-3 bg-light rounded-3 text-center border">
                            <span className="text-muted small d-block mb-1">Total Questions</span>
                            <h4 className="fw-bold text-dark mb-0">{result.totalQuestions}</h4>
                          </div>
                        </div>
                        <div className="col-6 col-md-3">
                          <div className="p-3 bg-success-subtle rounded-3 text-center border border-success">
                            <span className="text-success small d-block mb-1">Correct Answers</span>
                            <h4 className="fw-bold text-success mb-0">{result.correctCount}</h4>
                          </div>
                        </div>
                        <div className="col-6 col-md-3">
                          <div className="p-3 bg-danger-subtle rounded-3 text-center border border-danger">
                            <span className="text-danger small d-block mb-1">Incorrect Answers</span>
                            <h4 className="fw-bold text-danger mb-0">{result.wrongCount}</h4>
                          </div>
                        </div>
                        <div className="col-6 col-md-3">
                          <div className="p-3 bg-primary-subtle rounded-3 text-center border border-primary">
                            <span className="text-primary small d-block mb-1">Time Elapsed</span>
                            <h4 className="fw-bold text-primary mb-0">{formatTimer(result.timeSpentSeconds)}</h4>
                          </div>
                        </div>
                      </div>

                      {/* Detailed Question Review Accordion */}
                      <div className="mb-5">
                        <h5 className="fs-18 fw-bold text-dark mb-3">
                          Detailed Question Breakdown & Explanations
                        </h5>
                        <div className="d-flex flex-column gap-3">
                          {questions.map((q) => {
                            const selectedOptId = answers[q.id];
                            const isCorrect = selectedOptId === q.correctOptionId;
                            const selectedOpt = q.options.find((o) => o.id === selectedOptId);
                            const correctOpt = q.options.find((o) => o.id === q.correctOptionId);

                            return (
                              <div
                                key={q.id}
                                className={`card border rounded-3 ${
                                  isCorrect ? "border-success-subtle bg-white" : "border-danger-subtle bg-white"
                                }`}
                              >
                                <div className="card-body p-4">
                                  <div className="d-flex align-items-center justify-content-between mb-2">
                                    <span className="badge bg-light text-muted border">
                                      Question {q.slot}
                                    </span>
                                    <span
                                      className={`badge ${
                                        isCorrect
                                          ? "bg-success text-white"
                                          : "bg-danger text-white"
                                      }`}
                                    >
                                      {isCorrect ? "Correct (+20 pts)" : "Incorrect (0 pts)"}
                                    </span>
                                  </div>

                                  <h6 className="fs-15 fw-bold text-dark mb-3">
                                    {q.question}
                                  </h6>

                                  <div className="small mb-3">
                                    <div className="mb-1">
                                      <strong className="text-muted">Your Selection: </strong>
                                      <span className={isCorrect ? "text-success fw-bold" : "text-danger fw-bold"}>
                                        {selectedOpt ? selectedOpt.text : "Not answered"}
                                      </span>
                                    </div>
                                    {!isCorrect && (
                                      <div>
                                        <strong className="text-muted">Correct Answer: </strong>
                                        <span className="text-success fw-bold">
                                          {correctOpt?.text}
                                        </span>
                                      </div>
                                    )}
                                  </div>

                                  <div className="p-3 bg-light rounded-3 small text-muted border">
                                    <strong className="text-dark d-block mb-1">
                                      <i className="isax isax-info-circle text-primary me-1" />
                                      Academic Explanation:
                                    </strong>
                                    {q.explanation}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Action Controls */}
                      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 pt-3 border-top">
                        <Link
                          to={all_routes.studentQuiz}
                          className="btn btn-outline-secondary rounded-pill px-4"
                        >
                          <i className="isax isax-arrow-left-2 me-1" />
                          Back to All Quizzes
                        </Link>

                        <div className="d-flex align-items-center gap-2">
                          <button
                            type="button"
                            className="btn btn-warning text-white rounded-pill px-4"
                            onClick={handleRetake}
                          >
                            <i className="isax isax-repeat me-1" />
                            Retake Assessment
                          </button>
                          <Link
                            to={`/course/course-watch?courseId=${quiz?.course || 2}`}
                            className="btn btn-primary rounded-pill px-4"
                          >
                            <span>Enter Classroom</span>
                            <i className="isax isax-play-circle ms-1" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StudentQuizQuestion;
