import React, { useEffect, useState } from 'react';
import { apiFetch } from '../services/api';
import { FileText, ShieldAlert } from 'lucide-react';

interface AuditLog {
  id: string;
  actor: string;
  action: string;
  entity: string;
  timestamp: string;
}

export default function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadLogs() {
      try {
        const data = await apiFetch<AuditLog[]>('/audit-logs');
        setLogs(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadLogs();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
          <FileText className="w-8 h-8 text-indigo-400" />
          System Audit Logs
        </h1>
        <p className="text-slate-400 text-sm mt-1">Immutable server logs of critical system actions (Admin view only).</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-800 text-xs uppercase text-slate-400 border-b border-slate-700">
            <tr>
              <th className="p-4">Timestamp</th>
              <th className="p-4">Actor</th>
              <th className="p-4">Action</th>
              <th className="p-4">Entity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {loading ? (
              <tr>
                <td colSpan={4} className="text-center p-8 text-slate-500">Loading system logs...</td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center p-8 text-slate-500">No audit logs recorded yet.</td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/50">
                  <td className="p-4 text-xs font-mono text-slate-400">{log.timestamp}</td>
                  <td className="p-4 font-medium text-white">{log.actor}</td>
                  <td className="p-4 font-mono text-xs text-indigo-300">{log.action}</td>
                  <td className="p-4 text-xs uppercase text-slate-400">{log.entity}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}