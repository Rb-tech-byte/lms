/**
 * Quiz and Knowledge Check Service for OUT LMS
 * Interfaces with Moodle 5.x mod_quiz_* external functions.
 */

import { callMoodleWs, isMockMode } from './apiClient';
import { MOODLE_ENDPOINTS } from './moodleEndpoints';

export interface MoodleQuiz {
  id: number;
  course: number;
  coursemodule: number;
  name: string;
  intro: string;
  timeopen?: number;
  timeclose?: number;
  timelimit: number; // in seconds
  attempts: number;
  grademethod?: number;
  grade: number;
  sumgrades?: number;
  questionsCount?: number;
}

export interface QuizAttempt {
  id: number;
  quiz: number;
  userid: number;
  attempt: number;
  sumgrades?: number;
  state: 'inprogress' | 'finished' | 'abandoned';
  timestart: number;
  timefinish?: number;
  timemodified: number;
}

export interface QuizQuestionOption {
  id: number;
  text: string;
  isCorrect?: boolean;
}

export interface QuizQuestion {
  id: number;
  slot: number;
  question: string;
  questionText?: string;
  type: 'multichoice' | 'truefalse';
  options: QuizQuestionOption[];
  correctOptionId: number;
  explanation: string;
}

export interface QuizAttemptSession {
  attemptId: number;
  quizId: number;
  userId: number;
  quizName: string;
  courseName: string;
  questions: Array<QuizQuestion & { questionText: string }>;
}

export interface QuizResult {
  quizId: number;
  quizName: string;
  totalQuestions: number;
  answeredCount: number;
  correctCount: number;
  correctAnswers: number;
  wrongCount: number;
  scorePercentage: number;
  percentage: number;
  letterGrade: string;
  passed: boolean;
  timeSpentSeconds: number;
}

export type QuizResultSummary = QuizResult;

// Academic Question Banks for OUT Curriculum
const OUT_QUESTION_BANKS: Record<number, QuizQuestion[]> = {
  1: [
    {
      id: 101,
      slot: 1,
      question: 'What is the worst-case time complexity of Binary Search on a sorted array of size N?',
      type: 'multichoice',
      options: [
        { id: 1, text: 'O(log N)', isCorrect: true },
        { id: 2, text: 'O(N)' },
        { id: 3, text: 'O(N log N)' },
        { id: 4, text: 'O(1)' },
      ],
      correctOptionId: 1,
      explanation: 'Binary Search halves the search space at every comparison, achieving logarithmic O(log N) worst-case time complexity.',
    },
    {
      id: 102,
      slot: 2,
      question: 'Which fundamental principle defines the operation of a Stack data structure?',
      type: 'multichoice',
      options: [
        { id: 1, text: 'LIFO (Last In, First Out)', isCorrect: true },
        { id: 2, text: 'FIFO (First In, First Out)' },
        { id: 3, text: 'Random Access Memory' },
        { id: 4, text: 'Shortest Job First' },
      ],
      correctOptionId: 1,
      explanation: 'A Stack follows the Last In, First Out (LIFO) order where the most recently pushed element is the first popped.',
    },
    {
      id: 103,
      slot: 3,
      question: 'Which of the following sorting algorithms is inherently stable by default?',
      type: 'multichoice',
      options: [
        { id: 1, text: 'Merge Sort', isCorrect: true },
        { id: 2, text: 'Quick Sort' },
        { id: 3, text: 'Heap Sort' },
        { id: 4, text: 'Selection Sort' },
      ],
      correctOptionId: 1,
      explanation: 'Merge Sort maintains the relative order of duplicate elements because equal elements retain their original left-to-right order during merging.',
    },
    {
      id: 104,
      slot: 4,
      question: 'In a singly linked list, accessing an arbitrary element by index takes O(1) constant time.',
      type: 'truefalse',
      options: [
        { id: 1, text: 'True' },
        { id: 2, text: 'False', isCorrect: true },
      ],
      correctOptionId: 2,
      explanation: 'False. A singly linked list does not support direct indexing; traversing to the k-th node requires sequential pointer chasing taking O(N) linear time.',
    },
    {
      id: 105,
      slot: 5,
      question: 'Which graph traversal algorithm can detect cycles in a directed graph using recursion stacks?',
      type: 'multichoice',
      options: [
        { id: 1, text: 'Depth-First Search (DFS)', isCorrect: true },
        { id: 2, text: 'Breadth-First Search (BFS)' },
        { id: 3, text: 'Dijkstra Shortest Path' },
        { id: 4, text: 'Prim Minimum Spanning Tree' },
      ],
      correctOptionId: 1,
      explanation: 'DFS detects back-edges during traversal by maintaining an active call/recursion stack, indicating a directed cycle.',
    },
  ],
  2: [
    {
      id: 201,
      slot: 1,
      question: 'Which enterprise container orchestration platform was originally designed by Google engineers?',
      type: 'multichoice',
      options: [
        { id: 1, text: 'Kubernetes (K8s)', isCorrect: true },
        { id: 2, text: 'Docker Swarm' },
        { id: 3, text: 'Apache Mesos' },
        { id: 4, text: 'HashiCorp Nomad' },
      ],
      correctOptionId: 1,
      explanation: 'Kubernetes was initiated by Google based on its internal Borg cluster manager and donated to the CNCF.',
    },
    {
      id: 202,
      slot: 2,
      question: 'According to Eric Brewer’s CAP Theorem, which three properties cannot all be guaranteed simultaneously in a partitioned network?',
      type: 'multichoice',
      options: [
        { id: 1, text: 'Consistency, Availability, and Partition Tolerance', isCorrect: true },
        { id: 2, text: 'Concurrency, Atomicity, and Performance' },
        { id: 3, text: 'Caching, Authentication, and Privacy' },
        { id: 4, text: 'Capacity, Accessibility, and Persistence' },
      ],
      correctOptionId: 1,
      explanation: 'CAP states that in the presence of a network partition, a distributed system must choose between Consistency and Availability.',
    },
    {
      id: 203,
      slot: 3,
      question: 'Which high-performance RPC framework uses Protocol Buffers and HTTP/2 for microservice communication?',
      type: 'multichoice',
      options: [
        { id: 1, text: 'gRPC', isCorrect: true },
        { id: 2, text: 'SOAP XML' },
        { id: 3, text: 'Corba' },
        { id: 4, text: 'JSON-RPC 1.0' },
      ],
      correctOptionId: 1,
      explanation: 'gRPC uses binary Protocol Buffer serialization over multiplexed HTTP/2 streams for ultra-low latency microservice communications.',
    },
    {
      id: 204,
      slot: 4,
      question: 'Serverless compute architectures require developers to manually manage and patch virtual machine operating systems.',
      type: 'truefalse',
      options: [
        { id: 1, text: 'True' },
        { id: 2, text: 'False', isCorrect: true },
      ],
      correctOptionId: 2,
      explanation: 'False. Serverless abstracts away infrastructure provisioning, OS management, and scaling, charging solely for event compute execution.',
    },
    {
      id: 205,
      slot: 5,
      question: 'What is the primary cloud engineering mechanism for dynamically adapting cluster capacity to incoming traffic spikes?',
      type: 'multichoice',
      options: [
        { id: 1, text: 'Horizontal Pod / Virtual Machine Autoscaling', isCorrect: true },
        { id: 2, text: 'Manual server rebooting' },
        { id: 3, text: 'Static load balancing tables' },
        { id: 4, text: 'Periodic scheduled re-indexing' },
      ],
      correctOptionId: 1,
      explanation: 'Horizontal autoscaling continuously monitors telemetry (CPU, memory, request queue depth) and automatically scales replica counts.',
    },
  ],
  3: [
    {
      id: 301,
      slot: 1,
      question: 'What is the primary objective of corporate financial management according to modern corporate governance?',
      type: 'multichoice',
      options: [
        { id: 1, text: 'Maximizing long-term shareholder wealth and firm valuation', isCorrect: true },
        { id: 2, text: 'Maximizing short-term gross revenue' },
        { id: 3, text: 'Minimizing employee compensation' },
        { id: 4, text: 'Eliminating all corporate debt obligations' },
      ],
      correctOptionId: 1,
      explanation: 'Modern financial governance focuses on maximizing long-term shareholder value while maintaining ethical fiduciary duties.',
    },
    {
      id: 302,
      slot: 2,
      question: 'Which capital budgeting metric discounts expected future cash flows to determine if a project yields positive net economic value?',
      type: 'multichoice',
      options: [
        { id: 1, text: 'Net Present Value (NPV)', isCorrect: true },
        { id: 2, text: 'Payback Period' },
        { id: 3, text: 'Accounting Rate of Return (ARR)' },
        { id: 4, text: 'Gross Profit Margin' },
      ],
      correctOptionId: 1,
      explanation: 'NPV accounts for the time value of money by discounting future cash flows with the company’s cost of capital.',
    },
    {
      id: 303,
      slot: 3,
      question: 'What does WACC stand for in corporate capital structure planning?',
      type: 'multichoice',
      options: [
        { id: 1, text: 'Weighted Average Cost of Capital', isCorrect: true },
        { id: 2, text: 'Working Asset Credit Ceiling' },
        { id: 3, text: 'Worldwide Accounting & Compliance Code' },
        { id: 4, text: 'Weighted Asset Current Capital' },
      ],
      correctOptionId: 1,
      explanation: 'WACC is the average rate of return a company is expected to pay its security holders to finance its assets.',
    },
    {
      id: 304,
      slot: 4,
      question: 'Net Working Capital is defined as Current Assets minus Current Liabilities.',
      type: 'truefalse',
      options: [
        { id: 1, text: 'True', isCorrect: true },
        { id: 2, text: 'False' },
      ],
      correctOptionId: 1,
      explanation: 'True. Working Capital = Current Assets - Current Liabilities, representing short-term liquidity available for operations.',
    },
    {
      id: 305,
      slot: 5,
      question: 'What two fundamental legal and ethical duties do corporate board directors owe to the company and stakeholders?',
      type: 'multichoice',
      options: [
        { id: 1, text: 'Duty of Care and Duty of Loyalty', isCorrect: true },
        { id: 2, text: 'Duty of Profit and Duty of Secrecy' },
        { id: 3, text: 'Duty of Expansion and Duty of Dividend' },
        { id: 4, text: 'Duty of Marketing and Duty of Taxation' },
      ],
      correctOptionId: 1,
      explanation: 'Corporate directors owe the Duty of Care (informed, prudent business judgment) and the Duty of Loyalty (acting without conflicts of interest).',
    },
  ],
};

const STORAGE_ATTEMPTS_KEY = 'out_lms_quiz_attempts';

export const quizService = {
  /**
   * Fetches quizzes for the given course IDs from Moodle
   */
  async getQuizzesByCourses(courseIds: number[], _userId?: number): Promise<MoodleQuiz[]> {
    const defaultList: MoodleQuiz[] = [
      {
        id: 1,
        course: 2,
        coursemodule: 15,
        name: 'Knowledge Check Quiz: Module 3 Mastery Assessment',
        intro: 'Test your understanding of Asymptotic Complexity, Big-O, and Sorting Algorithms.',
        timelimit: 300,
        attempts: 3,
        grade: 100,
        questionsCount: 5,
      },
      {
        id: 2,
        course: 3,
        coursemodule: 18,
        name: 'CS202 Cloud Architecture & Microservices Assessment',
        intro: 'Assess knowledge on containerization, Kubernetes, distributed consensus, and serverless architectures.',
        timelimit: 600,
        attempts: 2,
        grade: 100,
        questionsCount: 5,
      },
      {
        id: 3,
        course: 4,
        coursemodule: 19,
        name: 'BBA301 Corporate Financial Governance & Policy Quiz',
        intro: 'Evaluate mastery of capital budgeting, cost of capital, and corporate valuation.',
        timelimit: 450,
        attempts: 1,
        grade: 100,
        questionsCount: 5,
      },
    ];

    if (isMockMode()) {
      return defaultList;
    }

    try {
      const res = await callMoodleWs<{ quizzes: MoodleQuiz[] }>(MOODLE_ENDPOINTS.GET_QUIZZES, {
        courseids: courseIds,
      });
      if (res?.quizzes && res.quizzes.length > 0) {
        return res.quizzes.map((q) => ({ ...q, questionsCount: q.questionsCount || 5 }));
      }
      return defaultList;
    } catch (err) {
      console.warn('Failed to fetch quizzes from Moodle, using fallback:', err);
      return defaultList;
    }
  },

  /**
   * Starts a quiz attempt session and returns its questions
   */
  async startQuizAttempt(quizId: number, userId: number = 3): Promise<QuizAttemptSession> {
    const questions = this.getQuestionsForQuiz(quizId).map((q) => ({
      ...q,
      questionText: q.question,
    }));
    return {
      attemptId: Date.now(),
      quizId,
      userId,
      quizName:
        quizId === 2
          ? 'CS202 Cloud Architecture & Microservices Assessment'
          : quizId === 3
          ? 'BBA301 Corporate Financial Governance & Policy Quiz'
          : 'Knowledge Check Quiz: Module 3 Mastery Assessment',
      courseName:
        quizId === 2
          ? 'CS202: Cloud Computing & Distributed Systems'
          : quizId === 3
          ? 'BBA301: Financial Management & Strategic Planning'
          : 'CS101: Data Structures & Algorithms in Python',
      questions,
    };
  },

  /**
   * Fetches user's previous attempts for a quiz
   */
  async getUserAttempts(quizId: number, userId: number = 2): Promise<QuizAttempt[]> {
    if (isMockMode()) {
      const saved = localStorage.getItem(STORAGE_ATTEMPTS_KEY);
      if (saved) {
        try {
          const all = JSON.parse(saved);
          return all.filter((a: any) => a.quiz === quizId);
        } catch {
          return [];
        }
      }
      return [];
    }

    try {
      const saved = localStorage.getItem(STORAGE_ATTEMPTS_KEY);
      let localAttempts: QuizAttempt[] = [];
      if (saved) {
        try {
          localAttempts = JSON.parse(saved).filter((a: any) => a.quiz === quizId);
        } catch {
          localAttempts = [];
        }
      }

      const res = await callMoodleWs<{ attempts: QuizAttempt[] }>(MOODLE_ENDPOINTS.GET_USER_ATTEMPTS, {
        quizid: quizId,
        userid: userId,
      });

      const serverAttempts = res?.attempts || [];
      const combined = [...serverAttempts];
      for (const la of localAttempts) {
        if (!combined.some((ca) => ca.id === la.id)) {
          combined.push(la);
        }
      }
      return combined;
    } catch {
      const saved = localStorage.getItem(STORAGE_ATTEMPTS_KEY);
      if (saved) {
        try {
          return JSON.parse(saved).filter((a: any) => a.quiz === quizId);
        } catch {
          return [];
        }
      }
      return [];
    }
  },

  /**
   * Returns question items for a quiz
   */
  getQuestionsForQuiz(quizId: number): QuizQuestion[] {
    return OUT_QUESTION_BANKS[quizId] || OUT_QUESTION_BANKS[1];
  },

  /**
   * Evaluates and records a student quiz attempt (supports both 3-arg session call and 4-arg ID call)
   */
  async submitQuizAttempt(
    quizIdOrSession: number | QuizAttemptSession,
    userIdOrAnswers: number | Record<number, number>,
    answersOrTime: Record<number, number> | number,
    maybeTimeSpentSeconds?: number
  ): Promise<QuizResult> {
    let quizId = 1;
    let userId = 3;
    let quizName = 'Knowledge Check Quiz: Module 3 Mastery Assessment';
    let answers: Record<number, number> = {};
    let timeSpentSeconds = 300;

    if (typeof quizIdOrSession === 'object' && quizIdOrSession !== null) {
      quizId = quizIdOrSession.quizId;
      userId = quizIdOrSession.userId;
      quizName = quizIdOrSession.quizName;
      answers = (userIdOrAnswers as Record<number, number>) || {};
      timeSpentSeconds = typeof answersOrTime === 'number' ? answersOrTime : 300;
    } else {
      quizId = quizIdOrSession;
      userId = typeof userIdOrAnswers === 'number' ? userIdOrAnswers : 3;
      answers = (answersOrTime as Record<number, number>) || {};
      timeSpentSeconds = maybeTimeSpentSeconds ?? 300;
    }

    const questions = this.getQuestionsForQuiz(quizId);
    let correctCount = 0;

    questions.forEach((q) => {
      const selectedOptionId = answers[q.id];
      if (selectedOptionId === q.correctOptionId) {
        correctCount++;
      }
    });

    const totalQuestions = questions.length;
    const answeredCount = Object.keys(answers).length;
    const wrongCount = totalQuestions - correctCount;
    const scorePercentage = Math.round((correctCount / totalQuestions) * 100);
    const passed = scorePercentage >= 70;
    const letterGrade =
      scorePercentage >= 80
        ? 'Grade A'
        : scorePercentage >= 70
        ? 'Grade B+'
        : scorePercentage >= 60
        ? 'Grade B'
        : scorePercentage >= 50
        ? 'Grade C'
        : 'Grade F';

    const attemptRecord: QuizAttempt = {
      id: Date.now(),
      quiz: quizId,
      userid: userId,
      attempt: 1,
      sumgrades: scorePercentage,
      state: 'finished',
      timestart: Math.floor(Date.now() / 1000) - timeSpentSeconds,
      timefinish: Math.floor(Date.now() / 1000),
      timemodified: Math.floor(Date.now() / 1000),
    };

    try {
      const saved = localStorage.getItem(STORAGE_ATTEMPTS_KEY);
      const existing = saved ? JSON.parse(saved) : [];
      existing.push(attemptRecord);
      localStorage.setItem(STORAGE_ATTEMPTS_KEY, JSON.stringify(existing));
    } catch (e) {
      console.warn('Failed to persist attempt to local storage:', e);
    }

    try {
      const token = localStorage.getItem('out_lms_ws_token') || '';
      const courseId = quizId === 1 ? 2 : quizId === 2 ? 3 : 4;
      const apiBase =
        typeof window !== 'undefined'
          ? `${window.location.origin}/admin_api.php`
          : '/admin_api.php';
      await fetch(`${apiBase}?action=submit_quiz_grade`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          token,
          quiz_id: quizId,
          course_id: courseId,
          user_id: userId,
          score_percentage: scorePercentage,
        }),
      });
    } catch {
      // Non-blocking fallback
    }

    return {
      quizId,
      quizName,
      totalQuestions,
      answeredCount,
      correctCount,
      correctAnswers: correctCount,
      wrongCount,
      scorePercentage,
      percentage: scorePercentage,
      letterGrade,
      passed,
      timeSpentSeconds,
    };
  },
};
