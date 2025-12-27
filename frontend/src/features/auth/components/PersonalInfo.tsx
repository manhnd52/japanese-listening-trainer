'use client';

import React, { useState, useEffect } from 'react';
import { useProfile } from '@/features/auth/hooks/useProfile';

const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const EnvelopeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>;
const LockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const SaveIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>;

export default function PersonalInfo() {
  const { user, updateProfile, isLoading, error, successMessage } = useProfile();
  const [fullname, setFullname] = useState('');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    if (user) setFullname(user.fullname);
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await updateProfile({ fullname, newPassword: newPassword || undefined });
    if (success) setNewPassword('');
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="bg-white rounded-[20px] shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-gray-100 p-8">
      <h2 className="text-xl font-bold text-green-900 mb-6">Personal Information</h2>
      
      {/* Alerts */}
      {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">{error}</div>}
      {successMessage && <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-lg text-sm border border-green-100">{successMessage}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400"><UserIcon /></span>
            <input type="text" value={fullname} onChange={(e) => setFullname(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-[#F0FDF4] border border-[#DCFCE7] rounded-xl text-gray-700 focus:ring-2 focus:ring-green-500/50 outline-none" />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400"><EnvelopeIcon /></span>
            <input type="email" value={user.email} readOnly className="w-full pl-12 pr-4 py-3 bg-[#F0FDF4] border border-[#DCFCE7] rounded-xl text-gray-500 cursor-not-allowed" />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Change Password</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400"><LockIcon /></span>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password" className="w-full pl-12 pr-4 py-3 bg-[#F0FDF4] border border-[#DCFCE7] rounded-xl text-gray-700 focus:ring-2 focus:ring-green-500/50 outline-none" />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button type="submit" disabled={isLoading} className={`flex items-center px-8 py-3 rounded-xl text-white font-bold shadow-md transition-all ${isLoading ? 'bg-green-800/70' : 'bg-[#3F6212] hover:bg-[#365314]'}`}>
            <div className="mr-2"><SaveIcon /></div>
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}