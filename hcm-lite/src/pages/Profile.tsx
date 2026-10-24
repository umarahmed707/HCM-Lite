import React, { useState } from 'react';
import { apiFetch } from '../services/api';
import { UserCheck, CheckCircle, AlertCircle } from 'lucide-react';

export default function Profile() {
  const [phone, setPhone] = useState<string>('+92 300 1234567');
  const [address, setAddress] = useState<string>('Karachi, Pakistan');
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      await apiFetch('/profile', {
        method: 'PUT',
        body: JSON.stringify({ phone, address }),
      });
      setMessage('Profile updated successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    }
  };

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
          <UserCheck className="w-8 h-8 text-indigo-400" />
          My Profile
        </h1>
        <p className="text-slate-400 text-sm mt-1">Update your contact details and home address.</p>
      </div>

      {message && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-lg text-sm flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleUpdate} className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Phone Number</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Residential Address</label>

          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={3}
            className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 text-sm"
          />
        </div>

        <button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-5 py-2.5 rounded-lg text-sm transition-colors"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
}