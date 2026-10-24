import React, { useEffect, useState } from 'react';
import { apiFetch } from '../services/api';
import { User } from '../types';
import { Clock, Calendar, AlertTriangle, ArrowRight, Building2, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [checkingIn, setCheckingIn] = useState<boolean>(false);
  const [checkInStatus, setCheckInStatus] = useState<string>('');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleCheckIn = async () => {
    setCheckingIn(true);
    setCheckInStatus('');

    try {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            const res = await apiFetch('/attendance/check-in', {
              method: 'POST',
              body: JSON.stringify({ lat: latitude, lng: longitude, source: 'web' }),
            });
            setCheckInStatus(`Success: ${res.message || 'Checked in successfully!'}`);
            setCheckingIn(false);
          },
          async () => {
            const res = await apiFetch('/attendance/check-in', {
              method: 'POST',
              body: JSON.stringify({ source: 'web' }),
            });
            setCheckInStatus(`Success: ${res.message || 'Checked in successfully!'}`);
            setCheckingIn(false);
          }
        );
      } else {
        const res = await apiFetch('/attendance/check-in', {
          method: 'POST',
          body: JSON.stringify({ source: 'web' }),
        });
        setCheckInStatus(`Success: ${res.message || 'Checked in successfully!'}`);
        setCheckingIn(false);
      }
    } catch (err: any) {
      setCheckInStatus(`Error: ${err.message || 'Check-in failed'}`);
      setCheckingIn(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard Overview</h1>
        <p className="text-slate-400 text-sm mt-1">
          Welcome back, <span className="text-indigo-400 font-medium">{user.email}</span>
        </p>
      </div>

      {/* Quick Web Check-In Widget */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-400" />
            Daily Attendance Check-In
          </h2>
          <p className="text-slate-400 text-sm mt-1">Mark your daily presence using location-enabled check-in.</p>
          {checkInStatus && (
            <p className={`text-xs mt-2 ${checkInStatus.startsWith('Error') ? 'text-red-400' : 'text-emerald-400'}`}>
              {checkInStatus}
            </p>
          )}
        </div>
        <button
          onClick={handleCheckIn}
          disabled={checkingIn}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-6 py-2.5 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          {checkingIn ? 'Processing...' : 'Mark Check-In'}
        </button>
      </div>

      {/* KPI Cards Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-slate-400">Hours This Week</span>
            <Clock className="w-5 h-5 text-indigo-400" />
          </div>
          <p className="text-3xl font-bold text-white">38.5 / 40h</p>
          <span className="text-xs text-emerald-400 mt-2 block">On track for full week target</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-slate-400">Late Arrival Count</span>
            <AlertTriangle className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-3xl font-bold text-white">1 Days</p>
          <span className="text-xs text-slate-500 mt-2 block">Grace period applied (09:15 AM rule)</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-slate-400">Leave Balance</span>
            <Calendar className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-3xl font-bold text-white">12 Days</p>
          <span className="text-xs text-slate-500 mt-2 block">Annual, Casual & Sick balance remaining</span>
        </div>
      </div>

      {/* Shortcut AI Banner */}
      <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 border border-indigo-700/50 rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-white">Gemini HR Assistant</h3>
          <p className="text-sm text-slate-300 mt-1">
            Ask questions about your leave balance, company policy, or attendance records.
          </p>
        </div>
        <Link
          to="/ai-assistant"
          className="bg-white text-slate-950 font-semibold px-4 py-2 rounded-lg text-sm hover:bg-slate-100 transition-colors flex items-center gap-2"
        >
          <span>Ask Assistant</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}