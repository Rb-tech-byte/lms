/**
 * Instructor Service for OUT LMS
 * Handles lecturer course rosters, assignment evaluation, and grading via Moodle.
 */

import { callMoodleWs, isMockMode } from './apiClient';
import { MOODLE_ENDPOINTS } from './moodleEndpoints';

export interface AssignmentSubmission {
  id: number;
  userid: number;
  studentName: string;
  assignmentName: string;
  status: 'submitted' | 'graded' | 'late';
  submittedAt: string;
  grade?: number;
}

export const instructorService = {
  /**
   * Fetches submissions waiting for grading
   */
  async getSubmissions(assignmentId?: number): Promise<AssignmentSubmission[]> {
    if (isMockMode()) {
      return [
        {
          id: 1,
          userid: 101,
          studentName: 'Baraka Mkwawa',
          assignmentName: 'Assignment 1: Distributed Architectures',
          status: 'submitted',
          submittedAt: 'Oct 30, 2026',
        },
        {
          id: 2,
          userid: 102,
          studentName: 'Neema Joseph',
          assignmentName: 'Assignment 1: Distributed Architectures',
          status: 'graded',
          submittedAt: 'Oct 28, 2026',
          grade: 88,
        },
        {
          id: 3,
          userid: 103,
          studentName: 'Emmanuel Mushi',
          assignmentName: 'Assignment 1: Distributed Architectures',
          status: 'submitted',
          submittedAt: 'Oct 31, 2026',
        },
      ];
    }

    return callMoodleWs<AssignmentSubmission[]>(MOODLE_ENDPOINTS.GET_SUBMISSIONS, {
      assignmentids: [assignmentId],
    });
  },

  /**
   * Saves a grade and remarks directly into Moodle's gradebook
   */
  async saveGrade(assignmentId: number, userId: number, grade: number, feedback = ''): Promise<boolean> {
    if (isMockMode()) {
      return true;
    }

    await callMoodleWs(MOODLE_ENDPOINTS.SAVE_GRADE, {
      assignmentid: assignmentId,
      userid: userId,
      grade: grade,
      feedback: feedback,
    });
    return true;
  },
};
