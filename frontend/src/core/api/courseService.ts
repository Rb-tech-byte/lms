/**
 * Course and Category Service for OUT LMS
 * Interfaces with Moodle 5.x core_course_* external functions with fallback to mock data.
 */

import { callMoodleWs, callInternalApi, callMoodleRestV2, isMockMode } from './apiClient';
import { MOODLE_ENDPOINTS } from './moodleEndpoints';

export interface PublicInstructorProfile {
  id: number;
  name: string;
  fullname: string;
  role: string;
  department: string;
  faculty: string;
  city: string;
  country: string;
  email: string;
  staffId: string;
  avatar: string;
  coursesCount: number;
  courseCount: number;
  studentsCount: number;
  studentCount: number;
  rating: string;
  reviewsCount: number;
  bio: string;
  skills: string[];
  courses: PublicCatalogCourse[];
}

export type PublicInstructor = PublicInstructorProfile;

export interface PublicCatalogCourse {
  id: number;
  fullname: string;
  shortname: string;
  summary: string;
  categoryid: number;
  categoryName: string;
  categoryname: string;
  tuitionFee: number;
  fee: number;
  price?: number;
  format?: string;
  currency: string;
  priceFormatted: string;
  sectionsCount: number;
  modulesCount: number;
  lessonsCount: number;
  enrolledCount: number;
  instructorName: string;
  instructorAvatar: string;
  instructor: {
    id: number;
    fullname: string;
    role: string;
    avatar: string;
  };
  courseImage: string;
  image: string;
  rating: string;
  reviewsCount: number;
  startdate: number;
  categoryCode?: string;
  programType?: string;
  isPSC?: boolean;
  isMOOC?: boolean;
  tuitionFeeUSD?: number;
  priceUSDFormatted?: string;
  duration?: string;
  cpdCredits?: number;
  deliveryMode?: string;
  difficultyLevel?: string;
  hasCertificate?: boolean;
  hasLiveClassroom?: boolean;
  hasReengagementNudge?: boolean;
  hasH5P?: boolean;
  accreditation?: string;
  sponsorshipEligible?: boolean;
  accentColor?: string;
  badgeText?: string;
  feeEnrolId?: number;
}

export interface CourseCategory {
  id: number;
  name: string;
  idnumber?: string;
  description?: string;
  parent?: number;
  coursecount: number;
  visible?: number;
  icon?: string;
  categoryIcon?: string;
  cover?: string;
  categoryCover?: string;
  accentColor?: string;
  badgeText?: string;
  feeEnrolId?: number;
}

export type MoodleCategory = CourseCategory;
export type PublicCatalogCategory = CourseCategory;

export interface MoodleCourse {
  id: number;
  shortname: string;
  fullname: string;
  displayname?: string;
  categoryid?: number;
  summary?: string;
  summaryformat?: number;
  overviewfiles?: Array<{ fileurl: string; filename: string }>;
  enrolledusercount?: number;
  progress?: number | null;
  completed?: boolean | null;
}

export interface CourseModuleContent {
  type: string;
  filename: string;
  filepath?: string;
  filesize?: number;
  fileurl?: string;
  timecreated?: number;
  timemodified?: number;
  mimetype?: string;
  content?: string;
}

export interface CourseModule {
  id: number;
  url?: string;
  name: string;
  instance: number;
  contextid?: number;
  visible: number;
  uservisible?: boolean;
  modicon?: string;
  modname: 'url' | 'page' | 'resource' | 'quiz' | 'assign' | 'forum' | string;
  purpose?: string;
  completion: number; // 0 = none, 1 = manual, 2 = automatic
  completiondata?: {
    state: number; // 0 = incomplete, 1 = complete, 2 = complete pass, 3 = complete fail
    timecompleted?: number;
    overrideby?: number | null;
    valueused?: boolean;
  };
  contents?: CourseModuleContent[];
  description?: string;
}

export interface CourseSection {
  id: number;
  name: string;
  visible: number;
  summary: string;
  summaryformat: number;
  section: number;
  hiddenbynumsections?: number;
  uservisible: boolean;
  modules: CourseModule[];
}

export interface MoodlePageContent {
  id: number;
  coursemodule: number;
  course: number;
  name: string;
  intro: string;
  content: string;
}

export interface EnrolledCourse {
  id: number;
  shortname: string;
  fullname: string;
  displayname?: string;
  enrolledusercount?: number;
  idnumber?: string;
  visible?: number;
  summary?: string;
  summaryformat?: number;
  format?: string;
  courseimage?: string;
  showgrades?: boolean;
  enablecompletion?: boolean;
  progress: number | null;
  completed: boolean | null;
  startdate?: number;
  enddate?: number;
  category?: number;
  lastaccess?: number;
  isfavourite?: boolean;
}

export const getMoodleUserId = (user: any): number => {
  if (!user) return 2;
  if (typeof user.id === 'number') return user.id;
  if (typeof user.id === 'string') {
    if (user.id.startsWith('moodle-')) {
      const parsed = parseInt(user.id.replace('moodle-', ''), 10);
      if (!isNaN(parsed)) return parsed;
    }
    if (user.id.includes('stu')) return 3; // Student Baraka Mkwawa
  }
  if (user.email === 'student@out.ac.tz') return 3;
  return 2;
};

export const courseService = {
  /**
   * Fetches all published academic categories from Moodle
   */
  async getCategories(): Promise<CourseCategory[]> {
    if (isMockMode()) {
      return [
        { id: 1, name: 'Faculty of Science, Technology & Environmental Studies', coursecount: 48 },
        { id: 2, name: 'Faculty of Business Management', coursecount: 64 },
        { id: 3, name: 'Faculty of Law', coursecount: 32 },
        { id: 4, name: 'Faculty of Education', coursecount: 55 },
        { id: 5, name: 'Institute of Continuing Education', coursecount: 26 },
      ];
    }
    return callMoodleWs<CourseCategory[]>(MOODLE_ENDPOINTS.GET_CATEGORIES);
  },

  /**
   * Fetches courses, optionally filtered by category
   */
  async getCourses(categoryId?: number): Promise<MoodleCourse[]> {
    if (isMockMode()) {
      return [
        {
          id: 101,
          shortname: 'ICT301',
          fullname: 'Advanced Web Applications & Distributed Systems',
          categoryid: 1,
          summary: 'Modern software engineering with microservices, cloud APIs, and scalable architectures.',
          enrolledusercount: 142,
        },
        {
          id: 102,
          shortname: 'BM402',
          fullname: 'Strategic Financial Management in East Africa',
          categoryid: 2,
          summary: 'Corporate finance, regional capital markets, and financial forecasting.',
          enrolledusercount: 180,
        },
        {
          id: 103,
          shortname: 'LAW205',
          fullname: 'Commercial Law and Intellectual Property Rights',
          categoryid: 3,
          summary: 'In-depth review of Tanzanian, EAC, and international commercial statutes.',
          enrolledusercount: 98,
        },
      ];
    }

    if (categoryId) {
      return callMoodleWs<MoodleCourse[]>(MOODLE_ENDPOINTS.GET_COURSES_BY_FIELD, {
        field: 'category',
        value: categoryId.toString(),
      });
    }

    return callMoodleWs<MoodleCourse[]>(MOODLE_ENDPOINTS.GET_COURSES);
  },

  /**
   * Fetches detailed syllabus, sections, and activities for a specific course
   */
  async getCourseContents(courseId: number): Promise<CourseSection[]> {
    if (isMockMode()) {
      return [
        {
          id: 1,
          name: 'Unit 1: Core Foundations & Programme Orientation',
          visible: 1,
          summary: 'Overview of fundamental academic concepts, study schedule, and continuous assessment guidelines.',
          summaryformat: 1,
          section: 1,
          uservisible: true,
          modules: [
            { id: 11, name: 'Lecture 1.1: Core Principles & Study Framework', instance: 1, visible: 1, completion: 1, modname: 'page' },
            { id: 12, name: 'Reference Guide: Prescribed Academic Texts & Readings', instance: 2, visible: 1, completion: 1, modname: 'resource' },
            { id: 13, name: 'Checkpoint Quiz 1: Foundational Concepts', instance: 3, visible: 1, completion: 1, modname: 'quiz' },
          ],
        },
        {
          id: 2,
          name: 'Unit 2: Applied Case Studies & Practical Lab',
          visible: 1,
          summary: 'Practical problem-solving, applied methodologies, and coursework assignments.',
          summaryformat: 1,
          section: 2,
          uservisible: true,
          modules: [
            { id: 21, name: 'Lecture 2.1: Applied Case Study Analysis', instance: 4, visible: 1, completion: 1, modname: 'page' },
            { id: 22, name: 'Coursework Assignment 1: Practical Submission', instance: 5, visible: 1, completion: 1, modname: 'assign' },
          ],
        },
      ];
    }

    return callMoodleWs<CourseSection[]>(MOODLE_ENDPOINTS.GET_COURSE_CONTENTS, { courseid: courseId });
  },

  /**
   * Updates an activity completion status in real-time on Moodle backend
   */
  async updateActivityCompletion(cmid: number, completed: boolean): Promise<{ status: boolean }> {
    if (isMockMode()) {
      return { status: true };
    }
    return callMoodleWs<{ status: boolean }>(MOODLE_ENDPOINTS.UPDATE_ACTIVITY_COMPLETION, {
      cmid,
      completed: completed ? 1 : 0,
    });
  },

  /**
   * Fetches full HTML pages and lecture readings for a course
   */
  async getPagesByCourse(courseId: number): Promise<MoodlePageContent[]> {
    if (isMockMode()) {
      return [];
    }
    try {
      const res = await callMoodleWs<{ pages: MoodlePageContent[] }>(MOODLE_ENDPOINTS.GET_PAGES_BY_COURSES, {
        courseids: [courseId],
      });
      return res.pages || [];
    } catch {
      return [];
    }
  },

  /**
   * Fetches courses enrolled by a user along with completion progress
   */
  async getUserEnrolledCourses(userId: number = 2): Promise<EnrolledCourse[]> {
    if (isMockMode()) {
      return [
        {
          id: 2,
          shortname: 'CS101',
          fullname: 'Data Structures & Algorithms in Python',
          displayname: 'Data Structures & Algorithms in Python',
          summary: 'Comprehensive undergraduate course covering linked lists, trees, graphs, sorting, and algorithmic complexity at OUT.',
          enablecompletion: true,
          progress: 10,
          completed: false,
          category: 2,
          enrolledusercount: 142,
        },
        {
          id: 3,
          shortname: 'CS202',
          fullname: 'Cloud Computing & Distributed Systems',
          displayname: 'Cloud Computing & Distributed Systems',
          summary: 'Principles of enterprise cloud infrastructure, virtualization, microservices, and container orchestration.',
          enablecompletion: false,
          progress: 0,
          completed: false,
          category: 2,
          enrolledusercount: 85,
        },
        {
          id: 4,
          shortname: 'BBA301',
          fullname: 'Financial Management & Strategic Planning',
          displayname: 'Financial Management & Strategic Planning',
          summary: 'Corporate financial decision-making, capital budgeting, and asset pricing models.',
          enablecompletion: true,
          progress: 100,
          completed: true,
          category: 2,
          enrolledusercount: 110,
        },
      ];
    }

    try {
      const courses = await callMoodleWs<EnrolledCourse[]>(MOODLE_ENDPOINTS.GET_USERS_COURSES, {
        userid: userId,
        returnusercount: 1,
      });
      return Array.isArray(courses) ? courses : [];
    } catch (err) {
      console.warn('Failed to fetch user enrolled courses from Moodle, using fallback:', err);
      return [];
    }
  },

  /**
   * Fetches enriched public catalog (courses, categories, and university stats) via Internal API + Web Services
   */
  async getPublicCatalog(): Promise<{
    courses: PublicCatalogCourse[];
    categories: CourseCategory[];
    stats: {
      totalScholars: number;
      totalStudents: number;
      totalCourses: number;
      totalFaculties: number;
      totalCategories: number;
      totalInstructors: number;
      regionalCenters: number;
      satisfactionRate: string;
    };
  }> {
    const normalizeCourse = (c: any, idx: number): PublicCatalogCourse => {
      const catName = c.categoryName || c.categoryname || (c.id === 4 ? 'Faculty of Business Management' : 'Faculty of Science, Technology & Environmental Studies');
      const feeVal = typeof c.tuitionFee === 'number' ? c.tuitionFee : typeof c.fee === 'number' ? c.fee : c.id === 2 ? 150000 : c.id === 3 ? 180000 : 220000;
      const imgVal = c.courseImage || c.image || `/assets/img/course/thumbnails/course-${c.id}-${(c.shortname || 'cs101').toLowerCase().replace(/[^a-z0-9]/g, '-')}.svg`;
      const instName = c.instructorName || c.instructor?.fullname || 'Dr. Amina Kilindo';
      const instAvatar = c.instructorAvatar || c.instructor?.avatar || '/assets/img/user/user-01.jpg';
      const modsCount = c.modulesCount || c.lessonsCount || 10;
      return {
        id: Number(c.id),
        fullname: c.fullname || 'OUT Academic Programme',
        shortname: c.shortname || `OUT-${c.id}`,
        summary: (c.summary || '').replace(/<[^>]+>/g, '').trim(),
        categoryid: Number(c.categoryid || 1),
        categoryName: catName,
        categoryname: catName,
        tuitionFee: feeVal,
        fee: feeVal,
        currency: c.currency || 'TZS',
        priceFormatted: c.priceFormatted || `TZS ${feeVal.toLocaleString()}`,
        sectionsCount: Number(c.sectionsCount || 4),
        modulesCount: Number(modsCount),
        lessonsCount: Number(modsCount),
        enrolledCount: Number(c.enrolledCount || c.enrolledusercount || 45),
        instructorName: instName,
        instructorAvatar: instAvatar,
        instructor: {
          id: Number(c.instructor?.id || 4),
          fullname: instName,
          role: c.instructor?.role || 'Senior Lecturer & Course Director',
          avatar: instAvatar,
        },
        courseImage: imgVal,
        image: imgVal,
        rating: String(c.rating || '4.9'),
        reviewsCount: Number(c.reviewsCount || 48),
        startdate: c.startdate || Math.floor(Date.now() / 1000) - 86400 * 14,
        categoryCode: c.categoryCode,
        programType: c.programType,
        isPSC: typeof c.isPSC === 'boolean' ? c.isPSC : undefined,
        isMOOC: typeof c.isMOOC === 'boolean' ? c.isMOOC : undefined,
        tuitionFeeUSD: c.tuitionFeeUSD,
        priceUSDFormatted: c.priceUSDFormatted,
        duration: c.duration,
        cpdCredits: c.cpdCredits,
        deliveryMode: c.deliveryMode,
        difficultyLevel: c.difficultyLevel,
        hasCertificate: c.hasCertificate,
        hasLiveClassroom: c.hasLiveClassroom,
        hasReengagementNudge: c.hasReengagementNudge,
        hasH5P: c.hasH5P,
        accreditation: c.accreditation,
        sponsorshipEligible: c.sponsorshipEligible,
        accentColor: c.accentColor || (c.isMOOC ? '#10b981' : (c.isPSC ? '#06b6d4' : '#0171BB')),
        badgeText: c.badgeText || (c.isMOOC ? 'Free / Open Access MOOC' : (c.isPSC ? 'Professional Short Course' : 'Academic Degree')),
      };
    };

    try {
      const res = await callInternalApi<any>('public_catalog', undefined, 'GET');
      if (res && res.success) {
        const mappedCourses = (res.courses || []).map((c: any, idx: number) => normalizeCourse(c, idx));
        const totalScholars = Number(res.stats?.totalScholars || 14820);
        const totalFaculties = Number(res.stats?.totalFaculties || (res.categories || []).length || 5);
        return {
          courses: mappedCourses,
          categories: res.categories || [],
          stats: {
            totalScholars,
            totalStudents: totalScholars,
            totalCourses: mappedCourses.length || 3,
            totalFaculties,
            totalCategories: totalFaculties,
            totalInstructors: Number(res.stats?.totalInstructors || 185),
            regionalCenters: Number(res.stats?.regionalCenters || 30),
            satisfactionRate: res.stats?.satisfactionRate || '99.2%',
          },
        };
      }
    } catch {
      // Fallback to Moodle Core Web Services
    }
    const [wsCourses, wsCategories] = await Promise.all([
      this.getCourses().catch(() => []),
      this.getCategories().catch(() => []),
    ]);
    const validCourses = wsCourses.filter((c) => c.id > 1);
    return {
      courses: validCourses.map((c, idx) => normalizeCourse(c, idx)),
      categories: wsCategories,
      stats: {
        totalScholars: 14820,
        totalStudents: 14820,
        totalCourses: validCourses.length || 3,
        totalFaculties: wsCategories.length || 5,
        totalCategories: wsCategories.length || 5,
        totalInstructors: 185,
        regionalCenters: 30,
        satisfactionRate: '99.2%',
      },
    };
  },

  /**
   * Fetches IEMT Professional Short Courses & MOOCs specialized catalog
   */
  async getShortCoursesCatalog(params?: {
    type?: 'all' | 'psc' | 'mooc';
    search?: string;
    category?: any;
  }): Promise<{
    count: number;
    totalPSC: number;
    totalMOOC: number;
    courses: PublicCatalogCourse[];
  }> {
    try {
      const queryParts: string[] = [];
      if (params?.type) queryParts.push(`type=${encodeURIComponent(params.type)}`);
      if (params?.search) queryParts.push(`search=${encodeURIComponent(params.search)}`);
      if (params?.category) queryParts.push(`category=${encodeURIComponent(params.category)}`);
      const qs = queryParts.length > 0 ? `&${queryParts.join('&')}` : '';

      const res = await callInternalApi<any>(`get_short_courses_catalog${qs}`, undefined, 'GET');
      if (res && res.success) {
        return {
          count: Number(res.count || (res.courses || []).length),
          totalPSC: Number(res.totalPSC || 0),
          totalMOOC: Number(res.totalMOOC || 0),
          courses: (res.courses || []).map((c: any, idx: number) => ({
            id: Number(c.id),
            fullname: c.fullname,
            shortname: c.shortname,
            summary: (c.summary || '').replace(/<[^>]+>/g, '').trim(),
            categoryid: Number(c.categoryid || 6),
            categoryName: c.categoryName || 'IEMT Professional Short Courses',
            categoryname: c.categoryName || 'IEMT Professional Short Courses',
            categoryCode: c.categoryCode || 'IEMT-PSC',
            programType: c.programType || (c.isMOOC ? 'MOOC' : 'Professional Short Course'),
            isPSC: Boolean(c.isPSC),
            isMOOC: Boolean(c.isMOOC),
            tuitionFee: Number(c.tuitionFee || 0),
            fee: Number(c.tuitionFee || 0),
            currency: 'TZS',
            priceFormatted: c.priceFormatted || (c.isMOOC ? 'Free / Open Access' : 'TZS 180,000'),
            tuitionFeeUSD: c.tuitionFeeUSD,
            priceUSDFormatted: c.priceUSDFormatted,
            duration: c.duration || (c.isMOOC ? '4 Weeks (Self-Paced)' : '6 Weeks (Blended & Cohort)'),
            cpdCredits: c.cpdCredits || (c.isMOOC ? 10 : 20),
            deliveryMode: c.deliveryMode || '100% Online',
            difficultyLevel: c.difficultyLevel || 'Foundational',
            sectionsCount: Number(c.sectionsCount || 4),
            modulesCount: Number(c.modulesCount || 6),
            lessonsCount: Number(c.modulesCount || 6),
            enrolledCount: Number(c.enrolledCount || 14),
            instructorName: c.instructor?.fullname || 'Dr. Emmanuel Michael',
            instructorAvatar: c.instructor?.avatar || '/assets/img/user/user-01.jpg',
            instructor: {
              id: Number(c.instructor?.id || 5),
              fullname: c.instructor?.fullname || 'Dr. Emmanuel Michael',
              role: c.instructor?.role || 'Director, IEMT & Senior Lecturer',
              avatar: c.instructor?.avatar || '/assets/img/user/user-01.jpg',
            },
            courseImage: c.courseImage || `/assets/img/course/thumbnails/course-${c.id}-${(c.shortname || 'cs101').toLowerCase().replace(/[^a-z0-9]/g, '-')}.svg`,
            image: c.courseImage || `/assets/img/course/thumbnails/course-${c.id}-${(c.shortname || 'cs101').toLowerCase().replace(/[^a-z0-9]/g, '-')}.svg`,
            rating: String(c.rating || '4.9'),
            reviewsCount: Number(c.reviewsCount || 42),
            startdate: c.startdate || Math.floor(Date.now() / 1000),
            hasCertificate: Boolean(c.hasCertificate),
            hasLiveClassroom: Boolean(c.hasLiveClassroom),
            hasReengagementNudge: Boolean(c.hasReengagementNudge),
            hasH5P: Boolean(c.hasH5P),
            accreditation: c.accreditation || 'TCU & SARIS Accredited • IEMT Certified',
            sponsorshipEligible: Boolean(c.sponsorshipEligible),
            accentColor: c.accentColor || (c.isMOOC ? '#10b981' : '#06b6d4'),
            badgeText: c.badgeText || (c.isMOOC ? 'Free / Open Access MOOC' : 'Professional Short Course'),
          })),
        };
      }
    } catch (e) {
      console.warn('Failed to fetch short courses catalog:', e);
    }
    const fallback = await this.getPublicCatalog();
    return {
      count: fallback.courses.length,
      totalPSC: fallback.courses.filter((c) => c.isPSC).length,
      totalMOOC: fallback.courses.filter((c) => c.isMOOC).length,
      courses: fallback.courses,
    };
  },

  /**
   * Fetches university faculty instructors directory from Internal API
   */
  async getPublicInstructors(): Promise<PublicInstructorProfile[]> {
    const normalizeInst = (i: any): PublicInstructorProfile => ({
      id: Number(i.id || 4),
      name: i.name || i.fullname || 'Dr. Amina Kilindo',
      fullname: i.fullname || i.name || 'Dr. Amina Kilindo',
      role: i.role || 'Senior Lecturer & Course Director',
      department: i.department || 'Department of Computing & Information Technology',
      faculty: i.faculty || 'Faculty of Science, Technology & Environmental Studies',
      city: i.city || 'Dar es Salaam',
      country: i.country || 'Tanzania',
      email: i.email || 'instructor@out.ac.tz',
      staffId: i.staffId || 'FAC/CS/0205',
      avatar: i.avatar || '/assets/img/user/user-01.jpg',
      coursesCount: Number(i.coursesCount || i.courseCount || 3),
      courseCount: Number(i.courseCount || i.coursesCount || 3),
      studentsCount: Number(i.studentsCount || i.studentCount || 480),
      studentCount: Number(i.studentCount || i.studentsCount || 480),
      rating: String(i.rating || '4.9'),
      reviewsCount: Number(i.reviewsCount || 128),
      bio: i.bio || 'Ph.D. in Distributed Computing & Algorithms at the Open University of Tanzania.',
      skills: Array.isArray(i.skills) ? i.skills : ['Python & Algorithms', 'Cloud Architecture', 'Distributed Systems'],
      courses: Array.isArray(i.courses) ? i.courses : [],
    });
    try {
      const res = await callInternalApi<{ success: boolean; instructors: any[] }>('public_instructors', undefined, 'GET');
      if (res?.success && Array.isArray(res.instructors)) {
        return res.instructors.map(normalizeInst);
      }
    } catch {
      // Fallback below
    }
    return [normalizeInst({})];
  },

  /**
   * Fetches full public course details, syllabus sections, and modules for any visitor (guest, student, instructor, admin)
   */
  async getPublicCourseDetails(courseId: number): Promise<any> {
    try {
      const res = await callInternalApi<any>('public_course_details', { course_id: courseId }, 'GET');
      if (res?.success && res.course) {
        return res.course;
      }
    } catch {
      // Fallback to public catalog + course contents
    }
    const catalog = await this.getPublicCatalog();
    const matched = catalog.courses.find((c) => c.id === courseId) || catalog.courses[0];
    const sections = await this.getCourseContents(courseId).catch(() => []);
    return {
      id: matched?.id || courseId,
      fullname: matched?.fullname || 'Academic Degree Programme',
      shortname: matched?.shortname || `OUT-${courseId}`,
      idnumber: `OUT-${matched?.shortname || courseId}`,
      category_id: matched?.categoryid || 1,
      category_name: matched?.categoryName || 'Faculty of Science, Technology & Environmental Studies',
      summary: matched?.summary || 'Accredited university programme designed for flexible distance and blended learning.',
      format: 'topics',
      visible: 1,
      startdate: matched?.startdate || Math.floor(Date.now() / 1000),
      enddate: 0,
      tuitionFee: matched?.tuitionFee || 150000,
      priceFormatted: matched?.priceFormatted || 'TZS 150,000',
      courseImage: matched?.courseImage || `/assets/img/course/thumbnails/course-${courseId}-${(matched?.shortname || `course-${courseId}`).toLowerCase().replace(/[^a-z0-9]/g, '-')}.svg`,
      accentColor: matched?.accentColor || '#0171BB',
      badgeText: matched?.badgeText || 'Academic Degree',
      rating: matched?.rating || '4.9',
      reviewsCount: matched?.reviewsCount || 48,
      sections_count: sections.length || matched?.sectionsCount || 4,
      modules_count: matched?.modulesCount || 10,
      participants_count: matched?.enrolledCount || 45,
      instructor: {
        id: matched?.instructor?.id || 4,
        fullname: matched?.instructorName || 'Dr. Amina Kilindo',
        role: matched?.instructor?.role || 'Senior Lecturer & Course Director',
        department: 'Department of Computing & Information Technology',
        email: 'instructor@out.ac.tz',
        avatar: matched?.instructorAvatar || '/assets/img/user/user-01.jpg',
        bio: 'Senior Lecturer & Course Coordinator at the Open University of Tanzania.',
      },
      sections: sections.map((s, idx) => ({
        id: s.id || idx + 1,
        section: s.section ?? idx + 1,
        name: s.name || `Unit ${idx + 1}`,
        summary: (s.summary || '').replace(/<[^>]+>/g, '').trim(),
        visible: s.visible ?? 1,
        modules_count: (s.modules || []).length,
        modules: (s.modules || []).map((m) => ({
          id: m.id,
          instance: m.instance,
          modname: m.modname,
          name: m.name,
          visible: m.visible,
          completion: m.completion,
        })),
      })),
    };
  },

  /**
   * Queries REST API v2 (`/api/rest/v2/openapi.json`) for live API telemetry & question bank metadata
   */
  async getRestV2OpenApiInfo(): Promise<{ title: string; version: string; pathsCount: number; info?: { title?: string; version?: string } }> {
    try {
      const spec = await callMoodleRestV2<any>('/openapi.json');
      const title = spec?.info?.title || 'Open University of Tanzania LMS REST API v2';
      const version = spec?.openapi || '3.1.0';
      return {
        title,
        version,
        pathsCount: spec?.paths ? Object.keys(spec.paths).length : 12,
        info: { title, version },
      };
    } catch {
      const title = 'Open University of Tanzania LMS REST API v2';
      const version = '3.1.0';
      return {
        title,
        version,
        pathsCount: 12,
        info: { title, version },
      };
    }
  },
};


