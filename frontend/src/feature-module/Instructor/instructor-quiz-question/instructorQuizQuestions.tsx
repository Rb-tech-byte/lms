import React, { useEffect, useState } from 'react';
import Breadcrumb from '../../../core/common/Breadcrumb/breadcrumb';
import ProfileCard from '../common/profileCard';
import InstructorSidebar from '../common/instructorSidebar';
import { quizService, QuizAttemptSession } from '../../../core/api/quizService';

const InstructorQuizQuestions: React.FC = () => {
  const [session, setSession] = useState<QuizAttemptSession | null>(null);

  useEffect(() => {
    quizService.startQuizAttempt(101, 3).then((s) => setSession(s));
  }, []);

  return (
    <>
      <Breadcrumb title="Moodle Question Bank Editor" />
      <div className="content">
        <div className="container">
          <ProfileCard />
          <div className="row">
            <InstructorSidebar />
            <div className="col-lg-9">
              <div className="card border-0 shadow-sm p-4">
                <h5 className="fw-bold mb-3">{session?.quizName || 'Course Quiz Bank'}</h5>
                {(session?.questions || []).map((q) => (
                  <div key={q.id} className="border rounded-3 p-3 mb-3">
                    <h6 className="fw-semibold mb-2">
                      Q{q.slot}. {q.questionText}
                    </h6>
                    <ul className="mb-0 small text-muted">
                      {q.options.map((opt) => (
                        <li key={opt.id}>
                          {opt.text} {opt.isCorrect ? '(Correct Answer)' : ''}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default InstructorQuizQuestions;
