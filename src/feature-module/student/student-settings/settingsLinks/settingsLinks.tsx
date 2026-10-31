import React from "react";
import { Link, useLocation } from "react-router-dom";
import { all_routes } from "../../../router/all_routes";

const SettingsLinks = () => {
  const route = all_routes;
  const location = useLocation();
  return (
    <>
      <ul className="settings-nav d-flex align-items-center flex-wrap border bg-light-900 rounded">
        <li>
          <Link to={route.studentSettings} className={`${location.pathname === '/student-settings' ? 'active' : ''}`}>
            Edit Profile
          </Link>
        </li>
        <li>
          <Link to={route.studentChangePassword} className={`${location.pathname === '/student-change-password' ? 'active' : ''}`}>Security</Link>
        </li>
        <li>
          <Link to={route.studentSocialProfile} className={`${location.pathname === '/student-social-profile' ? 'active' : ''}`}>Social Profiles</Link>
        </li>
        <li>
          <Link to={route.studentLinkedAccounts} className={`${location.pathname === '/student-linked-accounts' ? 'active' : ''}`}>Linked Accounts</Link>
        </li>
        <li>
          <Link to={route.studentNotification} className={`${location.pathname === '/student-notifications' ? 'active' : ''}`}>Notifications</Link>
        </li>
        <li>
          <Link to={route.studentBillingAddress} className={`${location.pathname === '/student-billing-address' ? 'active' : ''}`}>Billing Address</Link>
        </li>
      </ul>
    </>
  );
};

export default SettingsLinks;
