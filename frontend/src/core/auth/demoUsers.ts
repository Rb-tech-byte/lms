export type UserRole = 'guest' | 'student' | 'instructor' | 'admin';

export interface UserProfile {
  id: string;
  username?: string;
  name: string;
  fullname?: string;
  email: string;
  role: UserRole;
  avatar: string;
  title: string;
  bio?: string;
  department?: string;
  regNumber?: string;
  phone?: string;
  dashboardUrl: string;
}

export const DEMO_USERS: Record<'student' | 'instructor' | 'admin', UserProfile & { password: string }> = {
  student: {
    id: 'out-stu-1042',
    username: 'student',
    name: 'Baraka Mkwawa',
    email: 'student@out.ac.tz',
    password: 'student123',
    role: 'student',
    avatar: 'assets/img/user/user-02.jpg',
    title: 'BSc. Computer Science Student',
    bio: 'Registered BSc ICT distance-learning scholar at The Open University of Tanzania.',
    department: 'Faculty of Science, Technology & Environmental Studies',
    regNumber: 'OUT/2024/04812',
    phone: '+255 712 345 678',
    dashboardUrl: '/student/student-dashboard',
  },
  instructor: {
    id: 'out-ins-0205',
    username: 'instructor',
    name: 'Dr. Amina Kilindo',
    email: 'instructor@out.ac.tz',
    password: 'instructor123',
    role: 'instructor',
    avatar: 'assets/img/user/user-01.jpg',
    title: 'Senior Lecturer & Course Director',
    bio: 'Senior Lecturer & Course Coordinator at The Open University of Tanzania.',
    department: 'Department of Computing & Information Technology',
    phone: '+255 754 987 654',
    dashboardUrl: '/instructor/instructor-dashboard',
  },
  admin: {
    id: 'out-adm-0001',
    username: 'admin',
    name: 'OUT LMS Administrator',
    email: 'admin@out.ac.tz',
    password: 'admin123',
    role: 'admin',
    avatar: 'assets/img/user/user-03.jpg',
    title: 'Super Administrator',
    bio: 'Chief System Administrator & Registrar — Directorate of ICT Services.',
    department: 'Directorate of ICT Services',
    phone: '+255 22 266 8820',
    dashboardUrl: '/admin/dashboard',
  },
};
