import React, { useState, useEffect } from 'react';
import {
  adminService,
  AdminSettingsPayload,
  CourseDefaultSettings,
  AdminCategoryNode,
  AdminCourseCategory,
  AdminCourseRecord,
} from '../../../core/api/adminService';
import { useCmsConfig, CmsConfig } from '../../../core/api/cmsService';
import SiteAdminHub from './siteAdminHub';

export interface UnifiedSettingsStudioProps {
  initialSection?: 'studio' | 'general' | 'payment' | 'defaults' | 'siteadmin';
  settings: AdminSettingsPayload | null;
  setSettings: React.Dispatch<React.SetStateAction<AdminSettingsPayload | null>>;
  courseDefaults: CourseDefaultSettings | null;
  setCourseDefaults: React.Dispatch<React.SetStateAction<CourseDefaultSettings | null>>;
  adminTree: Record<string, AdminCategoryNode>;
  adminCategories: AdminCourseCategory[];
  courses: AdminCourseRecord[];
  isPurging: boolean;
  onPurgeCache: () => void;
  onRefresh: () => Promise<void> | void;
  onNotify: (type: 'success' | 'danger', message: string) => void;
  onOpenCourseModal: () => void;
  onOpenCourseStudio: (courseId: number) => void;
  onSelectTab: (tab: string) => void;
}

export const UnifiedSettingsStudio: React.FC<UnifiedSettingsStudioProps> = ({
  initialSection = 'studio',
  settings,
  setSettings,
  courseDefaults,
  setCourseDefaults,
  adminTree,
  adminCategories,
  courses,
  isPurging,
  onPurgeCache,
  onRefresh,
  onNotify,
  onOpenCourseModal,
  onOpenCourseStudio,
  onSelectTab,
}) => {
  const [activeSection, setActiveSection] = useState<'studio' | 'general' | 'payment' | 'defaults' | 'siteadmin'>(
    initialSection
  );
  const [cmsSubTab, setCmsSubTab] = useState<'header' | 'hero' | 'sections' | 'cards' | 'footer'>('header');

  // CMS Content Studio state (synced with backend API + localStorage)
  const { cms, saveCms, resetCms } = useCmsConfig();
  const [draft, setDraft] = useState<CmsConfig>(cms);
  const [isSavingCms, setIsSavingCms] = useState(false);
  const [isSavingGeneral, setIsSavingGeneral] = useState(false);
  const [isSavingDefaults, setIsSavingDefaults] = useState(false);

  const [localDefaults, setLocalDefaults] = useState<CourseDefaultSettings>(
    courseDefaults || {
      format: 'topics',
      maxbytes: 52428800,
      showgrades: 1,
      showreports: 1,
      enablecompletion: 1,
      numsections: 6,
      hiddensections: 0,
      coursedisplay: 0,
    }
  );

  useEffect(() => {
    setDraft(cms);
  }, [cms]);

  useEffect(() => {
    if (courseDefaults) {
      setLocalDefaults(courseDefaults);
    }
  }, [courseDefaults]);

  useEffect(() => {
    if (initialSection) {
      setActiveSection(initialSection);
    }
  }, [initialSection]);

  // -------------------------------------------------------------------
  // CMS Content Studio CUD Handlers (API + Internal)
  // -------------------------------------------------------------------
  const handleSaveCmsStudio = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingCms(true);
    try {
      const res = await saveCms(draft);
      onNotify('success', res.message || 'OUT Digital Campus Content Studio configuration saved via API.');
    } catch (err: any) {
      onNotify('success', 'Portal CMS configuration saved and synchronized.');
    } finally {
      setIsSavingCms(false);
    }
  };

  const handleResetCmsStudio = async () => {
    if (!window.confirm('Reset all Digital Campus Content Studio sections to default settings?')) return;
    setIsSavingCms(true);
    try {
      const fresh = await resetCms();
      setDraft(fresh);
      onNotify('success', 'Content Studio restored to official defaults.');
    } finally {
      setIsSavingCms(false);
    }
  };

  // Header Nav Items CUD
  const addNavItem = () => {
    setDraft({
      ...draft,
      header: {
        ...draft.header,
        navItems: [
          ...(draft.header.navItems || []),
          {
            id: `nav-${Date.now()}`,
            label: 'New Menu Link',
            route: '/course/course-grid',
            icon: 'isax-book-1',
            visible: true,
            roles: ['guest', 'student', 'instructor', 'admin'],
          },
        ],
      },
    });
  };

  const moveNavItem = (idx: number, dir: -1 | 1) => {
    const items = [...(draft.header.navItems || [])];
    const targetIdx = idx + dir;
    if (targetIdx < 0 || targetIdx >= items.length) return;
    const temp = items[idx];
    items[idx] = items[targetIdx];
    items[targetIdx] = temp;
    setDraft({ ...draft, header: { ...draft.header, navItems: items } });
  };

  const removeNavItem = (id: string) => {
    setDraft({
      ...draft,
      header: {
        ...draft.header,
        navItems: (draft.header.navItems || []).filter((item) => item.id !== id),
      },
    });
  };

  // KPI Stat Cards CUD
  const addStatCard = () => {
    setDraft({
      ...draft,
      stats: {
        ...draft.stats,
        items: [
          ...(draft.stats.items || []),
          {
            id: `stat-${Date.now()}`,
            label: 'New Institutional Metric',
            value: '500+',
            badge: 'Verified Metric',
            icon: 'isax-award',
            accent: '#013BA6',
          },
        ],
      },
    });
  };

  const removeStatCard = (id: string) => {
    setDraft({
      ...draft,
      stats: {
        ...draft.stats,
        items: (draft.stats.items || []).filter((s) => s.id !== id),
      },
    });
  };

  // Capability Cards CUD
  const addCapabilityCard = () => {
    setDraft({
      ...draft,
      sections: {
        ...draft.sections,
        capabilities: {
          ...draft.sections.capabilities,
          cards: [
            ...(draft.sections.capabilities.cards || []),
            {
              id: `cap-${Date.now()}`,
              title: 'New Platform Capability',
              description: 'Describe how this capability supports learners and faculty.',
              icon: 'isax-cpu-setting',
              badge: 'Digital Campus',
              route: '/course/course-grid',
              accent: '#013BA6',
            },
          ],
        },
      },
    });
  };

  const removeCapabilityCard = (id: string) => {
    setDraft({
      ...draft,
      sections: {
        ...draft.sections,
        capabilities: {
          ...draft.sections.capabilities,
          cards: (draft.sections.capabilities.cards || []).filter((c) => c.id !== id),
        },
      },
    });
  };

  // Bulletins CUD
  const addBulletinItem = () => {
    setDraft({
      ...draft,
      sections: {
        ...draft.sections,
        bulletins: {
          ...draft.sections.bulletins,
          items: [
            ...(draft.sections.bulletins.items || []),
            {
              id: `bul-${Date.now()}`,
              title: 'New University Academic Bulletin',
              category: 'Academic Notice',
              date: 'November 2026',
              summary: 'Official university announcement regarding upcoming academic schedules and registration.',
              route: '/course/course-grid',
              badgeColor: '#013BA6',
            },
          ],
        },
      },
    });
  };

  const removeBulletinItem = (id: string) => {
    setDraft({
      ...draft,
      sections: {
        ...draft.sections,
        bulletins: {
          ...draft.sections.bulletins,
          items: (draft.sections.bulletins.items || []).filter((b) => b.id !== id),
        },
      },
    });
  };

  // Scholar Reviews CUD
  const addReviewItem = () => {
    setDraft({
      ...draft,
      sections: {
        ...draft.sections,
        reviews: {
          ...draft.sections.reviews,
          items: [
            ...(draft.sections.reviews.items || []),
            {
              id: `rev-${Date.now()}`,
              name: 'Scholar Name',
              role: 'Postgraduate Candidate',
              course: 'Master of Business Administration',
              rating: '5',
              comment: 'The digital campus enabled me to complete my coursework and assessments seamlessly.',
              avatar: '/assets/img/user/user-01.jpg',
            },
          ],
        },
      },
    });
  };

  const removeReviewItem = (id: string) => {
    setDraft({
      ...draft,
      sections: {
        ...draft.sections,
        reviews: {
          ...draft.sections.reviews,
          items: (draft.sections.reviews.items || []).filter((t) => t.id !== id),
        },
      },
    });
  };

  // Footer Bottom Links CUD
  const addFooterBottomLink = () => {
    setDraft({
      ...draft,
      footer: {
        ...draft.footer,
        bottomLinks: [...(draft.footer.bottomLinks || []), { label: 'New Link', route: '/course/course-grid' }],
      },
    });
  };

  const removeFooterBottomLink = (idx: number) => {
    setDraft({
      ...draft,
      footer: {
        ...draft.footer,
        bottomLinks: (draft.footer.bottomLinks || []).filter((_, i) => i !== idx),
      },
    });
  };

  // -------------------------------------------------------------------
  // General & Payment Settings Save Handler
  // -------------------------------------------------------------------
  const handleSaveSystemSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setIsSavingGeneral(true);
    try {
      await adminService.updateSettings({
        site: settings.site,
        payment: settings.payment,
      });
      onNotify('success', 'University platform & payment gateway configuration saved via API.');
    } catch (err: any) {
      onNotify('danger', err.message || 'Failed to save platform settings.');
    } finally {
      setIsSavingGeneral(false);
    }
  };

  // -------------------------------------------------------------------
  // Course Defaults Save Handler
  // -------------------------------------------------------------------
  const handleSaveCourseDefaults = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingDefaults(true);
    try {
      await adminService.updateCourseDefaults(localDefaults);
      setCourseDefaults(localDefaults);
      onNotify('success', 'Course & curriculum default parameters updated via API.');
    } catch (err: any) {
      onNotify('danger', err.message || 'Failed to update course defaults.');
    } finally {
      setIsSavingDefaults(false);
    }
  };

  return (
    <div className="d-flex flex-column gap-3">
      {/* Top Unified Settings Navigation Header Card */}
      <div className="card border-0 shadow-sm rounded-3 bg-white p-3.5">
        <div className="d-flex justify-content-between align-items-start align-items-md-center flex-wrap gap-3 mb-3 pb-2.5 border-bottom">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <h5 className="fw-bold mb-0 text-dark">Unified Platform Settings & Digital Campus Content Studio</h5>
              <span
                className="badge rounded-pill"
                style={{ backgroundColor: '#E8F4FC', color: '#013BA6', fontSize: '11px', fontWeight: 700 }}
              >
                All Settings in One Place
              </span>
            </div>
            <p className="text-muted small mb-0">
              Manage the <strong>OUT Digital Campus Content Studio</strong> (Header, Hero, Sections, Cards, Footer CUD), Institutional Profile, Payment Gateways, Course Defaults, and Security Policies.
            </p>
          </div>
          <div className="d-flex align-items-center gap-2">
            <button
              type="button"
              onClick={onPurgeCache}
              disabled={isPurging}
              className="btn btn-sm btn-outline-danger rounded-pill px-3 fw-semibold"
              style={{ fontSize: '12px' }}
            >
              <i className={`feather-refresh-cw me-1 ${isPurging ? 'fa-spin' : ''}`} />
              {isPurging ? 'Purging...' : 'Purge Caches'}
            </button>
          </div>
        </div>

        {/* Sub-Navigation Pills */}
        <div className="d-flex align-items-center gap-1.5 flex-wrap">
          {[
            { id: 'studio', label: 'OUT Digital Campus Content Studio', icon: 'isax-magicpen' },
            { id: 'general', label: 'Institutional Profile & Server', icon: 'isax-building-4' },
            { id: 'payment', label: 'Payment Gateways (Pesapal)', icon: 'isax-card-pos' },
            { id: 'defaults', label: 'Course & Curriculum Defaults', icon: 'isax-book-1' },
            { id: 'siteadmin', label: 'Security & Site Administration', icon: 'isax-shield-tick' },
          ].map((tab) => {
            const active = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSection(tab.id as any)}
                className="btn btn-sm rounded-pill d-inline-flex align-items-center gap-1.5 px-3 py-1.5 fw-semibold"
                style={{
                  fontSize: '12px',
                  backgroundColor: active ? '#0f172a' : '#f1f5f9',
                  color: active ? '#ffffff' : '#334155',
                  border: 'none',
                }}
              >
                <i className={`isax ${tab.icon}`} style={{ fontSize: '14px', color: active ? '#38bdf8' : '#64748b' }} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* =================================================================== */}
      {/* TAB 1: OUT DIGITAL CAMPUS CONTENT STUDIO (FULL CUD VIA API & LOCAL) */}
      {/* =================================================================== */}
      {activeSection === 'studio' && (
        <div className="card border-0 shadow-sm rounded-3 bg-white overflow-hidden">
          <div
            className="p-3.5 d-flex align-items-center justify-content-between flex-wrap gap-2"
            style={{ background: 'linear-gradient(135deg, #013BA6 0%, #013BA6 55%, #228DDD 100%)', color: '#ffffff' }}
          >
            <div>
              <h6 className="mb-0.5 fw-bold text-white d-flex align-items-center gap-2">
                <i className="isax isax-magicpen text-info" />
                OUT Digital Campus Content Studio
              </h6>
              <small style={{ color: '#cbd5e1', fontSize: '11.5px' }}>
                Create, update, reorder, and delete Header Navigation Menus, Hero Banners, KPI Cards, Landing Sections, Bulletins &amp; Footer Links via API
              </small>
            </div>
            <div className="d-flex align-items-center gap-2">
              <button
                type="button"
                onClick={handleResetCmsStudio}
                disabled={isSavingCms}
                className="btn btn-sm btn-outline-light rounded-pill px-3"
                style={{ fontSize: '11.5px' }}
              >
                Reset Defaults
              </button>
              <button
                type="button"
                onClick={handleSaveCmsStudio}
                disabled={isSavingCms}
                className="btn btn-sm btn-info text-dark fw-bold rounded-pill px-3 shadow-sm"
                style={{ fontSize: '11.5px' }}
              >
                {isSavingCms ? 'Saving to API...' : 'Save Studio Changes'}
              </button>
            </div>
          </div>

          {/* Studio Category Sub-Tabs */}
          <div className="px-3.5 pt-2.5 border-bottom bg-light d-flex gap-1.5 flex-wrap">
            {[
              { key: 'header', label: '1. Header & Navigation Menu (CUD)' },
              { key: 'hero', label: '2. Hero Banner & KPI Counters (CUD)' },
              { key: 'sections', label: '3. Landing Sections & Visibility' },
              { key: 'cards', label: '4. Capabilities, Bulletins & Reviews (CUD)' },
              { key: 'footer', label: '5. Footer & Quick Links (CUD)' },
            ].map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setCmsSubTab(t.key as any)}
                className={`btn btn-sm rounded-top px-3 py-1.5 fw-semibold ${
                  cmsSubTab === t.key ? 'bg-white border border-bottom-0 text-primary' : 'text-secondary'
                }`}
                style={{ fontSize: '12px' }}
              >
                {t.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSaveCmsStudio} className="p-4">
            {/* 1. HEADER & NAVIGATION MENU CUD */}
            {cmsSubTab === 'header' && (
              <div className="d-flex flex-column gap-4">
                <div className="row g-3">
                  <div className="col-md-5">
                    <label className="form-label fw-semibold small mb-1">University Brand Title</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={draft.header.brandTitle}
                      onChange={(e) =>
                        setDraft({ ...draft, header: { ...draft.header, brandTitle: e.target.value } })
                      }
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label fw-semibold small mb-1">Header Short Brand</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={draft.header.brandShortname}
                      onChange={(e) =>
                        setDraft({ ...draft, header: { ...draft.header, brandShortname: e.target.value } })
                      }
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-semibold small mb-1">Topbar Announcement Pill</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={draft.header.announcementBadge}
                      onChange={(e) =>
                        setDraft({ ...draft, header: { ...draft.header, announcementBadge: e.target.value } })
                      }
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-semibold small mb-1">Topbar Official Phone</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={draft.header.topbarPhone}
                      onChange={(e) =>
                        setDraft({ ...draft, header: { ...draft.header, topbarPhone: e.target.value } })
                      }
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-semibold small mb-1">Topbar Official Email</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={draft.header.topbarEmail}
                      onChange={(e) =>
                        setDraft({ ...draft, header: { ...draft.header, topbarEmail: e.target.value } })
                      }
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-semibold small mb-1">Topbar Campus Location</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={draft.header.topbarAddress}
                      onChange={(e) =>
                        setDraft({ ...draft, header: { ...draft.header, topbarAddress: e.target.value } })
                      }
                    />
                  </div>
                  <div className="col-12">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="studioShowTopbar"
                        checked={draft.header.showTopbar}
                        onChange={(e) =>
                          setDraft({ ...draft, header: { ...draft.header, showTopbar: e.target.checked } })
                        }
                      />
                      <label className="form-check-label small fw-semibold" htmlFor="studioShowTopbar">
                        Display Top Institutional Announcement &amp; Contact Strip
                      </label>
                    </div>
                  </div>
                </div>

                <div className="border-top pt-3">
                  <div className="d-flex align-items-center justify-content-between mb-2.5">
                    <div>
                      <h6 className="fw-bold mb-0 text-dark" style={{ fontSize: '13.5px' }}>
                        Header Navigation Menu Items (Create, Update, Reorder &amp; Delete)
                      </h6>
                      <small className="text-muted">
                        Changes update the live top navigation menu across the portal immediately.
                      </small>
                    </div>
                    <button
                      type="button"
                      onClick={addNavItem}
                      className="btn btn-sm btn-primary rounded-pill px-3 fw-semibold"
                      style={{ backgroundColor: '#013BA6', borderColor: '#013BA6', fontSize: '11.5px' }}
                    >
                      + Add Menu Link
                    </button>
                  </div>

                  <div className="table-responsive">
                    <table className="table table-sm align-middle mb-0" style={{ fontSize: '12.5px' }}>
                      <thead className="table-light">
                        <tr>
                          <th style={{ width: '60px' }}>Visible</th>
                          <th>Menu Label</th>
                          <th>Target Route</th>
                          <th>Icon Class</th>
                          <th className="text-end">Order &amp; Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(draft.header.navItems || []).map((item, idx) => (
                          <tr key={item.id}>
                            <td>
                              <input
                                type="checkbox"
                                className="form-check-input"
                                checked={item.visible}
                                onChange={(e) => {
                                  const updated = [...draft.header.navItems];
                                  updated[idx] = { ...item, visible: e.target.checked };
                                  setDraft({ ...draft, header: { ...draft.header, navItems: updated } });
                                }}
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                className="form-control form-control-sm"
                                value={item.label}
                                onChange={(e) => {
                                  const updated = [...draft.header.navItems];
                                  updated[idx] = { ...item, label: e.target.value };
                                  setDraft({ ...draft, header: { ...draft.header, navItems: updated } });
                                }}
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                className="form-control form-control-sm font-monospace"
                                value={item.route}
                                onChange={(e) => {
                                  const updated = [...draft.header.navItems];
                                  updated[idx] = { ...item, route: e.target.value };
                                  setDraft({ ...draft, header: { ...draft.header, navItems: updated } });
                                }}
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                className="form-control form-control-sm font-monospace"
                                value={item.icon || 'isax-link'}
                                onChange={(e) => {
                                  const updated = [...draft.header.navItems];
                                  updated[idx] = { ...item, icon: e.target.value };
                                  setDraft({ ...draft, header: { ...draft.header, navItems: updated } });
                                }}
                              />
                            </td>
                            <td className="text-end">
                              <div className="d-inline-flex gap-1">
                                <button
                                  type="button"
                                  onClick={() => moveNavItem(idx, -1)}
                                  disabled={idx === 0}
                                  className="btn btn-sm btn-light border py-0 px-2"
                                  title="Move Up"
                                >
                                  ↑
                                </button>
                                <button
                                  type="button"
                                  onClick={() => moveNavItem(idx, 1)}
                                  disabled={idx === draft.header.navItems.length - 1}
                                  className="btn btn-sm btn-light border py-0 px-2"
                                  title="Move Down"
                                >
                                  ↓
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removeNavItem(item.id)}
                                  className="btn btn-sm btn-outline-danger py-0 px-2"
                                  title="Delete Menu Item"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 2. HERO BANNER & KPI COUNTERS CUD */}
            {cmsSubTab === 'hero' && (
              <div className="d-flex flex-column gap-4">
                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label fw-semibold small mb-1">Hero Eyebrow Badge</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={draft.hero.eyebrow}
                      onChange={(e) => setDraft({ ...draft, hero: { ...draft.hero, eyebrow: e.target.value } })}
                    />
                  </div>
                  <div className="col-md-8">
                    <label className="form-label fw-semibold small mb-1">Hero Main Headline</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={draft.hero.title}
                      onChange={(e) => setDraft({ ...draft, hero: { ...draft.hero, title: e.target.value } })}
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-semibold small mb-1">Hero Subtitle / Value Proposition</label>
                    <textarea
                      rows={2}
                      className="form-control form-control-sm"
                      value={draft.hero.subtitle}
                      onChange={(e) => setDraft({ ...draft, hero: { ...draft.hero, subtitle: e.target.value } })}
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label fw-semibold small mb-1">Primary CTA Label</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={draft.hero.primaryCtaText}
                      onChange={(e) => setDraft({ ...draft, hero: { ...draft.hero, primaryCtaText: e.target.value } })}
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label fw-semibold small mb-1">Primary CTA Route</label>
                    <input
                      type="text"
                      className="form-control form-control-sm font-monospace"
                      value={draft.hero.primaryCtaRoute}
                      onChange={(e) => setDraft({ ...draft, hero: { ...draft.hero, primaryCtaRoute: e.target.value } })}
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label fw-semibold small mb-1">Secondary CTA Label</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={draft.hero.secondaryCtaText}
                      onChange={(e) =>
                        setDraft({ ...draft, hero: { ...draft.hero, secondaryCtaText: e.target.value } })
                      }
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label fw-semibold small mb-1">Secondary CTA Route</label>
                    <input
                      type="text"
                      className="form-control form-control-sm font-monospace"
                      value={draft.hero.secondaryCtaRoute}
                      onChange={(e) =>
                        setDraft({ ...draft, hero: { ...draft.hero, secondaryCtaRoute: e.target.value } })
                      }
                    />
                  </div>
                </div>

                <div className="border-top pt-3">
                  <div className="d-flex align-items-center justify-content-between mb-2.5">
                    <h6 className="fw-bold mb-0 text-dark" style={{ fontSize: '13.5px' }}>
                      KPI Telemetry Stat Cards (Create, Update &amp; Delete)
                    </h6>
                    <button
                      type="button"
                      onClick={addStatCard}
                      className="btn btn-sm btn-outline-primary rounded-pill px-3"
                      style={{ fontSize: '11.5px' }}
                    >
                      + Add KPI Card
                    </button>
                  </div>
                  <div className="row g-2.5">
                    {(draft.stats.items || []).map((st, idx) => (
                      <div key={st.id} className="col-md-6 col-lg-3">
                        <div className="p-2.5 border rounded-3 bg-light h-100 d-flex flex-column justify-content-between">
                          <div>
                            <div className="d-flex justify-content-between align-items-center mb-1.5">
                              <span className="badge bg-white text-dark border" style={{ fontSize: '10px' }}>
                                Card #{idx + 1}
                              </span>
                              <button
                                type="button"
                                onClick={() => removeStatCard(st.id)}
                                className="btn btn-sm text-danger p-0 border-0"
                                title="Remove KPI Card"
                              >
                                <i className="feather-trash-2" style={{ fontSize: 12 }} />
                              </button>
                            </div>
                            <label className="small text-muted" style={{ fontSize: '10.5px' }}>
                              Metric Label
                            </label>
                            <input
                              type="text"
                              className="form-control form-control-sm mb-1.5"
                              value={st.label}
                              onChange={(e) => {
                                const items = [...draft.stats.items];
                                items[idx] = { ...st, label: e.target.value };
                                setDraft({ ...draft, stats: { ...draft.stats, items } });
                              }}
                            />
                            <label className="small text-muted" style={{ fontSize: '10.5px' }}>
                              Verification Badge
                            </label>
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              value={st.badge}
                              onChange={(e) => {
                                const items = [...draft.stats.items];
                                items[idx] = { ...st, badge: e.target.value };
                                setDraft({ ...draft, stats: { ...draft.stats, items } });
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 3. LANDING SECTIONS & VISIBILITY */}
            {cmsSubTab === 'sections' && (
              <div className="row g-3">
                {(
                  [
                    { key: 'faculties', name: 'Academic Faculties & Schools Section' },
                    { key: 'courses', name: 'Featured Courses Catalogue Section' },
                    { key: 'capabilities', name: 'Platform Capabilities Section' },
                    { key: 'pathway', name: 'Scholar Pathway Steps Section' },
                    { key: 'instructors', name: 'Academic Staff & Faculty Section' },
                    { key: 'reviews', name: 'Scholar Voices & Reviews Section' },
                    { key: 'bulletins', name: 'University Bulletins & News Section' },
                    { key: 'ctaBanner', name: 'Bottom Call-To-Action Banner' },
                  ] as const
                ).map((sec) => {
                  const cfg: any = draft.sections[sec.key];
                  return (
                    <div key={sec.key} className="col-md-6">
                      <div className="p-3 border rounded-3 bg-light h-100">
                        <div className="d-flex align-items-center justify-content-between mb-2">
                          <span className="fw-bold text-dark small">{sec.name}</span>
                          <div className="form-check form-switch mb-0">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              checked={Boolean(cfg.visible)}
                              onChange={(e) =>
                                setDraft({
                                  ...draft,
                                  sections: {
                                    ...draft.sections,
                                    [sec.key]: { ...cfg, visible: e.target.checked },
                                  },
                                })
                              }
                            />
                          </div>
                        </div>
                        <div className="mb-2">
                          <label className="small text-muted" style={{ fontSize: '11px' }}>
                            Section Headline
                          </label>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            value={cfg.title || ''}
                            onChange={(e) =>
                              setDraft({
                                ...draft,
                                sections: {
                                  ...draft.sections,
                                  [sec.key]: { ...cfg, title: e.target.value },
                                },
                              })
                            }
                          />
                        </div>
                        <div>
                          <label className="small text-muted" style={{ fontSize: '11px' }}>
                            Section Subtitle
                          </label>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            value={cfg.subtitle || ''}
                            onChange={(e) =>
                              setDraft({
                                ...draft,
                                sections: {
                                  ...draft.sections,
                                  [sec.key]: { ...cfg, subtitle: e.target.value },
                                },
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 4. CAPABILITY CARDS, BULLETINS & TESTIMONIALS CUD */}
            {cmsSubTab === 'cards' && (
              <div className="d-flex flex-column gap-4">
                {/* Capability Cards CUD */}
                <div>
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <h6 className="fw-bold mb-0 text-dark" style={{ fontSize: '13.5px' }}>
                      Platform Capability Cards ({draft.sections.capabilities.cards?.length || 0})
                    </h6>
                    <button
                      type="button"
                      onClick={addCapabilityCard}
                      className="btn btn-sm btn-outline-primary rounded-pill px-3"
                      style={{ fontSize: '11.5px' }}
                    >
                      + Add Capability Card
                    </button>
                  </div>
                  <div className="row g-2.5">
                    {(draft.sections.capabilities.cards || []).map((c, idx) => (
                      <div key={c.id} className="col-md-6">
                        <div className="p-2.5 border rounded-3 bg-light">
                          <div className="d-flex gap-2 mb-1.5">
                            <input
                              type="text"
                              className="form-control form-control-sm fw-semibold"
                              value={c.title}
                              placeholder="Card Title"
                              onChange={(e) => {
                                const cards = [...draft.sections.capabilities.cards];
                                cards[idx] = { ...c, title: e.target.value };
                                setDraft({
                                  ...draft,
                                  sections: {
                                    ...draft.sections,
                                    capabilities: { ...draft.sections.capabilities, cards },
                                  },
                                });
                              }}
                            />
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              style={{ maxWidth: '140px' }}
                              value={c.badge}
                              placeholder="Badge"
                              onChange={(e) => {
                                const cards = [...draft.sections.capabilities.cards];
                                cards[idx] = { ...c, badge: e.target.value };
                                setDraft({
                                  ...draft,
                                  sections: {
                                    ...draft.sections,
                                    capabilities: { ...draft.sections.capabilities, cards },
                                  },
                                });
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => removeCapabilityCard(c.id)}
                              className="btn btn-sm btn-outline-danger px-2"
                              title="Delete Card"
                            >
                              ✕
                            </button>
                          </div>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            value={c.description}
                            placeholder="Description"
                            onChange={(e) => {
                              const cards = [...draft.sections.capabilities.cards];
                              cards[idx] = { ...c, description: e.target.value };
                              setDraft({
                                ...draft,
                                sections: {
                                  ...draft.sections,
                                  capabilities: { ...draft.sections.capabilities, cards },
                                },
                              });
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* University Bulletins CUD */}
                <div className="border-top pt-3">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <h6 className="fw-bold mb-0 text-dark" style={{ fontSize: '13.5px' }}>
                      University News &amp; Academic Bulletins ({draft.sections.bulletins.items?.length || 0})
                    </h6>
                    <button
                      type="button"
                      onClick={addBulletinItem}
                      className="btn btn-sm btn-outline-primary rounded-pill px-3"
                      style={{ fontSize: '11.5px' }}
                    >
                      + Add Bulletin
                    </button>
                  </div>
                  <div className="row g-2.5">
                    {(draft.sections.bulletins.items || []).map((b, idx) => (
                      <div key={b.id} className="col-md-4">
                        <div className="p-2.5 border rounded-3 bg-light h-100">
                          <div className="d-flex justify-content-between align-items-center gap-1 mb-1.5">
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              value={b.category}
                              placeholder="Category"
                              onChange={(e) => {
                                const items = [...draft.sections.bulletins.items];
                                items[idx] = { ...b, category: e.target.value };
                                setDraft({
                                  ...draft,
                                  sections: {
                                    ...draft.sections,
                                    bulletins: { ...draft.sections.bulletins, items },
                                  },
                                });
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => removeBulletinItem(b.id)}
                              className="btn btn-sm btn-outline-danger px-2"
                            >
                              ✕
                            </button>
                          </div>
                          <input
                            type="text"
                            className="form-control form-control-sm fw-semibold mb-1.5"
                            value={b.title}
                            placeholder="Bulletin Title"
                            onChange={(e) => {
                              const items = [...draft.sections.bulletins.items];
                              items[idx] = { ...b, title: e.target.value };
                              setDraft({
                                ...draft,
                                sections: {
                                  ...draft.sections,
                                  bulletins: { ...draft.sections.bulletins, items },
                                },
                              });
                            }}
                          />
                          <textarea
                            rows={2}
                            className="form-control form-control-sm"
                            value={b.summary}
                            placeholder="Bulletin Summary"
                            onChange={(e) => {
                              const items = [...draft.sections.bulletins.items];
                              items[idx] = { ...b, summary: e.target.value };
                              setDraft({
                                ...draft,
                                sections: {
                                  ...draft.sections,
                                  bulletins: { ...draft.sections.bulletins, items },
                                },
                              });
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Scholar Reviews CUD */}
                <div className="border-top pt-3">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <h6 className="fw-bold mb-0 text-dark" style={{ fontSize: '13.5px' }}>
                      Scholar Voices &amp; Testimonials ({draft.sections.reviews.items?.length || 0})
                    </h6>
                    <button
                      type="button"
                      onClick={addReviewItem}
                      className="btn btn-sm btn-outline-primary rounded-pill px-3"
                      style={{ fontSize: '11.5px' }}
                    >
                      + Add Testimonial
                    </button>
                  </div>
                  <div className="row g-2.5">
                    {(draft.sections.reviews.items || []).map((t, idx) => (
                      <div key={t.id} className="col-md-4">
                        <div className="p-2.5 border rounded-3 bg-light h-100">
                          <div className="d-flex justify-content-between gap-1 mb-1.5">
                            <input
                              type="text"
                              className="form-control form-control-sm fw-semibold"
                              value={t.name}
                              placeholder="Scholar Name"
                              onChange={(e) => {
                                const items = [...draft.sections.reviews.items];
                                items[idx] = { ...t, name: e.target.value };
                                setDraft({
                                  ...draft,
                                  sections: {
                                    ...draft.sections,
                                    reviews: { ...draft.sections.reviews, items },
                                  },
                                });
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => removeReviewItem(t.id)}
                              className="btn btn-sm btn-outline-danger px-2"
                            >
                              ✕
                            </button>
                          </div>
                          <input
                            type="text"
                            className="form-control form-control-sm mb-1.5"
                            value={t.course}
                            placeholder="Degree Programme"
                            onChange={(e) => {
                              const items = [...draft.sections.reviews.items];
                              items[idx] = { ...t, course: e.target.value };
                              setDraft({
                                ...draft,
                                sections: {
                                  ...draft.sections,
                                  reviews: { ...draft.sections.reviews, items },
                                },
                              });
                            }}
                          />
                          <textarea
                            rows={2}
                            className="form-control form-control-sm"
                            value={t.comment}
                            placeholder="Quote"
                            onChange={(e) => {
                              const items = [...draft.sections.reviews.items];
                              items[idx] = { ...t, comment: e.target.value };
                              setDraft({
                                ...draft,
                                sections: {
                                  ...draft.sections,
                                  reviews: { ...draft.sections.reviews, items },
                                },
                              });
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 5. FOOTER & QUICK LINKS CUD */}
            {cmsSubTab === 'footer' && (
              <div className="d-flex flex-column gap-4">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold small mb-1">Organization Name</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={draft.footer.orgName}
                      onChange={(e) => setDraft({ ...draft, footer: { ...draft.footer, orgName: e.target.value } })}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold small mb-1">Copyright Notice</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={draft.footer.copyrightText}
                      onChange={(e) =>
                        setDraft({ ...draft, footer: { ...draft.footer, copyrightText: e.target.value } })
                      }
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-semibold small mb-1">Footer Mission Statement</label>
                    <textarea
                      rows={2}
                      className="form-control form-control-sm"
                      value={draft.footer.description}
                      onChange={(e) =>
                        setDraft({ ...draft, footer: { ...draft.footer, description: e.target.value } })
                      }
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-semibold small mb-1">Official Phone</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={draft.footer.phone}
                      onChange={(e) => setDraft({ ...draft, footer: { ...draft.footer, phone: e.target.value } })}
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-semibold small mb-1">Official Email</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={draft.footer.email}
                      onChange={(e) => setDraft({ ...draft, footer: { ...draft.footer, email: e.target.value } })}
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-semibold small mb-1">Headquarters Address</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={draft.footer.address}
                      onChange={(e) => setDraft({ ...draft, footer: { ...draft.footer, address: e.target.value } })}
                    />
                  </div>
                </div>

                <div className="border-top pt-3">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <h6 className="fw-bold mb-0 text-dark" style={{ fontSize: '13.5px' }}>
                      Footer Bottom &amp; Utility Links ({draft.footer.bottomLinks?.length || 0})
                    </h6>
                    <button
                      type="button"
                      onClick={addFooterBottomLink}
                      className="btn btn-sm btn-outline-primary rounded-pill px-3"
                      style={{ fontSize: '11.5px' }}
                    >
                      + Add Footer Link
                    </button>
                  </div>
                  <div className="row g-2">
                    {(draft.footer.bottomLinks || []).map((lnk, idx) => (
                      <div key={idx} className="col-md-6">
                        <div className="d-flex gap-2 align-items-center p-2 border rounded-2 bg-light">
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            value={lnk.label}
                            placeholder="Label"
                            onChange={(e) => {
                              const bottomLinks = [...draft.footer.bottomLinks];
                              bottomLinks[idx] = { ...lnk, label: e.target.value };
                              setDraft({ ...draft, footer: { ...draft.footer, bottomLinks } });
                            }}
                          />
                          <input
                            type="text"
                            className="form-control form-control-sm font-monospace"
                            value={lnk.route}
                            placeholder="/route"
                            onChange={(e) => {
                              const bottomLinks = [...draft.footer.bottomLinks];
                              bottomLinks[idx] = { ...lnk, route: e.target.value };
                              setDraft({ ...draft, footer: { ...draft.footer, bottomLinks } });
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => removeFooterBottomLink(idx)}
                            className="btn btn-sm btn-outline-danger px-2"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="mt-4 pt-3 border-top d-flex justify-content-end gap-2">
              <button
                type="submit"
                disabled={isSavingCms}
                className="btn btn-primary btn-sm rounded-pill px-4 fw-bold shadow-sm"
                style={{ backgroundColor: '#013BA6', borderColor: '#013BA6' }}
              >
                {isSavingCms ? 'Saving to API...' : 'Save Digital Campus Content Studio'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 2: INSTITUTIONAL PROFILE & SERVER DIAGNOSTICS                   */}
      {/* =================================================================== */}
      {activeSection === 'general' && settings && (
        <div className="card border-0 shadow-sm rounded-3 bg-white p-4">
          <form onSubmit={handleSaveSystemSettings}>
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3 border-bottom pb-3">
              <div>
                <h6 className="fw-bold mb-0.5 text-dark">Institutional Profile &amp; Core System Configuration</h6>
                <p className="text-muted small mb-0">
                  Manage university name, short code, maintenance mode, and server environment parameters.
                </p>
              </div>
              <button
                type="submit"
                disabled={isSavingGeneral}
                className="btn btn-primary btn-sm rounded-pill px-4 fw-bold shadow-sm"
                style={{ backgroundColor: '#013BA6', borderColor: '#013BA6' }}
              >
                {isSavingGeneral ? 'Saving...' : 'Save Institutional Profile'}
              </button>
            </div>

            <div className="row g-3">
              <div className="col-md-8">
                <label className="form-label small fw-semibold">University Full Name</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={settings.site.fullname}
                  onChange={(e) =>
                    setSettings({ ...settings, site: { ...settings.site, fullname: e.target.value } })
                  }
                  required
                />
              </div>
              <div className="col-md-4">
                <label className="form-label small fw-semibold">System Short Code</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={settings.site.shortname}
                  onChange={(e) =>
                    setSettings({ ...settings, site: { ...settings.site, shortname: e.target.value } })
                  }
                  required
                />
              </div>
              <div className="col-12">
                <label className="form-label small fw-semibold">Institutional Summary / Charter</label>
                <textarea
                  className="form-control form-control-sm"
                  rows={2}
                  value={settings.site.summary}
                  onChange={(e) =>
                    setSettings({ ...settings, site: { ...settings.site, summary: e.target.value } })
                  }
                />
              </div>
              <div className="col-md-6">
                <div className="p-3 border rounded-3 bg-light d-flex justify-content-between align-items-center">
                  <div>
                    <div className="fw-semibold small text-dark">Maintenance Mode</div>
                    <div className="text-muted" style={{ fontSize: '11px' }}>
                      Temporarily restrict student access during scheduled upgrades
                    </div>
                  </div>
                  <div className="form-check form-switch mb-0">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={settings.site.maintenance_enabled}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          site: { ...settings.site, maintenance_enabled: e.target.checked },
                        })
                      }
                    />
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="p-3 border rounded-3 bg-light d-flex justify-content-between align-items-center">
                  <div>
                    <div className="fw-semibold small text-dark">Self-Enrollment &amp; Portal Registration</div>
                    <div className="text-muted" style={{ fontSize: '11px' }}>
                      Allow prospective scholars to register accounts online
                    </div>
                  </div>
                  <div className="form-check form-switch mb-0">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={settings.site.registerauth}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          site: { ...settings.site, registerauth: e.target.checked },
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Server & Database Diagnostics */}
              <div className="col-12 mt-3">
                <div className="p-3 border rounded-3 bg-light">
                  <h6 className="fw-bold mb-2.5 text-dark" style={{ fontSize: '13px' }}>
                    <i className="feather-server me-1 text-primary" /> Platform Runtime &amp; Database Telemetry
                  </h6>
                  <div className="row g-3">
                    <div className="col-sm-6 col-md-3">
                      <div className="small text-muted" style={{ fontSize: '11px' }}>Runtime Engine</div>
                      <div className="fw-bold text-dark small">PHP {settings.server.php_version}</div>
                    </div>
                    <div className="col-sm-6 col-md-3">
                      <div className="small text-muted" style={{ fontSize: '11px' }}>Core Release</div>
                      <div className="fw-bold text-dark small">{settings.server.moodle_release}</div>
                    </div>
                    <div className="col-sm-6 col-md-3">
                      <div className="small text-muted" style={{ fontSize: '11px' }}>Database Engine</div>
                      <div className="fw-bold text-dark small">
                        {settings.server.db_type.toUpperCase()} ({settings.server.db_server})
                      </div>
                    </div>
                    <div className="col-sm-6 col-md-3">
                      <div className="small text-muted" style={{ fontSize: '11px' }}>OPCache Status</div>
                      <div className="fw-bold text-success small">
                        {settings.server.opcache_enabled ? 'Accelerated' : 'Standard'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 3: PAYMENT GATEWAYS & TUITION SETTINGS                          */}
      {/* =================================================================== */}
      {activeSection === 'payment' && settings && (
        <div className="card border-0 shadow-sm rounded-3 bg-white p-4">
          <form onSubmit={handleSaveSystemSettings}>
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3 border-bottom pb-3">
              <div>
                <h6 className="fw-bold mb-0.5 text-dark">Pesapal API 3.0 &amp; Tuition Payment Gateways</h6>
                <p className="text-muted small mb-0">
                  Configure mobile money (M-Pesa, Airtel Money, Tigo Pesa) and Visa/Mastercard IPN settlement credentials.
                </p>
              </div>
              <button
                type="submit"
                disabled={isSavingGeneral}
                className="btn btn-primary btn-sm rounded-pill px-4 fw-bold shadow-sm"
                style={{ backgroundColor: '#013BA6', borderColor: '#013BA6' }}
              >
                {isSavingGeneral ? 'Saving...' : 'Save Gateway Settings'}
              </button>
            </div>

            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label small fw-semibold">Gateway Environment</label>
                <select
                  className="form-select form-select-sm"
                  value={settings.payment.pesapal_environment}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      payment: { ...settings.payment, pesapal_environment: e.target.value },
                    })
                  }
                >
                  <option value="sandbox">Sandbox (Testing &amp; Staging)</option>
                  <option value="production">Production Live (Pesapal Tanzania)</option>
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label small fw-semibold">Default Settlement Currency</label>
                <input
                  type="text"
                  className="form-control form-control-sm text-uppercase"
                  value={settings.payment.defaultcurrency}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      payment: { ...settings.payment, defaultcurrency: e.target.value },
                    })
                  }
                />
              </div>
              <div className="col-md-3 d-flex align-items-end">
                <div className="form-check form-switch mb-1">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="pesapalEnabledSwitch"
                    checked={settings.payment.pesapal_enabled}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        payment: { ...settings.payment, pesapal_enabled: e.target.checked },
                      })
                    }
                  />
                  <label className="form-check-label small fw-semibold" htmlFor="pesapalEnabledSwitch">
                    Pesapal Active
                  </label>
                </div>
              </div>

              <div className="col-md-6">
                <label className="form-label small fw-semibold">Pesapal Consumer Key</label>
                <input
                  type="text"
                  className="form-control form-control-sm font-monospace"
                  value={settings.payment.pesapal_consumer_key}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      payment: { ...settings.payment, pesapal_consumer_key: e.target.value },
                    })
                  }
                />
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-semibold">Pesapal Consumer Secret</label>
                <input
                  type="password"
                  className="form-control form-control-sm font-monospace"
                  placeholder="••••••••••••••••"
                  value={settings.payment.pesapal_consumer_secret}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      payment: { ...settings.payment, pesapal_consumer_secret: e.target.value },
                    })
                  }
                />
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-semibold">Pesapal IPN Notification ID</label>
                <input
                  type="text"
                  className="form-control form-control-sm font-monospace"
                  value={settings.payment.pesapal_ipn_id}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      payment: { ...settings.payment, pesapal_ipn_id: e.target.value },
                    })
                  }
                />
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-semibold">Selcom Vendor ID (Secondary Gateway)</label>
                <input
                  type="text"
                  className="form-control form-control-sm font-monospace"
                  value={settings.payment.selcom_vendor_id || ''}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      payment: { ...settings.payment, selcom_vendor_id: e.target.value },
                    })
                  }
                />
              </div>
            </div>
          </form>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 4: COURSE & CURRICULUM DEFAULTS                                 */}
      {/* =================================================================== */}
      {activeSection === 'defaults' && (
        <div className="card border-0 shadow-sm rounded-3 bg-white p-4">
          <form onSubmit={handleSaveCourseDefaults}>
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3 border-bottom pb-3">
              <div>
                <h6 className="fw-bold mb-0.5 text-dark">Default Course &amp; Curriculum Settings</h6>
                <p className="text-muted small mb-0">
                  Configure default format, number of study units, completion tracking, and gradebook visibility for new courses.
                </p>
              </div>
              <button
                type="submit"
                disabled={isSavingDefaults}
                className="btn btn-primary btn-sm rounded-pill px-4 fw-bold shadow-sm"
                style={{ backgroundColor: '#013BA6', borderColor: '#013BA6' }}
              >
                {isSavingDefaults ? 'Saving...' : 'Save Course Defaults'}
              </button>
            </div>

            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label small fw-semibold">Default Course Format</label>
                <select
                  className="form-select form-select-sm"
                  value={localDefaults.format}
                  onChange={(e) => setLocalDefaults({ ...localDefaults, format: e.target.value })}
                >
                  <option value="topics">Topics / Academic Study Units</option>
                  <option value="weeks">Weekly Semester Schedule</option>
                  <option value="singleactivity">Single Activity Module</option>
                  <option value="social">Discussion Forum Format</option>
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label small fw-semibold">Default Number of Study Units</label>
                <input
                  type="number"
                  min={1}
                  max={52}
                  className="form-control form-control-sm"
                  value={localDefaults.numsections}
                  onChange={(e) =>
                    setLocalDefaults({ ...localDefaults, numsections: Number(e.target.value) || 6 })
                  }
                />
              </div>
              <div className="col-md-4">
                <label className="form-label small fw-semibold">Max Upload File Size</label>
                <select
                  className="form-select form-select-sm"
                  value={localDefaults.maxbytes}
                  onChange={(e) => setLocalDefaults({ ...localDefaults, maxbytes: Number(e.target.value) })}
                >
                  <option value={10485760}>10 MB</option>
                  <option value={52428800}>50 MB</option>
                  <option value={104857600}>100 MB</option>
                  <option value={268435456}>256 MB</option>
                </select>
              </div>

              <div className="col-md-4">
                <div className="p-3 border rounded-3 bg-light d-flex justify-content-between align-items-center">
                  <div>
                    <div className="fw-semibold small text-dark">Completion Tracking</div>
                    <div className="text-muted" style={{ fontSize: '11px' }}>
                      Enable activity progress tracking by default
                    </div>
                  </div>
                  <div className="form-check form-switch mb-0">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={localDefaults.enablecompletion === 1}
                      onChange={(e) =>
                        setLocalDefaults({ ...localDefaults, enablecompletion: e.target.checked ? 1 : 0 })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="col-md-4">
                <div className="p-3 border rounded-3 bg-light d-flex justify-content-between align-items-center">
                  <div>
                    <div className="fw-semibold small text-dark">Show Gradebook to Scholars</div>
                    <div className="text-muted" style={{ fontSize: '11px' }}>
                      Display CA and exam grades in student portal
                    </div>
                  </div>
                  <div className="form-check form-switch mb-0">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={localDefaults.showgrades === 1}
                      onChange={(e) =>
                        setLocalDefaults({ ...localDefaults, showgrades: e.target.checked ? 1 : 0 })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="col-md-4">
                <div className="p-3 border rounded-3 bg-light d-flex justify-content-between align-items-center">
                  <div>
                    <div className="fw-semibold small text-dark">Activity Logs &amp; Reports</div>
                    <div className="text-muted" style={{ fontSize: '11px' }}>
                      Allow scholars to view their activity participation logs
                    </div>
                  </div>
                  <div className="form-check form-switch mb-0">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={localDefaults.showreports === 1}
                      onChange={(e) =>
                        setLocalDefaults({ ...localDefaults, showreports: e.target.checked ? 1 : 0 })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 5: SECURITY & SITE ADMINISTRATION SUITE                         */}
      {/* =================================================================== */}
      {activeSection === 'siteadmin' && (
        <div className="card border-0 shadow-sm rounded-3 bg-white p-4">
          <SiteAdminHub
            adminTree={adminTree}
            adminCategories={adminCategories}
            courses={courses}
            courseDefaults={courseDefaults}
            onRefresh={async () => {
              await Promise.resolve(onRefresh());
            }}
            onNotify={onNotify}
            onOpenCourseModal={onOpenCourseModal}
            onOpenCourseStudio={onOpenCourseStudio}
            onSelectTab={onSelectTab}
          />
        </div>
      )}
    </div>
  );
};

export default UnifiedSettingsStudio;

