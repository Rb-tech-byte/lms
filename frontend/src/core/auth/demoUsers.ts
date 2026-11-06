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

export const DEMO_USERS: Record<'student' | 'instructor' | 'coursecreator' | 'admin', UserProfile & { password: string }> = {
  student: {
    id: 'out-stu-1042',
    username: 'student',
    name: 'Baraka Mkwawa',
    email: 'student@out.ac.tz',
    password: 'Student@2026!',
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
    password: 'Instructor@2026!',
    role: 'instructor',
    avatar: 'assets/img/user/user-01.jpg',
    title: 'Senior Lecturer & Course Director',
    bio: 'Senior Lecturer & Course Coordinator at The Open University of Tanzania.',
    department: 'Department of Computing & Information Technology',
    phone: '+255 754 987 654',
    dashboardUrl: '/instructor/instructor-dashboard',
  },
  coursecreator: {
    id: 'out-cc-0014',
    username: 'coursecreator',
    name: 'Prof. Joseph Mbwambo',
    email: 'coursecreator@out.ac.tz',
    password: 'Creator@2026!',
    role: 'instructor',
    avatar: 'assets/img/user/user-01.jpg',
    title: 'Curriculum & Course Creator',
    bio: 'Curriculum & Course Creator — Directorate of Academic Quality at The Open University of Tanzania.',
    department: 'Directorate of Curriculum & Academic Quality',
    phone: '+255 754 112 233',
    dashboardUrl: '/course/add-course',
  },
  admin: {
    id: 'out-adm-0001',
    username: 'admin',
    name: 'OUT LMS Administrator',
    email: 'admin@out.ac.tz',
    password: 'Admin@2026!',
    role: 'admin',
    avatar: 'assets/img/user/user-03.jpg',
    title: 'Super Administrator',
    bio: 'Chief System Administrator & Registrar — Directorate of ICT Services.',
    department: 'Directorate of ICT Services',
    phone: '+255 22 266 8820',
    dashboardUrl: '/admin/dashboard',
  },
};
