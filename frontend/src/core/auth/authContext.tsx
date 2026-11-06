import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from './demoUsers';
import { fetchMoodleToken, callMoodleWs, parseSafeJson } from '../api/apiClient';
import { getAdminApiUrl } from '../api/adminService';

export interface RegisterPayload {
  fullname?: string;
  firstname?: string;
  lastname?: string;
  username?: string;
  email: string;
  password: string;
  department?: string;
  phone?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole;
  token: string | null;
  isAuthenticated: boolean;
  isImpersonating: boolean;
  login: (usernameOrEmail: string, password?: string) => Promise<boolean>;
  register: (payload: RegisterPayload) => Promise<{ success: boolean; user?: UserProfile; message?: string; error?: string }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  impersonateUser: (target: {
    id: number | string;
    username: string;
    fullname: string;
    email: string;
    role: string;
    department?: string;
    regNumber?: string;
  }) => string;
  stopImpersonation: () => string;
  logout: () => void;
  updateUser: (partial: Partial<UserProfile>) => void;
}

const STORAGE_KEY = 'out_lms_auth_user';
const TOKEN_KEY = 'out_lms_ws_token';
const IMPERSONATOR_KEY = 'out_lms_impersonator_admin';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Queries Moodle backend (`resolve_identity`) for authoritative RBAC role & profile
 */
async function resolveMoodleIdentity(activeToken: string, fallbackUsername?: string): Promise<UserProfile | null> {
  try {
    const apiUrl = `${getAdminApiUrl()}?action=resolve_identity&token=${encodeURIComponent(activeToken)}`;
    const res = await fetch(apiUrl, {
      headers: { Authorization: `Bearer ${activeToken}` },
    });
    if (res.ok) {
      const data = await parseSafeJson(res, 'authContext');
      if (data.success && data.user && data.user.role) {
        return data.user as UserProfile;
      }
    }
  } catch {
    // Fall through to Moodle core_webservice_get_site_info
  }

  try {
    const siteInfo = await callMoodleWs<any>('core_webservice_get_site_info', {}, activeToken);
    if (!siteInfo || !siteInfo.userid) return null;

    const isSiteAdmin = Boolean(siteInfo?.userissiteadmin);
    const usernameLower = (siteInfo?.username || fallbackUsername || '').toLowerCase();

    let resolvedRole: UserRole = 'student';
    let title = 'Undergraduate Scholar';
    let department = 'Faculty of Science, Technology & Environmental Studies';
    let regNumber = 'OUT/2024/04812';
    let dashboardUrl = '/student/student-dashboard';

    if (isSiteAdmin || usernameLower === 'admin') {
      resolvedRole = 'admin';
      title = 'Chief System Administrator & Registrar';
      department = 'Directorate of ICT Services';
      regNumber = 'STAFF/ICT/001';
      dashboardUrl = '/admin/dashboard';
    } else if (
      usernameLower === 'instructor' ||
      usernameLower.includes('teacher') ||
      usernameLower.includes('lecturer') ||
      usernameLower.includes('amina') ||
      Number(siteInfo.userid) === 4
    ) {
      resolvedRole = 'instructor';
      title = 'Senior Lecturer & Course Director';
      department = 'Faculty of Science & Technology';
      regNumber = 'FAC/CS/0205';
      dashboardUrl = '/instructor/instructor-dashboard';
    }

    return {
      id: String(siteInfo.userid),
      name: siteInfo.fullname || fallbackUsername || 'OUT Scholar',
      email: siteInfo.username
        ? siteInfo.username.includes('@')
          ? siteInfo.username
          : `${siteInfo.username}@out.ac.tz`
        : `${fallbackUsername || 'scholar'}@out.ac.tz`,
      role: resolvedRole,
      avatar:
        siteInfo.userpictureurl ||
        (resolvedRole === 'admin'
          ? 'assets/img/user/user-03.jpg'
          : resolvedRole === 'instructor'
            ? 'assets/img/user/user-01.jpg'
            : 'assets/img/user/user-02.jpg'),
      title,
      department,
      regNumber,
      dashboardUrl,
    };
  } catch {
    return null;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem(TOKEN_KEY) || null;
  });

  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const savedToken = localStorage.getItem(TOKEN_KEY);
      if (saved && savedToken) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.id && parsed.role) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to parse auth user from storage', e);
    }
    return null;
  });

  const [isImpersonating, setIsImpersonating] = useState<boolean>(() => {
    return Boolean(sessionStorage.getItem(IMPERSONATOR_KEY));
  });

  const isAuthenticated = user !== null && user.role !== 'guest' && Boolean(token);
  const role: UserRole = user && token ? user.role : 'guest';

  // Persist user & token changes
  useEffect(() => {
    try {
      if (user && token) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        localStorage.setItem(TOKEN_KEY, token);
      } else {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(TOKEN_KEY);
      }
    } catch (e) {
      console.error('Failed to persist auth user', e);
    }
  }, [user, token]);

  // Verify token & enforce authoritative RBAC role on session boot (skips while admin is actively impersonating)
  useEffect(() => {
    let active = true;
    if (!token || sessionStorage.getItem(IMPERSONATOR_KEY)) return;

    resolveMoodleIdentity(token).then((verifiedProfile) => {
      if (!active || sessionStorage.getItem(IMPERSONATOR_KEY)) return;
      if (verifiedProfile) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(verifiedProfile));
        setUser((prev) => {
          if (!prev || prev.role !== verifiedProfile.role || prev.id !== verifiedProfile.id) {
            return verifiedProfile;
          }
          return prev;
        });
      }
    });

    return () => {
      active = false;
    };
  }, [token]);

  const login = async (usernameOrEmail: string, password?: string): Promise<boolean> => {
    const trimmedInput = usernameOrEmail.trim();
    if (!trimmedInput || !password) {
      return false;
    }

    sessionStorage.removeItem(IMPERSONATOR_KEY);
    setIsImpersonating(false);

    // Map known OUT email addresses to usernames for token.php compatibility
    const lower = trimmedInput.toLowerCase();
    const moodleUsername =
      lower === 'admin@out.ac.tz' || lower === 'ict@out.ac.tz'
        ? 'admin'
        : lower === 'instructor@out.ac.tz'
          ? 'instructor'
          : lower === 'student@out.ac.tz'
            ? 'student'
            : trimmedInput;

    // 1. Live token exchange
    try {
      const liveToken = await fetchMoodleToken(moodleUsername, password);
      if (liveToken) {
        localStorage.setItem(TOKEN_KEY, liveToken);
        setToken(liveToken);

        const verifiedUser = await resolveMoodleIdentity(liveToken, moodleUsername);
        if (verifiedUser) {
          // Ensure admin login always resolves to /admin/dashboard
          if (moodleUsername === 'admin' || verifiedUser.role === 'admin') {
            verifiedUser.role = 'admin';
            verifiedUser.dashboardUrl = '/admin/dashboard';
          }
          localStorage.setItem(STORAGE_KEY, JSON.stringify(verifiedUser));
          setUser(verifiedUser);
          return true;
        }
      }
    } catch (err) {
      console.warn('Live token exchange fell back to verified credential check:', err);
    }

    // No client-side credential fallbacks: authentication is decided by the server only.
    return false;
  };

  const register = async (
    payload: RegisterPayload
  ): Promise<{ success: boolean; user?: UserProfile; message?: string; error?: string }> => {
    try {
      const res = await fetch(`${getAdminApiUrl()}?action=register_user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await parseSafeJson(res, 'authContext');
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Failed to register scholar account.' };
      }
      if (data.token && data.user) {
        localStorage.setItem(TOKEN_KEY, data.token);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
      }
      return {
        success: true,
        user: data.user,
        message: data.message || 'Account created successfully.',
      };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Network error while registering account.' };
    }
  };

  const changePassword = async (
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; message?: string; error?: string }> => {
    if (!token) {
      return { success: false, error: 'You must be signed in to change your password.' };
    }
    try {
      const res = await fetch(`${getAdminApiUrl()}?action=change_password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          token,
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });
      const data = await parseSafeJson(res, 'authContext');
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Failed to update password.' };
      }
      return { success: true, message: data.message || 'Password updated successfully.' };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Unable to reach password service.' };
    }
  };

  const impersonateUser = (target: {
    id: number | string;
    username: string;
    fullname: string;
    email: string;
    role: string;
    department?: string;
    regNumber?: string;
  }): string => {
    // Save current admin profile & token so we can restore it when exiting impersonation
    if (user && !sessionStorage.getItem(IMPERSONATOR_KEY)) {
      sessionStorage.setItem(
        IMPERSONATOR_KEY,
        JSON.stringify({ user, token })
      );
    }
    const roleLower = (target.role || 'student').toLowerCase();
    const mappedRole: UserRole =
      roleLower.includes('admin')
        ? 'admin'
        : roleLower.includes('instructor') || roleLower.includes('teacher') || roleLower.includes('lecturer')
          ? 'instructor'
          : 'student';

    const targetDashboard =
      mappedRole === 'admin'
        ? '/admin/dashboard'
        : mappedRole === 'instructor'
          ? '/instructor/instructor-dashboard'
          : '/student/student-dashboard';

    const impersonatedProfile: UserProfile = {
      id: String(target.id),
      username: target.username,
      name: target.fullname,
      email: target.email,
      role: mappedRole,
      avatar:
        mappedRole === 'admin'
          ? '/assets/img/user/user-03.jpg'
          : mappedRole === 'instructor'
            ? '/assets/img/user/user-01.jpg'
            : '/assets/img/user/user-02.jpg',
      title:
        mappedRole === 'admin'
          ? 'System Administrator'
          : mappedRole === 'instructor'
            ? 'Senior Lecturer & Course Coordinator'
            : 'Undergraduate Scholar',
      department: target.department || 'Academic Faculty',
      regNumber: target.regNumber || `OUT/2026/${target.id}`,
      dashboardUrl: targetDashboard,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(impersonatedProfile));
    setUser(impersonatedProfile);
    setIsImpersonating(true);
    return targetDashboard;
  };

  const stopImpersonation = (): string => {
    try {
      const savedRaw = sessionStorage.getItem(IMPERSONATOR_KEY);
      sessionStorage.removeItem(IMPERSONATOR_KEY);
      setIsImpersonating(false);
      if (savedRaw) {
        const parsed = JSON.parse(savedRaw);
        if (parsed?.user) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed.user));
          setUser(parsed.user);
        }
        if (parsed?.token) {
          localStorage.setItem(TOKEN_KEY, parsed.token);
          setToken(parsed.token);
        }
      }
    } catch {
      sessionStorage.removeItem(IMPERSONATOR_KEY);
      setIsImpersonating(false);
    }
    return '/admin/dashboard?tab=users';
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setIsImpersonating(false);
    sessionStorage.removeItem(IMPERSONATOR_KEY);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TOKEN_KEY);
  };

  const updateUser = (partial: Partial<UserProfile>) => {
    setUser((prev) => (prev ? { ...prev, ...partial } : null));
    if (token) {
      fetch(`${getAdminApiUrl()}?action=update_my_profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...partial, token }),
      }).catch(() => { });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        token,
        isAuthenticated,
        isImpersonating,
        login,
        register,
        changePassword,
        impersonateUser,
        stopImpersonation,
        logout,
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
