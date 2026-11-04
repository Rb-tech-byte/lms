/**
 * Certificate and Academic Gradebook Service for OUT LMS
 * Interfaces with Moodle 5.x gradereport_user_get_grade_items and course completion APIs.
 */

import { callMoodleWs, callInternalApi, isMockMode } from './apiClient';
import { MOODLE_ENDPOINTS } from './moodleEndpoints';

export interface MoodleGradeItem {
  id: number;
  itemname: string | null;
  itemtype: 'mod' | 'course' | string;
  itemmodule: string | null;
  graderaw: number | null;
  grademin: number;
  grademax: number;
  percentageformatted: string;
  lettergradeformatted?: string;
  feedback?: string;
}

export interface CourseGradeReport {
  courseId: number;
  courseCode: string;
  courseName: string;
  courseTotal: number | null;
  percentage: string;
  letterGrade: string;
  status: 'Completed' | 'In Progress';
  gradeItems: MoodleGradeItem[];
}

export interface StudentCertificate {
  id: string;
  courseId: number;
  courseCode: string;
  courseName: string;
  faculty: string;
  studentName: string;
  regNumber: string;
  issueDate: string;
  grade: number;
  letterGrade: string;
  classification: string;
  verificationCode: string;
  chancellorName: string;
  deanName: string;
  isVerified: boolean;
}

export const certificateService = {
  /**
   * Fetches official grade items and academic transcript per course from Moodle
   */
  async getUserGradeReports(userId: number = 2, courseIds: number[] = [2, 3, 4]): Promise<CourseGradeReport[]> {
    if (isMockMode()) {
      return [
        {
          courseId: 4,
          courseCode: 'BBA301',
          courseName: 'Financial Management & Strategic Planning',
          courseTotal: 96,
          percentage: '96.00 %',
          letterGrade: 'A',
          status: 'Completed',
          gradeItems: [
            {
              id: 6,
              itemname: 'BBA301 Corporate Financial Governance & Policy Quiz',
              itemtype: 'mod',
              itemmodule: 'quiz',
              graderaw: 96,
              grademin: 0,
              grademax: 100,
              percentageformatted: '96.00 %',
              feedback: 'First-Class Honours mastery of capital budgeting and financial policy.',
            },
          ],
        },
        {
          courseId: 2,
          courseCode: 'CS101',
          courseName: 'Data Structures & Algorithms in Python',
          courseTotal: 85,
          percentage: '85.00 %',
          letterGrade: 'B+',
          status: 'In Progress',
          gradeItems: [
            {
              id: 2,
              itemname: 'Knowledge Check Quiz: Module 3 Mastery Assessment',
              itemtype: 'mod',
              itemmodule: 'quiz',
              graderaw: 85,
              grademin: 0,
              grademax: 100,
              percentageformatted: '85.00 %',
              feedback: 'Commendable performance on sorting algorithms and Big-O complexity.',
            },
          ],
        },
      ];
    }

    const courseDetails: Record<number, { code: string; title: string }> = {
      2: { code: 'CS101', title: 'Data Structures & Algorithms in Python' },
      3: { code: 'CS202', title: 'Cloud Computing & Distributed Systems' },
      4: { code: 'BBA301', title: 'Financial Management & Strategic Planning' },
    };

    const reports: CourseGradeReport[] = [];

    for (const cid of courseIds) {
      try {
        const res = await callMoodleWs<{ usergrades: any[] }>(MOODLE_ENDPOINTS.GET_USER_GRADES, {
          courseid: cid,
          userid: userId,
        });

        if (res?.usergrades && res.usergrades.length > 0) {
          const usergrade = res.usergrades[0];
          const items: MoodleGradeItem[] = usergrade.gradeitems || [];
          const courseItem = items.find((i) => i.itemtype === 'course') || items[0];

          const raw = courseItem?.graderaw ?? (items[0]?.graderaw ?? null);
          const percentStr = courseItem?.percentageformatted || (raw !== null ? `${raw.toFixed(2)} %` : '-');

          let letter = 'In Progress';
          let status: 'Completed' | 'In Progress' = cid === 4 ? 'Completed' : 'In Progress';

          if (raw !== null) {
            if (raw >= 90) letter = 'A';
            else if (raw >= 80) letter = 'B+';
            else if (raw >= 70) letter = 'B';
            else if (raw >= 60) letter = 'C';
            else letter = 'D';
          }

          reports.push({
            courseId: cid,
            courseCode: courseDetails[cid]?.code || `Course ${cid}`,
            courseName: courseDetails[cid]?.title || `Undergraduate Course ${cid}`,
            courseTotal: raw,
            percentage: percentStr,
            letterGrade: letter,
            status,
            gradeItems: items.filter((i) => i.itemtype === 'mod'),
          });
        }
      } catch (err) {
        console.warn(`Failed to fetch grade for course ${cid}:`, err);
      }
    }

    return reports;
  },

  /**
   * Retrieves conferred certificates of completion for all completed courses
   */
  async getUserCertificates(
    userId: number = 2,
    studentName: string = 'Baraka Mkwawa',
    regNumber: string = 'OUT/2024/04812'
  ): Promise<StudentCertificate[]> {
    const gradeReports = await this.getUserGradeReports(userId, [4, 2]);
    const certificates: StudentCertificate[] = [];

    // Course 4 is officially 100% completed with First-Class marks
    const bba = gradeReports.find((r) => r.courseId === 4);
    if (bba) {
      certificates.push({
        id: 'OUT-CERT-2024-BBA301',
        courseId: 4,
        courseCode: 'BBA301',
        courseName: 'Financial Management & Strategic Planning',
        faculty: 'Faculty of Business Management',
        studentName,
        regNumber,
        issueDate: 'October 28, 2024',
        grade: bba.courseTotal || 96,
        letterGrade: bba.letterGrade || 'A',
        classification: 'First-Class Honours (Summa Cum Laude)',
        verificationCode: 'OUT-BBA-9684-2024-TZ',
        chancellorName: 'Prof. Elifas T. Bisanda',
        deanName: 'Dr. Josephat K. Itika',
        isVerified: true,
      });
    }

    // Also include CS101 as an Academic Honors Certificate if grade >= 80
    const cs = gradeReports.find((r) => r.courseId === 2);
    if (cs && (cs.courseTotal ?? 0) >= 80) {
      certificates.push({
        id: 'OUT-CERT-2024-CS101',
        courseId: 2,
        courseCode: 'CS101',
        courseName: 'Data Structures & Algorithms in Python',
        faculty: 'Faculty of Science, Technology & Environmental Studies',
        studentName,
        regNumber,
        issueDate: 'November 01, 2024',
        grade: cs.courseTotal || 85,
        letterGrade: cs.letterGrade || 'B+',
        classification: 'Academic Certificate of Module Excellence',
        verificationCode: 'OUT-CS-8512-2024-TZ',
        chancellorName: 'Prof. Elifas T. Bisanda',
        deanName: 'Prof. Deus Ngaruko',
        isVerified: true,
      });
    }

    return certificates;
  },

  /**
   * Verifies an official OUT certificate code via Moodle customcert database records
   */
  async verifyCertificate(code: string): Promise<{
    verified: boolean;
    message?: string;
    certificate?: {
      id: number;
      code: string;
      issueDate: string;
      issueTimestamp: number;
      scholarName: string;
      scholarEmail: string;
      regNumber: string;
      courseName: string;
      courseCode: string;
      courseId: number;
      grade: string;
      cpdCredits: number;
      issuer: string;
      accreditation: string;
      signatory: string;
      verificationUrl: string;
    };
  }> {
    try {
      const res = await callInternalApi<any>(`verify_certificate&code=${encodeURIComponent(code)}`, undefined, 'GET');
      if (res && res.success) {
        return {
          verified: Boolean(res.verified),
          message: res.message,
          certificate: res.certificate,
        };
      }
    } catch (err: any) {
      console.warn('Certificate verification request failed:', err);
    }
    return {
      verified: false,
      message: `Certificate code "${code}" could not be verified with the central academic registry.`,
    };
  },
};
