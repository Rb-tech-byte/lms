import React, { useEffect, useState } from 'react';
import Breadcrumb from '../../../core/common/Breadcrumb/breadcrumb';
import ProfileCard from '../common/profileCard';
import InstructorSidebar from '../common/instructorSidebar';
import { Link } from 'react-router-dom';
import { all_routes } from '../../router/all_routes';
import { quizService, MoodleQuiz } from '../../../core/api/quizService';

const InstructorQuiz: React.FC = () => {
  const [quizzes, setQuizzes] = useState<MoodleQuiz[]>([]);

  useEffect(() => {
    quizService.getQuizzesByCourses([2, 3, 4], 3).then((list) => {
      setQuizzes(list || []);
    });
  }, []);

  return (
    <>
      <Breadcrumb title="Managed Course Quizzes" />
      <div className="content">
        <div className="container">
          <ProfileCard />
          <div className="row">
            <InstructorSidebar />
            <div className="col-lg-9">
              <div className="page-title d-flex align-items-center justify-content-between">
                <h5>Moodle Quiz Banks ({quizzes.length})</h5>
              </div>
              <div className="table-responsive custom-table">
                <table className="table">
                  <thead className="thead-light">
                    <tr>
                      <th>Quiz Title</th>
                      <th>Questions</th>
                      <th>Max Grade</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quizzes.map((q) => (
                      <tr key={q.id}>
                        <td className="fw-bold">{q.name}</td>
                        <td>{q.questionsCount || 5}</td>
                        <td>{q.grade || 100}%</td>
                        <td>
                          <Link
                            to={`${all_routes.instructorQuizResult}?quizId=${q.id}`}
                            className="btn btn-sm btn-outline-primary"
                          >
                            View Results
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default InstructorQuiz;
