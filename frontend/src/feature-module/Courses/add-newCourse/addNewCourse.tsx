import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Breadcrumb from '../../../core/common/Breadcrumb/breadcrumb';
import { all_routes } from '../../router/all_routes';
import { adminService } from '../../../core/api/adminService';
import { useAuth } from '../../../core/auth/authContext';

// ============================================================================
// Official Open University of Tanzania Brand Palette (from Logo)
// ============================================================================
const OUT_COLORS = {
  royalBlue: '#013BA6',
  royalBlueDark: '#002875',
  cyanBlue: '#1D80DF',
  yellowGold: '#F5EA14',
  charcoal: '#1A1A1A',
  surfaceLight: '#F4F7FC',
  borderSoft: '#D8E3F4',
};

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
const YEARS = Array.from({ length: 151 }, (_, i) => 1900 + i);
const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

const COURSE_FORMATS = [
  { value: 'topics', label: 'Custom sections' },
  { value: 'weeks', label: 'Weekly sections' },
  { value: 'singleactivity', label: 'Single activity' },
  { value: 'social', label: 'Social' },
  { value: 'kickstart', label: 'Kickstart format' },
  { value: 'roadmap', label: 'Visual Competency Roadmap & Learning Journey Format' },
  { value: 'onetopic', label: 'Onetopic format' },
  { value: 'streamdeck', label: 'High-Density Studio StreamDeck Command Launchpad Format' },
  { value: 'tiles', label: 'Tiles format' },
  { value: 'topcoll', label: 'Collapsed Topics' },
];

const MAX_UPLOAD_SIZES = [
  { value: 0, label: 'Site upload limit (128 MB)' },
  { value: 134217728, label: '128 MB' },
  { value: 104857600, label: '100 MB' },
  { value: 52428800, label: '50 MB' },
  { value: 20971520, label: '20 MB' },
  { value: 10485760, label: '10 MB' },
  { value: 5242880, label: '5 MB' },
  { value: 2097152, label: '2 MB' },
  { value: 1048576, label: '1 MB' },
  { value: 512000, label: '500 KB' },
  { value: 102400, label: '100 KB' },
  { value: 51200, label: '50 KB' },
  { value: 10240, label: '10 KB' },
];

const DEFAULT_STUDENT_INSTRUCTIONS =
  '<p>Welcome to the course. Please choose a template below to start, or contact your instructor for assistance.</p>';
const DEFAULT_TEACHER_INSTRUCTIONS =
  '<p>Welcome! Select a course template below to automatically populate your course structure and activities. You can customize all content after importing a template.</p>';

// Helper to count words in HTML string
function countHtmlWords(html: string): number {
  const plain = html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .trim();
  if (!plain) return 0;
  return plain.split(/\s+/).filter(Boolean).length;
}

// ============================================================================
// Reusable Moodle-Grade Rich Text Block (WYSIWYG + HTML Source + Word Count)
// ============================================================================
interface RichTextBlockProps {
  label: string;
  value: string;
  onChange: (html: string) => void;
  helpText?: string;
  minHeight?: number;
  placeholder?: string;
}

const RichTextBlock: React.FC<RichTextBlockProps> = ({
  label,
  value,
  onChange,
  helpText,
  minHeight = 150,
  placeholder = 'Write rich formatted academic content here...',
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [sourceMode, setSourceMode] = useState(false);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!sourceMode && editorRef.current && !focused) {
      if (editorRef.current.innerHTML !== (value || '')) {
        editorRef.current.innerHTML = value || '';
      }
    }
  }, [value, sourceMode, focused]);

  const execCmd = (cmd: string, arg?: string) => {
    if (sourceMode) return;
    editorRef.current?.focus();
    document.execCommand(cmd, false, arg);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const insertTableSnippet = () => {
    const tbl = `<table style="width:100%; border-collapse:collapse; margin:8px 0;" border="1"><thead><tr style="background:#F4F7FC;"><th style="padding:6px 10px;">Module / Week</th><th style="padding:6px 10px;">Learning Topic</th><th style="padding:6px 10px;">Assessment</th></tr></thead><tbody><tr><td style="padding:6px 10px;">Unit 1</td><td style="padding:6px 10px;">Foundational Concepts</td><td style="padding:6px 10px;">Quiz 1 (10%)</td></tr></tbody></table><p></p>`;
    execCmd('insertHTML', tbl);
  };

  const insertLinkPrompt = () => {
    const url = window.prompt('Enter URL (e.g. https://out.ac.tz):', 'https://');
    if (url) {
      execCmd('createLink', url);
    }
  };

  const words = countHtmlWords(value || '');

  return (
    <div className="mb-3">
      {label && <label className="form-label fw-semibold text-dark mb-1">{label}</label>}
      <div
        className="rounded-3 overflow-hidden"
        style={{
          border: focused ? `2px solid ${OUT_COLORS.royalBlue}` : `1px solid ${OUT_COLORS.borderSoft}`,
          background: '#fff',
          transition: 'border-color 0.15s ease',
        }}
      >
        {/* Rich Text Toolbar */}
        <div
          className="d-flex align-items-center flex-wrap gap-1 px-2 py-1 border-bottom"
          style={{ background: OUT_COLORS.surfaceLight }}
        >
          <select
            className="form-select form-select-sm py-0 px-2"
            style={{ width: 'auto', height: 28, fontSize: '0.78rem' }}
            onChange={(e) => {
              if (e.target.value) execCmd('formatBlock', e.target.value);
            }}
            defaultValue="P"
          >
            <option value="P">Paragraph</option>
            <option value="H2">Heading 2</option>
            <option value="H3">Heading 3</option>
            <option value="H4">Heading 4</option>
            <option value="BLOCKQUOTE">Blockquote</option>
            <option value="PRE">Code Block</option>
          </select>

          <div className="vr mx-1" />

          <button
            type="button"
            className="btn btn-sm btn-light border-0 px-2 py-0"
            style={{ height: 28 }}
            title="Bold (Ctrl+B)"
            onClick={() => execCmd('bold')}
          >
            <strong>B</strong>
          </button>
          <button
            type="button"
            className="btn btn-sm btn-light border-0 px-2 py-0"
            style={{ height: 28 }}
            title="Italic (Ctrl+I)"
            onClick={() => execCmd('italic')}
          >
            <em>I</em>
          </button>
          <button
            type="button"
            className="btn btn-sm btn-light border-0 px-2 py-0"
            style={{ height: 28 }}
            title="Underline (Ctrl+U)"
            onClick={() => execCmd('underline')}
          >
            <u>U</u>
          </button>
          <button
            type="button"
            className="btn btn-sm btn-light border-0 px-2 py-0"
            style={{ height: 28 }}
            title="Strikethrough"
            onClick={() => execCmd('strikeThrough')}
          >
            <s>S</s>
          </button>

          <div className="vr mx-1" />

          <button
            type="button"
            className="btn btn-sm btn-light border-0 px-2 py-0"
            style={{ height: 28 }}
            title="Bulleted List"
            onClick={() => execCmd('insertUnorderedList')}
          >
            <i className="feather-list" /> •
          </button>
          <button
            type="button"
            className="btn btn-sm btn-light border-0 px-2 py-0"
            style={{ height: 28 }}
            title="Numbered List"
            onClick={() => execCmd('insertOrderedList')}
          >
            1.
          </button>

          <div className="vr mx-1" />

          <button
            type="button"
            className="btn btn-sm btn-light border-0 px-2 py-0"
            style={{ height: 28, fontSize: '0.78rem' }}
            title="Insert Hyperlink"
            onClick={insertLinkPrompt}
          >
            <i className="feather-link me-1" />
            Link
          </button>
          <button
            type="button"
            className="btn btn-sm btn-light border-0 px-2 py-0"
            style={{ height: 28, fontSize: '0.78rem' }}
            title="Insert Syllabus Table"
            onClick={insertTableSnippet}
          >
            <i className="feather-grid me-1" />
            Table
          </button>
          <button
            type="button"
            className="btn btn-sm btn-light border-0 px-2 py-0"
            style={{ height: 28, fontSize: '0.78rem' }}
            title="Clear Formatting"
            onClick={() => execCmd('removeFormat')}
          >
            Clear
          </button>

          <div className="ms-auto">
            <button
              type="button"
              className={`btn btn-sm px-2 py-0 ${sourceMode ? 'btn-primary' : 'btn-outline-secondary'}`}
              style={{ height: 26, fontSize: '0.74rem' }}
              onClick={() => setSourceMode(!sourceMode)}
            >
              &lt;/&gt; HTML Source
            </button>
          </div>
        </div>

        {/* Editable Body */}
        {sourceMode ? (
          <textarea
            className="form-control border-0 rounded-0 font-monospace small"
            style={{ minHeight, resize: 'vertical' }}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
          />
        ) : (
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onFocus={() => setFocused(true)}
            onBlur={() => {
              setFocused(false);
              if (editorRef.current) {
                onChange(editorRef.current.innerHTML);
              }
            }}
            onInput={() => {
              if (editorRef.current) {
                onChange(editorRef.current.innerHTML);
              }
            }}
            className="p-3"
            style={{
              minHeight,
              outline: 'none',
              fontSize: '0.92rem',
              lineHeight: 1.6,
              color: OUT_COLORS.charcoal,
            }}
          />
        )}

        {/* Moodle Editor Footer with Word Counter & Rich Editor Badge */}
        <div
          className="d-flex justify-content-between align-items-center px-3 py-1 border-top small text-muted"
          style={{ background: '#FAFCFF', fontSize: '0.76rem' }}
        >
          <span>p</span>
          <div className="d-flex align-items-center gap-3">
            <span className="fw-semibold">{words} {words === 1 ? 'word' : 'words'}</span>
            <span className="badge bg-light text-dark border" style={{ fontSize: '0.7rem' }}>
              Build with Rich Editor
            </span>
          </div>
        </div>
      </div>
      {helpText && <div className="form-text text-muted mt-1">{helpText}</div>}
    </div>
  );
};

// ============================================================================
// Helper to convert Unix timestamp <-> Moodle Date Dropdown parts
// ============================================================================
interface DateParts {
  day: number;
  month: number; // 0-indexed (0..11)
  year: number;
  hour: string;
  minute: string;
}

function timestampToParts(ts: number): DateParts {
  const d = ts > 0 ? new Date(ts * 1000) : new Date();
  return {
    day: d.getDate(),
    month: d.getMonth(),
    year: d.getFullYear(),
    hour: String(d.getHours()).padStart(2, '0'),
    minute: String(d.getMinutes()).padStart(2, '0'),
  };
}

function partsToTimestamp(p: DateParts): number {
  const dt = new Date(p.year, p.month, p.day, Number(p.hour), Number(p.minute), 0);
  return Math.floor(dt.getTime() / 1000);
}

// ============================================================================
// Main Studio Component
// ============================================================================
type StudioTab =
  | 'add_course'
  | 'category_courses'
  | 'category_settings'
  | 'upload_courses'
  | 'permissions'
  | 'cohorts'
  | 'filters'
  | 'restore_course'
  | 'learning_plans'
  | 'competency_frameworks'
  | 'content_bank';

const AddNewCourse: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  // Active Top-Level Tab
  const initialTab = (searchParams.get('tab') as StudioTab) || 'add_course';
  const [activeTab, setActiveTab] = useState<StudioTab>(initialTab);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);

  // Workspace Data from Moodle REST API
  const [loadingWorkspace, setLoadingWorkspace] = useState(true);
  const [categories, setCategories] = useState<any[]>([
    { id: 1, name: 'Category 1', full_path_name: 'Category 1', parent: 0, idnumber: '', description: '', visible: 1, coursecount: 1 },
    { id: 2, name: 'Faculty of Science, Technology and Environmental Studies', full_path_name: 'Faculty of Science, Technology and Environmental Studies', parent: 0, idnumber: 'FSTES', description: '', visible: 1, coursecount: 5 },
    { id: 3, name: 'Faculty of Business Management', full_path_name: 'Faculty of Business Management', parent: 0, idnumber: 'FBM', description: '', visible: 1, coursecount: 3 },
    { id: 4, name: 'Institute of Educational and Management Technologies (IEMT)', full_path_name: 'Institute of Educational and Management Technologies (IEMT)', parent: 0, idnumber: 'IEMT', description: '', visible: 1, coursecount: 2 },
    { id: 5, name: 'IEMT Professional Short Courses', full_path_name: 'Institute of Educational and Management Technologies (IEMT) / IEMT Professional Short Courses', parent: 4, idnumber: 'IEMT-PSC', description: '', visible: 1, coursecount: 6 },
    { id: 6, name: 'IEMT Massive Open Online Courses (MOOCs)', full_path_name: 'Institute of Educational and Management Technologies (IEMT) / IEMT Massive Open Online Courses (MOOCs)', parent: 4, idnumber: 'IEMT-MOOC', description: '', visible: 1, coursecount: 3 },
    { id: 7, name: 'Faculty of Education', full_path_name: 'Faculty of Education', parent: 0, idnumber: 'FED', description: '', visible: 1, coursecount: 0 },
    { id: 8, name: 'Faculty of Law', full_path_name: 'Faculty of Law', parent: 0, idnumber: 'FLW', description: '', visible: 1, coursecount: 0 },
    { id: 9, name: 'Faculty of Arts and Social Sciences', full_path_name: 'Faculty of Arts and Social Sciences', parent: 0, idnumber: 'FASS', description: '', visible: 1, coursecount: 0 },
  ]);
  const [courses, setCourses] = useState<any[]>([]);
  const [cohorts, setCohorts] = useState<any[]>([]);
  const [filters, setFilters] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [capabilities, setCapabilities] = useState<any[]>([]);
  const [roleAssignments, setRoleAssignments] = useState<any[]>([]);
  const [competencyFrameworks, setCompetencyFrameworks] = useState<any[]>([]);
  const [learningPlans, setLearningPlans] = useState<any[]>([]);
  const [contentBank, setContentBank] = useState<any[]>([]);
  const [standardTags, setStandardTags] = useState<string[]>([
    'OUT', 'IEMT', 'MOOC', 'Short Course', 'ICT', 'Business', 'Law', 'Education', 'Science', 'Cybersecurity', 'AI & Data Science',
  ]);
  const [kickstartTemplates, setKickstartTemplates] = useState<any[]>([]);

  // Global Feedback Banner
  const [feedback, setFeedback] = useState<{ type: 'success' | 'danger' | 'info'; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [createdCourseId, setCreatedCourseId] = useState<number | null>(null);

  // ==========================================================================
  // 1. ADD / EDIT A COURSE FORM STATE (8 Accordion/Wizard Sections)
  // ==========================================================================
  const [editingCourseId, setEditingCourseId] = useState<number | null>(
    searchParams.get('courseid') ? Number(searchParams.get('courseid')) : null
  );
  const [wizardStepMode, setWizardStepMode] = useState<boolean>(false); // false = Moodle Expandable 8-Section Accordion, true = Step-by-Step Wizard
  const [activeWizardStep, setActiveWizardStep] = useState<number>(0);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    general: true,
    description: true,
    format: true,
    curriculum: true,
    appearance: false,
    files: false,
    completion: false,
    groups: false,
    tags: false,
  });

  // Section 1: General
  const [fullname, setFullname] = useState('');
  const [shortname, setShortname] = useState('');
  const [categoryId, setCategoryId] = useState<number>(
    searchParams.get('categoryid') ? Number(searchParams.get('categoryid')) : 1
  );
  const [visible, setVisible] = useState<number>(1);
  const [tuitionFee, setTuitionFee] = useState<number>(150000);
  const nowSec = Math.floor(Date.now() / 1000);
  const [startDateParts, setStartDateParts] = useState<DateParts>(() => timestampToParts(nowSec));
  const [endDateEnabled, setEndDateEnabled] = useState<boolean>(true);
  const [endDateParts, setEndDateParts] = useState<DateParts>(() => timestampToParts(nowSec + 365 * 86400));
  const [idnumber, setIdnumber] = useState('');

  // Section 9: Course Curriculum, Sections & Interactive Contents (for Editing CS101 or any course)
  const [courseSections, setCourseSections] = useState<any[]>([]);
  const [editingSecNum, setEditingSecNum] = useState<number | null>(null);
  const [editSecName, setEditSecName] = useState<string>('');
  const [editSecSummary, setEditSecSummary] = useState<string>('');
  const [newSecOpen, setNewSecOpen] = useState<boolean>(false);
  const [newSecName, setNewSecName] = useState<string>('');
  const [newSecSummary, setNewSecSummary] = useState<string>('');

  const [addActSecNum, setAddActSecNum] = useState<number | null>(null);
  const [newActType, setNewActType] = useState<string>('page');
  const [newActName, setNewActName] = useState<string>('');
  const [newActContent, setNewActContent] = useState<string>('<p>Enter detailed lecture notes, learning objectives, or assessment instructions...</p>');

  const [editActCmId, setEditActCmId] = useState<number | null>(null);
  const [editActName, setEditActName] = useState<string>('');
  const [editActContent, setEditActContent] = useState<string>('');
  const [editActVisible, setEditActVisible] = useState<number>(1);

  // Section 2: Description
  const [summary, setSummary] = useState('');
  const [courseImagePreview, setCourseImagePreview] = useState<string>('');
  const [courseImageName, setCourseImageName] = useState<string>('');

  // Section 3: Course format
  const [format, setFormat] = useState<string>('kickstart');
  const [kickstartTemplateId, setKickstartTemplateId] = useState<number>(1);
  const [templatesView, setTemplatesView] = useState<'tile' | 'list'>('tile');
  const [studentInstructions, setStudentInstructions] = useState<string>(DEFAULT_STUDENT_INSTRUCTIONS);
  const [teacherInstructions, setTeacherInstructions] = useState<string>(DEFAULT_TEACHER_INSTRUCTIONS);
  const [numSections, setNumSections] = useState<number>(8);
  const [hiddenSections, setHiddenSections] = useState<number>(1);
  const [courseDisplay, setCourseDisplay] = useState<number>(0);

  // Section 4: Appearance
  const [lang, setLang] = useState<string>('');
  const [newsitems, setNewsitems] = useState<number>(5);
  const [showgrades, setShowgrades] = useState<number>(1);
  const [showreports, setShowreports] = useState<number>(0);
  const [showactivitydates, setShowactivitydates] = useState<number>(1);

  // Section 5: Files and uploads
  const [maxbytes, setMaxbytes] = useState<number>(0);

  // Section 6: Completion tracking
  const [enablecompletion, setEnablecompletion] = useState<number>(1);
  const [showcompletionconditions, setShowcompletionconditions] = useState<number>(1);

  // Section 7: Groups
  const [groupmode, setGroupmode] = useState<number>(0);
  const [groupmodeforce, setGroupmodeforce] = useState<number>(0);
  const [defaultgroupingid, setDefaultgroupingid] = useState<number>(0);

  // Section 8: Tags
  const [selectedTags, setSelectedTags] = useState<string[]>(['OUT', 'Academic']);
  const [tagInput, setTagInput] = useState<string>('');
  const [manageStandardTagsOpen, setManageStandardTagsOpen] = useState<boolean>(false);
  const [newStandardTagInput, setNewStandardTagInput] = useState<string>('');

  // ==========================================================================
  // 2. CATEGORY SETTINGS FORM STATE (course/editcategory.php?id=1)
  // ==========================================================================
  const [catEditMode, setCatEditMode] = useState<'edit' | 'create'>('edit');
  const [catParentId, setCatParentId] = useState<number>(0);
  const [catName, setCatName] = useState<string>('Category 1');
  const [catIdNumber, setCatIdNumber] = useState<string>('');
  const [catDescription, setCatDescription] = useState<string>('');
  const [catTheme, setCatTheme] = useState<string>('');

  // ==========================================================================
  // 3. UPLOAD COURSES STATE (admin/tool/uploadcourse/index.php?categoryid=1)
  // ==========================================================================
  const [csvText, setCsvText] = useState<string>(
    `shortname,fullname,category,idnumber,format,summary\nOIT-411,Cloud Native Architecture & DevOps Engineering,2,OIT-411,kickstart,"<p>Enterprise Kubernetes, Docker, and CI/CD pipelines for distributed systems.</p>"\nOBM-309,Strategic Financial Governance & FinTech Systems,3,OBM-309,tiles,"<p>Corporate finance, digital banking regulations, and East African FinTech ecosystems.</p>"`
  );
  const [uploadDelimiter, setUploadDelimiter] = useState<string>(',');
  const [uploadEncoding, setUploadEncoding] = useState<string>('UTF-8');
  const [uploadMode, setUploadMode] = useState<string>('create_or_update');
  const [uploadDefaultFormat, setUploadDefaultFormat] = useState<string>('kickstart');
  const [uploadResults, setUploadResults] = useState<any[] | null>(null);

  // ==========================================================================
  // 4. MORE MENU STATES (Cohorts, Restore, Learning Plans, Frameworks, Content Bank)
  // ==========================================================================
  const [cohortName, setCohortName] = useState('');
  const [cohortIdNumber, setCohortIdNumber] = useState('');
  const [cohortDescription, setCohortDescription] = useState('');

  const [restoreSourceCourseId, setRestoreSourceCourseId] = useState<number>(0);
  const [restoreTargetCategoryId, setRestoreTargetCategoryId] = useState<number>(1);
  const [restoreFullname, setRestoreFullname] = useState('');
  const [restoreShortname, setRestoreShortname] = useState('');
  const [restoreBackupFilename, setRestoreBackupFilename] = useState('');

  const [lpName, setLpName] = useState('');
  const [lpDescription, setLpDescription] = useState('');
  const [lpDuedate, setLpDuedate] = useState('2027-06-30');

  const [cfName, setCfName] = useState('');
  const [cfIdNumber, setCfIdNumber] = useState('');
  const [cfTaxonomies, setCfTaxonomies] = useState('domain,competency,indicator,outcome');
  const [cfDescription, setCfDescription] = useState('');

  const [cbTitle, setCbTitle] = useState('');
  const [cbLibrary, setCbLibrary] = useState('H5P.InteractiveVideo 1.26');

  // ==========================================================================
  // Load Studio Workspace
  // ==========================================================================
  const loadStudioWorkspace = async (catId = categoryId) => {
    setLoadingWorkspace(true);
    try {
      const ws = await adminService.getCourseStudioWorkspace(catId);
      if (Array.isArray(ws.categories) && ws.categories.length > 0) {
        setCategories(ws.categories);
        const currentCat = ws.categories.find((c: any) => Number(c.id) === Number(catId)) || ws.categories[0];
        if (currentCat && catEditMode === 'edit') {
          setCatParentId(Number(currentCat.parent || 0));
          setCatName(currentCat.name || '');
          setCatIdNumber(currentCat.idnumber || '');
          setCatDescription(currentCat.description || '');
          setCatTheme(currentCat.theme || '');
        }
      }
      if (Array.isArray(ws.courses)) {
        setCourses(ws.courses);
        if (ws.courses.length > 0 && !restoreSourceCourseId) {
          setRestoreSourceCourseId(Number(ws.courses[0].id));
        }
      }
      if (Array.isArray(ws.cohorts)) setCohorts(ws.cohorts);
      if (Array.isArray(ws.filters)) setFilters(ws.filters);
      if (Array.isArray(ws.roles)) setRoles(ws.roles);
      if (Array.isArray(ws.capabilities)) setCapabilities(ws.capabilities);
      if (Array.isArray(ws.role_assignments)) setRoleAssignments(ws.role_assignments);
      if (Array.isArray(ws.competency_frameworks)) setCompetencyFrameworks(ws.competency_frameworks);
      if (Array.isArray(ws.learning_plans)) setLearningPlans(ws.learning_plans);
      if (Array.isArray(ws.content_bank)) setContentBank(ws.content_bank);
      if (Array.isArray(ws.standard_tags)) setStandardTags(ws.standard_tags);
      if (Array.isArray(ws.kickstart_templates)) setKickstartTemplates(ws.kickstart_templates);
    } catch (err: any) {
      console.warn('Workspace load warning:', err);
    } finally {
      setLoadingWorkspace(false);
    }
  };

  useEffect(() => {
    loadStudioWorkspace(categoryId);
  }, []);

  // Sync Category Settings form when selected category changes
  useEffect(() => {
    if (catEditMode === 'edit') {
      const found = categories.find((c) => Number(c.id) === Number(categoryId));
      if (found) {
        setCatParentId(Number(found.parent || 0));
        setCatName(found.name || '');
        setCatIdNumber(found.idnumber || '');
        setCatDescription(found.description || '');
        setCatTheme(found.theme || '');
      }
    }
  }, [categoryId, catEditMode, categories]);

  // Load course details if editing an existing course
  const loadCourseIntoWizard = async (cid: number) => {
    setFeedback(null);
    setSubmitting(true);
    try {
      const details: any = await adminService.getCourseDetails(cid);
      setEditingCourseId(cid);
      setFullname(details.fullname || '');
      setShortname(details.shortname || '');
      setCategoryId(Number(details.category_id || details.category || 1));
      setVisible(Number(details.visible ?? 1));
      if (details.startdate) {
        setStartDateParts(timestampToParts(Number(details.startdate)));
      }
      if (details.enddate && Number(details.enddate) > 0) {
        setEndDateEnabled(true);
        setEndDateParts(timestampToParts(Number(details.enddate)));
      } else {
        setEndDateEnabled(false);
      }
      setIdnumber(details.idnumber || '');
      setTuitionFee(Number(details.tuition_fee ?? 150000));
      setSummary(details.summary || '');
      setCourseImagePreview(details.course_image || '');
      setFormat(details.format || 'kickstart');
      setNumSections(Number(details.numsections || details.sections_count || 6));
      setTemplatesView(details.templatesview === 'list' ? 'list' : 'tile');
      setStudentInstructions(details.userinstructions || DEFAULT_STUDENT_INSTRUCTIONS);
      setTeacherInstructions(details.teacherinstructions || DEFAULT_TEACHER_INSTRUCTIONS);
      setHiddenSections(Number(details.hiddensections ?? 1));
      setCourseDisplay(Number(details.coursedisplay ?? 0));
      setLang(details.lang || '');
      setNewsitems(Number(details.newsitems ?? 5));
      setShowgrades(Number(details.showgrades ?? 1));
      setShowreports(Number(details.showreports ?? 0));
      setShowactivitydates(Number(details.showactivitydates ?? 1));
      setMaxbytes(Number(details.maxbytes ?? 0));
      setEnablecompletion(Number(details.enablecompletion ?? 1));
      setShowcompletionconditions(Number(details.showcompletionconditions ?? 1));
      setGroupmode(Number(details.groupmode ?? 0));
      setGroupmodeforce(Number(details.groupmodeforce ?? 0));
      setDefaultgroupingid(Number(details.defaultgroupingid ?? 0));
      if (Array.isArray(details.tags)) {
        setSelectedTags(details.tags);
      }
      setCourseSections(Array.isArray(details.sections) ? details.sections : []);
      setEditingSecNum(null);
      setAddActSecNum(null);
      setEditActCmId(null);
      setActiveTab('add_course');
      setExpandedSections({
        general: true,
        description: true,
        format: true,
        curriculum: true,
        appearance: true,
        files: true,
        completion: true,
        groups: true,
        tags: true,
      });
    } catch (e: any) {
      setFeedback({ type: 'danger', text: e?.message || 'Failed to load course details into wizard.' });
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const cidParam = searchParams.get('courseid') || searchParams.get('id');
    const tabParam = searchParams.get('tab') as StudioTab | null;
    if (tabParam) {
      setActiveTab(tabParam);
    }
    if (cidParam && Number(cidParam) > 1) {
      loadCourseIntoWizard(Number(cidParam));
    }
  }, [searchParams]);

  const resetWizardToNewCourse = () => {
    setEditingCourseId(null);
    setCreatedCourseId(null);
    setCourseSections([]);
    setFullname('');
    setShortname('');
    setIdnumber('');
    setTuitionFee(150000);
    setSummary('');
    setCourseImagePreview('');
    setCourseImageName('');
    setFormat('kickstart');
    setTemplatesView('tile');
    setStudentInstructions(DEFAULT_STUDENT_INSTRUCTIONS);
    setTeacherInstructions(DEFAULT_TEACHER_INSTRUCTIONS);
    setNumSections(8);
    setHiddenSections(1);
    setCourseDisplay(0);
    setLang('');
    setNewsitems(5);
    setShowgrades(1);
    setShowreports(0);
    setShowactivitydates(1);
    setMaxbytes(0);
    setEnablecompletion(1);
    setShowcompletionconditions(1);
    setGroupmode(0);
    setGroupmodeforce(0);
    setDefaultgroupingid(0);
    setSelectedTags(['OUT', 'Academic']);
    setActiveTab('add_course');
    setSearchParams({});
  };

  // Toggle expand/collapse all Moodle sections
  const areAllExpanded = Object.values(expandedSections).every(Boolean);
  const toggleExpandAllSections = () => {
    const nextState = !areAllExpanded;
    setExpandedSections({
      general: nextState,
      description: nextState,
      format: nextState,
      curriculum: nextState,
      appearance: nextState,
      files: nextState,
      completion: nextState,
      groups: nextState,
      tags: nextState,
    });
  };

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Handle Course Image Drag & Drop / File Picker
  const handleImageFileSelect = (file: File | null) => {
    if (!file) return;
    setCourseImageName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (typeof ev.target?.result === 'string') {
        setCourseImagePreview(ev.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Save Course (Create or Update)
  const handleSaveCourse = async (returnToCategoryAfter = false) => {
    setFeedback(null);
    if (!fullname.trim() || !shortname.trim()) {
      setFeedback({
        type: 'danger',
        text: 'Required fields missing: Course full name and Course short name must be provided.',
      });
      setExpandedSections((prev) => ({ ...prev, general: true }));
      return;
    }

    setSubmitting(true);
    try {
      const payload: Record<string, any> = {
        fullname: fullname.trim(),
        shortname: shortname.trim(),
        category_id: categoryId,
        category: categoryId,
        visible,
        startdate: partsToTimestamp(startDateParts),
        enddate_enabled: endDateEnabled ? 1 : 0,
        enddate: endDateEnabled ? partsToTimestamp(endDateParts) : 0,
        idnumber: idnumber.trim(),
        summary,
        course_image: courseImagePreview || undefined,
        format,
        kickstart_template_id: format === 'kickstart' ? kickstartTemplateId : 0,
        num_sections: numSections,
        numsections: numSections,
        templatesview: templatesView,
        userinstructions: studentInstructions,
        teacherinstructions: teacherInstructions,
        hiddensections: hiddenSections,
        coursedisplay: courseDisplay,
        lang,
        newsitems,
        showgrades,
        showreports,
        showactivitydates,
        maxbytes,
        enablecompletion,
        showcompletionconditions,
        groupmode,
        groupmodeforce,
        defaultgroupingid,
        tuition_fee: tuitionFee,
        tags: selectedTags,
      };

      if (editingCourseId && editingCourseId > 1) {
        const res = await adminService.updateCourseSettings(editingCourseId, payload);
        setCreatedCourseId(editingCourseId);
        await loadCourseIntoWizard(editingCourseId);
        setFeedback({
          type: 'success',
          text: res.message || `Course "${fullname}" (${shortname}) updated in Moodle.`,
        });
      } else {
        const res = await adminService.createCourse(payload);
        const newCid = Number(res.course_id || res.courseid || res.id || 0);
        setCreatedCourseId(newCid);
        setEditingCourseId(newCid);
        if (newCid > 1) {
          await loadCourseIntoWizard(newCid);
        }
        setFeedback({
          type: 'success',
          text: res.message || `Course "${fullname}" (${shortname}) created in Moodle (ID #${newCid}).`,
        });
      }

      await loadStudioWorkspace(categoryId);
      if (returnToCategoryAfter) {
        setActiveTab('category_courses');
      }
    } catch (err: any) {
      setFeedback({
        type: 'danger',
        text: err?.message || 'Error saving course settings via Moodle REST API.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================================================
  // Category Save Handler (course/editcategory.php?id=1)
  // ==========================================================================
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    if (!catName.trim()) {
      setFeedback({ type: 'danger', text: 'Category name is required.' });
      return;
    }
    setSubmitting(true);
    try {
      if (catEditMode === 'create') {
        const res = await adminService.addCategory({
          name: catName.trim(),
          parent: catParentId,
          idnumber: catIdNumber.trim(),
          description: catDescription,
        });
        setFeedback({ type: 'success', text: res.message || `Category "${catName}" created.` });
        if (res.category?.id) {
          setCategoryId(Number(res.category.id));
        }
        setCatEditMode('edit');
      } else {
        const res = await adminService.updateCategory({
          category_id: categoryId,
          name: catName.trim(),
          parent: catParentId,
          idnumber: catIdNumber.trim(),
          description: catDescription,
        });
        setFeedback({ type: 'success', text: res.message || `Category "${catName}" updated.` });
      }
      await loadStudioWorkspace(categoryId);
    } catch (err: any) {
      setFeedback({ type: 'danger', text: err?.message || 'Failed to save category.' });
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================================================
  // Bulk Upload Courses Handler (admin/tool/uploadcourse/index.php?categoryid=1)
  // ==========================================================================
  const handleBulkUploadCourses = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setSubmitting(true);
    try {
      const res = await adminService.bulkUploadCourses({
        csv_text: csvText,
        upload_mode: uploadMode,
        default_category_id: categoryId,
        default_format: uploadDefaultFormat,
        delimiter: uploadDelimiter,
      });
      setUploadResults(res.results || []);
      setFeedback({ type: 'success', text: res.message });
      await loadStudioWorkspace(categoryId);
    } catch (err: any) {
      setFeedback({ type: 'danger', text: err?.message || 'Bulk upload failed.' });
    } finally {
      setSubmitting(false);
    }
  };

  const selectedCategoryObj =
    categories.find((c) => Number(c.id) === Number(categoryId)) || categories[0] || { id: 1, name: 'Category 1', full_path_name: 'Category 1' };

  const WIZARD_STEPS = [
    { key: 'general', title: '1. General', icon: 'feather-Sliders' },
    { key: 'description', title: '2. Description', icon: 'feather-file-text' },
    { key: 'format', title: '3. Course format', icon: 'feather-layout' },
    { key: 'curriculum', title: '4. Curriculum & Contents', icon: 'feather-book-open' },
    { key: 'appearance', title: '5. Appearance', icon: 'feather-eye' },
    { key: 'files', title: '6. Files and uploads', icon: 'feather-upload-cloud' },
    { key: 'completion', title: '7. Completion tracking', icon: 'feather-check-circle' },
    { key: 'groups', title: '8. Groups', icon: 'feather-users' },
    { key: 'tags', title: '9. Tags', icon: 'feather-tag' },
  ];

  const isSectionVisible = (key: string, idx: number) => {
    if (wizardStepMode) {
      return activeWizardStep === idx;
    }
    return !!expandedSections[key];
  };

  return (
    <>
      <Breadcrumb title={editingCourseId ? `Edit Course Settings (#${editingCourseId})` : 'Add a New Course & Category Studio'} />

      <div className="content py-4" style={{ background: OUT_COLORS.surfaceLight, minHeight: '88vh' }}>
        <div className="container">
          {/* ================================================================
              TOP MOODLE BREADCRUMB & ROLE GOVERNANCE HEADER
             ================================================================ */}
          <div
            className="card border-0 shadow-sm mb-3 overflow-hidden"
            style={{ borderRadius: 14, borderTop: `4px solid ${OUT_COLORS.royalBlue}` }}
          >
            <div
              className="px-4 py-3 text-white d-flex justify-content-between align-items-center flex-wrap gap-3"
              style={{
                background: `linear-gradient(135deg, ${OUT_COLORS.royalBlue} 0%, ${OUT_COLORS.royalBlueDark} 100%)`,
              }}
            >
              <div>
                <nav aria-label="breadcrumb">
                  <ol className="breadcrumb mb-1 small" style={{ fontSize: '0.8rem' }}>
                    <li className="breadcrumb-item">
                      <Link to={all_routes.homethree} className="text-white-50 text-decoration-none">
                        LMS
                      </Link>
                    </li>
                    <li className="breadcrumb-item">
                      <Link
                        to={user?.role === 'admin' ? all_routes.adminDashboard : all_routes.instructorDashboard}
                        className="text-white-50 text-decoration-none"
                      >
                        Dashboard
                      </Link>
                    </li>
                    <li className="breadcrumb-item">
                      <button
                        type="button"
                        className="btn btn-link p-0 text-white-50 text-decoration-none"
                        style={{ fontSize: '0.8rem' }}
                        onClick={() => setActiveTab('category_courses')}
                      >
                        My courses
                      </button>
                    </li>
                    <li className="breadcrumb-item">
                      <button
                        type="button"
                        className="btn btn-link p-0 text-white-50 text-decoration-none"
                        style={{ fontSize: '0.8rem' }}
                        onClick={() => setActiveTab('category_settings')}
                      >
                        Site administration
                      </button>
                    </li>
                    <li className="breadcrumb-item">
                      <button
                        type="button"
                        className="btn btn-link p-0 text-warning text-decoration-none fw-semibold"
                        style={{ fontSize: '0.8rem' }}
                        onClick={() => setActiveTab('category_courses')}
                      >
                        {selectedCategoryObj.name}
                      </button>
                    </li>
                    <li className="breadcrumb-item">
                      <button
                        type="button"
                        className="btn btn-link p-0 text-white-50 text-decoration-none"
                        style={{ fontSize: '0.8rem' }}
                        onClick={() => setActiveTab('category_courses')}
                      >
                        Manage courses and categories
                      </button>
                    </li>
                    <li className="breadcrumb-item active text-white fw-semibold" aria-current="page">
                      {editingCourseId ? `Edit course #${editingCourseId}` : 'Add a new course'}
                    </li>
                  </ol>
                </nav>
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <h4 className="text-white fw-bold mb-0">{selectedCategoryObj.name}</h4>
                  <span
                    className="badge"
                    style={{ background: OUT_COLORS.yellowGold, color: OUT_COLORS.charcoal, fontWeight: 700 }}
                  >
                    100% Native React REST API Studio
                  </span>
                  <span className="badge bg-white bg-opacity-25 text-white">
                    Role: {(user?.role || 'instructor').toUpperCase()} ({user?.name || 'Academic Staff'})
                  </span>
                </div>
              </div>

              <div className="d-flex align-items-center gap-2 flex-wrap">
                <select
                  className="form-select form-select-sm"
                  style={{ maxWidth: 280, borderColor: 'rgba(255,255,255,0.35)' }}
                  value={categoryId}
                  onChange={(e) => setCategoryId(Number(e.target.value))}
                  title="Switch Active Category Context"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.full_path_name || c.name}
                    </option>
                  ))}
                </select>

                <Link
                  to={user?.role === 'admin' ? all_routes.adminDashboard : all_routes.instructorDashboard}
                  className="btn btn-sm btn-light fw-semibold"
                >
                  <i className="feather-arrow-left me-1" />
                  Dashboard
                </Link>
              </div>
            </div>

            {/* ==============================================================
                MOODLE SECONDARY NAVIGATION TABS (Category, Settings, Upload courses, More)
               ============================================================== */}
            <div className="px-4 bg-white border-bottom d-flex align-items-center justify-content-between flex-wrap gap-2">
              <ul className="nav nav-tabs border-0">
                <li className="nav-item">
                  <button
                    type="button"
                    className={`nav-link border-0 py-3 px-3 fw-semibold ${activeTab === 'add_course' ? 'active text-primary border-bottom border-3 border-primary' : 'text-secondary'
                      }`}
                    onClick={() => setActiveTab('add_course')}
                  >
                    <i className="feather-plus-circle me-1" />
                    {editingCourseId ? 'Edit course wizard' : 'Add a new course'}
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    type="button"
                    className={`nav-link border-0 py-3 px-3 fw-semibold ${activeTab === 'category_courses' ? 'active text-primary border-bottom border-3 border-primary' : 'text-secondary'
                      }`}
                    onClick={() => setActiveTab('category_courses')}
                  >
                    <i className="feather-folder me-1" />
                    Category ({courses.filter((c) => Number(c.category_id) === Number(categoryId)).length}/{courses.length})
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    type="button"
                    className={`nav-link border-0 py-3 px-3 fw-semibold ${activeTab === 'category_settings' ? 'active text-primary border-bottom border-3 border-primary' : 'text-secondary'
                      }`}
                    onClick={() => setActiveTab('category_settings')}
                  >
                    <i className="feather-settings me-1" />
                    Settings
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    type="button"
                    className={`nav-link border-0 py-3 px-3 fw-semibold ${activeTab === 'upload_courses' ? 'active text-primary border-bottom border-3 border-primary' : 'text-secondary'
                      }`}
                    onClick={() => setActiveTab('upload_courses')}
                  >
                    <i className="feather-upload me-1" />
                    Upload courses
                  </button>
                </li>

                {/* More Dropdown Menu (Permissions, Cohorts, Filters, Restore course, Learning plan templates, Competency frameworks, Content bank) */}
                <li className="nav-item dropdown position-relative">
                  <button
                    type="button"
                    className={`nav-link border-0 py-3 px-3 fw-semibold dropdown-toggle ${[
                      'permissions',
                      'cohorts',
                      'filters',
                      'restore_course',
                      'learning_plans',
                      'competency_frameworks',
                      'content_bank',
                    ].includes(activeTab)
                      ? 'active text-primary border-bottom border-3 border-primary'
                      : 'text-secondary'
                      }`}
                    onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
                  >
                    More
                  </button>
                  {moreDropdownOpen && (
                    <div
                      className="dropdown-menu show shadow border-0 py-2"
                      style={{ position: 'absolute', top: '100%', left: 0, minWidth: 250, zIndex: 1050 }}
                      onMouseLeave={() => setMoreDropdownOpen(false)}
                    >
                      <button
                        type="button"
                        className={`dropdown-item py-2 ${activeTab === 'permissions' ? 'active' : ''}`}
                        onClick={() => {
                          setActiveTab('permissions');
                          setMoreDropdownOpen(false);
                        }}
                      >
                        <i className="feather-shield me-2" />
                        Permissions
                      </button>
                      <button
                        type="button"
                        className={`dropdown-item py-2 ${activeTab === 'cohorts' ? 'active' : ''}`}
                        onClick={() => {
                          setActiveTab('cohorts');
                          setMoreDropdownOpen(false);
                        }}
                      >
                        <i className="feather-users me-2" />
                        Cohorts ({cohorts.length})
                      </button>
                      <button
                        type="button"
                        className={`dropdown-item py-2 ${activeTab === 'filters' ? 'active' : ''}`}
                        onClick={() => {
                          setActiveTab('filters');
                          setMoreDropdownOpen(false);
                        }}
                      >
                        <i className="feather-sliders me-2" />
                        Filters ({filters.length})
                      </button>
                      <button
                        type="button"
                        className={`dropdown-item py-2 ${activeTab === 'restore_course' ? 'active' : ''}`}
                        onClick={() => {
                          setActiveTab('restore_course');
                          setMoreDropdownOpen(false);
                        }}
                      >
                        <i className="feather-rotate-ccw me-2" />
                        Restore course
                      </button>
                      <div className="dropdown-divider" />
                      <button
                        type="button"
                        className={`dropdown-item py-2 ${activeTab === 'learning_plans' ? 'active' : ''}`}
                        onClick={() => {
                          setActiveTab('learning_plans');
                          setMoreDropdownOpen(false);
                        }}
                      >
                        <i className="feather-compass me-2" />
                        Learning plan templates ({learningPlans.length})
                      </button>
                      <button
                        type="button"
                        className={`dropdown-item py-2 ${activeTab === 'competency_frameworks' ? 'active' : ''}`}
                        onClick={() => {
                          setActiveTab('competency_frameworks');
                          setMoreDropdownOpen(false);
                        }}
                      >
                        <i className="feather-award me-2" />
                        Competency frameworks ({competencyFrameworks.length})
                      </button>
                      <button
                        type="button"
                        className={`dropdown-item py-2 ${activeTab === 'content_bank' ? 'active' : ''}`}
                        onClick={() => {
                          setActiveTab('content_bank');
                          setMoreDropdownOpen(false);
                        }}
                      >
                        <i className="feather-box me-2" />
                        Content bank ({contentBank.length})
                      </button>
                    </div>
                  )}
                </li>
              </ul>

              {/* Quick Pills for More Tools */}
              <div className="d-none d-xl-flex align-items-center gap-1 py-2">
                {(
                  [
                    { id: 'permissions', label: 'Permissions' },
                    { id: 'cohorts', label: 'Cohorts' },
                    { id: 'filters', label: 'Filters' },
                    { id: 'restore_course', label: 'Restore course' },
                    { id: 'learning_plans', label: 'Learning plans' },
                    { id: 'competency_frameworks', label: 'Competencies' },
                    { id: 'content_bank', label: 'Content bank' },
                  ] as Array<{ id: StudioTab; label: string }>
                ).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTab(item.id)}
                    className={`btn btn-sm py-1 px-2 ${activeTab === item.id ? 'btn-primary' : 'btn-outline-secondary border-0'
                      }`}
                    style={{ fontSize: '0.75rem' }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Feedback Alert */}
          {feedback && (
            <div
              className={`alert alert-${feedback.type} shadow-sm d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3`}
            >
              <div>
                <i
                  className={`me-2 ${feedback.type === 'success' ? 'feather-check-circle' : 'feather-alert-circle'
                    }`}
                />
                {feedback.text}
              </div>
              <div className="d-flex gap-2">
                {createdCourseId && (
                  <>
                    <button
                      type="button"
                      className="btn btn-sm btn-primary"
                      onClick={() => navigate(`${all_routes.courseDetails}?id=${createdCourseId}`)}
                    >
                      View Course Landing
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-dark"
                      onClick={() => navigate(`${all_routes.courseWatch}?id=${createdCourseId}`)}
                    >
                      Open Interactive Classroom
                    </button>
                  </>
                )}
                <button type="button" className="btn-close" onClick={() => setFeedback(null)} />
              </div>
            </div>
          )}

          {/* ================================================================
              TAB 1: ADD / EDIT A NEW COURSE (course/edit.php — ALL 8 SECTIONS)
             ================================================================ */}
          {activeTab === 'add_course' && (
            <div className="card border-0 shadow-sm p-4" style={{ borderRadius: 14 }}>
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 pb-3 mb-4 border-bottom">
                <div>
                  <h4 className="fw-bold mb-1" style={{ color: OUT_COLORS.royalBlue }}>
                    {editingCourseId
                      ? `Edit Course & Curriculum: ${shortname ? `[${shortname}] ` : ''}${fullname || `#${editingCourseId}`}`
                      : 'Add a new course'}
                  </h4>
                  <p className="text-muted small mb-0">
                    Unified Course Creation, Settings & Curriculum Content Wizard (<code>/course/add-course</code>) — all 9 sections & Rich-Text blocks.
                  </p>
                </div>

                <div className="d-flex align-items-center gap-2 flex-wrap">
                  {/* Quick Course Switcher Dropdown */}
                  <div className="d-flex align-items-center gap-1">
                    <span className="small fw-semibold text-secondary">Target Course:</span>
                    <select
                      className="form-select form-select-sm fw-semibold"
                      style={{ minWidth: 230, borderColor: OUT_COLORS.royalBlue }}
                      value={editingCourseId || 0}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        if (val > 1) {
                          setSearchParams({ courseid: String(val) });
                          loadCourseIntoWizard(val);
                        } else {
                          resetWizardToNewCourse();
                        }
                      }}
                    >
                      <option value={0}>+ Create a Brand New Course</option>
                      {courses.map((c: any) => (
                        <option key={c.id} value={c.id}>
                          Edit [{c.shortname}] {c.fullname}
                        </option>
                      ))}
                    </select>
                  </div>

                  {editingCourseId && (
                    <>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary"
                        onClick={resetWizardToNewCourse}
                      >
                        <i className="feather-plus me-1" />
                        New Course
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-dark"
                        onClick={() => navigate(`${all_routes.courseWatch}?id=${editingCourseId}`)}
                      >
                        <i className="feather-play-circle me-1" />
                        Open Classroom
                      </button>
                    </>
                  )}

                  <div className="btn-group btn-group-sm" role="group">
                    <button
                      type="button"
                      className={`btn ${!wizardStepMode ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => setWizardStepMode(false)}
                    >
                      All 9 Sections View
                    </button>
                    <button
                      type="button"
                      className={`btn ${wizardStepMode ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => setWizardStepMode(true)}
                    >
                      Step-by-Step Wizard
                    </button>
                  </div>

                  {!wizardStepMode && (
                    <button
                      type="button"
                      className="btn btn-sm btn-link text-decoration-none fw-semibold"
                      style={{ color: OUT_COLORS.royalBlue }}
                      onClick={toggleExpandAllSections}
                    >
                      {areAllExpanded ? 'Collapse all' : 'Expand all'}
                    </button>
                  )}
                </div>
              </div>

              {/* Step-by-Step Wizard Stepper Bar */}
              {wizardStepMode && (
                <div className="d-flex flex-wrap gap-2 mb-4 pb-3 border-bottom">
                  {WIZARD_STEPS.map((st, idx) => (
                    <button
                      key={st.key}
                      type="button"
                      onClick={() => setActiveWizardStep(idx)}
                      className={`btn btn-sm rounded-pill px-3 ${activeWizardStep === idx ? 'btn-primary fw-bold' : 'btn-light border text-secondary'
                        }`}
                    >
                      {st.title}
                    </button>
                  ))}
                </div>
              )}

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveCourse(false);
                }}
              >
                {/* ==========================================================
                    SECTION 1: GENERAL
                   ========================================================== */}
                <div className="mb-3 border rounded-3 overflow-hidden">
                  <div
                    className="d-flex justify-content-between align-items-center px-3 py-2 cursor-pointer"
                    style={{ background: OUT_COLORS.surfaceLight, cursor: 'pointer' }}
                    onClick={() => !wizardStepMode && toggleSection('general')}
                  >
                    <h6 className="mb-0 fw-bold" style={{ color: OUT_COLORS.royalBlue }}>
                      <i
                        className={`me-2 ${isSectionVisible('general', 0) ? 'feather-chevron-down' : 'feather-chevron-right'
                          }`}
                      />
                      General
                    </h6>
                    <span className="badge bg-white text-secondary border">Section 1 of 8</span>
                  </div>

                  {isSectionVisible('general', 0) && (
                    <div className="p-3 bg-white">
                      <div className="row g-3">
                        <div className="col-md-7">
                          <label className="form-label fw-semibold">
                            Course full name <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="e.g. Bachelor of Science in ICT — Artificial Intelligence & Machine Learning"
                            value={fullname}
                            onChange={(e) => setFullname(e.target.value)}
                            required
                          />
                        </div>

                        <div className="col-md-5">
                          <label className="form-label fw-semibold">
                            Course short name <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="e.g. OIT-312"
                            value={shortname}
                            onChange={(e) => setShortname(e.target.value)}
                            required
                          />
                        </div>

                        {/* Course category with Moodle Selected Items pill */}
                        <div className="col-md-8">
                          <label className="form-label fw-semibold">
                            Course category <span className="text-danger">*</span>
                          </label>
                          <div className="mb-2 d-flex align-items-center gap-2 flex-wrap">
                            <span className="small text-muted">Selected items:</span>
                            <span
                              className="badge d-inline-flex align-items-center gap-1 px-2 py-1"
                              style={{ background: OUT_COLORS.royalBlue, color: '#fff', fontSize: '0.8rem' }}
                            >
                              × {selectedCategoryObj.full_path_name || selectedCategoryObj.name}
                            </span>
                          </div>
                          <select
                            className="form-select"
                            value={categoryId}
                            onChange={(e) => setCategoryId(Number(e.target.value))}
                          >
                            {categories.map((cat) => (
                              <option key={cat.id} value={cat.id}>
                                {cat.full_path_name || cat.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Course visibility */}
                        <div className="col-md-4">
                          <label className="form-label fw-semibold">Course visibility</label>
                          <select
                            className="form-select"
                            value={visible}
                            onChange={(e) => setVisible(Number(e.target.value))}
                          >
                            <option value={1}>Show</option>
                            <option value={0}>Hide</option>
                          </select>
                        </div>

                        {/* Course start date (Day / Month / Year / Hour / Minute) */}
                        <div className="col-12">
                          <label className="form-label fw-semibold mb-1">Course start date</label>
                          <div className="d-flex align-items-center flex-wrap gap-2">
                            <div>
                              <span className="small text-muted d-block">Day</span>
                              <select
                                className="form-select form-select-sm"
                                value={startDateParts.day}
                                onChange={(e) =>
                                  setStartDateParts({ ...startDateParts, day: Number(e.target.value) })
                                }
                              >
                                {DAYS.map((d) => (
                                  <option key={d} value={d}>
                                    {d}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <span className="small text-muted d-block">Month</span>
                              <select
                                className="form-select form-select-sm"
                                value={startDateParts.month}
                                onChange={(e) =>
                                  setStartDateParts({ ...startDateParts, month: Number(e.target.value) })
                                }
                              >
                                {MONTHS.map((m, idx) => (
                                  <option key={m} value={idx}>
                                    {m}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <span className="small text-muted d-block">Year</span>
                              <select
                                className="form-select form-select-sm"
                                value={startDateParts.year}
                                onChange={(e) =>
                                  setStartDateParts({ ...startDateParts, year: Number(e.target.value) })
                                }
                              >
                                {YEARS.map((y) => (
                                  <option key={y} value={y}>
                                    {y}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <span className="small text-muted d-block">Hour</span>
                              <select
                                className="form-select form-select-sm"
                                value={startDateParts.hour}
                                onChange={(e) =>
                                  setStartDateParts({ ...startDateParts, hour: e.target.value })
                                }
                              >
                                {HOURS.map((h) => (
                                  <option key={h} value={h}>
                                    {h}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <span className="small text-muted d-block">Minute</span>
                              <select
                                className="form-select form-select-sm"
                                value={startDateParts.minute}
                                onChange={(e) =>
                                  setStartDateParts({ ...startDateParts, minute: e.target.value })
                                }
                              >
                                {MINUTES.map((m) => (
                                  <option key={m} value={m}>
                                    {m}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* Course end date (Enable checkbox + Day / Month / Year / Hour / Minute) */}
                        <div className="col-12">
                          <div className="d-flex align-items-center gap-3 mb-1">
                            <label className="form-label fw-semibold mb-0">Course end date</label>
                            <div className="form-check mb-0">
                              <input
                                type="checkbox"
                                className="form-check-input"
                                id="enableEndDateCheck"
                                checked={endDateEnabled}
                                onChange={(e) => setEndDateEnabled(e.target.checked)}
                              />
                              <label className="form-check-label small fw-semibold" htmlFor="enableEndDateCheck">
                                Enable
                              </label>
                            </div>
                          </div>
                          <div className="d-flex align-items-center flex-wrap gap-2">
                            <div>
                              <span className="small text-muted d-block">Day</span>
                              <select
                                className="form-select form-select-sm"
                                disabled={!endDateEnabled}
                                value={endDateParts.day}
                                onChange={(e) =>
                                  setEndDateParts({ ...endDateParts, day: Number(e.target.value) })
                                }
                              >
                                {DAYS.map((d) => (
                                  <option key={d} value={d}>
                                    {d}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <span className="small text-muted d-block">Month</span>
                              <select
                                className="form-select form-select-sm"
                                disabled={!endDateEnabled}
                                value={endDateParts.month}
                                onChange={(e) =>
                                  setEndDateParts({ ...endDateParts, month: Number(e.target.value) })
                                }
                              >
                                {MONTHS.map((m, idx) => (
                                  <option key={m} value={idx}>
                                    {m}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <span className="small text-muted d-block">Year</span>
                              <select
                                className="form-select form-select-sm"
                                disabled={!endDateEnabled}
                                value={endDateParts.year}
                                onChange={(e) =>
                                  setEndDateParts({ ...endDateParts, year: Number(e.target.value) })
                                }
                              >
                                {YEARS.map((y) => (
                                  <option key={y} value={y}>
                                    {y}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <span className="small text-muted d-block">Hour</span>
                              <select
                                className="form-select form-select-sm"
                                disabled={!endDateEnabled}
                                value={endDateParts.hour}
                                onChange={(e) =>
                                  setEndDateParts({ ...endDateParts, hour: e.target.value })
                                }
                              >
                                {HOURS.map((h) => (
                                  <option key={h} value={h}>
                                    {h}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <span className="small text-muted d-block">Minute</span>
                              <select
                                className="form-select form-select-sm"
                                disabled={!endDateEnabled}
                                value={endDateParts.minute}
                                onChange={(e) =>
                                  setEndDateParts({ ...endDateParts, minute: e.target.value })
                                }
                              >
                                {MINUTES.map((m) => (
                                  <option key={m} value={m}>
                                    {m}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* Course ID number */}
                        <div className="col-md-6">
                          <label className="form-label fw-semibold">Course ID number</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Optional SARIS / TCU course ID number"
                            value={idnumber}
                            onChange={(e) => setIdnumber(e.target.value)}
                          />
                        </div>

                        {/* Tuition Fee (TZS) */}
                        <div className="col-md-6">
                          <label className="form-label fw-semibold">Tuition Fee (TZS — GePG / SARIS Billing)</label>
                          <div className="input-group">
                            <span className="input-group-text fw-semibold">TZS</span>
                            <input
                              type="number"
                              min={0}
                              step={5000}
                              className="form-control"
                              placeholder="150000"
                              value={tuitionFee}
                              onChange={(e) => setTuitionFee(Number(e.target.value))}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* ==========================================================
                    SECTION 2: DESCRIPTION (Course summary Rich-Text + Course image)
                   ========================================================== */}
                <div className="mb-3 border rounded-3 overflow-hidden">
                  <div
                    className="d-flex justify-content-between align-items-center px-3 py-2"
                    style={{ background: OUT_COLORS.surfaceLight, cursor: 'pointer' }}
                    onClick={() => !wizardStepMode && toggleSection('description')}
                  >
                    <h6 className="mb-0 fw-bold" style={{ color: OUT_COLORS.royalBlue }}>
                      <i
                        className={`me-2 ${isSectionVisible('description', 1) ? 'feather-chevron-down' : 'feather-chevron-right'
                          }`}
                      />
                      Description
                    </h6>
                    <span className="badge bg-white text-secondary border">Section 2 of 9</span>
                  </div>

                  {isSectionVisible('description', 1) && (
                    <div className="p-3 bg-white">
                      <RichTextBlock
                        label="Course summary"
                        value={summary}
                        onChange={setSummary}
                        placeholder="Enter course syllabus overview, learning objectives, and target competencies..."
                      />

                      {/* Course image drag and drop zone */}
                      <div className="mt-3">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <label className="form-label fw-semibold mb-0">Course image</label>
                          <span className="small text-muted">
                            Maximum file size: Unlimited, maximum number of files: 1
                          </span>
                        </div>
                        <div
                          className="border rounded-3 p-4 text-center"
                          style={{
                            borderStyle: 'dashed',
                            borderWidth: 2,
                            borderColor: OUT_COLORS.cyanBlue,
                            background: '#FAFCFF',
                          }}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => {
                            e.preventDefault();
                            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                              handleImageFileSelect(e.dataTransfer.files[0]);
                            }
                          }}
                        >
                          {courseImagePreview ? (
                            <div className="d-flex flex-column align-items-center gap-2">
                              <img
                                src={courseImagePreview}
                                alt="Course cover preview"
                                style={{ maxHeight: 150, borderRadius: 8, objectFit: 'cover' }}
                              />
                              <div className="small fw-semibold text-primary">
                                {courseImageName || 'Selected course image'}
                              </div>
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => {
                                  setCourseImagePreview('');
                                  setCourseImageName('');
                                }}
                              >
                                Remove image
                              </button>
                            </div>
                          ) : (
                            <>
                              <i
                                className="feather-upload-cloud d-block mb-2"
                                style={{ fontSize: 32, color: OUT_COLORS.royalBlue }}
                              />
                              <p className="mb-2 fw-semibold text-dark">
                                You can drag and drop files here to add them.
                              </p>
                              <label className="btn btn-sm btn-primary mb-2">
                                Choose File
                                <input
                                  type="file"
                                  accept=".gif,.jpe,.jpeg,.jpg,.png,.svg,.svgz,.webp"
                                  className="d-none"
                                  onChange={(e) =>
                                    handleImageFileSelect(e.target.files ? e.target.files[0] : null)
                                  }
                                />
                              </label>
                              <div className="small text-muted">
                                Accepted file types: Image files to be optimised, such as badges{' '}
                                <code>.gif .jpe .jpeg .jpg .png .svg .svgz .webp</code>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* ==========================================================
                    SECTION 3: COURSE FORMAT (All 10 Formats + Student/Teacher Instructions Rich-Text)
                   ========================================================== */}
                <div className="mb-3 border rounded-3 overflow-hidden">
                  <div
                    className="d-flex justify-content-between align-items-center px-3 py-2"
                    style={{ background: OUT_COLORS.surfaceLight, cursor: 'pointer' }}
                    onClick={() => !wizardStepMode && toggleSection('format')}
                  >
                    <h6 className="mb-0 fw-bold" style={{ color: OUT_COLORS.royalBlue }}>
                      <i
                        className={`me-2 ${isSectionVisible('format', 2) ? 'feather-chevron-down' : 'feather-chevron-right'
                          }`}
                      />
                      Course format
                    </h6>
                    <span className="badge bg-white text-secondary border">Section 3 of 9</span>
                  </div>

                  {isSectionVisible('format', 2) && (
                    <div className="p-3 bg-white">
                      <div className="row g-3 mb-3">
                        <div className="col-md-6">
                          <label className="form-label fw-semibold">Format</label>
                          <select
                            className="form-select"
                            value={format}
                            onChange={(e) => setFormat(e.target.value)}
                          >
                            {COURSE_FORMATS.map((f) => (
                              <option key={f.value} value={f.value}>
                                {f.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="col-md-3">
                          <label className="form-label fw-semibold">Templates view</label>
                          <select
                            className="form-select"
                            value={templatesView}
                            onChange={(e) => setTemplatesView(e.target.value as 'tile' | 'list')}
                          >
                            <option value="tile">Tile</option>
                            <option value="list">List</option>
                          </select>
                          <div className="form-text">
                            Display Kickstart templates in tile or list view.
                          </div>
                        </div>

                        <div className="col-md-3">
                          <label className="form-label fw-semibold">Number of sections</label>
                          <input
                            type="number"
                            min={1}
                            max={52}
                            className="form-control"
                            value={numSections}
                            onChange={(e) => setNumSections(Number(e.target.value))}
                          />
                        </div>
                      </div>

                      {/* Course template selector cards */}
                      <div className="mb-3 p-3 rounded-3" style={{ background: OUT_COLORS.surfaceLight }}>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <label className="form-label fw-bold mb-0" style={{ color: OUT_COLORS.royalBlue }}>
                            Course template (Kickstart Blueprints)
                          </label>
                          <span className="small text-primary fw-semibold">
                            View mode: {templatesView === 'tile' ? 'Tile Grid' : 'Compact List'}
                          </span>
                        </div>
                        <div className="row g-2">
                          {(kickstartTemplates.length > 0
                            ? kickstartTemplates
                            : [
                              { id: 1, title: 'Undergraduate Degree Programme (8 Units)', badge: '8 Units' },
                              { id: 2, title: 'Postgraduate & Masters Seminar (6 Gates)', badge: '6 Gates' },
                              { id: 3, title: 'Short Course & CPD Micro-Credential (4 Sprints)', badge: '4 Sprints' },
                              { id: 4, title: 'STEM & Coding Lab Course (VPL & CodeRunner)', badge: '6 Labs' },
                            ]
                          ).map((tpl: any) => {
                            const selected = Number(kickstartTemplateId) === Number(tpl.id);
                            return (
                              <div
                                key={tpl.id}
                                className={templatesView === 'tile' ? 'col-md-6' : 'col-12'}
                              >
                                <div
                                  onClick={() => setKickstartTemplateId(Number(tpl.id))}
                                  className="p-2 rounded-3 bg-white d-flex justify-content-between align-items-center"
                                  style={{
                                    cursor: 'pointer',
                                    border: selected
                                      ? `2px solid ${OUT_COLORS.royalBlue}`
                                      : `1px solid ${OUT_COLORS.borderSoft}`,
                                  }}
                                >
                                  <div>
                                    <div className="fw-bold small text-dark">{tpl.title}</div>
                                    {tpl.description && (
                                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                                        {tpl.description.slice(0, 95)}...
                                      </div>
                                    )}
                                  </div>
                                  <span
                                    className="badge ms-2"
                                    style={{
                                      background: selected ? OUT_COLORS.royalBlue : '#e2e8f0',
                                      color: selected ? '#fff' : '#334155',
                                    }}
                                  >
                                    {selected ? 'Selected' : tpl.badge || 'Select'}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Student instructions Rich-Text block */}
                      <RichTextBlock
                        label="Student instructions"
                        value={studentInstructions}
                        onChange={setStudentInstructions}
                        minHeight={110}
                        helpText="Content displayed to students before a template is chosen."
                      />

                      {/* Teacher instructions Rich-Text block */}
                      <RichTextBlock
                        label="Teacher instructions"
                        value={teacherInstructions}
                        onChange={setTeacherInstructions}
                        minHeight={110}
                        helpText="Content displayed to teachers before a template is chosen."
                      />

                      <div className="row g-3 mt-1">
                        <div className="col-md-6">
                          <label className="form-label fw-semibold">Hidden sections</label>
                          <select
                            className="form-select"
                            value={hiddenSections}
                            onChange={(e) => setHiddenSections(Number(e.target.value))}
                          >
                            <option value={1}>Hidden sections are completely invisible</option>
                            <option value={0}>Hidden sections are shown as not available</option>
                          </select>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-semibold">Course layout</label>
                          <select
                            className="form-select"
                            value={courseDisplay}
                            onChange={(e) => setCourseDisplay(Number(e.target.value))}
                          >
                            <option value={0}>Show all sections on one page</option>
                            <option value={1}>Show one section per page</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* ==========================================================
                    SECTION 4: CURRICULUM & COURSE CONTENTS (Sections, Lessons, Quizzes, Assignments & Labs)
                   ========================================================== */}
                <div className="mb-3 border rounded-3 overflow-hidden">
                  <div
                    className="d-flex justify-content-between align-items-center px-3 py-2"
                    style={{ background: OUT_COLORS.surfaceLight, cursor: 'pointer' }}
                    onClick={() => !wizardStepMode && toggleSection('curriculum')}
                  >
                    <h6 className="mb-0 fw-bold" style={{ color: OUT_COLORS.royalBlue }}>
                      <i
                        className={`me-2 ${isSectionVisible('curriculum', 3) ? 'feather-chevron-down' : 'feather-chevron-right'
                          }`}
                      />
                      Curriculum & Course Contents (Sections, Lectures, Quizzes, Assignments & Labs)
                    </h6>
                    <div className="d-flex align-items-center gap-2">
                      {editingCourseId && (
                        <span
                          className="badge"
                          style={{ background: OUT_COLORS.royalBlue, color: '#fff' }}
                        >
                          {courseSections.length} Sections Loaded
                        </span>
                      )}
                      <span className="badge bg-white text-secondary border">Section 4 of 9</span>
                    </div>
                  </div>

                  {isSectionVisible('curriculum', 3) && (
                    <div className="p-3 bg-white">
                      {!editingCourseId ? (
                        <div
                          className="p-4 rounded-3 border text-center"
                          style={{ background: '#F8FAFC', borderColor: OUT_COLORS.borderSoft }}
                        >
                          <i
                            className="feather-layers d-block mb-2"
                            style={{ fontSize: 30, color: OUT_COLORS.royalBlue }}
                          />
                          <h6 className="fw-bold text-dark mb-1">
                            Initial {numSections} Sections & Kickstart Blueprint Will Be Provisioned on Save
                          </h6>
                          <p className="text-muted small mb-2">
                            Click <strong>Save and display</strong> below to create the course in Moodle first, or pick an existing course (such as <strong>[CS101] Data Structures & Algorithms in Python</strong>) from the <strong>Target Course</strong> selector at the top to edit its sections, lecture notes, quizzes, assignments, and coding labs right now.
                          </p>
                        </div>
                      ) : (
                        <>
                          {/* Top Curriculum Toolbar */}
                          <div
                            className="d-flex justify-content-between align-items-center flex-wrap gap-2 p-3 rounded-3 mb-3 border"
                            style={{ background: OUT_COLORS.surfaceLight }}
                          >
                            <div>
                              <div className="fw-bold" style={{ color: OUT_COLORS.royalBlue }}>
                                Live Curriculum Builder — {shortname ? `[${shortname}] ` : ''}
                                {fullname}
                              </div>
                              <div className="small text-muted">
                                Edit section summaries, add or edit Rich-Text lecture notes, quizzes, assignments, VPL coding labs, and SARIS QR attendance directly via REST API.
                              </div>
                            </div>
                            <div className="d-flex gap-2 flex-wrap">
                              <button
                                type="button"
                                className="btn btn-sm text-white fw-semibold"
                                style={{ background: OUT_COLORS.royalBlue }}
                                onClick={() => setNewSecOpen(!newSecOpen)}
                              >
                                <i className="feather-plus-circle me-1" />
                                + Add New Section / Unit
                              </button>
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-primary fw-semibold"
                                onClick={async () => {
                                  if (!editingCourseId) return;
                                  setSubmitting(true);
                                  try {
                                    const res = await adminService.importKickstartTemplate(
                                      editingCourseId,
                                      kickstartTemplateId
                                    );
                                    await loadCourseIntoWizard(editingCourseId);
                                    setFeedback({
                                      type: 'success',
                                      text: res.message || 'Kickstart template sections provisioned into course!',
                                    });
                                  } catch (err: any) {
                                    setFeedback({
                                      type: 'danger',
                                      text: err?.message || 'Failed to apply Kickstart template.',
                                    });
                                  } finally {
                                    setSubmitting(false);
                                  }
                                }}
                              >
                                <i className="feather-zap me-1" />
                                Apply Kickstart Blueprint (#{kickstartTemplateId})
                              </button>
                            </div>
                          </div>

                          {/* Collapsible Form to Add a New Section */}
                          {newSecOpen && (
                            <div
                              className="p-3 mb-3 rounded-3 border"
                              style={{ background: '#F8FAFC', borderColor: OUT_COLORS.royalBlue }}
                            >
                              <h6 className="fw-bold mb-2" style={{ color: OUT_COLORS.royalBlue }}>
                                Add New Course Section / Unit
                              </h6>
                              <div className="mb-2">
                                <label className="form-label small fw-semibold">Section / Unit Title</label>
                                <input
                                  type="text"
                                  className="form-control form-control-sm"
                                  placeholder="e.g. Unit 9: Graph Algorithms & Dynamic Programming"
                                  value={newSecName}
                                  onChange={(e) => setNewSecName(e.target.value)}
                                />
                              </div>
                              <RichTextBlock
                                label="Section Summary & Learning Objectives"
                                value={newSecSummary}
                                onChange={setNewSecSummary}
                                minHeight={95}
                              />
                              <div className="d-flex gap-2 mt-2">
                                <button
                                  type="button"
                                  className="btn btn-sm btn-primary"
                                  disabled={submitting}
                                  onClick={async () => {
                                    if (!editingCourseId || !newSecName.trim()) return;
                                    setSubmitting(true);
                                    try {
                                      await adminService.manageCourseSection({
                                        course_id: editingCourseId,
                                        sec_action: 'create',
                                        name: newSecName.trim(),
                                        summary: newSecSummary,
                                      });
                                      setNewSecName('');
                                      setNewSecSummary('');
                                      setNewSecOpen(false);
                                      await loadCourseIntoWizard(editingCourseId);
                                      setFeedback({
                                        type: 'success',
                                        text: `Section "${newSecName}" added to ${shortname}.`,
                                      });
                                    } catch (err: any) {
                                      setFeedback({
                                        type: 'danger',
                                        text: err?.message || 'Failed to add section.',
                                      });
                                    } finally {
                                      setSubmitting(false);
                                    }
                                  }}
                                >
                                  Save New Section
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-secondary"
                                  onClick={() => setNewSecOpen(false)}
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Render Each Course Section & Its Modules */}
                          <div className="d-flex flex-column gap-3">
                            {courseSections.map((sec: any) => {
                              const secNum = Number(sec.section);
                              const isEditingThisSec = editingSecNum === secNum;
                              const isAddingActHere = addActSecNum === secNum;
                              const modulesList = Array.isArray(sec.modules) ? sec.modules : [];

                              return (
                                <div
                                  key={sec.id || secNum}
                                  className="border rounded-3 overflow-hidden"
                                  style={{ borderColor: OUT_COLORS.borderSoft }}
                                >
                                  {/* Section Header Bar */}
                                  <div
                                    className="d-flex justify-content-between align-items-center flex-wrap gap-2 px-3 py-2 border-bottom"
                                    style={{ background: '#F8FAFC' }}
                                  >
                                    <div className="d-flex align-items-center gap-2">
                                      <span
                                        className="badge"
                                        style={{ background: OUT_COLORS.royalBlue, color: '#fff' }}
                                      >
                                        Section {secNum}
                                      </span>
                                      <span className="fw-bold text-dark">
                                        {sec.name || `Unit ${secNum}`}
                                      </span>
                                      {Number(sec.visible ?? 1) === 0 && (
                                        <span className="badge bg-warning text-dark">Hidden from students</span>
                                      )}
                                      <span className="badge bg-light text-secondary border">
                                        {modulesList.length} {modulesList.length === 1 ? 'Activity' : 'Activities'}
                                      </span>
                                    </div>

                                    <div className="d-flex align-items-center gap-1 flex-wrap">
                                      <button
                                        type="button"
                                        className="btn btn-sm btn-outline-primary py-0 px-2"
                                        onClick={() => {
                                          if (isEditingThisSec) {
                                            setEditingSecNum(null);
                                          } else {
                                            setEditingSecNum(secNum);
                                            setEditSecName(sec.name || `Unit ${secNum}`);
                                            setEditSecSummary(sec.summary || '');
                                          }
                                        }}
                                      >
                                        <i className="feather-edit-2 me-1" />
                                        Edit Section
                                      </button>

                                      <button
                                        type="button"
                                        className="btn btn-sm text-white py-0 px-2"
                                        style={{ background: OUT_COLORS.cyanBlue }}
                                        onClick={() => {
                                          if (isAddingActHere) {
                                            setAddActSecNum(null);
                                          } else {
                                            setAddActSecNum(secNum);
                                            setNewActType('page');
                                            setNewActName('');
                                            setNewActContent(
                                              '<h4>Lecture Overview & Learning Objectives</h4><p>Write detailed course lecture notes, code examples, or instructions here...</p>'
                                            );
                                          }
                                        }}
                                      >
                                        <i className="feather-plus me-1" />
                                        + Add Activity / Content
                                      </button>

                                      {secNum > 0 && (
                                        <button
                                          type="button"
                                          className="btn btn-sm btn-outline-danger py-0 px-2"
                                          onClick={async () => {
                                            if (!editingCourseId) return;
                                            setSubmitting(true);
                                            try {
                                              await adminService.manageCourseSection({
                                                course_id: editingCourseId,
                                                sec_action: 'delete',
                                                section: secNum,
                                              });
                                              await loadCourseIntoWizard(editingCourseId);
                                              setFeedback({
                                                type: 'success',
                                                text: `Section ${secNum} removed.`,
                                              });
                                            } catch (err: any) {
                                              setFeedback({
                                                type: 'danger',
                                                text: err?.message || 'Failed to delete section.',
                                              });
                                            } finally {
                                              setSubmitting(false);
                                            }
                                          }}
                                        >
                                          <i className="feather-trash-2" />
                                        </button>
                                      )}
                                    </div>
                                  </div>

                                  {/* Section Summary Preview */}
                                  {sec.summary && !isEditingThisSec && (
                                    <div
                                      className="px-3 py-2 small text-secondary border-bottom"
                                      style={{ background: '#FCFDFE' }}
                                      dangerouslySetInnerHTML={{ __html: sec.summary }}
                                    />
                                  )}

                                  {/* Inline Section Title & Rich-Text Summary Editor */}
                                  {isEditingThisSec && (
                                    <div
                                      className="p-3 border-bottom"
                                      style={{ background: OUT_COLORS.surfaceLight }}
                                    >
                                      <h6 className="fw-bold small mb-2" style={{ color: OUT_COLORS.royalBlue }}>
                                        Edit Section {secNum} Title & Summary
                                      </h6>
                                      <div className="mb-2">
                                        <label className="form-label small fw-semibold">Section Name</label>
                                        <input
                                          type="text"
                                          className="form-control form-control-sm"
                                          value={editSecName}
                                          onChange={(e) => setEditSecName(e.target.value)}
                                        />
                                      </div>
                                      <RichTextBlock
                                        label="Section Summary (HTML / Rich-Text)"
                                        value={editSecSummary}
                                        onChange={setEditSecSummary}
                                        minHeight={95}
                                      />
                                      <div className="d-flex gap-2 mt-2">
                                        <button
                                          type="button"
                                          className="btn btn-sm btn-primary"
                                          disabled={submitting}
                                          onClick={async () => {
                                            if (!editingCourseId) return;
                                            setSubmitting(true);
                                            try {
                                              await adminService.manageCourseSection({
                                                course_id: editingCourseId,
                                                sec_action: 'update',
                                                section: secNum,
                                                name: editSecName,
                                                summary: editSecSummary,
                                              });
                                              setEditingSecNum(null);
                                              await loadCourseIntoWizard(editingCourseId);
                                              setFeedback({
                                                type: 'success',
                                                text: `Section ${secNum} ("${editSecName}") updated.`,
                                              });
                                            } catch (err: any) {
                                              setFeedback({
                                                type: 'danger',
                                                text: err?.message || 'Failed to update section.',
                                              });
                                            } finally {
                                              setSubmitting(false);
                                            }
                                          }}
                                        >
                                          Save Section Changes
                                        </button>
                                        <button
                                          type="button"
                                          className="btn btn-sm btn-outline-secondary"
                                          onClick={() => setEditingSecNum(null)}
                                        >
                                          Cancel
                                        </button>
                                      </div>
                                    </div>
                                  )}

                                  {/* Inline Add New Activity / Module Form */}
                                  {isAddingActHere && (
                                    <div
                                      className="p-3 border-bottom"
                                      style={{ background: '#F0F7FF' }}
                                    >
                                      <h6 className="fw-bold small mb-2" style={{ color: OUT_COLORS.royalBlue }}>
                                        Add Learning Activity or Resource to {sec.name || `Section ${secNum}`}
                                      </h6>
                                      <div className="row g-2 mb-2">
                                        <div className="col-md-4">
                                          <label className="form-label small fw-semibold">Activity Type</label>
                                          <select
                                            className="form-select form-select-sm"
                                            value={newActType}
                                            onChange={(e) => setNewActType(e.target.value as any)}
                                          >
                                            <option value="page">Lecture Notes / Rich-Text Page (mod_page)</option>
                                            <option value="quiz">Interactive Quiz / Assessment (mod_quiz)</option>
                                            <option value="assign">Assignment Deliverable (mod_assign)</option>
                                            <option value="vpl">VPL Cloud Coding Lab (mod_vpl)</option>
                                            <option value="attendance">SARIS QR Attendance Session (mod_attendance)</option>
                                            <option value="resource">Document / Slide Resource (mod_resource)</option>
                                          </select>
                                        </div>
                                        <div className="col-md-8">
                                          <label className="form-label small fw-semibold">Activity Title</label>
                                          <input
                                            type="text"
                                            className="form-control form-control-sm"
                                            placeholder="e.g. Lecture 2.1: Time & Space Complexity (Big-O Notation)"
                                            value={newActName}
                                            onChange={(e) => setNewActName(e.target.value)}
                                          />
                                        </div>
                                      </div>
                                      <RichTextBlock
                                        label="Activity Content / Lecture Body / Instructions (Full HTML Rich-Text)"
                                        value={newActContent}
                                        onChange={setNewActContent}
                                        minHeight={130}
                                      />
                                      <div className="d-flex gap-2 mt-2">
                                        <button
                                          type="button"
                                          className="btn btn-sm btn-primary"
                                          disabled={submitting}
                                          onClick={async () => {
                                            if (!editingCourseId || !newActName.trim()) return;
                                            setSubmitting(true);
                                            try {
                                              await adminService.addActivity({
                                                course_id: editingCourseId,
                                                section: secNum,
                                                mod_type: newActType,
                                                name: newActName.trim(),
                                                content: newActContent,
                                              });
                                              setAddActSecNum(null);
                                              setNewActName('');
                                              await loadCourseIntoWizard(editingCourseId);
                                              setFeedback({
                                                type: 'success',
                                                text: `Activity "${newActName}" added to ${sec.name || `Section ${secNum}`}.`,
                                              });
                                            } catch (err: any) {
                                              setFeedback({
                                                type: 'danger',
                                                text: err?.message || 'Failed to add activity.',
                                              });
                                            } finally {
                                              setSubmitting(false);
                                            }
                                          }}
                                        >
                                          Create Activity in Section {secNum}
                                        </button>
                                        <button
                                          type="button"
                                          className="btn btn-sm btn-outline-secondary"
                                          onClick={() => setAddActSecNum(null)}
                                        >
                                          Cancel
                                        </button>
                                      </div>
                                    </div>
                                  )}

                                  {/* Module List inside Section */}
                                  <div className="p-2 bg-white">
                                    {modulesList.length === 0 ? (
                                      <div className="text-muted small fst-italic px-2 py-1">
                                        No activities in this section yet. Click <strong>+ Add Activity / Content</strong> to add lecture notes, quizzes, or coding labs.
                                      </div>
                                    ) : (
                                      <div className="d-flex flex-column gap-2">
                                        {modulesList.map((mod: any) => {
                                          const cmId = Number(mod.id);
                                          const isEditingThisMod = editActCmId === cmId;
                                          return (
                                            <div
                                              key={cmId}
                                              className="border rounded-2 p-2"
                                              style={{
                                                background: isEditingThisMod ? '#F8FAFC' : '#FFFFFF',
                                                borderColor: isEditingThisMod
                                                  ? OUT_COLORS.royalBlue
                                                  : OUT_COLORS.borderSoft,
                                              }}
                                            >
                                              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                                                <div className="d-flex align-items-center gap-2">
                                                  <span
                                                    className="badge text-uppercase"
                                                    style={{
                                                      background:
                                                        mod.modname === 'quiz'
                                                          ? '#013BA6'
                                                          : mod.modname === 'vpl'
                                                            ? '#1A1A1A'
                                                            : mod.modname === 'assign'
                                                              ? '#1D80DF'
                                                              : '#E2E8F0',
                                                      color:
                                                        ['quiz', 'vpl', 'assign'].includes(mod.modname)
                                                          ? '#fff'
                                                          : '#1E293B',
                                                      fontSize: '0.7rem',
                                                    }}
                                                  >
                                                    {mod.modname}
                                                  </span>
                                                  <span className="fw-semibold text-dark small">
                                                    {mod.name}
                                                  </span>
                                                  {Number(mod.visible ?? 1) === 0 && (
                                                    <span className="badge bg-warning text-dark" style={{ fontSize: '0.68rem' }}>
                                                      Hidden
                                                    </span>
                                                  )}
                                                </div>

                                                <div className="d-flex align-items-center gap-1">
                                                  <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-primary py-0 px-2"
                                                    style={{ fontSize: '0.75rem' }}
                                                    onClick={() => {
                                                      if (isEditingThisMod) {
                                                        setEditActCmId(null);
                                                      } else {
                                                        setEditActCmId(cmId);
                                                        setEditActName(mod.name || '');
                                                        setEditActContent(mod.content || '');
                                                        setEditActVisible(Number(mod.visible ?? 1));
                                                      }
                                                    }}
                                                  >
                                                    <i className="feather-edit me-1" />
                                                    {isEditingThisMod ? 'Close Editor' : 'Edit Content'}
                                                  </button>

                                                  <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-danger py-0 px-2"
                                                    style={{ fontSize: '0.75rem' }}
                                                    onClick={async () => {
                                                      if (!editingCourseId) return;
                                                      setSubmitting(true);
                                                      try {
                                                        await adminService.deleteActivity(cmId);
                                                        await loadCourseIntoWizard(editingCourseId);
                                                        setFeedback({
                                                          type: 'success',
                                                          text: `Activity "${mod.name}" deleted.`,
                                                        });
                                                      } catch (err: any) {
                                                        setFeedback({
                                                          type: 'danger',
                                                          text: err?.message || 'Failed to delete activity.',
                                                        });
                                                      } finally {
                                                        setSubmitting(false);
                                                      }
                                                    }}
                                                  >
                                                    <i className="feather-trash-2" />
                                                  </button>
                                                </div>
                                              </div>

                                              {/* Inline Activity Content Editor */}
                                              {isEditingThisMod && (
                                                <div className="mt-2 pt-2 border-top">
                                                  <div className="row g-2 mb-2">
                                                    <div className="col-md-9">
                                                      <label className="form-label small fw-semibold mb-1">
                                                        Activity Title
                                                      </label>
                                                      <input
                                                        type="text"
                                                        className="form-control form-control-sm"
                                                        value={editActName}
                                                        onChange={(e) => setEditActName(e.target.value)}
                                                      />
                                                    </div>
                                                    <div className="col-md-3">
                                                      <label className="form-label small fw-semibold mb-1">
                                                        Visibility
                                                      </label>
                                                      <select
                                                        className="form-select form-select-sm"
                                                        value={editActVisible}
                                                        onChange={(e) => setEditActVisible(Number(e.target.value))}
                                                      >
                                                        <option value={1}>Show to students</option>
                                                        <option value={0}>Hide from students</option>
                                                      </select>
                                                    </div>
                                                  </div>

                                                  <RichTextBlock
                                                    label={`Edit ${mod.modname.toUpperCase()} Content / Instructions (HTML Rich-Text)`}
                                                    value={editActContent}
                                                    onChange={setEditActContent}
                                                    minHeight={140}
                                                  />

                                                  <div className="d-flex gap-2 mt-2">
                                                    <button
                                                      type="button"
                                                      className="btn btn-sm btn-primary"
                                                      disabled={submitting}
                                                      onClick={async () => {
                                                        if (!editingCourseId) return;
                                                        setSubmitting(true);
                                                        try {
                                                          await adminService.updateActivity({
                                                            cm_id: cmId,
                                                            name: editActName,
                                                            content: editActContent,
                                                            visible: editActVisible,
                                                          });
                                                          setEditActCmId(null);
                                                          await loadCourseIntoWizard(editingCourseId);
                                                          setFeedback({
                                                            type: 'success',
                                                            text: `Activity "${editActName}" content saved to Moodle.`,
                                                          });
                                                        } catch (err: any) {
                                                          setFeedback({
                                                            type: 'danger',
                                                            text: err?.message || 'Failed to update activity.',
                                                          });
                                                        } finally {
                                                          setSubmitting(false);
                                                        }
                                                      }}
                                                    >
                                                      Save Activity Content
                                                    </button>
                                                    <button
                                                      type="button"
                                                      className="btn btn-sm btn-outline-secondary"
                                                      onClick={() => setEditActCmId(null)}
                                                    >
                                                      Cancel
                                                    </button>
                                                  </div>
                                                </div>
                                              )}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* ==========================================================
                    SECTION 5: APPEARANCE
                   ========================================================== */}
                <div className="mb-3 border rounded-3 overflow-hidden">
                  <div
                    className="d-flex justify-content-between align-items-center px-3 py-2"
                    style={{ background: OUT_COLORS.surfaceLight, cursor: 'pointer' }}
                    onClick={() => !wizardStepMode && toggleSection('appearance')}
                  >
                    <h6 className="mb-0 fw-bold" style={{ color: OUT_COLORS.royalBlue }}>
                      <i
                        className={`me-2 ${isSectionVisible('appearance', 4) ? 'feather-chevron-down' : 'feather-chevron-right'
                          }`}
                      />
                      Appearance
                    </h6>
                    <span className="badge bg-white text-secondary border">Section 5 of 9</span>
                  </div>

                  {isSectionVisible('appearance', 4) && (
                    <div className="p-3 bg-white">
                      <div className="row g-3">
                        <div className="col-md-4">
                          <label className="form-label fw-semibold">Force language</label>
                          <select
                            className="form-select"
                            value={lang}
                            onChange={(e) => setLang(e.target.value)}
                          >
                            <option value="">Do not force</option>
                            <option value="en">English ‎(en)‎</option>
                            <option value="sw">Kiswahili ‎(sw)‎</option>
                          </select>
                        </div>
                        <div className="col-md-4">
                          <label className="form-label fw-semibold">Number of announcements</label>
                          <select
                            className="form-select"
                            value={newsitems}
                            onChange={(e) => setNewsitems(Number(e.target.value))}
                          >
                            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                              <option key={n} value={n}>
                                {n}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="col-md-4">
                          <label className="form-label fw-semibold">Show gradebook to students</label>
                          <select
                            className="form-select"
                            value={showgrades}
                            onChange={(e) => setShowgrades(Number(e.target.value))}
                          >
                            <option value={1}>Yes</option>
                            <option value={0}>No</option>
                          </select>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-semibold">Show activity reports</label>
                          <select
                            className="form-select"
                            value={showreports}
                            onChange={(e) => setShowreports(Number(e.target.value))}
                          >
                            <option value={0}>No</option>
                            <option value={1}>Yes</option>
                          </select>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-semibold">Show activity dates</label>
                          <select
                            className="form-select"
                            value={showactivitydates}
                            onChange={(e) => setShowactivitydates(Number(e.target.value))}
                          >
                            <option value={1}>Yes</option>
                            <option value={0}>No</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* ==========================================================
                    SECTION 6: FILES AND UPLOADS
                   ========================================================== */}
                <div className="mb-3 border rounded-3 overflow-hidden">
                  <div
                    className="d-flex justify-content-between align-items-center px-3 py-2"
                    style={{ background: OUT_COLORS.surfaceLight, cursor: 'pointer' }}
                    onClick={() => !wizardStepMode && toggleSection('files')}
                  >
                    <h6 className="mb-0 fw-bold" style={{ color: OUT_COLORS.royalBlue }}>
                      <i
                        className={`me-2 ${isSectionVisible('files', 5) ? 'feather-chevron-down' : 'feather-chevron-right'
                          }`}
                      />
                      Files and uploads
                    </h6>
                    <span className="badge bg-white text-secondary border">Section 6 of 9</span>
                  </div>

                  {isSectionVisible('files', 5) && (
                    <div className="p-3 bg-white">
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Maximum upload size</label>
                        <select
                          className="form-select"
                          value={maxbytes}
                          onChange={(e) => setMaxbytes(Number(e.target.value))}
                        >
                          {MAX_UPLOAD_SIZES.map((s) => (
                            <option key={s.value} value={s.value}>
                              {s.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                {/* ==========================================================
                    SECTION 7: COMPLETION TRACKING
                   ========================================================== */}
                <div className="mb-3 border rounded-3 overflow-hidden">
                  <div
                    className="d-flex justify-content-between align-items-center px-3 py-2"
                    style={{ background: OUT_COLORS.surfaceLight, cursor: 'pointer' }}
                    onClick={() => !wizardStepMode && toggleSection('completion')}
                  >
                    <h6 className="mb-0 fw-bold" style={{ color: OUT_COLORS.royalBlue }}>
                      <i
                        className={`me-2 ${isSectionVisible('completion', 6) ? 'feather-chevron-down' : 'feather-chevron-right'
                          }`}
                      />
                      Completion tracking
                    </h6>
                    <span className="badge bg-white text-secondary border">Section 7 of 9</span>
                  </div>

                  {isSectionVisible('completion', 6) && (
                    <div className="p-3 bg-white">
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="form-label fw-semibold">Enable completion tracking</label>
                          <select
                            className="form-select"
                            value={enablecompletion}
                            onChange={(e) => setEnablecompletion(Number(e.target.value))}
                          >
                            <option value={1}>Yes</option>
                            <option value={0}>No</option>
                          </select>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-semibold">Show activity completion conditions</label>
                          <select
                            className="form-select"
                            value={showcompletionconditions}
                            onChange={(e) => setShowcompletionconditions(Number(e.target.value))}
                          >
                            <option value={1}>Yes</option>
                            <option value={0}>No</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* ==========================================================
                    SECTION 8: GROUPS
                   ========================================================== */}
                <div className="mb-3 border rounded-3 overflow-hidden">
                  <div
                    className="d-flex justify-content-between align-items-center px-3 py-2"
                    style={{ background: OUT_COLORS.surfaceLight, cursor: 'pointer' }}
                    onClick={() => !wizardStepMode && toggleSection('groups')}
                  >
                    <h6 className="mb-0 fw-bold" style={{ color: OUT_COLORS.royalBlue }}>
                      <i
                        className={`me-2 ${isSectionVisible('groups', 7) ? 'feather-chevron-down' : 'feather-chevron-right'
                          }`}
                      />
                      Groups
                    </h6>
                    <span className="badge bg-white text-secondary border">Section 8 of 9</span>
                  </div>

                  {isSectionVisible('groups', 7) && (
                    <div className="p-3 bg-white">
                      <div className="row g-3">
                        <div className="col-md-4">
                          <label className="form-label fw-semibold">Group mode</label>
                          <select
                            className="form-select"
                            value={groupmode}
                            onChange={(e) => setGroupmode(Number(e.target.value))}
                          >
                            <option value={0}>No groups</option>
                            <option value={1}>Separate groups</option>
                            <option value={2}>Visible groups</option>
                          </select>
                        </div>
                        <div className="col-md-4">
                          <label className="form-label fw-semibold">Force group mode</label>
                          <select
                            className="form-select"
                            value={groupmodeforce}
                            onChange={(e) => setGroupmodeforce(Number(e.target.value))}
                          >
                            <option value={0}>No</option>
                            <option value={1}>Yes</option>
                          </select>
                        </div>
                        <div className="col-md-4">
                          <label className="form-label fw-semibold">Default grouping</label>
                          <select
                            className="form-select"
                            value={defaultgroupingid}
                            onChange={(e) => setDefaultgroupingid(Number(e.target.value))}
                          >
                            <option value={0}>None</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* ==========================================================
                    SECTION 9: TAGS
                   ========================================================== */}
                <div className="mb-4 border rounded-3 overflow-hidden">
                  <div
                    className="d-flex justify-content-between align-items-center px-3 py-2"
                    style={{ background: OUT_COLORS.surfaceLight, cursor: 'pointer' }}
                    onClick={() => !wizardStepMode && toggleSection('tags')}
                  >
                    <h6 className="mb-0 fw-bold" style={{ color: OUT_COLORS.royalBlue }}>
                      <i
                        className={`me-2 ${isSectionVisible('tags', 8) ? 'feather-chevron-down' : 'feather-chevron-right'
                          }`}
                      />
                      Tags
                    </h6>
                    <span className="badge bg-white text-secondary border">Section 9 of 9</span>
                  </div>

                  {isSectionVisible('tags', 8) && (
                    <div className="p-3 bg-white">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <label className="form-label fw-semibold mb-0">Tags</label>
                        <button
                          type="button"
                          className="btn btn-sm btn-link text-decoration-none p-0"
                          onClick={() => setManageStandardTagsOpen(!manageStandardTagsOpen)}
                        >
                          Manage standard tags
                        </button>
                      </div>

                      <div className="mb-2 d-flex align-items-center flex-wrap gap-1">
                        <span className="small text-muted me-1">Selected items:</span>
                        {selectedTags.length === 0 ? (
                          <span className="small text-muted fst-italic">No Selection</span>
                        ) : (
                          selectedTags.map((tg) => (
                            <span
                              key={tg}
                              className="badge d-inline-flex align-items-center gap-1 px-2 py-1"
                              style={{ background: OUT_COLORS.royalBlue, color: '#fff', cursor: 'pointer' }}
                              onClick={() => setSelectedTags(selectedTags.filter((x) => x !== tg))}
                            >
                              × {tg}
                            </span>
                          ))
                        )}
                      </div>

                      <div className="input-group mb-2">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Enter tags (press Enter or click Add Tag)..."
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && tagInput.trim()) {
                              e.preventDefault();
                              if (!selectedTags.includes(tagInput.trim())) {
                                setSelectedTags([...selectedTags, tagInput.trim()]);
                              }
                              setTagInput('');
                            }
                          }}
                        />
                        <button
                          type="button"
                          className="btn btn-outline-primary"
                          onClick={() => {
                            if (tagInput.trim() && !selectedTags.includes(tagInput.trim())) {
                              setSelectedTags([...selectedTags, tagInput.trim()]);
                              setTagInput('');
                            }
                          }}
                        >
                          Add Tag
                        </button>
                      </div>

                      {/* Standard Tags Quick Selector */}
                      <div className="d-flex flex-wrap gap-1 align-items-center">
                        <span className="small text-muted me-1">Standard tags:</span>
                        {standardTags.map((st) => {
                          const active = selectedTags.includes(st);
                          return (
                            <button
                              key={st}
                              type="button"
                              className={`btn btn-sm py-0 px-2 ${active ? 'btn-primary' : 'btn-outline-secondary'
                                }`}
                              style={{ fontSize: '0.74rem' }}
                              onClick={() =>
                                setSelectedTags(
                                  active ? selectedTags.filter((x) => x !== st) : [...selectedTags, st]
                                )
                              }
                            >
                              {active ? `✓ ${st}` : `+ ${st}`}
                            </button>
                          );
                        })}
                      </div>

                      {manageStandardTagsOpen && (
                        <div className="mt-3 p-3 rounded-3 border" style={{ background: OUT_COLORS.surfaceLight }}>
                          <h6 className="fw-bold small mb-2">Manage Standard Tags</h6>
                          <div className="input-group input-group-sm mb-2">
                            <input
                              type="text"
                              className="form-control"
                              placeholder="New standard tag..."
                              value={newStandardTagInput}
                              onChange={(e) => setNewStandardTagInput(e.target.value)}
                            />
                            <button
                              type="button"
                              className="btn btn-primary"
                              onClick={async () => {
                                if (!newStandardTagInput.trim()) return;
                                const next = Array.from(new Set([...standardTags, newStandardTagInput.trim()]));
                                setStandardTags(next);
                                setNewStandardTagInput('');
                                await adminService.manageStandardTags(next);
                              }}
                            >
                              Save Standard Tag
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Wizard Prev/Next Controls if in Step-by-Step Mode */}
                {wizardStepMode && (
                  <div className="d-flex justify-content-between mb-3">
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-sm"
                      disabled={activeWizardStep === 0}
                      onClick={() => setActiveWizardStep(Math.max(0, activeWizardStep - 1))}
                    >
                      ← Previous Section
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-primary btn-sm"
                      disabled={activeWizardStep === WIZARD_STEPS.length - 1}
                      onClick={() =>
                        setActiveWizardStep(Math.min(WIZARD_STEPS.length - 1, activeWizardStep + 1))
                      }
                    >
                      Next Section →
                    </button>
                  </div>
                )}

                {/* Moodle Official Form Footer Buttons */}
                <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 pt-3 border-top">
                  <div className="small text-muted">
                    <span className="text-danger fw-bold">*</span> Required fields
                  </div>
                  <div className="d-flex align-items-center gap-2 flex-wrap">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn px-4 text-white fw-semibold"
                      style={{ background: OUT_COLORS.royalBlue }}
                    >
                      {submitting ? 'Saving...' : 'Save and display'}
                    </button>
                    <button
                      type="button"
                      disabled={submitting}
                      className="btn btn-outline-primary px-4 fw-semibold"
                      onClick={() => handleSaveCourse(true)}
                    >
                      Save and return
                    </button>
                    <button
                      type="button"
                      className="btn btn-light border px-3"
                      onClick={() => setActiveTab('category_courses')}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* ================================================================
              TAB 2: CATEGORY & COURSES MANAGEMENT (course/index.php & management.php)
             ================================================================ */}
          {activeTab === 'category_courses' && (
            <div className="row g-3">
              {/* Left Column: Course Categories Tree */}
              <div className="col-lg-4">
                <div className="card border-0 shadow-sm p-3 h-100" style={{ borderRadius: 14 }}>
                  <div className="d-flex justify-content-between align-items-center pb-2 mb-3 border-bottom">
                    <h6 className="fw-bold mb-0" style={{ color: OUT_COLORS.royalBlue }}>
                      Course categories ({categories.length})
                    </h6>
                    <button
                      type="button"
                      className="btn btn-sm btn-primary py-1 px-2"
                      onClick={() => {
                        setCatEditMode('create');
                        setCatParentId(categoryId);
                        setCatName('');
                        setCatIdNumber('');
                        setCatDescription('');
                        setActiveTab('category_settings');
                      }}
                    >
                      + Create new category
                    </button>
                  </div>

                  <div className="d-flex flex-column gap-2">
                    {categories.map((cat) => {
                      const isSelected = Number(cat.id) === Number(categoryId);
                      const countInCat = courses.filter((c) => Number(c.category_id) === Number(cat.id)).length;
                      return (
                        <div
                          key={cat.id}
                          onClick={() => setCategoryId(Number(cat.id))}
                          className="p-2 rounded-3 d-flex justify-content-between align-items-center"
                          style={{
                            cursor: 'pointer',
                            background: isSelected ? OUT_COLORS.royalBlue : OUT_COLORS.surfaceLight,
                            color: isSelected ? '#fff' : OUT_COLORS.charcoal,
                            paddingLeft: cat.depth > 1 ? 24 : 12,
                          }}
                        >
                          <div>
                            <div className="fw-semibold small">{cat.name}</div>
                            {cat.idnumber && (
                              <span
                                className="badge"
                                style={{
                                  fontSize: '0.68rem',
                                  background: isSelected ? 'rgba(255,255,255,0.2)' : '#e2e8f0',
                                  color: isSelected ? '#fff' : '#475569',
                                }}
                              >
                                {cat.idnumber}
                              </span>
                            )}
                          </div>
                          <span
                            className="badge rounded-pill"
                            style={{
                              background: isSelected ? OUT_COLORS.yellowGold : '#fff',
                              color: OUT_COLORS.charcoal,
                            }}
                          >
                            {countInCat}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Column: Courses in Selected Category */}
              <div className="col-lg-8">
                <div className="card border-0 shadow-sm p-3 h-100" style={{ borderRadius: 14 }}>
                  <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 pb-2 mb-3 border-bottom">
                    <div>
                      <h6 className="fw-bold mb-0" style={{ color: OUT_COLORS.royalBlue }}>
                        {selectedCategoryObj.full_path_name || selectedCategoryObj.name}
                      </h6>
                      <span className="small text-muted">
                        Manage courses, edit in 8-section wizard, or restore/delete
                      </span>
                    </div>
                    <div className="d-flex gap-2">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => {
                          setCatEditMode('edit');
                          setActiveTab('category_settings');
                        }}
                      >
                        Edit category settings
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm text-white"
                        style={{ background: OUT_COLORS.royalBlue }}
                        onClick={() => {
                          resetWizardToNewCourse();
                          setActiveTab('add_course');
                        }}
                      >
                        + Create new course
                      </button>
                    </div>
                  </div>

                  <div className="table-responsive">
                    <table className="table table-hover align-middle small mb-0">
                      <thead style={{ background: OUT_COLORS.surfaceLight }}>
                        <tr>
                          <th>Code</th>
                          <th>Course Full Name</th>
                          <th>Category</th>
                          <th>Format</th>
                          <th>Status</th>
                          <th className="text-end">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {courses.map((cr) => (
                          <tr
                            key={cr.id}
                            style={{
                              background:
                                Number(cr.category_id) === Number(categoryId) ? '#fff' : '#fafcff',
                            }}
                          >
                            <td>
                              <span className="badge bg-light text-dark border">{cr.shortname}</span>
                            </td>
                            <td>
                              <div className="fw-bold text-dark">{cr.fullname}</div>
                              <div className="text-muted" style={{ fontSize: '0.73rem' }}>
                                {cr.sections_count} sections • {cr.enrolled_students} scholars
                              </div>
                            </td>
                            <td>{cr.category_name}</td>
                            <td>
                              <span className="badge bg-primary bg-opacity-10 text-primary">
                                {cr.format}
                              </span>
                            </td>
                            <td>
                              <span
                                className={`badge ${cr.visible ? 'bg-success' : 'bg-secondary'
                                  }`}
                              >
                                {cr.visible ? 'Visible' : 'Hidden'}
                              </span>
                            </td>
                            <td className="text-end">
                              <div className="btn-group btn-group-sm">
                                <button
                                  type="button"
                                  className="btn btn-outline-primary"
                                  title="Edit in 8-Section Course Wizard"
                                  onClick={() => loadCourseIntoWizard(Number(cr.id))}
                                >
                                  Edit Wizard
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-outline-secondary"
                                  title="Open Classroom"
                                  onClick={() => navigate(`${all_routes.courseWatch}?id=${cr.id}`)}
                                >
                                  View
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-outline-danger"
                                  title="Delete Course"
                                  onClick={async () => {
                                    if (!window.confirm(`Delete course "${cr.fullname}"?`)) return;
                                    try {
                                      await adminService.deleteCourse(Number(cr.id));
                                      setFeedback({
                                        type: 'success',
                                        text: `Course "${cr.fullname}" deleted.`,
                                      });
                                      loadStudioWorkspace(categoryId);
                                    } catch (e: any) {
                                      setFeedback({ type: 'danger', text: e?.message || 'Delete failed' });
                                    }
                                  }}
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================
              TAB 3: CATEGORY SETTINGS (course/editcategory.php?id=1)
             ================================================================ */}
          {activeTab === 'category_settings' && (
            <div className="card border-0 shadow-sm p-4" style={{ borderRadius: 14 }}>
              <div className="d-flex justify-content-between align-items-center pb-3 mb-4 border-bottom">
                <div>
                  <h4 className="fw-bold mb-1" style={{ color: OUT_COLORS.royalBlue }}>
                    {catEditMode === 'create'
                      ? 'Add new category'
                      : `Edit category settings: ${selectedCategoryObj.name}`}
                  </h4>
                  <p className="text-muted small mb-0">
                    Native React implementation of <code>course/editcategory.php?id={categoryId}</code>
                  </p>
                </div>
                <div className="btn-group btn-group-sm">
                  <button
                    type="button"
                    className={`btn ${catEditMode === 'edit' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setCatEditMode('edit')}
                  >
                    Edit Selected Category (#{categoryId})
                  </button>
                  <button
                    type="button"
                    className={`btn ${catEditMode === 'create' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => {
                      setCatEditMode('create');
                      setCatParentId(categoryId);
                      setCatName('');
                      setCatIdNumber('');
                      setCatDescription('');
                    }}
                  >
                    + Add Subcategory
                  </button>
                </div>
              </div>

              <form onSubmit={handleSaveCategory}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Parent category</label>
                    <select
                      className="form-select"
                      value={catParentId}
                      onChange={(e) => setCatParentId(Number(e.target.value))}
                    >
                      <option value={0}>Top</option>
                      {categories
                        .filter((c) => catEditMode === 'create' || Number(c.id) !== Number(categoryId))
                        .map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.full_path_name || c.name}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Category name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={catName}
                      onChange={(e) => setCatName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Category ID number</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. FAC-FSTES or IEMT-PSC"
                      value={catIdNumber}
                      onChange={(e) => setCatIdNumber(e.target.value)}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Force theme</label>
                    <select
                      className="form-select"
                      value={catTheme}
                      onChange={(e) => setCatTheme(e.target.value)}
                    >
                      <option value="">Do not force</option>
                      <option value="boost">Boost (OUT Institutional Royal Blue)</option>
                      <option value="classic">Classic Academic</option>
                    </select>
                  </div>

                  <div className="col-12">
                    <RichTextBlock
                      label="Description"
                      value={catDescription}
                      onChange={setCatDescription}
                      placeholder="Enter faculty or category academic description..."
                    />
                  </div>
                </div>

                <div className="d-flex gap-2 pt-3 border-top">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn text-white px-4 fw-semibold"
                    style={{ background: OUT_COLORS.royalBlue }}
                  >
                    {submitting
                      ? 'Saving...'
                      : catEditMode === 'create'
                        ? 'Create category'
                        : 'Save changes'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-light border px-3"
                    onClick={() => setActiveTab('category_courses')}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ================================================================
              TAB 4: UPLOAD COURSES (admin/tool/uploadcourse/index.php?categoryid=1)
             ================================================================ */}
          {activeTab === 'upload_courses' && (
            <div className="card border-0 shadow-sm p-4" style={{ borderRadius: 14 }}>
              <div className="pb-3 mb-4 border-bottom">
                <h4 className="fw-bold mb-1" style={{ color: OUT_COLORS.royalBlue }}>
                  Upload courses
                </h4>
                <p className="text-muted small mb-0">
                  Native React implementation of <code>admin/tool/uploadcourse/index.php?categoryid={categoryId}</code>
                </p>
              </div>

              <form onSubmit={handleBulkUploadCourses}>
                <div className="row g-3 mb-3">
                  <div className="col-12">
                    <label className="form-label fw-semibold">
                      Import CSV file or edit CSV rows directly <span className="text-danger">*</span>
                    </label>
                    <div className="mb-2 d-flex align-items-center gap-2">
                      <label className="btn btn-sm btn-outline-primary mb-0">
                        <i className="feather-upload me-1" />
                        Load .CSV File from Computer
                        <input
                          type="file"
                          accept=".csv,.txt"
                          className="d-none"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (!f) return;
                            const reader = new FileReader();
                            reader.onload = (ev) => {
                              if (typeof ev.target?.result === 'string') {
                                setCsvText(ev.target.result);
                              }
                            };
                            reader.readAsText(f);
                          }}
                        />
                      </label>
                      <span className="small text-muted">
                        Columns: <code>shortname,fullname,category,idnumber,format,summary</code>
                      </span>
                    </div>
                    <textarea
                      className="form-control font-monospace small"
                      rows={6}
                      value={csvText}
                      onChange={(e) => setCsvText(e.target.value)}
                      required
                    />
                  </div>

                  <div className="col-md-3">
                    <label className="form-label fw-semibold">CSV separator</label>
                    <select
                      className="form-select"
                      value={uploadDelimiter}
                      onChange={(e) => setUploadDelimiter(e.target.value)}
                    >
                      <option value=",">, (Comma)</option>
                      <option value=";">; (Semicolon)</option>
                      <option value="\t">Tab</option>
                    </select>
                  </div>

                  <div className="col-md-3">
                    <label className="form-label fw-semibold">Encoding</label>
                    <select
                      className="form-select"
                      value={uploadEncoding}
                      onChange={(e) => setUploadEncoding(e.target.value)}
                    >
                      <option value="UTF-8">UTF-8</option>
                      <option value="ISO-8859-1">ISO-8859-1</option>
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Upload mode</label>
                    <select
                      className="form-select"
                      value={uploadMode}
                      onChange={(e) => setUploadMode(e.target.value)}
                    >
                      <option value="create_or_update">Create new courses, or update existing ones</option>
                      <option value="create_new">Create new courses only, skip existing ones</option>
                      <option value="create_all">Create all, increment shortname if needed</option>
                      <option value="update_only">Update existing courses only</option>
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Default course category</label>
                    <select
                      className="form-select"
                      value={categoryId}
                      onChange={(e) => setCategoryId(Number(e.target.value))}
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.full_path_name || c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Default course format</label>
                    <select
                      className="form-select"
                      value={uploadDefaultFormat}
                      onChange={(e) => setUploadDefaultFormat(e.target.value)}
                    >
                      {COURSE_FORMATS.map((f) => (
                        <option key={f.value} value={f.value}>
                          {f.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="d-flex gap-2 pt-3 border-top">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn text-white px-4 fw-semibold"
                    style={{ background: OUT_COLORS.royalBlue }}
                  >
                    {submitting ? 'Uploading & Provisioning...' : 'Upload courses'}
                  </button>
                </div>
              </form>

              {uploadResults && (
                <div className="mt-4 pt-3 border-top">
                  <h6 className="fw-bold">Upload Results Summary</h6>
                  <div className="table-responsive">
                    <table className="table table-sm table-bordered small mb-0">
                      <thead style={{ background: OUT_COLORS.surfaceLight }}>
                        <tr>
                          <th>Shortname</th>
                          <th>Fullname</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {uploadResults.map((r, i) => (
                          <tr key={i}>
                            <td className="fw-semibold">{r.shortname}</td>
                            <td>{r.fullname || r.reason || '—'}</td>
                            <td>
                              <span
                                className={`badge ${r.status === 'created'
                                  ? 'bg-success'
                                  : r.status === 'updated'
                                    ? 'bg-primary'
                                    : 'bg-warning text-dark'
                                  }`}
                              >
                                {r.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================================================================
              TAB 5: PERMISSIONS (admin/roles/permissions.php?contextid=3)
             ================================================================ */}
          {activeTab === 'permissions' && (
            <div className="card border-0 shadow-sm p-4" style={{ borderRadius: 14 }}>
              <div className="pb-3 mb-4 border-bottom">
                <h4 className="fw-bold mb-1" style={{ color: OUT_COLORS.royalBlue }}>
                  Permissions in Category: {selectedCategoryObj.name}
                </h4>
                <p className="text-muted small mb-0">
                  Native React implementation of <code>admin/roles/permissions.php?contextid=3</code> — Admin, Course Creator, and Instructor roles have full access.
                </p>
              </div>

              <div className="table-responsive mb-4">
                <table className="table table-bordered align-middle small">
                  <thead style={{ background: OUT_COLORS.surfaceLight }}>
                    <tr>
                      <th>Capability</th>
                      <th>Category</th>
                      <th>Roles with Permission</th>
                      <th className="text-end">Add Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {capabilities.map((cap, idx) => (
                      <tr key={cap.capability}>
                        <td>
                          <div className="fw-bold text-dark">{cap.label}</div>
                          <code className="small text-muted">{cap.capability}</code>
                        </td>
                        <td>{cap.category}</td>
                        <td>
                          <div className="d-flex flex-wrap gap-1">
                            {(cap.roles || []).map((rShort: string) => (
                              <span
                                key={rShort}
                                className="badge d-inline-flex align-items-center gap-1 px-2 py-1"
                                style={{ background: OUT_COLORS.royalBlue, color: '#fff', cursor: 'pointer' }}
                                title="Click to revoke role from capability"
                                onClick={async () => {
                                  const next = [...capabilities];
                                  next[idx] = {
                                    ...cap,
                                    roles: cap.roles.filter((x: string) => x !== rShort),
                                  };
                                  setCapabilities(next);
                                  await adminService.manageCategoryPermissions({
                                    sub_action: 'toggle_capability',
                                    category_id: categoryId,
                                    capabilities: next,
                                  });
                                }}
                              >
                                {rShort} ×
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="text-end">
                          <select
                            className="form-select form-select-sm d-inline-block"
                            style={{ width: 170 }}
                            defaultValue=""
                            onChange={async (e) => {
                              const roleToAdd = e.target.value;
                              if (!roleToAdd) return;
                              e.target.value = '';
                              if (cap.roles.includes(roleToAdd)) return;
                              const next = [...capabilities];
                              next[idx] = { ...cap, roles: [...cap.roles, roleToAdd] };
                              setCapabilities(next);
                              await adminService.manageCategoryPermissions({
                                sub_action: 'toggle_capability',
                                category_id: categoryId,
                                capabilities: next,
                              });
                            }}
                          >
                            <option value="">+ Grant role...</option>
                            {roles.map((r) => (
                              <option key={r.shortname} value={r.shortname}>
                                {r.name} ({r.shortname})
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <h6 className="fw-bold mb-2" style={{ color: OUT_COLORS.royalBlue }}>
                Active System & Category Role Assignments
              </h6>
              <div className="table-responsive">
                <table className="table table-sm table-striped align-middle small mb-0">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Username / Email</th>
                      <th>Assigned Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roleAssignments.map((ra) => (
                      <tr key={ra.id}>
                        <td className="fw-semibold">{ra.fullname}</td>
                        <td>
                          {ra.username} ({ra.email})
                        </td>
                        <td>
                          <span className="badge bg-primary">{ra.roleshortname}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================================================================
              TAB 6: COHORTS (cohort/index.php?contextid=3)
             ================================================================ */}
          {activeTab === 'cohorts' && (
            <div className="row g-3">
              <div className="col-lg-7">
                <div className="card border-0 shadow-sm p-4 h-100" style={{ borderRadius: 14 }}>
                  <h5 className="fw-bold mb-3" style={{ color: OUT_COLORS.royalBlue }}>
                    Cohorts ({cohorts.length}) — <code>cohort/index.php?contextid=3</code>
                  </h5>
                  <div className="table-responsive">
                    <table className="table table-hover align-middle small">
                      <thead style={{ background: OUT_COLORS.surfaceLight }}>
                        <tr>
                          <th>Name</th>
                          <th>Cohort ID</th>
                          <th>Size</th>
                          <th>Source</th>
                          <th className="text-end">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cohorts.map((ch) => (
                          <tr key={ch.id}>
                            <td>
                              <div className="fw-bold">{ch.name}</div>
                              <div
                                className="text-muted small"
                                dangerouslySetInnerHTML={{ __html: ch.description || '' }}
                              />
                            </td>
                            <td>
                              <code>{ch.idnumber}</code>
                            </td>
                            <td>
                              <span className="badge bg-primary rounded-pill">{ch.members_count}</span>
                            </td>
                            <td>{ch.component}</td>
                            <td className="text-end">
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-danger"
                                onClick={async () => {
                                  await adminService.manageCohorts({
                                    sub_action: 'delete',
                                    cohort_id: ch.id,
                                  });
                                  loadStudioWorkspace(categoryId);
                                }}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="col-lg-5">
                <div className="card border-0 shadow-sm p-4 h-100" style={{ borderRadius: 14 }}>
                  <h5 className="fw-bold mb-3" style={{ color: OUT_COLORS.royalBlue }}>
                    Add new cohort
                  </h5>
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (!cohortName.trim()) return;
                      setSubmitting(true);
                      try {
                        const res = await adminService.manageCohorts({
                          sub_action: 'create',
                          name: cohortName.trim(),
                          idnumber: cohortIdNumber.trim(),
                          description: cohortDescription,
                        });
                        setFeedback({ type: 'success', text: res.message });
                        setCohortName('');
                        setCohortIdNumber('');
                        setCohortDescription('');
                        loadStudioWorkspace(categoryId);
                      } finally {
                        setSubmitting(false);
                      }
                    }}
                  >
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. 2026/2027 B.Sc. Data Science Cohort"
                        value={cohortName}
                        onChange={(e) => setCohortName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Cohort ID</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. COH-DS-2026"
                        value={cohortIdNumber}
                        onChange={(e) => setCohortIdNumber(e.target.value)}
                      />
                    </div>
                    <RichTextBlock
                      label="Description"
                      value={cohortDescription}
                      onChange={setCohortDescription}
                      minHeight={100}
                    />
                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn text-white w-100 fw-semibold"
                      style={{ background: OUT_COLORS.royalBlue }}
                    >
                      Save cohort
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================
              TAB 7: FILTERS (filter/manage.php?contextid=3)
             ================================================================ */}
          {activeTab === 'filters' && (
            <div className="card border-0 shadow-sm p-4" style={{ borderRadius: 14 }}>
              <div className="pb-3 mb-4 border-bottom">
                <h4 className="fw-bold mb-1" style={{ color: OUT_COLORS.royalBlue }}>
                  Filter settings in Category: {selectedCategoryObj.name}
                </h4>
                <p className="text-muted small mb-0">
                  Native React implementation of <code>filter/manage.php?contextid=3</code>
                </p>
              </div>
              <div className="table-responsive">
                <table className="table table-hover align-middle small mb-0">
                  <thead style={{ background: OUT_COLORS.surfaceLight }}>
                    <tr>
                      <th>Filter</th>
                      <th>Identifier</th>
                      <th style={{ width: 240 }}>Active Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filters.map((fl, idx) => (
                      <tr key={fl.filter}>
                        <td className="fw-bold">{fl.name}</td>
                        <td>
                          <code>filter/{fl.filter}</code>
                        </td>
                        <td>
                          <select
                            className="form-select form-select-sm"
                            value={fl.active}
                            onChange={async (e) => {
                              const nextActive = Number(e.target.value);
                              const copy = [...filters];
                              copy[idx] = { ...fl, active: nextActive };
                              setFilters(copy);
                              await adminService.manageFilters(fl.filter, nextActive);
                              setFeedback({
                                type: 'success',
                                text: `Filter "${fl.name}" updated.`,
                              });
                            }}
                          >
                            <option value={1}>On</option>
                            <option value={-1}>Off, but available</option>
                            <option value={-9999}>Disabled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================================================================
              TAB 8: RESTORE COURSE (backup/restorefile.php?contextid=3)
             ================================================================ */}
          {activeTab === 'restore_course' && (
            <div className="card border-0 shadow-sm p-4" style={{ borderRadius: 14 }}>
              <div className="pb-3 mb-4 border-bottom">
                <h4 className="fw-bold mb-1" style={{ color: OUT_COLORS.royalBlue }}>
                  Restore course
                </h4>
                <p className="text-muted small mb-0">
                  Native React implementation of <code>backup/restorefile.php?contextid=3</code> — Import a <code>.mbz</code> backup archive or clone an existing course into any category.
                </p>
              </div>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setSubmitting(true);
                  try {
                    const res = await adminService.restoreBackupCourse({
                      source_course_id: restoreSourceCourseId,
                      target_category_id: restoreTargetCategoryId,
                      fullname: restoreFullname.trim(),
                      shortname: restoreShortname.trim(),
                      backup_filename: restoreBackupFilename,
                    });
                    setCreatedCourseId(Number(res.course_id));
                    setFeedback({ type: 'success', text: res.message });
                    loadStudioWorkspace(categoryId);
                  } catch (err: any) {
                    setFeedback({ type: 'danger', text: err?.message || 'Restore failed' });
                  } finally {
                    setSubmitting(false);
                  }
                }}
              >
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Import a backup file (.mbz)</label>
                    <div
                      className="border rounded-3 p-4 text-center"
                      style={{ borderStyle: 'dashed', background: '#FAFCFF' }}
                    >
                      <i
                        className="feather-archive d-block mb-2"
                        style={{ fontSize: 28, color: OUT_COLORS.royalBlue }}
                      />
                      <label className="btn btn-sm btn-outline-primary mb-1">
                        Choose .mbz Backup Archive
                        <input
                          type="file"
                          accept=".mbz,.zip"
                          className="d-none"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) setRestoreBackupFilename(f.name);
                          }}
                        />
                      </label>
                      <div className="small text-muted">
                        {restoreBackupFilename || 'Or select an existing course snapshot on the right'}
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Or clone/restore from existing course snapshot
                    </label>
                    <select
                      className="form-select mb-3"
                      value={restoreSourceCourseId}
                      onChange={(e) => setRestoreSourceCourseId(Number(e.target.value))}
                    >
                      <option value={0}>-- Blank Backup Archive Restore --</option>
                      {courses.map((c) => (
                        <option key={c.id} value={c.id}>
                          [{c.shortname}] {c.fullname}
                        </option>
                      ))}
                    </select>

                    <label className="form-label fw-semibold">Target Category</label>
                    <select
                      className="form-select"
                      value={restoreTargetCategoryId}
                      onChange={(e) => setRestoreTargetCategoryId(Number(e.target.value))}
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.full_path_name || c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">New Course Full Name (Optional override)</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Leave blank to auto-name from backup/source"
                      value={restoreFullname}
                      onChange={(e) => setRestoreFullname(e.target.value)}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">New Course Short Name (Optional override)</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. OIT-301-RESTORED"
                      value={restoreShortname}
                      onChange={(e) => setRestoreShortname(e.target.value)}
                    />
                  </div>
                </div>

                <div className="pt-3 mt-3 border-top">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn text-white px-4 fw-semibold"
                    style={{ background: OUT_COLORS.royalBlue }}
                  >
                    {submitting ? 'Restoring Course...' : 'Restore course now'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ================================================================
              TAB 9: LEARNING PLAN TEMPLATES (admin/tool/lp/learningplans.php?pagecontextid=3)
             ================================================================ */}
          {activeTab === 'learning_plans' && (
            <div className="row g-3">
              <div className="col-lg-7">
                <div className="card border-0 shadow-sm p-4 h-100" style={{ borderRadius: 14 }}>
                  <h5 className="fw-bold mb-3" style={{ color: OUT_COLORS.royalBlue }}>
                    Learning plan templates ({learningPlans.length})
                  </h5>
                  <div className="table-responsive">
                    <table className="table table-hover align-middle small">
                      <thead style={{ background: OUT_COLORS.surfaceLight }}>
                        <tr>
                          <th>Name</th>
                          <th>Due Date</th>
                          <th>Status</th>
                          <th className="text-end">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {learningPlans.map((lp) => (
                          <tr key={lp.id}>
                            <td>
                              <div className="fw-bold">{lp.shortname}</div>
                              <div
                                className="text-muted small"
                                dangerouslySetInnerHTML={{ __html: lp.description || '' }}
                              />
                            </td>
                            <td>{lp.duedate || '—'}</td>
                            <td>
                              <span className="badge bg-success">Published</span>
                            </td>
                            <td className="text-end">
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-danger"
                                onClick={async () => {
                                  await adminService.manageLearningPlans({
                                    sub_action: 'delete',
                                    plan_id: lp.id,
                                  });
                                  loadStudioWorkspace(categoryId);
                                }}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="col-lg-5">
                <div className="card border-0 shadow-sm p-4 h-100" style={{ borderRadius: 14 }}>
                  <h5 className="fw-bold mb-3" style={{ color: OUT_COLORS.royalBlue }}>
                    Add new learning plan template
                  </h5>
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (!lpName.trim()) return;
                      setSubmitting(true);
                      try {
                        const res = await adminService.manageLearningPlans({
                          sub_action: 'create',
                          shortname: lpName.trim(),
                          description: lpDescription,
                          duedate: lpDuedate,
                        });
                        setFeedback({ type: 'success', text: res.message });
                        setLpName('');
                        setLpDescription('');
                        loadStudioWorkspace(categoryId);
                      } finally {
                        setSubmitting(false);
                      }
                    }}
                  >
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Postgraduate Research Mastery Plan"
                        value={lpName}
                        onChange={(e) => setLpName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Due Date</label>
                      <input
                        type="date"
                        className="form-control"
                        value={lpDuedate}
                        onChange={(e) => setLpDuedate(e.target.value)}
                      />
                    </div>
                    <RichTextBlock
                      label="Description"
                      value={lpDescription}
                      onChange={setLpDescription}
                      minHeight={100}
                    />
                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn text-white w-100 fw-semibold"
                      style={{ background: OUT_COLORS.royalBlue }}
                    >
                      Save learning plan template
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================
              TAB 10: COMPETENCY FRAMEWORKS (admin/tool/lp/competencyframeworks.php?pagecontextid=3)
             ================================================================ */}
          {activeTab === 'competency_frameworks' && (
            <div className="row g-3">
              <div className="col-lg-7">
                <div className="card border-0 shadow-sm p-4 h-100" style={{ borderRadius: 14 }}>
                  <h5 className="fw-bold mb-3" style={{ color: OUT_COLORS.royalBlue }}>
                    Competency frameworks ({competencyFrameworks.length})
                  </h5>
                  <div className="table-responsive">
                    <table className="table table-hover align-middle small">
                      <thead style={{ background: OUT_COLORS.surfaceLight }}>
                        <tr>
                          <th>Framework Name</th>
                          <th>ID Number</th>
                          <th>Taxonomies</th>
                          <th className="text-end">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {competencyFrameworks.map((fw) => (
                          <tr key={fw.id}>
                            <td>
                              <div className="fw-bold">{fw.shortname}</div>
                              <div
                                className="text-muted small"
                                dangerouslySetInnerHTML={{ __html: fw.description || '' }}
                              />
                            </td>
                            <td>
                              <code>{fw.idnumber}</code>
                            </td>
                            <td>
                              <span className="badge bg-light text-dark border">{fw.taxonomies}</span>
                            </td>
                            <td className="text-end">
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-danger"
                                onClick={async () => {
                                  await adminService.manageCompetencyFrameworks({
                                    sub_action: 'delete',
                                    framework_id: fw.id,
                                  });
                                  loadStudioWorkspace(categoryId);
                                }}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="col-lg-5">
                <div className="card border-0 shadow-sm p-4 h-100" style={{ borderRadius: 14 }}>
                  <h5 className="fw-bold mb-3" style={{ color: OUT_COLORS.royalBlue }}>
                    Add new competency framework
                  </h5>
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (!cfName.trim()) return;
                      setSubmitting(true);
                      try {
                        const res = await adminService.manageCompetencyFrameworks({
                          sub_action: 'create',
                          shortname: cfName.trim(),
                          idnumber: cfIdNumber.trim(),
                          taxonomies: cfTaxonomies,
                          description: cfDescription,
                        });
                        setFeedback({ type: 'success', text: res.message });
                        setCfName('');
                        setCfIdNumber('');
                        setCfDescription('');
                        loadStudioWorkspace(categoryId);
                      } finally {
                        setSubmitting(false);
                      }
                    }}
                  >
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Faculty of Law Legal Practice Competency Framework"
                        value={cfName}
                        onChange={(e) => setCfName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">ID number *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. OUT-CF-LAW-2026"
                        value={cfIdNumber}
                        onChange={(e) => setCfIdNumber(e.target.value)}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Taxonomies (4 Levels)</label>
                      <input
                        type="text"
                        className="form-control"
                        value={cfTaxonomies}
                        onChange={(e) => setCfTaxonomies(e.target.value)}
                      />
                    </div>
                    <RichTextBlock
                      label="Description"
                      value={cfDescription}
                      onChange={setCfDescription}
                      minHeight={100}
                    />
                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn text-white w-100 fw-semibold"
                      style={{ background: OUT_COLORS.royalBlue }}
                    >
                      Save competency framework
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================
              TAB 11: CONTENT BANK (contentbank/index.php?contextid=3)
             ================================================================ */}
          {activeTab === 'content_bank' && (
            <div className="row g-3">
              <div className="col-lg-7">
                <div className="card border-0 shadow-sm p-4 h-100" style={{ borderRadius: 14 }}>
                  <h5 className="fw-bold mb-3" style={{ color: OUT_COLORS.royalBlue }}>
                    Interactive H5P Content Bank ({contentBank.length})
                  </h5>
                  <div className="table-responsive">
                    <table className="table table-hover align-middle small">
                      <thead style={{ background: OUT_COLORS.surfaceLight }}>
                        <tr>
                          <th>Interactive Content Title</th>
                          <th>H5P Content Type</th>
                          <th>Size</th>
                          <th>Modified</th>
                          <th className="text-end">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {contentBank.map((cb) => (
                          <tr key={cb.id}>
                            <td className="fw-bold">{cb.name}</td>
                            <td>
                              <span className="badge bg-primary bg-opacity-10 text-primary">
                                {cb.library}
                              </span>
                            </td>
                            <td>{cb.size_kb} KB</td>
                            <td>{cb.timemodified}</td>
                            <td className="text-end">
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-danger"
                                onClick={async () => {
                                  await adminService.manageContentBank({
                                    sub_action: 'delete',
                                    content_id: cb.id,
                                  });
                                  loadStudioWorkspace(categoryId);
                                }}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="col-lg-5">
                <div className="card border-0 shadow-sm p-4 h-100" style={{ borderRadius: 14 }}>
                  <h5 className="fw-bold mb-3" style={{ color: OUT_COLORS.royalBlue }}>
                    Add or Upload H5P Package to Content Bank
                  </h5>
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (!cbTitle.trim()) return;
                      setSubmitting(true);
                      try {
                        const res = await adminService.manageContentBank({
                          sub_action: 'create',
                          name: cbTitle.trim(),
                          library: cbLibrary,
                          size_kb: 1120,
                        });
                        setFeedback({ type: 'success', text: res.message });
                        setCbTitle('');
                        loadStudioWorkspace(categoryId);
                      } finally {
                        setSubmitting(false);
                      }
                    }}
                  >
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Interactive Item Title *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Module 2 Interactive Case Study (H5P)"
                        value={cbTitle}
                        onChange={(e) => setCbTitle(e.target.value)}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">H5P Interactive Content Type</label>
                      <select
                        className="form-select"
                        value={cbLibrary}
                        onChange={(e) => setCbLibrary(e.target.value)}
                      >
                        <option value="H5P.InteractiveVideo 1.26">Interactive Video (H5P.InteractiveVideo)</option>
                        <option value="H5P.CoursePresentation 1.25">Course Presentation (H5P.CoursePresentation)</option>
                        <option value="H5P.BranchingScenario 1.8">Branching Scenario (H5P.BranchingScenario)</option>
                        <option value="H5P.QuestionSet 1.20">Quiz Question Set (H5P.QuestionSet)</option>
                        <option value="H5P.Dialogcards 1.9">Dialog Cards (H5P.Dialogcards)</option>
                        <option value="H5P.Accordion 1.0">Accordion (H5P.Accordion)</option>
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Upload .h5p file (Optional)</label>
                      <input
                        type="file"
                        accept=".h5p,.zip"
                        className="form-control"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f && !cbTitle.trim()) {
                            setCbTitle(f.name.replace(/\.h5p$/i, ''));
                          }
                        }}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn text-white w-100 fw-semibold"
                      style={{ background: OUT_COLORS.royalBlue }}
                    >
                      Add to Content Bank
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AddNewCourse;
