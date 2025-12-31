
import React, { useState } from 'react';
import { ProblemType, TreeData } from '../types';
import { PROBLEM_TYPES } from '../constants';

interface ProblemSetupProps {
  onComplete: (data: Partial<TreeData>) => void;
}

const ProblemSetup: React.FC<ProblemSetupProps> = ({ onComplete }) => {
  const [statement, setStatement] = useState('');
  const [type, setType] = useState<ProblemType>('Business');
  const [scope, setScope] = useState('');
  const [success, setSuccess] = useState('');

  const isValid = statement.trim().length > 10 && scope.trim().length > 5;

  return (
    <div className="max-w-2xl mx-auto mt-20 p-8 bg-white rounded-2xl shadow-xl border border-slate-200">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Define the Problem</h1>
          <p className="text-slate-500">Every clear solution starts with a sharp problem statement.</p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">The Problem Statement</label>
          <textarea
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none min-h-[100px]"
            placeholder="e.g., How can we increase the monthly recurring revenue of our SaaS product by 20% in Q3?"
            value={statement}
            onChange={(e) => setStatement(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Problem Category</label>
            <select
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={type}
              onChange={(e) => setType(e.target.value as ProblemType)}
            >
              {PROBLEM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Success Criteria</label>
            <input
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="e.g., Specific target numbers"
              value={success}
              onChange={(e) => setSuccess(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Scope & Constraints</label>
          <input
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="e.g., Budget, timeframe, geography"
            value={scope}
            onChange={(e) => setScope(e.target.value)}
          />
        </div>

        <button
          disabled={!isValid}
          onClick={() => onComplete({ problemStatement: statement, problemType: type, scope, successCriteria: success })}
          className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
            isValid 
              ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200' 
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }`}
        >
          Start Building Tree
        </button>
      </div>
    </div>
  );
};

export default ProblemSetup;
