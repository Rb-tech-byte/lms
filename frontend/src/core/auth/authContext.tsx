import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole, DEMO_USERS } from './demoUsers';
import { fetchMoodleToken, callMoodleWs } from '../api/apiClient';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole;
  isAuthenticated: boolean;
  login: (usernameOrEmail: string, password?: string) => Promise<boolean> | boolean;
  loginAs: (role: 'student' | 'instructor' | 'admin') => UserProfile;
  logout: () => void;
  switchRole: (role: 'student' | 'instructor' | 'admin') => void;
  updateUser: (partial: Partial<UserProfile>) => void;
}

const STORAGE_KEY = 'out_lms_auth_user';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to parse auth user from storage', e);
    }
    return null;
  });

  const isAuthenticated = user !== null && user.role !== 'guest';
  const role: UserRole = user ? user.role : 'guest';

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) {
      console.error('Failed to persist auth user', e);
    }
  }, [user]);

  const login = async (usernameOrEmail: string, password?: string): Promise<boolean> => {
    const trimmedInput = usernameOrEmail.trim();

    // 1. If password is provided and not in pure mock mode, attempt live Moodle token exchange
    if (password && !process.env.REACT_APP_USE_MOCK) {
      try {
        const token = await fetchMoodleToken(trimmedInput, password);
        if (token) {
          // Fetch real site info & user identity from Moodle
          const siteInfo = await callMoodleWs<any>('core_webservice_get_site_info', {}, token);
          const isAdmin = Boolean(siteInfo?.userissiteadmin);
          const liveUser: UserProfile = {
            id: `moodle-${siteInfo?.userid || Date.now()}`,
            name: siteInfo?.fullname || trimmedInput,
            email: siteInfo?.username ? `${siteInfo.username}@out.ac.tz` : trimmedInput,
            role: isAdmin ? 'admin' : 'student',
            avatar: siteInfo?.userpictureurl || 'assets/img/user/user-02.jpg',
            title: isAdmin ? 'System Administrator' : 'Enrolled Student',
            department: siteInfo?.sitename || 'Open University of Tanzania',
            dashboardUrl: isAdmin ? '/admin/dashboard' : '/student/student-dashboard',
          };
          setUser(liveUser);
          return true;
        }
      } catch (err) {
        console.warn('Live Moodle authentication failed, evaluating local/demo credentials:', err);
      }
    }

    // 2. Demo accounts & fallback
    const lower = trimmedInput.toLowerCase();
    if (lower.includes('student') || lower === DEMO_USERS.student.email) {
      setUser(DEMO_USERS.student);
      return true;
    }
    if (lower.includes('instructor') || lower.includes('teacher') || lower === DEMO_USERS.instructor.email) {
      setUser(DEMO_USERS.instructor);
      return true;
    }
    if (lower.includes('admin') || lower === DEMO_USERS.admin.email) {
      setUser(DEMO_USERS.admin);
      return true;
    }

    // Default fallback to student with custom email/name
    const customUser: UserProfile = {
      id: `out-${Date.now()}`,
      name: trimmedInput.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      email: trimmedInput,
      role: 'student',
      avatar: 'assets/img/user/user-02.jpg',
      title: 'Registered Student',
      department: 'Open University of Tanzania',
      dashboardUrl: '/student/student-dashboard',
    };
    setUser(customUser);
    return true;
  };

  const loginAs = (targetRole: 'student' | 'instructor' | 'admin'): UserProfile => {
    const profile = DEMO_USERS[targetRole];
    setUser(profile);
    return profile;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const switchRole = (newRole: 'student' | 'instructor' | 'admin') => {
    loginAs(newRole);
  };

  const updateUser = (partial: Partial<UserProfile>) => {
    setUser((prev) => (prev ? { ...prev, ...partial } : null));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated,
        login,
        loginAs,
        logout,
        switchRole,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
