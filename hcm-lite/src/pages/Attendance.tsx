import React, { useEffect, useState } from 'react';
import { apiFetch } from '../services/api';
import { AttendanceRecord } from '../types';
import { Clock, CheckCircle2, AlertTriangle, XCircle, Calendar } from 'lucide-react';

export default function Attendance() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadAttendance() {
      try {
        const data = await apiFetch<AttendanceRecord[]>('/attendance');
        setRecords(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadAttendance();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
          <Clock className="w-8 h-8 text-indigo-400" />
          Attendance Board
        </h1>
        <p className="text-slate-400 text-sm mt-1">Daily check-in logs, late status, and time stamps.</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-800 text-xs uppercase text-slate-400 border-b border-slate-700">
            <tr>
              <th className="p-4">Date</th>
              <th className="p-4">Check In</th>
              <th className="p-4">Check Out</th>
              <th className="p-4">Source</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center p-8 text-slate-500">Loading records...</td>
              </tr>
            ) : records.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center p-8 text-slate-500">No attendance records found.</td>
              </tr>
            ) : (
              records.map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-800/50">
                  <td className="p-4 font-medium text-white">{rec.date}</td>
                  <td className="p-4 font-mono">{rec.checkIn}</td>
                  <td className="p-4 font-mono">{rec.checkOut || '--:--'}</td>
                  <td className="p-4 uppercase text-xs text-slate-400">{rec.source}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      rec.status === 'PRESENT' ? 'bg-emerald-500/10 text-emerald-400' :
                      rec.status === 'LATE' ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'
                    }`}>
                      {rec.status}
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