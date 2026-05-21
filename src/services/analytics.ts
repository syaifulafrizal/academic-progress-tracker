import {
  AcademicTask,
  PublicationStatus,
  ResearchObjective,
  StudentMilestone,
  StudentProfile,
  StudentPublication,
  StudentRisk,
  TaskStatus,
  ThesisChapter,
  WeeklyUpdate
} from '../types';

const CURRENT_DATE = new Date();

export function statusProgress(status: TaskStatus): number {
  switch (status) {
    case 'Approved':
    case 'Completed':
      return 100;
    case 'Submitted':
      return 90;
    case 'In progress':
      return 50;
    case 'Need revision':
      return 65;
    case 'Overdue':
      return 20;
    default:
      return 0;
  }
}

export function publicationProgress(status: PublicationStatus): number {
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

function avg(values: number[]) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

export function calculateOverallProgress(
  student: StudentProfile,
  milestones: StudentMilestone[],
  objectives: ResearchObjective[],
  publications: StudentPublication[],
  thesisChapters: ThesisChapter[] = []
): number {
  const sMilestones = milestones.filter(item => item.studentId === student.id);
  const sObjectives = objectives.filter(item => item.studentId === student.id);
  const sPublications = publications.filter(item => item.studentId === student.id);
  const sThesis = thesisChapters.filter(item => item.studentId === student.id);

  const milestoneProgress = avg(sMilestones.map(item => item.progressPercent || statusProgress(item.status)));
  const objectiveProgress = avg(sObjectives.map(item => item.progressPercent));
  const thesisProgress = avg(sThesis.map(item => item.progressPercent)) || statusProgress(student.thesisStatus === 'Completed' ? 'Completed' : 'In progress');

  if (student.studentType === 'FYP') {
    const final = sMilestones.find(item => /final|presentation|viva/i.test(item.title));
    const finalProgress = final ? final.progressPercent || statusProgress(final.status) : 0;
    return Math.round((milestoneProgress * 0.8) + (finalProgress * 0.2));
  }

  if (student.studentType === 'Master') {
    const paper1 = sPublications.find(item => item.paperNo === 1);
    const publication = paper1 ? publicationProgress(paper1.status) : 0;
    const viva = student.thesisStatus === 'Completed' || student.thesisStatus === 'Submitted to faculty' ? 100 : 0;
    return Math.round((objectiveProgress * 0.4) + (publication * 0.25) + (thesisProgress * 0.25) + (viva * 0.1));
  }

  const paper1 = sPublications.find(item => item.paperNo === 1);
  const paper2 = sPublications.find(item => item.paperNo === 2);
  const paper1Progress = paper1 ? publicationProgress(paper1.status) : 0;
  const paper2Progress = paper2 ? publicationProgress(paper2.status) : 0;
  const viva = student.thesisStatus === 'Completed' || student.thesisStatus === 'Submitted to faculty' ? 100 : 0;
  return Math.round((objectiveProgress * 0.35) + (paper1Progress * 0.2) + (paper2Progress * 0.2) + (thesisProgress * 0.2) + (viva * 0.05));
}

export function calculateTimeUsedPercent(student: StudentProfile): number {
  const start = new Date(student.startDate);
  const maxEnd = new Date(student.maxEndDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(maxEnd.getTime()) || maxEnd <= start) return 0;
  const elapsed = CURRENT_DATE.getTime() - start.getTime();
  const duration = maxEnd.getTime() - start.getTime();
  return Math.max(0, Math.min(100, Math.round((elapsed / duration) * 100)));
}

export function computeAttentionScore(
  student: StudentProfile,
  milestones: StudentMilestone[],
  weeklyUpdates: WeeklyUpdate[],
  publications: StudentPublication[],
  tasks: AcademicTask[],
  thesisChapters: ThesisChapter[] = []
): number {
  const sTasks = tasks.filter(item => item.studentId === student.id);
  const sUpdates = weeklyUpdates.filter(item => item.studentId === student.id);
  const sMilestones = milestones.filter(item => item.studentId === student.id);
  const sPublications = publications.filter(item => item.studentId === student.id);
  const createdAt = new Date(student.startDate);
  const daysSinceStart = Number.isNaN(createdAt.getTime()) ? 999 : (CURRENT_DATE.getTime() - createdAt.getTime()) / 86400000;
  const isNewProfile = daysSinceStart < 14 && sUpdates.length === 0 && sTasks.length === 0 && sMilestones.every(item => item.progressPercent === 0 || item.status === 'Not started');
  const progress = calculateOverallProgress(student, milestones, [], publications, thesisChapters);
  const timeUsed = calculateTimeUsedPercent(student);

  if (isNewProfile) return 0;

  let score = 0;
  const hasOverdue = [...sTasks, ...sMilestones].some(item => item.status === 'Overdue' || (new Date(item.deadline) < CURRENT_DATE && item.status !== 'Completed' && item.status !== 'Approved'));
  if (hasOverdue) score += 30;

  const latestUpdate = sUpdates.map(item => new Date(item.weekStart)).sort((a, b) => b.getTime() - a.getTime())[0];
  if (!latestUpdate && daysSinceStart > 14) score += 20;
  else {
    const days = (CURRENT_DATE.getTime() - latestUpdate.getTime()) / 86400000;
    if (days > 14) score += 20;
    else if (days > 7) score += 10;
  }

  if (timeUsed - progress > 20) score += 25;

  if (student.studentType !== 'FYP') {
    const expectedPapers = student.studentType === 'PhD' ? 2 : 1;
    const healthyPapers = sPublications.filter(item => publicationProgress(item.status) >= 60).length;
    if (healthyPapers < expectedPapers && daysSinceStart > 180) score += 25;
  }

  if (thesisChapters.some(item => item.studentId === student.id && item.progressPercent < 40 && daysSinceStart > 60 && new Date(item.updatedAt) < CURRENT_DATE)) score += 10;
  if (progress >= 75 && sTasks.some(item => item.status !== 'Completed')) score += 15;

  return Math.min(100, score);
}

export function riskFromScore(score: number, progress: number): StudentRisk {
  if (progress >= 100) return 'Completed';
  if (score > 65) return 'Critical';
  if (score > 40) return 'Delayed';
  if (score > 15) return 'Slight delay';
  return 'On track';
}


