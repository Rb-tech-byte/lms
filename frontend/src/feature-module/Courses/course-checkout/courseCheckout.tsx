import React, { useState, useEffect } from 'react';
import Breadcrumb from '../../../core/common/Breadcrumb/breadcrumb';
import { Link } from 'react-router-dom';
import { all_routes } from '../../router/all_routes';
import ImageWithBasePath from '../../../core/common/imageWithBasePath';
import { paymentService, PesapalOrderResult, PesapalStatusResult } from '../../../core/api/paymentService';

const CourseCheckout = () => {
  const route = all_routes;

  // Student Billing Information
  const [formData, setFormData] = useState({
    firstName: 'Student',
    lastName: 'User',
    email: 'student@out.ac.tz',
    phone: '0712345678',
    address1: 'Kipawa, Ilala',
    city: 'Dar es Salaam',
    country: 'Tanzania',
  });

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

  /**
   * Listen for postMessage from process.php when payment completes inside the embedded iframe
   */
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'PESAPAL_PAYMENT_STATUS') {
        if (event.data.isCompleted) {
          setStatusResult({
            order_tracking_id: event.data.orderTrackingId || '',
            status: 'COMPLETED',
            amount: '150000',
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
  }, []);

  /**
   * Auto-poll transaction status from Moodle backend every 5 seconds while an order is active
   */
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
          10
        );
        if (res.is_completed) {
          setStatusResult(res);
          clearInterval(intervalId);
        }
      } catch (e) {
        // Background polling check
      }
    }, 5000);

    return () => clearInterval(intervalId);
  }, [pesapalOrder, statusResult]);

  /**
   * Initiates real payment order with Pesapal API 3.0 via Moodle Web Service
   */
  const handleInitiatePesapal = async () => {
    setLoading(true);
    setIframeLoading(true);
    setErrorMessage(null);
    setStatusResult(null);

    try {
      // In Moodle fee enrolment, itemid corresponds to the enrol_fee instance ID
      const order = await paymentService.createPesapalOrder({
        component: 'enrol_fee',
        paymentarea: 'fee',
        itemid: 10,
        phone: formData.phone,
        description: 'CS101 - Introduction to Computer Science Enrolment Fee',
      });

      setPesapalOrder(order);
    } catch (err: any) {
      console.error('Pesapal checkout error:', err);
      setErrorMessage(err.message || 'Failed to initialize Pesapal payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Manual verification trigger
   */
  const handleVerifyStatus = async () => {
    if (!pesapalOrder?.order_tracking_id) return;
    setCheckingStatus(true);
    setErrorMessage(null);

    try {
      const status = await paymentService.checkPesapalStatus(pesapalOrder.order_tracking_id);
      setStatusResult(status);
    } catch (err: any) {
      console.error('Status verification error:', err);
      setErrorMessage(err.message || 'Could not verify status. Please retry in a few moments.');
    } finally {
      setCheckingStatus(false);
    }
  };

  /**
   * Opens Pesapal checkout in a focused dedicated window with window.opener attached
   * This provides full compatibility with browsers that restrict cross-site cookies in iframes.
   */
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
    <>
      <Breadcrumb title="Checkout" />
      <div className="content">
        <div className="container">
          <div className="checkout-content">
            <div className="row">
              <div className="col-lg-8">
                {/* SUCCESS SCREEN */}
                {statusResult?.is_completed ? (
                  <div className="card shadow-sm border-0 rounded-4 p-4 text-center mb-4 bg-white">
                    <div className="mb-3">
                      <div
                        className="rounded-circle bg-success text-white d-inline-flex align-items-center justify-content-center"
                        style={{ width: '80px', height: '80px' }}
                      >
                        <i className="isax isax-tick-circle text-white" style={{ fontSize: '42px' }}></i>
                      </div>
                    </div>
                    <h3 className="fw-bold text-success mb-2">🎉 Enrolment Confirmed!</h3>
                    <p className="text-muted mb-4 lead fs-6">
                      Your payment of <strong>TZS 150,000</strong> has been verified by Pesapal.
                      You are now officially enrolled in <strong>CS101: Introduction to Computer Science</strong>.
                    </p>

                    <div className="bg-light p-3 rounded-3 text-start mb-4 mx-auto" style={{ maxWidth: '480px' }}>
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-muted small">Tracking Reference:</span>
                        <span className="font-monospace small fw-bold">{statusResult.order_tracking_id}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-muted small">Payment Processor:</span>
                        <span className="badge bg-primary-subtle text-primary">Pesapal API 3.0</span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span className="text-muted small">Status:</span>
                        <span className="badge bg-success">ACTIVE &amp; ENROLLED</span>
                      </div>
                    </div>

                    <div className="d-flex justify-content-center gap-3">
                      <Link to={route.courseDetails} className="btn btn-primary rounded-pill px-5 py-2 fw-semibold">
                        Go to Course Dashboard &rarr;
                      </Link>
                      <button
                        type="button"
                        className="btn btn-outline-secondary rounded-pill px-4"
                        onClick={() => {
                          setPesapalOrder(null);
                          setStatusResult(null);
                        }}
                      >
                        New Payment
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Billing Address */}
                    {!pesapalOrder && (
                      <div className="checkout-item-1 mb-4">
                        <div className="border-bottom pb-3 mb-3">
                          <h5 className="mb-0">Billing &amp; Student Information</h5>
                        </div>
                        <div className="row">
                          <div className="col-md-6">
                            <div className="input-block">
                              <label className="form-label">
                                First Name<span className="text-danger ms-1">*</span>
                              </label>
                              <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleInputChange}
                                className="form-control"
                              />
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="input-block">
                              <label className="form-label">
                                Last Name<span className="text-danger ms-1">*</span>
                              </label>
                              <input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleInputChange}
                                className="form-control"
                              />
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="input-block">
                              <label className="form-label">
                                Email Address<span className="text-danger ms-1">*</span>
                              </label>
                              <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className="form-control"
                              />
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="input-block">
                              <label className="form-label">
                                Phone Number (M-Pesa / Tigo / Airtel)<span className="text-danger ms-1">*</span>
                              </label>
                              <input
                                type="text"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                className="form-control"
                                placeholder="0712345678"
                              />
                            </div>
                          </div>
                          <div className="col-md-12">
                            <div className="input-block">
                              <label className="form-label">
                                Address Line 1<span className="text-danger ms-1">*</span>
                              </label>
                              <input
                                type="text"
                                name="address1"
                                value={formData.address1}
                                onChange={handleInputChange}
                                className="form-control"
                              />
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="input-block">
                              <label className="form-label">City</label>
                              <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleInputChange}
                                className="form-control"
                              />
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="input-block">
                              <label className="form-label">Country</label>
                              <input
                                type="text"
                                name="country"
                                value={formData.country}
                                onChange={handleInputChange}
                                className="form-control"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* PESAPAL UNIFIED PAYMENT GATEWAY */}
                    <div className="checkout-item-1">
                      <div className="border-bottom pb-3 mb-3 d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center">
                          <ImageWithBasePath
                            src="assets/img/icons/pesapal.svg"
                            alt="Pesapal"
                            className="img-fluid me-3"
                            height={32}
                          />
                          <div>
                            <h5 className="mb-0 fw-bold">Pesapal Payment Gateway</h5>
                            <small className="text-muted">
                              Unified checkout for East African Mobile Money, Cards, and Banks
                            </small>
                          </div>
                        </div>
                        <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-1">
                          <i className="isax isax-shield-tick me-1"></i> 256-bit Secure
                        </span>
                      </div>

                      {/* Supported Channels Bar */}
                      <div className="d-flex flex-wrap gap-2 align-items-center mb-4 p-3 bg-light rounded-3 border">
                        <span className="small text-muted fw-semibold me-1">Supported Channels:</span>
                        <span className="badge bg-white text-dark border px-2 py-1 shadow-xs">🟢 Vodacom M-Pesa</span>
                        <span className="badge bg-white text-dark border px-2 py-1 shadow-xs">🔵 Tigo Pesa</span>
                        <span className="badge bg-white text-dark border px-2 py-1 shadow-xs">🔴 Airtel Money</span>
                        <span className="badge bg-white text-dark border px-2 py-1 shadow-xs">🟠 Halopesa</span>
                        <span className="badge bg-white text-dark border px-2 py-1 shadow-xs">💳 Visa &amp; Mastercard</span>
                        <span className="badge bg-white text-dark border px-2 py-1 shadow-xs">🏦 Bank Transfer</span>
                      </div>

                      {errorMessage && (
                        <div className="alert alert-danger d-flex align-items-center mb-3">
                          <i className="isax isax-danger me-2 fs-5"></i>
                          <div>{errorMessage}</div>
                        </div>
                      )}

                      {/* INITIAL CHECKOUT CARD (BEFORE ORDER INITIATION) */}
                      {!pesapalOrder && (
                        <div className="p-4 border rounded-3 bg-white">
                          <div className="d-flex align-items-center justify-content-between mb-3 pb-3 border-bottom">
                            <div>
                              <h6 className="fw-bold mb-1">Course Enrolment Fee</h6>
                              <p className="text-muted mb-0 small">
                                Complete your payment directly via Pesapal's official secure gateway.
                              </p>
                            </div>
                            <span className="badge bg-primary px-3 py-2 fs-6">TZS 150,000</span>
                          </div>

                          <div className="d-flex justify-content-between align-items-center">
                            <span className="text-muted small">
                              Clicking below will embed Pesapal's secure checkout interface right inside this page.
                            </span>
                            <button
                              type="button"
                              className="btn btn-primary rounded-pill px-4 py-2 fw-semibold d-flex align-items-center"
                              onClick={handleInitiatePesapal}
                              disabled={loading}
                            >
                              {loading ? (
                                <>
                                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                  Initializing Pesapal Gateway...
                                </>
                              ) : (
                                <>
                                  <i className="isax isax-card-tick me-2"></i>
                                  Pay with Pesapal (TZS 150,000)
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* EMBEDDED PESAPAL IFRAME SECTION */}
                      {pesapalOrder && (
                        <div className="border border-primary-subtle rounded-3 p-3 bg-white shadow-sm">
                          <div className="d-flex flex-wrap align-items-center justify-content-between pb-3 border-bottom mb-3 gap-2">
                            <div className="d-flex align-items-center gap-2">
                              <span className="spinner-grow spinner-grow-sm text-primary" role="status"></span>
                              <span className="badge bg-primary-subtle text-primary fw-semibold">
                                Secure Checkout Session Active
                              </span>
                              <span className="text-muted small">
                                Tracking ID: <strong className="font-monospace">{pesapalOrder.order_tracking_id}</strong>
                              </span>
                            </div>

                            <div className="d-flex align-items-center gap-2">
                              <button
                                type="button"
                                onClick={handleOpenDedicatedWindow}
                                className="btn btn-outline-success btn-sm rounded-pill px-3"
                                title="Open Pesapal in a dedicated secure window"
                              >
                                <i className="isax isax-export-1 me-1"></i>
                                Pay in Dedicated Window
                              </button>

                              <button
                                type="button"
                                className="btn btn-outline-primary btn-sm rounded-pill px-3"
                                onClick={handleVerifyStatus}
                                disabled={checkingStatus}
                              >
                                {checkingStatus ? (
                                  <>
                                    <span className="spinner-border spinner-border-sm me-1"></span>
                                    Verifying...
                                  </>
                                ) : (
                                  <>
                                    <i className="isax isax-refresh me-1"></i>
                                    Verify Payment Status
                                  </>
                                )}
                              </button>

                              <button
                                type="button"
                                className="btn btn-outline-secondary btn-sm rounded-pill px-3"
                                onClick={() => setPesapalOrder(null)}
                              >
                                Edit Details
                              </button>
                            </div>
                          </div>

                          <div className="small text-muted mb-2 d-flex justify-content-between align-items-center">
                            <span>Select your preferred mobile money network or card below:</span>
                            <span className="small">
                              <button
                                type="button"
                                onClick={handleOpenDedicatedWindow}
                                className="btn btn-link p-0 text-primary fw-semibold text-decoration-none small"
                              >
                                Pay in Dedicated Window &rarr;
                              </button>
                            </span>
                          </div>

                          {/* DIRECT EMBEDDED IFRAME */}
                          <div
                            className="border rounded-3 overflow-hidden position-relative"
                            style={{ minHeight: '680px', background: '#fafafa' }}
                          >
                            {iframeLoading && (
                              <div
                                className="d-flex flex-column align-items-center justify-content-center p-5 text-center position-absolute w-100 h-100"
                                style={{ background: '#fdfdfd', zIndex: 2 }}
                              >
                                <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }} role="status"></div>
                                <h6 className="fw-bold text-dark mb-1">Connecting to Pesapal Payment Gateway...</h6>
                                <p className="text-muted small mb-3">Loading Bank of Tanzania regulated East African payment channels</p>
                                <button
                                  type="button"
                                  onClick={handleOpenDedicatedWindow}
                                  className="btn btn-primary btn-sm rounded-pill px-4"
                                >
                                  Open in Dedicated Window Now
                                </button>
                              </div>
                            )}

                            <iframe
                              src={pesapalOrder.redirect_url}
                              title="Pesapal Checkout Interface"
                              width="100%"
                              height="720px"
                              style={{ border: 'none', display: 'block' }}
                              allow="payment"
                              onLoad={() => setIframeLoading(false)}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Order Summary Sidebar */}
              <div className="col-lg-4">
                <div className="checkout-item-2 shadow-sm rounded-3">
                  <div className="pb-3 border-bottom mb-3">
                    <h5 className="mb-0">Order Summary</h5>
                  </div>
                  <div className="checkout-item-3 bg-light p-3 rounded-3 border mb-3">
                    <div className="row row-gap-2 mb-3">
                      <div className="col-md-12 d-flex align-items-center">
                        <div className="order-img flex-shrink-0 me-3">
                          <ImageWithBasePath
                            src="assets/img/course/course-01.jpg"
                            alt="img"
                            className="img-fluid h-100 w-100"
                          />
                        </div>
                        <div>
                          <h6 className="mb-2">
                            <Link to={route.courseDetails}>
                              CS101: Introduction to Computer Science
                            </Link>
                          </h6>
                          <h6 className="text-primary fw-bold">TZS 150,000</h6>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <p className="mb-0 text-muted">Course Tuition</p>
                    <p className="text-gray-9 fw-medium mb-0">TZS 150,000</p>
                  </div>
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <p className="mb-0 text-muted">Pesapal Processing Fee</p>
                    <p className="text-success fw-medium mb-0">Free (Waived by OUT)</p>
                  </div>
                  <div className="d-flex align-items-center justify-content-between border-bottom pb-3 mb-3">
                    <p className="mb-0 text-muted">Tax / VAT</p>
                    <p className="text-gray-9 fw-medium mb-0">TZS 0</p>
                  </div>
                  <div className="total d-flex align-items-center justify-content-between">
                    <h6 className="mb-0 fw-bold">Total Due</h6>
                    <h4 className="mb-0 text-primary fw-bold">TZS 150,000</h4>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CourseCheckout;
