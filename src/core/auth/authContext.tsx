import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole, DEMO_USERS } from './demoUsers';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole;
  isAuthenticated: boolean;
  login: (email: string, password?: string) => boolean;
  loginAs: (role: 'student' | 'instructor' | 'admin') => UserProfile;
  logout: () => void;
  switchRole: (role: 'student' | 'instructor' | 'admin') => void;
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

  const login = (email: string, password?: string): boolean => {
    const trimmedEmail = email.trim().toLowerCase();
    
    // Check against demo accounts
    if (trimmedEmail.includes('student') || trimmedEmail === DEMO_USERS.student.email) {
      setUser(DEMO_USERS.student);
      return true;
    }
    if (trimmedEmail.includes('instructor') || trimmedEmail.includes('teacher') || trimmedEmail === DEMO_USERS.instructor.email) {
      setUser(DEMO_USERS.instructor);
      return true;
    }
    if (trimmedEmail.includes('admin') || trimmedEmail === DEMO_USERS.admin.email) {
      setUser(DEMO_USERS.admin);
      return true;
    }

    // Default fallback to student with custom email
    const customUser: UserProfile = {
      id: `out-${Date.now()}`,
      name: email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      email: email,
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
