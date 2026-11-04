import { useAuth } from '../../../core/auth/authContext';
import { DEMO_USERS } from '../../../core/auth/demoUsers';

export interface InstructorIdentity {
  name: string;
  displayName: string;
  firstName: string;
  initials: string;
  title: string;
  department: string;
  faculty: string;
  staffId: string;
  email: string;
  avatar: string;
}

const withLeadingSlash = (path: string) =>
  !path ? '/assets/img/user/user-01.jpg' : path.startsWith('http') || path.startsWith('/') ? path : `/${path}`;

/**
 * Resolves the faculty member shown inside the instructor portal.
 * Defaults cleanly to Dr. Amina Kilindo when an admin or guest previews the teaching dashboard.
 */
export const useInstructorIdentity = (): InstructorIdentity => {
  const { user } = useAuth();
  const source = user && user.role === 'instructor' ? user : DEMO_USERS.instructor;

  const name = source.name || DEMO_USERS.instructor.name;
  const parts = name.trim().split(/\s+/);
  const dept = source.department || DEMO_USERS.instructor.department || 'Department of Computing & Information Technology';

  return {
    name,
    displayName: name,
    firstName: parts[0] === 'Dr.' || parts[0] === 'Prof.' || parts[0] === 'Eng.' ? `${parts[0]} ${parts[1] || ''}` : parts[0],
    initials: (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase(),
    title: source.title || DEMO_USERS.instructor.title,
    department: dept,
    faculty: 'Faculty of Science, Technology & Environmental Studies',
    staffId: source.id || DEMO_USERS.instructor.id || 'OUT-INS-0205',
    email: source.email || DEMO_USERS.instructor.email,
    avatar: withLeadingSlash(source.avatar || DEMO_USERS.instructor.avatar),
  };
};

export default useInstructorIdentity;
