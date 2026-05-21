/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Calendar, PlusCircle, BookOpen, User, Mail, ShieldAlert, FileText, ChevronRight } from 'lucide-react';
import { StudentProfile, StudentType, StudentRisk } from '../types';

interface StudentRegistrationProps {
  onRegister: (newStud: Omit<StudentProfile, 'id' | 'riskStatus' | 'attentionScore' | 'thesisStatus' | 'userId'>) => void;
  onCancel: () => void;
}

export default function StudentRegistration({ onRegister, onCancel }: StudentRegistrationProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [studentType, setStudentType] = useState<StudentType>('FYP');
  const [startDate, setStartDate] = useState('2025-09-01');
  const [expectedEndDate, setExpectedEndDate] = useState('2026-06-15');
  const [maxEndDate, setMaxEndDate] = useState('2026-09-01');
  const [researchTitle, setResearchTitle] = useState('');

  // Automatically update suggested expected/max dates based on selected student type
  const handleTypeChange = (type: StudentType) => {
    setStudentType(type);
    if (type === 'FYP') {
      setExpectedEndDate('2026-06-15');
      setMaxEndDate('2026-09-01');
    } else if (type === 'Master') {
      setExpectedEndDate('2027-08-31');
      setMaxEndDate('2028-08-31');
    } else {
      setExpectedEndDate('2029-08-31');
      setMaxEndDate('2031-08-31');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !researchTitle) {
      alert("Please populate all required fields.");
      return;
    }

    onRegister({
      name,
      email,
      studentType,
      startDate,
      expectedEndDate,
      maxEndDate,
      researchTitle
    });

    setName('');
    setEmail('');
    setResearchTitle('');
    alert(`Success: ${name} added to supervised student roster.`);
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm max-w-2xl mx-auto space-y-6" id="student-registration-dialog">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 font-sans flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-indigo-600" />
            Register Supervised Academic Profile
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Initialize a student record. The tracker automatically binds the default milestones matching Section 3 templates.</p>
        </div>
        <button 
          onClick={onCancel}
          className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer transition-all"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-mono font-semibold text-slate-500 uppercase block mb-1">Student full name *</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input 
                type="text" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Liam Thompson"
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-205 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all font-sans"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-mono font-semibold text-slate-500 uppercase block mb-1">Institutional Email *</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. l.thompson@university.edu"
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-205 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all font-sans"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-mono font-semibold text-slate-500 uppercase block mb-1">Academic track category *</label>
            <select
              value={studentType}
              onChange={(e) => handleTypeChange(e.target.value as StudentType)}
              className="w-full p-2.5 bg-slate-55 bg-slate-50 text-xs font-sans text-slate-700 border border-slate-200 rounded-xl outline-none cursor-pointer"
            >
              <option value="FYP">FYP Student</option>
              <option value="Master">Master Student</option>
              <option value="PhD">PhD Candidate</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-mono font-semibold text-slate-500 uppercase block mb-1">Commencement Start</label>
            <input 
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none font-mono"
            />
          </div>

          <div>
            <label className="text-xs font-mono font-semibold text-slate-501 text-slate-500 uppercase block mb-1">Expected Completion</label>
            <input 
              type="date"
              value={expectedEndDate}
              onChange={(e) => setExpectedEndDate(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none font-mono"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-mono font-semibold text-slate-500 uppercase block mb-1">Thesis Research Title *</label>
          <div className="relative">
            <BookOpen className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <textarea 
              required
              rows={2}
              value={researchTitle}
              onChange={(e) => setResearchTitle(e.target.value)}
              placeholder="e.g. Design and Validation of Post-Quantum Cryptographic Frameworks..."
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-205 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all font-sans"
            />
          </div>
        </div>

        {/* Milestone Template Auto-bind indicator Section 10 */}
        <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl space-y-2">
          <h4 className="text-xs font-bold text-indigo-700 font-sans flex items-center gap-1.5 uppercase font-mono">
            <ShieldAlert className="w-4 h-4 text-indigo-500" />
            Milestone Template Will Auto-Bootstrap
          </h4>
          <p className="text-xs text-indigo-600/80 leading-relaxed font-sans">
            {studentType === 'FYP' && 'FYP Template (Semester 1 chapters, results analysis, Chapter 4 results & discussion, Chapter 5 conclusion, and Final submission) will be spawned.'}
            {studentType === 'Master' && 'Masters Template (3 Objectives, 1 peer-reviewed article draft, thesis drafting Chapters 1-5, and successful viva corrections) will be spawned.'}
            {studentType === 'PhD' && 'PhD Template (proposal defense, 3 sub-objectives, 2 distinct article publications, thesis draft compilation, notice of submission, and Viva Voce defense) will be spawned.'}
          </p>
        </div>

        <div className="flex items-center gap-3 pt-4 border-t border-slate-100 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 hover:bg-slate-100 text-slate-505 border border-slate-205 text-xs font-semibold rounded-xl transition-all cursor-pointer font-sans"
          >
            Cancel
          </button>
          
          <button
            type="submit"
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer whitespace-nowrap active:scale-[0.98]"
          >
            Confirm Registration <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}

