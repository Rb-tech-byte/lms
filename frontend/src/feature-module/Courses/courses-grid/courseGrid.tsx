import React, { useState, useEffect } from 'react'
import Breadcrumb from '../../../core/common/Breadcrumb/breadcrumb'
import type { SliderSingleProps } from 'antd';  
import { Slider } from 'antd'
import { Link } from 'react-router-dom';
import ImageWithBasePath from '../../../core/common/imageWithBasePath';
import { all_routes } from '../../router/all_routes';
import { courseService, CourseCategory, MoodleCourse } from '../../../core/api';

const CourseGrid = () => {
  const formatter: NonNullable<SliderSingleProps['tooltip']>['formatter'] = (value) => `$${value}`;
  const [courses, setCourses] = useState<MoodleCourse[]>([]);
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      setLoading(true);
      try {
        const [cats, allCourses] = await Promise.all([
          courseService.getCategories(),
          courseService.getCourses(selectedCategory || undefined),
        ]);
        if (isMounted) {
          setCategories(cats.filter(c => c.id !== 1 || c.coursecount > 0));
          setCourses(allCourses.filter(c => c.id !== 1));
        }
      } catch (err) {
        console.error('Failed to load courses from Moodle:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadData();
    return () => { isMounted = false; };
  }, [selectedCategory]);

  const filteredCourses = courses.filter(c => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.fullname.toLowerCase().includes(q) ||
      c.shortname.toLowerCase().includes(q) ||
      (c.summary && c.summary.toLowerCase().includes(q))
    );
  });
  return (
    <>
  
  <Breadcrumb title='Course Grid'/>
  
  {/* Course */}
  <section className="course-content">
    <div className="container">
      <div className="row align-items-baseline">
        <div className="col-lg-3 theiaStickySidebar">
          <div className="filter-clear">
            <div className="clear-filter mb-4 pb-lg-2 d-flex align-items-center justify-content-between">
              <h5>
                <i className="feather-filter me-2" />
                Filters
              </h5>
              <Link to="#" className="clear-text">
                Clear
              </Link>
            </div>
            <div className="accordion accordion-customicon1 accordions-items-seperate">
              <div className="accordion-item">
                <h2 className="accordion-header" id="headingcustomicon1One">
                  <Link
                    to="#"
                    className="accordion-button"
                    data-bs-toggle="collapse"
                    data-bs-target="#collapsecustomicon1One"
                    aria-expanded="false"
                    aria-controls="collapsecustomicon1One"
                  >
                    Categories <i className="fa-solid fa-chevron-down" />
                  </Link>
                </h2>
                <div
                  id="collapsecustomicon1One"
                  className="accordion-collapse collapse show"
                  aria-labelledby="headingcustomicon1One"
                  data-bs-parent="#accordioncustomicon1Example"
                  style={{}}
                >
                  <div className="accordion-body">
                    {categories.length === 0 ? (
                      <p className="text-muted fs-13 mb-0">Loading faculties...</p>
                    ) : (
                      categories.map((cat) => (
                        <div key={cat.id} className="mb-2">
                          <label className="custom_check">
                            <input
                              type="checkbox"
                              name="moodle_category"
                              checked={selectedCategory === cat.id}
                              onChange={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                            />
                            <span className="checkmark" />
                            {cat.name} ({cat.coursecount})
                          </label>
                        </div>
                      ))
                    )}
                    {selectedCategory && (
                      <button
                        type="button"
                        onClick={() => setSelectedCategory(null)}
                        className="btn btn-sm btn-link text-danger p-0 mt-2"
                      >
                        Reset Category Filter
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <div className="accordion-item">
                <h2 className="accordion-header" id="headingcustomicon1Two">
                  <Link
                    to="#"
                    className="accordion-button"
                    data-bs-toggle="collapse"
                    data-bs-target="#collapsecustomicon1Two"
                    aria-expanded="false"
                    aria-controls="collapsecustomicon1Two"
                  >
                    Instructors
                    <i className="fa-solid fa-chevron-down" />
                  </Link>
                </h2>
                <div
                  id="collapsecustomicon1Two"
                  className="accordion-collapse collapse show"
                  aria-labelledby="headingcustomicon1Two"
                  data-bs-parent="#accordioncustomicon1Example"
                >
                  <div className="accordion-body">
                    <div>
                      <label className="custom_check">
                        <input type="checkbox" name="select_specialist" />
                        <span className="checkmark" /> Keny White (10)
                      </label>
                    </div>
                    <div>
                      <label className="custom_check">
                        <input type="checkbox" name="select_specialist" />
                        <span className="checkmark" /> Hinata Hyuga (5)
                      </label>
                    </div>
                    <div>
                      <label className="custom_check">
                        <input type="checkbox" name="select_specialist" />
                        <span className="checkmark" /> John Doe (3)
                      </label>
                    </div>
                    <div>
                      <label className="custom_check mb-0">
                        <input
                          type="checkbox"
                          name="select_specialist"
                          defaultChecked
                        />
                        <span className="checkmark" /> Nicole Brown
                      </label>
                    </div>
                    <Link to="#" className="see-more-btn">
                      See More
                    </Link>
                  </div>
                </div>
              </div>
              <div className="accordion-item">
                <h2 className="accordion-header" id="headingcustomicon1Three">
                  <Link
                    to="#"
                    className="accordion-button"
                    data-bs-toggle="collapse"
                    data-bs-target="#collapsecustomicon1Three"
                    aria-expanded="false"
                    aria-controls="collapsecustomicon1Three"
                  >
                    Price
                    <i className="fa-solid fa-chevron-down" />
                  </Link>
                </h2>
                <div
                  id="collapsecustomicon1Three"
                  className="accordion-collapse collapse show"
                  aria-labelledby="headingcustomicon1Three"
                  data-bs-parent="#accordioncustomicon1Example"
                >
                  <div className="accordion-body">
                    <div>
                      <label className="custom_check custom_one">
                        <input type="checkbox" name="select_specialist" />
                        <span className="checkmark" /> All (10)
                      </label>
                    </div>
                    <div>
                      <label className="custom_check custom_one">
                        <input type="checkbox" name="select_specialist" />
                        <span className="checkmark" /> Free (5)
                      </label>
                    </div>
                    <div>
                      <label className="custom_check custom_one mb-0">
                        <input type="checkbox" name="select_specialist" />
                        <span className="checkmark" /> Paid (3)
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <div className="accordion-item">
                <h2 className="accordion-header" id="headingcustomicon1Four">
                  <Link
                    to="#"
                    className="accordion-button"
                    data-bs-toggle="collapse"
                    data-bs-target="#collapsecustomicon1Four"
                    aria-expanded="false"
                    aria-controls="collapsecustomicon1Four"
                  >
                    Range
                    <i className="fa-solid fa-chevron-down" />
                  </Link>
                </h2>
                <div
                  id="collapsecustomicon1Four"
                  className="accordion-collapse collapse show"
                  aria-labelledby="headingcustomicon1Four"
                  data-bs-parent="#accordioncustomicon1Example"
                >
                  <div className="accordion-body">
                    <div className="filter-range">
                    <Slider range tooltip={{ formatter }}  min={50} max={5695} defaultValue={[50, 2000]}  />
                    </div>
                  </div>
                </div>
              </div>
              <div className="accordion-item">
                <h2 className="accordion-header" id="headingcustomicon1Five">
                  <Link
                    to="#"
                    className="accordion-button"
                    data-bs-toggle="collapse"
                    data-bs-target="#collapsecustomicon1Five"
                    aria-expanded="false"
                    aria-controls="collapsecustomicon1Five"
                  >
                    Level
                    <i className="fa-solid fa-chevron-down" />
                  </Link>
                </h2>
                <div
                  id="collapsecustomicon1Five"
                  className="accordion-collapse collapse show"
                  aria-labelledby="headingcustomicon1Five"
                  data-bs-parent="#accordioncustomicon1Example"
                >
                  <div className="accordion-body">
                    <div>
                      <label className="custom_check custom_one">
                        <input type="checkbox" name="select_specialist" />
                        <span className="checkmark" />
                        Beginner (10)
                      </label>
                    </div>
                    <div>
                      <label className="custom_check custom_one">
                        <input type="checkbox" name="select_specialist" />
                        <span className="checkmark" /> Intermediate (5)
                      </label>
                    </div>
                    <div>
                      <label className="custom_check custom_one">
                        <input type="checkbox" name="select_specialist" />
                        <span className="checkmark" />
                        Advanced (21)
                      </label>
                    </div>
                    <div>
                      <label className="custom_check custom_one mb-0">
                        <input type="checkbox" name="select_specialist" />
                        <span className="checkmark" />
                        Expert (3)
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <div className="accordion-item">
                <h2 className="accordion-header" id="headingcustomicon1Six">
                  <Link
                    to="#"
                    className="accordion-button"
                    data-bs-toggle="collapse"
                    data-bs-target="#collapsecustomicon1Six"
                    aria-expanded="false"
                    aria-controls="collapsecustomicon1Six"
                  >
                    Reviews <i className="fa-solid fa-chevron-down" />
                  </Link>
                </h2>
                <div
                  id="collapsecustomicon1Six"
                  className="accordion-collapse collapse show"
                  aria-labelledby="headingcustomicon1Six"
                  data-bs-parent="#accordioncustomicon1Example"
                >
                  <div className="accordion-body">
                    <div>
                      <label className="custom_check custom_one">
                        <input type="checkbox" name="select_specialist" />
                        <span className="checkmark" />
                        <i className="fa-solid fa-star text-warning me-1" />
                        <i className="fa-solid fa-star text-warning me-1" />
                        <i className="fa-solid fa-star text-warning me-1" />
                        <i className="fa-solid fa-star text-warning me-1" />
                        <i className="fa-solid fa-star text-warning" />
                      </label>
                    </div>
                    <div>
                      <label className="custom_check custom_one">
                        <input type="checkbox" name="select_specialist" />
                        <span className="checkmark" />
                        <i className="fa-solid fa-star text-warning me-1" />
                        <i className="fa-solid fa-star text-warning me-1" />
                        <i className="fa-solid fa-star text-warning me-1" />
                        <i className="fa-solid fa-star text-warning me-1" />
                        <i className="fa-solid fa-star text-light" />
                      </label>
                    </div>
                    <div>
                      <label className="custom_check custom_one">
                        <input type="checkbox" name="select_specialist" />
                        <span className="checkmark" />
                        <i className="fa-solid fa-star text-warning me-1" />
                        <i className="fa-solid fa-star text-warning me-1" />
                        <i className="fa-solid fa-star text-warning me-1" />
                        <i className="fa-solid fa-star text-light me-1" />
                        <i className="fa-solid fa-star text-light" />
                      </label>
                    </div>
                    <div>
                      <label className="custom_check custom_one">
                        <input type="checkbox" name="select_specialist" />
                        <span className="checkmark" />
                        <i className="fa-solid fa-star text-warning me-1" />
                        <i className="fa-solid fa-star text-warning me-1" />
                        <i className="fa-solid fa-star text-light me-1" />
                        <i className="fa-solid fa-star text-light me-1" />
                        <i className="fa-solid fa-star text-light" />
                      </label>
                    </div>
                    <div>
                      <label className="custom_check custom_one mb-0">
                        <input type="checkbox" name="select_specialist" />
                        <span className="checkmark" />
                        <i className="fa-solid fa-star text-warning me-1" />
                        <i className="fa-solid fa-star text-light me-1" />
                        <i className="fa-solid fa-star text-light me-1" />
                        <i className="fa-solid fa-star text-light me-1" />
                        <i className="fa-solid fa-star text-light" />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-9">
          {/* Filter */}
          <div className="showing-list mb-4">
            <div className="row align-items-center">
              <div className="col-lg-4">
                <div className="show-result text-center text-lg-start">
                  <h6 className="fw-medium">
                    {loading ? (
                      'Loading courses from Moodle...'
                    ) : (
                      `Showing ${filteredCourses.length} Moodle course${filteredCourses.length === 1 ? '' : 's'}`
                    )}
                  </h6>
                </div>
              </div>
              <div className="col-lg-8">
                <div className="show-filter add-course-info">
                  <form onSubmit={(e) => e.preventDefault()}>
                    <div className="d-sm-flex justify-content-center justify-content-lg-end mb-1 mb-lg-0">
                      <div className="view-icons mb-2 mb-sm-0">
                        <Link to={all_routes.courseGrid} className="grid-view active">
                          <i className="isax isax-element-3" />
                        </Link>
                        <Link to={all_routes.courseList} className="list-view">
                          <i className="isax isax-task" />
                        </Link>
                      </div>
                      <div className="search-group">
                        <i className="isax isax-search-normal-1" />
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search Moodle courses..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
          {/* /Filter */}
          <div className="row">
            {loading ? (
              <div className="col-12 text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2 text-muted">Fetching live course catalog from Moodle Web Services...</p>
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="col-12 text-center py-5">
                <div className="empty-state">
                  <i className="isax isax-book text-muted fs-40 mb-3" />
                  <h5>No courses found</h5>
                  <p className="text-muted">No courses match your filter or search query.</p>
                  {(selectedCategory || searchQuery) && (
                    <button
                      type="button"
                      className="btn btn-outline-primary btn-sm mt-2"
                      onClick={() => {
                        setSelectedCategory(null);
                        setSearchQuery('');
                      }}
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              </div>
            ) : (
              filteredCourses.map((course, index) => {
                const categoryObj = categories.find((c) => c.id === course.categoryid);
                const categoryName = categoryObj ? categoryObj.name : 'Faculty Course';
                const courseImg = `assets/img/course/course-0${(index % 8) + 1}.jpg`;
                const cleanSummary = course.summary ? course.summary.replace(/<[^>]*>?/gm, '') : 'Comprehensive degree course offering theoretical foundations and practical laboratory assessments.';
                return (
                  <div key={course.id} className="col-xl-4 col-md-6">
                    <div className="course-item-two course-item mx-0 mb-4 shadow-sm border-0">
                      <div className="course-img position-relative">
                        <Link to={all_routes.courseDetails}>
                          <ImageWithBasePath
                            src={courseImg}
                            alt={course.fullname}
                            className="img-fluid"
                          />
                        </Link>
                        <div className="position-absolute start-0 top-0 d-flex align-items-start w-100 z-index-2 p-3">
                          <span className="badge text-bg-primary">{course.shortname}</span>
                          <Link to="#" className="fav-icon ms-auto">
                            <i className="isax isax-heart" />
                          </Link>
                        </div>
                      </div>
                      <div className="course-content p-3">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="badge badge-light rounded-pill bg-light text-primary d-inline-flex align-items-center fs-12 fw-medium mb-0 text-truncate" style={{ maxWidth: '170px' }}>
                            {categoryName}
                          </span>
                          <span className="text-muted fs-12">
                            <i className="feather-users me-1" />
                            {course.enrolledusercount || 120} Students
                          </span>
                        </div>
                        <h6 className="title mb-2" style={{ minHeight: '44px' }}>
                          <Link to={all_routes.courseDetails} className="text-dark fw-bold">
                            {course.fullname}
                          </Link>
                        </h6>
                        <p className="text-muted fs-13 mb-3 text-truncate" title={cleanSummary}>
                          {cleanSummary}
                        </p>
                        <div className="d-flex align-items-center justify-content-between pt-2 border-top">
                          <h6 className="text-success mb-0 fw-bold">TZS 150,000</h6>
                          <Link
                            to={all_routes.courseDetails}
                            className="btn btn-dark btn-sm d-inline-flex align-items-center"
                          >
                            View Course
                            <i className="isax isax-arrow-right-3 ms-1" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          {/* /pagination */}
          <div className="row align-items-center">
            <div className="col-md-2">
              <p className="pagination-text">Page 1 of 2</p>
            </div>
            <div className="col-md-10">
              <ul className="pagination lms-page justify-content-center justify-content-md-end mt-2 mt-md-0">
                <li className="page-item prev">
                  <Link
                    className="page-link"
                    to="#"
                    tabIndex={-1}
                  >
                    <i className="fas fa-angle-left" />
                  </Link>
                </li>
                <li className="page-item first-page active">
                  <Link className="page-link" to="#">
                    1
                  </Link>
                </li>
                <li className="page-item">
                  <Link className="page-link" to="#">
                    2
                  </Link>
                </li>
                <li className="page-item">
                  <Link className="page-link" to="#">
                    3
                  </Link>
                </li>
                <li className="page-item next">
                  <Link className="page-link" to="#">
                    <i className="fas fa-angle-right" />
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          {/* /pagination */}
        </div>
      </div>
    </div>
  </section>
  {/* /Course */}
</>

  )
}

export default CourseGrid
