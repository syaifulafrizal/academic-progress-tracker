/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type StudentType = 'FYP' | 'Master' | 'PhD';

export type TaskStatus = 'Not started' | 'In progress' | 'Submitted' | 'Need revision' | 'Approved' | 'Completed' | 'Overdue';
export type StudentRisk = 'On track' | 'Slight delay' | 'Delayed' | 'Critical' | 'Completed';
export type PublicationStatus = 'Idea' | 'Result ready' | 'Drafting' | 'Supervisor review' | 'Submitted' | 'Under review' | 'Revision' | 'Accepted' | 'Published';
export type ThesisStatus = 'Not started' | 'Drafting' | 'Submitted to supervisor' | 'Need revision' | 'Approved' | 'Submitted to faculty' | 'Completed';
export type UserRole = 'Lecturer' | 'Student' | 'Admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  studentId?: string;
}

export interface StudentProfile {
  id: string;
  userId: string;
  name: string;
  email: string;
  studentType: StudentType;
  startDate: string;
  expectedEndDate: string;
  maxEndDate: string;
  researchTitle: string;
  riskStatus: StudentRisk;
  attentionScore: number; // calculated priority score
  thesisStatus: ThesisStatus;
  avatarUrl?: string;
}

export interface StudentProfileComputedDetail {
  overallProgress: number;
  timeUsedPercent: number;
  attentionScore: number;
  riskStatus: StudentRisk;
  thesisProgressPercent: number;
  completedMilestones: number;
  completedTasks: number;
}

export interface StudentMilestone {
  id: string;
  studentId: string;
  title: string;
  period: string; // e.g. "Semester 1", "Semester 2"
  expectedOutput: string;
  deadline: string;
  status: TaskStatus;
  progressPercent: number;
}

export interface ResearchObjective {
  id: string;
  studentId: string;
  objectiveNo: number;
  description: string;
  progressPercent: number;
  status: 'Not started' | 'In progress' | 'Completed';
}

export interface StudentPublication {
  id: string;
  studentId: string;
  paperNo: number;
  title: string;
  targetJournal: string;
  status: PublicationStatus;
  submissionDate?: string;
  acceptanceDate?: string;
}

export interface WeeklyUpdate {
  id: string;
  studentId: string;
  weekStart: string;
  completedThisWeek: string;
  notCompleted: string;
  blocker: string;
  planForNextWeek: string;
  relatedMilestoneId: string;
  relatedMilestoneTitle: string;
  deadline: string;
  needFeedback: boolean;
  feedbackText?: string;
  evidenceFileName?: string;
  createdAt: string;
}

export interface MeetingLog {
  id: string;
  studentId: string;
  meetingDate: string;
  summary: string;
  supervisorFeedback: string;
  actionItems: string[];
  deadline: string;
  nextMeetingDate: string;
}

export interface AcademicTask {
  id: string;
  studentId: string;
  studentName?: string;
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  deadline: string;
  status: 'Pending' | 'Completed' | 'Overdue';
  relatedArea: string; // e.g. "Chapter 3", "Paper 1", "Objective 2"
}

export interface UploadedFile {
  id: string;
  studentId: string;
  uploadedBy: string;
  fileName: string;
  fileSize: string;
  fileType: string; // "pdf" | "docx" | "xlsx" | "image" | "zip"
  relatedItem: string; // e.g. "Chapter 3 draft", "Paper 1 submission"
  createdAt: string;
}

export interface ThesisChapter {
  id: string;
  studentId: string;
  chapterNo: number;
  title: string;
  status: TaskStatus;
  progressPercent: number;
  wordCount: number;
  updatedAt: string;
}

export interface ReportRecord {
  id: string;
  title: string;
  type: 'Student Progress' | 'Milestone' | 'Meeting' | 'Publication' | 'Weekly Update';
  generatedBy: string;
  createdAt: string;
  downloadUrl?: string;
}

export interface AppData {
  users: User[];
  students: StudentProfile[];
  milestones: StudentMilestone[];
  objectives: ResearchObjective[];
  publications: StudentPublication[];
  weeklyUpdates: WeeklyUpdate[];
  meetingLogs: MeetingLog[];
  tasks: AcademicTask[];
  uploadedFiles: UploadedFile[];
  thesisChapters: ThesisChapter[];
  reports: ReportRecord[];
}

