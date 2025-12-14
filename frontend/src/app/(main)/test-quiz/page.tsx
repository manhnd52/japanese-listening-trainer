'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuiz } from '@/features/quiz/useQuiz';
import QuizModal from '@/features/quiz/QuizModal';
import { Quiz, QuizOption } from '@/features/quiz/types';
import { getQuizzesByAudio, createQuiz, deleteQuiz } from '@/features/quiz/api';
import { generateQuizFromScript, AIGeneratedQuiz } from '@/features/quiz/geminiService';
import { Trash2, Plus, X, Loader2, Sparkles, CheckCircle, Save, HelpCircle, ArrowLeft, FileText } from 'lucide-react';
import Link from 'next/link';

/**
 * Quiz Test & Management Page
 * Access: http://localhost:3000/test-quiz
 * Access with pre-selected audio: http://localhost:3000/test-quiz?audioId=123
 */
export default function TestQuizPage() {
  const searchParams = useSearchParams();
  const urlAudioId = searchParams.get('audioId');
  
  const { triggerQuiz, triggerAllQuizzes } = useQuiz();
  const [quizTimeAudioId, setQuizTimeAudioId] = useState(1);
  
  // Management state
  const [manageAudioId, setManageAudioId] = useState(1);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [originalQuizzes, setOriginalQuizzes] = useState<Quiz[]>([]);
  const [isLoadingQuizzes, setIsLoadingQuizzes] = useState(false);
  const [isManageMode, setIsManageMode] = useState(false);
  const [showManualQuizForm, setShowManualQuizForm] = useState(false);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Manual Quiz Form State (matching ref code structure)
  const [manualQuestion, setManualQuestion] = useState('');
  const [manualOptions, setManualOptions] = useState(['', '', '', '']);
  const [manualCorrect, setManualCorrect] = useState(0);
  const [manualExplanation, setManualExplanation] = useState('');
  
  // AI Generation State
  const [showScriptInput, setShowScriptInput] = useState(false);
  const [scriptText, setScriptText] = useState('');
  const [aiQuizCount, setAiQuizCount] = useState(3);

  // Auto-load quizzes if audioId is provided in URL
  useEffect(() => {
    if (urlAudioId) {
      const audioIdNum = parseInt(urlAudioId, 10);
      if (!isNaN(audioIdNum)) {
        setQuizTimeAudioId(audioIdNum);
        setManageAudioId(audioIdNum);
        // Auto-enter manage mode and load quizzes
        setIsManageMode(true);
        loadQuizzesForAudio(audioIdNum);
      }
    }
  }, [urlAudioId]);

  const loadQuizzesForAudio = async (audioId: number) => {
    setIsLoadingQuizzes(true);
    try {
      const data = await getQuizzesByAudio(audioId);
      setQuizzes(data);
      setOriginalQuizzes(data);
    } catch (error) {
      console.error('Failed to load quizzes:', error);
      setQuizzes([]);
      setOriginalQuizzes([]);
    } finally {
      setIsLoadingQuizzes(false);
    }
  };

  const handleStartQuizTime = () => {
    triggerAllQuizzes(quizTimeAudioId);
  };

  // Load quizzes for management
  const handleLoadManageQuizzes = async () => {
    setIsManageMode(true);
    await loadQuizzesForAudio(manageAudioId);
  };

  // AI Generate Quiz from Script
  const handleGenerateAIQuiz = async () => {
    if (!scriptText.trim()) {
      alert('Please enter a script/transcript to generate quizzes from.');
      return;
    }
    
    setIsGeneratingQuiz(true);
    try {
      const generatedQuizzes = await generateQuizFromScript(scriptText, aiQuizCount);
      
      if (generatedQuizzes.length === 0) {
        alert('No quizzes were generated. Please try with different text.');
        return;
      }
      
      // Map index to QuizOption enum
      const optionMap: Record<number, QuizOption> = {
        0: QuizOption.A,
        1: QuizOption.B,
        2: QuizOption.C,
        3: QuizOption.D,
      };
      
      // Create each quiz via API
      for (const aiQuiz of generatedQuizzes) {
        try {
          const created = await createQuiz({
            audioId: manageAudioId,
            questionText: aiQuiz.question,
            optionA: aiQuiz.options[0] || '',
            optionB: aiQuiz.options[1] || '',
            optionC: aiQuiz.options[2] || '',
            optionD: aiQuiz.options[3] || '',
            correctOption: optionMap[aiQuiz.correctAnswer] || QuizOption.A,
            explanation: aiQuiz.explanation || 'AI generated quiz.',
          });
          setQuizzes(prev => [...prev, created]);
        } catch (err) {
          console.error('Failed to create AI quiz:', err);
        }
      }
      
      // Clear script input after success
      setScriptText('');
      setShowScriptInput(false);
      alert(`Successfully generated ${generatedQuizzes.length} quizzes!`);
    } catch (error) {
      console.error('AI Quiz generation failed:', error);
      alert('Failed to generate quizzes. Please check your API key and try again.');
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  // Handle option change for manual form
  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...manualOptions];
    newOptions[index] = value;
    setManualOptions(newOptions);
  };

  // Add manual quiz (local only, persists on Save)
  const handleAddManualQuiz = async () => {
    if (!manualQuestion || manualOptions.some(opt => !opt)) {
      alert("Please fill in the question and all options.");
      return;
    }
    
    // Map index to QuizOption enum
    const optionMap: Record<number, QuizOption> = {
      0: QuizOption.A,
      1: QuizOption.B,
      2: QuizOption.C,
      3: QuizOption.D,
    };

    try {
      const created = await createQuiz({
        audioId: manageAudioId,
        questionText: manualQuestion,
        optionA: manualOptions[0],
        optionB: manualOptions[1],
        optionC: manualOptions[2],
        optionD: manualOptions[3],
        correctOption: optionMap[manualCorrect],
        explanation: manualExplanation || 'No explanation provided.',
      });

      setQuizzes(prev => [...prev, created]);
      
      // Reset form
      setManualQuestion('');
      setManualOptions(['', '', '', '']);
      setManualCorrect(0);
      setManualExplanation('');
      setShowManualQuizForm(false);
    } catch (error) {
      console.error('Failed to create quiz:', error);
      alert('Failed to create quiz');
    }
  };

  // Remove quiz (immediate delete via API)
  const handleRemoveQuiz = async (id: number) => {
    try {
      await deleteQuiz(id);
      setQuizzes(prev => prev.filter(q => q.id !== id));
    } catch (error) {
      console.error('Failed to delete quiz:', error);
      alert('Failed to delete quiz');
    }
  };

  // Cancel and go back
  const handleCancel = () => {
    setQuizzes(originalQuizzes);
    setIsManageMode(false);
    setShowManualQuizForm(false);
  };

  // Save changes (currently just closes manage mode since changes are already persisted)
  const handleSaveChanges = () => {
    setOriginalQuizzes(quizzes);
    setIsManageMode(false);
    setShowManualQuizForm(false);
  };

  // Get option text by index for display
  const getOptionText = (quiz: Quiz, index: number): string => {
    const options = [quiz.optionA, quiz.optionB, quiz.optionC, quiz.optionD];
    return options[index] || '';
  };

  // Get correct answer index
  const getCorrectIndex = (quiz: Quiz): number => {
    const map: Record<string, number> = { A: 0, B: 1, C: 2, D: 3 };
    return map[quiz.correctOption] ?? 0;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Top Navigation */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-bold transition-colors">
            <ArrowLeft size={20} strokeWidth={2.5} /> Back to Home
          </Link>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">🧪 Quiz Test Page</h1>
          <div className="w-32"></div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 pb-32">
        {/* Quiz Time Panel */}
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-3xl p-8 border border-orange-200 dark:border-orange-800 shadow-sm mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400 p-3 rounded-xl">
              <HelpCircle size={28}/>
            </span>
            <div>
              <h2 className="text-2xl font-extrabold text-orange-800 dark:text-orange-300">Quiz Time</h2>
              <p className="text-sm text-orange-600/80 dark:text-orange-400/80">
                Test your listening comprehension with interactive quizzes
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-orange-700 dark:text-orange-300 mb-2">
                Audio ID
              </label>
              <input
                type="number"
                value={quizTimeAudioId}
                onChange={(e) => setQuizTimeAudioId(Number(e.target.value))}
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl border border-orange-200 dark:border-orange-700 focus:border-orange-500 focus:outline-none shadow-sm"
                placeholder="Enter audio ID"
              />
            </div>
            <button
              onClick={handleStartQuizTime}
              className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 transform hover:-translate-y-0.5 active:scale-95"
            >
              <HelpCircle size={20} />
              Start Quiz Time
            </button>
          </div>
        </div>

        {/* Quiz Management Section */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          {!isManageMode ? (
            /* Load Management Mode UI */
            <div className="p-8">
              <h2 className="text-xl font-bold text-purple-600 dark:text-purple-400 mb-2">⚙️ Quiz Management</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                View, add, and delete quizzes for an audio.
              </p>
              
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Audio ID
                  </label>
                  <input
                    type="number"
                    value={manageAudioId}
                    onChange={(e) => setManageAudioId(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl border border-gray-200 dark:border-gray-600 focus:border-purple-500 focus:outline-none"
                    placeholder="Enter audio ID"
                  />
                </div>
                <button
                  onClick={handleLoadManageQuizzes}
                  disabled={isLoadingQuizzes}
                  className="px-8 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-bold rounded-xl transition shadow-lg shadow-purple-600/20 flex items-center gap-2"
                >
                  {isLoadingQuizzes && <Loader2 className="animate-spin" size={18} />}
                  Load Manage Quizzes
                </button>
              </div>
            </div>
          ) : (
            /* Full Management UI (ref code style) */
            <div className="p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 flex items-center justify-center text-lg font-bold shadow-inner">Q</div>
                  Quiz Editor
                </h3>
                <span className="text-sm font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 px-4 py-2 rounded-full border border-purple-200 dark:border-purple-800">
                  Audio ID: {manageAudioId}
                </span>
              </div>

              {/* Quiz Actions - AI Generate & Add Manual */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <button 
                  onClick={() => setShowScriptInput(true)}
                  disabled={isGeneratingQuiz}
                  className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-6 px-4 rounded-2xl font-bold flex flex-col items-center justify-center gap-2 transition-all shadow-lg hover:shadow-purple-500/30 transform hover:-translate-y-1"
                >
                  {isGeneratingQuiz ? (
                    <div className="animate-spin w-7 h-7 border-2 border-white border-t-transparent rounded-full"/>
                  ) : (
                    <Sparkles size={28} />
                  )}
                  <span className="text-lg">AI Generate</span>
                </button>
                <button 
                  onClick={() => setShowManualQuizForm(true)}
                  className="bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 py-6 px-4 rounded-2xl font-bold flex flex-col items-center justify-center gap-2 transition-all hover:-translate-y-1"
                >
                  <Plus size={28} />
                  <span className="text-lg">Add Manual</span>
                </button>
              </div>

              {/* AI Script Input Form */}
              {showScriptInput && (
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 p-6 rounded-2xl border border-purple-200 dark:border-purple-800 mb-6 shadow-inner animate-in fade-in duration-200">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold text-purple-900 dark:text-purple-100 flex items-center gap-2">
                      <Sparkles size={18} className="text-purple-500" />
                      AI Quiz Generator
                    </h4>
                    <button 
                      onClick={() => setShowScriptInput(false)} 
                      className="text-purple-400 hover:text-red-500 transition-colors"
                    >
                      <X size={20}/>
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Script/Transcript Input */}
                    <div>
                      <label className="block text-sm font-medium text-purple-700 dark:text-purple-300 mb-2">
                        <FileText size={14} className="inline mr-1" />
                        Script / Transcript
                      </label>
                      <textarea
                        className="w-full p-4 rounded-xl border border-purple-200 dark:border-purple-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-purple-500 outline-none resize-none"
                        placeholder="Paste the audio transcript or script here... The AI will generate quiz questions based on this text."
                        value={scriptText}
                        onChange={(e) => setScriptText(e.target.value)}
                        rows={6}
                      />
                      <p className="text-xs text-purple-500 dark:text-purple-400 mt-1">
                        Tip: Longer and more detailed scripts produce better quizzes.
                      </p>
                    </div>
                    
                    {/* Quiz Count */}
                    <div className="flex items-center gap-4">
                      <label className="text-sm font-medium text-purple-700 dark:text-purple-300">
                        Number of quizzes:
                      </label>
                      <select
                        value={aiQuizCount}
                        onChange={(e) => setAiQuizCount(Number(e.target.value))}
                        className="px-4 py-2 rounded-lg border border-purple-200 dark:border-purple-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-purple-500 outline-none"
                      >
                        <option value={1}>1 quiz</option>
                        <option value={2}>2 quizzes</option>
                        <option value={3}>3 quizzes</option>
                        <option value={5}>5 quizzes</option>
                      </select>
                    </div>
                    
                    {/* Generate Button */}
                    <div className="flex justify-end pt-2">
                      <button 
                        onClick={handleGenerateAIQuiz}
                        disabled={isGeneratingQuiz || !scriptText.trim()}
                        className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-lg flex items-center gap-2"
                      >
                        {isGeneratingQuiz ? (
                          <>
                            <Loader2 className="animate-spin" size={18} />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles size={18} />
                            Generate {aiQuizCount} Quiz{aiQuizCount > 1 ? 'zes' : ''}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Manual Quiz Form */}
              {showManualQuizForm && (
                <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-2xl border border-gray-200 dark:border-gray-600 mb-6 shadow-inner animate-in fade-in duration-200">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold text-gray-900 dark:text-white">New Question</h4>
                    <button 
                      onClick={() => setShowManualQuizForm(false)} 
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X size={20}/>
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Question Input */}
                    <input 
                      className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-purple-500 outline-none" 
                      placeholder="Question..." 
                      value={manualQuestion}
                      onChange={(e) => setManualQuestion(e.target.value)}
                    />
                    
                    {/* Options with Radio */}
                    <div className="space-y-3 pl-2 border-l-2 border-gray-200 dark:border-gray-600">
                      {manualOptions.map((opt, idx) => (
                        <div key={idx} className="flex gap-3 items-center">
                          <div className="relative flex items-center">
                            <input 
                              type="radio" 
                              name="correct" 
                              checked={manualCorrect === idx} 
                              onChange={() => setManualCorrect(idx)}
                              className="w-5 h-5 accent-purple-500 cursor-pointer"
                            />
                          </div>
                          <input 
                            className={`flex-1 p-3 rounded-xl border ${
                              manualCorrect === idx 
                                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' 
                                : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800'
                            } text-gray-900 dark:text-white text-sm outline-none transition-colors`} 
                            placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                            value={opt}
                            onChange={(e) => handleOptionChange(idx, e.target.value)}
                          />
                        </div>
                      ))}
                    </div>
                    
                    {/* Explanation */}
                    <textarea
                      className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-purple-500 outline-none text-sm"
                      placeholder="Explanation (Optional)"
                      value={manualExplanation}
                      onChange={(e) => setManualExplanation(e.target.value)}
                      rows={2}
                    />
                    
                    {/* Add Button */}
                    <div className="flex justify-end pt-2">
                      <button 
                        onClick={handleAddManualQuiz} 
                        className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold px-6 py-2 rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors shadow-md"
                      >
                        Add Question
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Quiz List */}
              <div className="space-y-4 min-h-[200px]">
                {quizzes.length === 0 && !showManualQuizForm ? (
                  <div className="flex flex-col items-center justify-center h-48 text-gray-400 dark:text-gray-500 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50/50 dark:bg-gray-800/30">
                    <HelpCircle size={40} className="mb-2 opacity-50"/>
                    <p className="font-medium">No quizzes added yet.</p>
                    <p className="text-sm">Generate with AI or add manually.</p>
                  </div>
                ) : (
                  quizzes.map((quiz, idx) => (
                    <div 
                      key={quiz.id} 
                      className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm relative group hover:border-purple-300 dark:hover:border-purple-600 transition-all"
                    >
                      {/* Delete Button */}
                      <button 
                        onClick={() => handleRemoveQuiz(quiz.id)}
                        className="absolute top-4 right-4 text-gray-300 dark:text-gray-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-1.5 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={18} />
                      </button>
                      
                      {/* Question */}
                      <div className="font-bold text-gray-900 dark:text-white mb-3 pr-8">
                        <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 px-2 py-0.5 rounded-md text-xs mr-2">
                          Q{idx + 1}
                        </span>
                        {quiz.questionText}
                      </div>
                      
                      {/* Options */}
                      <div className="space-y-1 pl-2">
                        {[0, 1, 2, 3].map((optIdx) => {
                          const isCorrect = getCorrectIndex(quiz) === optIdx;
                          const optionText = getOptionText(quiz, optIdx);
                          return (
                            <div 
                              key={optIdx} 
                              className={`text-sm flex items-center gap-2 ${
                                isCorrect 
                                  ? 'text-green-600 dark:text-green-400 font-bold' 
                                  : 'text-gray-500 dark:text-gray-400'
                              }`}
                            >
                              {isCorrect ? (
                                <CheckCircle size={14} />
                              ) : (
                                <div className="w-3.5"/>
                              )}
                              <span className="font-medium mr-1">{String.fromCharCode(65 + optIdx)}.</span>
                              {optionText}
                            </div>
                          );
                        })}
                      </div>
                      
                      {/* Explanation */}
                      {quiz.explanation && (
                        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                          <p className="text-xs text-gray-400 dark:text-gray-500">
                            <span className="font-medium">Explanation:</span> {quiz.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 mt-6">
          <h3 className="font-bold text-gray-900 dark:text-white mb-3">📖 Instructions</h3>
          <ol className="text-sm text-gray-600 dark:text-gray-300 space-y-2 list-decimal list-inside">
            <li>Make sure backend is running with seeded data</li>
            <li>Login first (demo@example.com / password123)</li>
            <li>Enter an audioId (1-5 have quizzes from seed)</li>
            <li>Click &quot;Start Quiz Time&quot; to begin answering quizzes</li>
            <li>Use &quot;Load Manage Quizzes&quot; to add/edit/delete quizzes</li>
            <li>For AI Generation: Set <code className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-purple-600 dark:text-purple-400">NEXT_PUBLIC_GEMINI_API_KEY</code> in .env</li>
          </ol>
        </div>
      </div>

      {/* Footer Action Bar (only in manage mode) */}
      {isManageMode && (
        <div className="fixed left-0 right-0 bottom-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur border-t border-gray-200 dark:border-gray-700 p-4 z-20">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <div className="text-sm text-gray-500 dark:text-gray-400 font-bold">
              {quizzes.length} Quizzes total
            </div>
            <div className="flex gap-3">
              <button 
                onClick={handleCancel} 
                className="px-6 py-3 rounded-xl font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveChanges}
                disabled={isSaving}
                className="bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900 px-8 py-3 rounded-xl font-bold shadow-lg shadow-gray-900/20 dark:shadow-white/20 flex items-center gap-2 transform active:scale-95 transition-all"
              >
                {isSaving && <Loader2 className="animate-spin" size={18} />}
                <Save size={20} />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quiz Modal */}
      <QuizModal />
    </div>
  );
}
