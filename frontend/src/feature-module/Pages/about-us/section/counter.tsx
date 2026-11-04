import React, { useEffect, useState } from 'react';
import ImageWithBasePath from '../../../../core/common/imageWithBasePath';
import CountUp from 'react-countup';
import { courseService } from '../../../../core/api/courseService';

const Counter: React.FC = () => {
  const [stats, setStats] = useState({
    totalCourses: 120,
    totalInstructors: 45,
    totalStudents: 15400,
  });

  useEffect(() => {
    let mounted = true;
    courseService.getPublicCatalog().then((res) => {
      if (mounted && res.stats) {
        setStats({
          totalCourses: Math.max(8, res.stats.totalCourses),
          totalInstructors: Math.max(12, res.stats.totalInstructors),
          totalStudents: Math.max(250, res.stats.totalStudents),
        });
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="counter-sec">
      <div className="container">
        <div className="row gy-3">
          <div className="col-xl-3 col-md-6">
            <div className="card border-0 mb-0">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="counter-icon">
                    <ImageWithBasePath src="./assets/img/icons/counter-icon1.svg" alt="Learners" />
                  </div>
                  <div className="count-content">
                    <h4 className="text-info">
                      <span className="count-digit">
                        <CountUp end={stats.totalStudents} />
                      </span>
                      +
                    </h4>
                    <p>Enrolled OUT Learners</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-xl-3 col-md-6">
            <div className="card border-0 mb-0">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="counter-icon">
                    <ImageWithBasePath src="./assets/img/icons/counter-icon2.svg" alt="Courses" />
                  </div>
                  <div className="count-content">
                    <h4 className="text-warning">
                      <span className="count-digit">
                        <CountUp end={stats.totalCourses} />
                      </span>
                      +
                    </h4>
                    <p>Active Moodle Courses</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-xl-3 col-md-6">
            <div className="card border-0 mb-0">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="counter-icon">
                    <ImageWithBasePath src="./assets/img/icons/counter-icon3.svg" alt="Centres" />
                  </div>
                  <div className="count-content">
                    <h4 className="text-skyblue">
                      <span className="count-digit">
                        <CountUp end={30} />
                      </span>
                    </h4>
                    <p>Regional Study Centres</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-xl-3 col-md-6">
            <div className="card border-0 mb-0">
              <div className="card-body d-flex align-items-center">
                <div className="counter-icon">
                  <ImageWithBasePath src="./assets/img/icons/counter-icon4.svg" alt="Lecturers" />
                </div>
                <div className="count-content">
                  <h4 className="text-lightgreen">
                    <span className="count-digit">
                      <CountUp end={stats.totalInstructors} />
                    </span>
                    +
                  </h4>
                  <p>Academic Faculty</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Counter;
