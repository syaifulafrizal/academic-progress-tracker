import { Session } from '@supabase/supabase-js';
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
import { createInitialData } from './demoStore';
import { authRedirectUrl, supabase } from './supabaseClient';

type ProfileRow = {
  id: string;
  name: string;
  email: string;
  role: User['role'];
};

type StudentRow = {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  student_type: StudentProfile['studentType'];
  start_date: string;
  expected_end_date: string;
  max_end_date: string;
  research_title: string;
  risk_status: StudentProfile['riskStatus'];
  attention_score: number;
  thesis_status: StudentProfile['thesisStatus'];
  avatar_url: string | null;
};

function assertSupabase() {
  if (!supabase) throw new Error('Supabase is not configured.');
  return supabase;
}

export async function getSession() {
  const client = assertSupabase();
  const { data, error } = await client.auth.getSession();
  if (error) throw error;
  return data.session;
}

export async function signInWithPassword(email: string, password: string) {
  const client = assertSupabase();
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.session;
}

export async function signUpWithPassword(email: string, password: string, name: string, role: User['role']) {
  const client = assertSupabase();
  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: authRedirectUrl,
      data: { name, role }
    }
  });
  if (error) throw error;
  if (!data.user) {
    return { session: null, needsEmailConfirmation: true };
  }

  if (data.session) {
    const { error: profileError } = await client.from('profiles').upsert({
      id: data.user.id,
      name,
      email,
      role
    });
    if (profileError) throw profileError;
  }

  return {
    session: data.session,
    needsEmailConfirmation: !data.session
  };
}

export async function signOut() {
  const client = assertSupabase();
  const { error } = await client.auth.signOut();
  if (error) throw error;
}

export async function getOrCreateProfile(session: Session, fallbackName = 'User', fallbackRole: User['role'] = 'Lecturer'): Promise<User> {
  const client = assertSupabase();
  const authUser = session.user;
  const { data: existing, error } = await client.from('profiles').select('*').eq('id', authUser.id).maybeSingle<ProfileRow>();
  if (error) throw error;

  let profile = existing;
  if (!profile) {
    const { data: inserted, error: insertError } = await client
      .from('profiles')
      .insert({
        id: authUser.id,
        name: authUser.user_metadata?.name || fallbackName,
        email: authUser.email || '',
        role: fallbackRole
      })
      .select('*')
      .single<ProfileRow>();
    if (insertError) throw insertError;
    profile = inserted;
  }

  return {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    role: profile.role
  };
}

function mapStudent(row: StudentRow): StudentProfile {
  return {
    id: row.id,
    userId: row.user_id || '',
    name: row.name,
    email: row.email,
    studentType: row.student_type,
    startDate: row.start_date,
    expectedEndDate: row.expected_end_date,
    maxEndDate: row.max_end_date,
    researchTitle: row.research_title,
    riskStatus: row.risk_status,
    attentionScore: row.attention_score,
    thesisStatus: row.thesis_status,
    avatarUrl: row.avatar_url || undefined
  };
}

export async function loadSupabaseData(currentUser: User): Promise<AppData> {
  const client = assertSupabase();
  const fallback = createInitialData();

  let studentsQuery = client.from('students').select('*');
  if (currentUser.role === 'Student') studentsQuery = studentsQuery.eq('user_id', currentUser.id);
  else studentsQuery = studentsQuery.eq('lecturer_id', currentUser.id);

  const { data: studentRows, error: studentsError } = await studentsQuery.order('created_at', { ascending: true }).returns<StudentRow[]>();
  if (studentsError) throw studentsError;

  const students = (studentRows || []).map(mapStudent);
  const studentIds = students.map(student => student.id);
  const emptyData: AppData = {
    ...fallback,
    users: [currentUser],
    students,
    milestones: [],
    objectives: [],
    publications: [],
    weeklyUpdates: [],
    meetingLogs: [],
    tasks: [],
    uploadedFiles: [],
    thesisChapters: [],
    reports: []
  };
  if (studentIds.length === 0) return emptyData;

  const [
    milestones,
    objectives,
    publications,
    thesisChapters,
    weeklyUpdates,
    meetingLogs,
    tasks,
    uploadedFiles,
    reports
  ] = await Promise.all([
    client.from('student_milestones').select('*').in('student_id', studentIds),
    client.from('research_objectives').select('*').in('student_id', studentIds),
    client.from('publications').select('*').in('student_id', studentIds),
    client.from('thesis_chapters').select('*').in('student_id', studentIds),
    client.from('weekly_updates').select('*').in('student_id', studentIds),
    client.from('meeting_logs').select('*').in('student_id', studentIds),
    client.from('academic_tasks').select('*').in('student_id', studentIds),
    client.from('uploaded_files').select('*').in('student_id', studentIds),
    currentUser.role === 'Lecturer'
      ? client.from('reports').select('*').eq('generated_by', currentUser.id)
      : Promise.resolve({ data: [], error: null })
  ]);

  const errors = [milestones, objectives, publications, thesisChapters, weeklyUpdates, meetingLogs, tasks, uploadedFiles, reports].map(result => result.error).filter(Boolean);
  if (errors.length) throw errors[0];

  return {
    ...emptyData,
    milestones: (milestones.data || []).map((row: any): StudentMilestone => ({
      id: row.id,
      studentId: row.student_id,
      title: row.title,
      period: row.period,
      expectedOutput: row.expected_output,
      deadline: row.deadline,
      status: row.status,
      progressPercent: row.progress_percent
    })),
    objectives: (objectives.data || []).map((row: any): ResearchObjective => ({
      id: row.id,
      studentId: row.student_id,
      objectiveNo: row.objective_no,
      description: row.description,
      progressPercent: row.progress_percent,
      status: row.status
    })),
    publications: (publications.data || []).map((row: any): StudentPublication => ({
      id: row.id,
      studentId: row.student_id,
      paperNo: row.paper_no,
      title: row.title,
      targetJournal: row.target_journal,
      status: row.status,
      submissionDate: row.submission_date || undefined,
      acceptanceDate: row.acceptance_date || undefined
    })),
    thesisChapters: (thesisChapters.data || []).map((row: any): ThesisChapter => ({
      id: row.id,
      studentId: row.student_id,
      chapterNo: row.chapter_no,
      title: row.title,
      status: row.status,
      progressPercent: row.progress_percent,
      wordCount: row.word_count,
      updatedAt: row.updated_at
    })),
    weeklyUpdates: (weeklyUpdates.data || []).map((row: any): WeeklyUpdate => ({
      id: row.id,
      studentId: row.student_id,
      weekStart: row.week_start,
      completedThisWeek: row.completed_this_week,
      notCompleted: row.not_completed,
      blocker: row.blocker,
      planForNextWeek: row.plan_for_next_week,
      relatedMilestoneId: row.related_milestone_id || '',
      relatedMilestoneTitle: row.related_milestone_title,
      deadline: row.deadline,
      needFeedback: row.need_feedback,
      feedbackText: row.feedback_text || undefined,
      evidenceFileName: row.evidence_file_name || undefined,
      createdAt: row.created_at
    })),
    meetingLogs: (meetingLogs.data || []).map((row: any): MeetingLog => ({
      id: row.id,
      studentId: row.student_id,
      meetingDate: row.meeting_date,
      summary: row.summary,
      supervisorFeedback: row.supervisor_feedback,
      actionItems: row.action_items || [],
      deadline: row.deadline,
      nextMeetingDate: row.next_meeting_date
    })),
    tasks: (tasks.data || []).map((row: any): AcademicTask => ({
      id: row.id,
      studentId: row.student_id,
      studentName: students.find(student => student.id === row.student_id)?.name,
      title: row.title,
      description: row.description,
      priority: row.priority,
      deadline: row.deadline,
      status: row.status,
      relatedArea: row.related_area
    })),
    uploadedFiles: (uploadedFiles.data || []).map((row: any): UploadedFile => ({
      id: row.id,
      studentId: row.student_id,
      uploadedBy: currentUser.name,
      fileName: row.file_name,
      fileSize: row.file_size,
      fileType: row.file_type,
      relatedItem: row.related_item,
      createdAt: row.created_at
    })),
    reports: (reports.data || []).map((row: any): ReportRecord => ({
      id: row.id,
      title: row.title,
      type: row.type,
      generatedBy: currentUser.name,
      createdAt: row.created_at,
      downloadUrl: row.download_url || undefined
    }))
  };
}

export async function createStudentWithDefaults(lecturerId: string, input: Omit<StudentProfile, 'id' | 'riskStatus' | 'attentionScore' | 'thesisStatus' | 'userId'>) {
  const client = assertSupabase();
  const { data: student, error } = await client
    .from('students')
    .insert({
      lecturer_id: lecturerId,
      name: input.name,
      email: input.email,
      student_type: input.studentType,
      start_date: input.startDate,
      expected_end_date: input.expectedEndDate,
      max_end_date: input.maxEndDate,
      research_title: input.researchTitle,
      risk_status: 'On track',
      attention_score: 0,
      thesis_status: 'Not started'
    })
    .select('*')
    .single<StudentRow>();
  if (error) throw error;

  const { data: templates, error: templateError } = await client
    .from('milestone_templates')
    .select('*')
    .eq('student_type', input.studentType)
    .order('default_order', { ascending: true });
  if (templateError) throw templateError;

  if (templates?.length) {
    const year = Number(input.startDate.slice(0, 4)) || new Date().getFullYear();
    const milestoneRows = templates.map((template: any, index: number) => ({
      student_id: student.id,
      title: template.title,
      period: template.period,
      expected_output: template.expected_output,
      deadline: `${year + (index > 2 ? 1 : 0)}-${String(Math.min(12, 6 + index)).padStart(2, '0')}-28`,
      status: 'Not started',
      progress_percent: 0
    }));
    const { error: milestoneError } = await client.from('student_milestones').insert(milestoneRows);
    if (milestoneError) throw milestoneError;
  }

  const thesisRows = ['Introduction', 'Literature Review', 'Methodology', 'Results and Discussion', 'Conclusion'].map((title, index) => ({
    student_id: student.id,
    chapter_no: index + 1,
    title: `Chapter ${index + 1}: ${title}`,
    status: 'Not started',
    progress_percent: 0,
    word_count: 0
  }));
  const { error: thesisError } = await client.from('thesis_chapters').insert(thesisRows);
  if (thesisError) throw thesisError;

  return mapStudent(student);
}

export async function linkStudentAccountByEmail(studentId: string) {
  const client = assertSupabase();
  const { data, error } = await client.rpc('link_student_account_by_email', {
    target_student_id: studentId
  }).single<StudentRow>();
  if (error) throw error;
  return mapStudent(data);
}

export async function updateMilestone(milestoneId: string, status: StudentMilestone['status'], progressPercent: number) {
  const client = assertSupabase();
  const { error } = await client.from('student_milestones').update({ status, progress_percent: progressPercent }).eq('id', milestoneId);
  if (error) throw error;
}

export async function insertTask(studentId: string, task: Omit<AcademicTask, 'id' | 'studentId' | 'studentName'>) {
  const client = assertSupabase();
  const { error } = await client.from('academic_tasks').insert({
    student_id: studentId,
    title: task.title,
    description: task.description,
    priority: task.priority,
    deadline: task.deadline,
    status: task.status,
    related_area: task.relatedArea
  });
  if (error) throw error;
}

export async function updateTaskStatus(taskId: string, status: AcademicTask['status']) {
  const client = assertSupabase();
  const { error } = await client.from('academic_tasks').update({ status }).eq('id', taskId);
  if (error) throw error;
}

export async function insertWeeklyUpdate(update: Omit<WeeklyUpdate, 'id' | 'createdAt'>) {
  const client = assertSupabase();
  const { error } = await client.from('weekly_updates').insert({
    student_id: update.studentId,
    week_start: update.weekStart,
    completed_this_week: update.completedThisWeek,
    not_completed: update.notCompleted,
    blocker: update.blocker,
    plan_for_next_week: update.planForNextWeek,
    related_milestone_id: update.relatedMilestoneId || null,
    related_milestone_title: update.relatedMilestoneTitle,
    deadline: update.deadline,
    need_feedback: update.needFeedback,
    evidence_file_name: update.evidenceFileName || null
  });
  if (error) throw error;
}

export async function updateWeeklyFeedback(updateId: string, feedbackText: string) {
  const client = assertSupabase();
  const { error } = await client.from('weekly_updates').update({ feedback_text: feedbackText, need_feedback: false }).eq('id', updateId);
  if (error) throw error;
}

export async function insertMeetingLog(studentId: string, log: Omit<MeetingLog, 'id' | 'studentId'>) {
  const client = assertSupabase();
  const { error } = await client.from('meeting_logs').insert({
    student_id: studentId,
    meeting_date: log.meetingDate,
    summary: log.summary,
    supervisor_feedback: log.supervisorFeedback,
    action_items: log.actionItems,
    deadline: log.deadline,
    next_meeting_date: log.nextMeetingDate
  });
  if (error) throw error;
}

export async function insertReport(userId: string, report: Omit<ReportRecord, 'id'>) {
  const client = assertSupabase();
  const { error } = await client.from('reports').insert({
    title: report.title,
    type: report.type,
    generated_by: userId,
    download_url: report.downloadUrl || null
  });
  if (error) throw error;
}
