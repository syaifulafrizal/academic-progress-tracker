/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, FileText, Calendar, Check, X, Clock, HelpCircle, 
  MessageSquare, Plus, CheckSquare, AlertTriangle, User, ExternalLink,
  BookOpen, Folder, Trash, Activity, Sparkles, Send, FileCheck, CheckCircle
} from 'lucide-react';
import { 
  StudentProfile, StudentMilestone, ResearchObjective, 
  StudentPublication, WeeklyUpdate, MeetingLog, AcademicTask, UploadedFile, TaskStatus, ThesisChapter
} from '../types';
import { calculateOverallProgress, calculateTimeUsedPercent, computeAttentionScore, riskFromScore } from '../services/analytics';

interface StudentProfileViewProps {
  student: StudentProfile;
  milestones: StudentMilestone[];
  objectives: ResearchObjective[];
  publications: StudentPublication[];
  weeklyUpdates: WeeklyUpdate[];
  meetingLogs: MeetingLog[];
  tasks: AcademicTask[];
  uploadedFiles: UploadedFile[];
  thesisChapters?: ThesisChapter[];
  onBack: () => void;
  onApproveMilestone: (milestoneId: string, status: TaskStatus) => void;
  onAddFeedbackToUpdate: (updateId: string, text: string) => void;
  onAddMeetingLog: (log: Omit<MeetingLog, 'id' | 'studentId'>) => void;
  onAddTaskForStudent: (title: string, priority: 'High' | 'Medium' | 'Low', relatedArea: string) => void;
  onLinkStudentAccount?: (studentId: string) => void;
  isProductionData?: boolean;
}

export default function StudentProfileView({
  student,
  milestones,
  objectives,
  publications,
  weeklyUpdates,
  meetingLogs,
  tasks,
  uploadedFiles,
  onBack,
  onApproveMilestone,
  onAddFeedbackToUpdate,
  onAddMeetingLog,
  onAddTaskForStudent,
  onLinkStudentAccount,
  isProductionData = false,
  thesisChapters = []
}: StudentProfileViewProps) {
  
  // States for compiling new Meeting Log
  const [meetingSummary, setMeetingSummary] = useState('');
  const [meetingFeedback, setMeetingFeedback] = useState('');
  const [meetingActions, setMeetingActions] = useState<string>('');
  const [meetingDeadline, setMeetingDeadline] = useState('2026-05-30');
  const [nextMeetingDate, setNextMeetingDate] = useState('2026-06-04');
  
  // State for typing custom feedback on weekly updates
  const [activeFeedbackUpdateId, setActiveFeedbackUpdateId] = useState<string | null>(null);
  const [feedbackInput, setFeedbackInput] = useState('');

  // State for adding a specific target task
  const [quickTaskTitle, setQuickTaskTitle] = useState('');
  const [quickTaskPriority, setQuickTaskPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [quickTaskArea, setQuickTaskArea] = useState('General');

  // Specific student records
  const myMilestones = useMemo(() => milestones.filter(m => m.studentId === student.id), [milestones, student]);
  const myObjectives = useMemo(() => objectives.filter(o => o.studentId === student.id), [objectives, student]);
  const myPublications = useMemo(() => publications.filter(p => p.studentId === student.id), [publications, student]);
  const myUpdates = useMemo(() => weeklyUpdates.filter(u => u.studentId === student.id), [weeklyUpdates, student]);
  const myMeetingLogs = useMemo(() => meetingLogs.filter(ml => ml.studentId === student.id), [meetingLogs, student]);
  const myTasks = useMemo(() => tasks.filter(t => t.studentId === student.id), [tasks, student]);
  const myFiles = useMemo(() => uploadedFiles.filter(f => f.studentId === student.id), [uploadedFiles, student]);
  const myThesisChapters = useMemo(() => thesisChapters.filter(t => t.studentId === student.id), [thesisChapters, student]);
  const overallProgress = calculateOverallProgress(student, myMilestones, myObjectives, myPublications, myThesisChapters);
  const timeUsedPercent = calculateTimeUsedPercent(student);
  const attentionScore = computeAttentionScore(student, myMilestones, myUpdates, myPublications, myTasks, myThesisChapters);
  const computedRisk = riskFromScore(attentionScore, overallProgress);
  const thesisProgress = Math.round(myThesisChapters.reduce((sum, chapter) => sum + chapter.progressPercent, 0) / (myThesisChapters.length || 1));

  const handlePostMeetingLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetingSummary || !meetingFeedback) {
      alert("Please fill out discussion summary and supervisor comments.");
      return;
    }

    const compiledActions = meetingActions
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    onAddMeetingLog({
      meetingDate: '2026-05-20', // current date
      summary: meetingSummary,
      supervisorFeedback: meetingFeedback,
      actionItems: compiledActions.length > 0 ? compiledActions : ['Review overall targets'],
      deadline: meetingDeadline,
      nextMeetingDate
    });

    setMeetingSummary('');
    setMeetingFeedback('');
    setMeetingActions('');
    alert("New meeting log entry published successfully matching Section 9 schema!");
  };

  const handlePublishUpdateFeedback = (updateId: string) => {
    if (!feedbackInput.trim()) return;
    onAddFeedbackToUpdate(updateId, feedbackInput);
    setActiveFeedbackUpdateId(null);
    setFeedbackInput('');
    alert("Response notes published to student progress feed.");
  };

  const handleQuickTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTaskTitle) return;
    onAddTaskForStudent(quickTaskTitle, quickTaskPriority, quickTaskArea);
    setQuickTaskTitle('');
    alert(`Added "${quickTaskTitle}" to active checklist.`);
  };

  return (
    <div className="space-y-8" id="student-drilldown-profile">
      {/* Return Navigation and Student Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-205 text-slate-600 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 font-sans font-semibold text-xs active:scale-[0.98]"
            id="back-to-dashboard-btn"
          >
            <ArrowLeft className="w-4 h-4" />
            Dashboard
          </button>
          
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold font-sans text-slate-900">{student.name}</h1>
              <span className="text-xs font-bold font-mono px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full">{student.studentType} Profile</span>
            </div>
            <p className="text-xs font-sans text-slate-400 mt-0.5 font-semibold uppercase font-mono">Email Contact: {student.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isProductionData && (
            <button
              onClick={() => onLinkStudentAccount?.(student.id)}
              disabled={Boolean(student.userId)}
              className="text-xs font-bold px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {student.userId ? 'Student Account Linked' : 'Link Student Account'}
            </button>
          )}
          <span className="text-xs font-mono font-medium text-slate-400">Attention Rating:</span>
          <span className="text-sm font-bold font-mono text-rose-500">{attentionScore} / 100</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          ['Overall Progress', `${overallProgress}%`, 'Research output and milestone completion'],
          ['Time Used', `${timeUsedPercent}%`, 'Compared with maximum study duration'],
          ['Risk Status', computedRisk, 'Calculated from updates, deadlines, and progress'],
          ['Thesis Progress', `${thesisProgress}%`, 'Average chapter completion']
        ].map(([label, value, helper]) => (
          <div key={label} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-xs">
            <p className="text-[10px] uppercase font-mono font-bold text-slate-400">{label}</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{value}</h3>
            <p className="text-xs text-slate-500 mt-1">{helper}</p>
          </div>
        ))}
      </div>

      {/* Grid: Left column holds details, timeline progress and objectives. Right column holds actions and records. */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Progression maps and target validations */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Research Title Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-2">
            <span className="text-[10px] font-mono font-bold text-indigo-600 bg-indigo-50/50 px-2 py-0.5 rounded uppercase">Topic of Thesis</span>
            <h2 className="text-lg font-sans font-extrabold text-slate-900 leading-snug">{student.researchTitle}</h2>
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <span>Commenced: <strong>{student.startDate}</strong></span>
              <span>Deadline: <strong className="text-slate-600">{student.expectedEndDate}</strong></span>
            </div>
          </div>

          {/* Research Objectives checklists (PhD / Masters specific) Section 3 */}
          {myObjectives.length > 0 && (
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-slate-900 font-sans flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                Linked Research Objectives checklist
              </h3>

              <div className="space-y-3">
                {myObjectives.map(obj => (
                  <div key={obj.id} className="p-3 bg-slate-50 rounded-xl border border-slate-105 flex justify-between items-center">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-slate-400">Objective {obj.objectiveNo}</span>
                      <p className="text-xs font-semibold text-slate-800 leading-relaxed font-sans">{obj.description}</p>
                    </div>
                    <span className="text-xs font-mono font-bold text-indigo-600 shrink-0 bg-white border border-slate-200 px-2 py-0.5 rounded-lg shadow-2xs">
                      {obj.progressPercent}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Academic Milestones Review Panel Section 3 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 font-sans flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                Academic Milestones &amp; Submissions Validation
              </h3>
              <span className="text-[10px] font-mono text-slate-400">Section 10 Status</span>
            </div>

            <p className="text-xs text-slate-500">
              Below are the assigned semester timelines. Overdue files or revisions generate scoring warnings inside the supervisory ranking module.
            </p>

            <div className="space-y-3">
              {myMilestones.map(mil => {
                const statusStyles = 
                  mil.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                  mil.status === 'Submitted' ? 'bg-indigo-50 text-indigo-700 border-indigo-100 border-2 border-dashed font-semibold animate-pulse' :
                  mil.status === 'Need revision' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                  mil.status === 'Overdue' ? 'bg-rose-50 text-rose-700 border-rose-100 font-bold' :
                  'bg-slate-50 text-slate-650 border-slate-100';

                return (
                  <div key={mil.id} className="p-4 bg-slate-50 rounded-xl border border-slate-105 space-y-3">
                    <div className="flex justify-between items-start gap-4 flex-wrap">
                      <div>
                        <h4 className="text-sm font-sans font-bold text-slate-900">{mil.title}</h4>
                        <span className="text-[10px] font-mono text-slate-500 block">Output Expected: {mil.expectedOutput}</span>
                      </div>

                      <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold uppercase border ${statusStyles}`}>
                        {mil.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-4 pt-2 border-t border-slate-200/50">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                        <span>Period: <strong>{mil.period}</strong></span>
                        <span>•</span>
                        <span>Due: {mil.deadline}</span>
                      </div>

                      {/* Validator Buttons */}
                      <div className="flex gap-2">
                        {mil.status === 'Submitted' && (
                          <>
                            <button 
                              onClick={() => {
                                onApproveMilestone(mil.id, 'Approved');
                                alert(`Milestone "${mil.title}" Approved and validated!`);
                              }}
                              className="text-[11px] font-sans font-semibold bg-emerald-600 hover:bg-emerald-750 text-white px-2.5 py-1 rounded-md cursor-pointer transition-all flex items-center gap-1 shadow-sm"
                            >
                              <Check className="w-3.5 h-3.5" /> Approve
                            </button>
                            <button 
                              onClick={() => {
                                onApproveMilestone(mil.id, 'Need revision');
                                alert(`Milestone "${mil.title}" marked as "Need revision".`);
                              }}
                              className="text-[11px] font-sans font-semibold bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-205 px-2.5 py-1 rounded-md cursor-pointer transition-all flex items-center gap-1 shadow-sm"
                            >
                              <X className="w-3.5 h-3.5" /> Reject
                            </button>
                          </>
                        )}
                        {mil.status !== 'Approved' && mil.status !== 'Submitted' && (
                          <button 
                            onClick={() => {
                              onApproveMilestone(mil.id, 'Approved');
                              alert(`Milestone "${mil.title}" explicitly marked as Approved by Academic.`);
                            }}
                            className="text-[11px] font-sans font-semibold text-indigo-600 hover:text-indigo-800 bg-white border border-slate-205 px-2.5 py-1 rounded-md cursor-pointer transition-all flex items-center gap-1"
                          >
                            Mark Approved
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 font-sans flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-indigo-600" />
              Thesis / Report Chapter Detail
            </h3>
            <div className="space-y-3">
              {myThesisChapters.map(chapter => (
                <div key={chapter.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex justify-between gap-3">
                    <div>
                      <p className="font-bold text-sm text-slate-900">{chapter.title}</p>
                      <p className="text-[10px] font-mono text-slate-500">{chapter.status} • {chapter.wordCount.toLocaleString()} words • Updated {chapter.updatedAt}</p>
                    </div>
                    <span className="text-xs font-mono font-bold text-indigo-600">{chapter.progressPercent}%</span>
                  </div>
                  <div className="mt-2 h-2 bg-white rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${chapter.progressPercent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Academic Review and action entries */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Quick Task Creation For Student */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 font-sans flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-indigo-600" />
              Assign Quick Progress Action Item
            </h3>

            <form onSubmit={handleQuickTaskSubmit} className="space-y-3">
              <input 
                type="text"
                placeholder="Action item title..."
                value={quickTaskTitle}
                onChange={(e) => setQuickTaskTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 text-xs border border-slate-200 rounded-lg outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100 font-sans"
              />
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={quickTaskPriority}
                  onChange={(e) => setQuickTaskPriority(e.target.value as any)}
                  className="px-2 py-2 bg-slate-50 text-xs border border-slate-200 rounded-lg outline-none cursor-pointer font-sans"
                >
                  <option value="High font-sans">High Priority</option>
                  <option value="Medium font-sans">Medium Priority</option>
                  <option value="Low font-sans">Low Priority</option>
                </select>
                <input 
                  type="text"
                  placeholder="Area (e.g. Chapter 4)"
                  value={quickTaskArea}
                  onChange={(e) => setQuickTaskArea(e.target.value)}
                  className="px-3 py-2 bg-slate-50 text-xs border border-slate-205 rounded-lg outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100 font-sans"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all cursor-pointer whitespace-nowrap"
              >
                Assign Task
              </button>
            </form>
          </div>

          {/* New supervision log compiler */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 font-sans flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-indigo-600" />
                Schedule &amp; Record Sync Minutes
              </h3>
              <span className="text-[10px] font-mono text-slate-400">Meeting Log</span>
            </div>

            <p className="text-xs text-slate-500">
              Submit discussion outlines, actionable change requests, and next meeting windows directly to the student&apos;s progress history.
            </p>

            <form onSubmit={handlePostMeetingLog} className="space-y-4">
              <div>
                <label className="text-xs font-mono font-semibold text-slate-500 uppercase block mb-1">supervision sync summary *</label>
                <textarea
                  required
                  rows={2}
                  value={meetingSummary}
                  onChange={(e) => setMeetingSummary(e.target.value)}
                  placeholder="Review calibration, check code simulation plots, confirm chapter 4 milestones..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-850 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all font-sans"
                />
              </div>

              <div>
                <label className="text-xs font-mono font-semibold text-slate-500 uppercase block mb-1">Supervisor feedback / Actionable review *</label>
                <textarea
                  required
                  rows={2}
                  value={meetingFeedback}
                  onChange={(e) => setMeetingFeedback(e.target.value)}
                  placeholder="Format Figure 4.1, compile mathematical proof drafts by next Friday..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-850 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all font-sans"
                />
              </div>

              <div>
                <label className="text-xs font-mono font-semibold text-slate-500 uppercase block mb-1">Detailed action list (one per line)</label>
                <textarea
                  rows={2}
                  value={meetingActions}
                  onChange={(e) => setMeetingActions(e.target.value)}
                  placeholder="Incorporate variance bounds on David's graphs&#10;Submit draft Chapter 5 output"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-850 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-150 transition-all font-sans font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-mono font-semibold text-slate-400 uppercase block mb-1">Action due</label>
                  <input
                    type="date"
                    value={meetingDeadline}
                    onChange={(e) => setMeetingDeadline(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none font-mono text-slate-800"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono font-semibold text-slate-400 uppercase block mb-1">Next meeting date</label>
                  <input
                    type="date"
                    value={nextMeetingDate}
                    onChange={(e) => setNextMeetingDate(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none font-mono text-slate-800"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-2.5 rounded-xl transition-all cursor-pointer shadow-sm flex items-center justify-center gap-1.5 active:scale-[0.98]"
              >
                <Plus className="w-4 h-4" /> Record Progress Meeting
              </button>
            </form>
          </div>

          {/* Student Progress Stream and Endorsements Feed Section 4 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 font-sans flex items-center gap-2">
              <Activity className="w-1.5 h-4 bg-indigo-600 rounded-sm" />
              Progress Logs &amp; Endorsements Feed
            </h3>

            <div className="space-y-4 max-h-[360px] overflow-y-auto pr-2">
              {myUpdates.map(up => (
                <div key={up.id} className="p-3 bg-slate-50 border border-slate-105 rounded-xl space-y-2">
                  <div className="flex justify-between items-center bg-slate-200/50 p-1 rounded">
                    <span className="text-[10px] font-mono font-bold text-slate-600">Reporting: {up.weekStart}</span>
                    <span className="text-[9px] font-mono font-bold text-indigo-600 bg-white px-2 py-0.5 rounded uppercase">Submitted ✓</span>
                  </div>

                  <p className="text-xs text-slate-650 font-sans leading-relaxed">
                    <strong className="text-slate-600 font-mono text-[9px] uppercase block">Accomplished:</strong>
                    {up.completedThisWeek}
                  </p>

                  {up.evidenceFileName && (
                    <div className="flex items-center gap-1 text-[11px] font-mono text-indigo-600 bg-indigo-50/50 p-1.5 rounded">
                      <Folder className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Evidence: <strong className="font-semibold underline cursor-pointer">{up.evidenceFileName}</strong></span>
                    </div>
                  )}

                  {up.feedbackText ? (
                    <div className="bg-white p-2.5 rounded-lg border border-emerald-100 text-xs">
                      <strong className="text-emerald-700 font-mono text-[9px] uppercase block">Published Endorsement:</strong>
                      <p className="text-slate-600 italic font-sans mt-0.5">&quot;{up.feedbackText}&quot;</p>
                    </div>
                  ) : activeFeedbackUpdateId === up.id ? (
                    <div className="space-y-2 bg-white p-3 rounded-lg border border-indigo-100">
                      <textarea
                        rows={2}
                        value={feedbackInput}
                        onChange={(e) => setFeedbackInput(e.target.value)}
                        placeholder="Type comments, feedback, or review details..."
                        className="w-full p-2 text-xs border border-slate-200 rounded outline-none font-sans"
                      />
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handlePublishUpdateFeedback(up.id)}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-sans font-bold px-2 py-1 rounded cursor-pointer"
                        >
                          Publish Feedback
                        </button>
                        <button 
                          onClick={() => setActiveFeedbackUpdateId(null)}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-sans font-bold px-2 py-1 rounded cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setActiveFeedbackUpdateId(up.id)}
                      className="text-[10px] font-sans font-bold text-indigo-600 hover:text-indigo-850 hover:bg-indigo-50/50 p-1.5 rounded-lg border border-indigo-100 transition-all cursor-pointer flex items-center gap-1 w-full justify-center bg-white"
                    >
                      <Plus className="w-3 h-3" /> Endorse &amp; Give Feedback
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

