import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { certificateService } from '../../../core/api/certificateService';
import { all_routes } from '../../router/all_routes';

export const VerifyCertificate: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCode = searchParams.get('code') || searchParams.get('ref') || 'OUT-35CB03BB3C';

  const [inputCode, setInputCode] = useState<string>(initialCode);
  const [loading, setLoading] = useState<boolean>(false);
  const [searched, setSearched] = useState<boolean>(false);
  const [result, setResult] = useState<{
    verified: boolean;
    message?: string;
    certificate?: {
      id: number;
      code: string;
      issueDate: string;
      issueTimestamp: number;
      scholarName: string;
      scholarEmail: string;
      regNumber: string;
      courseName: string;
      courseCode: string;
      courseId: number;
      grade: string;
      cpdCredits: number;
      issuer: string;
      accreditation: string;
      signatory: string;
      verificationUrl: string;
    };
  } | null>(null);

  const performVerification = async (codeToVerify: string) => {
    const trimmed = codeToVerify.trim();
    if (!trimmed) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await certificateService.verifyCertificate(trimmed);
      setResult(res);
      setSearchParams({ code: trimmed });
    } catch (err: any) {
      setResult({
        verified: false,
        message: err?.message || 'Verification service temporarily unavailable.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialCode) {
      performVerification(initialCode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performVerification(inputCode);
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: '85vh' }} className="py-5">
      <div className="container">
        {/* Verification Search Header */}
        <div className="row justify-content-center mb-5">
          <div className="col-lg-8 text-center">
            <span
              className="badge rounded-pill px-3 py-1.5 fw-bold mb-3"
              style={{ background: '#071F38', color: '#fbbf24', fontSize: '0.78rem' }}
            >
              CENTRAL ACADEMIC REGISTRY &amp; CREDENTIAL VERIFICATION
            </span>
            <h1 className="fw-bold text-dark mb-2" style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2.1rem)' }}>
              Verify Official OUT Academic Credentials
            </h1>
            <p className="text-muted mb-4" style={{ fontSize: '0.92rem' }}>
              Instant, cryptographic verification for degrees, postgraduate diplomas, and IEMT Professional Short Course &amp; MOOC certificates conferred by The Open University of Tanzania.
            </p>

            <form onSubmit={handleSubmit} className="card border-0 shadow-sm rounded-4 p-2 bg-white">
              <div className="input-group">
                <span className="input-group-text bg-white border-0 text-muted ps-3">
                  <i className="feather-shield text-primary fs-18" />
                </span>
                <input
                  type="text"
                  className="form-control border-0 py-2.5"
                  placeholder="Enter Certificate Reference Code (e.g. OUT-35CB03BB3C)..."
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  style={{ fontSize: '0.9rem' }}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary rounded-3 px-4 fw-bold d-flex align-items-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <i className="feather-check-circle" />
                      <span>Verify Credential</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="d-flex align-items-center justify-content-center gap-3 mt-3 flex-wrap small text-muted" style={{ fontSize: '0.78rem' }}>
              <span>Sample Verified Codes:</span>
              <button
                type="button"
                onClick={() => {
                  setInputCode('OUT-35CB03BB3C');
                  performVerification('OUT-35CB03BB3C');
                }}
                className="btn btn-link btn-sm p-0 text-decoration-none fw-semibold"
              >
                OUT-35CB03BB3C (Cybersecurity)
              </button>
              <span>•</span>
              <span className="text-success fw-medium">
                <i className="feather-lock me-1" /> SARIS &amp; TCU Chartered Registry
              </span>
            </div>
          </div>
        </div>

        {/* Verification Result Display */}
        {searched && (
          <div className="row justify-content-center">
            <div className="col-lg-9">
              {result?.verified && result.certificate ? (
                /* VERIFIED CREDENTIAL CARD */
                <div
                  className="card border-0 shadow-lg rounded-4 overflow-hidden bg-white"
                  style={{ border: '2px solid #10b981' }}
                >
                  {/* Status Banner */}
                  <div
                    className="p-3 text-white d-flex align-items-center justify-content-between flex-wrap gap-2"
                    style={{ background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)' }}
                  >
                    <div className="d-flex align-items-center gap-2">
                      <i className="feather-check-circle fs-22" />
                      <div>
                        <div className="fw-bold fs-16">OFFICIALLY VERIFIED &amp; AUTHENTIC CREDENTIAL</div>
                        <div className="small text-white text-opacity-90" style={{ fontSize: '0.76rem' }}>
                          Registered in The Open University of Tanzania Central Academic Registry
                        </div>
                      </div>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <span className="badge bg-white text-success rounded-pill px-3 py-1.5 fw-bold">
                        TCU &amp; SARIS ACCREDITED
                      </span>
                    </div>
                  </div>

                  {/* Certificate Body (Formal OUT Certificate Layout) */}
                  <div className="p-4 p-md-5">
                    <div
                      className="p-4 p-md-5 rounded-4 text-center position-relative"
                      style={{
                        border: '8px double #cbd5e1',
                        background: '#fcfcfd',
                      }}
                    >
                      {/* University Header Crest & Branding */}
                      <div className="mb-4">
                        <img
                          src="/assets/img/out-logo.png"
                          alt="The Open University of Tanzania"
                          style={{ height: 68, objectFit: 'contain' }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/assets/img/logo.svg';
                          }}
                        />
                        <h4 className="fw-bold text-dark mt-2 mb-0" style={{ letterSpacing: '0.04em' }}>
                          THE OPEN UNIVERSITY OF TANZANIA
                        </h4>
                        <div className="text-muted small fw-semibold text-uppercase" style={{ letterSpacing: '0.06em' }}>
                          Institute of Educational and Management Technologies (IEMT)
                        </div>
                      </div>

                      <div className="mb-4">
                        <span className="text-muted fst-italic small d-block mb-1">
                          This is to certify that the Senate has officially conferred upon
                        </span>
                        <h2 className="fw-bold text-dark mb-1" style={{ fontSize: 'clamp(1.4rem, 2.8vw, 2.2rem)' }}>
                          {result.certificate.scholarName}
                        </h2>
                        <span className="badge bg-light text-dark border px-3 py-1 fw-semibold small">
                          Student Reg No: {result.certificate.regNumber}
                        </span>
                      </div>

                      <div className="mb-4">
                        <span className="text-muted fst-italic small d-block mb-1">
                          the official qualification of
                        </span>
                        <h4 className="fw-bold text-primary mb-1">
                          {result.certificate.courseName}
                        </h4>
                        <span className="badge bg-warning-subtle text-dark border border-warning px-2.5 py-1 fw-bold small">
                          Course Code: {result.certificate.courseCode} • {result.certificate.cpdCredits} CPD Credits
                        </span>
                      </div>

                      <div className="mb-4">
                        <span className="text-muted fst-italic small d-block mb-1">
                          having satisfied all examination, practical coursework, and academic requirements with
                        </span>
                        <div className="fw-bold text-dark fs-18">
                          {result.certificate.grade}
                        </div>
                      </div>

                      {/* Signatories & Verification QR Block */}
                      <div className="row align-items-end g-3 pt-4 border-top mt-4 text-start">
                        <div className="col-sm-4 text-center text-sm-start">
                          <div className="fw-bold text-dark small border-bottom pb-1 mb-1" style={{ width: 170 }}>
                            Dr. Emmanuel Michael
                          </div>
                          <span className="text-muted d-block small" style={{ fontSize: '0.74rem' }}>
                            Director, IEMT
                          </span>
                          <span className="text-muted small" style={{ fontSize: '0.72rem' }}>
                            Open University of Tanzania
                          </span>
                        </div>

                        <div className="col-sm-4 text-center">
                          {/* Centered QR Seal */}
                          <div
                            className="d-inline-flex flex-column align-items-center p-2 rounded-3 bg-white border shadow-sm"
                            style={{ width: 120 }}
                          >
                            <img
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=95x95&data=${encodeURIComponent(
                                result.certificate.verificationUrl
                              )}`}
                              alt="Verification QR Code"
                              style={{ width: 95, height: 95 }}
                            />
                            <span className="fw-bold text-dark mt-1" style={{ fontSize: '0.64rem' }}>
                              SCAN TO VERIFY
                            </span>
                          </div>
                        </div>

                        <div className="col-sm-4 text-center text-sm-end">
                          <div className="fw-bold text-dark small border-bottom pb-1 mb-1 ms-auto" style={{ width: 170 }}>
                            Prof. Elifas T. Bisanda
                          </div>
                          <span className="text-muted d-block small" style={{ fontSize: '0.74rem' }}>
                            Vice Chancellor
                          </span>
                          <span className="text-muted small" style={{ fontSize: '0.72rem' }}>
                            Conferred: {result.certificate.issueDate}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-top text-center">
                        <span className="small text-muted" style={{ fontSize: '0.72rem' }}>
                          Official Credential Identifier: <strong>{result.certificate.code}</strong> • Verification URL:{' '}
                          <a href={result.certificate.verificationUrl} className="text-primary text-decoration-none">
                            {result.certificate.verificationUrl}
                          </a>
                        </span>
                      </div>
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mt-4 pt-2">
                      <Link to={all_routes.courseGrid} className="btn btn-outline-secondary rounded-pill px-3 py-2 small">
                        <i className="feather-arrow-left me-1" /> Browse Academic Catalog
                      </Link>
                      <div className="d-flex gap-2">
                        <button
                          type="button"
                          className="btn btn-outline-primary rounded-pill px-4 py-2 fw-semibold"
                          onClick={() => {
                            navigator.clipboard.writeText(result.certificate!.verificationUrl);
                            alert('Verification link copied to clipboard!');
                          }}
                        >
                          <i className="feather-copy me-1" /> Copy Verification Link
                        </button>
                        <button
                          type="button"
                          className="btn btn-primary rounded-pill px-4 py-2 fw-semibold"
                          onClick={() => window.print()}
                        >
                          <i className="feather-printer me-1" /> Print / Save PDF
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* NOT VERIFIED / NOT FOUND CARD */
                <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white border">
                  <div
                    className="d-inline-flex align-items-center justify-content-center rounded-circle mx-auto mb-3"
                    style={{ width: 64, height: 64, background: '#fee2e2', color: '#ef4444' }}
                  >
                    <i className="feather-alert-triangle fs-28" />
                  </div>
                  <h4 className="fw-bold text-dark mb-1">Credential Record Not Found</h4>
                  <p className="text-muted mb-4 mx-auto" style={{ maxWidth: 520, fontSize: '0.9rem' }}>
                    {result?.message ||
                      `Certificate reference code "${inputCode}" could not be verified in the OUT Central Academic Registry. Please check for typographical errors and verify the exact code printed on the credential.`}
                  </p>
                  <div>
                    <button
                      type="button"
                      onClick={() => {
                        setInputCode('OUT-35CB03BB3C');
                        performVerification('OUT-35CB03BB3C');
                      }}
                      className="btn btn-primary rounded-pill px-4 fw-semibold"
                    >
                      Try Sample Code (OUT-35CB03BB3C)
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyCertificate;

