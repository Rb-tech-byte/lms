/**
 * Student Service for OUT LMS
 * Handles enrolled courses, quizzes, assignments, and grades from Moodle.
 */

import { callMoodleWs, isMockMode } from './apiClient';
import { MOODLE_ENDPOINTS } from './moodleEndpoints';

export interface EnrolledCourse {
  id: number;
  fullname: string;
  shortname: string;
  progress: number;
  completed: boolean;
  timeend?: number;
  thumbnail?: string;
}

export const studentService = {
  /**
   * Fetches active enrolled courses for the logged-in student
   */
  async getEnrolledCourses(): Promise<EnrolledCourse[]> {
    if (isMockMode()) {
      return [
        {
          id: 101,
          fullname: 'Advanced Web Applications & Distributed Systems',
          shortname: 'ICT301',
          progress: 68,
          completed: false,
          thumbnail: 'assets/img/course/course-01.jpg',
        },
        {
          id: 102,
          fullname: 'Strategic Financial Management in East Africa',
          shortname: 'BM402',
          progress: 45,
          completed: false,
          thumbnail: 'assets/img/course/course-02.jpg',
        },
        {
          id: 103,
          fullname: 'Commercial Law and Intellectual Property Rights',
          shortname: 'LAW205',
          progress: 92,
          completed: false,
          thumbnail: 'assets/img/course/course-03.jpg',
        },
      ];
    }

    return callMoodleWs<EnrolledCourse[]>(MOODLE_ENDPOINTS.GET_ENROLLED_COURSES_TIMELINE, {
      classification: 'inprogress',
    });
  },

  /**
   * Fetches student grade items and transcripts
   */
  async getGrades(courseId?: number): Promise<any[]> {
    if (isMockMode()) {
      return [
        { itemname: 'Mid-Semester Exam', grade: '82%', feedback: 'Excellent grasp of API concepts' },
        { itemname: 'Assignment 1 (Payment Architecture)', grade: '90%', feedback: 'Very detailed sequence diagrams' },
        { itemname: 'Final Project', grade: 'In Progress', feedback: 'Submitted, awaiting evaluation' },
      ];
    }

    return callMoodleWs<any[]>(MOODLE_ENDPOINTS.GET_USER_GRADES, {
      courseid: courseId,
    });
  },
};
