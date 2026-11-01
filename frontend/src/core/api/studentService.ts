/**
 * Student Service for OUT LMS
 * Handles enrolled courses, quizzes, assignments, and grades from Moodle.
 */

import { callMoodleWs, isMockMode } from './apiClient';
import { MOODLE_ENDPOINTS } from './moodleEndpoints';
import { EnrolledCourse, courseService } from './courseService';

export const studentService = {
  /**
   * Fetches active enrolled courses for the logged-in student
   */
  async getEnrolledCourses(userId?: number): Promise<EnrolledCourse[]> {
    return courseService.getUserEnrolledCourses(userId);
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
