/**
 * Student Service for OUT LMS
 * Handles enrolled courses, quizzes, assignments, direct messages, and grades from Moodle.
 */

import { callMoodleWs, callInternalApi, isMockMode } from './apiClient';
import { MOODLE_ENDPOINTS } from './moodleEndpoints';
import { EnrolledCourse, courseService } from './courseService';

export interface MoodleConversationMessage {
  id: number;
  useridfrom: number;
  text: string;
  timecreated: number;
}

export interface MoodleConversationMember {
  id: number;
  fullname: string;
  profileimageurl?: string;
}

export interface MoodleConversation {
  id: number;
  name?: string;
  members: MoodleConversationMember[];
  messages: MoodleConversationMessage[];
}

export interface LearnerXpData {
  userId: number;
  scholarName: string;
  totalXp: number;
  level: number;
  rank: number;
  levelTitle: string;
  currentLevelBase: number;
  nextLevelTarget: number;
  progressInLevel: number;
  percentage: number;
  badgesEarned: number;
  recentHistory: Array<{
    id: number;
    xp: number;
    event: string;
    courseCode: string;
    courseName: string;
    date: string;
  }>;
}

export interface LeaderboardEntry {
  rank: number;
  userId: number;
  name: string;
  email: string;
  department: string;
  regNumber: string;
  totalXp: number;
  level: number;
  title: string;
  avatar: string;
}

export interface LiveSession {
  id: number;
  courseId: number;
  courseName: string;
  courseCode: string;
  title: string;
  agenda: string;
  scheduledDate: string;
  scheduledTimeFormatted: string;
  scheduledTimestamp: number;
  durationMinutes: number;
  status: 'SCHEDULED' | 'LIVE_NOW' | 'RECORDED';
  facilitator: string;
  platform: string;
  meetingUrl: string;
  attendeesCount: number;
}

export interface CompletionTimelineCourse {
  courseId: number;
  courseName: string;
  courseCode: string;
  totalActivities: number;
  completedActivities: number;
  progressPercentage: number;
  activities: Array<{
    cmId: number;
    module: string;
    section: number;
    sectionName: string;
    completed: boolean;
    status: 'COMPLETED' | 'PENDING';
    color: string;
  }>;
}

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

  /**
   * Fetches Moodle direct conversations for the user
   */
  async getConversations(userId: number = 3): Promise<MoodleConversation[]> {
    try {
      const res = await callMoodleWs<{ conversations: MoodleConversation[] }>(
        'core_message_get_conversations',
        { userid: userId, limitnum: 10 }
      );
      if (res?.conversations && res.conversations.length > 0) {
        return res.conversations;
      }
    } catch {
      // Fallback below
    }
    return [
      {
        id: 1,
        name: 'Academic Supervision',
        members: [
          {
            id: 4,
            fullname: 'Dr. Amina Kilindo',
            profileimageurl: '/assets/img/user/user-01.jpg',
          },
        ],
        messages: [
          {
            id: 101,
            useridfrom: 4,
            text: '<p>Welcome to CS101 Data Structures &amp; Algorithms. Feel free to message me regarding your coursework or lab exercises.</p>',
            timecreated: Math.floor(Date.now() / 1000) - 3600,
          },
        ],
      },
    ];
  },

  /**
   * Sends a direct message via Moodle core_message_send_instant_messages
   */
  async sendInstantMessage(touserid: number, text: string): Promise<{ status: string }> {
    try {
      await callMoodleWs<any>('core_message_send_instant_messages', {
        messages: [{ touserid, text, textformat: 1 }],
      });
      return { status: 'sent' };
    } catch {
      return { status: 'queued' };
    }
  },

  /**
   * Fetches gamification Level Up! XP progression, rank, and recent logs
   */
  async getLearnerXp(userId: number = 3): Promise<LearnerXpData | null> {
    try {
      const res = await callInternalApi<any>(`get_learner_xp&user_id=${userId}`, undefined, 'GET');
      if (res && res.success) {
        return {
          userId: Number(res.userId || userId),
          scholarName: res.scholarName || 'Baraka Mkwawa',
          totalXp: Number(res.totalXp || 0),
          level: Number(res.level || 1),
          rank: Number(res.rank || 1),
          levelTitle: res.levelTitle || 'Proficient Scholar',
          currentLevelBase: Number(res.currentLevelBase || 0),
          nextLevelTarget: Number(res.nextLevelTarget || 2500),
          progressInLevel: Number(res.progressInLevel || 0),
          percentage: Number(res.percentage || 0),
          badgesEarned: Number(res.badgesEarned || 1),
          recentHistory: res.recentHistory || [],
        };
      }
    } catch (e) {
      console.warn('Failed to fetch learner XP:', e);
    }
    return null;
  },

  /**
   * Fetches cohort gamification leaderboard
   */
  async getLeaderboard(limit: number = 10): Promise<LeaderboardEntry[]> {
    try {
      const res = await callInternalApi<any>(`get_leaderboard&limit=${limit}`, undefined, 'GET');
      if (res && res.success && Array.isArray(res.leaderboard)) {
        return res.leaderboard;
      }
    } catch (e) {
      console.warn('Failed to fetch leaderboard:', e);
    }
    return [];
  },

  /**
   * Fetches scheduled and active BigBlueButton live webinars
   */
  async getLiveSessions(courseId?: number): Promise<LiveSession[]> {
    try {
      const query = courseId ? `&course_id=${courseId}` : '';
      const res = await callInternalApi<any>(`get_live_sessions${query}`, undefined, 'GET');
      if (res && res.success && Array.isArray(res.sessions)) {
        return res.sessions;
      }
    } catch (e) {
      console.warn('Failed to fetch live sessions:', e);
    }
    return [];
  },

  /**
   * Fetches visual completion progress bar and activity checklist per course
   */
  async getCompletionTimeline(userId: number = 3, courseId?: number): Promise<CompletionTimelineCourse[]> {
    try {
      const query = courseId ? `&user_id=${userId}&course_id=${courseId}` : `&user_id=${userId}`;
      const res = await callInternalApi<any>(`get_completion_timeline${query}`, undefined, 'GET');
      if (res && res.success && Array.isArray(res.timeline)) {
        return res.timeline;
      }
    } catch (e) {
      console.warn('Failed to fetch completion timeline:', e);
    }
    return [];
  },
};
