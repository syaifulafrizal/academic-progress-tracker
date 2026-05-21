import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  BookOpen,
  Database,
  GraduationCap,
  KeyRound,
  LogOut,
  RotateCcw,
  Shield,
  User,
  Users
} from 'lucide-react';
import LecturerDashboard from './components/LecturerDashboard';
import StudentDashboard from './components/StudentDashboard';
import StudentProfileView from './components/StudentProfileView';
import StudentRegistration from './components/StudentRegistration';
import {
  AcademicTask,
  AppData,
  MeetingLog,
  ReportRecord,
  StudentMilestone,
  StudentProfile,
  TaskStatus,
  UploadedFile,
  User as AppUser,
  WeeklyUpdate
} from './types';
import { buildMilestoneTemplates, loadStoredData, resetStoredData, saveStoredData } from './services/demoStore';
import { isPreviewModeAvailable, isSupabaseConfigured } from './services/supabaseClient';
import {
  createStudentWithDefaults,
  getOrCreateProfile,
  getSession,
  insertMeetingLog,
  insertReport,
  insertTask,
  insertWeeklyUpdate,
  linkStudentAccountByEmail,
  loadSupabaseData,
  signInWithPassword,
  signUpWithPassword,
  signOut,
  updateMilestone,
  updateTaskStatus,
  updateWeeklyFeedback
} from './services/supabaseRepository';

function makeId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function getAuthErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : 'Unable to complete account request.';
  const normalized = message.toLowerCase();
  if (normalized.includes('rate limit') || normalized.includes('email rate limit')) {
    return 'Too many signup emails were requested. Please wait a few minutes before trying again, or disable email confirmation during tester setup.';
  }
  if (normalized.includes('already registered') || normalized.includes('already exists')) {
    return 'An account with this email already exists. Please sign in instead.';
  }
  if (normalized.includes('invalid login') || normalized.includes('invalid credentials')) {
    return 'Email or password is incorrect.';
  }
  if (normalized.includes('invalid api key') || normalized.includes('api key')) {
    return 'Live database connection is misconfigured. Check the Vercel environment variables for the project URL and publishable key, then redeploy.';
  }
  return message;
}

function attachStudentProfileToUser(user: AppUser, remoteData: AppData): AppUser {
  if (user.role !== 'Student') return user;
  const linkedStudent = remoteData.students.find(student => student.userId === user.id) || remoteData.students[0];
  if (!linkedStudent) return user;
  return {
    ...user,
    studentId: linkedStudent.id
  };
}

function LoginScreen({
  users,
  onLogin,
  onSupabaseLogin,
  onSupabaseSignUp
}: {
  users: AppUser[];
  onLogin: (user: AppUser) => void;
  onSupabaseLogin: (email: string, password: string) => Promise<void>;
  onSupabaseSignUp: (name: string, email: string, password: string, role: AppUser['role']) => Promise<void>;
}) {
  const lecturer = users.find(user => user.role === 'Lecturer')!;
  const [name, setName] = useState('');
  const [email, setEmail] = useState(lecturer.email);
  const [password, setPassword] = useState('');
  const [authMode, setAuthMode] = useState<'supabase' | 'preview'>(isSupabaseConfigured ? 'supabase' : 'preview');
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [signupRole, setSignupRole] = useState<AppUser['role']>('Lecturer');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const selectedUser = users.find(user => user.email === email) || lecturer;
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setNotice('');
    setIsSubmitting(true);
    try {
      if (authMode === 'supabase') {
        if (isCreatingAccount) {
          await onSupabaseSignUp(name, email, password, signupRole);
          setNotice('Account created. If email confirmation is enabled in Supabase, confirm the email before signing in.');
          setIsCreatingAccount(false);
        } else {
          await onSupabaseLogin(email, password);
        }
      } else {
        onLogin(selectedUser);
      }
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#eef4fb] text-slate-900 flex">
      <aside className="hidden lg:flex w-[34rem] bg-white border-r border-slate-200 p-12 flex-col justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center">
              <GraduationCap className="h-7 w-7" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">Academic Tracker</p>
              <h1 className="text-2xl font-black tracking-tight">academic-progress-tracker</h1>
            </div>
          </div>

          <div className="mt-16 space-y-8">
            <h2 className="text-5xl font-black tracking-tight leading-tight">Supervision control center for research progress.</h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              Track FYP, Master, and PhD progress through milestones, weekly updates, meetings, thesis progress,
              publications, files, risk ranking, and reports.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            ['Role-based', Shield],
            ['Postgres-ready', Database],
            ['Student portal', User],
            ['Lecturer dashboard', Users]
          ].map(([label, Icon]) => {
            const IconComp = Icon as typeof Shield;
            return (
              <div key={label as string} className="rounded-2xl border border-slate-200 p-4 bg-slate-50">
                <IconComp className="h-5 w-5 text-blue-600 mb-3" />
                <p className="font-bold text-sm">{label as string}</p>
              </div>
            );
          })}
        </div>
      </aside>

      <main className="flex-1 flex items-center justify-center p-6">
        <section className="w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-xl p-7">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">Sign in</p>
              <h2 className="text-2xl font-black mt-1">Workspace access</h2>
            </div>
            <div className="h-11 w-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <KeyRound className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 flex gap-3">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <p>
              {isSupabaseConfigured
                ? isPreviewModeAvailable
                  ? 'Use your academic-progress-tracker account, or switch to preview mode for local sample data.'
                  : 'Use your academic-progress-tracker account to access the live workspace.'
                : 'Preview mode is active. Add connection env vars to enable live accounts and database storage.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="grid grid-cols-2 bg-slate-50 border border-slate-200 rounded-2xl p-1">
              <button
                type="button"
                onClick={() => setAuthMode('supabase')}
                disabled={!isSupabaseConfigured}
                className={`rounded-xl py-2 text-xs font-black ${authMode === 'supabase' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500'} disabled:opacity-40`}
              >
                Sign In
              </button>
              {isPreviewModeAvailable ? (
                <button
                  type="button"
                  onClick={() => setAuthMode('preview')}
                  className={`rounded-xl py-2 text-xs font-black ${authMode === 'preview' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500'}`}
                >
                  Preview Mode
                </button>
              ) : (
                <span className="rounded-xl py-2 text-center text-xs font-black text-slate-400">Live Workspace</span>
              )}
            </div>

            {authMode === 'preview' ? (
              <>
                <label className="block text-xs font-bold uppercase text-slate-500">Choose account</label>
                <select
                  value={email}
                  onChange={event => setEmail(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-blue-100"
                >
                  <optgroup label="Lecturer">
                    {users.filter(user => user.role === 'Lecturer').map(user => (
                      <option key={user.id} value={user.email}>{user.name} - {user.email}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Students">
                    {users.filter(user => user.role === 'Student').map(user => (
                      <option key={user.id} value={user.email}>{user.name} - {user.email}</option>
                    ))}
                  </optgroup>
                </select>
              </>
            ) : (
              <>
                {isCreatingAccount && (
                  <>
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-500">Full name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={event => setName(event.target.value)}
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-blue-100"
                        placeholder="Supervisor or student name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-500">Account type</label>
                      <select
                        value={signupRole}
                        onChange={event => setSignupRole(event.target.value as AppUser['role'])}
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-blue-100"
                      >
                        <option value="Lecturer">Lecturer</option>
                        <option value="Student">Student</option>
                      </select>
                    </div>
                  </>
                )}
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={event => setEmail(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-blue-100"
                    placeholder="you@example.edu"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={event => setPassword(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-blue-100"
                    placeholder="Your account password"
                  />
                </div>
              </>
            )}

            {error && <p className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">{error}</p>}
            {notice && <p className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2">{notice}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black py-3 transition-colors disabled:opacity-60"
            >
              {isSubmitting ? 'Working...' : authMode === 'preview' ? `Continue as ${selectedUser.role}` : isCreatingAccount ? 'Create account' : 'Sign in'}
            </button>
          </form>

          {authMode === 'supabase' && (
            <button
              type="button"
              onClick={() => {
                setError('');
                setNotice('');
                setIsCreatingAccount(value => !value);
              }}
              className="mt-4 w-full text-xs font-black text-blue-700 hover:text-blue-900"
            >
              {isCreatingAccount ? 'Use existing account' : 'Create lecturer or tester account'}
            </button>
          )}

          <div className="mt-6 text-xs text-slate-500 space-y-2">
            <p className="font-bold text-slate-700">Workspace status</p>
            <p>Live database configured: <span className={isSupabaseConfigured ? 'text-emerald-600 font-bold' : 'text-amber-600 font-bold'}>{isSupabaseConfigured ? 'Yes' : 'No'}</span></p>
            {isPreviewModeAvailable && <p>Preview accounts are available for local review.</p>}
          </div>
        </section>
      </main>
    </div>
  );
}

export default function App() {
  const [data, setData] = useState<AppData>(() => loadStoredData());
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [isProductionData, setIsProductionData] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [selectedStudentProfileId, setSelectedStudentProfileId] = useState<string | null>(null);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);

  useEffect(() => {
    if (!isProductionData) saveStoredData(data);
  }, [data, isProductionData]);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    getSession()
      .then(async session => {
        if (!session) return;
        const user = await getOrCreateProfile(session);
        const remoteData = await loadSupabaseData(user);
        setCurrentUser(attachStudentProfileToUser(user, remoteData));
        setData(remoteData);
        setIsProductionData(true);
      })
      .catch(error => console.warn('Supabase session restore failed:', error));
  }, []);

  const refreshRemoteData = async (user = currentUser) => {
    if (!user || !isProductionData) return;
    setIsLoadingData(true);
    try {
      setData(await loadSupabaseData(user));
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleSupabaseLogin = async (email: string, password: string) => {
    const session = await signInWithPassword(email, password);
    if (!session) throw new Error('Email confirmation may be required before signing in.');
    const user = await getOrCreateProfile(session);
    const remoteData = await loadSupabaseData(user);
    setCurrentUser(attachStudentProfileToUser(user, remoteData));
    setData(remoteData);
    setIsProductionData(true);
  };

  const handleSupabaseSignUp = async (name: string, email: string, password: string, role: AppUser['role']) => {
    if (!name.trim()) throw new Error('Name is required.');
    if (password.length < 6) throw new Error('Password must be at least 6 characters.');
    const result = await signUpWithPassword(email, password, name.trim(), role);
    if (!result.session) return;
    const user = await getOrCreateProfile(result.session, name.trim(), role);
    const remoteData = await loadSupabaseData(user);
    setCurrentUser(attachStudentProfileToUser(user, remoteData));
    setData(remoteData);
    setIsProductionData(true);
  };

  const activeStudentProfile = useMemo(() => {
    if (!currentUser || currentUser.role !== 'Student') return null;
    return data.students.find(student => student.id === currentUser.studentId) || null;
  }, [currentUser, data.students]);

  const patchData = (updater: (previous: AppData) => AppData) => {
    setData(previous => updater(previous));
  };

  const handleApproveTask = (taskId: string) => {
    if (isProductionData) {
      updateTaskStatus(taskId, 'Completed').then(() => refreshRemoteData()).catch(error => alert(error.message));
      return;
    }
    patchData(previous => ({
      ...previous,
      tasks: previous.tasks.map(task => task.id === taskId ? { ...task, status: 'Completed' } : task)
    }));
  };

  const handleAddWeeklyUpdate = (newUpdate: Omit<WeeklyUpdate, 'id' | 'createdAt'>) => {
    if (isProductionData) {
      insertWeeklyUpdate(newUpdate).then(() => refreshRemoteData()).catch(error => alert(error.message));
      return;
    }
    const update: WeeklyUpdate = {
      ...newUpdate,
      id: makeId('w'),
      createdAt: new Date().toISOString()
    };

    patchData(previous => {
      const evidenceFile: UploadedFile | null = newUpdate.evidenceFileName
        ? {
            id: makeId('f'),
            studentId: newUpdate.studentId,
            uploadedBy: previous.students.find(student => student.id === newUpdate.studentId)?.name || 'Student',
            fileName: newUpdate.evidenceFileName,
            fileSize: '1.2 MB',
            fileType: newUpdate.evidenceFileName.split('.').pop() || 'pdf',
            relatedItem: newUpdate.relatedMilestoneTitle,
            createdAt: new Date().toISOString().slice(0, 10)
          }
        : null;

      return {
        ...previous,
        weeklyUpdates: [update, ...previous.weeklyUpdates],
        uploadedFiles: evidenceFile ? [evidenceFile, ...previous.uploadedFiles] : previous.uploadedFiles
      };
    });
  };

  const handleToggleTaskState = (taskId: string) => {
    const task = data.tasks.find(item => item.id === taskId);
    if (isProductionData && task) {
      updateTaskStatus(taskId, task.status === 'Completed' ? 'Pending' : 'Completed').then(() => refreshRemoteData()).catch(error => alert(error.message));
      return;
    }
    patchData(previous => ({
      ...previous,
      tasks: previous.tasks.map(task => {
        if (task.id !== taskId) return task;
        return { ...task, status: task.status === 'Completed' ? 'Pending' : 'Completed' };
      })
    }));
  };

  const handleManualFileUpload = (fileName: string, relatedItem: string) => {
    if (!activeStudentProfile) return;
    const file: UploadedFile = {
      id: makeId('f'),
      studentId: activeStudentProfile.id,
      uploadedBy: activeStudentProfile.name,
      fileName,
      fileSize: '740 KB',
      fileType: fileName.split('.').pop() || 'xlsx',
      relatedItem,
      createdAt: new Date().toISOString().slice(0, 10)
    };
    patchData(previous => ({ ...previous, uploadedFiles: [file, ...previous.uploadedFiles] }));
  };

  const handleUpdateMilestoneProgress = (milestoneId: string, progress: number) => {
    if (isProductionData) {
      let status: TaskStatus = 'In progress';
      if (progress === 100) status = 'Approved';
      else if (progress >= 80) status = 'Submitted';
      else if (progress === 0) status = 'Not started';
      updateMilestone(milestoneId, status, progress).then(() => refreshRemoteData()).catch(error => alert(error.message));
      return;
    }
    patchData(previous => ({
      ...previous,
      milestones: previous.milestones.map(milestone => {
        if (milestone.id !== milestoneId) return milestone;
        let status: TaskStatus = 'In progress';
        if (progress === 100) status = 'Approved';
        else if (progress >= 80) status = 'Submitted';
        else if (progress === 0) status = 'Not started';
        return { ...milestone, progressPercent: progress, status };
      })
    }));
  };

  const handleApproveMilestone = (milestoneId: string, newStatus: TaskStatus) => {
    if (isProductionData) {
      const milestone = data.milestones.find(item => item.id === milestoneId);
      updateMilestone(milestoneId, newStatus, newStatus === 'Approved' ? 100 : milestone?.progressPercent || 0).then(() => refreshRemoteData()).catch(error => alert(error.message));
      return;
    }
    patchData(previous => ({
      ...previous,
      milestones: previous.milestones.map(milestone => milestone.id === milestoneId
        ? { ...milestone, status: newStatus, progressPercent: newStatus === 'Approved' ? 100 : milestone.progressPercent }
        : milestone)
    }));
  };

  const handleAddFeedbackToUpdate = (updateId: string, text: string) => {
    if (isProductionData) {
      updateWeeklyFeedback(updateId, text).then(() => refreshRemoteData()).catch(error => alert(error.message));
      return;
    }
    patchData(previous => ({
      ...previous,
      weeklyUpdates: previous.weeklyUpdates.map(update => update.id === updateId
        ? { ...update, feedbackText: text, needFeedback: false }
        : update)
    }));
  };

  const handleAddMeetingLog = (newLog: Omit<MeetingLog, 'id' | 'studentId'>) => {
    if (!selectedStudentProfileId) return;
    if (isProductionData) {
      insertMeetingLog(selectedStudentProfileId, newLog).then(() => refreshRemoteData()).catch(error => alert(error.message));
      return;
    }
    const log: MeetingLog = { ...newLog, id: makeId('ml'), studentId: selectedStudentProfileId };
    patchData(previous => ({ ...previous, meetingLogs: [log, ...previous.meetingLogs] }));
  };

  const handleScheduleMeeting = (studentId: string, newLog: Omit<MeetingLog, 'id' | 'studentId'>) => {
    if (isProductionData) {
      insertMeetingLog(studentId, newLog).then(() => refreshRemoteData()).catch(error => alert(error.message));
      return;
    }
    const log: MeetingLog = { ...newLog, id: makeId('ml'), studentId };
    patchData(previous => ({ ...previous, meetingLogs: [log, ...previous.meetingLogs] }));
  };

  const handleAddTaskForStudentProfile = (title: string, priority: 'High' | 'Medium' | 'Low', relatedArea: string) => {
    if (!selectedStudentProfileId) return;
    const student = data.students.find(item => item.id === selectedStudentProfileId);
    const task: AcademicTask = {
      id: makeId('t'),
      studentId: selectedStudentProfileId,
      studentName: student?.name || 'Student',
      title,
      description: 'Assigned during supervision review.',
      priority,
      deadline: '2025-05-27',
      status: 'Pending',
      relatedArea
    };
    if (isProductionData) {
      insertTask(selectedStudentProfileId, {
        title: task.title,
        description: task.description,
        priority: task.priority,
        deadline: task.deadline,
        status: task.status,
        relatedArea: task.relatedArea
      }).then(() => refreshRemoteData()).catch(error => alert(error.message));
      return;
    }
    patchData(previous => ({ ...previous, tasks: [task, ...previous.tasks] }));
  };

  const handleRegisterStudent = (newStud: Omit<StudentProfile, 'id' | 'riskStatus' | 'attentionScore' | 'thesisStatus' | 'userId'>) => {
    if (isProductionData && currentUser) {
      createStudentWithDefaults(currentUser.id, newStud)
        .then(() => {
          setShowRegistrationForm(false);
          return refreshRemoteData();
        })
        .catch(error => alert(error.message));
      return;
    }
    const studentId = makeId('st');
    const student: StudentProfile = {
      ...newStud,
      id: studentId,
      userId: makeId('u'),
      riskStatus: 'On track',
      attentionScore: 0,
      thesisStatus: 'Not started'
    };

    const user: AppUser = {
      id: student.userId,
      name: student.name,
      email: student.email,
      role: 'Student',
      studentId: student.id
    };

    patchData(previous => ({
      ...previous,
      users: [...previous.users, user],
      students: [...previous.students, student],
      milestones: [...previous.milestones, ...buildMilestoneTemplates(student)]
    }));
    setShowRegistrationForm(false);
  };

  const handleAddStudentTask = (newTask: Omit<AcademicTask, 'id' | 'studentId' | 'studentName'>) => {
    if (!activeStudentProfile) return;
    if (isProductionData) {
      insertTask(activeStudentProfile.id, newTask).then(() => refreshRemoteData()).catch(error => alert(error.message));
      return;
    }
    const task: AcademicTask = {
      ...newTask,
      id: makeId('t'),
      studentId: activeStudentProfile.id,
      studentName: activeStudentProfile.name
    };
    patchData(previous => ({ ...previous, tasks: [task, ...previous.tasks] }));
  };

  const handleGenerateReport = (type: ReportRecord['type']) => {
    const report: ReportRecord = {
      id: makeId('r'),
      title: `${type} Report - ${new Date().toLocaleDateString('en-MY', { month: 'long', year: 'numeric' })}`,
      type,
      generatedBy: currentUser?.name || 'Supervisor',
      createdAt: new Date().toISOString().slice(0, 10),
      downloadUrl: '#'
    };
    if (isProductionData && currentUser) {
      insertReport(currentUser.id, {
        title: report.title,
        type: report.type,
        generatedBy: report.generatedBy,
        createdAt: report.createdAt,
        downloadUrl: report.downloadUrl
      }).then(() => refreshRemoteData()).catch(error => alert(error.message));
      return;
    }
    patchData(previous => ({ ...previous, reports: [report, ...previous.reports] }));
  };

  const handleLinkStudentAccount = (studentId: string) => {
    if (!isProductionData) return;
    linkStudentAccountByEmail(studentId)
      .then(() => refreshRemoteData())
      .catch(error => alert(error.message));
  };

  if (!currentUser) {
    return <LoginScreen users={data.users} onLogin={(user) => { setCurrentUser(user); setIsProductionData(false); }} onSupabaseLogin={handleSupabaseLogin} onSupabaseSignUp={handleSupabaseSignUp} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans" id="academic-app-shell">
      <header className="bg-slate-950 text-white shadow-md sticky top-0 z-40">
        <div className="max-w-[96rem] mx-auto px-4 py-3 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-xl">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider font-mono text-blue-200 font-bold">Academic Tracker</span>
              <h1 className="text-sm font-extrabold text-slate-100 leading-none">academic-progress-tracker</h1>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 text-xs font-semibold flex items-center gap-2">
              {currentUser.role === 'Lecturer' ? <Shield className="w-4 h-4 text-blue-300" /> : <User className="w-4 h-4 text-blue-300" />}
              {currentUser.name} ({currentUser.role})
            </span>
            <span className={`rounded-xl px-3 py-2 text-xs font-bold border ${isProductionData ? 'bg-emerald-950 text-emerald-200 border-emerald-800' : 'bg-amber-950 text-amber-200 border-amber-800'}`}>
              {isProductionData ? 'Live data' : 'Preview data'}
            </span>
            {isLoadingData && <span className="text-xs font-bold text-blue-200">Syncing...</span>}
            <button
              onClick={() => {
                if (isProductionData) {
                  refreshRemoteData();
                } else {
                  resetStoredData();
                  setData(loadStoredData());
                }
              }}
              className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 border border-slate-800 flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              {isProductionData ? 'Refresh Data' : 'Reset Preview'}
            </button>
            <button
              onClick={() => {
                if (isProductionData) signOut().catch(() => undefined);
                setCurrentUser(null);
                setIsProductionData(false);
                setSelectedStudentProfileId(null);
                setShowRegistrationForm(false);
              }}
              className="px-3 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-[96rem] w-full mx-auto p-4 sm:p-6 lg:p-8">
        {currentUser.role === 'Lecturer' ? (
          showRegistrationForm ? (
            <StudentRegistration onRegister={handleRegisterStudent} onCancel={() => setShowRegistrationForm(false)} />
          ) : selectedStudentProfileId ? (
            <StudentProfileView
              student={data.students.find(student => student.id === selectedStudentProfileId)!}
              milestones={data.milestones}
              objectives={data.objectives}
              publications={data.publications}
              weeklyUpdates={data.weeklyUpdates}
              meetingLogs={data.meetingLogs}
              tasks={data.tasks}
              uploadedFiles={data.uploadedFiles}
              onBack={() => setSelectedStudentProfileId(null)}
              onApproveMilestone={handleApproveMilestone}
              onAddFeedbackToUpdate={handleAddFeedbackToUpdate}
              onAddMeetingLog={handleAddMeetingLog}
              onAddTaskForStudent={handleAddTaskForStudentProfile}
              onLinkStudentAccount={handleLinkStudentAccount}
              isProductionData={isProductionData}
              thesisChapters={data.thesisChapters}
            />
          ) : (
            <LecturerDashboard
              students={data.students}
              milestones={data.milestones}
              objectives={data.objectives}
              publications={data.publications}
              weeklyUpdates={data.weeklyUpdates}
              meetingLogs={data.meetingLogs}
              tasks={data.tasks}
              uploadedFiles={data.uploadedFiles}
              onOpenStudentProfile={setSelectedStudentProfileId}
              onAddStudent={() => setShowRegistrationForm(true)}
              onApproveTask={handleApproveTask}
              onApproveWeeklyUpdate={handleAddFeedbackToUpdate}
              onApproveMilestone={handleApproveMilestone}
              onScheduleMeeting={handleScheduleMeeting}
              onGenerateReport={handleGenerateReport}
              thesisChapters={data.thesisChapters}
              reports={data.reports}
            />
          )
        ) : activeStudentProfile ? (
          <StudentDashboard
            currentStudent={activeStudentProfile}
            milestones={data.milestones}
            objectives={data.objectives}
            publications={data.publications}
            weeklyUpdates={data.weeklyUpdates}
            meetingLogs={data.meetingLogs}
            tasks={data.tasks}
            uploadedFiles={data.uploadedFiles}
            onAddWeeklyUpdate={handleAddWeeklyUpdate}
            onAddTask={handleAddStudentTask}
            onToggleTaskState={handleToggleTaskState}
            onFileUpload={handleManualFileUpload}
            onUpdateMilestoneProgress={handleUpdateMilestoneProgress}
            thesisChapters={data.thesisChapters}
          />
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center">
            <BookOpen className="w-8 h-8 text-blue-600 mx-auto mb-3" />
            <h2 className="text-xl font-black">No student profile linked</h2>
            <p className="text-sm text-slate-500 mt-2">Ask the administrator to link this user account to a student profile.</p>
          </div>
        )}
      </main>
    </div>
  );
}

