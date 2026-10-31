/**
 * Centralized API Client for Moodle 5.x Web Services & OUT LMS Gateway Bridge
 */

import { MOODLE_ENDPOINTS } from './moodleEndpoints';

export interface MoodleResponse<T = any> {
  data: T;
  exception?: string;
  errorcode?: string;
  message?: string;
}

const MOODLE_BASE_URL = process.env.REACT_APP_MOODLE_URL || 'http://localhost:8080/moodle';
const MOODLE_TOKEN = process.env.REACT_APP_MOODLE_TOKEN || '';
const USE_MOCK = process.env.REACT_APP_USE_MOCK !== 'false';

/**
 * Encodes complex nested objects/arrays into Moodle's required query parameter format:
 * e.g. { criteria: [{ key: 'id', value: 1 }] } -> criteria[0][key]=id&criteria[0][value]=1
 */
function serializeMoodleParams(obj: Record<string, any>, prefix = ''): string[] {
  const parts: string[] = [];

  for (const key of Object.keys(obj)) {
    const value = obj[key];
    if (value === undefined || value === null) continue;

    const fullKey = prefix ? `${prefix}[${key}]` : key;

    if (typeof value === 'object' && !Array.isArray(value)) {
      parts.push(...serializeMoodleParams(value, fullKey));
    } else if (Array.isArray(value)) {
      value.forEach((item, index) => {
        if (typeof item === 'object') {
          parts.push(...serializeMoodleParams(item, `${fullKey}[${index}]`));
        } else {
          parts.push(`${encodeURIComponent(`${fullKey}[${index}]`)}=${encodeURIComponent(item)}`);
        }
      });
    } else {
      parts.push(`${encodeURIComponent(fullKey)}=${encodeURIComponent(value)}`);
    }
  }

  return parts;
}

/**
 * Calls a Moodle Web Service function via REST
 */
export async function callMoodleWs<T = any>(
  wsfunction: string,
  params: Record<string, any> = {},
  customToken?: string
): Promise<T> {
  const token = customToken || localStorage.getItem('out_lms_ws_token') || MOODLE_TOKEN;

  if (!token && !USE_MOCK) {
    throw new Error('No Moodle Web Service token found. Please sign in.');
  }

  const endpoint = `${MOODLE_BASE_URL}/webservice/rest/server.php`;
  const baseParams = [
    `wstoken=${encodeURIComponent(token)}`,
    `wsfunction=${encodeURIComponent(wsfunction)}`,
    'moodlewsrestformat=json',
  ];

  const serializedParams = serializeMoodleParams(params);
  const allParams = [...baseParams, ...serializedParams].join('&');

  try {
    const response = await fetch(`${endpoint}?${allParams}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.exception || data.errorcode) {
      console.error(`Moodle API Exception (${wsfunction}):`, data);
      throw new Error(data.message || data.errorcode || 'Moodle API Error');
    }

    return data as T;
  } catch (error) {
    console.warn(`Moodle WS call failed (${wsfunction}):`, error);
    throw error;
  }
}

/**
 * Authentication helper: exchanges user credentials for a Moodle Web Service token
 */
export async function fetchMoodleToken(username: string, password: string): Promise<string> {
  const tokenUrl = `${MOODLE_BASE_URL}${MOODLE_ENDPOINTS.TOKEN}?service=out_lms_service&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;

  const response = await fetch(tokenUrl);
  if (!response.ok) {
    throw new Error('Failed to reach Moodle token endpoint');
  }

  const data = await response.json();
  if (data.error) {
    throw new Error(data.error);
  }

  if (data.token) {
    localStorage.setItem('out_lms_ws_token', data.token);
    return data.token;
  }

  throw new Error('No token returned from Moodle');
}

export const isMockMode = (): boolean => USE_MOCK;
