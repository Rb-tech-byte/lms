import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { certificateService } from '../../../core/api/certificateService';
import { all_routes } from '../../router/all_routes';
import { BeautifulCertificateStudio, buildBeautifulCertificatePdfUrl } from '../../../core/common/BeautifulCertificateStudio';

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
              style={{ background: '#061838', color: '#fbbf24', fontSize: '0.78rem' }}
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
            <div className="col-lg-12">
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
                        <div className="fw-bold fs-16">OFFICIALLY VERIFIED &amp; AUTHENTIC CREDENTIAL — BEAUTIFUL VECTOR DIPLOMA</div>
                        <div className="small text-white text-opacity-90" style={{ fontSize: '0.76rem' }}>
                          Registered in The Open University of Tanzania Central Academic Registry • 6 Ornate Foil Guilloche Themes Available
                        </div>
                      </div>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <span className="badge bg-white text-success rounded-pill px-3 py-1.5 fw-bold">
                        TCU &amp; SARIS ACCREDITED
                      </span>
                    </div>
                  </div>

                  {/* Ornate Multi-Theme Beautiful Certificate & Vector Diploma Studio */}
                  <div className="p-3 p-md-4">
                    <BeautifulCertificateStudio
                      courseId={result.certificate.courseId || 7}
                      courseTitle={result.certificate.courseName}
                      courseCode={result.certificate.courseCode}
                      studentName={result.certificate.scholarName}
                      studentRegNo={result.certificate.regNumber}
                      serialCode={result.certificate.code}
                    />

                    {/* Bottom Action Bar */}
                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mt-3 pt-2">
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
                        <a
                          href={buildBeautifulCertificatePdfUrl({
                            courseId: result.certificate.courseId || 7,
                            serialCode: result.certificate.code,
                            autoPrint: true,
                          })}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-primary rounded-pill px-4 py-2 fw-semibold"
                        >
                          <i className="feather-printer me-1" /> Print / Export Full-Bleed Vector PDF
                        </a>
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

