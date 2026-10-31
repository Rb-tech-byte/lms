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
  async getCourseContents(courseId: number): Promise<any[]> {
    if (isMockMode()) {
      return [
        {
          id: 1,
          name: 'Module 1: Introduction to Headless Architecture',
          summary: 'Overview of modern decoupled learning systems and API standards.',
          modules: [
            { id: 11, name: 'Lecture 1.1: Why Decouple the LMS?', modname: 'page' },
            { id: 12, name: 'Reading: Moodle 5.3 Web Services Guide', modname: 'resource' },
            { id: 13, name: 'Quiz 1: Architecture Checkpoint', modname: 'quiz' },
          ],
        },
        {
          id: 2,
          name: 'Module 2: API Gateway and Tanzanian Payment Systems',
          summary: 'Integrating Pesapal & Selcom with automated student enrollment.',
          modules: [
            { id: 21, name: 'Lecture 2.1: Payment Webhook Architecture', modname: 'page' },
            { id: 22, name: 'Assignment 1: Payment Flow Diagram', modname: 'assign' },
          ],
        },
      ];
    }

    return callMoodleWs<any[]>(MOODLE_ENDPOINTS.GET_COURSE_CONTENTS, { courseid: courseId });
  },
};
