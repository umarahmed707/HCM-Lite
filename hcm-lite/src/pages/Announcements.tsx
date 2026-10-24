import React, { useEffect, useState } from 'react';
import { apiFetch } from '../services/api';
import { Megaphone, Plus, Bell } from 'lucide-react';

interface Announcement {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  author: string;
}

export default function Announcements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadAnnouncements() {
      try {
        const data = await apiFetch<Announcement[]>('/announcements');
        setAnnouncements(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadAnnouncements();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
          <Megaphone className="w-8 h-8 text-indigo-400" />
          Company Announcements
        </h1>
        <p className="text-slate-400 text-sm mt-1">Official notices, policy updates, and organization broadcasts.</p>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-500">
            Loading announcements...
          </div>
        ) : announcements.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-500">
            No active announcements.
          </div>
        ) : (
          announcements.map((item) => (
            <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Bell className="w-4 h-4 text-indigo-400" />
                  {item.title}
                </h3>
                <span className="text-xs text-slate-500">{item.createdAt}</span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">{item.content}</p>
              <span className="text-xs text-slate-500 block pt-2">Posted by: {item.author}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}