import React, { useEffect, useState } from 'react';
import Breadcrumb from '../../../core/common/Breadcrumb/breadcrumb';
import { Link } from 'react-router-dom';
import { all_routes } from '../../router/all_routes';
import { courseService, PublicCatalogCourse } from '../../../core/api/courseService';

const PricePlanning: React.FC = () => {
  const [courses, setCourses] = useState<PublicCatalogCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    courseService
      .getPublicCatalog()
      .then((res) => {
        if (mounted) setCourses(res.courses || []);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <>
      <Breadcrumb title="OUT Tuition & Fee Schedule" />
      <section className="pricing-plan-sec py-5">
        <div className="container">
          <div className="row">
            <div className="col-lg-7 mx-auto">
              <div className="section-header text-center">
                <span className="fw-medium text-secondary fs-18 fw-bold mb-2 d-inline-block">
                  Official Open University of Tanzania Tuition Structure
                </span>
                <h2>Course Enrollment &amp; Tuition Fees (TZS)</h2>
                <p>
                  Pay securely per module or semester using Pesapal (M-Pesa, Tigo Pesa, Airtel Money,
                  HaloPesa, or Visa/Mastercard) with instant Moodle 5.3 course enrollment.
                </p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status" />
            </div>
          ) : (
            <div className="row pricing-cover g-4">
              {courses.slice(0, 4).map((course, idx) => (
                <div className="col-xl-3 col-md-6 px-2 d-flex" key={course.id}>
                  <div
                    className={`pricing-item flex-fill d-flex flex-column justify-content-between ${
                      idx === 1 ? 'border-primary shadow' : ''
                    }`}
                  >
                    <div>
                      <span className="badge bg-primary-transparent text-primary mb-2">
                        {course.shortname}
                      </span>
                      <h5 className="mb-2 fw-bold">{course.fullname}</h5>
                      <p className="fs-14 text-muted">{course.categoryname}</p>
                      <div className="border-top pt-3 mt-3">
                        <h3 className="mb-2 text-primary">
                          {course.fee > 0
                            ? `${course.currency} ${course.fee.toLocaleString()}`
                            : 'Open Access (Free)'}
                          <span className="fs-14 fw-normal text-muted d-block mt-1">
                            Per Academic Module
                          </span>
                        </h3>
                      </div>
                      <ul className="price-list mt-3">
                        <li className="d-flex align-items-center mb-2">
                          <i className="fa-solid fa-circle-check text-success me-2" />
                          {course.lessonsCount} Structured Moodle Units
                        </li>
                        <li className="d-flex align-items-center mb-2">
                          <i className="fa-solid fa-circle-check text-success me-2" />
                          Supervised by {course.instructor.fullname}
                        </li>
                        <li className="d-flex align-items-center mb-2">
                          <i className="fa-solid fa-circle-check text-success me-2" />
                          Quizzes, Assignments &amp; Gradebook
                        </li>
                        <li className="d-flex align-items-center mb-2">
                          <i className="fa-solid fa-circle-check text-success me-2" />
                          Verified OUT Completion Certificate
                        </li>
                      </ul>
                    </div>
                    <Link
                      to={`${all_routes.courseCheckout}?courseId=${course.id}`}
                      className="btn btn-start-free w-100 mt-3"
                    >
                      {course.fee > 0 ? 'Pay Tuition & Enroll' : 'Enroll for Free'}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="table-responsive mt-5">
            <table className="table table-bordered pricing-table bg-white">
              <thead className="table-light">
                <tr>
                  <th>Course Code &amp; Title</th>
                  <th>Academic Faculty</th>
                  <th>Lecturer</th>
                  <th className="text-center">Modules</th>
                  <th className="text-end">Tuition Fee (TZS)</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <strong>{c.shortname}</strong> — {c.fullname}
                    </td>
                    <td>{c.categoryname}</td>
                    <td>{c.instructor.fullname}</td>
                    <td className="text-center">{c.lessonsCount}</td>
                    <td className="text-end fw-bold">
                      {c.fee > 0 ? `TZS ${c.fee.toLocaleString()}` : 'Free'}
                    </td>
                    <td className="text-center">
                      <Link
                        to={`${all_routes.courseCheckout}?courseId=${c.id}`}
                        className="btn btn-sm btn-primary rounded-pill px-3"
                      >
                        Enroll
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  );
};

export default PricePlanning;
