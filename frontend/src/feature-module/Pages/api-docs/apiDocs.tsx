import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { all_routes } from '../../router/all_routes';

export const ApiDocs: React.FC = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <div className="api-docs-page" style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Top Banner / Breadcrumb */}
      <div
        className="py-4 text-white"
        style={{
          background: 'linear-gradient(135deg, #071F38 0%, #0171BB 100%)',
          borderBottom: '3px solid #FFD200',
        }}
      >
        <div className="container-fluid px-lg-5">
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
            <div>
              <div className="d-flex align-items-center gap-2 mb-2">
                <span
                  className="badge rounded-pill px-3 py-1 fw-bold text-uppercase"
                  style={{ background: '#FFD200', color: '#071F38', fontSize: '0.72rem', letterSpacing: '0.05em' }}
                >
                  Developer Gateway
                </span>
                <span className="badge bg-white text-dark rounded-pill px-3 py-1 fw-semibold" style={{ fontSize: '0.72rem' }}>
                  OpenAPI 3.1 &bull; REST v2 &bull; Catalyst RPC
                </span>
              </div>
              <h1 className="fw-bold fs-24 mb-1 text-white">OUT LMS Enterprise API Hub</h1>
              <p className="mb-0 text-white text-opacity-80" style={{ fontSize: '0.88rem' }}>
                Interactive documentation, live sandbox invocation, and schema explorer for The Open University of Tanzania LMS.
              </p>
            </div>

            <div className="d-flex align-items-center gap-2 flex-wrap">
              <a
                href="/openapi.json"
                target="_blank"
                rel="noreferrer"
                className="btn btn-sm btn-outline-light rounded-pill px-3 py-2 fw-semibold d-flex align-items-center gap-1.5"
                style={{ fontSize: '0.82rem' }}
              >
                <i className="feather-download" /> Download openapi.json
              </a>
              <Link
                to="/admin/dashboard?tab=api-gateway"
                className="btn btn-sm rounded-pill px-3 py-2 fw-semibold text-dark d-flex align-items-center gap-1.5"
                style={{ background: '#FFD200', border: 'none', fontSize: '0.82rem' }}
              >
                <i className="feather-sliders" /> Admin API Gateway Studio
              </Link>
              <button
                type="button"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="btn btn-sm btn-light rounded-pill px-3 py-2 fw-semibold d-flex align-items-center gap-1.5 text-primary"
                style={{ fontSize: '0.82rem' }}
              >
                <i className={isFullscreen ? 'feather-minimize-2' : 'feather-maximize-2'} />
                {isFullscreen ? 'Standard View' : 'Full Window'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Embedded Interactive Stoplight Elements Documentation */}
      <div
        className="container-fluid px-lg-5 py-3"
        style={
          isFullscreen
            ? {
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 99999,
                background: '#ffffff',
                padding: '0 !important',
              }
            : {}
        }
      >
        {isFullscreen && (
          <div className="bg-dark text-white px-4 py-2 d-flex align-items-center justify-content-between">
            <span className="fw-bold small">OUT LMS Enterprise API Documentation — Fullscreen Mode</span>
            <button
              type="button"
              onClick={() => setIsFullscreen(false)}
              className="btn btn-sm btn-outline-light rounded-pill px-3 py-1"
            >
              Close Fullscreen
            </button>
          </div>
        )}

        <div
          className="card border-0 shadow-sm rounded-4 overflow-hidden"
          style={{ height: isFullscreen ? 'calc(100vh - 48px)' : '820px' }}
        >
          <iframe
            src="/docs/index.html"
            title="OUT LMS API Documentation"
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              background: '#ffffff',
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ApiDocs;
