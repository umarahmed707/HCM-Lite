import React, { useEffect, useState } from 'react';
import { apiFetch } from '../services/api';
import { LeaveRequest } from '../types';
import { Calendar, Plus, Check, X } from 'lucide-react';

export default function Leave() {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadLeaves() {
      try {
        const data = await apiFetch<LeaveRequest[]>('/leave');
        setLeaves(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadLeaves();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
          <Calendar className="w-8 h-8 text-indigo-400" />
          Leave Requests & Quotas
        </h1>
        <p className="text-slate-400 text-sm mt-1">Apply for leave and manage HR approval workflows.</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-800 text-xs uppercase text-slate-400 border-b border-slate-700">
            <tr>
              <th className="p-4">Type</th>
              <th className="p-4">Start Date</th>
              <th className="p-4">End Date</th>
              <th className="p-4">Reason</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center p-8 text-slate-500">Loading requests...</td>
              </tr>
            ) : leaves.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center p-8 text-slate-500">No leave requests found.</td>
              </tr>
            ) : (
              leaves.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/50">
                  <td className="p-4 font-medium text-white">{item.type}</td>
                  <td className="p-4">{item.startDate}</td>
                  <td className="p-4">{item.endDate}</td>
                  <td className="p-4 text-slate-400">{item.reason}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      item.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400' :
                      item.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}