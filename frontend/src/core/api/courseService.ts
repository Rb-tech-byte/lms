/**
 * Course and Category Service for OUT LMS
 * Interfaces with Moodle 5.x core_course_* external functions with fallback to mock data.
 */

import { callMoodleWs, isMockMode } from './apiClient';
import { MOODLE_ENDPOINTS } from './moodleEndpoints';

export interface CourseCategory {
  id: number;
  name: string;
  idnumber?: string;
  description?: string;
  parent?: number;
  coursecount: number;
}

export interface MoodleCourse {
  id: number;
  shortname: string;
  fullname: string;
  displayname?: string;
  categoryid: number;
  summary: string;
  summaryformat?: number;
  overviewfiles?: Array<{ fileurl: string; filename: string }>;
  enrolledusercount?: number;
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
          name: 'Module 1: Introduction to Headless Architecture',
          visible: 1,
          summary: 'Overview of modern decoupled learning systems and API standards.',
          summaryformat: 1,
          section: 0,
          uservisible: true,
          modules: [
            { id: 11, name: 'Lecture 1.1: Why Decouple the LMS?', instance: 1, visible: 1, completion: 1, modname: 'page' },
            { id: 12, name: 'Reading: Moodle 5.3 Web Services Guide', instance: 2, visible: 1, completion: 1, modname: 'resource' },
            { id: 13, name: 'Quiz 1: Architecture Checkpoint', instance: 3, visible: 1, completion: 1, modname: 'quiz' },
          ],
        },
        {
          id: 2,
          name: 'Module 2: API Gateway and Tanzanian Payment Systems',
          visible: 1,
          summary: 'Integrating Pesapal & Selcom with automated student enrollment.',
          summaryformat: 1,
          section: 1,
          uservisible: true,
          modules: [
            { id: 21, name: 'Lecture 2.1: Payment Webhook Architecture', instance: 4, visible: 1, completion: 1, modname: 'page' },
            { id: 22, name: 'Assignment 1: Payment Flow Diagram', instance: 5, visible: 1, completion: 1, modname: 'assign' },
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
};


