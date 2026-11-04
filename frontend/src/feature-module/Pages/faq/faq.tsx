import React, { useEffect, useState } from 'react';
import Breadcrumb from '../../../core/common/Breadcrumb/breadcrumb';
import { Link } from 'react-router-dom';
import { all_routes } from '../../router/all_routes';
import { courseService } from '../../../core/api/courseService';

const Faq: React.FC = () => {
  const [totalCourses, setTotalCourses] = useState(8);

  useEffect(() => {
    let mounted = true;
    courseService.getPublicCatalog().then((res) => {
      if (mounted && res.stats?.totalCourses) {
        setTotalCourses(res.stats.totalCourses);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const faqsLeft = [
    {
      id: 'faqOne',
      q: 'How do I enroll in an Open University of Tanzania (OUT) course?',
      a: `Browse our ${totalCourses}+ live Moodle courses, select your programme, and click "Enroll Now". Open-access modules enroll immediately, while tuition-based modules process via Pesapal (M-Pesa, Tigo Pesa, Airtel Money, or card).`,
    },
    {
      id: 'faqTwo',
      q: 'How are my grades and quiz scores recorded in Moodle?',
      a: 'Every quiz attempt and coursework assignment submitted in the React Classroom Watch View is persisted directly to the Moodle 5.3 Gradebook (mdl_grade_grades) and can be reviewed in your Student Portal.',
    },
    {
      id: 'faqThree',
      q: 'Can I study remotely from any regional centre in Tanzania?',
      a: 'Yes. OUT operates 30 Regional Study Centres across mainland Tanzania and Zanzibar, allowing you to study online while attending regional examination and supervision sessions near you.',
    },
  ];

  const faqsRight = [
    {
      id: 'faqFour',
      q: 'How do I download my verified digital certificate?',
      a: 'Once your course completion reaches 100% or your final grade is recorded by your faculty lecturer, open the Student Portal Certificates tab to generate and download your verified OUT certificate.',
    },
    {
      id: 'faqFive',
      q: 'What should I do if I forget my OUT Moodle password?',
      a: 'Click "Forgot Password?" on the login screen and enter your OUT username or @out.ac.tz email address to receive a password recovery token.',
    },
    {
      id: 'faqSix',
      q: 'How do lecturers create courses and grade student submissions?',
      a: 'Authenticated lecturers and administrators use the Corporate Instructor Console and Course Authoring Studio to create Moodle sections, upload resources, and grade student coursework.',
    },
  ];

  return (
    <>
      <Breadcrumb title="Frequently Asked Questions (FAQ)" />
      <div className="faq-content py-5">
        <div className="container">
          <div className="row">
            <div className="col-lg-7 mx-auto">
              <h2 className="main-title mb-2 text-center">
                Open University of Tanzania Digital Learning FAQ
              </h2>
              <p className="title-subtext text-center mb-4">
                Answers to common questions about Moodle 5.3 enrollment, tuition payments, assessments, and certificates.
              </p>
            </div>
          </div>
          <div className="row">
            <div className="col-lg-6">
              {faqsLeft.map((item, idx) => (
                <div className="faq-card" key={item.id}>
                  <h6 className="faq-title">
                    <Link
                      className={idx === 0 ? '' : 'collapsed'}
                      data-bs-toggle="collapse"
                      to={`#${item.id}`}
                      aria-expanded={idx === 0 ? 'true' : 'false'}
                    >
                      {item.q}
                    </Link>
                  </h6>
                  <div id={item.id} className={`collapse ${idx === 0 ? 'show' : ''}`}>
                    <div className="faq-detail">
                      <p>{item.a}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="col-lg-6">
              {faqsRight.map((item) => (
                <div className="faq-card" key={item.id}>
                  <h6 className="faq-title">
                    <Link
                      className="collapsed"
                      data-bs-toggle="collapse"
                      to={`#${item.id}`}
                      aria-expanded="false"
                    >
                      {item.q}
                    </Link>
                  </h6>
                  <div id={item.id} className="collapse">
                    <div className="faq-detail">
                      <p>{item.a}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-light border rounded p-4 p-sm-5 mt-4">
            <div className="row">
              <div className="col-lg-7 text-center mx-auto">
                <h4 className="mb-2">Still have an academic or technical question?</h4>
                <p className="mb-4">
                  Our Directorate of ICT Services and Student Helpdesk in Kinondoni, Dar es Salaam is ready to assist you.
                </p>
                <Link to={all_routes.contactUs} className="btn btn-lg btn-dark mb-0">
                  Contact OUT Helpdesk
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Faq;
