import React, { useState, useEffect, useRef } from 'react';
import { AudioTrack, Quiz, DictionaryResult } from '../types';
import { Play, Pause, RotateCcw, PlusCircle, CheckCircle, XCircle, Mic, BookOpen, X, ChevronDown, ChevronUp, MoreHorizontal, Heart, Share2, Sparkles, Pencil, Film, HelpCircle, ArrowRight } from 'lucide-react';
import { lookupWord, generateContextDescription } from '../services/geminiService';

interface AudioDetailProps {
  track: AudioTrack;
  onBack: () => void;
  onPlay: () => void;
  onPause: () => void;
  isPlaying: boolean;
  onEditQuiz: () => void;
  onEditAudio: () => void;
  onUpdateTrack: (track: AudioTrack) => void;
  onMistake: (audioId: string, quizId: string) => void;
  onCorrectAnswer?: () => void;
}

const AudioDetail: React.FC<AudioDetailProps> = ({ track, onBack, onPlay, onPause, isPlaying, onEditQuiz, onEditAudio, onUpdateTrack, onMistake, onCorrectAnswer }) => {
  const [viewMode, setViewMode] = useState<'script' | 'overview'>('script');
  const [isGeneratingOverview, setIsGeneratingOverview] = useState(false);
  
  // Quiz Modal State
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [activeQuizIndex, setActiveQuizIndex] = useState(0);
  const [selectedQuizOption, setSelectedQuizOption] = useState<number | null>(null);
  const [quizAnswerStatus, setQuizAnswerStatus] = useState<'correct' | 'wrong' | null>(null);

  // Dictionary State
  const [dictPopup, setDictPopup] = useState<{ x: number, y: number, loading: boolean, data: DictionaryResult | null } | null>(null);

  const handleWordClick = async (e: React.MouseEvent, word: string) => {
    e.stopPropagation();
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    
    // Initial loading state at position
    setDictPopup({
      x: rect.left,
      y: rect.top - 10, // slightly above
      loading: true,
      data: null
    });

    const context = track.script.substring(Math.max(0, track.script.indexOf(word) - 20), Math.min(track.script.length, track.script.indexOf(word) + 20));
    
    // Call Gemini Service
    const result = await lookupWord(word, context);
    
    setDictPopup(prev => prev ? { ...prev, loading: false, data: result } : null);
  };

  const renderScript = () => {
    const words = track.script.split(' ');
    return (
      <p className="leading-9 text-xl text-brand-800 font-medium">
        {words.map((word, idx) => (
          <span 
            key={idx} 
            onClick={(e) => handleWordClick(e, word.replace(/[.,]/g, ''))}
            className="hover:bg-brand-200 hover:text-brand-900 cursor-pointer rounded px-0.5 transition-colors duration-200 inline-block"
          >
            {word}{' '}
          </span>
        ))}
      </p>
    );
  };

  // Generate overview if selected and missing
  useEffect(() => {
    const checkAndGenerateOverview = async () => {
        if (viewMode === 'overview' && !track.overview && !isGeneratingOverview) {
            setIsGeneratingOverview(true);
            const overview = await generateContextDescription(track.script);
            onUpdateTrack({ ...track, overview });
            setIsGeneratingOverview(false);
        }
    };
    checkAndGenerateOverview();
  }, [viewMode, track.overview]);

  // Quiz Handlers
  const handleQuizOptionClick = (quiz: Quiz, optionIdx: number) => {
      if (quizAnswerStatus !== null) return; // Prevent changing after answer
      setSelectedQuizOption(optionIdx);
      
      if (optionIdx === quiz.correctAnswer) {
          setQuizAnswerStatus('correct');
          if (onCorrectAnswer) onCorrectAnswer(); // Gain EXP
      } else {
          setQuizAnswerStatus('wrong');
          onMistake(track.id, quiz.id); // Track mistake
      }
  };

  const handleNextQuiz = () => {
      setSelectedQuizOption(null);
      setQuizAnswerStatus(null);
      if (track.quizzes && activeQuizIndex < track.quizzes.length - 1) {
          setActiveQuizIndex(prev => prev + 1);
      } else {
          // Finished
          alert("Quiz Completed!");
          setIsQuizModalOpen(false);
          setActiveQuizIndex(0);
      }
  };

  const currentQuiz = track.quizzes && track.quizzes.length > 0 ? track.quizzes[activeQuizIndex] : null;

  return (
    <div className="h-full flex flex-col bg-jlt-cream animate-fade-in pb-24 md:pb-8">
      {/* Dictionary Popup */}
      {dictPopup && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setDictPopup(null)} />
          <div 
            className="fixed z-50 bg-white border border-brand-200 rounded-2xl shadow-xl p-4 w-72 text-sm transform -translate-y-full -translate-x-1/2 mt-[-12px]"
            style={{ left: dictPopup.x + 20, top: dictPopup.y }}
          >
            {dictPopup.loading ? (
              <div className="flex items-center gap-2 text-brand-500 py-2">
                <div className="animate-spin h-4 w-4 border-2 border-brand-500 rounded-full border-t-transparent"></div>
                Looking up...
              </div>
            ) : dictPopup.data ? (
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-xl text-brand-900 capitalize">{dictPopup.data.word}</h4>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 bg-brand-100 px-2 py-0.5 rounded-full">{dictPopup.data.type}</span>
                </div>
                <p className="text-brand-800 text-base mb-3 border-b border-brand-50 pb-2">{dictPopup.data.definition}</p>
                <div className="bg-brand-50 p-3 rounded-lg text-brand-700 text-sm italic border border-brand-100 flex gap-2">
                  <span className="not-italic">💡</span>
                  "{dictPopup.data.example}"
                </div>
              </div>
            ) : (
              <span className="text-red-400">Not found.</span>
            )}
            
            {/* Arrow */}
            <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-b border-r border-brand-200 rotate-45"></div>
          </div>
        </>
      )}

      {/* Quiz Modal - Highest Z-Index to cover MiniPlayer */}
      {isQuizModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-900/60 backdrop-blur-md p-4 animate-fade-in">
            <div className="bg-white w-full max-w-2xl max-h-[85vh] rounded-3xl shadow-2xl border border-brand-100 flex flex-col overflow-hidden relative">
                {/* Modal Header */}
                <div className="p-6 border-b border-brand-100 flex justify-between items-center bg-brand-50">
                    <h3 className="text-xl font-extrabold text-brand-900 flex items-center gap-2">
                        <span className="bg-jlt-peach text-orange-800 p-1.5 rounded-lg"><HelpCircle size={20}/></span>
                        Quiz Time
                    </h3>
                    <button onClick={() => setIsQuizModalOpen(false)} className="text-brand-400 hover:text-brand-700 p-1 rounded-full hover:bg-brand-200/50 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Modal Content */}
                <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar">
                    {!currentQuiz ? (
                        <div className="text-center py-12">
                            <div className="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-4 text-brand-300">
                                <HelpCircle size={40}/>
                            </div>
                            <h3 className="text-brand-900 font-bold text-lg mb-2">No Quizzes Available</h3>
                            <p className="text-brand-500 mb-6">This track doesn't have any quizzes yet.</p>
                            <button onClick={onEditQuiz} className="text-brand-600 font-bold underline hover:text-brand-800">
                                Create a Quiz
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            <div className="flex justify-between items-center text-xs font-bold text-brand-400 uppercase tracking-widest">
                                <span>Question {activeQuizIndex + 1} of {track.quizzes.length}</span>
                                <span>{Math.round(((activeQuizIndex) / track.quizzes.length) * 100)}% Completed</span>
                            </div>
                            
                            {/* Progress Bar */}
                            <div className="w-full h-2 bg-brand-100 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-brand-500 transition-all duration-500 ease-out"
                                    style={{ width: `${((activeQuizIndex) / track.quizzes.length) * 100}%` }}
                                ></div>
                            </div>

                            <div className="text-center">
                                <h3 className="text-2xl font-bold text-brand-900 leading-snug">{currentQuiz.question}</h3>
                            </div>

                            <div className="space-y-3">
                                {currentQuiz.options.map((opt, idx) => (
                                <button
                                    key={idx}
                                    disabled={quizAnswerStatus !== null}
                                    onClick={() => handleQuizOptionClick(currentQuiz, idx)}
                                    className={`w-full text-left p-5 rounded-2xl border-2 font-bold transition-all flex items-center justify-between group ${
                                        selectedQuizOption === idx 
                                        ? quizAnswerStatus === 'correct' 
                                            ? 'bg-green-50 border-green-500 text-green-800' 
                                            : 'bg-rose-50 border-rose-500 text-rose-800'
                                        : 'bg-white border-brand-100 text-brand-700 hover:border-brand-300 hover:bg-brand-50'
                                    }`}
                                >
                                    <span className="text-lg">{opt}</span>
                                    {selectedQuizOption === idx && (
                                        quizAnswerStatus === 'correct' ? <CheckCircle size={24} className="text-green-600" /> : <XCircle size={24} className="text-rose-500" />
                                    )}
                                    {selectedQuizOption !== idx && <div className="w-6 h-6 rounded-full border-2 border-brand-200 group-hover:border-brand-400" />}
                                </button>
                                ))}
                            </div>

                            {quizAnswerStatus && (
                                <div className="animate-slide-up p-6 bg-brand-50 rounded-2xl border border-brand-200 shadow-sm">
                                <h4 className="font-bold text-brand-900 flex items-center gap-2 mb-2">
                                    <Sparkles size={18} className="text-purple-500"/> Explanation
                                </h4>
                                <p className="text-brand-700 leading-relaxed mb-6">{currentQuiz.explanation}</p>
                                
                                <div className="flex justify-end">
                                    <button 
                                        onClick={handleNextQuiz} 
                                        className="bg-brand-900 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-brand-800 flex items-center gap-2"
                                    >
                                        {activeQuizIndex < track.quizzes.length - 1 ? 'Next Question' : 'Finish Quiz'} <ArrowRight size={18} />
                                    </button>
                                </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}

      {/* Top Navigation (Back Button) */}
      <div className="px-4 py-4 md:px-8 md:py-6 flex-shrink-0 w-full max-w-7xl mx-auto">
        <div className="flex items-center gap-4 justify-between w-full">
            {/* Back button */}
            <button onClick={onBack}
              className="flex items-center gap-2 text-brand-600 hover:text-brand-900 font-bold transition-colors"
            >
              <div className="bg-white p-2 rounded-full shadow-sm border border-brand-100">
                <ChevronDown size={20} />
              </div>
              <span className="text-lg">Hide</span>
            </button>

            {/* Right Buttons */}
            <div className="flex items-center gap-3">
              <button 
                onClick={onEditAudio}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white hover:bg-brand-50 text-brand-600 font-bold text-sm transition-colors border border-brand-200"
              >
                <Pencil size={16} />
                <span>Edit</span>
              </button>

              <button onClick={onEditQuiz}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white hover:bg-purple-50 text-brand-600 hover:text-purple-600 font-bold text-sm transition-colors border border-purple-200"
              >
                <div className="w-5 h-5 text-purple-600 rounded flex items-center justify-center">
                  <PlusCircle size={14} />
                </div>
                <span>Manage Quizzes</span>
              </button>
            </div>
        </div>
      </div>


      {/* Main Content - Split View */}
      <div className="flex-1 flex flex-col md:flex-row px-4 md:px-8 gap-6 overflow-hidden min-h-0 max-w-7xl mx-auto w-full">
         
         {/* LEFT SIDEBAR: Audio Info (Fixed Width on Desktop) */}
         <div className="w-full md:w-80 flex flex-col gap-6 flex-shrink-0">
             {/* Info Card */}
             <div className="bg-white p-6 rounded-3xl border border-brand-200 shadow-sm flex flex-col items-center text-center relative group">
                 <div className="absolute top-4 right-4 flex gap-2">
                    <button 
                      className="p-2 rounded-full transition-colors bg-brand-50 text-brand-300 hover:text-brand-600 hover:bg-brand-100"
                    >
                       <Share2 size={20} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); }}
                      className={`p-2 rounded-full transition-colors ${track.isFavorite ? 'bg-rose-50 text-rose-500' : 'bg-brand-50 text-brand-300 hover:text-brand-500'}`}
                    >
                       <Heart size={20} fill={track.isFavorite ? "currentColor" : "none"} />
                    </button>
                 </div>

                 <div className="w-48 h-48 aspect-square bg-brand-100 rounded-2xl mb-6 flex items-center justify-center text-brand-300 shadow-inner">
                    <span className="text-6xl">💿</span>
                 </div>
                 
                 <h1 className="text-xl md:text-2xl font-extrabold text-brand-900 mb-2 line-clamp-2">{track.title}</h1>
                 <p className="text-brand-500 font-bold text-sm mb-6 bg-brand-50 px-3 py-1 rounded-full inline-block">
                    General English
                 </p>
                 
                 {/* Play Controls */}
                 <div className="flex items-center justify-center gap-4 w-full mb-6">
                    <button 
                      onClick={onPlay}
                      className="w-16 h-16 bg-brand-500 hover:bg-brand-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-brand-500/40 transition-transform hover:scale-105"
                    >
                      {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1"/>}
                    </button>

                    <button 
                        onClick={() => { 
                            onPause(); // Pause audio
                            setActiveQuizIndex(0); 
                            setSelectedQuizOption(null); 
                            setQuizAnswerStatus(null); 
                            setIsQuizModalOpen(true); 
                        }}
                        className="w-16 h-16 bg-jlt-peach hover:bg-orange-200 text-brand-900 rounded-full flex items-center justify-center shadow-lg shadow-orange-200/50 transition-transform hover:scale-105"
                        title="Take Quiz"
                    >
                        <HelpCircle size={32} strokeWidth={2.5} />
                    </button>
                 </div>

                 {/* Stats Row */}
                 <div className="flex justify-center gap-6 text-xs font-bold text-brand-400 border-t border-brand-100 w-full pt-4">
                    <div className="flex flex-col">
                       <span className="text-brand-900 text-lg">{track.playCount}</span>
                       <span>PLAYS</span>
                    </div>
                    <div className="flex flex-col">
                       <span className="text-brand-900 text-lg">{Math.floor(track.duration / 60)}:{String(track.duration % 60).padStart(2, '0')}</span>
                       <span>TIME</span>
                    </div>
                 </div>
             </div>
         </div>

         {/* RIGHT PANEL: Script / Content */}
         <div className="flex-1 bg-white rounded-3xl border border-brand-200 shadow-sm flex flex-col overflow-hidden relative min-h-0">
             
             {/* Header / Toggle */}
             <div className="flex items-center justify-between px-6 py-4 border-b border-brand-100 bg-white z-10 flex-wrap gap-3">
                 <h3 className="text-lg font-extrabold text-brand-900 flex items-center gap-2">
                    {viewMode === 'script' ? <BookOpen size={20} className="text-brand-500"/> : <Film size={20} className="text-brand-500"/>}
                    {viewMode === 'script' ? 'Transcript' : 'Context Overview'}
                 </h3>
                 
                 <div className="flex items-center gap-3">
                    <div className="bg-brand-50 p-1 rounded-xl flex gap-1">
                        <button 
                          onClick={() => setViewMode('script')}
                          className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${viewMode === 'script' ? 'bg-white text-brand-800 shadow-sm' : 'text-brand-400 hover:text-brand-600'}`}
                        >
                           Script
                        </button>
                        <button 
                          onClick={() => setViewMode('overview')}
                          className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${viewMode === 'overview' ? 'bg-white text-brand-800 shadow-sm' : 'text-brand-400 hover:text-brand-600'}`}
                        >
                           Overview
                        </button>
                    </div>
                 </div>
             </div>

             {/* Scrollable Content Area */}
             <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar pb-20">
                 {viewMode === 'script' ? (
                    <div className="max-w-3xl mx-auto animate-fade-in">
                       {renderScript()}
                    </div>
                 ) : (
                    <div className="max-w-2xl mx-auto animate-fade-in py-8 flex flex-col items-center justify-center h-full">
                       {isGeneratingOverview ? (
                           <div className="text-center space-y-4">
                               <div className="animate-spin w-10 h-10 border-4 border-brand-200 border-t-brand-500 rounded-full mx-auto"></div>
                               <p className="text-brand-500 font-bold">AI is setting the scene...</p>
                           </div>
                       ) : (
                           <div className="relative bg-brand-50 p-8 md:p-12 rounded-3xl border border-brand-100 max-w-xl shadow-inner text-center">
                               <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-3 rounded-full shadow-sm border border-brand-100">
                                   <Sparkles size={32} className="text-purple-500" />
                               </div>
                               <p className="text-lg md:text-2xl text-brand-800 leading-relaxed text-justify">
                                   {track.overview || "No overview available."}
                               </p>
                           </div>
                       )}
                    </div>
                 )}
             </div>
         </div>
      </div>
    </div>
  );
};

export default AudioDetail;