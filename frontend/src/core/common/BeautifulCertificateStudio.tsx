import React, { useState, useEffect } from 'react';
import { adminService } from '../api/adminService';

export interface BeautifulCertificateTheme {
  id: string;
  name: string;
  badge: string;
  bgGradient: string;
  outerBorder: string;
  innerBorder: string;
  accentColor: string;
  sealColor: string;
  textColor?: string;
  ribbonBg: string;
}

export const DEFAULT_DIPLOMA_THEMES: Record<string, BeautifulCertificateTheme> = {
  'royal-gold-navy': {
    id: 'royal-gold-navy',
    name: 'Royal OUT Navy & Gold Foil Guilloche',
    badge: 'Chancellor Honours',
    bgGradient: 'radial-gradient(circle at center, #fffdf7 0%, #fef9e7 68%, #f5e6ba 100%)',
    outerBorder: '#061838',
    innerBorder: '#D4AF37',
    accentColor: '#061838',
    sealColor: '#D4AF37',
    textColor: '#0f172a',
    ribbonBg: 'linear-gradient(135deg, #061838 0%, #013BA6 100%)',
  },
  'parchment-scroll': {
    id: 'parchment-scroll',
    name: 'Classic Senate Parchment Filigree Scroll',
    badge: 'Academic Senate',
    bgGradient: 'radial-gradient(circle at center, #fdfbf7 0%, #f7efd8 65%, #ead4a6 100%)',
    outerBorder: '#5C3A21',
    innerBorder: '#B8860B',
    accentColor: '#4A2511',
    sealColor: '#B8860B',
    textColor: '#29170a',
    ribbonBg: 'linear-gradient(135deg, #5C3A21 0%, #8B5A2B 100%)',
  },
  'emerald-senate': {
    id: 'emerald-senate',
    name: 'Emerald TCU Accredited Sovereign Diploma',
    badge: 'TCU Accredited',
    bgGradient: 'radial-gradient(circle at center, #f8fffb 0%, #e6f9ef 70%, #c6eed8 100%)',
    outerBorder: '#064E3B',
    innerBorder: '#D97706',
    accentColor: '#064E3B',
    sealColor: '#059669',
    textColor: '#064E3B',
    ribbonBg: 'linear-gradient(135deg, #064E3B 0%, #047857 100%)',
  },
  'cyber-dark-gold': {
    id: 'cyber-dark-gold',
    name: 'Executive Dark Gold Foil & Holographic Crest',
    badge: 'Executive Mastery',
    bgGradient: 'radial-gradient(circle at center, #1E293B 0%, #0F172A 75%, #020617 100%)',
    outerBorder: '#F59E0B',
    innerBorder: '#38BDF8',
    accentColor: '#F8FAFC',
    sealColor: '#F59E0B',
    textColor: '#F8FAFC',
    ribbonBg: 'linear-gradient(135deg, #F59E0B 0%, #B45309 100%)',
  },
  'crimson-chancellor': {
    id: 'crimson-chancellor',
    name: 'Crimson Summa Cum Laude Velvet Scroll',
    badge: 'Summa Cum Laude',
    bgGradient: 'radial-gradient(circle at center, #fffafa 0%, #fde8e8 72%, #f8c6c6 100%)',
    outerBorder: '#7F1D1D',
    innerBorder: '#D4AF37',
    accentColor: '#7F1D1D',
    sealColor: '#B91C1C',
    textColor: '#450a0a',
    ribbonBg: 'linear-gradient(135deg, #7F1D1D 0%, #B91C1C 100%)',
  },
  'sapphire-modern': {
    id: 'sapphire-modern',
    name: 'Sapphire Vector Geometric Micro-Credential',
    badge: 'Digital Verified',
    bgGradient: 'radial-gradient(circle at center, #f8fafc 0%, #e0f2fe 70%, #bae6fd 100%)',
    outerBorder: '#0369A1',
    innerBorder: '#0284C7',
    accentColor: '#0C4A6E',
    sealColor: '#0284C7',
    textColor: '#0c4a6e',
    ribbonBg: 'linear-gradient(135deg, #0369A1 0%, #0284C7 100%)',
  },
};

interface BeautifulCertificateStudioProps {
  courseId?: number | string;
  courseTitle?: string;
  courseCode?: string;
  studentName?: string;
  studentRegNo?: string;
  serialCode?: string;
  compact?: boolean;
}

export const BeautifulCertificateStudio: React.FC<BeautifulCertificateStudioProps> = ({
  courseId = 7,
  courseTitle = 'Advanced ICT Systems, Cloud Engineering & Enterprise Architecture',
  courseCode = 'ICT-304',
  studentName = 'Baraka Mkwawa',
  studentRegNo = 'OUT/REG/2026/0003',
  serialCode = 'OUT-35CB03BB3C',
  compact = false,
}) => {
  const numericCourseId = Number(courseId) || 7;
  const [activeThemeKey, setActiveThemeKey] = useState<string>('royal-gold-navy');
  const [themes, setThemes] = useState<Record<string, BeautifulCertificateTheme>>(DEFAULT_DIPLOMA_THEMES);
  const [certData, setCertData] = useState<any>(null);
  const [savingTheme, setSavingTheme] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    adminService
      .getBeautifulCertificates(numericCourseId, serialCode)
      .then((res) => {
        if (!mounted || !res?.success) return;
        if (res.themes) setThemes(res.themes);
        if (res.active_theme && DEFAULT_DIPLOMA_THEMES[res.active_theme]) {
          setActiveThemeKey(res.active_theme);
        }
        if (res.certificate) setCertData(res.certificate);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, [numericCourseId, serialCode]);

  const currentTheme = themes[activeThemeKey] || DEFAULT_DIPLOMA_THEMES['royal-gold-navy'];
  const isDarkTheme = activeThemeKey === 'cyber-dark-gold';
  const mainTextColor = isDarkTheme ? '#F8FAFC' : currentTheme.textColor || '#0f172a';
  const subTextColor = isDarkTheme ? '#CBD5E1' : '#475569';

  const displayStudentName = certData?.student_name || studentName;
  const displayRegNo = certData?.student_reg_no || studentRegNo;
  const displayCourseTitle = certData?.course_title || courseTitle;
  const displayCourseCode = certData?.course_code || courseCode;
  const displaySerial = certData?.serial_code || serialCode;
  const displayIssueDate = certData?.issue_date || '05 November 2026';
  const displayHonours = certData?.honours || 'FIRST CLASS HONOURS WITH DISTINCTION (GPA 4.8 / 5.0)';
  const displayScore = certData?.grade_score || '96.4% (Grade A+)';
  const displayCredits = certData?.credit_hours || '12.0 TCU Credit Units (120 Hours)';

  const handleSaveTheme = async (themeKey: string) => {
    setActiveThemeKey(themeKey);
    setSavingTheme(true);
    try {
      const res = await adminService.saveBeautifulCertificateTheme(numericCourseId, themeKey);
      if (res?.success) {
        setFeedbackMsg(`Saved active luxury diploma theme: ${themes[themeKey]?.name || themeKey}`);
        setTimeout(() => setFeedbackMsg(null), 4000);
      }
    } catch {
      setFeedbackMsg(`Switched active preview to ${themes[themeKey]?.name || themeKey}`);
      setTimeout(() => setFeedbackMsg(null), 3500);
    } finally {
      setSavingTheme(false);
    }
  };

  const fullPdfStudioUrl = adminService.getBeautifulCertificatePdfUrl(numericCourseId, displaySerial, activeThemeKey, false);
  const autoPrintPdfUrl = adminService.getBeautifulCertificatePdfUrl(numericCourseId, displaySerial, activeThemeKey, true);
  const verifyQrData =
    typeof window !== 'undefined'
      ? `${window.location.origin}/pages/verify-certificate?code=${encodeURIComponent(displaySerial)}`
      : `https://lms.out.ac.tz/pages/verify-certificate?code=${encodeURIComponent(displaySerial)}`;
  const qrImgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&margin=4&data=${encodeURIComponent(verifyQrData)}`;

  return (
    <div className="beautiful-certificate-studio-wrapper my-3">
      {/* Studio Control Header */}
      <div
        className="p-3 p-md-4 rounded-top-4 text-white"
        style={{
          background: 'linear-gradient(135deg, #061838 0%, #013BA6 55%, #0F172A 100%)',
          borderBottom: '3px solid #F4ED2D',
        }}
      >
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <span
                className="badge rounded-pill fw-bold"
                style={{ background: '#F4ED2D', color: '#061838', fontSize: '0.72rem', letterSpacing: '0.6px' }}
              >
                <i className="isax isax-medal-star me-1" />
                BEAUTIFUL CERTIFICATE & VECTOR DIPLOMA STUDIO
              </span>
              <span className="badge bg-success bg-opacity-25 text-white border border-success border-opacity-50" style={{ fontSize: '0.7rem' }}>
                300 DPI Vector Guilloche & Gold Foil
              </span>
            </div>
            <h5 className="text-white fw-bold mb-0">
              Official Sovereign University Diploma — <span style={{ color: '#F4ED2D' }}>{ currentTheme.name }</span>
            </h5>
          </div>

          <div className="d-flex flex-wrap align-items-center gap-2">
            <a
              href={fullPdfStudioUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-sm fw-bold rounded-pill px-3 py-2 shadow-sm"
              style={{ background: '#F4ED2D', color: '#061838', border: '2px solid #fff' }}
            >
              <i className="isax isax-maximize-4 me-1" />
              Open Full-Bleed Vector Diploma PDF
            </a>
            <a
              href={autoPrintPdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-sm btn-light fw-bold rounded-pill px-3 py-2 shadow-sm"
              style={{ color: '#061838' }}
            >
              <i className="isax isax-printer me-1 text-primary" />
              Print / Export A4 Landscape PDF
            </a>
          </div>
        </div>

        {/* 6 Luxury Theme Selector Pills */}
        <div className="d-flex flex-wrap align-items-center gap-2">
          <span className="small text-white-50 fw-semibold me-1">
            <i className="isax isax-colorfilter me-1 text-warning" />
            Select Luxury Diploma Theme:
          </span>
          {Object.values(themes).map((t) => {
            const isActive = t.id === activeThemeKey;
            return (
              <button
                key={t.id}
                type="button"
                disabled={savingTheme}
                onClick={() => handleSaveTheme(t.id)}
                className="btn btn-sm rounded-pill fw-bold transition-all"
                style={{
                  background: isActive ? '#F4ED2D' : 'rgba(255,255,255,0.12)',
                  color: isActive ? '#061838' : '#FFFFFF',
                  border: isActive ? '2px solid #FFFFFF' : '1px solid rgba(255,255,255,0.28)',
                  fontSize: '0.74rem',
                  padding: '5px 13px',
                  boxShadow: isActive ? '0 4px 12px rgba(255,210,0,0.35)' : 'none',
                }}
              >
                <span
                  className="d-inline-block rounded-circle me-1"
                  style={{
                    width: 9,
                    height: 9,
                    background: t.sealColor,
                    border: '1px solid #fff',
                  }}
                />
                {t.name}
              </button>
            );
          })}
        </div>

        {feedbackMsg && (
          <div className="mt-2 py-1 px-3 rounded-pill bg-success text-white small fw-semibold d-inline-block">
            <i className="isax isax-tick-circle me-1" />
            {feedbackMsg}
          </div>
        )}
      </div>

      {/* Ornate Vector Guilloche Diploma Canvas */}
      <div
        className="p-3 p-md-4 rounded-bottom-4"
        style={{
          background: '#0f172a',
          overflowX: 'auto',
        }}
      >
        <div
          className="mx-auto position-relative shadow-lg"
          style={{
            minWidth: compact ? '780px' : '920px',
            maxWidth: '1080px',
            background: currentTheme.bgGradient,
            color: mainTextColor,
            padding: '22px',
            borderRadius: '6px',
            fontFamily: "'Georgia', 'Times New Roman', serif",
            boxShadow: '0 25px 60px rgba(0,0,0,0.55)',
          }}
        >
          {/* Outer Double Guilloche Border */}
          <div
            style={{
              border: `8px double ${currentTheme.outerBorder}`,
              padding: '14px',
              position: 'relative',
            }}
          >
            {/* Inner Gold Foil Filigree Frame */}
            <div
              style={{
                border: `2.5px solid ${currentTheme.innerBorder}`,
                padding: compact ? '22px 28px' : '30px 42px',
                position: 'relative',
                textAlign: 'center',
              }}
            >
              {/* 4 Ornate SVG Corner Filigree Rosettes */}
              {[
                { top: 6, left: 6, transform: 'none' },
                { top: 6, right: 6, transform: 'scaleX(-1)' },
                { bottom: 6, left: 6, transform: 'scaleY(-1)' },
                { bottom: 6, right: 6, transform: 'scale(-1, -1)' },
              ].map((pos, idx) => (
                <svg
                  key={idx}
                  viewBox="0 0 100 100"
                  style={{
                    position: 'absolute',
                    width: 54,
                    height: 54,
                    pointerEvents: 'none',
                    ...pos,
                  }}
                >
                  <path d="M5,5 L95,5 L95,18 L18,18 L18,95 L5,95 Z" fill={currentTheme.innerBorder} />
                  <path d="M24,24 L75,24 L75,32 L32,32 L32,75 L24,75 Z" fill={currentTheme.outerBorder} />
                  <circle cx="46" cy="46" r="9" fill={currentTheme.sealColor} />
                </svg>
              ))}

              {/* Top University Crest & Sovereign Header */}
              <div>
                <div className="d-flex justify-content-center align-items-center gap-3 mb-2">
                  <svg width="56" height="56" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill={currentTheme.outerBorder}
                      stroke={currentTheme.innerBorder}
                      strokeWidth="4"
                    />
                    <polygon
                      points="50,14 61,36 85,39 67,56 72,80 50,68 28,80 33,56 15,39 39,36"
                      fill={currentTheme.innerBorder}
                    />
                    <circle cx="50" cy="50" r="16" fill="#FFFFFF" />
                    <text
                      x="50"
                      y="55"
                      textAnchor="middle"
                      fontSize="12"
                      fontWeight="bold"
                      fill={currentTheme.outerBorder}
                    >
                      OUT
                    </text>
                  </svg>
                  <div className="text-start">
                    <div
                      style={{
                        fontSize: '11px',
                        letterSpacing: '3px',
                        textTransform: 'uppercase',
                        fontWeight: 800,
                        color: currentTheme.innerBorder,
                      }}
                    >
                      THE UNITED REPUBLIC OF TANZANIA • ACT NO. 17 OF 1992
                    </div>
                    <h2
                      style={{
                        margin: '2px 0',
                        fontSize: compact ? '22px' : '27px',
                        letterSpacing: '1.8px',
                        fontWeight: 900,
                        color: currentTheme.accentColor,
                        textTransform: 'uppercase',
                      }}
                    >
                      THE OPEN UNIVERSITY OF TANZANIA
                    </h2>
                    <div style={{ fontSize: '11px', letterSpacing: '1.5px', color: subTextColor }}>
                      OFFICE OF THE DEPUTY VICE CHANCELLOR (ACADEMIC, RESEARCH &amp; CONSULTANCY)
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: 'inline-block',
                    marginTop: '6px',
                    padding: '5px 26px',
                    borderRadius: '999px',
                    background: currentTheme.ribbonBg,
                    color: '#FFFFFF',
                    fontSize: '11px',
                    fontWeight: 800,
                    letterSpacing: '2.2px',
                    textTransform: 'uppercase',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                  }}
                >
                  OFFICIAL ACADEMIC SENATE DIPLOMA &bull; {currentTheme.badge}
                </div>
              </div>

              {/* Recipient & Citation Body */}
              <div className="my-3">
                <div style={{ fontSize: '14px', fontStyle: 'italic', color: subTextColor }}>
                  Be it enacted and certified by the University Senate that
                </div>
                <div
                  style={{
                    fontSize: compact ? '32px' : '40px',
                    fontWeight: 900,
                    color: currentTheme.accentColor,
                    margin: '6px 0 4px',
                    fontFamily: "'Georgia', serif",
                    letterSpacing: '0.8px',
                    borderBottom: `2px solid ${currentTheme.innerBorder}`,
                    display: 'inline-block',
                    padding: '0 32px 4px',
                  }}
                >
                  {displayStudentName}
                </div>
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    letterSpacing: '1.5px',
                    color: currentTheme.innerBorder,
                    marginBottom: '10px',
                  }}
                >
                  REGISTRATION ID: {displayRegNo} &nbsp;|&nbsp; VERIFICATION SERIAL: {displaySerial}
                </div>
                <div
                  style={{
                    fontSize: '14px',
                    color: subTextColor,
                    maxWidth: '760px',
                    margin: '0 auto',
                    lineHeight: 1.5,
                  }}
                >
                  having fulfilled all prescribed academic evaluations, proctored virtual programming laboratories, and rigorous senate competency standards, is hereby conferred the sovereign academic credential in:
                </div>
                <h3
                  style={{
                    fontSize: compact ? '20px' : '24px',
                    fontWeight: 800,
                    color: currentTheme.accentColor,
                    margin: '10px 0 6px',
                  }}
                >
                  {displayCourseTitle}{' '}
                  <span style={{ fontSize: '15px', color: currentTheme.innerBorder }}>
                    ({displayCourseCode})
                  </span>
                </h3>
                <div
                  style={{
                    display: 'inline-block',
                    padding: '4px 18px',
                    border: `1.5px solid ${currentTheme.innerBorder}`,
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 800,
                    letterSpacing: '1.3px',
                    color: currentTheme.accentColor,
                    background: isDarkTheme ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.75)',
                  }}
                >
                  {displayHonours}
                </div>

                {/* 4 Metric Pills */}
                <div className="d-flex flex-wrap justify-content-center gap-3 mt-3" style={{ fontFamily: 'system-ui, sans-serif' }}>
                  {[
                    { label: 'CUMULATIVE SCORE', value: displayScore },
                    { label: 'CREDIT EQUIVALENCE', value: displayCredits },
                    { label: 'DATE OF CONFERMENT', value: displayIssueDate },
                    { label: 'ACCREDITATION STATUS', value: 'TCU & NACTVET Charter' },
                  ].map((m, i) => (
                    <div
                      key={i}
                      style={{
                        background: isDarkTheme ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.85)',
                        border: `1px solid ${currentTheme.innerBorder}`,
                        padding: '6px 14px',
                        borderRadius: '8px',
                      }}
                    >
                      <div style={{ fontSize: '9px', fontWeight: 700, color: subTextColor, letterSpacing: '0.8px' }}>
                        {m.label}
                      </div>
                      <div style={{ fontSize: '12px', fontWeight: 800, color: currentTheme.accentColor }}>
                        {m.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Signatures, Gold Foil Embossed Seal & QR Code */}
              <div
                className="d-flex flex-wrap align-items-end justify-content-between pt-3 mt-3"
                style={{ borderTop: `1px dashed ${currentTheme.innerBorder}` }}
              >
                {/* Left Signature */}
                <div style={{ width: '220px', textAlign: 'center' }}>
                  <div
                    style={{
                      fontFamily: "'Brush Script MT', 'Segoe Script', cursive",
                      fontSize: '25px',
                      color: currentTheme.accentColor,
                      borderBottom: `1.5px solid ${currentTheme.innerBorder}`,
                      paddingBottom: '2px',
                      marginBottom: '4px',
                    }}
                  >
                    Prof. E. T. Bisanda
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: currentTheme.accentColor }}>
                    Prof. Elifas Tozo Bisanda
                  </div>
                  <div style={{ fontSize: '10px', color: subTextColor }}>
                    Vice Chancellor, Open University of Tanzania
                  </div>
                </div>

                {/* Center Gold Foil Embossed Senate Seal SVG */}
                <div style={{ textAlign: 'center' }}>
                  <svg width="104" height="104" viewBox="0 0 140 140">
                    <defs>
                      <radialGradient id={`goldFoil-${activeThemeKey}`} cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#FFF6D6" />
                        <stop offset="45%" stopColor="#FFD700" />
                        <stop offset="85%" stopColor={currentTheme.sealColor} />
                        <stop offset="100%" stopColor="#78350F" />
                      </radialGradient>
                    </defs>
                    <polygon
                      points="55,105 42,138 56,130 66,139 68,105"
                      fill={currentTheme.outerBorder}
                    />
                    <polygon
                      points="85,105 98,138 84,130 74,139 72,105"
                      fill={currentTheme.outerBorder}
                    />
                    <circle
                      cx="70"
                      cy="64"
                      r="48"
                      fill={`url(#goldFoil-${activeThemeKey})`}
                      stroke={currentTheme.outerBorder}
                      strokeWidth="3"
                    />
                    <circle
                      cx="70"
                      cy="64"
                      r="40"
                      fill="none"
                      stroke={currentTheme.outerBorder}
                      strokeWidth="1.5"
                      strokeDasharray="3,3"
                    />
                    <circle
                      cx="70"
                      cy="64"
                      r="31"
                      fill="none"
                      stroke="#78350F"
                      strokeWidth="1.2"
                    />
                    <text
                      x="70"
                      y="54"
                      textAnchor="middle"
                      fontSize="8.5"
                      fontWeight="900"
                      fill="#061838"
                      letterSpacing="1"
                    >
                      SENATE SEAL
                    </text>
                    <text x="70" y="68" textAnchor="middle" fontSize="13" fontWeight="900" fill="#061838">
                      OUT &bull; 1992
                    </text>
                    <text x="70" y="80" textAnchor="middle" fontSize="7.5" fontWeight="800" fill="#78350F">
                      VERIFIED DIPLOMA
                    </text>
                  </svg>
                </div>

                {/* Right Signature + QR Code */}
                <div className="d-flex align-items-end gap-3">
                  <div style={{ width: '210px', textAlign: 'center' }}>
                    <div
                      style={{
                        fontFamily: "'Brush Script MT', 'Segoe Script', cursive",
                        fontSize: '25px',
                        color: currentTheme.accentColor,
                        borderBottom: `1.5px solid ${currentTheme.innerBorder}`,
                        paddingBottom: '2px',
                        marginBottom: '4px',
                      }}
                    >
                      Dr. E. Michael
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: 800, color: currentTheme.accentColor }}>
                      Dr. Emmanuel Michael
                    </div>
                    <div style={{ fontSize: '10px', color: subTextColor }}>
                      Dean, Faculty of Science, Technology &amp;ES
                    </div>
                  </div>

                  <div
                    style={{
                      background: '#FFFFFF',
                      padding: '6px',
                      border: `2px solid ${currentTheme.innerBorder}`,
                      borderRadius: '8px',
                      textAlign: 'center',
                    }}
                  >
                    <img
                      src={qrImgUrl}
                      alt="Verify QR"
                      style={{ width: 68, height: 68, display: 'block' }}
                    />
                    <div
                      style={{
                        fontSize: '8px',
                        fontWeight: 800,
                        color: '#061838',
                        marginTop: '3px',
                        fontFamily: 'monospace',
                      }}
                    >
                      {displaySerial}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BeautifulCertificateStudio;

