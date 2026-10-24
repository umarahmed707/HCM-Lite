import React, { useEffect, useState } from 'react';
import { apiFetch } from '../services/api';
import { CircleDollarSign, Lock, FileText } from 'lucide-react';

export default function Payroll() {
  const [isFinalized, setIsFinalized] = useState<boolean>(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <CircleDollarSign className="w-8 h-8 text-indigo-400" />
            Monthly Payroll
          </h1>
          <p className="text-slate-400 text-sm mt-1">Review draft calculations, deductions, and tax slabs.</p>
        </div>

        <button
          onClick={() => setIsFinalized(true)}
          disabled={isFinalized}
          className="bg-red-600 hover:bg-red-500 text-white font-medium px-4 py-2.5 rounded-lg text-sm flex items-center gap-2 disabled:opacity-50"
        >
          <Lock className="w-4 h-4" />
          <span>{isFinalized ? 'Payroll Locked' : 'Finalize Payroll Run'}</span>
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Summary Draft</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="p-4 bg-slate-800 rounded-lg">
            <span className="text-slate-400 block text-xs">Total Gross</span>
            <span className="text-xl font-bold text-white font-mono">PKR 1,250,000</span>
          </div>
          <div className="p-4 bg-slate-800 rounded-lg">
            <span className="text-slate-400 block text-xs">Tax Deductions</span>
            <span className="text-xl font-bold text-red-400 font-mono">PKR 85,000</span>
          </div>
          <div className="p-4 bg-slate-800 rounded-lg">
            <span className="text-slate-400 block text-xs">Net Payable</span>
            <span className="text-xl font-bold text-emerald-400 font-mono">PKR 1,165,000</span>
          </div>
        </div>
      </div>
    </div>
  );
}