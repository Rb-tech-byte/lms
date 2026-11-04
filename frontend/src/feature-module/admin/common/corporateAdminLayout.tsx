import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CorporateAdminSidebar from './corporateAdminSidebar';
import CorporateAdminHeader from './corporateAdminHeader';
import { adminService } from '../../../core/api/adminService';

export interface CorporateAdminLayoutProps {
  children: React.ReactNode;
  activeView: string;
  onSelectView?: (view: string) => void;
  actionAlert?: { type: 'success' | 'danger'; message: string } | null;
  onDismissAlert?: () => void;
  onRefresh?: () => void;
}

export const CorporateAdminLayout: React.FC<CorporateAdminLayoutProps> = ({
  children,
  activeView,
  onSelectView,
  actionAlert,
  onDismissAlert,
  onRefresh,
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [localAlert, setLocalAlert] = useState<{ type: 'success' | 'danger'; message: string } | null>(null);
  const navigate = useNavigate();

  const handleSelectView = (view: string) => {
    if (onSelectView) {
      onSelectView(view);
      return;
    }
    switch (view) {
      case 'dashboard':
        navigate('/admin/dashboard');
        break;
      case 'categories':
      case 'course-category':
        navigate('/admin/dashboard?tab=categories');
        break;
      case 'students':
      case 'student-list':
        navigate('/admin/dashboard?tab=students');
        break;
      case 'courses':
      case 'mycourses':
        navigate('/admin/dashboard?tab=courses');
        break;
      case 'studio':
        navigate('/course/course-details?id=4');
        break;
      default:
        navigate(`/admin/dashboard?tab=${view}`);
        break;
    }
  };

  const [isPurging, setIsPurging] = useState(false);

  const handlePurgeCache = async () => {
    setIsPurging(true);
    try {
      const res = await adminService.purgeCache();
      const timeInfo = res?.execution_time ? ` in ${res.execution_time}` : '';
      setLocalAlert({ type: 'success', message: `Platform caches refreshed successfully${timeInfo}.` });
      onRefresh?.();
    } catch (err: any) {
      setLocalAlert({ type: 'danger', message: err.message || 'Failed to refresh caches.' });
    } finally {
      setIsPurging(false);
    }
  };

  const currentAlert = actionAlert || localAlert;
  const sidebarWidth = sidebarCollapsed ? '60px' : '188px';

  return (
    <div
      className="corporate-lms-admin-app d-flex"
      style={{
        backgroundColor: '#f4f6fa',
        minHeight: '100vh',
      }}
    >
      <CorporateAdminSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        activeView={activeView}
        onSelectView={handleSelectView}
        onOpenCourseStudio={(id) => navigate(`/course/course-details?id=${id || 4}`)}
        onPurgeCache={handlePurgeCache}
      />

      <div
        className="corporate-main-content flex-grow-1 d-flex flex-column"
        style={{
          marginLeft: sidebarWidth,
          width: `calc(100% - ${sidebarWidth})`,
          minHeight: '100vh',
          minWidth: 0,
          backgroundColor: '#f4f6fa',
          transition: 'margin-left 0.2s ease, width 0.2s ease',
        }}
      >
        <CorporateAdminHeader
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          onPurgeCache={handlePurgeCache}
          isPurging={isPurging}
          activeView={activeView}
          onSelectView={handleSelectView}
        />

        {currentAlert && (
          <div className="mx-3 mx-md-4 mt-3">
            <div className={`alert alert-${currentAlert.type} alert-dismissible fade show shadow-sm mb-0 py-2`} role="alert">
              <div className="d-flex align-items-center small">
                <i className={`feather-${currentAlert.type === 'success' ? 'check-circle' : 'alert-circle'} me-2`} />
                <div>{currentAlert.message}</div>
              </div>
              <button
                type="button"
                className="btn-close btn-sm"
                onClick={() => {
                  setLocalAlert(null);
                  onDismissAlert?.();
                }}
              />
            </div>
          </div>
        )}

        <div className="p-3 p-md-4 flex-grow-1">
          {children}
        </div>
      </div>
    </div>
  );
};

export default CorporateAdminLayout;
