'use client';

import { useState, useEffect } from 'react';
import { useProfile } from '../hooks/useProfile';
import { Plus, Trash2, Bell, Clock, Save } from 'lucide-react';

export default function ReminderSettings() {
  const { user, saveSettings, isLoading } = useProfile();

  const [enabled, setEnabled] = useState(false);
  const [times, setTimes] = useState<string[]>(['20:00']);
  const [newTime, setNewTime] = useState('');

  useEffect(() => {
    const settings = (user as any)?.settings || (user as any)?.userSetting;
    
    if (settings) {
      setEnabled(settings.allowEmailNotification ?? false);
      setTimes(settings.reminderTimes || ['20:00']);
    }
  }, [user]);

  const handleToggle = () => setEnabled(!enabled);

  const handleAddTime = () => {
    if (newTime && !times.includes(newTime)) {
      setTimes([...times, newTime].sort());
      setNewTime('');
    }
  };

  const handleDeleteTime = (timeToDelete: string) => {
    setTimes(times.filter((t) => t !== timeToDelete));
  };

  const handleSave = async () => {
    const result = await saveSettings({
      allowEmailNotification: enabled,
      reminderTimes: times
    });

    if (result.success) {
      alert('Cài đặt nhắc nhở đã được lưu!');
    } else {
      alert(`Lỗi: ${result.error}`);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-brand-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-brand-900 flex items-center gap-2">
          <Bell className="text-brand-500" size={24} /> Notification Settings
        </h3>
      </div>

      {/* Toggle Switch */}
      <div className="bg-brand-50 p-5 rounded-2xl flex items-center justify-between mb-8 border border-brand-100">
        <div>
          <h4 className="font-bold text-brand-900 text-lg">Email Reminders</h4>
          <p className="text-sm text-brand-500 mt-1">Receive daily streak reminders via email</p>
        </div>
        <button
          onClick={handleToggle}
          className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 ${
            enabled ? 'bg-brand-600' : 'bg-gray-300'
          }`}
        >
          <div
            className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${
              enabled ? 'translate-x-6' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Time List Area */}
      <div className={`transition-all duration-300 ${enabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
        <h4 className="font-bold text-xs text-brand-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Clock size={16} /> Reminder Times
        </h4>

        <div className="space-y-3 mb-6">
          {times.map((time) => (
            <div key={time} className="flex items-center justify-between p-4 bg-white border border-brand-200 rounded-xl group hover:border-brand-400 hover:shadow-md transition-all">
              <span className="font-mono font-bold text-xl text-brand-700 tracking-wider">{time}</span>
              <button 
                onClick={() => handleDeleteTime(time)}
                className="text-gray-300 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>

        {/* Add Time Input */}
        <div className="flex gap-3 pt-4 border-t border-brand-100">
          <input
            type="time"
            value={newTime}
            onChange={(e) => setNewTime(e.target.value)}
            className="flex-1 bg-brand-50 border border-brand-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-500 text-brand-900 font-mono text-lg"
          />
          <button
            onClick={handleAddTime}
            disabled={!newTime}
            className="bg-brand-100 hover:bg-brand-200 text-brand-700 px-6 rounded-xl font-bold flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
          >
            <Plus size={20} /> Add
          </button>
        </div>

        {/* Save Button */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="bg-brand-900 hover:bg-brand-800 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-brand-900/20 transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-70"
          >
            {isLoading ? 'Saving...' : <><Save size={20}/> Save Changes</>}
          </button>
        </div>
      </div>
    </div>
  );
}