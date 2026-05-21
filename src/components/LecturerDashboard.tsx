/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Users, AlertTriangle, Calendar, Clock, GraduationCap, 
  TrendingUp, CheckSquare, FileText, Search, Filter, 
  ChevronRight, Download, Send, Check, CheckCircle2, 
  XCircle, MessageSquare, PlusCircle, Sparkles, BookOpen,
  ArrowRight, File, ArrowUpRight, AlertCircle, RefreshCw, Bell, Award, Settings
} from 'lucide-react';
import { motion } from 'motion/react';
import { 
  StudentProfile, StudentMilestone, ResearchObjective, 
  StudentPublication, WeeklyUpdate, MeetingLog, AcademicTask, 
  UploadedFile, TaskStatus, StudentRisk, PublicationStatus, ThesisStatus, ReportRecord, ThesisChapter
} from '../types';
import { 
  CURRENT_DATE 
} from '../mockData';
import { calculateOverallProgress, calculateTimeUsedPercent, computeAttentionScore, riskFromScore } from '../services/analytics';

interface LecturerDashboardProps {
  students: StudentProfile[];
  milestones: StudentMilestone[];
  objectives: ResearchObjective[];
  publications: StudentPublication[];
  weeklyUpdates: WeeklyUpdate[];
  meetingLogs: MeetingLog[];
  tasks: AcademicTask[];
  uploadedFiles: UploadedFile[];
  onOpenStudentProfile: (studentId: string) => void;
  onAddStudent: () => void;
  onApproveTask: (taskId: string) => void;
  onApproveWeeklyUpdate: (updateId: string, feedback: string) => void;
  onApproveMilestone: (milestoneId: string, newStatus: TaskStatus) => void;
  onAddMeetingLog?: (log: Omit<MeetingLog, 'id'>) => void; // Support adding meeting log records
  thesisChapters?: ThesisChapter[];
  reports?: ReportRecord[];
  onGenerateReport?: (type: ReportRecord['type']) => void;
}

export default function LecturerDashboard({
  students,
  milestones,
  objectives,
  publications,
  weeklyUpdates,
  meetingLogs,
  tasks,
  uploadedFiles,
  onOpenStudentProfile,
  onAddStudent,
  onApproveTask,
  onApproveWeeklyUpdate,
  onApproveMilestone,
  onAddMeetingLog,
  thesisChapters = [],
  reports = [],
  onGenerateReport
}: LecturerDashboardProps) {
  
  // Left Sidebar active tab
  const [activeSidebarTab, setActiveSidebarTab] = useState<'Dashboard' | 'Students' | 'Calendar' | 'Updates' | 'Meetings' | 'Milestones' | 'Publications' | 'Thesis' | 'Reports' | 'Settings'>('Dashboard');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'FYP' | 'Master' | 'PhD'>('ALL');
  const [riskFilter, setRiskFilter] = useState<'ALL' | StudentRisk>('ALL');
  const [activePriorityTab, setActivePriorityTab] = useState<'attention' | 'fast_completion'>('attention');
  const [calendarMonth, setCalendarMonth] = useState('May 2025');
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<number | null>(20); // Current date is May 20

  // State for Review Updates Draft feedback modal / inline
  const [reviewingUpdateId, setReviewingUpdateId] = useState<string | null>(null);
  const [feedbackInput, setFeedbackInput] = useState('');

  // Enriched student progress properties
  const enrichedStudents = useMemo(() => {
    return students.map(student => {
      const sMilestones = milestones.filter(m => m.studentId === student.id);
      const sObjectives = objectives.filter(o => o.studentId === student.id);
      const sPubs = publications.filter(p => p.studentId === student.id);
      const sUpdates = weeklyUpdates.filter(u => u.studentId === student.id);
      const sTasks = tasks.filter(t => t.studentId === student.id);

      const sThesis = thesisChapters.filter(t => t.studentId === student.id);
      const progress = calculateOverallProgress(student, sMilestones, sObjectives, sPubs, sThesis);
      const timeUsed = calculateTimeUsedPercent(student);
      const attentionScore = computeAttentionScore(student, sMilestones, sUpdates, sPubs, sTasks, sThesis);
      
      const computedRisk: StudentRisk = riskFromScore(attentionScore, progress);

      return {
        ...student,
        computedProgress: progress,
        computedTimeUsed: timeUsed,
        computedAttentionScore: attentionScore,
        computedRisk
      };
    });
  }, [students, milestones, objectives, publications, weeklyUpdates, tasks, thesisChapters]);

  // Filter student lists
  const filteredStudents = enrichedStudents.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          student.researchTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'ALL' || student.studentType === typeFilter;
    const matchesRisk = riskFilter === 'ALL' || student.computedRisk === riskFilter;
    return matchesSearch && matchesType && matchesRisk;
  });

  // Attention rankings sorted descending
  const attentionRankings = useMemo(() => {
    return [...enrichedStudents]
      .filter(s => s.computedProgress < 100)
      .sort((a, b) => b.computedAttentionScore - a.computedAttentionScore);
  }, [enrichedStudents]);

  // Fast completion potential candidates
  const fastCompletionRankings = useMemo(() => {
    return [...enrichedStudents]
      .filter(s => s.computedProgress >= 60 && s.computedProgress < 100)
      .sort((a, b) => b.computedProgress - a.computedProgress);
  }, [enrichedStudents]);

  // Calendar dates mapped
  const calendarEvents = useMemo(() => {
    const events: { day: number; label: string; type: 'milestone' | 'meeting' | 'task' | 'publication'; student: string; status?: string }[] = [];
    
    milestones.forEach(m => {
      const date = new Date(m.deadline);
      // Align to may 2025 (month 4 in js 0-indexed)
      if (date.getFullYear() === 2025 && date.getMonth() === 4) {
        const student = students.find(s => s.id === m.studentId);
        events.push({
          day: date.getDate(),
          label: `${m.title}`,
          type: 'milestone',
          student: student?.name || 'Student',
          status: m.status
        });
      }
    });

    meetingLogs.forEach(ml => {
      const date = new Date(ml.meetingDate);
      if (date.getFullYear() === 2025 && date.getMonth() === 4) {
        const student = students.find(s => s.id === ml.studentId);
        events.push({
          day: date.getDate(),
          label: `Supervision Meeting: ${ml.summary.substring(0, 30)}...`,
          type: 'meeting',
          student: student?.name || 'Student'
        });
      }
    });

    tasks.forEach(t => {
      const date = new Date(t.deadline);
      if (date.getFullYear() === 2025 && date.getMonth() === 4) {
        events.push({
          day: date.getDate(),
          label: `${t.title}`,
          type: 'task',
          student: t.studentName || 'Student',
          status: t.status
        });
      }
    });

    return events;
  }, [milestones, meetingLogs, tasks, students]);

  const selectedDayEvents = useMemo(() => {
    if (selectedCalendarDay === null) return [];
    return calendarEvents.filter(e => e.day === selectedCalendarDay);
  }, [calendarEvents, selectedCalendarDay]);

  // Dashboard calculations representing stats
  const totalCount = students.length;
  const criticalCount = enrichedStudents.filter(s => s.computedRisk === 'Critical').length;
  const delayedCount = enrichedStudents.filter(s => s.computedRisk === 'Delayed').length;
  const tasksDueThisWeek = tasks.filter(t => t.status === 'Pending').length;
  const totalOverdueTasks = tasks.filter(t => t.status === 'Overdue').length + milestones.filter(m => m.status === 'Overdue').length;
  const nearGraduationCount = enrichedStudents.filter(s => s.computedProgress >= 75).length;

  // Reminders mock
  const [remindedStudents, setRemindedStudents] = useState<string[]>([]);
  const handleSendReminder = (studentId: string) => {
    if (remindedStudents.includes(studentId)) return;
    setRemindedStudents([...remindedStudents, studentId]);
    alert("Draft notification dispatched to student email.");
  };

  const handleApproveWeeklyUpdateWithText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingUpdateId) return;
    onApproveWeeklyUpdate(reviewingUpdateId, feedbackInput || 'Approved with excellent progress, carry on.');
    setReviewingUpdateId(null);
    setFeedbackInput('');
    alert("Weekly report officially endorsed.");
  };

  return (
    <div className="flex bg-[#f4f7fc] min-h-screen relative" id="lecturer-workspace-container">
      {/* LEFT SIDEBAR VIEW (Matching Image 2 Sidebar of Supervisor) */}
      <aside className="w-64 bg-[#091830] text-slate-300 md:flex flex-col justify-between shrink-0 shadow-xl hidden relative border-r border-[#0d2242]">
        <div className="flex flex-col animate-fade-in">
          {/* Logo Crest Block */}
          <div className="p-6 flex items-center gap-3 border-b border-[#0d2242]">
            <div className="p-2 bg-indigo-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M12 8v8M9 11h6" />
              </svg>
            </div>
            <div>
              <h2 className="text-white text-sm font-sans font-extrabold tracking-tight uppercase leading-none">
                Academic Tracker
              </h2>
              <p className="text-[10px] text-zinc-400 font-mono tracking-wider mt-1">Progress Tracker</p>
            </div>
          </div>

          {/* Sidebar Menu list */}
          <div className="p-4 space-y-1">
            <span className="px-3 text-[10px] font-mono font-bold tracking-widest text-[#415a77] uppercase block mb-2">Academic</span>

            {[
              { id: 'Dashboard', label: 'Dashboard', icon: CheckSquare },
              { id: 'Students', label: 'Students List', icon: Users },
              { id: 'Calendar', label: 'Deadlines Calendar', icon: Calendar },
              { id: 'Updates', label: 'Weekly Updates', icon: RefreshCw },
              { id: 'Meetings', label: 'Meeting Logs', icon: MessageSquare },
              { id: 'Milestones', label: 'Milestones Map', icon: Award },
              { id: 'Publications', label: 'Publications Tracker', icon: BookOpen },
              { id: 'Thesis', label: 'Thesis chapters', icon: FileText },
              { id: 'Reports', label: 'Reports', icon: TrendingUp },
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

        {/* BOTTOM PROFILE BOX CARD (Supervisor) */}
        <div className="p-4 border-t border-[#0e2446]">
          <div className="p-3 bg-[#102547] rounded-2xl flex items-center gap-3">
            <img 
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150" 
              className="w-10 h-10 rounded-xl object-cover shrink-0 border border-slate-700" 
              alt="Supervisor"
              referrerPolicy="no-referrer"
            />
            <div className="min-w-0">
              <h4 className="text-white text-xs font-bold leading-tight truncate">Supervisor</h4>
              <p className="text-[10px] text-indigo-400 font-mono tracking-tight">Senior Lecturer</p>
              <p className="text-[9px] text-zinc-500 font-mono truncate">Academic Programme</p>
            </div>
          </div>
        </div>
      </aside>

      {/* RIGHT MAIN APPLET CONTAINER */}
      <div className="flex-grow flex flex-col min-w-0" id="lecturer-main-content-area">
        {/* TOP REGULAR BAR HEADER */}
        <header className="bg-white border-b border-slate-100 py-3.5 px-6 flex items-center justify-between shadow-xs sticky top-0 z-30 font-sans">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold font-sans text-slate-900 tracking-tight flex items-center gap-2">
              Progress Overview
            </h1>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
              Supervisor Portal
            </span>
          </div>

          {/* Search + Alerts + Register Student Shortcut button */}
          <div className="flex items-center gap-4">
            <button 
              onClick={onAddStudent}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              Register Student
            </button>

            {/* Notification */}
            <div className="relative p-2 hover:bg-slate-50 rounded-xl cursor-pointer">
              <Bell className="w-4 h-4 text-slate-600" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full" />
            </div>
          </div>
        </header>

        {/* CONTAINER WORKSPACE WRAPPER */}
        <div className="p-6 md:p-8 space-y-8 flex-grow overflow-y-auto">
          
          {/* VIEW: LECTURER PORTAL DASHBOARD (Image 2 representation) */}
          {activeSidebarTab === 'Dashboard' && (
            <div className="space-y-8 animate-fade-in">
              
              {/* TOP BIG BANNER DESCRIPTION */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                  <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight font-sans">
                    Welcome back, Supervisor
                  </h2>
                  <p className="text-sm text-slate-500">
                    Recent student activity, risk signals, deadlines, and updates. Open a student profile for full milestone, thesis, and progress details.
                  </p>
                </div>
                
                <div className="bg-indigo-50 text-indigo-700 rounded-2xl p-4 shrink-0 text-center flex flex-col items-center">
                  <span className="text-xs font-mono uppercase font-black">Cohort Quality</span>
                  <strong className="text-xl font-sans tracking-tight block">92.5%</strong>
                  <span className="text-[10px] text-slate-400 mt-0.5">Approval Index</span>
                </div>
              </div>

              {/* ROW 1: SUMMARY TILES/CARDS (5 cards exactly as Image 2) */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4" id="lecturer-summary-cards">
                {/* Tile 1 */}
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-mono font-bold text-slate-400">Total Supervised</span>
                    <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
                      <Users className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">{totalCount}</h3>
                    <p className="text-[10px] text-slate-400 font-mono mt-1">3 PhD • 3 Master • 2 FYP</p>
                  </div>
                </div>

                {/* Tile 2 */}
                <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-mono font-bold text-rose-500">Critical / Delayed</span>
                    <div className="p-1.5 bg-rose-50 text-rose-600 rounded-lg shrink-0 animate-pulse">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-2xl font-extrabold text-rose-600 tracking-tight">
                      {criticalCount} <span className="text-xs font-mono text-slate-400">/ {delayedCount} delay</span>
                    </h3>
                    <p className="text-[10px] text-rose-500 font-medium mt-1">Requires focus</p>
                  </div>
                </div>

                {/* Tile 3 */}
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-mono font-bold text-slate-400">Tasks Due This Week</span>
                    <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg shrink-0">
                      <Clock className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">{tasksDueThisWeek}</h3>
                    <p className="text-[10px] text-amber-600 font-medium mt-1">Sprints active</p>
                  </div>
                </div>

                {/* Tile 4 */}
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] tracking-tight uppercase font-mono font-bold text-slate-405 text-rose-400">Overdue Deliverables</span>
                    <div className="p-1.5 bg-rose-50/50 text-rose-505 text-rose-500 rounded-lg shrink-0">
                      <XCircle className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">{totalOverdueTasks}</h3>
                    <p className="text-[10px] text-rose-500 font-bold mt-1">Needs action approval</p>
                  </div>
                </div>

                {/* Tile 5 */}
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between col-span-2 md:col-span-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-mono font-bold text-slate-400">Near Graduation</span>
                    <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">{nearGraduationCount}</h3>
                    <p className="text-[10px] text-emerald-600 font-medium mt-1">&gt; 75% progression</p>
                  </div>
                </div>
              </div>

              {/* ROW 2: CALENDAR & PRIORITY RANKING */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="calendar-priorities">
                {/* Academic deadlines calendar */}
                <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-100 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-indigo-600" />
                      <h3 className="text-lg font-bold text-slate-900 font-sans">Academic Deadlines Calendar</h3>
                    </div>
                    <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg">
                      {calendarMonth}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 mb-4 font-mono leading-none">
                    Review meetings, deliverables chapter deadlines set within May.
                  </p>

                  <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-bold font-mono tracking-widest text-[#415a77] uppercase border-b border-slate-100 pb-2">
                    <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
                  </div>

                  <div className="grid grid-cols-7 gap-2 mt-2">
                    {/* Padding blank blocks for calendar alignment */}
                    <div></div><div></div><div></div><div></div>
                    
                    {Array.from({ length: 31 }, (_, i) => {
                      const day = i + 1;
                      const isToday = day === 20;
                      const dayEvents = calendarEvents.filter(e => e.day === day);
                      const hasEvents = dayEvents.length > 0;
                      const isSelected = selectedCalendarDay === day;

                      let bgStyle = "hover:bg-slate-50 text-slate-800";
                      
                      if (isSelected) {
                        bgStyle = "bg-indigo-600 text-white font-bold ring-2 ring-indigo-150";
                      } else if (isToday) {
                        bgStyle = "bg-slate-100 hover:bg-slate-200 text-slate-950 font-bold border-2 border-indigo-500";
                      } else if (hasEvents) {
                        const hasOverdue = dayEvents.some(e => e.status === 'Overdue');
                        bgStyle = hasOverdue 
                          ? "bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold border border-rose-200" 
                          : "bg-amber-50 hover:bg-amber-100 text-amber-700 font-semibold border border-amber-200";
                      }

                      return (
                        <button
                          key={day}
                          onClick={() => setSelectedCalendarDay(day)}
                          className={`h-10 rounded-xl flex flex-col items-center justify-center relative cursor-pointer font-sans transition-all text-sm ${bgStyle}`}
                        >
                          <span>{day}</span>
                          {hasEvents && !isSelected && (
                            <span className="absolute bottom-1 w-1.5 h-1.5 bg-current rounded-full" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Day schedule drawer */}
                  <div className="mt-5 p-4 bg-slate-50 rounded-2xl border border-slate-150">
                    <h4 className="text-[10px] font-mono font-bold text-slate-450 uppercase flex justify-between">
                      <span>Schedule for May {selectedCalendarDay}, 2025</span>
                      {selectedCalendarDay === 20 && (
                        <span className="text-logo text-xs font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded">ACTUAL DATE</span>
                      )}
                    </h4>

                    {selectedDayEvents.length === 0 ? (
                      <p className="text-xs text-slate-400 mt-2 font-mono italic">No actions registered for this date.</p>
                    ) : (
                      <div className="mt-2.5 space-y-2">
                        {selectedDayEvents.map((evt, eIdx) => (
                          <div key={eIdx} className="p-2.5 bg-white border border-slate-200 rounded-xl text-xs flex justify-between items-center">
                            <div>
                              <strong className="text-slate-800 font-sans block">{evt.label}</strong>
                              <span className="text-[10px] font-mono text-slate-400">Assigned: <strong className="text-indigo-600">{evt.student}</strong></span>
                            </div>
                            <span className="text-[9px] bg-indigo-55 text-indigo-50 px-1.5 py-0.2 uppercase font-bold text-indigo-600 font-mono">{evt.type}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Supervision priorities system rankings */}
                <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-100 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-bold text-slate-900 font-sans flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-indigo-600" />
                        Supervision Prioritizer
                      </h3>
                      <span className="bg-[#2ec4b6]/15 text-[#2ec4b6] text-[9px] font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-400" /> Active Ranks
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 mb-4 font-sans leading-relaxed">
                      Scoring indices mapped according to candidate lag parameters. Filter by critical need or high pace completions.
                    </p>

                    {/* Tab select */}
                    <div className="grid grid-cols-2 bg-slate-50 p-1 rounded-xl border border-slate-200 mb-4">
                      <button 
                        onClick={() => setActivePriorityTab('attention')}
                        className={`py-2 text-xs font-bold font-sans rounded-lg cursor-pointer transition-all ${
                          activePriorityTab === 'attention' 
                            ? 'bg-white text-slate-900 shadow-xs' 
                            : 'text-slate-400 hover:text-slate-800'
                        }`}
                      >
                        🚨 Urgency Rank
                      </button>
                      <button 
                        onClick={() => setActivePriorityTab('fast_completion')}
                        className={`py-2 text-xs font-bold font-sans rounded-lg cursor-pointer transition-all ${
                          activePriorityTab === 'fast_completion' 
                            ? 'bg-white text-slate-900 shadow-xs' 
                            : 'text-slate-400 hover:text-slate-800'
                        }`}
                      >
                        ⚡ Completion Potential
                      </button>
                    </div>

                    {/* Rankings lists */}
                    <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
                      {activePriorityTab === 'attention' ? (
                        attentionRankings.map((pt, index) => (
                          <div 
                            key={pt.id}
                            onClick={() => onOpenStudentProfile(pt.id)}
                            className="p-3 bg-slate-50 border border-slate-200/50 hover:bg-indigo-50/20 hover:border-indigo-150 rounded-2xl flex justify-between items-center cursor-pointer transition-all gap-2"
                          >
                            <div className="flex items-center gap-3">
                              <span className="font-mono text-xs font-bold text-slate-400">#{index+1}</span>
                              <img 
                                src={pt.avatarUrl} 
                                className="w-8 h-8 rounded-lg object-cover border border-slate-200 shrink-0" 
                                alt={pt.name}
                                referrerPolicy="no-referrer"
                              />
                              <div>
                                <strong className="text-slate-800 text-xs block">{pt.name}</strong>
                                <span className="text-[10px] text-slate-400 font-mono">{pt.studentType} • {pt.computedProgress}% progress</span>
                              </div>
                            </div>

                            <div className="text-right">
                              <span className={`text-[8px] font-bold px-1.5 py-0.2 border rounded-full uppercase block text-center ${
                                pt.computedRisk === 'Critical' ? 'bg-rose-50 text-rose-700 border-rose-150' :
                                pt.computedRisk === 'Delayed' ? 'bg-amber-50 text-amber-700 border-amber-150' : 'bg-slate-100 text-slate-600 border-slate-200'
                              }`}>
                                {pt.computedRisk}
                              </span>
                              <span className="text-[10px] text-rose-600 font-mono font-bold block mt-1">Urgency: {pt.computedAttentionScore}</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        fastCompletionRankings.map((pt, index) => (
                          <div 
                            key={pt.id}
                            onClick={() => onOpenStudentProfile(pt.id)}
                            className="p-3 bg-[#10b981]/5 border border-[#10b981]/20 hover:bg-[#10b981]/10 rounded-2xl flex justify-between items-center cursor-pointer transition-all gap-2"
                          >
                            <div className="flex items-center gap-3">
                              <span className="font-mono text-xs font-bold text-emerald-600">#{index+1}</span>
                              <img 
                                src={pt.avatarUrl} 
                                className="w-8 h-8 rounded-lg object-cover shrink-0" 
                                alt={pt.name} 
                                referrerPolicy="no-referrer"
                              />
                              <div>
                                <strong className="text-slate-850 text-xs block">{pt.name}</strong>
                                <span className="text-[10px] text-zinc-500 font-mono">{pt.studentType} Candidate</span>
                              </div>
                            </div>

                            <div className="text-right">
                              <span className="text-[9px] bg-emerald-50 text-emerald-700 font-bold border border-emerald-150 px-1.5 py-0.2 rounded-full block text-center">
                                {pt.computedProgress}%
                              </span>
                              <span className="text-[10px] text-indigo-500 font-semibold block mt-1 whitespace-nowrap">Ready candidates</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 mt-4 flex items-center justify-between text-xs text-slate-400">
                    <span>Outstanding critical actions: {totalOverdueTasks}</span>
                    <span className="text-indigo-600 font-bold">Algorithms verified</span>
                  </div>
                </div>
              </div>

              {/* ROW 3: RECENT UPDATES AND WEEKLY MONITOR */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6" id="progress-tables-row">
                
                {/* Most recent student updates */}
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-slate-900 font-sans flex items-center gap-2">
                      <RefreshCw className="w-5 h-5 text-indigo-600" />
                      Most Recent Student Updates
                    </h3>
                    <span className="text-xs text-slate-405 font-mono">Latest first</span>
                  </div>

                  <p className="text-xs text-slate-500 mb-4 font-sans leading-relaxed">
                    Dashboard view stays focused on the newest progress activity. Open an individual student for milestone, thesis, and detailed progress review.
                  </p>

                  <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                    {[...weeklyUpdates].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 8).map(update => {
                      const stud = enrichedStudents.find(student => student.id === update.studentId);
                      return (
                        <div key={update.id} className="p-3 bg-slate-50 border border-slate-150 rounded-2xl cursor-pointer hover:border-indigo-200" onClick={() => stud && onOpenStudentProfile(stud.id)}>
                          <div className="flex justify-between items-center mb-2">
                            <div>
                              <strong className="text-slate-800 text-xs">{stud?.name || 'Student'}</strong>
                              <span className="text-[10px] text-zinc-400 font-mono ml-2">{update.weekStart}</span>
                            </div>
                            <span className={`text-[9px] font-bold border px-2 py-0.5 rounded-full ${update.needFeedback ? 'bg-amber-50 text-amber-700 border-amber-150' : 'bg-emerald-50 text-emerald-700 border-emerald-150'}`}>
                              {update.needFeedback ? 'Needs feedback' : 'Reviewed'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 line-clamp-2">{update.completedThisWeek}</p>
                          <p className="text-[10px] text-indigo-600 mt-2 font-semibold">Next: {update.planForNextWeek}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Weekly validation update monitor table */}
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-bold text-slate-900 font-sans flex items-center gap-2">
                        <CheckSquare className="w-5 h-5 text-indigo-600" />
                        Weekly Update Sprints Monitor
                      </h3>
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-150 text-xs font-mono font-bold px-3 py-1 rounded-full">
                        Reporting Sprints Active
                      </span>
                    </div>

                    <p className="text-xs text-slate-505 text-slate-500 leading-relaxed font-sans mb-4">
                      See who submitted this week and which updates need review. Deep progress detail is kept inside each student profile.
                    </p>

                    <div className="space-y-3.5">
                      {enrichedStudents.map(stud => {
                        const hasSubmitted = weeklyUpdates.some(u => u.studentId === stud.id);
                        const latestUpdate = weeklyUpdates.find(u => u.studentId === stud.id);
                        return (
                          <div key={stud.id} className="p-3 bg-slate-50 border border-slate-200/50 rounded-2xl flex items-center justify-between gap-4 text-xs">
                            <div className="flex items-center gap-3">
                              <img src={stud.avatarUrl} className="w-9 h-9 rounded-full object-cover border shrink-0" alt="" referrerPolicy="no-referrer" />
                              <div>
                                <strong className="text-slate-800 font-sans block">{stud.name}</strong>
                                <span className="text-[10px] font-mono text-[#00b4d8] font-bold">
                                  {hasSubmitted ? 'Update submitted' : 'No recent update'}
                                </span>
                              </div>
                            </div>

                            {hasSubmitted ? (
                              <button 
                                onClick={() => {
                                  setReviewingUpdateId(latestUpdate?.id || null);
                                  setFeedbackInput(latestUpdate?.feedbackText || '');
                                }}
                                className="bg-indigo-65 text-indigo-50 hover:bg-indigo-100 text-indigo-600 font-bold px-3 py-1.5 rounded-xl cursor-pointer"
                              >
                                Review Update
                              </button>
                            ) : (
                              <button 
                                onClick={() => handleSendReminder(stud.id)}
                                className={`font-bold px-3 py-1.5 rounded-xl cursor-pointer ${
                                  remindedStudents.includes(stud.id) 
                                    ? 'bg-slate-200 text-slate-400' 
                                    : 'bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-100'
                                }`}
                              >
                                {remindedStudents.includes(stud.id) ? 'Reminded ✔' : 'Remind'}
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Inline feedback review console */}
                  {reviewingUpdateId && (
                    <form onSubmit={handleApproveWeeklyUpdateWithText} className="mt-4 p-4 border border-indigo-150 bg-indigo-50/10 rounded-2xl space-y-3">
                      <span className="text-[9px] font-mono font-bold text-indigo-600 block uppercase">Reviewing Weekly Update</span>
                      <textarea 
                        required
                        rows={2}
                        placeholder="Provide feedback or requested next action..."
                        value={feedbackInput}
                        onChange={(e) => setFeedbackInput(e.target.value)}
                        className="w-full bg-white text-xs border border-slate-200 rounded-xl p-2.5 outline-none font-sans"
                      />
                      <button type="submit" className="w-full bg-indigo-600 text-white font-semibold text-xs py-2 rounded-xl cursor-pointer">
                        Submit Feedback
                      </button>
                    </form>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* VIEW: STUDENTS LIST OF SUPERVISED RESEARCH */}
          {activeSidebarTab === 'Students' && (
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 font-sans">Active Supervisor Cohort</h3>
                  <p className="text-xs text-slate-500 font-sans mt-0.5">Comprehensive list of supervised candidates under Doctorates, Masters, and Bachelor Degrees.</p>
                </div>

                <div className="flex gap-4 w-full sm:w-auto text-xs shrink-0">
                  <select 
                    value={typeFilter} 
                    onChange={(e) => setTypeFilter(e.target.value as any)}
                    className="bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                  >
                    <option value="ALL">All Categories</option>
                    <option value="PhD">Doctor of Philosophy (PhD)</option>
                    <option value="Master">Master of Sciences (MSc)</option>
                    <option value="FYP">Bachelor Thesis (FYP)</option>
                  </select>
                </div>
              </div>

              {/* Filter search query input */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 w-3.5 left-3.5 top-3" />
                <input 
                  type="text" 
                  placeholder="Filter student profiles by name, research topic or contact..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 text-xs text-slate-800 border border-slate-200 py-3.5 pl-10 pr-4 rounded-2xl outline-none focus:bg-white"
                />
              </div>

              {/* Student Cards Grid list */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {filteredStudents.map(stud => (
                  <div key={stud.id} className="bg-slate-50 border border-slate-200/50 rounded-2xl p-5 hover:border-indigo-400 transition-all flex flex-col justify-between h-72">
                    <div>
                      <div className="flex justify-between items-start">
                        <img src={stud.avatarUrl} className="w-11 h-11 rounded-full object-cover border" alt="" referrerPolicy="no-referrer" />
                        <span className="bg-white px-2 py-0.5 border border-slate-200 text-[9px] font-mono font-bold rounded">{stud.studentType}</span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-950 mt-3 flex items-center gap-1 truncate">{stud.name}</h4>
                      <p className="text-[10px] text-zinc-400 font-mono italic mt-0.5 truncate">{stud.email}</p>
                      <p className="text-xs text-slate-600 line-clamp-2 mt-2 leading-relaxed" title={stud.researchTitle}>{stud.researchTitle}</p>
                    </div>

                    <div className="pt-3 border-t border-slate-200/50 mt-3 flex justify-between items-center text-xs">
                      <div>
                        <span className="text-[10px] font-mono text-slate-400 block uppercase">Progress</span>
                        <strong className="text-slate-800 font-mono font-bold text-sm">{stud.computedProgress}%</strong>
                      </div>

                      <button 
                        onClick={() => onOpenStudentProfile(stud.id)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-1.5 rounded-xl cursor-pointer"
                      >
                        Expand Profile
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW: CENTRALIZED PUBLICATIONS MONITOR */}
          {activeSidebarTab === 'Publications' && (
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900 font-sans">Verification Publications Board</h3>
                <p className="text-xs text-slate-500 font-sans mt-0.5">Monitor and verify journal articles logged by doctoral (min 2) and masters (min 1) candidates.</p>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-3xl">
                <table className="w-full text-left text-xs text-slate-650 border-collapse">
                  <thead className="bg-slate-50 text-slate-405 font-mono uppercase text-[9px] uppercase">
                    <tr className="border-b border-slate-200">
                      <th className="p-4">Candidate</th>
                      <th className="p-4">Article Title</th>
                      <th className="p-4">Target Journal</th>
                      <th className="p-4">Submission</th>
                      <th className="p-4 text-right">Verification Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150 bg-white">
                    {publications.map(pub => {
                      const candidate = students.find(s => s.id === pub.studentId);
                      return (
                        <tr key={pub.id} className="hover:bg-slate-50/20">
                          <td className="p-4">
                            <strong className="text-slate-900">{candidate?.name}</strong>
                            <span className="text-[10px] text-zinc-400 font-mono block">({candidate?.studentType})</span>
                          </td>
                          <td className="p-4 font-sans font-medium text-slate-800">{pub.title}</td>
                          <td className="p-4 italic font-sans text-slate-500">{pub.targetJournal}</td>
                          <td className="p-4 font-mono text-zinc-400">{pub.submissionDate || 'N/A'}</td>
                          <td className="p-4 text-right">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold border uppercase ${
                              pub.status === 'Accepted' || pub.status === 'Published' ? 'bg-emerald-50 text-emerald-700 border-emerald-150' :
                              pub.status === 'Submitted' || pub.status === 'Under review' ? 'bg-indigo-50 text-indigo-700 border-indigo-150' : 'bg-amber-50 text-amber-700 border-amber-150'
                            }`}>
                              {pub.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSidebarTab === 'Updates' && (
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 font-sans">Weekly Updates</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Monitor weekly progress submissions, blockers, and next actions.</p>
                </div>
                <button className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2">
                  <PlusCircle className="w-4 h-4" /> Add Update
                </button>
              </div>
              <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-400 uppercase font-mono text-[9px]">
                    <tr>
                      <th className="p-4">Student</th>
                      <th className="p-4">Week</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Summary</th>
                      <th className="p-4">Next Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {weeklyUpdates.map(update => {
                      const student = students.find(s => s.id === update.studentId);
                      return (
                        <tr key={update.id} className="hover:bg-slate-50">
                          <td className="p-4 font-bold text-slate-900">{student?.name}</td>
                          <td className="p-4 font-mono text-slate-500">{update.weekStart}</td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${update.needFeedback ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
                              {update.needFeedback ? 'Needs feedback' : 'Reviewed'}
                            </span>
                          </td>
                          <td className="p-4 max-w-md text-slate-600">{update.completedThisWeek}</td>
                          <td className="p-4 text-indigo-700 font-semibold">{update.planForNextWeek}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSidebarTab === 'Milestones' && (
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-5">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 font-sans">Milestones</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Manage research milestones and deadlines across all supervised students.</p>
                </div>
                <button className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2">
                  <PlusCircle className="w-4 h-4" /> Add Milestone
                </button>
              </div>
              <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-400 uppercase font-mono text-[9px]">
                    <tr>
                      <th className="p-4">Milestone</th>
                      <th className="p-4">Student</th>
                      <th className="p-4">Program</th>
                      <th className="p-4">Due Date</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Progress</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {milestones.map(milestone => {
                      const student = students.find(s => s.id === milestone.studentId);
                      return (
                        <tr key={milestone.id}>
                          <td className="p-4 font-bold text-slate-900">{milestone.title}</td>
                          <td className="p-4">{student?.name}</td>
                          <td className="p-4">{student?.studentType}</td>
                          <td className="p-4 font-mono text-slate-500">{milestone.deadline}</td>
                          <td className="p-4">{milestone.status}</td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <div className="w-28 h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-600" style={{ width: `${milestone.progressPercent}%` }} />
                              </div>
                              <span className="font-mono text-slate-500">{milestone.progressPercent}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSidebarTab === 'Thesis' && (
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-5">
              <div>
                <h3 className="text-xl font-bold text-slate-900 font-sans">Thesis Tracker</h3>
                <p className="text-xs text-slate-500 mt-0.5">Track thesis stages and overall writing progress.</p>
              </div>
              <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-400 uppercase font-mono text-[9px]">
                    <tr>
                      <th className="p-4">Student</th>
                      <th className="p-4">Program</th>
                      <th className="p-4">Current Stage</th>
                      <th className="p-4">Progress</th>
                      <th className="p-4">Word Count</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {students.map(student => {
                      const chapters = thesisChapters.filter(ch => ch.studentId === student.id);
                      const progress = Math.round(chapters.reduce((sum, ch) => sum + ch.progressPercent, 0) / (chapters.length || 1));
                      const wordCount = chapters.reduce((sum, ch) => sum + ch.wordCount, 0);
                      const activeChapter = chapters.find(ch => ch.progressPercent < 100)?.title || 'Thesis completed';
                      return (
                        <tr key={student.id}>
                          <td className="p-4 font-bold text-slate-900">{student.name}</td>
                          <td className="p-4">{student.studentType}</td>
                          <td className="p-4">{activeChapter}</td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-emerald-500" style={{ width: `${progress}%` }} /></div>
                              <span className="font-mono">{progress}%</span>
                            </div>
                          </td>
                          <td className="p-4 font-mono text-slate-500">{wordCount.toLocaleString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSidebarTab === 'Reports' && (
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900 font-sans">Reports</h3>
                <p className="text-xs text-slate-500 mt-0.5">Generate insights and performance reports.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {(['Student Progress', 'Milestone', 'Meeting', 'Publication', 'Weekly Update'] as ReportRecord['type'][]).map(type => (
                  <div key={type} className="border border-slate-200 rounded-2xl p-4 bg-slate-50">
                    <FileText className="w-5 h-5 text-indigo-600 mb-3" />
                    <h4 className="font-bold text-sm text-slate-900">{type} Report</h4>
                    <p className="text-[11px] text-slate-500 mt-1 min-h-8">Generate {type.toLowerCase()} summary.</p>
                    <button
                      onClick={() => onGenerateReport?.(type)}
                      className="mt-4 w-full border border-indigo-200 text-indigo-700 bg-white rounded-xl py-2 text-xs font-bold hover:bg-indigo-50"
                    >
                      Generate
                    </button>
                  </div>
                ))}
              </div>
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-400 uppercase font-mono text-[9px]">
                    <tr>
                      <th className="p-4">Report Name</th>
                      <th className="p-4">Type</th>
                      <th className="p-4">Generated On</th>
                      <th className="p-4">Generated By</th>
                      <th className="p-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {reports.map(report => (
                      <tr key={report.id}>
                        <td className="p-4 font-bold">{report.title}</td>
                        <td className="p-4">{report.type}</td>
                        <td className="p-4 font-mono text-slate-500">{report.createdAt}</td>
                        <td className="p-4">{report.generatedBy}</td>
                        <td className="p-4 text-indigo-700 font-bold">Download</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VIEW: LAB CONFERENCES MEETINGS WRITING FOR LECTURER */}
          {activeSidebarTab === 'Meetings' && (
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 font-sans">Progress Meeting Logs</h3>
                  <p className="text-xs text-slate-500 font-sans mt-0.5">Review meeting notes, action items, and supervisor feedback.</p>
                </div>
              </div>

              {/* Simple supervisor calendar logs list */}
              <div className="space-y-4">
                {meetingLogs.map(log => {
                  const candidate = students.find(s => s.id === log.studentId);
                  return (
                    <div key={log.id} className="p-4 bg-slate-50 border border-slate-200/50 rounded-2xl flex flex-col sm:flex-row justify-between gap-4">
                      <div>
                        <strong className="text-slate-900 text-sm font-sans block">{candidate?.name} • Sync Date: {log.meetingDate}</strong>
                        <p className="text-xs text-slate-600 mt-2 font-sans"><strong className="text-[9px] uppercase font-mono text-zinc-400 block mb-0.5">Meeting Discussion Summary</strong> {log.summary}</p>
                        <p className="text-xs text-indigo-700 mt-1.5 font-sans italic p-2.5 bg-indigo-50 border border-indigo-100 rounded-xl"><strong className="text-[9px] uppercase font-mono text-indigo-600 block mb-0.5 mt-0.5">Supervisor Endorsement feedback</strong> &quot;{log.supervisorFeedback}&quot;</p>
                      </div>

                      <div className="shrink-0 text-right space-y-2">
                        <span className="text-[10px] text-slate-400 block font-mono">Next: {log.nextMeetingDate}</span>
                        <div className="text-left bg-white p-3 border rounded-xl w-44">
                          <span className="text-[9px] uppercase font-mono text-slate-400 block font-bold">Actions Assigned</span>
                          <ul className="list-disc pl-3 text-[11px] text-slate-500 font-sans font-medium space-y-0.5">
                            {log.actionItems.map((act, idx) => <li key={idx}>{act}</li>)}
                          </ul>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* FALLBACK TABS */}
          {activeSidebarTab !== 'Dashboard' && 
           activeSidebarTab !== 'Students' && 
           activeSidebarTab !== 'Publications' && 
           activeSidebarTab !== 'Meetings' &&
           activeSidebarTab !== 'Updates' &&
           activeSidebarTab !== 'Milestones' &&
           activeSidebarTab !== 'Thesis' &&
           activeSidebarTab !== 'Reports' && (
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xs text-center space-y-4 animate-fade-in">
              <div className="w-12 h-12 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center mx-auto">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">Academic Sub-Module ({activeSidebarTab}) Pending</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">This panel serves supplementary trackers in Image 2. The critical dashboard charts and data tables have been initialized in full depth in the main workspace controller!</p>
              </div>
              <button 
                onClick={() => setActiveSidebarTab('Dashboard')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer focus:outline-none"
              >
                Return to Dashboard
              </button>
            </div>
          )}

        </div>

        {/* FOOTER */}
        <footer className="bg-white border-t border-slate-100 py-6 text-center text-xs text-slate-400 font-mono">
          <div>academic-progress-tracker • Academic progress tracking workspace</div>
          <div className="mt-1 font-semibold text-slate-505 text-slate-500">React + Tailwind UI Layer</div>
        </footer>
      </div>
    </div>
  );
}

