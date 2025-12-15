'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { Source } from '@/store/features/player/playerSlice';
import { useRelaxMode } from '../hooks';

interface RelaxModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectOption: (option: Source) => void;
}

const RelaxModeModal = ({ isOpen, onClose, onSelectOption }: RelaxModeModalProps) => {
  const [selectedOption, setSelectedOption] = useState<Source | null>(null);
  const { isLoading, loadRandomAudios } = useRelaxMode();

  if (!isOpen) return null;

  const handleSelectOption = async (option: Source) => {
    setSelectedOption(option);
    onSelectOption(option);
    
    await loadRandomAudios(
      option,
      () => {
        // Close modal after successful load
        setTimeout(() => {
          onClose();
        }, 300);
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-brand-500 hover:text-brand-700 transition-colors"
          disabled={isLoading}
        >
          <X size={24} />
        </button>

        {/* Title */}
        <h2 className="text-2xl font-bold text-brand-900 text-center mb-8">
          {isLoading ? 'Loading...' : 'Select Audio Source To Start'}
        </h2>

        {/* Options Container */}
        <div className="flex gap-6 justify-center">
          {/* My List Option */}
          <button
            onClick={() => handleSelectOption(Source.MyList)}
            disabled={isLoading}
            className={`w-32 flex flex-col items-center gap-4 p-6 rounded-2xl border-2 transition-all ${
              selectedOption === Source.MyList
                ? 'bg-brand-50 border-brand-500'
                : 'bg-white border-brand-200 hover:border-brand-400'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="w-16 h-16 rounded-full bg-brand-100 flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-brand-400 flex items-center justify-center text-white text-2xl">
                👤
              </div>
            </div>
            <span className="font-bold text-brand-900">My List</span>
          </button>

          {/* Community Option */}
          <button
            onClick={() => handleSelectOption(Source.Community)}
            disabled={isLoading}
            className={`w-32 flex flex-col items-center gap-4 p-6 rounded-2xl border-2 transition-all ${
              selectedOption === Source.Community
                ? 'bg-brand-50 border-brand-500'
                : 'bg-white border-brand-200 hover:border-brand-400'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="w-16 h-16 rounded-full bg-brand-100 flex items-center justify-center">
              <div className="flex gap-1">
                <div className="w-5 h-5 rounded-full bg-brand-400"></div>
                <div className="w-5 h-5 rounded-full bg-brand-400"></div>
                <div className="w-5 h-5 rounded-full bg-brand-400"></div>
              </div>
            </div>
            <span className="font-bold text-brand-900">Community</span>
          </button>
        </div>

        {/* Wavy bottom decoration */}
        <div className="mt-8 h-8 flex items-center justify-center">
          <svg viewBox="0 0 300 20" className="w-full h-full text-brand-200">
            <path
              d="M0 10 Q 15 5 30 10 T 60 10 T 90 10 T 120 10 T 150 10 T 180 10 T 210 10 T 240 10 T 270 10 T 300 10"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default RelaxModeModal;
