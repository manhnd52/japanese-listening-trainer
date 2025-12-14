'use client';

import { Flame } from 'lucide-react';

type Stats = {
  streak?: number;
  level?: number;
  exp?: number;
} | null;

type Props = {
  stats: Stats;
  onNavigate: (path: string) => void;
};

const StreakLevel = ({ stats, onNavigate }: Props) => {
  return (
    <>
      <div className="flex items-center gap-1.5 bg-brand-600/50 px-3 py-1.5 rounded-lg border border-brand-400/30">
        <Flame className="text-jlt-peach fill-jlt-peach" size={16} />
        <span className="font-bold text-jlt-peach text-sm">{stats?.streak ?? 0}</span>
      </div>

      <div
        className="hidden md:flex flex-col items-end cursor-pointer"
        onClick={() => onNavigate('/achievements')}
      >
        <span className="text-sm font-bold text-white leading-none">
          Level {stats?.level ?? 1}
        </span>
        <span className="text-[10px] font-medium text-brand-100 leading-none mt-1">
          {stats?.exp ?? 0}/100 EXP
        </span>
      </div>
    </>
  );
};

export default StreakLevel;
