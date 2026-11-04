import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { all_routes } from '../../router/all_routes';
import { paymentService, PesapalOrderResult, PesapalStatusResult } from '../../../core/api/paymentService';
import { courseService, PublicCatalogCourse } from '../../../core/api/courseService';
import { useAuth } from '../../../core/auth/authContext';

interface CourseMetaInfo {
  code: string;
  title: string;
  price: string;
  rawAmount: string;
  usdPrice: string;
  itemId: number;
  img: string;
  cpdCredits: number;
  duration: string;
  delivery: string;
  instructor: string;
  instructorRole: string;
  instructorAvatar: string;
  category: string;
}

const COURSE_CATALOG_FALLBACK: Record<number, CourseMetaInfo> = {
  8: {
    code: 'PSC-DATASCI',
    title: 'Data Science & Applied Machine Learning with Python',
    price: 'TZS 180,000',
    rawAmount: '180000',
    usdPrice: '$69',
    itemId: 8,
    img: '/assets/img/course/thumbnails/course-8-psc-datasci.svg',
    cpdCredits: 20,
    duration: '6 Weeks (Blended & Cohort)',
    delivery: 'Live Interactive Webinars & Labs',
    instructor: 'Prof. Juma Kikwete',
    instructorRole: 'Director, IEMT & Senior Lecturer',
    instructorAvatar: '/assets/img/user/user-04.jpg',
    category: 'IEMT Professional Short Course',
  },
  7: {
    code: 'PSC-CYBER',
    title: 'Cybersecurity & Network Defense Fundamentals',
    price: 'TZS 180,000',
    rawAmount: '180000',
    usdPrice: '$69',
    itemId: 7,
    img: '/assets/img/course/thumbnails/course-7-psc-cyber.svg',
    cpdCredits: 20,
    duration: '6 Weeks (Blended & Cohort)',
    delivery: 'Live Interactive Webinars & Labs',
    instructor: 'Dr. Emmanuel Michael',
    instructorRole: 'Director, IEMT & Senior Lecturer',
    instructorAvatar: '/assets/img/user/user-03.jpg',
    category: 'IEMT Professional Short Course',
  },
  9: {
    code: 'PSC-WEBMOB',
    title: 'Web & Mobile Applications Development',
    price: 'TZS 180,000',
    rawAmount: '180000',
    usdPrice: '$69',
    itemId: 9,
    img: '/assets/img/course/thumbnails/course-9-psc-webmob.svg',
    cpdCredits: 20,
    duration: '6 Weeks (Blended & Cohort)',
    delivery: 'Live Interactive Webinars & Labs',
    instructor: 'Eng. Grace Temba',
    instructorRole: 'Senior Lecturer, Software & Cloud',
    instructorAvatar: '/assets/img/user/user-05.jpg',
    category: 'IEMT Professional Short Course',
  },
  10: {
    code: 'PSC-GIS',
    title: 'Geographic Information Systems (GIS) & Remote Sensing',
    price: 'TZS 180,000',
    rawAmount: '180000',
    usdPrice: '$69',
    itemId: 10,
    img: '/assets/img/course/thumbnails/course-10-psc-gis.svg',
    cpdCredits: 20,
    duration: '6 Weeks (Blended & Cohort)',
    delivery: 'Live Interactive Webinars & Labs',
    instructor: 'Dr. Emmanuel Michael',
    instructorRole: 'Director, IEMT & Senior Lecturer',
    instructorAvatar: '/assets/img/user/user-01.jpg',
    category: 'IEMT Professional Short Course',
  },
  11: {
    code: 'PSC-CLOUD',
    title: 'Cloud Infrastructure & Systems Administration',
    price: 'TZS 180,000',
    rawAmount: '180000',
    usdPrice: '$69',
    itemId: 11,
    img: '/assets/img/course/thumbnails/course-11-psc-cloud.svg',
    cpdCredits: 25,
    duration: '6 Weeks (Blended & Cohort)',
    delivery: 'Live Interactive Webinars & Labs',
    instructor: 'Eng. Grace Temba',
    instructorRole: 'Senior Lecturer, Software & Cloud',
    instructorAvatar: '/assets/img/user/user-02.jpg',
    category: 'IEMT Professional Short Course',
  },
  2: {
    code: 'CS101',
    title: 'CS101: Data Structures & Algorithms in Python',
    price: 'TZS 150,000',
    rawAmount: '150000',
    usdPrice: '$59',
    itemId: 10,
    img: '/assets/img/course/thumbnails/course-2-cs101.svg',
    cpdCredits: 15,
    duration: '8 Weeks',
    delivery: 'Modular Digital Units',
    instructor: 'Dr. Emmanuel Michael',
    instructorRole: 'Senior Lecturer, Computing',
    instructorAvatar: '/assets/img/user/user-03.jpg',
    category: 'Undergraduate Core Module',
  },
  3: {
    code: 'CS202',
    title: 'CS202: Cloud Computing & Distributed Systems',
    price: 'TZS 180,000',
    rawAmount: '180000',
    usdPrice: '$69',
    itemId: 11,
    img: '/assets/img/course/thumbnails/course-3-cs202.svg',
    cpdCredits: 20,
    duration: '8 Weeks',
    delivery: 'Modular Digital Units',
    instructor: 'Eng. Grace Temba',
    instructorRole: 'Senior Lecturer, Cloud Infrastructure',
    instructorAvatar: '/assets/img/user/user-05.jpg',
    category: 'Intermediate Specialization',
  },
  4: {
    code: 'BBA301',
    title: 'BBA301: Financial Management & Strategic Planning',
    price: 'TZS 220,000',
    rawAmount: '220000',
    usdPrice: '$85',
    itemId: 12,
    img: '/assets/img/course/thumbnails/course-4-bba301.svg',
    cpdCredits: 20,
    duration: '10 Weeks',
    delivery: 'Executive Blended',
    instructor: 'Dr. Michael Ng\'umbi',
    instructorRole: 'Faculty Lead, Management Studies',
    instructorAvatar: '/assets/img/user/user-01.jpg',
    category: 'Executive Business Module',
  },
};

export const CourseCheckout: React.FC = () => {
  const route = all_routes;
  const location = useLocation();
  const { user } = useAuth();

  // Support both ?id=8 and ?courseId=8, defaulting to 8
  const searchParams = new URLSearchParams(location.search);
  const rawIdParam = searchParams.get('id') || searchParams.get('courseId') || '8';
  const requestedCourseId = parseInt(rawIdParam, 10) || 8;

  const [selectedCourseId, setSelectedCourseId] = useState<number>(requestedCourseId);
  const [liveCourse, setLiveCourse] = useState<PublicCatalogCourse | null>(null);
  const [catalogList, setCatalogList] = useState<PublicCatalogCourse[]>([]);
  const [paymentMode, setPaymentMode] = useState<'mobile' | 'card' | 'bank'>('mobile');
  const [showAddressFields, setShowAddressFields] = useState<boolean>(false);

  // Fallback metadata lookup
  const fallbackMeta = COURSE_CATALOG_FALLBACK[selectedCourseId] || COURSE_CATALOG_FALLBACK[8];

  // Derived course display information
  const courseMeta: CourseMetaInfo = {
    code: liveCourse?.shortname || fallbackMeta.code,
    title: liveCourse?.fullname || fallbackMeta.title,
    price: liveCourse?.priceFormatted || fallbackMeta.price,
    rawAmount: String(liveCourse?.tuitionFee || fallbackMeta.rawAmount),
    usdPrice: liveCourse?.priceUSDFormatted || fallbackMeta.usdPrice,
    itemId: liveCourse?.id || fallbackMeta.itemId,
    img: liveCourse?.courseImage || fallbackMeta.img,
    cpdCredits: liveCourse?.cpdCredits || fallbackMeta.cpdCredits,
    duration: liveCourse?.duration || fallbackMeta.duration,
    delivery: liveCourse?.deliveryMode || fallbackMeta.delivery,
    instructor: liveCourse?.instructor?.fullname || fallbackMeta.instructor,
    instructorRole: liveCourse?.instructor?.role || fallbackMeta.instructorRole,
    instructorAvatar: liveCourse?.instructor?.avatar || fallbackMeta.instructorAvatar,
    category: liveCourse?.categoryName || fallbackMeta.category,
  };

  // Student Billing Information pre-populated from authenticated user
  const [formData, setFormData] = useState(() => {
    const parts = (user?.name || 'Baraka Mkwawa').trim().split(/\s+/);
    return {
      firstName: parts[0] || 'Baraka',
      lastName: parts.slice(1).join(' ') || 'Mkwawa',
      email: user?.email || 'student@out.ac.tz',
      phone: user?.phone?.replace(/\s+/g, '') || '0712345678',
      address1: 'Kawawa Road, Kinondoni',
      city: 'Dar es Salaam',
      country: 'Tanzania',
    };
  });

  useEffect(() => {
    if (user) {
      const parts = (user.name || '').trim().split(/\s+/);
      setFormData((prev) => ({
        ...prev,
        firstName: parts[0] || prev.firstName,
        lastName: parts.slice(1).join(' ') || prev.lastName,
        email: user.email || prev.email,
        phone: user.phone ? user.phone.replace(/\s+/g, '') : prev.phone,
      }));
    }
  }, [user]);

  // Load live course catalog from Moodle backend
  useEffect(() => {
    let active = true;
    courseService
      .getShortCoursesCatalog()
      .then((data) => {
        if (!active) return;
        if (data && data.courses && data.courses.length > 0) {
          setCatalogList(data.courses);
          const found = data.courses.find((c) => c.id === selectedCourseId);
          if (found) {
            setLiveCourse(found);
          }
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [selectedCourseId]);

  // Pesapal Order & Status State
  const [loading, setLoading] = useState(false);
  const [pesapalOrder, setPesapalOrder] = useState<PesapalOrderResult | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [iframeLoading, setIframeLoading] = useState(true);
  const [statusResult, setStatusResult] = useState<PesapalStatusResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Listen for postMessage from process.php when payment completes inside embedded iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'PESAPAL_PAYMENT_STATUS') {
        if (event.data.isCompleted) {
          setStatusResult({
            order_tracking_id: event.data.orderTrackingId || '',
            status: 'COMPLETED',
            amount: courseMeta.rawAmount,
            currency: 'TZS',
            payment_method: 'Pesapal Gateway',
            payment_account: 'OUT LMS Main Account',
            is_completed: true,
            message: 'Your payment was successfully confirmed and your course enrolment is active!',
          });
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [courseMeta.rawAmount]);

  // Auto-poll transaction status from backend
  useEffect(() => {
    if (!pesapalOrder?.order_tracking_id || statusResult?.is_completed) {
      return;
    }

    const intervalId = setInterval(async () => {
      try {
        const res = await paymentService.checkPesapalStatus(
          pesapalOrder.order_tracking_id,
          'enrol_fee',
          'fee',
          courseMeta.itemId
        );
        if (res.is_completed) {
          setStatusResult(res);
          clearInterval(intervalId);
        }
      } catch {
        // Background polling
      }
    }, 5000);

    return () => clearInterval(intervalId);
  }, [pesapalOrder, statusResult, courseMeta.itemId]);

  // Initiate payment order with Pesapal API 3.0 via Moodle Web Service
  const handleInitiatePesapal = async () => {
    setLoading(true);
    setIframeLoading(true);
    setErrorMessage(null);
    setStatusResult(null);

    try {
      const order = await paymentService.createPesapalOrder({
        component: 'enrol_fee',
        paymentarea: 'fee',
        itemid: courseMeta.itemId,
        phone: formData.phone,
        description: `${courseMeta.title} Enrolment Fee`,
      });

      setPesapalOrder(order);
    } catch (err: any) {
      console.error('Pesapal checkout error:', err);
      setErrorMessage(err.message || 'Failed to initialize payment gateway. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Manual verification trigger
  const handleVerifyStatus = async () => {
    if (!pesapalOrder?.order_tracking_id) return;
    setCheckingStatus(true);
    setErrorMessage(null);

    try {
      const status = await paymentService.checkPesapalStatus(
        pesapalOrder.order_tracking_id,
        'enrol_fee',
        'fee',
        courseMeta.itemId
      );
      setStatusResult(status);
    } catch (err: any) {
      console.error('Status verification error:', err);
      setErrorMessage(err.message || 'Could not verify status. Please retry in a few moments.');
    } finally {
      setCheckingStatus(false);
    }
  };

  // Dedicated Window option
  const handleOpenDedicatedWindow = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (pesapalOrder?.redirect_url) {
      const popup = window.open(
        pesapalOrder.redirect_url,
        'PesapalPaymentWindow',
        'width=650,height=800,scrollbars=yes,resizable=yes'
      );
      if (popup) {
        popup.focus();
      }
    }
  };

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
              Tuition Checkout
            </span>
          </div>

          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-light text-secondary border rounded-pill px-2.5 py-1 d-inline-flex align-items-center gap-1" style={{ fontSize: '11px' }}>
              <i className="feather-shield text-success fs-12" />
              <span>Bank of Tanzania Regulated</span>
            </span>
            <span className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-2.5 py-1 d-inline-flex align-items-center gap-1" style={{ fontSize: '11px' }}>
              <i className="feather-lock fs-12" />
              <span>256-Bit SSL Enrolment</span>
            </span>
          </div>
        </div>
      </div>

      {/* 2. COMPACT SCREEN-FIT CHECKOUT CANVAS */}
      <div className="container-xl py-3 py-md-4">
        {/* Error Alert */}
        {errorMessage && (
          <div className="alert alert-danger border-0 shadow-sm rounded-3 d-flex align-items-center justify-content-between p-3 mb-3">
            <div className="d-flex align-items-center gap-2">
              <i className="feather-alert-triangle fs-18 text-danger" />
              <div className="small fw-medium">{errorMessage}</div>
            </div>
            <button type="button" className="btn-close" onClick={() => setErrorMessage(null)} />
          </div>
        )}

        {/* SUCCESS CONFIRMATION SCREEN */}
        {statusResult?.is_completed ? (
          <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 text-center bg-white mx-auto my-3" style={{ maxWidth: '640px' }}>
            <div className="mb-3">
              <div
                className="rounded-circle bg-success text-white d-inline-flex align-items-center justify-content-center shadow-sm"
                style={{ width: '72px', height: '72px' }}
              >
                <i className="feather-check fs-36" style={{ strokeWidth: 3 }} />
              </div>
            </div>

            <div className="d-inline-flex align-items-center justify-content-center gap-2 mb-1">
              <span className="badge bg-success-subtle text-success rounded-pill px-3 py-1 font-monospace" style={{ fontSize: '11px' }}>
                PAYMENT CONFIRMED • SARIS ENROLLED
              </span>
            </div>

            <h4 className="fw-bold text-dark mb-2">Tuition Successfully Verified!</h4>
            <p className="text-muted small mb-4">
              Your payment of <strong className="text-dark">{courseMeta.price}</strong> has been cleared. You now have full lifetime access to lectures, study materials, and virtual labs.
            </p>

            <div className="bg-light border rounded-3 p-3 text-start mb-4">
              <div className="d-flex justify-content-between align-items-center mb-1.5">
                <span className="text-muted small">Course Enrolled:</span>
                <span className="fw-bold text-dark small text-end">{courseMeta.title}</span>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-1.5">
                <span className="text-muted small">Scholar Reg ID:</span>
                <span className="font-monospace small fw-semibold text-dark">{formData.email}</span>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-1.5">
                <span className="text-muted small">Pesapal Tracking Ref:</span>
                <span className="font-monospace small fw-bold text-primary">{statusResult.order_tracking_id}</span>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <span className="text-muted small">Accreditation:</span>
                <span className="badge bg-primary text-white rounded-pill px-2 py-0.5" style={{ fontSize: '10px' }}>
                  {courseMeta.cpdCredits} CPD Credits
                </span>
              </div>
            </div>

            <div className="d-flex flex-column flex-sm-row justify-content-center gap-2">
              <Link
                to={`${route.courseWatch}?courseId=${selectedCourseId}`}
                className="btn btn-primary rounded-pill px-4 py-2.5 fw-semibold shadow-sm d-inline-flex align-items-center justify-content-center gap-2"
                style={{ backgroundColor: '#0171BB' }}
              >
                <i className="feather-play-circle fs-16" />
                <span>Enter Classroom &amp; Start Learning</span>
              </Link>
              <button
                type="button"
                className="btn btn-outline-secondary rounded-pill px-4 py-2.5 small"
                onClick={() => {
                  setPesapalOrder(null);
                  setStatusResult(null);
                }}
              >
                New Transaction
              </button>
            </div>
          </div>
        ) : (
          <div className="row g-3 g-lg-4 align-items-start">
            {/* LEFT COLUMN: COMPACT SCHOLAR FORM & PAYMENT GATEWAY */}
            <div className="col-12 col-lg-7">
              {!pesapalOrder ? (
                <>
                  {/* CARD 1: SCHOLAR ENROLLMENT DETAILS (COMPACT 2x2 GRID) */}
                  <div className="card border-0 shadow-sm rounded-3 bg-white p-3 p-md-4 mb-3">
                    <div className="d-flex align-items-center justify-content-between border-bottom pb-2.5 mb-3">
                      <div className="d-flex align-items-center gap-2">
                        <div className="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center" style={{ width: '28px', height: '28px' }}>
                          <i className="feather-user fs-14" />
                        </div>
                        <h6 className="fw-bold mb-0 text-dark">1. Scholar &amp; Contact Details</h6>
                      </div>
                      <span className="badge bg-success-subtle text-success rounded-pill px-2.5 py-1" style={{ fontSize: '11px' }}>
                        <i className="feather-check-circle me-1" /> Verified Session
                      </span>
                    </div>

                    <div className="row g-2.5">
                      <div className="col-6">
                        <label className="form-label text-muted small fw-medium mb-1" style={{ fontSize: '12px' }}>
                          First Name <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className="form-control form-control-sm rounded-3"
                          style={{ height: '38px', fontSize: '13px' }}
                          required
                        />
                      </div>
                      <div className="col-6">
                        <label className="form-label text-muted small fw-medium mb-1" style={{ fontSize: '12px' }}>
                          Last Name <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className="form-control form-control-sm rounded-3"
                          style={{ height: '38px', fontSize: '13px' }}
                          required
                        />
                      </div>

                      <div className="col-12 col-sm-6">
                        <label className="form-label text-muted small fw-medium mb-1" style={{ fontSize: '12px' }}>
                          Institutional Email <span className="text-danger">*</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="form-control form-control-sm rounded-3"
                          style={{ height: '38px', fontSize: '13px' }}
                          required
                        />
                      </div>

                      <div className="col-12 col-sm-6">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <label className="form-label text-muted small fw-medium mb-0" style={{ fontSize: '12px' }}>
                            Phone (Mobile Money) <span className="text-danger">*</span>
                          </label>
                          <span className="text-primary fw-medium" style={{ fontSize: '10px' }}>TZ Networks</span>
                        </div>
                        <input
                          type="text"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="form-control form-control-sm rounded-3 font-monospace"
                          placeholder="0712345678"
                          style={{ height: '38px', fontSize: '13px' }}
                          required
                        />
                      </div>

                      {/* Collapsible Address Fields for clean compactness */}
                      <div className="col-12 mt-2">
                        <button
                          type="button"
                          className="btn btn-link p-0 text-decoration-none small text-muted d-inline-flex align-items-center gap-1"
                          style={{ fontSize: '12px' }}
                          onClick={() => setShowAddressFields(!showAddressFields)}
                        >
                          <i className={`feather-${showAddressFields ? 'minus-circle' : 'plus-circle'} fs-12`} />
                          <span>{showAddressFields ? 'Hide physical billing address' : '+ Add physical billing address (Optional for e-Invoice)'}</span>
                        </button>
                      </div>

                      {showAddressFields && (
                        <>
                          <div className="col-12 mt-2">
                            <input
                              type="text"
                              name="address1"
                              value={formData.address1}
                              onChange={handleInputChange}
                              placeholder="Street Address or Regional Centre"
                              className="form-control form-control-sm rounded-3"
                              style={{ height: '36px', fontSize: '13px' }}
                            />
                          </div>
                          <div className="col-6">
                            <input
                              type="text"
                              name="city"
                              value={formData.city}
                              onChange={handleInputChange}
                              placeholder="City / Region"
                              className="form-control form-control-sm rounded-3"
                              style={{ height: '36px', fontSize: '13px' }}
                            />
                          </div>
                          <div className="col-6">
                            <input
                              type="text"
                              name="country"
                              value={formData.country}
                              onChange={handleInputChange}
                              placeholder="Country"
                              className="form-control form-control-sm rounded-3"
                              style={{ height: '36px', fontSize: '13px' }}
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* CARD 2: PAYMENT METHOD & INSTANT INITIATE */}
                  <div className="card border-0 shadow-sm rounded-3 bg-white p-3 p-md-4">
                    <div className="d-flex align-items-center justify-content-between border-bottom pb-2.5 mb-3">
                      <div className="d-flex align-items-center gap-2">
                        <div className="rounded-circle bg-success-subtle text-success d-flex align-items-center justify-content-center" style={{ width: '28px', height: '28px' }}>
                          <i className="feather-credit-card fs-14" />
                        </div>
                        <h6 className="fw-bold mb-0 text-dark">2. Payment Method &amp; Gateway</h6>
                      </div>
                      <img src="/assets/img/icons/pesapal.svg" alt="Pesapal" height="18" className="opacity-75" />
                    </div>

                    {/* Mode Selector Tabs (Mobile Money / Cards / Bank) */}
                    <div className="row g-2 mb-3">
                      <div className="col-4">
                        <button
                          type="button"
                          onClick={() => setPaymentMode('mobile')}
                          className={`btn w-100 py-2 px-2 text-start rounded-3 border d-flex flex-column justify-content-between h-100 ${
                            paymentMode === 'mobile'
                              ? 'border-primary bg-primary-subtle text-primary shadow-xs'
                              : 'border-light bg-light text-muted'
                          }`}
                        >
                          <div className="d-flex align-items-center justify-content-between mb-1">
                            <i className="feather-smartphone fs-16" />
                            {paymentMode === 'mobile' && <i className="feather-check-circle fs-12 text-primary" />}
                          </div>
                          <div>
                            <div className="fw-bold small text-dark" style={{ fontSize: '12px' }}>Mobile Money</div>
                            <div className="text-muted" style={{ fontSize: '10px' }}>M-Pesa / Tigo / Airtel</div>
                          </div>
                        </button>
                      </div>

                      <div className="col-4">
                        <button
                          type="button"
                          onClick={() => setPaymentMode('card')}
                          className={`btn w-100 py-2 px-2 text-start rounded-3 border d-flex flex-column justify-content-between h-100 ${
                            paymentMode === 'card'
                              ? 'border-primary bg-primary-subtle text-primary shadow-xs'
                              : 'border-light bg-light text-muted'
                          }`}
                        >
                          <div className="d-flex align-items-center justify-content-between mb-1">
                            <i className="feather-credit-card fs-16" />
                            {paymentMode === 'card' && <i className="feather-check-circle fs-12 text-primary" />}
                          </div>
                          <div>
                            <div className="fw-bold small text-dark" style={{ fontSize: '12px' }}>Debit / Credit</div>
                            <div className="text-muted" style={{ fontSize: '10px' }}>Visa &amp; Mastercard</div>
                          </div>
                        </button>
                      </div>

                      <div className="col-4">
                        <button
                          type="button"
                          onClick={() => setPaymentMode('bank')}
                          className={`btn w-100 py-2 px-2 text-start rounded-3 border d-flex flex-column justify-content-between h-100 ${
                            paymentMode === 'bank'
                              ? 'border-primary bg-primary-subtle text-primary shadow-xs'
                              : 'border-light bg-light text-muted'
                          }`}
                        >
                          <div className="d-flex align-items-center justify-content-between mb-1">
                            <i className="feather-briefcase fs-16" />
                            {paymentMode === 'bank' && <i className="feather-check-circle fs-12 text-primary" />}
                          </div>
                          <div>
                            <div className="fw-bold small text-dark" style={{ fontSize: '12px' }}>Bank Transfer</div>
                            <div className="text-muted" style={{ fontSize: '10px' }}>BOT RTGS / Direct Wire</div>
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Channel Badges Container */}
                    <div className="p-2.5 rounded-3 border bg-light mb-3">
                      <div className="d-flex align-items-center justify-content-between flex-wrap gap-1 mb-1.5">
                        <span className="small text-muted fw-semibold" style={{ fontSize: '11px' }}>Supported Payment Rails:</span>
                        <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill" style={{ fontSize: '10px' }}>
                          Instant Confirmation
                        </span>
                      </div>
                      <div className="d-flex flex-wrap gap-1.5 align-items-center">
                        <span className="badge bg-white text-dark border px-2 py-1 shadow-xs" style={{ fontSize: '11px' }}>🟢 Vodacom M-Pesa</span>
                        <span className="badge bg-white text-dark border px-2 py-1 shadow-xs" style={{ fontSize: '11px' }}>🔵 Tigo Pesa</span>
                        <span className="badge bg-white text-dark border px-2 py-1 shadow-xs" style={{ fontSize: '11px' }}>🔴 Airtel Money</span>
                        <span className="badge bg-white text-dark border px-2 py-1 shadow-xs" style={{ fontSize: '11px' }}>🟠 Halopesa</span>
                        <span className="badge bg-white text-dark border px-2 py-1 shadow-xs" style={{ fontSize: '11px' }}>💳 Visa / MC</span>
                      </div>
                    </div>

                    {/* Instant Pay Primary Action */}
                    <button
                      type="button"
                      className="btn btn-primary w-100 rounded-pill py-2.5 fw-semibold shadow-sm d-flex align-items-center justify-content-center gap-2"
                      style={{ backgroundColor: '#0171BB', fontSize: '14px' }}
                      onClick={handleInitiatePesapal}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm" role="status" />
                          <span>Connecting to Pesapal Gateway...</span>
                        </>
                      ) : (
                        <>
                          <i className="feather-lock fs-15" />
                          <span>Pay {courseMeta.price} with Pesapal Gateway</span>
                        </>
                      )}
                    </button>

                    <div className="d-flex align-items-center justify-content-center gap-3 mt-2.5 text-muted" style={{ fontSize: '11px' }}>
                      <span className="d-inline-flex align-items-center gap-1">
                        <i className="feather-check text-success" /> Zero Transaction Fees
                      </span>
                      <span>•</span>
                      <span className="d-inline-flex align-items-center gap-1">
                        <i className="feather-shield text-primary" /> SARIS Enrolment Guarantee
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                /* EMBEDDED PESAPAL ACTIVE TERMINAL CARD */
                <div className="card border-0 shadow-sm rounded-3 bg-white p-3 p-md-4">
                  <div className="d-flex align-items-center justify-content-between flex-wrap border-bottom pb-2.5 mb-3 gap-2">
                    <div className="d-flex align-items-center gap-2">
                      <span className="spinner-grow spinner-grow-sm text-primary" role="status" />
                      <div>
                        <div className="fw-bold small text-dark">Pesapal 3.0 Secure Payment Terminal</div>
                        <div className="text-muted" style={{ fontSize: '11px' }}>
                          Ref: <span className="font-monospace fw-semibold">{pesapalOrder.order_tracking_id}</span>
                        </div>
                      </div>
                    </div>

                    <div className="d-flex align-items-center gap-1.5">
                      <button
                        type="button"
                        onClick={handleOpenDedicatedWindow}
                        className="btn btn-outline-primary btn-sm rounded-pill px-3"
                        style={{ fontSize: '11px' }}
                      >
                        <i className="feather-external-link me-1" /> Dedicated Window
                      </button>
                      <button
                        type="button"
                        onClick={handleVerifyStatus}
                        disabled={checkingStatus}
                        className="btn btn-light btn-sm rounded-pill border px-3"
                        style={{ fontSize: '11px' }}
                      >
                        <i className={`feather-refresh-cw me-1 ${checkingStatus ? 'spin' : ''}`} /> Verify
                      </button>
                      <button
                        type="button"
                        onClick={() => setPesapalOrder(null)}
                        className="btn btn-outline-secondary btn-sm rounded-pill px-2.5"
                        style={{ fontSize: '11px' }}
                      >
                        Edit
                      </button>
                    </div>
                  </div>

                  {/* Compact Embedded Terminal Viewport */}
                  <div className="position-relative rounded-3 border overflow-hidden" style={{ minHeight: '520px', background: '#fafafa' }}>
                    {iframeLoading && (
                      <div className="d-flex flex-column align-items-center justify-content-center p-4 text-center position-absolute w-100 h-100 bg-white" style={{ zIndex: 3 }}>
                        <div className="spinner-border text-primary mb-2" style={{ width: '2.5rem', height: '2.5rem' }} role="status" />
                        <div className="fw-bold text-dark small mb-1">Loading Bank Payment Channels...</div>
                        <p className="text-muted small mb-3" style={{ fontSize: '11px' }}>
                          Connecting with Vodacom, Tigo, Airtel &amp; Bank rails
                        </p>
                        <button
                          type="button"
                          onClick={handleOpenDedicatedWindow}
                          className="btn btn-primary btn-sm rounded-pill px-3"
                          style={{ fontSize: '11px', backgroundColor: '#0171BB' }}
                        >
                          Open in Dedicated Window Now
                        </button>
                      </div>
                    )}

                    <iframe
                      src={pesapalOrder.redirect_url}
                      title="Pesapal Checkout Interface"
                      width="100%"
                      height="540px"
                      style={{ border: 'none', display: 'block' }}
                      allow="payment"
                      onLoad={() => setIframeLoading(false)}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: COMPACT ORDER SUMMARY CARD */}
            <div className="col-12 col-lg-5">
              <div className="card border-0 shadow-sm rounded-3 bg-white p-3 p-md-4 sticky-top" style={{ top: '20px' }}>
                <div className="d-flex align-items-center justify-content-between border-bottom pb-2.5 mb-3">
                  <h6 className="fw-bold mb-0 text-dark">Order Summary</h6>
                  <span className="badge bg-primary-subtle text-primary rounded-pill px-2.5 py-1" style={{ fontSize: '11px' }}>
                    {courseMeta.cpdCredits} CPD Credits
                  </span>
                </div>

                {/* Course Thumbnail & Meta Header */}
                <div className="d-flex gap-3 mb-3 pb-3 border-bottom">
                  <img
                    src={courseMeta.img}
                    alt={courseMeta.title}
                    className="rounded-3 border object-fit-cover flex-shrink-0"
                    style={{ width: '76px', height: '64px', objectFit: 'cover' }}
                    onError={(e: any) => {
                      const ownFallback = `/assets/img/course/thumbnails/course-${courseMeta.itemId}-${(courseMeta.code || `course-${courseMeta.itemId}`).toLowerCase().replace(/[^a-z0-9]/g, '-')}.svg`;
                      if (e.target.src !== ownFallback && !e.target.src.endsWith(ownFallback)) {
                        e.target.src = ownFallback;
                      }
                    }}
                  />
                  <div className="flex-grow-1 min-w-0">
                    <div className="badge bg-light text-secondary border px-2 py-0.5 rounded-pill mb-1" style={{ fontSize: '10px' }}>
                      {courseMeta.category}
                    </div>
                    <h6 className="fw-bold text-dark text-truncate mb-1" title={courseMeta.title} style={{ fontSize: '13px' }}>
                      {courseMeta.title}
                    </h6>
                    <div className="text-muted d-flex align-items-center gap-1.5" style={{ fontSize: '11px' }}>
                      <i className="feather-user fs-12 text-primary" />
                      <span className="text-truncate">{courseMeta.instructor}</span>
                    </div>
                  </div>
                </div>

                {/* Key Course Academic Highlights */}
                <div className="d-flex flex-wrap gap-1.5 mb-3">
                  <span className="badge bg-light text-dark border px-2 py-1 rounded-pill" style={{ fontSize: '11px' }}>
                    <i className="feather-clock me-1 text-primary" /> {courseMeta.duration.split('(')[0]}
                  </span>
                  <span className="badge bg-light text-dark border px-2 py-1 rounded-pill" style={{ fontSize: '11px' }}>
                    <i className="feather-video me-1 text-success" /> Live Webinars
                  </span>
                  <span className="badge bg-light text-dark border px-2 py-1 rounded-pill" style={{ fontSize: '11px' }}>
                    <i className="feather-award me-1 text-warning" /> QR Certificate
                  </span>
                </div>

                {/* Course Switcher (Quick Toggle) */}
                <div className="mb-3">
                  <label className="form-label text-muted small fw-medium mb-1" style={{ fontSize: '11px' }}>
                    Switch Selected Short Course:
                  </label>
                  <select
                    className="form-select form-select-sm rounded-3"
                    style={{ fontSize: '12px' }}
                    value={selectedCourseId}
                    onChange={(e) => {
                      const newId = Number(e.target.value);
                      setSelectedCourseId(newId);
                      setPesapalOrder(null);
                      setStatusResult(null);
                    }}
                  >
                    {catalogList.length > 0 ? (
                      catalogList.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.fullname} ({c.priceFormatted})
                        </option>
                      ))
                    ) : (
                      <>
                        <option value={8}>Data Science &amp; Applied Machine Learning (TZS 180,000)</option>
                        <option value={7}>Cybersecurity &amp; Network Defense (TZS 180,000)</option>
                        <option value={9}>Web &amp; Mobile Applications Development (TZS 180,000)</option>
                        <option value={11}>Cloud Infrastructure &amp; Systems (TZS 180,000)</option>
                        <option value={2}>CS101: Data Structures in Python (TZS 150,000)</option>
                        <option value={3}>CS202: Cloud Computing (TZS 180,000)</option>
                        <option value={4}>BBA301: Financial Management (TZS 220,000)</option>
                      </>
                    )}
                  </select>
                </div>

                {/* Tuition Cost Breakdown Table */}
                <div className="border-top pt-2.5 mb-3" style={{ fontSize: '12px' }}>
                  <div className="d-flex justify-content-between align-items-center mb-1.5 text-muted">
                    <span>Course Tuition Fee:</span>
                    <span className="fw-semibold text-dark">{courseMeta.price}</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-1.5 text-muted">
                    <span>Payment Processing Fee:</span>
                    <span className="text-success fw-medium">Free (Waived by OUT)</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-1.5 text-muted">
                    <span>SARIS Exam &amp; Certification:</span>
                    <span className="text-success fw-medium">Included</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-2 text-muted">
                    <span>Value Added Tax (VAT 0%):</span>
                    <span className="fw-semibold text-dark">TZS 0</span>
                  </div>

                  <div className="d-flex justify-content-between align-items-center pt-2.5 border-top">
                    <div>
                      <div className="fw-bold text-dark fs-6 mb-0">Total Due</div>
                      <div className="text-muted" style={{ fontSize: '10px' }}>Approx {courseMeta.usdPrice} USD</div>
                    </div>
                    <div className="text-end">
                      <h4 className="fw-bold text-primary mb-0">{courseMeta.price}</h4>
                    </div>
                  </div>
                </div>

                {/* Institutional Accreditation Pill */}
                <div className="bg-light rounded-3 p-2 text-center border">
                  <div className="text-muted" style={{ fontSize: '11px' }}>
                    <i className="feather-check-circle text-success me-1" />
                    <strong>SARIS &amp; TCU Accredited</strong> • Open University of Tanzania
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. MOBILE-ONLY BOTTOM FIXED STICKY ACTION BAR */}
      {!statusResult?.is_completed && !pesapalOrder && (
        <div className="d-block d-lg-none fixed-bottom bg-white border-top shadow-lg p-2.5 px-3">
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <div className="text-muted" style={{ fontSize: '10px' }}>Total Amount Due:</div>
              <div className="fw-bold text-primary fs-6 mb-0">{courseMeta.price}</div>
            </div>
            <button
              type="button"
              className="btn btn-primary rounded-pill px-4 py-2 fw-semibold shadow-sm d-inline-flex align-items-center gap-1.5"
              style={{ backgroundColor: '#0171BB', fontSize: '13px' }}
              onClick={handleInitiatePesapal}
              disabled={loading}
            >
              <i className="feather-lock fs-13" />
              <span>Pay Now</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseCheckout;
