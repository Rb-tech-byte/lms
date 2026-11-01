import React, { useState } from 'react';
import Breadcrumb from '../../../core/common/Breadcrumb/breadcrumb';
import { Link } from 'react-router-dom';
import { all_routes } from '../../router/all_routes';
import ImageWithBasePath from '../../../core/common/imageWithBasePath';
import { paymentService, PesapalOrderResult, PesapalStatusResult } from '../../../core/api/paymentService';

const CourseCheckout = () => {
  const route = all_routes;

  // Active payment gateway tab
  const [activeTab, setActiveTab] = useState<'pesapal' | 'card' | 'paypal' | 'stripe'>('pesapal');

  // Form inputs
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
  const [statusResult, setStatusResult] = useState<PesapalStatusResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  /**
   * Initiates payment order via Moodle Web Service (paygw_pesapal_create_order)
   */
  const handleInitiatePesapal = async () => {
    setLoading(true);
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
   * Verifies payment status and automated enrolment via Moodle (paygw_pesapal_check_status)
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

  return (
    <>
      <Breadcrumb title="Checkout" />
      <div className="content">
        <div className="container">
          <div className="checkout-content">
            <div className="row">
              <div className="col-lg-8">
                {/* Billing Address */}
                <div className="checkout-item-1">
                  <div className="border-bottom pb-3 mb-3">
                    <h5>Billing Address</h5>
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
                          Phone Number (Mobile Money)<span className="text-danger ms-1">*</span>
                        </label>
                        <input
                          type="text"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="form-control"
                          placeholder="e.g. 0712345678"
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
                        <label className="form-label">
                          City<span className="text-danger ms-1">*</span>
                        </label>
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
                        <label className="form-label">
                          Country<span className="text-danger ms-1">*</span>
                        </label>
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

                {/* Payment Method Selector */}
                <div className="checkout-item-1">
                  <div className="border-bottom pb-3 mb-3 d-flex align-items-center justify-content-between">
                    <h5 className="mb-0">Payment Method</h5>
                    <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-1">
                      <i className="isax isax-shield-tick me-1"></i> 256-bit Secure Checkout
                    </span>
                  </div>

                  <ul
                    className="nav-tabs mb-4 nav-justified border-0 nav-style-1 d-sm-flex d-block gap-2"
                    role="tablist"
                  >
                    <li className="nav-item">
                      <button
                        type="button"
                        className={`btn nav-link p-3 w-100 ${activeTab === 'pesapal' ? 'active border-primary shadow-sm' : ''}`}
                        onClick={() => setActiveTab('pesapal')}
                      >
                        <div className="d-flex justify-content-center align-items-center">
                          <ImageWithBasePath
                            src="assets/img/icons/pesapal.svg"
                            alt="Pesapal"
                            className="img-fluid me-2"
                            height={28}
                          />
                          <div className="text-start">
                            <p className="fw-bold mb-0 text-dark">Pesapal</p>
                            <small className="text-muted" style={{ fontSize: '11px' }}>M-Pesa / Tigo / Airtel / Cards</small>
                          </div>
                        </div>
                      </button>
                    </li>
                    <li className="nav-item">
                      <button
                        type="button"
                        className={`btn nav-link p-3 w-100 ${activeTab === 'card' ? 'active' : ''}`}
                        onClick={() => setActiveTab('card')}
                      >
                        <div className="d-flex justify-content-center align-items-center">
                          <ImageWithBasePath
                            src="assets/img/icons/card.svg"
                            alt="card"
                            className="img-fluid me-2"
                          />
                          <p className="fw-medium mb-0">Card</p>
                        </div>
                      </button>
                    </li>
                    <li className="nav-item">
                      <button
                        type="button"
                        className={`btn nav-link p-3 w-100 ${activeTab === 'paypal' ? 'active' : ''}`}
                        onClick={() => setActiveTab('paypal')}
                      >
                        <div className="d-flex justify-content-center align-items-center">
                          <ImageWithBasePath
                            src="assets/img/icons/paypal-2.svg"
                            alt="paypal"
                            className="img-fluid me-2"
                          />
                          <p className="fw-medium mb-0">PayPal</p>
                        </div>
                      </button>
                    </li>
                    <li className="nav-item">
                      <button
                        type="button"
                        className={`btn nav-link p-3 w-100 ${activeTab === 'stripe' ? 'active' : ''}`}
                        onClick={() => setActiveTab('stripe')}
                      >
                        <div className="d-flex justify-content-center align-items-center">
                          <ImageWithBasePath
                            src="assets/img/icons/stripe.svg"
                            alt="stripe"
                            className="img-fluid me-2"
                          />
                          <p className="fw-medium mb-0">Stripe</p>
                        </div>
                      </button>
                    </li>
                  </ul>

                  {/* PESAPAL TAB CONTENT */}
                  {activeTab === 'pesapal' && (
                    <div className="p-4 border rounded-3 bg-light-subtle">
                      <div className="d-flex align-items-center justify-content-between mb-3 pb-3 border-bottom">
                        <div>
                          <h6 className="fw-bold mb-1 text-primary">Pesapal 3.0 Payment Gateway</h6>
                          <p className="text-muted mb-0 small">
                            Official East Africa payment integration: M-Pesa, Tigo Pesa, Airtel Money, Halopesa &amp; International Cards.
                          </p>
                        </div>
                        <span className="badge bg-primary px-3 py-2 fs-6">TZS 150,000</span>
                      </div>

                      {/* Network Badges */}
                      <div className="d-flex flex-wrap gap-2 align-items-center mb-4">
                        <span className="badge bg-light text-dark border px-3 py-2">🟢 Vodacom M-Pesa</span>
                        <span className="badge bg-light text-dark border px-3 py-2">🔵 Tigo Pesa</span>
                        <span className="badge bg-light text-dark border px-3 py-2">🔴 Airtel Money</span>
                        <span className="badge bg-light text-dark border px-3 py-2">🟠 Halopesa</span>
                        <span className="badge bg-light text-dark border px-3 py-2">💳 Visa &amp; Mastercard</span>
                      </div>

                      {errorMessage && (
                        <div className="alert alert-danger d-flex align-items-center mb-3">
                          <i className="isax isax-danger me-2 fs-5"></i>
                          <div>{errorMessage}</div>
                        </div>
                      )}

                      {/* INITIAL OR PENDING STATE */}
                      {!pesapalOrder && (
                        <div>
                          <div className="bg-white p-3 rounded border mb-3">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <span className="text-muted">Target Course:</span>
                              <span className="fw-semibold">CS101 - Introduction to Computer Science</span>
                            </div>
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <span className="text-muted">Enrolment Fee:</span>
                              <span className="fw-bold text-success">TZS 150,000</span>
                            </div>
                            <div className="d-flex justify-content-between align-items-center">
                              <span className="text-muted">Payment Processor:</span>
                              <span className="badge bg-secondary-subtle text-secondary">Pesapal Sandbox API 3.0</span>
                            </div>
                          </div>

                          <div className="d-flex justify-content-end">
                            <button
                              type="button"
                              className="btn btn-primary rounded-pill px-4 py-2 fw-semibold d-flex align-items-center"
                              onClick={handleInitiatePesapal}
                              disabled={loading}
                            >
                              {loading ? (
                                <>
                                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                  Connecting to Pesapal...
                                </>
                              ) : (
                                <>
                                  <i className="isax isax-card-tick me-2"></i>
                                  Proceed with Pesapal (TZS 150,000)
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* ORDER CREATED & ACTIVE PESAPAL SESSION */}
                      {pesapalOrder && (
                        <div className="border border-success rounded-3 p-3 bg-white">
                          <div className="d-flex align-items-center justify-content-between pb-3 border-bottom mb-3">
                            <div>
                              <span className="badge bg-success-subtle text-success me-2">Order Active</span>
                              <span className="text-muted small">Tracking ID: <strong>{pesapalOrder.order_tracking_id}</strong></span>
                            </div>
                            <span className="fw-bold text-primary">{pesapalOrder.currency} {pesapalOrder.amount}</span>
                          </div>

                          <p className="small text-muted mb-3">
                            Your payment order reference is <code>{pesapalOrder.merchant_reference}</code>.
                            Complete your payment on Pesapal's secure checkout page, then verify below.
                          </p>

                          <div className="d-flex flex-wrap gap-2 mb-3">
                            <a
                              href={pesapalOrder.redirect_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-success rounded-pill px-4"
                            >
                              <i className="isax isax-export-1 me-2"></i>
                              Open Pesapal Payment Page
                            </a>

                            <button
                              type="button"
                              className="btn btn-outline-primary rounded-pill px-4"
                              onClick={handleVerifyStatus}
                              disabled={checkingStatus}
                            >
                              {checkingStatus ? (
                                <>
                                  <span className="spinner-border spinner-border-sm me-2"></span>
                                  Verifying with Moodle...
                                </>
                              ) : (
                                <>
                                  <i className="isax isax-refresh me-2"></i>
                                  Check Enrolment Status
                                </>
                              )}
                            </button>
                          </div>

                          {/* STATUS RESULT DISPLAY */}
                          {statusResult && (
                            <div className={`alert ${statusResult.is_completed ? 'alert-success' : 'alert-info'} mt-3 mb-0`}>
                              <div className="d-flex align-items-center justify-content-between mb-1">
                                <h6 className="alert-heading mb-0 fw-bold">
                                  {statusResult.is_completed ? '🎉 Enrolment Confirmed!' : `Status: ${statusResult.status}`}
                                </h6>
                                <span className="badge bg-dark">{statusResult.payment_method || 'Mobile Money / Card'}</span>
                              </div>
                              <p className="mb-2 small">{statusResult.message}</p>
                              {statusResult.is_completed && (
                                <Link to={route.courseDetails} className="btn btn-success btn-sm mt-1">
                                  Go to Course Dashboard &rarr;
                                </Link>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* CARD TAB CONTENT */}
                  {activeTab === 'card' && (
                    <div className="p-3 border rounded-3">
                      <div className="row">
                        <div className="col-md-6">
                          <div className="input-block">
                            <label className="form-label">
                              Card Number<span className="text-danger ms-1">*</span>
                            </label>
                            <input type="text" className="form-control" placeholder="4111 2222 3333 4444" />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="input-block">
                            <label className="form-label">
                              Name on Card<span className="text-danger ms-1">*</span>
                            </label>
                            <input type="text" className="form-control" placeholder="Student Name" />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="input-block">
                            <label className="form-label">
                              Expiry Date<span className="text-danger ms-1">*</span>
                            </label>
                            <input type="text" className="form-control" placeholder="MM/YY" />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="input-block">
                            <label className="form-label">
                              CVV<span className="text-danger ms-1">*</span>
                            </label>
                            <input type="text" className="form-control" placeholder="123" />
                          </div>
                        </div>
                        <div className="col-md-12">
                          <div className="d-flex align-items-center justify-content-end">
                            <button type="button" className="btn btn-secondary rounded-pill">
                              Pay $200.25
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* PAYPAL TAB CONTENT */}
                  {activeTab === 'paypal' && (
                    <div className="p-3 border rounded-3">
                      <div className="row">
                        <div className="col-md-6">
                          <div className="input-block">
                            <label className="form-label">
                              PayPal Email<span className="text-danger ms-1">*</span>
                            </label>
                            <input type="email" className="form-control" placeholder="paypal@student.out.ac.tz" />
                          </div>
                        </div>
                        <div className="col-md-12">
                          <div className="d-flex align-items-center justify-content-end">
                            <button type="button" className="btn btn-secondary rounded-pill">
                              Pay via PayPal
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STRIPE TAB CONTENT */}
                  {activeTab === 'stripe' && (
                    <div className="p-3 border rounded-3">
                      <div className="row">
                        <div className="col-md-6">
                          <div className="input-block">
                            <label className="form-label">
                              Stripe Email<span className="text-danger ms-1">*</span>
                            </label>
                            <input type="email" className="form-control" placeholder="user@student.out.ac.tz" />
                          </div>
                        </div>
                        <div className="col-md-12">
                          <div className="d-flex align-items-center justify-content-end">
                            <button type="button" className="btn btn-secondary rounded-pill">
                              Pay via Stripe
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Summary Sidebar */}
              <div className="col-lg-4">
                <div className="checkout-item-2">
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
                    <p className="mb-0 text-muted">Course Fee</p>
                    <p className="text-gray-9 fw-medium mb-0">TZS 150,000</p>
                  </div>
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <p className="mb-0 text-muted">Gateway Processing Fee</p>
                    <p className="text-success fw-medium mb-0">Free (Waived)</p>
                  </div>
                  <div className="d-flex align-items-center justify-content-between border-bottom pb-3 mb-3">
                    <p className="mb-0 text-muted">VAT (Inclusive)</p>
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
