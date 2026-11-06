/**
 * Headless Moodle CMS Service & Real-Time Hook for OUT LMS
 * Dynamically manages Header Navigation, Hero Banner, Body Sections, Cards, and Footer via Moodle DB (`local_outlms_cms`).
 */

import { useEffect, useState, useCallback } from 'react';
import { callInternalApi } from './apiClient';

export interface CmsNavItem {
  id: string;
  label: string;
  route: string;
  icon?: string;
  visible: boolean;
  roles?: string[];
}

export interface CmsHeaderConfig {
  brandTitle: string;
  brandShortname: string;
  brandTagline: string;
  logoUrl: string;
  showTopbar: boolean;
  topbarAddress: string;
  topbarPhone: string;
  topbarEmail: string;
  announcementBadge: string;
  ctaSignInText: string;
  ctaRegisterText: string;
  navItems: CmsNavItem[];
}

export interface CmsHeroConfig {
  visible: boolean;
  eyebrow: string;
  title: string;
  subtitle: string;
  searchPlaceholder: string;
  primaryCtaText: string;
  primaryCtaRoute: string;
  secondaryCtaText: string;
  secondaryCtaRoute: string;
  highlights: string[];
  bgImage?: string;
  spotlightCover?: string;
}

export interface CmsStatItem {
  id: string;
  label: string;
  value: string;
  badge: string;
  icon: string;
  accent: string;
}

export interface CmsCapabilityCard {
  id: string;
  title: string;
  description: string;
  badge: string;
  icon: string;
  route: string;
  accent: string;
  coverImage?: string;
}

export interface CmsPathwayStep {
  step: string;
  title: string;
  description: string;
  route: string;
  coverImage?: string;
}

export interface CmsReviewItem {
  id: string;
  name: string;
  role: string;
  course: string;
  rating: string;
  comment: string;
  avatar: string;
  coverImage?: string;
}

export interface CmsBulletinItem {
  id: string;
  category: string;
  date: string;
  title: string;
  summary: string;
  route: string;
  badgeColor: string;
  coverImage?: string;
}

export interface CmsFooterColumn {
  id: string;
  title: string;
  links: Array<{ label: string; route: string }>;
}

export interface CmsFooterConfig {
  orgName: string;
  description: string;
  accreditationBadge: string;
  address: string;
  phone: string;
  email: string;
  newsletterTitle: string;
  newsletterSubtitle: string;
  copyrightText: string;
  columns: CmsFooterColumn[];
  socialLinks: Array<{ platform: string; icon: string; url: string }>;
  bottomLinks: Array<{ label: string; route: string }>;
}

export interface CmsConfig {
  header: CmsHeaderConfig;
  hero: CmsHeroConfig;
  stats: {
    visible: boolean;
    items: CmsStatItem[];
  };
  sections: {
    faculties: {
      visible: boolean;
      eyebrow: string;
      title: string;
      subtitle: string;
      ctaText: string;
      ctaRoute: string;
    };
    courses: {
      visible: boolean;
      eyebrow: string;
      title: string;
      subtitle: string;
      ctaText: string;
      ctaRoute: string;
    };
    capabilities: {
      visible: boolean;
      eyebrow: string;
      title: string;
      subtitle: string;
      cards: CmsCapabilityCard[];
      bgImage?: string;
    };
    pathway: {
      visible: boolean;
      eyebrow: string;
      title: string;
      subtitle: string;
      steps: CmsPathwayStep[];
    };
    instructors: {
      visible: boolean;
      eyebrow: string;
      title: string;
      subtitle: string;
      ctaText: string;
      ctaRoute: string;
      covers?: string[];
    };
    reviews: {
      visible: boolean;
      eyebrow: string;
      title: string;
      subtitle: string;
      items: CmsReviewItem[];
    };
    bulletins: {
      visible: boolean;
      eyebrow: string;
      title: string;
      subtitle: string;
      ctaText: string;
      ctaRoute: string;
      items: CmsBulletinItem[];
    };
    ctaBanner: {
      visible: boolean;
      title: string;
      subtitle: string;
      primaryText: string;
      primaryRoute: string;
      secondaryText: string;
      secondaryRoute: string;
      bgImage?: string;
    };
  };
  footer: CmsFooterConfig;
}

const CMS_STORAGE_KEY = 'out_lms_cms_config_v4';
const CMS_EVENT_NAME = 'outlms:cms-updated';

export const DEFAULT_CMS_CONFIG: CmsConfig = {
  header: {
    brandTitle: 'THE OPEN UNIVERSITY OF TANZANIA',
    brandShortname: 'OUT LMS',
    brandTagline: 'Accredited Open & Distance Digital Learning Portal',
    logoUrl: '/assets/img/out-logo.png',
    showTopbar: true,
    topbarAddress: 'Kawawa Road, Kinondoni • P.O. Box 23409, Dar es Salaam',
    topbarPhone: '+255 22 266 8820',
    topbarEmail: 'helpdesk@out.ac.tz',
    announcementBadge: '2026/2027 Academic Intake Open',
    ctaSignInText: 'Sign In',
    ctaRegisterText: 'Apply / Register',
    navItems: [
      { id: 'nav-home', label: 'Home', route: '/index', icon: 'isax-home-2', visible: true, roles: ['guest', 'student', 'instructor', 'admin'] },
      { id: 'nav-courses', label: 'Programmes & Courses', route: '/course/course-grid', icon: 'isax-book-1', visible: true, roles: ['guest', 'student', 'instructor', 'admin'] },
      { id: 'nav-faculties', label: 'Faculties', route: '/course/course-category', icon: 'isax-category', visible: true, roles: ['guest', 'student', 'instructor', 'admin'] },
      { id: 'nav-instructors', label: 'Academic Staff', route: '/pages/instructor-grid', icon: 'isax-teacher', visible: true, roles: ['guest', 'student', 'instructor', 'admin'] },
      { id: 'nav-bulletins', label: 'Bulletins', route: '/blog/blog-grid', icon: 'isax-note-21', visible: true, roles: ['guest', 'student', 'instructor', 'admin'] },
      { id: 'nav-about', label: 'About OUT', route: '/pages/about-us', icon: 'isax-building-4', visible: true, roles: ['guest', 'student', 'instructor', 'admin'] },
      { id: 'nav-contact', label: 'Helpdesk', route: '/pages/contact-us', icon: 'isax-call-calling', visible: true, roles: ['guest', 'student', 'instructor', 'admin'] },
    ],
  },
  hero: {
    visible: true,
    eyebrow: 'TCU Chartered Public University • Moodle 5.3 Headless LMS',
    title: 'Flexible University Education Across East Africa',
    subtitle: 'Access accredited degree, postgraduate, and professional programmes through self-paced digital modules, proctored online assessments, and instant mobile tuition integration.',
    searchPlaceholder: 'Search by course code (CS101, BBA301), programme title, or faculty...',
    primaryCtaText: 'Browse All Programmes',
    primaryCtaRoute: '/course/course-grid',
    secondaryCtaText: 'Scholar Portal Login',
    secondaryCtaRoute: '/login',
    highlights: [
      'TCU & NACTE Accredited Degrees',
      'Self-Paced Digital Classroom',
      'M-Pesa / Tigo / Airtel / Card Tuition',
      '30+ Regional Study Centres',
    ],
    bgImage: '/assets/img/home/hero-academic-bg.svg',
    spotlightCover: '/assets/img/home/hero-spotlight-cover.svg',
  },
  stats: {
    visible: true,
    items: [
      { id: 'stat-scholars', label: 'Active Enrolled Scholars', value: '14,820', badge: 'Nationwide & EAC', icon: 'isax-profile-2user', accent: '#013BA6' },
      { id: 'stat-courses', label: 'Published Digital Modules', value: '4', badge: 'Moodle 5.3 Active', icon: 'isax-book-saved', accent: '#013BA6' },
      { id: 'stat-faculties', label: 'Academic Faculties & Institutes', value: '5', badge: 'Senate Approved', icon: 'isax-courthouse', accent: '#013BA6' },
      { id: 'stat-centers', label: 'Regional Exam & Study Centres', value: '30+', badge: 'All Regions', icon: 'isax-location', accent: '#D97706' },
    ],
  },
  sections: {
    faculties: {
      visible: true,
      eyebrow: 'ACADEMIC FACULTIES & DIRECTORATES',
      title: 'Explore Programmes by Faculty',
      subtitle: 'Each faculty curates accredited distance-learning curricula synchronized directly with Moodle course categories.',
      ctaText: 'View All Faculties',
      ctaRoute: '/course/course-category',
    },
    courses: {
      visible: true,
      eyebrow: 'ACCREDITED DIGITAL CURRICULUM',
      title: 'Featured University Courses & Modules',
      subtitle: 'Live courses published in Moodle with interactive study units, continuous quizzes, and verified completion certificates.',
      ctaText: 'Full Course Catalog',
      ctaRoute: '/course/course-grid',
    },
    capabilities: {
      visible: true,
      eyebrow: 'DIGITAL LEARNING INFRASTRUCTURE',
      title: 'Built for Modern Distance & Flexible Higher Education',
      subtitle: 'Every academic operation is unified across Moodle Core Web Services, REST API v2, and Tanzanian payment gateways.',
      bgImage: '/assets/img/home/section-why-study-bg.svg',
      cards: [
        {
          id: 'cap-1',
          title: 'Interactive Self-Paced Classroom',
          description: 'Read structured lecture pages, watch instructional media, and track real-time completion progress across devices.',
          badge: 'Moodle 5.3 Core',
          icon: 'isax-monitor-mobbile',
          route: '/course/course-grid',
          accent: '#013BA6',
          coverImage: '/assets/img/home/feature-self-paced.svg',
        },
        {
          id: 'cap-2',
          title: 'Instant Mobile Money & Card Tuition',
          description: 'Settle module fees via M-Pesa, Airtel Money, Tigo Pesa, or Visa/Mastercard with automated Moodle enrolment.',
          badge: 'Pesapal V3 & Selcom',
          icon: 'isax-wallet-check',
          route: '/pages/pricing-plan',
          accent: '#013BA6',
          coverImage: '/assets/img/home/feature-instant-payment.svg',
        },
        {
          id: 'cap-3',
          title: 'Continuous Quizzes & Gradebook Sync',
          description: 'Attempt timed online assessments with immediate grading and official transcript synchronization.',
          badge: 'OAS 3.1 Assessment',
          icon: 'isax-clipboard-tick',
          route: '/student/student-quiz',
          accent: '#013BA6',
          coverImage: '/assets/img/home/feature-online-quiz.svg',
        },
        {
          id: 'cap-4',
          title: 'QR-Verified Senate Certificates',
          description: 'Download tamper-proof digital academic transcripts and certificates upon module completion.',
          badge: 'Digital Verification',
          icon: 'isax-award',
          route: '/student/student-certificates',
          accent: '#D97706',
          coverImage: '/assets/img/home/feature-verified-cert.svg',
        },
      ],
    },
    pathway: {
      visible: true,
      eyebrow: 'SCHOLAR JOURNEY',
      title: 'How Open & Distance Learning Works at OUT',
      subtitle: 'From online admission to graduation in four streamlined digital steps.',
      steps: [
        { step: '01', title: 'Create Scholar Account', description: 'Register online with your email and select your academic faculty to receive your OUT registration number.', route: '/register', coverImage: '/assets/img/home/pathway-step-1-account.svg' },
        { step: '02', title: 'Enrol & Pay Tuition', description: 'Select your semester modules and complete tuition payment via Pesapal or Selcom mobile money.', route: '/course/course-grid', coverImage: '/assets/img/home/pathway-step-2-enrol.svg' },
        { step: '03', title: 'Study & Complete Assessments', description: 'Access lecture notes, discussion forums, assignments, and timed quizzes in the digital classroom.', route: '/student/student-dashboard', coverImage: '/assets/img/home/pathway-step-3-study.svg' },
        { step: '04', title: 'Earn Verified Credentials', description: 'Track your gradebook standing and download your official Senate-approved digital certificate.', route: '/student/student-certificates', coverImage: '/assets/img/home/pathway-step-4-graduate.svg' },
      ],
    },
    instructors: {
      visible: true,
      eyebrow: 'UNIVERSITY FACULTY & COORDINATORS',
      title: 'Guided by Senior Academic Lecturers',
      subtitle: 'Connect with course directors and subject-matter specialists across our academic departments.',
      ctaText: 'View Faculty Directory',
      ctaRoute: '/pages/instructor-grid',
      covers: [
        '/assets/img/home/dept-cover-computing.svg',
        '/assets/img/home/dept-cover-ai.svg',
        '/assets/img/home/dept-cover-cloud.svg',
        '/assets/img/home/dept-cover-finance.svg',
      ],
    },
    reviews: {
      visible: true,
      eyebrow: 'SCHOLAR VOICES',
      title: 'What Our Distance Learners Say',
      subtitle: 'Verified feedback from undergraduate and postgraduate scholars studying across Tanzania.',
      items: [
        {
          id: 'rev-1',
          name: 'Baraka Mkwawa',
          role: 'BSc. ICT Scholar • Dar es Salaam',
          course: 'CS101 — Data Structures & Algorithms',
          rating: '5.0',
          comment: 'The decoupled classroom player and instant quiz feedback allow me to balance full-time software work with my degree modules.',
          avatar: '/assets/img/user/user-02.jpg',
          coverImage: '/assets/img/home/scholar-story-ict.svg',
        },
        {
          id: 'rev-2',
          name: 'Zawadi Bakari',
          role: 'BBA Finance Scholar • Arusha Centre',
          course: 'BBA301 — Financial Management & Strategy',
          rating: '4.9',
          comment: 'Paying tuition via M-Pesa enrolled me into BBA301 within seconds, and I downloaded my verified certificate immediately after passing.',
          avatar: '/assets/img/user/user-04.jpg',
          coverImage: '/assets/img/home/scholar-story-cloud.svg',
        },
        {
          id: 'rev-3',
          name: 'Kelvin Mwita',
          role: 'Postgraduate Scholar • Mwanza Centre',
          course: 'CS202 — Cloud Computing & Distributed Systems',
          rating: '4.9',
          comment: 'Course materials are well organized into weekly modules with clear learning objectives and responsive faculty support.',
          avatar: '/assets/img/user/user-05.jpg',
          coverImage: '/assets/img/home/scholar-story-finance.svg',
        },
      ],
    },
    bulletins: {
      visible: true,
      eyebrow: 'UNIVERSITY ANNOUNCEMENTS & BULLETINS',
      title: 'Latest Academic Notices & Schedules',
      subtitle: 'Official updates from the Office of the Deputy Vice-Chancellor (Academic) and Directorate of Examinations.',
      ctaText: 'All Academic Bulletins',
      ctaRoute: '/blog/blog-grid',
      items: [
        {
          id: 'bul-1',
          category: 'Admissions & Registration',
          date: 'Nov 2026',
          title: '2026/2027 Semester I Online Course Registration & Orientation Schedule',
          summary: 'All continuing and newly admitted scholars can now register for core and elective modules via the self-service portal.',
          route: '/blog/blog-details?id=2',
          badgeColor: '#013BA6',
          coverImage: '/assets/img/home/notice-admissions.svg',
        },
        {
          id: 'bul-2',
          category: 'Examinations & Assessment',
          date: 'Nov 2026',
          title: 'Continuous Assessment Timed Quizzes & Proctored Examination Guidelines',
          summary: 'Review the updated Senate guidelines for online continuous assessments (30%) and regional centre end-of-semester examinations (70%).',
          route: '/blog/blog-details?id=3',
          badgeColor: '#013BA6',
          coverImage: '/assets/img/home/notice-examinations.svg',
        },
        {
          id: 'bul-3',
          category: 'Digital Innovation',
          date: 'Nov 2026',
          title: 'Direct Integration of Pesapal V3 & Mobile Money for Instant Unlocking',
          summary: 'Instant automated Moodle enrolment is now live for all undergraduate and professional short course modules.',
          route: '/blog/blog-details?id=4',
          badgeColor: '#D97706',
          coverImage: '/assets/img/home/notice-portal-upgrade.svg',
        },
      ],
    },
    ctaBanner: {
      visible: true,
      title: 'Advance Your Career with an Accredited University Credential',
      subtitle: 'Applications are open for undergraduate, postgraduate, and professional certificate modules.',
      primaryText: 'Apply for Admission',
      primaryRoute: '/register',
      secondaryText: 'Download Prospectus',
      secondaryRoute: '/course/course-grid',
      bgImage: '/assets/img/home/cta-banner-bg.svg',
    },
  },
  footer: {
    orgName: 'The Open University of Tanzania (OUT)',
    description: 'A fully chartered public university established by Act of Parliament No. 17 of 1992, providing accessible higher education through open and distance e-learning.',
    accreditationBadge: 'TCU & NACTE Chartered Public University',
    address: 'Kawawa Road, Kinondoni, P.O. Box 23409, Dar es Salaam, Tanzania',
    phone: '+255 22 266 8992 / +255 22 266 8820',
    email: 'vc@out.ac.tz / helpdesk@out.ac.tz',
    newsletterTitle: 'Academic Bulletin Subscription',
    newsletterSubtitle: 'Receive official semester registration deadlines, examination timetables, and graduation notices.',
    copyrightText: `© ${new Date().getFullYear()} The Open University of Tanzania (OUT LMS). Powered by Moodle 5.3 Headless Architecture.`,
    columns: [
      {
        id: 'col-faculties',
        title: 'Academic Faculties',
        links: [
          { label: 'Science, Technology & Environment', route: '/course/course-category' },
          { label: 'Faculty of Business Management', route: '/course/course-category' },
          { label: 'Faculty of Law', route: '/course/course-category' },
          { label: 'Faculty of Education', route: '/course/course-category' },
          { label: 'Arts & Social Sciences', route: '/course/course-category' },
        ],
      },
      {
        id: 'col-portals',
        title: 'Digital Portals',
        links: [
          { label: 'Scholar Dashboard', route: '/student/student-dashboard' },
          { label: 'Lecturer Academic Console', route: '/instructor/instructor-dashboard' },
          { label: 'Senate & Admin Governance', route: '/admin/dashboard' },
          { label: 'Digital Certificates & Transcripts', route: '/student/student-certificates' },
          { label: 'Tuition Fee Structure', route: '/pages/pricing-plan' },
        ],
      },
      {
        id: 'col-support',
        title: 'Support & Governance',
        links: [
          { label: 'About The University', route: '/pages/about-us' },
          { label: 'Academic FAQ & Help', route: '/pages/faq' },
          { label: 'ICT Helpdesk & Contact', route: '/pages/contact-us' },
          { label: 'Become an Associate Lecturer', route: '/pages/become-an-instructor' },
          { label: 'System Status & Health', route: '/pages/coming-soon' },
        ],
      },
    ],
    socialLinks: [
      { platform: 'Facebook', icon: 'fa-brands fa-facebook-f', url: 'https://www.facebook.com/outtz' },
      { platform: 'X', icon: 'fa-brands fa-x-twitter', url: 'https://twitter.com/outtz' },
      { platform: 'YouTube', icon: 'fa-brands fa-youtube', url: 'https://www.youtube.com/@openuniversityoftanzania' },
      { platform: 'LinkedIn', icon: 'fa-brands fa-linkedin', url: 'https://www.linkedin.com/school/open-university-of-tanzania' },
    ],
    bottomLinks: [
      { label: 'Senate Academic Regulations', route: '/terms-conditions' },
      { label: 'Data Protection & Privacy Policy', route: '/pages/privacy-policy' },
      { label: 'ICT Helpdesk', route: '/pages/contact-us' },
    ],
  },
};

let memoryCmsCache: CmsConfig | null = null;
let pendingFetch: Promise<CmsConfig> | null = null;

function readCachedCms(): CmsConfig {
  if (memoryCmsCache) return memoryCmsCache;
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(CMS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.header && parsed.hero && parsed.sections && parsed.footer) {
          memoryCmsCache = parsed;
          return parsed;
        }
      }
    } catch {
      // Ignore storage errors
    }
  }
  return DEFAULT_CMS_CONFIG;
}

function writeCachedCms(cms: CmsConfig) {
  memoryCmsCache = cms;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(CMS_STORAGE_KEY, JSON.stringify(cms));
      window.dispatchEvent(new CustomEvent(CMS_EVENT_NAME, { detail: cms }));
    } catch {
      // Ignore storage quota errors
    }
  }
}

export const cmsService = {
  getCached(): CmsConfig {
    return readCachedCms();
  },

  async getCmsConfig(forceRefresh = false): Promise<CmsConfig> {
    if (!forceRefresh && memoryCmsCache) {
      return memoryCmsCache;
    }
    if (!forceRefresh && pendingFetch) {
      return pendingFetch;
    }

    pendingFetch = (async () => {
      try {
        const res = await callInternalApi<{ success: boolean; cms: CmsConfig }>('get_cms_config', undefined, 'GET');
        if (res?.success && res.cms) {
          const merged: CmsConfig = {
            ...DEFAULT_CMS_CONFIG,
            ...res.cms,
            header: { ...DEFAULT_CMS_CONFIG.header, ...(res.cms.header || {}) },
            hero: { ...DEFAULT_CMS_CONFIG.hero, ...(res.cms.hero || {}) },
            stats: { ...DEFAULT_CMS_CONFIG.stats, ...(res.cms.stats || {}) },
            sections: {
              ...DEFAULT_CMS_CONFIG.sections,
              ...(res.cms.sections || {}),
            },
            footer: { ...DEFAULT_CMS_CONFIG.footer, ...(res.cms.footer || {}) },
          };
          writeCachedCms(merged);
          return merged;
        }
      } catch {
        // Fallback to cached or default CMS config
      } finally {
        pendingFetch = null;
      }
      return readCachedCms();
    })();

    return pendingFetch;
  },

  async saveCmsConfig(cms: CmsConfig): Promise<{ success: boolean; cms: CmsConfig; message: string }> {
    writeCachedCms(cms);
    const res = await callInternalApi<{ success: boolean; cms: CmsConfig; message: string }>(
      'save_cms_config',
      { cms },
      'POST'
    );
    if (res?.cms) {
      writeCachedCms(res.cms);
    }
    return {
      success: true,
      cms: res?.cms || cms,
      message: res?.message || 'CMS configuration saved to Moodle database.',
    };
  },

  async resetCmsConfig(): Promise<CmsConfig> {
    try {
      await callInternalApi('reset_cms_config', {}, 'POST');
    } catch {
      // Ignore error and refresh
    }
    memoryCmsCache = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem(CMS_STORAGE_KEY);
    }
    return await this.getCmsConfig(true);
  },
};

/**
 * React hook for subscribing to live CMS configuration across Header, Home Body & Footer
 */
export function useCmsConfig() {
  const [cms, setCms] = useState<CmsConfig>(() => cmsService.getCached());
  const [loading, setLoading] = useState<boolean>(false);

  const refreshCms = useCallback(async (force = true) => {
    setLoading(true);
    try {
      const fresh = await cmsService.getCmsConfig(force);
      setCms(fresh);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    cmsService.getCmsConfig(false).then((fresh) => {
      if (mounted) setCms(fresh);
    });

    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<CmsConfig>;
      if (customEvent.detail && mounted) {
        setCms(customEvent.detail);
      }
    };

    window.addEventListener(CMS_EVENT_NAME, handleUpdate);
    return () => {
      mounted = false;
      window.removeEventListener(CMS_EVENT_NAME, handleUpdate);
    };
  }, []);

  return { cms, setCms, loading, refreshCms, saveCms: cmsService.saveCmsConfig, resetCms: cmsService.resetCmsConfig };
}
