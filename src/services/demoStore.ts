import {
  AcademicTask,
  AppData,
  MeetingLog,
  ReportRecord,
  ResearchObjective,
  StudentMilestone,
  StudentProfile,
  StudentPublication,
  ThesisChapter,
  UploadedFile,
  User,
  WeeklyUpdate
} from '../types';
import {
  INITIAL_FILES,
  INITIAL_MEETING_LOGS,
  INITIAL_MILESTONES,
  INITIAL_OBJECTIVES,
  INITIAL_PUBLICATIONS,
  INITIAL_STUDENTS,
  INITIAL_TASKS,
  INITIAL_WEEKLY_UPDATES
} from '../mockData';

const STORAGE_KEY = 'academic-progress-tracker:data:v1';

const DEMO_USERS: User[] = [
  { id: 'u_lecturer', name: 'Supervisor', email: 'lecturer@example.edu', role: 'Lecturer' },
  ...INITIAL_STUDENTS.map(student => ({
    id: student.userId,
    name: student.name,
    email: student.email,
    role: 'Student' as const,
    studentId: student.id
  }))
];

const DEMO_THESIS_CHAPTERS: ThesisChapter[] = INITIAL_STUDENTS.flatMap(student => {
  const base = student.id === 'p1'
    ? [100, 100, 75, 20, 0]
    : student.studentType === 'FYP'
      ? [60, 45, 30, 10, 0]
      : [80, 65, 45, 20, 5];

  return ['Introduction', 'Literature Review', 'Methodology', 'Results and Discussion', 'Conclusion'].map((title, index) => ({
    id: `tc_${student.id}_${index + 1}`,
    studentId: student.id,
    chapterNo: index + 1,
    title: `Chapter ${index + 1}: ${title}`,
    status: base[index] === 100 ? 'Approved' : base[index] > 0 ? 'In progress' : 'Not started',
    progressPercent: base[index],
    wordCount: Math.round((base[index] / 100) * 8000),
    updatedAt: '2025-05-20'
  }));
});

const DEMO_REPORTS: ReportRecord[] = [
  { id: 'r_1', title: 'Student Progress Report - May 2025', type: 'Student Progress', generatedBy: 'Supervisor', createdAt: '2025-05-12' },
  { id: 'r_2', title: 'Milestone Summary - April 2025', type: 'Milestone', generatedBy: 'Supervisor', createdAt: '2025-04-30' },
  { id: 'r_3', title: 'Meeting Summary - April 2025', type: 'Meeting', generatedBy: 'Supervisor', createdAt: '2025-04-28' },
  { id: 'r_4', title: 'Publication Report - April 2025', type: 'Publication', generatedBy: 'Supervisor', createdAt: '2025-04-25' }
];

export function createInitialData(): AppData {
  return {
    users: DEMO_USERS,
    students: INITIAL_STUDENTS,
    milestones: INITIAL_MILESTONES,
    objectives: INITIAL_OBJECTIVES,
    publications: INITIAL_PUBLICATIONS,
    weeklyUpdates: INITIAL_WEEKLY_UPDATES,
    meetingLogs: INITIAL_MEETING_LOGS,
    tasks: INITIAL_TASKS,
    uploadedFiles: INITIAL_FILES,
    thesisChapters: DEMO_THESIS_CHAPTERS,
    reports: DEMO_REPORTS
  };
}

export function loadStoredData(): AppData {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialData();
    const parsed = JSON.parse(raw) as Partial<AppData>;
    const fallback = createInitialData();
    return {
      ...fallback,
      ...parsed,
      users: parsed.users?.length ? parsed.users : fallback.users,
      students: parsed.students?.length ? parsed.students : fallback.students
    };
  } catch {
    return createInitialData();
  }
}

export function saveStoredData(data: AppData) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function resetStoredData() {
  window.localStorage.removeItem(STORAGE_KEY);
}

export function buildMilestoneTemplates(student: StudentProfile): StudentMilestone[] {
  const studentId = student.id;
  if (student.studentType === 'FYP') {
    return [
      ['Chapter 1 - Introduction', 'Semester 1', 'Problem statement, research questions, scope, and clear objectives.', '2026-10-15'],
      ['Chapter 2 - Literature Review', 'Semester 1', 'Related articles reviewed and research gap identified.', '2026-12-01'],
      ['Chapter 3 - Methodology', 'Semester 1', 'Method, tools, data, experiment design, and planned analysis.', '2027-01-20'],
      ['Initial result', 'End of Semester 1', 'At least one result with early discussion.', '2027-02-15'],
      ['Chapter 4 - Results and Discussion', 'Semester 2', 'Complete results, figures, tables, and discussion.', '2027-05-01'],
      ['Final submission', 'End of Semester 2', 'Final thesis/report submitted and corrected.', '2027-06-15']
    ].map(([title, period, expectedOutput, deadline], index) => ({
      id: `m_${studentId}_${index + 1}`,
      studentId,
      title,
      period,
      expectedOutput,
      deadline,
      status: 'Not started',
      progressPercent: 0
    }));
  }

  if (student.studentType === 'Master') {
    return [
      ['Research Objectives Finalized', 'Year 1', 'Approved objective outline linked to tasks.', '2026-11-30'],
      ['Paper 1 Draft', 'Year 2', 'One research article ready for supervisor review.', '2027-03-31'],
      ['Thesis Chapters 1-5', 'Year 2', 'Full thesis background, methods, results, and discussion draft.', '2027-05-01'],
      ['Final Submission', 'Year 2', 'Thesis submitted for examination or Academic processing.', '2027-08-31']
    ].map(([title, period, expectedOutput, deadline], index) => ({
      id: `m_${studentId}_${index + 1}`,
      studentId,
      title,
      period,
      expectedOutput,
      deadline,
      status: 'Not started',
      progressPercent: 0
    }));
  }

  return [
    ['Proposal Defense passed', 'Year 1', 'Full proposal approved.', '2026-06-30'],
    ['Paper 1 accepted or submitted', 'Year 2', 'First research article submitted or accepted.', '2027-07-30'],
    ['Paper 2 accepted or submitted', 'Year 3', 'Second research article submitted or accepted.', '2028-02-28'],
    ['Thesis Integration & Draft Review', 'Year 3', 'Full draft compiled.', '2028-06-30'],
    ['Viva & Final Defense', 'Year 4', 'Successful defense and correction plan.', '2029-04-15']
  ].map(([title, period, expectedOutput, deadline], index) => ({
    id: `m_${studentId}_${index + 1}`,
    studentId,
    title,
    period,
    expectedOutput,
    deadline,
    status: 'Not started',
    progressPercent: 0
  }));
}


