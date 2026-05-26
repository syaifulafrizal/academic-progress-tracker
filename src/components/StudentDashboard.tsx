/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  CheckCircle, Plus, Calendar, CheckSquare, Upload, ArrowRight, Save, 
  Paperclip, PlusCircle, History, MessageSquare, ExternalLink, ListChecks,
  User, BookOpen, Clock, AlertTriangle, FileText, ChevronRight, Settings,
  MapPin, Bell, Search, Star, Award, Sparkles, Check, Send, Download, ChevronLeft
} from 'lucide-react';
import { motion } from 'motion/react';
import { 
  StudentProfile, StudentMilestone, ResearchObjective, 
  StudentPublication, WeeklyUpdate, MeetingLog, AcademicTask, UploadedFile, StudentType, ThesisChapter
} from '../types';
import { calculateOverallProgress, calculateTimeUsedPercent } from '../services/analytics';

interface StudentDashboardProps {
  currentStudent: StudentProfile;
  milestones: StudentMilestone[];
  objectives: ResearchObjective[];
  publications: StudentPublication[];
  weeklyUpdates: WeeklyUpdate[];
  meetingLogs: MeetingLog[];
  tasks: AcademicTask[];
  uploadedFiles: UploadedFile[];
  onAddWeeklyUpdate: (update: Omit<WeeklyUpdate, 'id' | 'createdAt'>) => void;
  onAddTask: (task: Omit<AcademicTask, 'id' | 'studentId' | 'studentName'>) => void;
  onToggleTaskState: (taskId: string) => void;
  onFileUpload: (fileName: string, relatedItem: string) => void;
  onUpdateMilestoneProgress: (milestoneId: string, progress: number) => void;
  thesisChapters?: ThesisChapter[];
}

export default function StudentDashboard({
  currentStudent,
  milestones,
  objectives,
  publications,
  weeklyUpdates,
  meetingLogs,
  tasks,
  uploadedFiles,
  onAddWeeklyUpdate,
  onAddTask,
  onToggleTaskState,
  onFileUpload,
  onUpdateMilestoneProgress,
  thesisChapters = []
}: StudentDashboardProps) {
  const getDateAfterDays = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().slice(0, 10);
  };
  
  // Driving sidebar items (Image 1 sidebars)
  const [activeSidebarTab, setActiveSidebarTab] = useState<'Dashboard' | 'Milestones' | 'WeeklyTasks' | 'Meetings' | 'Thesis' | 'Publications' | 'Uploads' | 'Feedback' | 'Calendar' | 'Settings'>('Dashboard');
  
  // Search bar query
  const [searchQuery, setSearchQuery] = useState('');

  // Local state for interactive rating stars
  const [userRating, setUserRating] = useState(5);

  // Submit update form states
  const [completedText, setCompletedText] = useState('');
  const [notCompletedText, setNotCompletedText] = useState('');
  const [blockerText, setBlockerText] = useState('');
  const [nextPlanText, setNextPlanText] = useState('');
  const [relatedMilestoneId, setRelatedMilestoneId] = useState('');
  const [deadlineDate, setDeadlineDate] = useState(() => getDateAfterDays(7));
  const [needFeedback, setNeedFeedback] = useState(false);
  const [tempFileName, setTempFileName] = useState('');
  const [manualFileName, setManualFileName] = useState('');
  const [selectedMilestoneForUpload, setSelectedMilestoneForUpload] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);

  // Submit academic task form states
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [newTaskDeadline, setNewTaskDeadline] = useState(() => getDateAfterDays(7));
  const [newTaskArea, setNewTaskArea] = useState('General');
  const today = useMemo(() => new Date(), []);
  const [visibleCalendarMonth, setVisibleCalendarMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));

  // Submit publication form state
  const [showPubForm, setShowPubForm] = useState(false);
  const [newPubTitle, setNewPubTitle] = useState('');
  const [newPubJournal, setNewPubJournal] = useState('');

  // Filter student-specific records
  const myMilestones = useMemo(() => milestones.filter(m => m.studentId === currentStudent.id), [milestones, currentStudent]);
  const myObjectives = useMemo(() => objectives.filter(o => o.studentId === currentStudent.id), [objectives, currentStudent]);
  const myPublications = useMemo(() => publications.filter(p => p.studentId === currentStudent.id), [publications, currentStudent]);
  const myUpdates = useMemo(() => weeklyUpdates.filter(u => u.studentId === currentStudent.id), [weeklyUpdates, currentStudent]);
  const myMeetingLogs = useMemo(() => meetingLogs.filter(ml => ml.studentId === currentStudent.id), [meetingLogs, currentStudent]);
  const myTasks = useMemo(() => tasks.filter(t => t.studentId === currentStudent.id), [tasks, currentStudent]);
  const myFiles = useMemo(() => uploadedFiles.filter(f => f.studentId === currentStudent.id), [uploadedFiles, currentStudent]);
  const myThesisChapters = useMemo(() => thesisChapters.filter(t => t.studentId === currentStudent.id), [thesisChapters, currentStudent]);
  const studentCalendarEvents = useMemo(() => {
    const events: {
      id: string;
      date: string;
      title: string;
      time: string;
      type: 'Own meeting' | 'Supervisor busy' | 'Task' | 'Milestone' | 'Weekly update';
      visibility: 'mine' | 'busy';
      detail: string;
    }[] = [];

    myMeetingLogs.forEach(log => {
      events.push({
        id: `meeting_${log.id}`,
        date: log.meetingDate,
        title: 'Your progress meeting',
        time: '10:00 AM - 11:00 AM',
        type: 'Own meeting',
        visibility: 'mine',
        detail: log.summary
      });
      events.push({
        id: `next_${log.id}`,
        date: log.nextMeetingDate,
        title: 'Next meeting reserved',
        time: '10:00 AM - 11:00 AM',
        type: 'Own meeting',
        visibility: 'mine',
        detail: 'Reserved follow-up meeting with supervisor.'
      });
    });

    meetingLogs
      .filter(log => log.studentId !== currentStudent.id)
      .forEach((log, index) => {
        events.push({
          id: `busy_${log.id}`,
          date: log.meetingDate,
          title: 'Supervisor busy',
          time: index % 2 === 0 ? '2:00 PM - 3:00 PM' : '11:00 AM - 12:00 PM',
          type: 'Supervisor busy',
          visibility: 'busy',
          detail: 'Another student meeting. Student name hidden to keep the slot private.'
        });
        events.push({
          id: `busy_next_${log.id}`,
          date: log.nextMeetingDate,
          title: 'Supervisor busy',
          time: index % 2 === 0 ? '3:00 PM - 4:00 PM' : '9:00 AM - 10:00 AM',
          type: 'Supervisor busy',
          visibility: 'busy',
          detail: 'Another student follow-up slot. Avoid scheduling over this time.'
        });
      });

    myTasks.forEach(task => {
      events.push({
        id: `task_${task.id}`,
        date: task.deadline,
        title: task.title,
        time: '11:59 PM',
        type: 'Task',
        visibility: 'mine',
        detail: task.description
      });
    });

    myMilestones.forEach(milestone => {
      events.push({
        id: `milestone_${milestone.id}`,
        date: milestone.deadline,
        title: milestone.title,
        time: '11:59 PM',
        type: 'Milestone',
        visibility: 'mine',
        detail: milestone.expectedOutput
      });
    });

    myUpdates.forEach(update => {
      events.push({
        id: `update_${update.id}`,
        date: update.deadline,
        title: `Weekly update: ${update.relatedMilestoneTitle}`,
        time: '11:59 PM',
        type: 'Weekly update',
        visibility: 'mine',
        detail: update.planForNextWeek
      });
    });

    return events.sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
  }, [currentStudent.id, meetingLogs, myMeetingLogs, myMilestones, myTasks, myUpdates]);

  const formatLocalDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const studentVisibleCalendarEvents = useMemo(() => {
    return studentCalendarEvents.filter(event => {
      const date = new Date(event.date);
      return date.getFullYear() === visibleCalendarMonth.getFullYear() && date.getMonth() === visibleCalendarMonth.getMonth();
    });
  }, [studentCalendarEvents, visibleCalendarMonth]);

  const studentCalendarMonthLabel = visibleCalendarMonth.toLocaleDateString('en-MY', { month: 'long', year: 'numeric' });
  const studentDaysInMonth = new Date(visibleCalendarMonth.getFullYear(), visibleCalendarMonth.getMonth() + 1, 0).getDate();
  const studentFirstDayOffset = new Date(visibleCalendarMonth.getFullYear(), visibleCalendarMonth.getMonth(), 1).getDay();
  const changeStudentCalendarMonth = (offset: number) => {
    setVisibleCalendarMonth(previous => new Date(previous.getFullYear(), previous.getMonth() + offset, 1));
  };

  // Set default form values dynamically
  React.useEffect(() => {
    if (myMilestones.length > 0) {
      setRelatedMilestoneId(myMilestones[0].id);
      setSelectedMilestoneForUpload(myMilestones[0].title);
    }
  }, [myMilestones]);

  const handleSubmitWeeklyLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!completedText || !nextPlanText) {
      alert("Please enter what you completed and your plan for next week.");
      return;
    }

    const milestone = myMilestones.find(m => m.id === relatedMilestoneId);
    
    onAddWeeklyUpdate({
      studentId: currentStudent.id,
      weekStart: new Date().toISOString().slice(0, 10),
      completedThisWeek: completedText,
      notCompleted: notCompletedText || 'None.',
      blocker: blockerText || 'None.',
      planForNextWeek: nextPlanText,
      relatedMilestoneId,
      relatedMilestoneTitle: milestone?.title || 'General Objectives',
      deadline: deadlineDate,
      needFeedback,
      evidenceFileName: tempFileName || undefined
    });

    setCompletedText('');
    setNotCompletedText('');
    setBlockerText('');
    setNextPlanText('');
    setNeedFeedback(false);
    setTempFileName('');
    alert("Weekly update successfully sent to Supervisor!");
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle) return;

    onAddTask({
      title: newTaskTitle,
      description: newTaskDesc || 'Added via quick interface.',
      priority: newTaskPriority,
      deadline: newTaskDeadline,
      status: 'Pending',
      relatedArea: newTaskArea
    });

    setNewTaskTitle('');
    setNewTaskDesc('');
    alert("New custom task posted under your checklist!");
  };

  const handleUploadDirectly = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = manualFileName || 'progress-evidence.pdf';
    onFileUpload(finalName, selectedMilestoneForUpload);
    setManualFileName('');
    alert(`File "${finalName}" uploaded successfully under "${selectedMilestoneForUpload}"!`);
  };

  const handleAddPublicationClicked = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPubTitle || !newPubJournal) return;
    
    alert(`Publication "${newPubTitle}" submitted for review to "${newPubJournal}".`);
    setNewPubTitle('');
    setNewPubJournal('');
    setShowPubForm(false);
  };

  // SVGs for Radial Donut (Time Used vs Remaining)
  const radius = 30;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius; // ~188.49
  const timeUsedPercent = calculateTimeUsedPercent(currentStudent);
  const strokeDashoffset = circumference - (timeUsedPercent / 100) * circumference;

  // SVGs for Graduation Readiness (Semi-circle Gauge)
  const radiusGauge = 35;
  const strokeWidthGauge = 8;
  const circumferenceGauge = Math.PI * radiusGauge; // ~110
  const readinessPercent = calculateOverallProgress(currentStudent, myMilestones, myObjectives, myPublications, myThesisChapters);
  const strokeDashoffsetGauge = circumferenceGauge - (readinessPercent / 100) * circumferenceGauge;
  const pendingStudentEvents = studentCalendarEvents
    .filter(event => event.visibility === 'mine' && event.date >= formatLocalDate(today))
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
  const nextDeadlineEvent = pendingStudentEvents.find(event => event.type !== 'Own meeting');
  const nextMeetingEvent = pendingStudentEvents.find(event => event.type === 'Own meeting') || studentCalendarEvents.find(event => event.type === 'Own meeting');
  const latestMeeting = [...myMeetingLogs].sort((a, b) => b.meetingDate.localeCompare(a.meetingDate))[0];
  const latestFeedback = myUpdates.find(update => update.feedbackText)?.feedbackText || latestMeeting?.supervisorFeedback;
  const completedMilestonesCount = myMilestones.filter(milestone => milestone.status === 'Approved').length;
  const completedPublicationsCount = myPublications.filter(pub => pub.status === 'Accepted' || pub.status === 'Published').length;
  const completedThesisCount = myThesisChapters.filter(chapter => chapter.status === 'Approved' || chapter.progressPercent >= 100).length;
  const completedMeetingCount = myMeetingLogs.filter(log => log.meetingDate <= formatLocalDate(today)).length;
  const studentNotifications = useMemo(() => {
    const pendingTasks = myTasks
      .filter(task => task.status !== 'Completed')
      .slice(0, 3)
      .map(task => ({
        id: `task-${task.id}`,
        title: 'Pending task',
        detail: `${task.title} due ${task.deadline}`,
        action: () => setActiveSidebarTab('WeeklyTasks')
      }));
    const upcomingMeeting = nextMeetingEvent ? [{
      id: `meeting-${nextMeetingEvent.id}`,
      title: 'Upcoming meeting',
      detail: `${nextMeetingEvent.title} on ${nextMeetingEvent.date} at ${nextMeetingEvent.time}`,
      action: () => setActiveSidebarTab('Meetings')
    }] : [];
    const feedback = myUpdates
      .filter(update => update.feedbackText)
      .slice(0, 2)
      .map(update => ({
        id: `feedback-${update.id}`,
        title: 'Supervisor feedback received',
        detail: update.relatedMilestoneTitle,
        action: () => setActiveSidebarTab('Feedback')
      }));
    return [...upcomingMeeting, ...feedback, ...pendingTasks].slice(0, 6);
  }, [myTasks, myUpdates, nextMeetingEvent]);

  return (
    <div className="flex bg-[#f4f7fc] min-h-screen relative" id="student-workspace-container">
      {/* LEFT SIDEBAR VIEW (Matching Image 1 EXACTLY) */}
      <aside className="w-64 bg-[#091830] text-slate-300 md:flex flex-col justify-between shrink-0 shadow-xl hidden relative border-r border-[#0d2242]">
        <div className="flex flex-col">
          {/* Logo / Crest Block */}
          <div className="p-6 flex items-center gap-3 border-b border-[#0d22x2] border-opacity-30">
            <div className="p-2 bg-indigo-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <div>
              <h2 className="text-white text-sm font-sans font-extrabold tracking-tight uppercase leading-tight">
                Academic Tracker
              </h2>
              <p className="text-[10px] text-zinc-400 font-mono tracking-wider">Progress Tracker</p>
            </div>
          </div>

          {/* Navigation Items list */}
          <div className="p-4 space-y-1">
            <span className="px-3 text-[10px] font-mono font-bold tracking-widest text-[#415a77] uppercase block mb-2">Workspace</span>
            
            {[
              { id: 'Dashboard', label: 'Dashboard', icon: CheckSquare },
              { id: 'Milestones', label: 'My Milestones', icon: Calendar },
              { id: 'WeeklyTasks', label: 'Weekly Tasks', icon: ListChecks },
              { id: 'Meetings', label: 'Meeting Summary', icon: MessageSquare },
              { id: 'Thesis', label: 'Thesis Progress', icon: FileText },
              { id: 'Publications', label: 'Publications', icon: BookOpen },
              { id: 'Uploads', label: 'Uploads', icon: Upload },
              { id: 'Feedback', label: 'Feedback', icon: Award },
              { id: 'Calendar', label: 'Calendar', icon: Calendar },
              { id: 'Settings', label: 'Settings', icon: Settings }
            ].map(item => {
              const IconComp = item.icon;
              const isActive = activeSidebarTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSidebarTab(item.id as any)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-indigo-600 text-white shadow-md' 
                      : 'hover:bg-[#112443] hover:text-white'
                  }`}
                >
                  <IconComp className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* BOTTOM PROFILE BOX (Sidebar bottom - Matching Image 1) */}
        <div className="p-4 border-t border-[#0e2446]">
          <div className="p-3 bg-[#102547] rounded-2xl flex items-center gap-3">
            <img 
              src={currentStudent.avatarUrl || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150'} 
              className="w-10 h-10 rounded-xl object-cover" 
              alt={currentStudent.name}
              referrerPolicy="no-referrer"
            />
            <div>
              <h4 className="text-white text-xs font-bold font-sans tracking-tight">{currentStudent.name}</h4>
              <p className="text-[10px] text-zinc-400 font-mono tracking-tight">{currentStudent.studentType} Candidate</p>
              <p className="text-[9px] text-zinc-500 font-mono leading-none mt-1">ID: {currentStudent.id}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* RIGHT MAIN WORKSPACE PAGE */}
      <div className="flex-grow flex flex-col min-w-0" id="student-main-content-area">
        {/* TOP COMPREHENSIVE HEADER HEADER */}
        <header className="bg-white border-b border-slate-100 py-3.5 px-6 flex items-center justify-between shadow-xs sticky top-0 z-30 font-sans">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold font-sans text-slate-900 tracking-tight flex items-center gap-2">
              Student Dashboard
            </h1>

            <span className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-[10px] font-bold text-slate-600 uppercase tracking-wide">
              {currentStudent.studentType} workspace
            </span>
          </div>

          {/* Search bar + Profile & Alert notifications */}
          <div className="flex items-center gap-4 shrink-0">
            {/* Search Input Box */}
            <div className="relative w-72 hidden md:block">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
              <input 
                type="text" 
                placeholder="Search tasks, milestones, meetings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-full py-1.5 pl-10 pr-4 text-xs text-slate-800 outline-none focus:bg-white focus:border-indigo-500 transition-all font-sans"
              />
            </div>

            {/* Alerts Bell notification badge */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowNotifications(value => !value)}
                className="relative p-2 hover:bg-slate-50 rounded-xl cursor-pointer"
                aria-label="Open notifications"
              >
                <Bell className="w-4 h-4 text-slate-600" />
                {studentNotifications.length > 0 && (
                  <span className="absolute top-1 right-1 min-w-4 h-4 px-1 bg-red-500 text-white text-[8px] font-mono font-bold rounded-full flex items-center justify-center">
                    {studentNotifications.length}
                  </span>
                )}
              </button>
              {showNotifications && (
                <div className="absolute right-0 top-11 z-50 w-80 rounded-2xl border border-slate-200 bg-white shadow-xl p-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h4 className="text-xs font-black text-slate-900">Notifications</h4>
                    <button onClick={() => setShowNotifications(false)} className="text-[10px] font-bold text-slate-400 hover:text-slate-600">Close</button>
                  </div>
                  <div className="mt-2 space-y-2 max-h-80 overflow-y-auto">
                    {studentNotifications.length === 0 ? (
                      <p className="text-xs text-slate-500 p-3 bg-slate-50 rounded-xl">No active notifications.</p>
                    ) : studentNotifications.map(item => (
                      <button
                        key={item.id}
                        onClick={() => {
                          item.action();
                          setShowNotifications(false);
                        }}
                        className="w-full text-left p-3 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-100 transition-colors"
                      >
                        <strong className="block text-xs text-slate-900">{item.title}</strong>
                        <span className="block text-[11px] text-slate-500 mt-1">{item.detail}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Profile badge snippet */}
            <div className="flex items-center gap-2 border-l border-slate-100 pl-4">
              <img 
                src={currentStudent.avatarUrl || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150'} 
                className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-200"
                alt={currentStudent.name}
                referrerPolicy="no-referrer"
              />
              <span className="text-xs font-bold text-slate-700 hidden sm:inline">{currentStudent.name}</span>
            </div>
          </div>
        </header>

        {/* CONTAINER WORKSPACE WRAPPER */}
        <div className="p-6 md:p-8 space-y-6 flex-grow overflow-y-auto">
          
          {/* VIEW: MAIN DASHBOARD */}
          {activeSidebarTab === 'Dashboard' && (
            <div className="space-y-6">
              
              {/* TOP BIG PROFILE CARD PANEL */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs flex flex-col md:flex-row items-center gap-6 justify-between">
                <div className="flex items-center gap-4">
                  <img 
                    src={currentStudent.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'} 
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-100 shrink-0" 
                    alt={currentStudent.name}
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight font-sans">
                        {currentStudent.name}
                      </h2>
                      <span className="bg-blue-500 text-white rounded-full p-0.5" title="Verified Cohort Candidate">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    </div>
                    <p className="text-xs font-bold font-mono text-indigo-600 uppercase mt-0.5">{currentStudent.studentType} Student</p>
                    <p className="text-xs font-sans text-slate-400 mt-1">Academic progress workspace</p>
                  </div>
                </div>

                {/* Grid stats matching Image 1 */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 shrink-0 w-full md:w-auto p-4 bg-slate-50 border border-slate-200/50 rounded-2xl">
                  <div>
                    <span className="text-[10px] text-slate-400 font-mono uppercase font-bold text-slate-400 block mb-0.5">Program</span>
                    <strong className="text-xs text-slate-800 block">{currentStudent.studentType}</strong>
                    <span className="text-[10px] text-slate-500 font-sans block mt-0.5">Research Progress</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-mono uppercase font-bold text-slate-400 block mb-0.5">Expected Graduation</span>
                    <strong className="text-xs text-slate-800 block">{currentStudent.expectedEndDate}</strong>
                    <span className="text-[10px] text-[#2ec4b6] font-semibold block mt-0.5">Target completion</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-mono uppercase font-bold text-slate-400 block mb-0.5">Student ID</span>
                    <strong className="text-xs text-slate-800 block">{currentStudent.id}</strong>
                  </div>
                </div>
              </div>

              {/* TOP ROW OF STATIC DIAGNOSTIC TILES (4 cards) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" id="stats-tiles-student">
                {/* Tile 1 */}
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-mono font-bold text-slate-400">Overall Progress</span>
                    <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">{readinessPercent}%</h3>
                    <span className="text-[10px] bg-emerald-50 text-emerald-600 font-bold px-1.5 py-0.5 rounded-md inline-block">
                      +6% vs last month ↗
                    </span>
                  </div>
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl shrink-0">
                    <Award className="w-6 h-6" />
                  </div>
                </div>

                {/* Tile 2 */}
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-mono font-bold text-slate-400">Time to Graduation</span>
                    <h3 className="text-2xl font-extrabold text-[#2a9d8f] tracking-tight">{Math.max(0, 100 - timeUsedPercent)}%</h3>
                    <span className="text-[10px] text-slate-400 block">Study time remaining</span>
                  </div>
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl shrink-0">
                    <Clock className="w-6 h-6" />
                  </div>
                </div>

                {/* Tile 3 */}
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-mono font-bold text-slate-400">Current Status</span>
                    <h3 className="text-2xl font-extrabold text-purple-600 tracking-tight">On Track</h3>
                    <span className="text-[10px] text-slate-400 block">Good progress</span>
                  </div>
                  <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl shrink-0">
                    <Sparkles className="w-6 h-6" />
                  </div>
                </div>

                {/* Tile 4 */}
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-mono font-bold text-slate-400">Next Deadline</span>
                    <h3 className="text-[15px] font-extrabold text-orange-600 tracking-tight">
                      {nextDeadlineEvent ? new Date(nextDeadlineEvent.date).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' }) : 'No upcoming deadline'}
                    </h3>
                    <span className="text-[10px] text-slate-400 truncate block">{nextDeadlineEvent?.title || 'Nothing scheduled yet'}</span>
                  </div>
                  <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl shrink-0">
                    <Calendar className="w-6 h-6" />
                  </div>
                </div>
              </div>

              {/* TIMELINES, CIRCLE GRAPHS & MEETING WIDGETS ROW */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="progress-indicator-stepper-donut">
                {/* Stepper (Left 7 Columns) */}
                <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-100 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-mono font-bold uppercase text-slate-400">Graduation Progress</h4>
                    <span className="text-xs font-mono text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded">{readinessPercent}%</span>
                  </div>

                  <div className="mt-4 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600 rounded-full transition-all duration-500" style={{ width: `${readinessPercent}%` }} />
                  </div>

                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {myMilestones.length === 0 ? (
                      <p className="text-xs text-slate-400 bg-slate-50 border border-slate-100 rounded-xl p-3 sm:col-span-2">No milestones assigned yet.</p>
                    ) : myMilestones.slice(0, 6).map((milestone, index) => {
                      const isDone = milestone.status === 'Approved' || milestone.status === 'Completed';
                      const isInProg = milestone.status === 'In progress' || milestone.status === 'Submitted';
                      return (
                        <div key={milestone.id} className="rounded-2xl border border-slate-100 bg-slate-50/60 p-3 min-w-0">
                          <div className="flex items-start gap-2 min-w-0">
                            <div className={`mt-0.5 h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                              isDone ? 'bg-emerald-500 border-emerald-500 text-white' :
                              isInProg ? 'bg-indigo-600 border-indigo-600 text-white' :
                              'bg-white border-slate-300 text-slate-500'
                            }`}>
                              {isDone ? <Check className="w-3 h-3 stroke-[3]" /> : <span className="text-[9px] font-bold">{index + 1}</span>}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-slate-800 truncate" title={milestone.title}>{milestone.title}</p>
                              <div className="mt-1 flex items-center justify-between gap-2">
                                <span className="text-[10px] text-slate-400 font-mono">{new Date(milestone.deadline).toLocaleDateString('en-MY', { month: 'short', year: 'numeric' })}</span>
                                <span className="text-[10px] text-indigo-600 font-mono font-bold">{milestone.progressPercent}%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Time Used vs Remaining radial donut (Middle 3 Columns) */}
                <div className="lg:col-span-3 bg-white p-6 rounded-3xl border border-slate-100 shadow-xs flex flex-col justify-between items-center text-center">
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-400 text-left w-full mb-2">
                    Time Used vs Remaining
                  </span>

                  <div className="relative flex items-center justify-center h-28 w-28">
                    {/* SVG Radial circle */}
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 80 80">
                      <circle 
                        cx="40" 
                        cy="40" 
                        r={radius} 
                        fill="transparent" 
                        stroke="#f1f5f9" 
                        strokeWidth={strokeWidth} 
                      />
                      <circle 
                        cx="40" 
                        cy="40" 
                        r={radius} 
                        fill="transparent" 
                        stroke="#3490dc" 
                        strokeWidth={strokeWidth}
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        className="transition-all duration-500"
                      />
                    </svg>

                    {/* Donut Center text */}
                  <div className="absolute text-center">
                      <strong className="text-xl font-extrabold text-slate-900 font-mono block">{timeUsedPercent}%</strong>
                      <span className="text-[9px] text-slate-400 font-sans block leading-none">time used</span>
                    </div>
                  </div>

                  {/* Donut Legend */}
                  <div className="flex gap-4 text-[10px] font-mono mt-2">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#3490dc]" /> Time Used ({timeUsedPercent}%)
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#f1f5f9]" /> Rem. ({Math.max(0, 100 - timeUsedPercent)}%)
                    </span>
                  </div>
                </div>

                {/* Next Meeting widget (Right 2 Columns) */}
                <div className="lg:col-span-3 bg-white p-5 rounded-3xl border border-slate-100 shadow-xs flex flex-col justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block">Next Meeting</span>
                  
                  <div className="mt-2 text-xs">
                    <strong className="text-indigo-600 block font-mono">
                      {nextMeetingEvent ? `${new Date(nextMeetingEvent.date).toLocaleDateString('en-MY', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })} • ${nextMeetingEvent.time}` : 'No meeting scheduled'}
                    </strong>
                    <h4 className="text-sm font-extrabold leading-tight text-slate-800 mt-1">{nextMeetingEvent?.title || 'Awaiting supervisor schedule'}</h4>
                  </div>

                  <div className="flex items-center gap-2 mt-3">
                    <img 
                      src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100" 
                      className="w-8 h-8 rounded-full object-cover border border-indigo-150 shrink-0" 
                      alt="Supervisor"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-700 block">Supervisor</span>
                      <span className="text-[10px] text-slate-400 block font-mono">Supervisor</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => setActiveSidebarTab('Meetings')}
                    className="w-full mt-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-sans font-bold py-2 rounded-xl text-xs transition-colors cursor-pointer text-center"
                  >
                    View Meeting Details
                  </button>
                </div>
              </div>

              {/* THREE COLUMN GRID LAYOUT (Deep layout mirroring Image 1) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
                
                {/* Column 1: My Milestones List (4 Columns) */}
                <div className="lg:col-span-4 bg-white p-5 rounded-3xl border border-slate-100 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-slate-800 font-sans">My Milestones</h3>
                    <button 
                      onClick={() => setActiveSidebarTab('Milestones')}
                      className="text-[10px] font-bold text-indigo-600 hover:underline"
                    >
                      View all milestones →
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {myMilestones.length === 0 ? (
                      <p className="text-xs text-slate-400 bg-slate-50 border border-slate-100 rounded-xl p-3">No milestones assigned yet.</p>
                    ) : myMilestones.slice(0, 6).map((mil, mIdx) => (
                      <div 
                        key={mil.id}
                        className="flex items-center justify-between p-2.5 hover:bg-slate-50 rounded-xl border border-slate-100/40 transition-colors"
                      >
                        <span className="text-xs font-semibold text-slate-700">{mil.title}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 border rounded-full ${
                          mil.status === 'Approved' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                          mil.status === 'Submitted' ? 'bg-indigo-100 text-indigo-800 border-indigo-200' :
                          mil.status === 'In progress' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                          'bg-slate-100 text-slate-600 border-slate-200'
                        }`}>
                          {mil.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Column 2: This Week's Tasks Table (4 Columns) */}
                <div className="lg:col-span-5 bg-white p-5 rounded-3xl border border-slate-100 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-slate-800 font-sans">This Week&apos;s Tasks</h3>
                    <button 
                      onClick={() => setActiveSidebarTab('WeeklyTasks')}
                      className="text-[10px] font-bold text-indigo-600 hover:underline"
                    >
                      View all tasks →
                    </button>
                  </div>

                  {/* Tasks Table layout */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 font-mono text-[9px] uppercase">
                          <th className="pb-2">Task</th>
                          <th className="pb-2">Deadline</th>
                          <th className="pb-2">Status</th>
                          <th className="pb-2 text-right">Priority</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {myTasks.slice(0, 5).map(task => {
                          const isDone = task.status === 'Completed';
                          return (
                            <tr key={task.id} className="hover:bg-slate-50/50">
                              <td className="py-2.5 pr-2">
                                <span className={`font-semibold block truncate w-32 ${isDone ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                                  {task.title}
                                </span>
                              </td>
                              <td className="py-2.5 text-slate-500 text-[10px] font-mono whitespace-nowrap">{task.deadline}</td>
                              <td className="py-2.5">
                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                                  isDone ? 'bg-emerald-50 text-emerald-700' : 'bg-orange-50 text-orange-700'
                                }`}>
                                  {task.status}
                                </span>
                              </td>
                              <td className="py-2.5 text-right font-bold text-[10px]">
                                <span className={task.priority === 'High' ? 'text-red-500' : 'text-slate-400'}>
                                  {task.priority}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Column 3: Recent Meeting Summaries (3 Columns) */}
                <div className="lg:col-span-3 bg-white p-5 rounded-3xl border border-slate-100 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-bold text-slate-800 font-sans">Recent Meeting Summary</h3>
                      <span className="text-[9px] font-mono text-zinc-400">{latestMeeting?.meetingDate || 'No meetings yet'}</span>
                    </div>

                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-2.5">
                      <span className="text-xs font-bold text-slate-700">Supervisor</span>
                      
                      {/* Interactive rate */}
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((starVal) => (
                          <button
                            key={starVal}
                            onClick={() => setUserRating(starVal)}
                            className="focus:outline-none cursor-pointer"
                          >
                            <Star className={`w-3.5 h-3.5 ${
                              starVal <= userRating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'
                            }`} />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="text-xs space-y-2">
                      <p className="text-slate-650 leading-relaxed italic border-l-2 border-indigo-200 pl-2">
                        {latestMeeting ? `"${latestMeeting.summary}"` : 'No meeting summary has been recorded yet.'}
                      </p>

                      <strong className="text-[9px] uppercase font-mono text-slate-400 block mt-2">Next Action Items</strong>
                      <div className="space-y-1 text-slate-600 font-sans">
                        {(latestMeeting?.actionItems.length ? latestMeeting.actionItems : ['No action items assigned yet.']).map(item => (
                          <label key={item} className="flex items-start gap-1.5 text-xs select-none">
                            <input type="checkbox" className="mt-0.5 rounded text-indigo-600 focus:ring-none" />
                            <span>{item}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => setActiveSidebarTab('Meetings')}
                    className="w-full mt-4 text-[#4361ee] hover:underline font-mono text-[10px] text-center font-bold"
                  >
                    View all meeting summaries →
                  </button>
                </div>

              </div>

              {/* BOTTOM DETAILED BENTO GRID ROAD OF BOARDS */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
                
                {/* 1. Publication Progress List (3 Columns) */}
                <div className="lg:col-span-4 bg-white p-5 rounded-3xl border border-slate-100 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs font-extrabold text-slate-900 uppercase font-mono">Publication Progress</h4>
                      <button 
                        onClick={() => setActiveSidebarTab('Publications')}
                        className="text-[10px] text-indigo-600"
                      >
                        View all publications →
                      </button>
                    </div>

                    <div className="space-y-3">
                      {myPublications.length === 0 ? (
                        <p className="text-xs text-slate-400 bg-slate-50 border border-slate-100 rounded-xl p-3">No publications recorded yet.</p>
                      ) : myPublications.map(pub => (
                        <div key={pub.id} className="p-3 bg-slate-50 border border-slate-200/50 rounded-xl text-xs">
                          <strong className="text-slate-800 line-clamp-1">{pub.title}</strong>
                          <span className="text-[10px] text-slate-450 block italic mt-0.5">{pub.targetJournal}</span>
                          <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-200/40">
                            <span className="text-[9px] text-zinc-400 font-mono">{pub.submissionDate ? `Submitted ${pub.submissionDate}` : 'No submission date'}</span>
                            <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold border ${
                              pub.status === 'Submitted' ? 'bg-indigo-50 text-indigo-700 border-indigo-150' : 'bg-purple-50 text-purple-700 border-purple-150'
                            }`}>
                              {pub.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button 
                    onClick={() => setShowPubForm(!showPubForm)} 
                    className="w-full mt-4 rounded-xl border border-dashed border-slate-200 hover:border-indigo-400 py-2.5 text-xs text-slate-500 hover:text-indigo-600 font-semibold cursor-pointer transition-colors text-center"
                  >
                    + Add New Publication
                  </button>

                  {/* Submit Mini Form */}
                  {showPubForm && (
                    <form onSubmit={handleAddPublicationClicked} className="mt-3 p-3 border border-slate-100 rounded-xl space-y-2 bg-slate-50">
                      <input 
                        type="text" 
                        required
                        placeholder="Paper title" 
                        value={newPubTitle}
                        onChange={(e) => setNewPubTitle(e.target.value)}
                        className="w-full bg-white text-xs border border-slate-200 rounded p-1.5"
                      />
                      <input 
                        type="text" 
                        required
                        placeholder="Target journal" 
                        value={newPubJournal}
                        onChange={(e) => setNewPubJournal(e.target.value)}
                        className="w-full bg-white text-xs border border-slate-200 rounded p-1.5"
                      />
                      <button type="submit" className="w-full bg-indigo-600 text-white text-xs py-1 rounded">Submit</button>
                    </form>
                  )}
                </div>

                {/* 2. Thesis Progress chapters bar charts (3 columns) */}
                <div className="lg:col-span-3 bg-white p-5 rounded-3xl border border-slate-100 shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-extrabold text-slate-900 uppercase font-mono">Thesis Progress (Chapters)</h4>
                    <span className="text-[10px] text-indigo-600 cursor-pointer hover:underline" onClick={() => setActiveSidebarTab('Thesis')}>View all chapters &rarr;</span>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    {myThesisChapters.length === 0 ? (
                      <p className="text-xs text-slate-400 bg-slate-50 border border-slate-100 rounded-xl p-3">No thesis chapters initialized yet.</p>
                    ) : myThesisChapters.slice(0, 5).map((ch, cIndex) => (
                      <div key={cIndex}>
                        <div className="flex justify-between text-[11px] mb-0.5 uppercase tracking-wide font-mono text-slate-500">
                          <span>{ch.title}</span>
                          <span className="font-bold">{ch.progressPercent}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`${ch.progressPercent >= 100 ? 'bg-emerald-500' : ch.progressPercent > 0 ? 'bg-blue-500' : 'bg-slate-200'} h-full rounded-full transition-all`} 
                            style={{ width: `${ch.progressPercent}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Upcoming Deadlines calendar list (2 columns) */}
                <div className="lg:col-span-2 bg-white p-5 rounded-3xl border border-slate-100 shadow-xs">
                  <span className="text-[10px] font-mono font-bold text-slate-400 block mb-3 uppercase">Upcoming Deadlines</span>
                  
                  <div className="space-y-3 font-sans">
                    {pendingStudentEvents.length === 0 ? (
                      <p className="text-xs text-slate-400 bg-slate-50 border border-slate-100 rounded-xl p-3">No upcoming deadlines.</p>
                    ) : pendingStudentEvents.slice(0, 4).map((dead, dIdx) => (
                      <div key={dIdx} className="flex gap-2.5 items-center">
                        <div className="bg-indigo-50 text-indigo-700 rounded-xl p-1.5 w-10 text-center shrink-0">
                          <span className="text-[9px] font-bold block leading-none">{new Date(dead.date).toLocaleDateString('en-MY', { month: 'short' }).toUpperCase()}</span>
                          <span className="text-sm font-black leading-none mt-0.5 block font-mono">{new Date(dead.date).getDate()}</span>
                        </div>
                        <div className="min-w-0">
                          <h5 className="text-xs font-bold text-slate-800 leading-tight truncate">{dead.title}</h5>
                          <span className="text-[9px] text-slate-505 text-slate-400 font-mono mt-0.5 block">{dead.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. Supervisor Feedback list (2 columns) */}
                <div className="lg:col-span-3 bg-white p-5 rounded-3xl border border-slate-100 shadow-xs flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-[#2ec4b6] block mb-3 uppercase flex items-center justify-between">
                      <span>Supervisor Feedback</span> 
                      <span className="bg-[#2ec4b6]/10 text-[#2ec4b6] px-1.5 py-0.2 rounded-md font-bold uppercase text-[8px]">Latest</span>
                    </span>

                    <div className="text-xs border-b border-slate-100 pb-2 mb-2">
                      <strong className="text-slate-800 block">Supervisor</strong>
                      <p className="text-slate-500 leading-relaxed mt-1">
                        {latestFeedback ? `"${latestFeedback}"` : 'No supervisor feedback has been recorded yet.'}
                      </p>
                    </div>

                    <strong className="text-[9px] uppercase font-mono text-zinc-400 block mt-1">Suggested Focus This Week</strong>
                    <div className="space-y-1 text-[11px] text-slate-600 mt-1 font-sans">
                      {(myTasks.filter(task => task.status !== 'Completed').slice(0, 3).map(task => task.title).length
                        ? myTasks.filter(task => task.status !== 'Completed').slice(0, 3).map(task => task.title)
                        : ['No pending focus items.']).map(item => (
                        <div key={item} className="flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-500" /> {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 5. Graduation Readiness semicircle (2 columns) */}
                <div className="lg:col-span-12 xl:col-span-4 bg-white p-5 rounded-3xl border border-slate-100 shadow-xs flex flex-col justify-between items-center text-center">
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-405 text-slate-400 text-left w-full">Graduation Readiness</span>
                  
                  <div className="relative flex items-center justify-center mt-3 h-20 w-36">
                    {/* Semi-circle Gauge */}
                    <svg className="w-full h-full transform" viewBox="0 0 80 45">
                      <path 
                        d="M 10 40 A 30 30 0 0 1 70 40" 
                        fill="transparent" 
                        stroke="#f1f5f9" 
                        strokeWidth={strokeWidthGauge} 
                        strokeLinecap="round"
                      />
                      <path 
                        d="M 10 40 A 30 30 0 0 1 70 40" 
                        fill="transparent" 
                        stroke="#10b981" 
                        strokeWidth={strokeWidthGauge}
                        strokeDasharray={circumferenceGauge}
                        strokeDashoffset={strokeDashoffsetGauge}
                        strokeLinecap="round"
                        className="transition-all duration-500"
                      />
                    </svg>

                    {/* Gauge text overlay */}
                    <div className="absolute bottom-1 text-center">
                      <strong className="text-2xl font-extrabold text-slate-900 block font-mono">{readinessPercent}%</strong>
                      <span className="text-[9px] text-emerald-600 font-mono font-bold uppercase">On Track</span>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-450 mt-1">You are making progress toward your completion target.</p>

                  <div className="w-full text-left space-y-1.5 border-t border-slate-100 pt-3 mt-3 text-xs text-slate-600 font-sans">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Check className="w-4 h-4 text-emerald-500" /> Milestones Completed
                      </span>
                      <strong className="font-mono">{completedMilestonesCount} / {myMilestones.length || 0}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Check className="w-4 h-4 text-emerald-500" /> Publications
                      </span>
                      <strong className="font-mono">{completedPublicationsCount} / {myPublications.length || 0}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Check className="w-4 h-4 text-emerald-500" /> Thesis Chapters
                      </span>
                      <strong className="font-mono">{completedThesisCount} / {myThesisChapters.length || 0}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Check className="w-4 h-4 text-emerald-500" /> Meetings Completed
                      </span>
                      <strong className="font-mono">{completedMeetingCount} / {myMeetingLogs.length || 0}</strong>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* VIEW: TIMELINE MILESTONES (Live progress updating!) */}
          {activeSidebarTab === 'Milestones' && (
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900 font-sans">My Milestones Map</h3>
                  <p className="text-xs text-slate-500 font-sans mt-0.5">Your structured timeline designed for your candidate category.</p>
                </div>
                <span className="text-xs font-mono font-bold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg">
                  {myMilestones.filter(m => m.status === 'Approved').length} / {myMilestones.length} Completed
                </span>
              </div>

              {/* Incremental update range inputs */}
              <div className="relative border-l-2 border-indigo-100 ml-4 pl-6 space-y-5">
                {myMilestones.map((mil, idx) => {
                  const isUnderReview = mil.status === 'Submitted';
                  const isApproved = mil.status === 'Approved';
                  return (
                    <div key={mil.id} className="relative z-10">
                      <span className={`absolute -left-10 mt-1 w-7 h-7 rounded-full border-2 flex items-center justify-center font-mono font-bold text-xs shadow-xs ${
                        isApproved ? 'bg-emerald-500 text-white border-white' : 
                        isUnderReview ? 'bg-indigo-500 text-white border-white' : 'bg-white border-slate-300 text-slate-600'
                      }`}>
                        {idx + 1}
                      </span>

                      <div className="p-4 bg-slate-50 border border-slate-200/50 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                          <span className="bg-white/80 border border-slate-200 text-slate-450 px-2 py-0.5 text-[9px] font-mono rounded font-bold">{mil.period}</span>
                          <h4 className="font-bold text-slate-900 text-sm mt-1">{mil.title}</h4>
                          <p className="text-xs text-slate-500 mt-1 italic"><strong className="font-mono text-[9px] uppercase tracking-wider">Target:</strong> {mil.expectedOutput}</p>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                            isApproved ? 'bg-emerald-50 text-emerald-800 border-emerald-150' :
                            isUnderReview ? 'bg-indigo-50 text-indigo-805 text-indigo-800 border-indigo-150 animate-pulse' :
                            'bg-amber-50 text-amber-800 border-amber-150'
                          }`}>
                            {mil.status}
                          </span>

                          <div className="flex items-center gap-2">
                            <input 
                              type="range" 
                              min="0" 
                              max="100" 
                              step="5"
                              value={mil.progressPercent}
                              onChange={(e) => onUpdateMilestoneProgress(mil.id, parseInt(e.target.value))}
                              className="w-24 accent-indigo-600 h-1 rounded bg-slate-200 cursor-pointer"
                            />
                            <span className="text-xs font-mono font-bold text-slate-600">{mil.progressPercent}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* VIEW: WEEKLY TASKS LIST CHECKLIST */}
          {activeSidebarTab === 'WeeklyTasks' && (
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900 font-sans">Progress Action Items Checklist</h3>
                  <p className="text-xs text-slate-500 font-sans mt-0.5">Assigned by the supervisor or added manually for current work cycles.</p>
                </div>
                <span className="text-xs font-mono font-bold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg">
                  {myTasks.filter(t => t.status !== 'Completed').length} Pending
                </span>
              </div>

              {/* Tasks Checklist Grid */}
              <div className="divide-y divide-slate-150 border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/10">
                {myTasks.map(task => (
                  <div key={task.id} className="p-4 flex items-start justify-between gap-3 hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-start gap-3">
                      <button 
                        onClick={() => {
                          onToggleTaskState(task.id);
                        }}
                        className={`p-1 rounded transition-colors cursor-pointer ${
                          task.status === 'Completed' ? 'text-emerald-500 hover:text-emerald-700' : 'text-slate-300 hover:text-slate-500'
                        }`}
                      >
                        <CheckCircle className="w-5 h-5 shrink-0" />
                      </button>
                      <div>
                        <h4 className={`text-sm font-semibold text-slate-800 ${task.status === 'Completed' ? 'line-through text-slate-400' : ''}`}>
                          {task.title}
                        </h4>
                        <p className={`text-xs text-slate-500 mt-1 ${task.status === 'Completed' ? 'line-through text-slate-400' : ''}`}>
                          {task.description}
                        </p>
                        <div className="flex items-center gap-2 text-[9px] font-mono text-zinc-400 mt-1.5 uppercase">
                          <span>Area: {task.relatedArea}</span> •{' '}
                          <span>Priority: <strong className={task.priority === 'High' ? 'text-red-500' : 'text-slate-505'}>{task.priority}</strong></span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`text-[9px] font-bold px-2 py-0.5 border rounded-full ${
                        task.status === 'Completed' ? 'bg-emerald-50 text-emerald-805 border-emerald-150' : 'bg-orange-50 text-orange-855 text-orange-700 border-orange-150'
                      }`}>
                        {task.status}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-1 font-mono">{task.deadline}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Custom Task Form */}
              <form onSubmit={handleCreateTask} className="bg-slate-50 p-4 rounded-2xl border border-slate-200/50 space-y-4">
                <h4 className="text-xs font-mono font-bold uppercase text-slate-505 text-slate-500">Post New Workspace Task</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input 
                    type="text" 
                    required
                    placeholder="Task summary title"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    className="w-full bg-white text-xs border border-slate-200 rounded-xl p-2.5 outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <input 
                    type="text" 
                    placeholder="Additional detail"
                    value={newTaskDesc}
                    onChange={(e) => setNewTaskDesc(e.target.value)}
                    className="w-full bg-white text-xs border border-slate-200 rounded-xl p-2.5 outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as any)}
                    className="bg-white text-xs border border-slate-200 rounded-xl p-2.5 outline-none"
                  >
                    <option value="High">High Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="Low">Low Priority</option>
                  </select>
                </div>
                <button 
                  type="submit" 
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 text-xs rounded-xl cursor-pointer"
                >
                  Create Task
                </button>
              </form>
            </div>
          )}

          {/* VIEW: LAB CONFERENCES MEETINGS */}
          {activeSidebarTab === 'Meetings' && (
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900 font-sans">Progress Meeting Summaries</h3>
                  <p className="text-xs text-slate-500 font-sans mt-0.5">Review meeting notes, action items, and supervisor feedback.</p>
                </div>
              </div>

              {/* Grid of logs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {myMeetingLogs.map(log => (
                  <div key={log.id} className="p-5 bg-slate-50 border border-slate-200/50 rounded-2xl space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-200/40 pb-2">
                      <span className="text-xs font-mono font-bold text-indigo-600">Sync Date: {log.meetingDate}</span>
                      <span className="text-[10px] text-slate-400 font-mono">Next: {log.nextMeetingDate}</span>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[9px] uppercase font-mono text-zinc-400 block font-bold">Discussion Summary</span>
                      <p className="text-xs text-slate-700 leading-relaxed">{log.summary}</p>
                    </div>

                    <div className="p-3 bg-indigo-50/50 border border-indigo-150/50 rounded-xl space-y-1">
                      <span className="text-[9px] uppercase font-mono text-indigo-700 block font-bold">Supervisor Directives</span>
                      <p className="text-xs text-indigo-950 font-semibold italic">&quot;{log.supervisorFeedback}&quot;</p>
                    </div>

                    <div className="space-y-1 bg-white p-3 border border-slate-200/55 rounded-xl">
                      <span className="text-[9px] uppercase font-mono text-slate-400 block font-bold">Assigned Checklist Targets</span>
                      <ul className="list-disc pl-4 text-xs text-slate-650 space-y-1">
                        {log.actionItems.map((act, aI) => (
                          <li key={aI} className="font-semibold">{act}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW: WEEKLY UPDATES FORM */}
          {activeSidebarTab === 'Feedback' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Report builder */}
              <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-6">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900 font-sans">Report Weekly Progress update</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Feed detailed logs to the supervisor to address attention priorities.</p>
                </div>

                <form onSubmit={handleSubmitWeeklyLog} className="space-y-4 text-xs font-sans">
                  <div>
                    <label className="text-xs font-mono font-bold text-slate-450 block mb-1">What did you complete this week? *</label>
                    <textarea 
                      required
                      rows={3}
                      placeholder="e.g. Completed retinopathic model hyperparameter sweeps and compiled validation data matrices."
                      value={completedText}
                      onChange={(e) => setCompletedText(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-mono font-bold text-slate-450 block mb-1">Planned but not complete</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Simulation edge latency is lagging."
                        value={notCompletedText}
                        onChange={(e) => setNotCompletedText(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-mono font-bold text-slate-450 block mb-1">Blockers/Issues faced</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Hard disk allocation limits in research workspace."
                        value={blockerText}
                        onChange={(e) => setBlockerText(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-mono font-bold text-slate-450 block mb-1">Plan for next week *</label>
                      <input 
                        type="text" 
                        required
                        placeholder="e.g. Write response matrices for IEEE review board."
                        value={nextPlanText}
                        onChange={(e) => setNextPlanText(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-mono font-bold text-slate-450 block mb-1">Submission target date</label>
                      <input 
                        type="date" 
                        value={deadlineDate}
                        onChange={(e) => setDeadlineDate(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none font-mono"
                      />
                    </div>
                  </div>

                  {/* Drag and drop file segment */}
                  <div>
                    <label className="text-xs font-mono font-bold text-slate-450 block mb-2">Attach evidence document proof</label>
                    <div className="border border-dashed border-slate-300 rounded-2xl p-6 text-center hover:bg-slate-50/50 cursor-pointer transition-colors"
                      onClick={() => {
                        const fileNames = ['progress-evidence.pdf', 'thesis-draft.docx', 'results-summary.xlsx'];
                        const pick = fileNames[Math.floor(Math.random() * fileNames.length)];
                        setTempFileName(pick);
                      }}
                    >
                      <Upload className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
                      <p className="text-xs text-slate-600 font-semibold">
                        {tempFileName ? `Picked: ${tempFileName}` : 'Select Evidence File'}
                      </p>
                      <span className="text-[10px] text-slate-400 font-mono mt-1 block">Supported files: PDF, DOCX, XLSX (up to 12MB)</span>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 select-none cursor-pointer mt-2 text-slate-700">
                    <input 
                      type="checkbox" 
                      checked={needFeedback}
                      onChange={(e) => setNeedFeedback(e.target.checked)}
                      className="rounded text-indigo-600"
                    />
                    <span>Request urgent advisor feedback review on this week&apos;s upload</span>
                  </label>

                  <button 
                    type="submit" 
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-2xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" /> Deliver Update to Supervisor
                  </button>
                </form>
              </div>

              {/* Archive */}
              <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4">
                <span className="text-xs font-mono font-bold text-slate-450 uppercase block">Log archive pipeline</span>
                
                <div className="space-y-4 overflow-y-auto max-h-[480px]">
                  {myUpdates.map(up => (
                    <div key={up.id} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-3">
                      <div className="flex justify-between items-center text-[11px] font-mono">
                        <strong className="text-indigo-600">Reporting: {up.weekStart}</strong>
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-150 px-1.5 py-0.2 rounded font-bold">VERIFIED</span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed font-sans mt-1">
                        <strong className="text-[9px] uppercase font-mono text-slate-400 block mb-0.5">Completed summary</strong>
                        {up.completedThisWeek}
                      </p>
                      {up.evidenceFileName && (
                        <div className="bg-white border border-slate-200 shadow-xs p-2.5 rounded-xl flex items-center justify-between text-xs font-mono text-indigo-700">
                          <span className="flex items-center gap-1.5"><Paperclip className="w-3.5 h-3.5" /> {up.evidenceFileName}</span>
                          <span className="text-[9px] text-zinc-400">1.2 MB</span>
                        </div>
                      )}
                      
                      {up.feedbackText && (
                        <div className="bg-indigo-50/40 p-3 rounded-xl border border-indigo-100 mt-2 font-sans">
                          <strong className="text-indigo-650 text-[9px] uppercase font-mono font-bold block mb-0.5">Supervisor Endorsement feedback</strong>
                          <p className="text-xs text-indigo-950 font-medium italic mt-0.5">&quot;{up.feedbackText}&quot;</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* VIEW: EVIDENCE CABINET UPLOADS */}
          {activeSidebarTab === 'Uploads' && (
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-6 animate-fade-in">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 py-2 border-b border-slate-100">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900 font-sans">Evidence Vault Cabinet</h3>
                  <p className="text-xs text-slate-500 font-sans mt-0.5">Track and upload file arrays associated with progress validation.</p>
                </div>

                {/* Direct upload */}
                <form onSubmit={handleUploadDirectly} className="flex gap-2 p-1 bg-slate-50 border border-slate-200 rounded-xl max-w-sm w-full md:w-auto">
                  <input 
                    type="text" 
                    placeholder="Specific file name..." 
                    value={manualFileName}
                    onChange={(e) => setManualFileName(e.target.value)}
                    className="bg-white text-xs text-slate-700 border border-slate-200 rounded-lg px-2 py-1 outline-none font-mono flex-grow md:flex-none md:w-44"
                  />
                  <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-3 py-1.5 rounded-lg cursor-pointer whitespace-nowrap">
                    Upload
                  </button>
                </form>
              </div>

              {/* Uploaded records cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {myFiles.map(file => (
                  <div key={file.id} className="p-4 bg-slate-50 border border-slate-200/50 hover:border-indigo-400 rounded-2xl flex flex-col justify-between h-40 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="p-2.5 bg-indigo-50 text-indigo-700 rounded-xl">
                        <FileText className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-mono text-zinc-400">{file.fileSize}</span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-slate-950 truncate">{file.fileName}</h4>
                      <span className="text-[9px] text-zinc-400 font-mono block truncate">Under: {file.relatedItem}</span>
                    </div>

                    <div className="flex justify-between items-center text-[10px] pt-2 border-t border-slate-200/40 font-mono">
                      <span className="text-slate-400">{new Date(file.createdAt).toLocaleDateString('en-MY', { month: 'short', year: 'numeric' })}</span>
                      <button 
                        onClick={() => alert(`Download will be available after secure file storage is enabled for "${file.fileName}".`)}
                        className="text-indigo-600 font-bold hover:underline"
                      >
                        Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSidebarTab === 'Calendar' && (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 animate-fade-in">
              <div className="xl:col-span-8 bg-white p-6 rounded-3xl border border-slate-100 shadow-xs">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-900 font-sans">Calendar</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      View your deadlines and the supervisor&apos;s occupied meeting slots before proposing a new time.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-mono">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-600" /> Your items</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> Supervisor busy</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <button onClick={() => changeStudentCalendarMonth(-1)} className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <div className="px-4 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-black text-slate-900">
                    {studentCalendarMonthLabel}
                  </div>
                  <button onClick={() => changeStudentCalendarMonth(1)} className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-7 text-center text-[10px] font-mono uppercase text-slate-400 font-bold border-b border-slate-100 pb-2">
                  <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
                </div>

                <div className="grid grid-cols-7 gap-2 mt-2">
                  {Array.from({ length: studentFirstDayOffset }, (_, index) => (
                    <div key={`prev-${index}`} className="min-h-24 rounded-2xl bg-slate-50/50 text-slate-300 p-2 text-xs" />
                  ))}
                  {Array.from({ length: studentDaysInMonth }, (_, index) => {
                    const day = index + 1;
                    const dayKey = formatLocalDate(new Date(visibleCalendarMonth.getFullYear(), visibleCalendarMonth.getMonth(), day));
                    const eventsForDay = studentVisibleCalendarEvents.filter(event => event.date === dayKey);
                    const isToday = dayKey === formatLocalDate(today);
                    return (
                      <div key={day} className={`min-h-24 rounded-2xl border p-2 text-xs ${isToday ? 'border-indigo-300 bg-indigo-50/40' : 'border-slate-100 bg-white'}`}>
                        <div className={`font-mono font-bold mb-1 ${isToday ? 'text-indigo-700' : 'text-slate-500'}`}>{day}</div>
                        <div className="space-y-1">
                          {eventsForDay.slice(0, 3).map(event => (
                            <div
                              key={event.id}
                              className={`rounded-lg px-2 py-1 text-[9px] font-semibold leading-tight ${
                                event.visibility === 'busy'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-100'
                                  : event.type === 'Own meeting'
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-blue-50 text-blue-700 border border-blue-100'
                              }`}
                              title={event.detail}
                            >
                              <span className="block truncate">{event.title}</span>
                              <span className="block opacity-80">{event.time}</span>
                            </div>
                          ))}
                          {eventsForDay.length > 3 && (
                            <span className="text-[9px] text-slate-400 font-mono">+{eventsForDay.length - 3} more</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="xl:col-span-4 space-y-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs">
                  <h4 className="text-sm font-black text-slate-900 mb-4">Upcoming Schedule</h4>
                  <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                    {studentCalendarEvents.slice(0, 14).map(event => (
                      <div key={event.id} className="p-3 rounded-2xl border border-slate-100 bg-slate-50 flex gap-3">
                        <div className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center shrink-0 ${
                          event.visibility === 'busy' ? 'bg-amber-50 text-amber-700' : 'bg-indigo-50 text-indigo-700'
                        }`}>
                          <span className="text-[9px] font-mono uppercase">{new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                          <strong className="text-lg leading-none">{new Date(event.date).getDate()}</strong>
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h5 className="text-xs font-bold text-slate-900">{event.title}</h5>
                            <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${
                              event.visibility === 'busy' ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'
                            }`}>
                              {event.type}
                            </span>
                          </div>
                          <p className="text-[10px] font-mono text-slate-500 mt-1">{event.time}</p>
                          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{event.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs">
                  <h4 className="text-sm font-black text-slate-900">Scheduling Guidance</h4>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    Your supervisor&apos;s other student meetings appear as busy blocks only. Use the open gaps around those blocks when requesting a new meeting.
                  </p>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-indigo-50 p-3">
                      <p className="text-[10px] uppercase font-mono font-bold text-indigo-700">Your Items</p>
                      <p className="text-2xl font-black text-indigo-700">{studentCalendarEvents.filter(event => event.visibility === 'mine').length}</p>
                    </div>
                    <div className="rounded-2xl bg-amber-50 p-3">
                      <p className="text-[10px] uppercase font-mono font-bold text-amber-700">Busy Slots</p>
                      <p className="text-2xl font-black text-amber-700">{studentCalendarEvents.filter(event => event.visibility === 'busy').length}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* FALLBACK SUB VIEWS */}
          {activeSidebarTab !== 'Dashboard' && 
           activeSidebarTab !== 'Milestones' && 
           activeSidebarTab !== 'WeeklyTasks' && 
           activeSidebarTab !== 'Meetings' && 
           activeSidebarTab !== 'Feedback' && 
           activeSidebarTab !== 'Uploads' &&
           activeSidebarTab !== 'Calendar' && (
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xs text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center mx-auto">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">Section {activeSidebarTab} Under Pipeline</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">This subview represents supplementary data. The primary interactive data resides in the main dashboard view!</p>
              </div>
              <button 
                onClick={() => setActiveSidebarTab('Dashboard')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
              >
                Return to Dashboard
              </button>
            </div>
          )}

        </div>

        {/* FOOTER */}
        <footer className="bg-white border-t border-slate-100 py-6 text-center text-xs text-slate-400 font-mono">
          <div>academic-progress-tracker • Progress tracking workspace</div>
          <div className="mt-1 font-semibold text-slate-500">Built using React and Tailwind CSS</div>
        </footer>
      </div>
    </div>
  );
}

