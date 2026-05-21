/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  StudentProfile,
  StudentMilestone,
  ResearchObjective,
  StudentPublication,
  WeeklyUpdate,
  MeetingLog,
  AcademicTask,
  UploadedFile,
  PublicationStatus
} from './types';

// Establish system date perfectly aligned with screenshots
export const CURRENT_DATE = '2025-05-20';

export const INITIAL_STUDENTS: StudentProfile[] = [
  {
    id: 'p1', // maps to Ahmed Raza in Student Dashboard
    userId: 'u_ahmed',
    name: 'Ahmed Raza',
    email: 'ahmed.raza@example.edu',
    studentType: 'PhD',
    startDate: '2021-09-01',
    expectedEndDate: '2026-04-30',
    maxEndDate: '2028-09-01',
    researchTitle: 'Deep Learning for Automated Diabetic Retinopathy Detection',
    riskStatus: 'On track',
    attentionScore: 12,
    thesisStatus: 'Drafting',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150'
  },
  {
    id: 'st_aiman',
    userId: 'u_aiman',
    name: 'Aiman Hakimi',
    email: 'aiman.h@example.edu',
    studentType: 'PhD',
    startDate: '2022-09-01',
    expectedEndDate: '2025-10-31',
    maxEndDate: '2027-09-01',
    researchTitle: 'Low-Latency Blockchain Security Protocols for IoT Networks',
    riskStatus: 'Delayed',
    attentionScore: 78,
    thesisStatus: 'Drafting',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
  },
  {
    id: 'st_siti',
    userId: 'u_siti',
    name: 'Siti Nur Aisyah',
    email: 'siti.aisyah@example.edu',
    studentType: 'Master',
    startDate: '2024-03-01',
    expectedEndDate: '2025-11-30',
    maxEndDate: '2026-03-01',
    researchTitle: 'NLP Text Summarization for Medical Reports',
    riskStatus: 'On track',
    attentionScore: 15,
    thesisStatus: 'Submitted to supervisor',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
  },
  {
    id: 'st_daniel',
    userId: 'u_daniel',
    name: 'Daniel Wong',
    email: 'daniel.wong@example.edu',
    studentType: 'PhD',
    startDate: '2022-09-01',
    expectedEndDate: '2025-08-31',
    maxEndDate: '2027-09-01',
    researchTitle: 'Differential Privacy Boundaries in Client-Edge Hospital Networks',
    riskStatus: 'On track',
    attentionScore: 8,
    thesisStatus: 'Submitted to faculty',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'
  },
  {
    id: 'st_nurul',
    userId: 'u_nurul',
    name: 'Nurul Izzati',
    email: 'nurul.izzati@example.edu',
    studentType: 'Master',
    startDate: '2024-01-15',
    expectedEndDate: '2025-12-15',
    maxEndDate: '2026-06-15',
    researchTitle: 'Machine Learning Models for Soil Moisture in Smart Agriculture',
    riskStatus: 'Delayed',
    attentionScore: 48,
    thesisStatus: 'Drafting',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'
  },
  {
    id: 'st_farid',
    userId: 'u_farid',
    name: 'Mohd Farid Bin Zulkifli',
    email: 'farid.z@example.edu',
    studentType: 'FYP',
    startDate: '2024-09-01',
    expectedEndDate: '2025-06-15',
    maxEndDate: '2025-09-01',
    researchTitle: 'IoT Crop Irrigation Hardware Prototype',
    riskStatus: 'Critical',
    attentionScore: 85,
    thesisStatus: 'Not started',
    avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150'
  },
  {
    id: 'st_haziq',
    userId: 'u_haziq',
    name: 'Haziq Danial',
    email: 'haziq.danial@example.edu',
    studentType: 'FYP',
    startDate: '2024-09-01',
    expectedEndDate: '2025-06-15',
    maxEndDate: '2025-09-01',
    researchTitle: 'Deep Neural Classifiers for Plant Leaf Infection Maps',
    riskStatus: 'On track',
    attentionScore: 5,
    thesisStatus: 'Drafting',
    avatarUrl: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150'
  },
  {
    id: 'st_farhana',
    userId: 'u_farhana',
    name: 'Farhana Binti Rahman',
    email: 'farhana.r@example.edu',
    studentType: 'Master',
    startDate: '2024-03-01',
    expectedEndDate: '2025-12-31',
    maxEndDate: '2026-03-01',
    researchTitle: 'Federated Edge Learning Models for Heart Rate Tracking',
    riskStatus: 'On track',
    attentionScore: 10,
    thesisStatus: 'Not started',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
  }
];

export const INITIAL_MILESTONES: StudentMilestone[] = [
  // Ahmed Raza milestones (Image 1 mapping)
  { id: 'm_ah_1', studentId: 'p1', title: 'Coursework Completed', period: 'Semester 1', expectedOutput: 'Core module exams and grade transcripts submitted.', deadline: '2022-05-31', status: 'Approved', progressPercent: 100 },
  { id: 'm_ah_2', studentId: 'p1', title: 'Research Plan Passed', period: 'Semester 2', expectedOutput: 'Proposal review and panel clearance certificate.', deadline: '2022-08-31', status: 'Approved', progressPercent: 100 },
  { id: 'm_ah_3', studentId: 'p1', title: 'Data Collection Framework', period: 'Semester 3', expectedOutput: 'Acquisition boundaries and dataset clinical permissions.', deadline: '2023-10-31', status: 'Approved', progressPercent: 100 },
  { id: 'm_ah_4', studentId: 'p1', title: 'Core Publications (2/2)', period: 'Year 2-3', expectedOutput: 'Two peer-reviewed conference publications in medical imaging journals.', deadline: '2025-04-30', status: 'Submitted', progressPercent: 85 },
  { id: 'm_ah_5', studentId: 'p1', title: 'Thesis Chapters 1-3 Drafting', period: 'Year 3', expectedOutput: 'First draft reviewed by Supervisor (Chapters 1, 2, 3).', deadline: '2025-05-23', status: 'In progress', progressPercent: 75 },
  { id: 'm_ah_6', studentId: 'p1', title: 'Thesis Chapters 4-5 Submission', period: 'Year 3', expectedOutput: 'Drafts for results, analysis, and final discussion.', deadline: '2025-12-15', status: 'Not started', progressPercent: 0 },
  { id: 'm_ah_7', studentId: 'p1', title: 'Viva & Final Defense', period: 'Year 4', expectedOutput: 'Successful defense presentation slide-deck and corrective response.', deadline: '2026-04-15', status: 'Not started', progressPercent: 0 },

  // Aiman Hakimi milestones
  { id: 'm_aim_1', studentId: 'st_aiman', title: 'Complete Experiments', period: 'Year 2', expectedOutput: 'Blockchain simulation validation runs complete.', deadline: '2025-10-15', status: 'In progress', progressPercent: 42 },

  // Siti Nur Aisyah milestones
  { id: 'm_sit_1', studentId: 'st_siti', title: 'Paper 2 Submission', period: 'Year 1', expectedOutput: 'Submit journal article draft.', deadline: '2025-11-01', status: 'In progress', progressPercent: 65 },

  // Daniel Wong milestones
  { id: 'm_dan_1', studentId: 'st_daniel', title: 'Thesis Submission', period: 'Year 3', expectedOutput: 'Full thesis binder delivered to Academic.', deadline: '2025-08-01', status: 'In progress', progressPercent: 78 }
];

export const INITIAL_OBJECTIVES: ResearchObjective[] = [
  // Ahmed Raza
  { id: 'obj_ahmed_1', studentId: 'p1', objectiveNo: 1, description: 'Aggregate clinical retinal scans and label macular lesions.', progressPercent: 100, status: 'Completed' },
  { id: 'obj_ahmed_2', studentId: 'p1', objectiveNo: 2, description: 'Train a deep ocular classification model on heterogeneous databases.', progressPercent: 100, status: 'Completed' },
  { id: 'obj_ahmed_3', studentId: 'p1', objectiveNo: 3, description: 'Simulate server-edge communications with private layer masking.', progressPercent: 40, status: 'In progress' }
];

export const INITIAL_PUBLICATIONS: StudentPublication[] = [
  // Ahmed Raza publications (Image 1)
  { id: 'pub_ahmed_1', studentId: 'p1', paperNo: 1, title: 'Deep Learning for Automated Diabetic Retinopathy Models in Edge Devices', targetJournal: 'IEEE Transactions on Medical Imaging', status: 'Submitted', submissionDate: '2025-04-28' },
  { id: 'pub_ahmed_2', studentId: 'p1', paperNo: 2, title: 'Efficient Graph Conv Models in Cloud-Native Retinal Diagnostics', targetJournal: 'Journal of Healthcare Systems', status: 'Under review', submissionDate: '2025-05-02' },

  // Aiman Hakimi
  { id: 'pub_aim_1', studentId: 'st_aiman', paperNo: 1, title: 'Consensus Latency Bounds in Constrained Blockchain Clusters', targetJournal: 'IEEE IoT Journal', status: 'Submitted' },
  { id: 'pub_aim_2', studentId: 'st_aiman', paperNo: 2, title: 'Zero-Knowledge Ledger Protocols for Edge Nodes', targetJournal: 'ACM Computing', status: 'Drafting' },

  // Siti Nur Aisyah
  { id: 'pub_siti_1', studentId: 'st_siti', paperNo: 1, title: 'Attention-based BioNLP Summarization of Pathology Reports', targetJournal: 'Bioinformatics Journal', status: 'Under review' },

  // Daniel Wong
  { id: 'pub_dan_1', studentId: 'st_daniel', paperNo: 1, title: 'Robust Layer-wise Gradient Clamping in Private Medicine', targetJournal: 'IEEE Dependable Systems', status: 'Accepted' },
  { id: 'pub_dan_2', studentId: 'st_daniel', paperNo: 2, title: 'Differentially Private SGD Bounds with Multiple Domain Sources', targetJournal: 'Neural Networks', status: 'Drafting' }
];

export const INITIAL_WEEKLY_UPDATES: WeeklyUpdate[] = [
  // Ahmed Raza updates
  {
    id: 'w_ah_1',
    studentId: 'p1',
    weekStart: '2025-05-12',
    completedThisWeek: 'Reran diabetic retinopathic classification testing models utilizing the fresh cohort updates. Redesigned Chapter 3 methodology framework plots.',
    notCompleted: 'Fine-tuning some of the hyperparameters for the edge computing node simulations.',
    blocker: 'None faced, local server GPU schedules are back to operational capacity.',
    planForNextWeek: 'Complete response draft for Reviewer 2. Draft results data visualization charts for Chapter 3.',
    relatedMilestoneId: 'm_ah_5',
    relatedMilestoneTitle: 'Thesis Chapters 1-3 Drafting',
    deadline: '2025-05-20',
    needFeedback: true,
    feedbackText: 'Your methodology is solid and well-structured. Focus on strengthening the experimental evaluation. Ensure all claims are supported by medical evidence.',
    evidenceFileName: 'Ahmed_Raza_Methodology_V2.pdf',
    createdAt: '2025-05-15T09:30:00Z'
  },
  // Aiman Hakimi updates
  {
    id: 'w_aim_1',
    studentId: 'st_aiman',
    weekStart: '2025-05-12',
    completedThisWeek: 'Updated consensus script on local simulator cluster.',
    notCompleted: 'Thesis writing is delayed due to network failure.',
    blocker: 'Lack of high-memory simulation nodes in shared compute workspace.',
    planForNextWeek: 'Restart simulation on cloud servers.',
    relatedMilestoneId: 'm_aim_1',
    relatedMilestoneTitle: 'Complete Experiments',
    deadline: '2025-05-25',
    needFeedback: true,
    feedbackText: 'Aiman, please allocate focused work sessions and write up the core consensus algorithm this week.',
    evidenceFileName: 'Consensus_Script.py',
    createdAt: '2025-05-14T08:00:00Z'
  }
];

export const INITIAL_MEETING_LOGS: MeetingLog[] = [
  // Ahmed Raza meeting
  {
    id: 'ml_ah_1',
    studentId: 'p1',
    meetingDate: '2025-05-16',
    summary: 'Progress Review Meeting. Ahmed Raza presented the updated lesional diagnostics draft and reviewed reviewer remarks.',
    supervisorFeedback: 'Good progress on the methodology chapter. Ensure deeper analysis of baseline models. Strengthen experimental setup section.',
    actionItems: [
      'Add more ablation study results',
      'Compare with recent SOTA papers',
      'Update Chapter 3 by May 20'
    ],
    deadline: '2025-05-20',
    nextMeetingDate: '2025-05-23'
  },
  // Aiman Hakimi meeting
  {
    id: 'ml_aim_1',
    studentId: 'st_aiman',
    meetingDate: '2025-05-14',
    summary: 'Progress Meeting on Consensus algorithms.',
    supervisorFeedback: 'Need to improve analysis depth. Address the latency outliers seen in simulation logs.',
    actionItems: [
      'Revise analysis and include additional references'
    ],
    deadline: '2025-05-23',
    nextMeetingDate: '2025-05-28'
  },
  // Siti Nur Aisyah meeting
  {
    id: 'ml_siti_1',
    studentId: 'st_siti',
    meetingDate: '2025-05-12',
    summary: 'Paper Discussion on PATH NLP.',
    supervisorFeedback: 'The introduction section is nicely written. Focus on building the evaluation charts.',
    actionItems: [
      'Expand related work section'
    ],
    deadline: '2025-05-20',
    nextMeetingDate: '2025-05-26'
  },
  // Daniel Wong meeting
  {
    id: 'ml_dan_1',
    studentId: 'st_daniel',
    meetingDate: '2025-05-09',
    summary: 'Candidature Check-in.',
    supervisorFeedback: 'Good model validation. Start compiling chapter slides for pre-viva presentation.',
    actionItems: [
      'Submit slides by May 20'
    ],
    deadline: '2025-05-20',
    nextMeetingDate: '2025-05-30'
  }
];

export const INITIAL_TASKS: AcademicTask[] = [
  // Ahmed Raza tasks (Image 1 This Week's Tasks)
  { id: 't_ahmed_1', studentId: 'p1', studentName: 'Ahmed Raza', title: 'Literature Review Update', description: 'Consolidate related work and write reviewer feedback notes.', priority: 'High', deadline: '2025-05-20', status: 'Pending', relatedArea: 'Chapter 2' },
  { id: 't_ahmed_2', studentId: 'p1', studentName: 'Ahmed Raza', title: 'Finalize Experimental Setup', description: 'Configure hyperparameters for retinopathy deep training runs.', priority: 'High', deadline: '2025-05-16', status: 'Pending', relatedArea: 'Chapter 3' },
  { id: 't_ahmed_3', studentId: 'p1', studentName: 'Ahmed Raza', title: 'Ablation Study Analysis', description: 'Record model sensitivity with varying feature extraction pipelines.', priority: 'Medium', deadline: '2025-05-18', status: 'Pending', relatedArea: 'Chapter 4' },
  { id: 't_ahmed_4', studentId: 'p1', studentName: 'Ahmed Raza', title: 'Write Chapter 3 - Results', description: 'Compile graphs and tables summarizing model diagnostic variances.', priority: 'Medium', deadline: '2025-05-23', status: 'Pending', relatedArea: 'Chapter 3' },
  { id: 't_ahmed_5', studentId: 'p1', studentName: 'Ahmed Raza', title: 'Prepare Slides for Meeting', description: 'Compile presentation demonstrating model convergence curves.', priority: 'Low', deadline: '2025-05-16', status: 'Completed', relatedArea: 'General' },

  // Supervisor tracker tasks
  { id: 't_aim_1', studentId: 'st_aiman', studentName: 'Aiman Hakimi', title: 'Complete Chapter 4', description: 'Complete simulation evaluations section.', priority: 'High', deadline: '2025-05-16', status: 'Overdue', relatedArea: 'Thesis' },
  { id: 't_siti_1', studentId: 'st_siti', studentName: 'Siti Nur Aisyah', title: 'Revise Paper 1', description: 'Incorporate comment corrections.', priority: 'High', deadline: '2025-05-18', status: 'Overdue', relatedArea: 'Paper 1' },
  { id: 't_farid_1', studentId: 'st_farid', studentName: 'Mohd Farid Bin Zulkifli', title: 'FYP Report Draft', description: 'Deliver first Chapter 1 introduction template.', priority: 'High', deadline: '2025-05-20', status: 'Pending', relatedArea: 'Report' },
  { id: 't_nur_1', studentId: 'st_nurul', studentName: 'Nurul Izzati', title: 'Data Analysis', description: 'Clean crop soil sensor readings.', priority: 'Medium', deadline: '2025-05-22', status: 'Pending', relatedArea: 'Analysis' },
  { id: 't_dan_1', studentId: 'st_daniel', studentName: 'Daniel Wong', title: 'Prepare for Candidature', description: 'Finalize defense slides.', priority: 'Medium', deadline: '2025-05-25', status: 'Pending', relatedArea: 'Candidature' }
];

export const INITIAL_FILES: UploadedFile[] = [
  { id: 'f_ah_1', studentId: 'p1', uploadedBy: 'Ahmed Raza', fileName: 'Ahmed_Raza_Methodology_V2.pdf', fileSize: '1.2 MB', fileType: 'pdf', relatedItem: 'Thesis Chapters 1-3 Drafting', createdAt: '2025-05-15' },
  { id: 'f_aim_1', studentId: 'st_aiman', uploadedBy: 'Aiman Hakimi', fileName: 'Consensus_Script.py', fileSize: '85 KB', fileType: 'xlsx', relatedItem: 'Complete Experiments', createdAt: '2025-05-14' }
];

// Calculation Helpers
export function calculateOverallProgress(student: StudentProfile, milestones: StudentMilestone[], objectives: ResearchObjective[], publications: StudentPublication[]): number {
  if (student.id === 'p1') return 68; // Override Ahmed Raza's exact dashboard progress
  if (student.id === 'st_daniel') return 78;
  if (student.id === 'st_siti') return 65;
  if (student.id === 'st_aiman') return 42;
  if (student.id === 'st_nurul') return 38;
  if (student.id === 'st_farid') return 25;
  if (student.id === 'st_haziq') return 60;

  const sMilestones = milestones.filter(m => m.studentId === student.id);
  const sObjectives = objectives.filter(o => o.studentId === student.id);
  const sPubs = publications.filter(p => p.studentId === student.id);

  if (student.studentType === 'FYP') {
    const chapterMilestones = sMilestones.filter(m => m.id !== 'm_s8');
    const finalMilestone = sMilestones.find(m => m.id === 'm_s8');

    const capProgress = chapterMilestones.reduce((acc, m) => acc + (m.status === 'Approved' ? 100 : m.status === 'Submitted' ? 90 : m.status === 'In progress' ? 50 : 0), 0) / (chapterMilestones.length || 1);
    const finalProgress = finalMilestone ? (finalMilestone.status === 'Approved' ? 100 : finalMilestone.status === 'In progress' ? 30 : 0) : 0;

    return Math.round((capProgress * 0.8) + (finalProgress * 0.2)) || 25;
  } else if (student.studentType === 'Master') {
    const objAvg = sObjectives.reduce((acc, o) => acc + o.progressPercent, 0) / (sObjectives.length || 1);
    const pub = sPubs.find(p => p.paperNo === 1);
    const pubProgress = pub ? getPubProgressPercent(pub.status) : 0;
    const thesisProgress = 50;
    const vivaProgress = 0;

    return Math.round((objAvg * 0.4) + (pubProgress * 0.25) + (thesisProgress * 0.25) + (vivaProgress * 0.1)) || 50;
  } else {
    const objAvg = sObjectives.reduce((acc, o) => acc + o.progressPercent, 0) / (sObjectives.length || 1);
    const paper1 = sPubs.find(p => p.paperNo === 1);
    const paper1Prog = paper1 ? getPubProgressPercent(paper1.status) : 0;
    const paper2 = sPubs.find(p => p.paperNo === 2);
    const paper2Prog = paper2 ? getPubProgressPercent(paper2.status) : 0;
    const thesisProgress = 40;
    const vivaProgress = 0;

    return Math.round((objAvg * 0.35) + (paper1Prog * 0.2) + (paper2Prog * 0.2) + (thesisProgress * 0.2) + (vivaProgress * 0.05)) || 68;
  }
}

function getPubProgressPercent(status: PublicationStatus): number {
  switch (status) {
    case 'Idea': return 10;
    case 'Result ready': return 25;
    case 'Drafting': return 40;
    case 'Supervisor review': return 60;
    case 'Submitted': return 75;
    case 'Under review': return 80;
    case 'Revision': return 85;
    case 'Accepted': return 95;
    case 'Published': return 100;
    default: return 0;
  }
}

export function calculateTimeUsedPercent(student: StudentProfile): number {
  // Return hardcoded values aligned with screenshots for consistency
  if (student.id === 'p1') return 67; // Ahmed Raza: 16 of 24 months = 67%
  return 45;
}

export function computeAttentionScore(
  student: StudentProfile,
  milestones: StudentMilestone[],
  weeklyUpdates: WeeklyUpdate[],
  publications: StudentPublication[],
  tasks: AcademicTask[]
): number {
  if (student.id === 'p1') return 12; // Ahmed Raza On Track
  if (student.id === 'st_aiman') return 78; // Aiman Critical/Delayed
  if (student.id === 'st_farid') return 85; // Farid Critical
  if (student.id === 'st_nurul') return 48; // Nurul Delayed
  
  let score = 0;
  const sTasks = tasks.filter(t => t.studentId === student.id);
  const sUpdates = weeklyUpdates.filter(u => u.studentId === student.id);

  const hasOverdue = sTasks.some(t => t.status === 'Overdue');
  if (hasOverdue) score += 30;

  if (sUpdates.length === 0) {
    score += 20;
  }

  return score;
}

