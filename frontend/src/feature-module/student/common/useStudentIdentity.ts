import { useAuth } from '../../../core/auth/authContext';
import { DEMO_USERS } from '../../../core/auth/demoUsers';

export interface StudentIdentity {
  name: string;
  displayName: string;
  firstName: string;
  initials: string;
  title: string;
  department: string;
  faculty: string;
  regNumber: string;
  email: string;
  avatar: string;
}

const withLeadingSlash = (path: string) =>
  !path ? '/assets/img/user/user-02.jpg' : path.startsWith('http') || path.startsWith('/') ? path : `/${path}`;

/**
 * Resolves the learner shown inside the student portal.
 * Uses the signed-in profile when it is a student account; staff accounts
 * previewing the portal see the reference student profile instead of their own
 * staff identity (e.g. never "OUT LMS Administrator").
 */
export const useStudentIdentity = (): StudentIdentity => {
  const { user } = useAuth();
  const source = user && user.role === 'student' ? user : DEMO_USERS.student;

  const name = source.name || DEMO_USERS.student.name;
  const parts = name.trim().split(/\s+/);
  const dept = source.department || DEMO_USERS.student.department || 'Faculty of Science & Technology';

  return {
    name,
    displayName: name,
    firstName: parts[0],
    initials: (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase(),
    title: source.title || DEMO_USERS.student.title,
    department: dept,
    faculty: dept,
    regNumber: source.regNumber || DEMO_USERS.student.regNumber || 'OUT/2026/04812',
    email: source.email || DEMO_USERS.student.email,
    avatar: withLeadingSlash(source.avatar || DEMO_USERS.student.avatar),
  };
};

export default useStudentIdentity;
