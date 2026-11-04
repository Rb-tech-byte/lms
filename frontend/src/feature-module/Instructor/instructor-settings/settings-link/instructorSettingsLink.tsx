import React from 'react';
import { NavLink } from 'react-router-dom';
import { all_routes } from '../../../router/all_routes';

const SETTINGS_TABS = [
  { to: all_routes.instructorsettings, label: 'Profile Settings', icon: 'feather-user' },
  { to: all_routes.instructorChangePassword, label: 'Security & Password', icon: 'feather-lock' },
  { to: all_routes.instructorSocialProfiles, label: 'Scholarly Profiles', icon: 'feather-globe' },
  { to: all_routes.instructorLinkedAccounts, label: 'Linked Accounts', icon: 'feather-link-2' },
  { to: all_routes.instructorNotification, label: 'Notifications', icon: 'feather-bell' },
  { to: all_routes.instructorIntegrations, label: 'Integrations', icon: 'feather-cpu' },
  { to: all_routes.instructorWithdraw, label: 'Bursar & Payout', icon: 'feather-credit-card' },
  { to: all_routes.instructorPlan, label: 'Faculty Appointment', icon: 'feather-briefcase' },
];

const InstructorSettingsLink: React.FC = () => {
  return (
    <nav className="ins-settings-nav" aria-label="Settings navigation">
      {SETTINGS_TABS.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          className={({ isActive }) => `ins-settings-tab ${isActive ? 'active' : ''}`}
        >
          <i className={tab.icon} />
          <span>{tab.label}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export default InstructorSettingsLink;
