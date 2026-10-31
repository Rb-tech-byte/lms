/**
 * Super Administrator Service for OUT LMS
 * Handles user provisioning, role assignments, plugin statuses, and university metrics.
 */

import { callMoodleWs, isMockMode } from './apiClient';
import { MOODLE_ENDPOINTS } from './moodleEndpoints';

export interface MoodleUserRecord {
  id: number;
  username: string;
  fullname: string;
  email: string;
  department?: string;
  roles?: string[];
  suspended?: boolean;
}

export interface PluginStatusRecord {
  component: string;
  name: string;
  version: string;
  status: 'enabled' | 'disabled' | 'update_available';
}

export const adminService = {
  /**
   * Retrieves users list
   */
  async getUsers(): Promise<MoodleUserRecord[]> {
    if (isMockMode()) {
      return [
        { id: 1, username: 'student_baraka', fullname: 'Baraka Mkwawa', email: 'student@out.ac.tz', department: 'BSc. ICT', roles: ['student'] },
        { id: 2, username: 'dr_amina', fullname: 'Dr. Amina Kilindo', email: 'instructor@out.ac.tz', department: 'Faculty of Science', roles: ['editingteacher'] },
        { id: 3, username: 'admin_out', fullname: 'OUT LMS Administrator', email: 'admin@out.ac.tz', department: 'Directorate of ICT', roles: ['manager'] },
      ];
    }

    const response = await callMoodleWs<{ users: MoodleUserRecord[] }>(MOODLE_ENDPOINTS.GET_USERS, {
      criteria: [{ key: '', value: '' }],
    });
    return response.users || [];
  },

  /**
   * Creates a new user in Moodle
   */
  async createUser(user: { username: string; email: string; firstname: string; lastname: string; password?: string }): Promise<number> {
    if (isMockMode()) {
      return Date.now();
    }

    const response = await callMoodleWs<Array<{ id: number; username: string }>>(MOODLE_ENDPOINTS.CREATE_USERS, {
      users: [user],
    });
    return response[0]?.id;
  },

  /**
   * Fetches installed plugin health matrix from Moodle
   */
  async getPluginStatus(): Promise<PluginStatusRecord[]> {
    if (isMockMode()) {
      return [
        { component: 'mod_quiz', name: 'Quiz Assessment Engine', version: '2026103100', status: 'enabled' },
        { component: 'mod_assign', name: 'Assignment & Grading Engine', version: '2026103100', status: 'enabled' },
        { component: 'payment_pesapal', name: 'Pesapal East Africa Gateway', version: '2026110100', status: 'enabled' },
        { component: 'payment_selcom', name: 'Selcom Mobile Money Gateway', version: '2026110100', status: 'enabled' },
        { component: 'local_outlms_bridge', name: 'OUT LMS Headless Bridge', version: '2026110100', status: 'enabled' },
      ];
    }

    return callMoodleWs<PluginStatusRecord[]>(MOODLE_ENDPOINTS.GET_PLUGIN_STATUS);
  },
};
