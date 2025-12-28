'use client';

import React, { useState } from 'react';
import { useProfile } from '@/features/auth/hooks/useProfile';
import PersonalInfo from '@/features/auth/components/PersonalInfo';
import ReminderSettings from '@/features/auth/components/ReminderSettings';
import { Bell, User } from 'lucide-react'; 

export default function ProfilePage() {
  const { user } = useProfile();
  const [activeTab, setActiveTab] = useState<'info' | 'reminder'>('info');

  if (!user) return <div className="p-8 text-center text-green-700">Đang tải thông tin...</div>;

  return (
    <div className="min-h-screen bg-white p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-brand-900">Profile</h1>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          
          {/* LEFT COLUMN: Sidebar Menu */}
          <div className="w-full md:w-1/3 space-y-6">
            
            {/* Avatar Card */}
            <div className="bg-white rounded-[20px] shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-gray-100 p-8 flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-[#E8F5E9] flex items-center justify-center text-green-700 mb-4 overflow-hidden border-4 border-white shadow-sm">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-bold">{user.fullname?.[0] || 'U'}</span>
                )}
              </div>
              <h2 className="text-xl font-bold text-gray-800">{user.fullname}</h2>
              <p className="text-sm text-gray-400 mt-1">{user.email}</p>
            </div>

            {/* Menu Navigation (Đã sửa để bấm được) */}
            <div className="bg-white rounded-[20px] shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden flex flex-col">
              
              {/* Nút Personal Info */}
              <button
                onClick={() => setActiveTab('info')}
                className={`flex items-center px-6 py-4 font-medium transition-all text-left w-full
                  ${activeTab === 'info' 
                    ? 'bg-[#F0FDF4] text-green-800 border-l-4 border-green-700' 
                    : 'text-gray-500 hover:bg-gray-50 border-l-4 border-transparent'
                  }`}
              >
                <User size={20} className="mr-3" />
                Personal Info
              </button>

              {/* Nút Reminder Settings (Mới thêm) */}
              <button
                onClick={() => setActiveTab('reminder')}
                className={`flex items-center px-6 py-4 font-medium transition-all text-left w-full border-t border-gray-50
                  ${activeTab === 'reminder' 
                    ? 'bg-[#F0FDF4] text-green-800 border-l-4 border-green-700' 
                    : 'text-gray-500 hover:bg-gray-50 border-l-4 border-transparent'
                  }`}
              >
                <Bell size={20} className="mr-3" />
                Reminder Settings
              </button>

            </div>
          </div>

          {/* RIGHT COLUMN: Content */}
          <div className="w-full md:w-2/3">
             {/* Render có điều kiện dựa trên tab đang chọn */}
            {activeTab === 'info' && <PersonalInfo />}
            {activeTab === 'reminder' && <ReminderSettings />}
          </div>

        </div>
      </div>
    </div>
  );
}