'use client';

import React from 'react';
import { useStats } from '@/features/stats/hooks/useStats';

// --- ICONS (SVG Thuần - Nhẹ & Nhanh) ---
const IconClock = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const IconActivity = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>;
const IconLightning = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-500"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
const IconTrophy = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>;
const IconFire = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-orange-500"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.1.2-2.2.6-3a2.68 2.68 0 0 1 2.9 2.5z"/></svg>;
const IconStats = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#14532d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" x2="18" y1="20" y2="10"/><line x1="12" x2="12" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="14"/></svg>;

export default function StatsPage() {
  // Lấy dữ liệu đã được transform từ Hook
  const { data, period, setPeriod, isLoading } = useStats();

  if (isLoading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-8 bg-green-200 rounded-full mb-2"></div>
          <div className="text-green-800 font-medium">Loading statistics...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-2">
          <div className="flex items-center gap-3 mb-4 md:mb-0">
            <h1 className="text-2xl font-extrabold text-brand-900">Statistics</h1>
          </div>
          
          {/* Period Toggle Buttons */}
          <div className="flex bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
            {(['Week', 'Month', 'All'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                  period === p 
                    ? 'bg-green-50 text-green-800 shadow-sm border border-green-100' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* --- TOP ROW: SUMMARY CARDS --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {data.cards.map((card, idx) => (
            <div key={idx} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  {card.icon === 'clock' && <IconClock />}
                  {card.icon === 'activity' && <IconActivity />}
                  {card.icon === 'lightning' && <IconLightning />}
                  {card.icon === 'trophy' && <IconTrophy />}
                  {card.label}
                </span>
              </div>
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-gray-800">{card.value}</span>
                  {card.unit && <span className="text-sm font-normal text-gray-500">{card.unit}</span>}
                </div>
                {card.subValue && <div className="text-xs text-gray-400 mt-1 font-medium">{card.subValue}</div>}
              </div>
            </div>
          ))}
        </div>

        {/* --- MIDDLE ROW: CHARTS --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* 1. BAR CHART: Learning Activity */}
          <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-lg font-semibold text-gray-800">Learning Activity</h3>
              <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded uppercase tracking-wide">Minutes</span>
            </div>

            {/* Chart Area */}
            <div className="h-56 flex items-end justify-between gap-2 sm:gap-4 px-2">
              {data.activity.map((item, idx) => (
                <div key={idx} className="flex flex-col items-center w-full group cursor-pointer relative">
                  {/* Tooltip */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity mb-2 text-xs bg-gray-800 text-white px-2 py-1 rounded absolute bottom-full whitespace-nowrap z-10 pointer-events-none">
                    {item.value} min
                  </div>
                  {/* Bar */}
                  <div 
                    className="w-full max-w-[40px] bg-[#3F6212] rounded-t-lg hover:bg-[#365314] transition-all relative"
                    style={{ height: item.value === 0 ? '4px' : `${item.value}%` }} 
                  ></div>
                  {/* Label */}
                  <span className="text-xs text-gray-400 mt-3 font-medium">{item.day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 2. DONUT CHART: Quiz Performance */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex flex-col items-center justify-center">
            <h3 className="w-full text-lg font-semibold text-gray-800 mb-6 text-left">Quiz Performance</h3>
            
            <div className="relative w-48 h-48 mb-6">
               {/* Vòng tròn Donut dùng Conic Gradient */}
              <div 
                className="w-full h-full rounded-full transition-all duration-1000 ease-out"
                style={{
                  background: `conic-gradient(#3F6212 0% ${data.quizStats.correct}%, #F87171 ${data.quizStats.correct}% 100%)`
                }}
              ></div>
              {/* Vòng tròn trắng ở giữa để tạo hiệu ứng rỗng */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-36 h-36 bg-white rounded-full flex items-center justify-center shadow-inner">
                <span className="text-4xl font-bold text-gray-800">{data.quizStats.correct}%</span>
              </div>
            </div>

            <div className="flex gap-8 text-sm w-full justify-center">
              <div className="flex flex-col items-center">
                 <div className="flex items-center mb-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#3F6212] mr-2"></span>
                    <span className="font-bold text-gray-700 text-xs tracking-wide">CORRECT</span>
                 </div>
                 <span className="text-gray-900 font-bold text-lg">{data.quizStats.totalCorrect}</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="flex items-center mb-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#F87171] mr-2"></span>
                    <span className="font-bold text-gray-700 text-xs tracking-wide">WRONG</span>
                </div>
                <span className="text-gray-900 font-bold text-lg">{data.quizStats.wrong}%</span>
              </div>
            </div>
          </div>

        </div>

        {/* --- BOTTOM ROW: HEATMAP --- */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Activity Heatmap</h3>
              <p className="text-sm text-gray-500">Your daily learning streak over the last 3 months</p>
            </div>
            
            {/* Legend */}
            <div className="flex items-center text-xs text-gray-400 gap-1.5 bg-gray-50 p-2 rounded-lg">
              <span>Less</span>
              <div className="w-3 h-3 bg-gray-100 rounded-sm"></div>
              <div className="w-3 h-3 bg-[#DCFCE7] rounded-sm"></div>
              <div className="w-3 h-3 bg-[#86EFAC] rounded-sm"></div>
              <div className="w-3 h-3 bg-[#3F6212] rounded-sm"></div>
              <span>More</span>
            </div>
          </div>

          {/* Grid Heatmap */}
          <div className="flex flex-wrap gap-1.5">
            {data.heatmap.map((item, idx) => {
              // Map level to Tailwind colors
              let colorClass = 'bg-gray-100'; // Level 0
              if (item.level === 1) colorClass = 'bg-[#DCFCE7]';
              if (item.level === 2) colorClass = 'bg-[#86EFAC]';
              if (item.level === 3) colorClass = 'bg-[#4ADE80]';
              if (item.level === 4) colorClass = 'bg-[#3F6212]';

              return (
                <div 
                  key={idx} 
                  title={`Date: ${item.date}`}
                  className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-sm ${colorClass} hover:ring-2 hover:ring-green-400 hover:ring-offset-1 transition-all cursor-pointer`}
                ></div>
              );
            })}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center text-sm gap-2">
             <span className="text-gray-600">
               You have been active on <span className="font-bold text-gray-800">25 days</span> this month.
             </span>
             <span className="text-[#ea580c] bg-orange-50 px-3 py-1 rounded-full font-bold flex items-center border border-orange-100 shadow-sm">
                Keep the streak alive! <span className="ml-1.5"><IconFire /></span>
             </span>
          </div>
        </div>

      </div>
    </div>
  );
}