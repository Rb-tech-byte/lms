import React, { useState } from 'react';
import { callInternalApi } from '../../../core/api/apiClient';
import { useCmsConfig } from '../../../core/api/cmsService';

const ContactUs: React.FC = () => {
  const { cms } = useCmsConfig();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('General Academic & Admissions Inquiry');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    if (!name.trim() || !email.trim() || !message.trim()) {
      setFeedback({ type: 'danger', text: 'Full name, email, and message are required.' });
      return;
    }
    setSubmitting(true);
    try {
      const res = await callInternalApi<{ reference?: string; ticketId?: string; message: string }>(
        'submit_contact_inquiry',
        {
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          subject: subject.trim(),
          message: message.trim(),
        }
      );
      setFeedback({
        type: 'success',
        text: res.message || `Inquiry logged (${res.reference || res.ticketId || 'OUT-INQ'}).`,
      });
      setName('');
      setEmail('');
      setPhone('');
      setMessage('');
    } catch (err: any) {
      setFeedback({
        type: 'danger',
        text: err?.message || 'Unable to submit inquiry at this time.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: '82vh' }}>
      <section
        className="py-4"
        style={{
          background: 'linear-gradient(135deg, #013BA6 0%, #013BA6 55%, #228DDD 100%)',
          borderBottom: '3px solid #F4ED2D',
        }}
      >
        <div className="container">
          <span
            className="badge rounded-pill px-3 py-1 fw-bold mb-2"
            style={{ background: '#F4ED2D', color: '#051426', fontSize: '0.72rem' }}
          >
            SCHOLAR SUPPORT & ADMISSIONS HELPDESK
          </span>
          <h1 className="fw-bold text-white mb-1" style={{ fontSize: 'clamp(1.35rem, 2.2vw, 1.8rem)' }}>
            Contact University Headquarters & Regional Centres
          </h1>
          <p className="mb-0" style={{ color: '#cbd5e1', fontSize: '0.88rem', maxWidth: 640 }}>
            Reach out to our admissions desk, examination support office, or technical helpdesk for immediate assistance.
          </p>
        </div>
      </section>

      <section className="py-4">
        <div className="container">
          <div className="row g-4">
            {/* Left Contact Info Cards */}
            <div className="col-lg-5">
              <div className="d-flex flex-column gap-3">
                <div className="card border-0 shadow-sm rounded-4 p-3.5 bg-white">
                  <div className="p-3 d-flex align-items-start gap-3">
                    <span
                      className="rounded-3 d-inline-flex align-items-center justify-content-center flex-shrink-0"
                      style={{ width: 44, height: 44, background: '#eff6ff', color: '#013BA6' }}
                    >
                      <i className="isax isax-location fs-4" />
                    </span>
                    <div>
                      <h6 className="fw-bold text-dark mb-1">University Headquarters</h6>
                      <p className="text-muted small mb-0">
                        {cms.footer?.address || 'Kawawa Road, Kinondoni, P.O. Box 23409, Dar es Salaam, Tanzania'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="card border-0 shadow-sm rounded-4 p-3.5 bg-white">
                  <div className="p-3 d-flex align-items-start gap-3">
                    <span
                      className="rounded-3 d-inline-flex align-items-center justify-content-center flex-shrink-0"
                      style={{ width: 44, height: 44, background: '#ecfdf5', color: '#059669' }}
                    >
                      <i className="isax isax-call-calling fs-4" />
                    </span>
                    <div>
                      <h6 className="fw-bold text-dark mb-1">Telephone & Direct Line</h6>
                      <p className="text-muted small mb-0">
                        {cms.footer?.phone || '+255 22 266 8992 / +255 22 266 8820'} (Mon – Fri, 08:00 – 17:00 EAT)
                      </p>
                    </div>
                  </div>
                </div>

                <div className="card border-0 shadow-sm rounded-4 p-3.5 bg-white">
                  <div className="p-3 d-flex align-items-start gap-3">
                    <span
                      className="rounded-3 d-inline-flex align-items-center justify-content-center flex-shrink-0"
                      style={{ width: 44, height: 44, background: '#fffbeb', color: '#d97706' }}
                    >
                      <i className="isax isax-sms fs-4" />
                    </span>
                    <div>
                      <h6 className="fw-bold text-dark mb-1">Official Helpdesk Email</h6>
                      <p className="text-muted small mb-0">
                        {cms.footer?.email || 'helpdesk@out.ac.tz'} • admissions@out.ac.tz
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Interactive Inquiry Form */}
            <div className="col-lg-7">
              <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                <h5 className="fw-bold text-dark mb-1">Submit an Academic or Support Inquiry</h5>
                <p className="text-muted small mb-3">
                  Your inquiry is routed directly to the relevant faculty or admissions officer.
                </p>

                {feedback && (
                  <div className={`alert alert-${feedback.type} py-2 px-3 small rounded-3 mb-3`}>
                    {feedback.text}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold mb-1">Full Name *</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g., Baraka Mkwawa"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold mb-1">Email Address *</label>
                      <input
                        type="email"
                        className="form-control form-control-sm"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="scholar@out.ac.tz"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold mb-1">Phone Number</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+255 712 345 678"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold mb-1">Department / Topic</label>
                      <select
                        className="form-select form-select-sm"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                      >
                        <option value="General Academic & Admissions Inquiry">General Academic & Admissions</option>
                        <option value="Course Registration & Tuition Payment">Course Registration & Tuition</option>
                        <option value="Digital Classroom & Portal Access">Digital Classroom & Portal Access</option>
                        <option value="Examinations & Transcripts">Examinations & Transcripts</option>
                      </select>
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-semibold mb-1">Your Message *</label>
                      <textarea
                        rows={4}
                        className="form-control form-control-sm"
                        required
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Describe how our academic or technical support team can assist you..."
                      />
                    </div>
                    <div className="col-12">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="btn btn-primary rounded-pill px-4 py-2 fw-semibold"
                        style={{ fontSize: '0.84rem' }}
                      >
                        {submitting ? 'Sending Inquiry...' : 'Submit Inquiry'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactUs;
