import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { all_routes } from '../../router/all_routes';
import { courseService } from '../../../core/api/courseService';

const CART_STORAGE_KEY = 'outlms_course_cart_ids';

interface CartCourseItem {
  id: number;
  fullname: string;
  shortname: string;
  categoryname: string;
  image: string;
  fee: number;
  feeFormatted: string;
  usdPrice: string;
  currency: string;
  instructorName: string;
  instructorAvatar: string;
  cpdCredits: number;
  duration: string;
  isMOOC: boolean;
}

const FALLBACK_COURSES: Record<number, CartCourseItem> = {
  8: {
    id: 8,
    fullname: 'Data Science & Applied Machine Learning with Python',
    shortname: 'PSC-DATASCI',
    categoryname: 'IEMT Professional Short Course',
    image: '/assets/img/course/thumbnails/course-8-psc-datasci.svg',
    fee: 180000,
    feeFormatted: 'TZS 180,000',
    usdPrice: '$69',
    currency: 'TZS',
    instructorName: 'Prof. Juma Kikwete',
    instructorAvatar: '/assets/img/user/user-04.jpg',
    cpdCredits: 20,
    duration: '6 Weeks',
    isMOOC: false,
  },
  7: {
    id: 7,
    fullname: 'Cybersecurity & Network Defense Fundamentals',
    shortname: 'PSC-CYBER',
    categoryname: 'IEMT Professional Short Course',
    image: '/assets/img/course/thumbnails/course-7-psc-cyber.svg',
    fee: 180000,
    feeFormatted: 'TZS 180,000',
    usdPrice: '$69',
    currency: 'TZS',
    instructorName: 'Dr. Emmanuel Michael',
    instructorAvatar: '/assets/img/user/user-03.jpg',
    cpdCredits: 20,
    duration: '6 Weeks',
    isMOOC: false,
  },
  9: {
    id: 9,
    fullname: 'Web & Mobile Applications Development',
    shortname: 'PSC-WEBMOB',
    categoryname: 'IEMT Professional Short Course',
    image: '/assets/img/course/thumbnails/course-9-psc-webmob.svg',
    fee: 180000,
    feeFormatted: 'TZS 180,000',
    usdPrice: '$69',
    currency: 'TZS',
    instructorName: 'Eng. Grace Temba',
    instructorAvatar: '/assets/img/user/user-05.jpg',
    cpdCredits: 20,
    duration: '6 Weeks',
    isMOOC: false,
  },
  10: {
    id: 10,
    fullname: 'Geographic Information Systems (GIS) & Remote Sensing',
    shortname: 'PSC-GIS',
    categoryname: 'IEMT Professional Short Course',
    image: '/assets/img/course/thumbnails/course-10-psc-gis.svg',
    fee: 180000,
    feeFormatted: 'TZS 180,000',
    usdPrice: '$69',
    currency: 'TZS',
    instructorName: 'Dr. Emmanuel Michael',
    instructorAvatar: '/assets/img/user/user-01.jpg',
    cpdCredits: 20,
    duration: '6 Weeks',
    isMOOC: false,
  },
  11: {
    id: 11,
    fullname: 'Cloud Infrastructure & Systems Administration',
    shortname: 'PSC-CLOUD',
    categoryname: 'IEMT Professional Short Course',
    image: '/assets/img/course/thumbnails/course-11-psc-cloud.svg',
    fee: 180000,
    feeFormatted: 'TZS 180,000',
    usdPrice: '$69',
    currency: 'TZS',
    instructorName: 'Eng. Grace Temba',
    instructorAvatar: '/assets/img/user/user-02.jpg',
    cpdCredits: 25,
    duration: '6 Weeks',
    isMOOC: false,
  },
  2: {
    id: 2,
    fullname: 'CS101: Data Structures & Algorithms in Python',
    shortname: 'CS101',
    categoryname: 'Undergraduate Core Module',
    image: '/assets/img/course/thumbnails/course-2-cs101.svg',
    fee: 150000,
    feeFormatted: 'TZS 150,000',
    usdPrice: '$59',
    currency: 'TZS',
    instructorName: 'Dr. Emmanuel Michael',
    instructorAvatar: '/assets/img/user/user-03.jpg',
    cpdCredits: 15,
    duration: '8 Weeks',
    isMOOC: false,
  },
  3: {
    id: 3,
    fullname: 'CS202: Cloud Computing & Distributed Systems',
    shortname: 'CS202',
    categoryname: 'Intermediate Specialization',
    image: '/assets/img/course/thumbnails/course-3-cs202.svg',
    fee: 180000,
    feeFormatted: 'TZS 180,000',
    usdPrice: '$69',
    currency: 'TZS',
    instructorName: 'Eng. Grace Temba',
    instructorAvatar: '/assets/img/user/user-05.jpg',
    cpdCredits: 20,
    duration: '8 Weeks',
    isMOOC: false,
  },
  4: {
    id: 4,
    fullname: 'BBA301: Financial Management & Strategic Planning',
    shortname: 'BBA301',
    categoryname: 'Executive Business Module',
    image: '/assets/img/course/thumbnails/course-4-bba301.svg',
    fee: 220000,
    feeFormatted: 'TZS 220,000',
    usdPrice: '$85',
    currency: 'TZS',
    instructorName: 'Dr. Michael Ng\'umbi',
    instructorAvatar: '/assets/img/user/user-01.jpg',
    cpdCredits: 20,
    duration: '10 Weeks',
    isMOOC: false,
  },
};

export const CourseCart: React.FC = () => {
  const route = all_routes;
  const [searchParams] = useSearchParams();

  // Support both ?id=8 and ?courseId=8
  const requestedId = Number(searchParams.get('id') || searchParams.get('courseId') || 0);

  const [cartIds, setCartIds] = useState<number[]>(() => {
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch {
      // Ignore
    }
    return [8]; // Default to Course 8 if empty
  });

  const [availableCourses, setAvailableCourses] = useState<Record<number, CartCourseItem>>(FALLBACK_COURSES);
  const [loading, setLoading] = useState(false);

  // Synchronize cart with URL param
  useEffect(() => {
    if (requestedId > 0) {
      setCartIds((prev) => {
        if (!prev.includes(requestedId)) {
          const next = [...prev, requestedId];
          try {
            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(next));
          } catch {}
          return next;
        }
        return prev;
      });
    }
  }, [requestedId]);

  // Load live catalog from Moodle
  useEffect(() => {
    let active = true;
    setLoading(true);

    Promise.all([
      courseService.getShortCoursesCatalog().catch(() => null),
      courseService.getPublicCatalog().catch(() => null),
    ])
      .then(([shortRes, pubRes]) => {
        if (!active) return;
        const merged: Record<number, CartCourseItem> = { ...FALLBACK_COURSES };

        // Process IEMT Short Courses
        if (shortRes && Array.isArray(shortRes.courses)) {
          shortRes.courses.forEach((c) => {
            merged[c.id] = {
              id: c.id,
              fullname: c.fullname,
              shortname: c.shortname,
              categoryname: c.categoryName || 'IEMT Professional Short Course',
              image: c.courseImage || c.image || `/assets/img/course/thumbnails/course-${c.id}-${(c.shortname || `course-${c.id}`).toLowerCase().replace(/[^a-z0-9]/g, '-')}.svg`,
              fee: Number(c.tuitionFee || 180000),
              feeFormatted: c.priceFormatted || 'TZS 180,000',
              usdPrice: c.priceUSDFormatted || '$69',
              currency: 'TZS',
              instructorName: c.instructor?.fullname || 'IEMT Senior Faculty',
              instructorAvatar: c.instructor?.avatar || '/assets/img/user/user-04.jpg',
              cpdCredits: c.cpdCredits || 20,
              duration: c.duration || '6 Weeks',
              isMOOC: !!c.isMOOC,
            };
          });
        }

        // Process Standard Public Catalog
        if (pubRes && Array.isArray(pubRes.courses)) {
          pubRes.courses.forEach((c) => {
            if (!merged[c.id]) {
              merged[c.id] = {
                id: c.id,
                fullname: c.fullname,
                shortname: c.shortname,
                categoryname: c.categoryname || 'Academic Degree Module',
                image: c.courseImage || c.image || `/assets/img/course/thumbnails/course-${c.id}-${(c.shortname || `course-${c.id}`).toLowerCase().replace(/[^a-z0-9]/g, '-')}.svg`,
                fee: Number(c.fee || 150000),
                feeFormatted: c.fee > 0 ? `${c.currency || 'TZS'} ${c.fee.toLocaleString()}` : 'Free',
                usdPrice: '$59',
                currency: c.currency || 'TZS',
                instructorName: c.instructor?.fullname || 'Faculty Lecturer',
                instructorAvatar: c.instructor?.avatar || '/assets/img/user/user-03.jpg',
                cpdCredits: 15,
                duration: '8 Weeks',
                isMOOC: c.fee === 0,
              };
            }
          });
        }

        setAvailableCourses(merged);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const removeFromCart = (id: number) => {
    setCartIds((prev) => {
      const next = prev.filter((cid) => cid !== id);
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const addToCart = (id: number) => {
    setCartIds((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const clearCart = () => {
    setCartIds([]);
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify([]));
    } catch {}
  };

  // Resolve items in cart
  const cartItems: CartCourseItem[] = cartIds
    .map((id) => availableCourses[id] || FALLBACK_COURSES[id])
    .filter(Boolean);

  const totalFee = cartItems.reduce((acc, c) => acc + (c.fee || 0), 0);
  const totalCpd = cartItems.reduce((acc, c) => acc + (c.cpdCredits || 0), 0);
  const primaryCheckoutId = cartItems[0]?.id || 8;

  // Recommended courses outside cart
  const recommendedCourses = Object.values(availableCourses)
    .filter((c) => !cartIds.includes(c.id))
    .slice(0, 3);

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
      {/* 1. SLIM NATIVE NAVIGATION & TRUST BAR (NO HUGE BREADCRUMB) */}
      <div className="bg-white border-bottom shadow-xs py-2 px-3 px-md-4">
        <div className="container-xl d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div className="d-flex align-items-center gap-2">
            <Link
              to={route.courseGrid}
              className="btn btn-sm btn-light rounded-pill border px-3 d-inline-flex align-items-center gap-1.5 text-muted hover-dark text-decoration-none"
              style={{ fontSize: '12px' }}
            >
              <i className="feather-arrow-left fs-14" />
              <span>Back to Catalog</span>
            </Link>
            <span className="text-muted small d-none d-sm-inline">/</span>
            <span className="text-dark small fw-semibold d-none d-sm-inline">
              Selected Courses &amp; Enrolment Cart
            </span>
          </div>

          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-light text-secondary border rounded-pill px-2.5 py-1 d-inline-flex align-items-center gap-1" style={{ fontSize: '11px' }}>
              <i className="feather-shield text-success fs-12" />
              <span>Bank of Tanzania Regulated</span>
            </span>
            <span className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-2.5 py-1 d-inline-flex align-items-center gap-1" style={{ fontSize: '11px' }}>
              <i className="feather-lock fs-12" />
              <span>SARIS &amp; TCU Accredited</span>
            </span>
          </div>
        </div>
      </div>

      {/* 2. COMPACT SCREEN-FIT CART CANVAS */}
      <div className="container-xl py-3 py-md-4">
        <div className="row g-3 g-lg-4 align-items-start">
          {/* LEFT COLUMN: ENROLMENT CART ITEMS */}
          <div className="col-12 col-lg-7 col-xl-8">
            <div className="card border-0 shadow-sm rounded-3 bg-white p-3 p-md-4 mb-3">
              <div className="d-flex align-items-center justify-content-between border-bottom pb-2.5 mb-3">
                <div className="d-flex align-items-center gap-2">
                  <div className="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center" style={{ width: '28px', height: '28px' }}>
                    <i className="feather-shopping-cart fs-14" />
                  </div>
                  <h6 className="fw-bold mb-0 text-dark">
                    Selected Programmes ({cartItems.length})
                  </h6>
                </div>
                {cartItems.length > 0 && (
                  <button
                    type="button"
                    onClick={clearCart}
                    className="btn btn-link text-danger text-decoration-none p-0 small d-inline-flex align-items-center gap-1"
                    style={{ fontSize: '12px' }}
                  >
                    <i className="feather-trash-2 fs-13" />
                    <span>Clear Cart</span>
                  </button>
                )}
              </div>

              {/* Items List */}
              {loading && cartItems.length === 0 ? (
                <div className="text-center py-5">
                  <div className="spinner-border spinner-border-sm text-primary mb-2" role="status" />
                  <p className="text-muted small mb-0">Loading course fee schedule...</p>
                </div>
              ) : cartItems.length === 0 ? (
                <div className="text-center py-5">
                  <div className="rounded-circle bg-light d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '64px', height: '64px' }}>
                    <i className="feather-shopping-bag fs-28 text-muted" />
                  </div>
                  <h6 className="fw-bold text-dark mb-1">Your Enrolment Cart is Empty</h6>
                  <p className="text-muted small mb-3">
                    Explore our 15 Professional Short Courses (PSC) and MOOCs to begin your studies.
                  </p>
                  <Link
                    to={route.courseGrid}
                    className="btn btn-primary rounded-pill px-4 py-2 small fw-semibold"
                    style={{ backgroundColor: '#013BA6' }}
                  >
                    Browse Short Courses
                  </Link>
                </div>
              ) : (
                <div className="d-flex flex-column gap-2.5">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-3 border bg-light d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-3 hover-shadow-sm transition"
                    >
                      {/* Image & Title Meta */}
                      <div className="d-flex align-items-center gap-3 min-w-0">
                        <img
                          src={item.image}
                          alt={item.fullname}
                          className="rounded-3 border object-fit-cover flex-shrink-0"
                          style={{ width: '84px', height: '64px', objectFit: 'cover' }}
                          onError={(e: any) => {
                            const ownFallback = `/assets/img/course/thumbnails/course-${item.id}-${(item.shortname || `course-${item.id}`).toLowerCase().replace(/[^a-z0-9]/g, '-')}.svg`;
                            if (e.target.src !== ownFallback && !e.target.src.endsWith(ownFallback)) {
                              e.target.src = ownFallback;
                            }
                          }}
                        />
                        <div className="min-w-0">
                          <div className="d-flex align-items-center gap-1.5 mb-1">
                            <span className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-2 py-0.5" style={{ fontSize: '10px' }}>
                              {item.shortname}
                            </span>
                            <span className="badge bg-white text-muted border rounded-pill px-2 py-0.5" style={{ fontSize: '10px' }}>
                              {item.cpdCredits} CPD
                            </span>
                          </div>
                          <h6 className="fw-bold text-dark text-truncate mb-1" title={item.fullname} style={{ fontSize: '13px' }}>
                            {item.fullname}
                          </h6>
                          <div className="text-muted small d-flex align-items-center gap-2" style={{ fontSize: '11px' }}>
                            <span>
                              <i className="feather-user me-1 text-primary" />
                              {item.instructorName}
                            </span>
                            <span>•</span>
                            <span>
                              <i className="feather-clock me-1 text-muted" />
                              {item.duration}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Pricing & Actions */}
                      <div className="d-flex align-items-center justify-content-between justify-content-sm-end w-100 w-sm-auto gap-3 pt-2 pt-sm-0 border-top border-sm-0">
                        <div className="text-start text-sm-end">
                          <div className="fw-bold text-primary fs-6 mb-0">
                            {item.fee > 0 ? item.feeFormatted : 'Free (MOOC)'}
                          </div>
                          <Link
                            to={`${route.courseCheckout}?id=${item.id}`}
                            className="small text-secondary text-decoration-none d-block"
                            style={{ fontSize: '11px' }}
                          >
                            Checkout this course &rarr;
                          </Link>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          className="btn btn-sm btn-outline-danger rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                          style={{ width: '32px', height: '32px' }}
                          title="Remove from cart"
                        >
                          <i className="feather-trash-2 fs-13" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* RECOMMENDED COURSES MINI-ROW (CLEAN CARDS) */}
            {recommendedCourses.length > 0 && (
              <div className="card border-0 shadow-sm rounded-3 bg-white p-3 p-md-4">
                <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
                  <h6 className="fw-bold mb-0 text-dark" style={{ fontSize: '13px' }}>
                    Other Available Professional Courses
                  </h6>
                  <Link to={route.courseGrid} className="small text-primary text-decoration-none fw-medium" style={{ fontSize: '12px' }}>
                    View All &rarr;
                  </Link>
                </div>

                <div className="row g-2.5">
                  {recommendedCourses.map((c) => (
                    <div key={c.id} className="col-12 col-md-4">
                      <div className="p-2.5 rounded-3 border bg-light h-100 d-flex flex-column justify-content-between">
                        <div>
                          <div className="d-flex align-items-center justify-content-between mb-1.5">
                            <span className="badge bg-white text-muted border rounded-pill px-2 py-0.5" style={{ fontSize: '10px' }}>
                              {c.shortname}
                            </span>
                            <span className="fw-bold text-primary" style={{ fontSize: '12px' }}>
                              {c.fee > 0 ? c.feeFormatted : 'Free'}
                            </span>
                          </div>
                          <h6 className="fw-bold text-dark text-truncate mb-1" title={c.fullname} style={{ fontSize: '12px' }}>
                            {c.fullname}
                          </h6>
                          <div className="text-muted" style={{ fontSize: '10px' }}>
                            {c.cpdCredits} CPD • {c.duration}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => addToCart(c.id)}
                          className="btn btn-outline-primary btn-sm rounded-pill w-100 mt-2 py-1 d-inline-flex align-items-center justify-content-center gap-1"
                          style={{ fontSize: '11px' }}
                        >
                          <i className="feather-plus fs-12" />
                          <span>Add to Cart</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: TUITION SUMMARY & PROCEED TO CHECKOUT */}
          <div className="col-12 col-lg-5 col-xl-4">
            <div className="card border-0 shadow-sm rounded-3 bg-white p-3 p-md-4 sticky-top" style={{ top: '20px' }}>
              <div className="d-flex align-items-center justify-content-between border-bottom pb-2.5 mb-3">
                <h6 className="fw-bold mb-0 text-dark">Tuition &amp; Fee Summary</h6>
                <span className="badge bg-success-subtle text-success rounded-pill px-2.5 py-1" style={{ fontSize: '11px' }}>
                  SARIS Verified
                </span>
              </div>

              {/* Summary Items Table */}
              <div className="d-flex flex-column gap-2 mb-3 pb-3 border-bottom" style={{ fontSize: '12px' }}>
                <div className="d-flex justify-content-between align-items-center text-muted">
                  <span>Selected Programmes:</span>
                  <span className="fw-semibold text-dark">{cartItems.length} Enrolments</span>
                </div>
                <div className="d-flex justify-content-between align-items-center text-muted">
                  <span>Accumulated CPD Credits:</span>
                  <span className="badge bg-primary-subtle text-primary rounded-pill px-2 py-0.5 fw-semibold" style={{ fontSize: '10px' }}>
                    {totalCpd} CPD Credits
                  </span>
                </div>
                <div className="d-flex justify-content-between align-items-center text-muted">
                  <span>Course Tuition Subtotal:</span>
                  <span className="fw-semibold text-dark">TZS {totalFee.toLocaleString()}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center text-muted">
                  <span>Payment Gateway Surcharge:</span>
                  <span className="text-success fw-medium">Free (Waived by OUT)</span>
                </div>
                <div className="d-flex justify-content-between align-items-center text-muted">
                  <span>SARIS Exam &amp; Transcripts:</span>
                  <span className="text-success fw-medium">Included</span>
                </div>
                <div className="d-flex justify-content-between align-items-center text-muted">
                  <span>Value Added Tax (VAT 0%):</span>
                  <span className="fw-semibold text-dark">TZS 0</span>
                </div>
              </div>

              {/* Total Due */}
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <div className="fw-bold text-dark fs-6 mb-0">Total Due</div>
                  <div className="text-muted" style={{ fontSize: '11px' }}>
                    Approx ${(totalFee / 2600).toFixed(0)} USD
                  </div>
                </div>
                <div className="text-end">
                  <h4 className="fw-bold text-primary mb-0">
                    TZS {totalFee.toLocaleString()}
                  </h4>
                </div>
              </div>

              {/* Checkout CTA Button */}
              {cartItems.length > 0 ? (
                <Link
                  to={`${route.courseCheckout}?id=${primaryCheckoutId}`}
                  className="btn btn-primary w-100 rounded-pill py-2.5 fw-semibold shadow-sm d-flex align-items-center justify-content-center gap-2 mb-2.5 text-decoration-none"
                  style={{ backgroundColor: '#013BA6', fontSize: '14px' }}
                >
                  <i className="feather-lock fs-14" />
                  <span>Proceed to Enrolment Checkout</span>
                </Link>
              ) : (
                <button
                  type="button"
                  disabled
                  className="btn btn-secondary w-100 rounded-pill py-2.5 fw-semibold mb-2.5 opacity-50"
                  style={{ fontSize: '14px' }}
                >
                  Select Course to Checkout
                </button>
              )}

              <Link
                to={route.courseGrid}
                className="btn btn-light w-100 rounded-pill py-2 small border text-muted hover-dark text-decoration-none d-flex align-items-center justify-content-center gap-1"
                style={{ fontSize: '12px' }}
              >
                <i className="feather-plus fs-12" />
                <span>Add Another Programme</span>
              </Link>

              {/* Supported Payment Logos & Guarantee */}
              <div className="p-2.5 rounded-3 border bg-light mt-3 text-center">
                <div className="text-muted mb-1.5" style={{ fontSize: '10px' }}>
                  Bank of Tanzania Regulated Mobile Money &amp; Card Rails:
                </div>
                <div className="d-flex justify-content-center flex-wrap gap-1">
                  <span className="badge bg-white text-dark border px-1.5 py-0.5" style={{ fontSize: '10px' }}>M-Pesa</span>
                  <span className="badge bg-white text-dark border px-1.5 py-0.5" style={{ fontSize: '10px' }}>Tigo Pesa</span>
                  <span className="badge bg-white text-dark border px-1.5 py-0.5" style={{ fontSize: '10px' }}>Airtel</span>
                  <span className="badge bg-white text-dark border px-1.5 py-0.5" style={{ fontSize: '10px' }}>Visa / MC</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. MOBILE-ONLY BOTTOM FIXED STICKY ACTION BAR */}
      {cartItems.length > 0 && (
        <div className="d-block d-lg-none fixed-bottom bg-white border-top shadow-lg p-2.5 px-3">
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <div className="text-muted" style={{ fontSize: '10px' }}>Total ({cartItems.length} courses):</div>
              <div className="fw-bold text-primary fs-6 mb-0">TZS {totalFee.toLocaleString()}</div>
            </div>
            <Link
              to={`${route.courseCheckout}?id=${primaryCheckoutId}`}
              className="btn btn-primary rounded-pill px-4 py-2 fw-semibold shadow-sm d-inline-flex align-items-center gap-1.5 text-decoration-none"
              style={{ backgroundColor: '#013BA6', fontSize: '13px' }}
            >
              <i className="feather-lock fs-13" />
              <span>Checkout</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseCart;
