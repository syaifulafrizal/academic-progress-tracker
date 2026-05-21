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
import { isSupabaseConfigured } from './services/supabaseClient';

function makeId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function LoginScreen({
  users,
  onLogin
}: {
  users: AppUser[];
  onLogin: (user: AppUser) => void;
}) {
  const lecturer = users.find(user => user.role === 'Lecturer')!;
  const student = users.find(user => user.role === 'Student')!;
  const [email, setEmail] = useState(lecturer.email);

  const selectedUser = users.find(user => user.email === email) || lecturer;

  return (
    <div className="min-h-screen bg-[#eef4fb] text-slate-900 flex">
      <aside className="hidden lg:flex w-[34rem] bg-white border-r border-slate-200 p-12 flex-col justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center">
              <GraduationCap className="h-7 w-7" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">ProgressPilot</p>
              <h1 className="text-2xl font-black tracking-tight">Research Progress Tracker</h1>
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
              Preview mode is active. Add Supabase env vars to enable production Auth, Postgres, and Storage.
            </p>
          </div>

          <label className="block mt-6 text-xs font-bold uppercase text-slate-500">Choose account</label>
          <select
            value={email}
            onChange={event => setEmail(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-blue-100"
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

          <button
            onClick={() => onLogin(selectedUser)}
            className="mt-6 w-full rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black py-3 transition-colors"
          >
            Continue as {selectedUser.role}
          </button>

          <div className="mt-6 text-xs text-slate-500 space-y-2">
            <p className="font-bold text-slate-700">Production status</p>
            <p>Supabase configured: <span className={isSupabaseConfigured ? 'text-emerald-600 font-bold' : 'text-amber-600 font-bold'}>{isSupabaseConfigured ? 'Yes' : 'No'}</span></p>
            <p>Database schema: `supabase/migrations/001_initial_schema.sql`</p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default function App() {
  const [data, setData] = useState<AppData>(() => loadStoredData());
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [selectedStudentProfileId, setSelectedStudentProfileId] = useState<string | null>(null);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);

  useEffect(() => {
    saveStoredData(data);
  }, [data]);

  const activeStudentProfile = useMemo(() => {
    if (!currentUser || currentUser.role !== 'Student') return null;
    return data.students.find(student => student.id === currentUser.studentId) || null;
  }, [currentUser, data.students]);

  const patchData = (updater: (previous: AppData) => AppData) => {
    setData(previous => updater(previous));
  };

  const handleApproveTask = (taskId: string) => {
    patchData(previous => ({
      ...previous,
      tasks: previous.tasks.map(task => task.id === taskId ? { ...task, status: 'Completed' } : task)
    }));
  };

  const handleAddWeeklyUpdate = (newUpdate: Omit<WeeklyUpdate, 'id' | 'createdAt'>) => {
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
    patchData(previous => ({
      ...previous,
      milestones: previous.milestones.map(milestone => milestone.id === milestoneId
        ? { ...milestone, status: newStatus, progressPercent: newStatus === 'Approved' ? 100 : milestone.progressPercent }
        : milestone)
    }));
  };

  const handleAddFeedbackToUpdate = (updateId: string, text: string) => {
    patchData(previous => ({
      ...previous,
      weeklyUpdates: previous.weeklyUpdates.map(update => update.id === updateId
        ? { ...update, feedbackText: text, needFeedback: false }
        : update)
    }));
  };

  const handleAddMeetingLog = (newLog: Omit<MeetingLog, 'id' | 'studentId'>) => {
    if (!selectedStudentProfileId) return;
    const log: MeetingLog = { ...newLog, id: makeId('ml'), studentId: selectedStudentProfileId };
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
    patchData(previous => ({ ...previous, tasks: [task, ...previous.tasks] }));
  };

  const handleRegisterStudent = (newStud: Omit<StudentProfile, 'id' | 'riskStatus' | 'attentionScore' | 'thesisStatus' | 'userId'>) => {
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
    patchData(previous => ({ ...previous, reports: [report, ...previous.reports] }));
  };

  if (!currentUser) {
    return <LoginScreen users={data.users} onLogin={setCurrentUser} />;
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
              <span className="text-[10px] uppercase tracking-wider font-mono text-blue-200 font-bold">ProgressPilot</span>
              <h1 className="text-sm font-extrabold text-slate-100 leading-none">Research Progress Tracker</h1>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 text-xs font-semibold flex items-center gap-2">
              {currentUser.role === 'Lecturer' ? <Shield className="w-4 h-4 text-blue-300" /> : <User className="w-4 h-4 text-blue-300" />}
              {currentUser.name} ({currentUser.role})
            </span>
            <span className={`rounded-xl px-3 py-2 text-xs font-bold border ${isSupabaseConfigured ? 'bg-emerald-950 text-emerald-200 border-emerald-800' : 'bg-amber-950 text-amber-200 border-amber-800'}`}>
              {isSupabaseConfigured ? 'Supabase connected' : 'Local preview mode'}
            </span>
            <button
              onClick={() => {
                resetStoredData();
                setData(loadStoredData());
              }}
              className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 border border-slate-800 flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset Preview
            </button>
            <button
              onClick={() => {
                setCurrentUser(null);
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

