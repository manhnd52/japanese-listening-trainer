'use client';

import { useState } from 'react';
import { useQuiz } from '@/features/quiz/useQuiz';
import QuizModal from '@/features/quiz/QuizModal';
import { Quiz, QuizOption } from '@/features/quiz/types';
import { getQuizzesByAudio, createQuiz, deleteQuiz } from '@/features/quiz/api';
import { Trash2, Plus, X, Loader2 } from 'lucide-react';

/**
 * Quick test page for Quiz functionality
 * Access: http://localhost:3000/test-quiz
 */
export default function TestQuizPage() {
  const { triggerQuiz, triggerAllQuizzes } = useQuiz();
  const [randomAudioId, setRandomAudioId] = useState(1);
  const [allAudioId, setAllAudioId] = useState(1);
  
  // Phase 3: Management state
  const [manageAudioId, setManageAudioId] = useState(1);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoadingQuizzes, setIsLoadingQuizzes] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  // Add quiz form state
  const [newQuiz, setNewQuiz] = useState({
    questionText: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctOption: QuizOption.A,
    explanation: '',
  });

  const handleRandomQuiz = () => {
    triggerQuiz(randomAudioId);
  };

  const handleAllQuizzes = () => {
    triggerAllQuizzes(allAudioId);
  };

  // Phase 3: Load quizzes for management
  const handleLoadQuizzes = async () => {
    setIsLoadingQuizzes(true);
    try {
      const data = await getQuizzesByAudio(manageAudioId);
      setQuizzes(data);
    } catch (error) {
      console.error('Failed to load quizzes:', error);
      setQuizzes([]);
    } finally {
      setIsLoadingQuizzes(false);
    }
  };

  // Phase 3: Delete quiz
  const handleDeleteQuiz = async (quizId: number) => {
    setIsDeleting(true);
    try {
      await deleteQuiz(quizId);
      setQuizzes(quizzes.filter(q => q.id !== quizId));
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Failed to delete quiz:', error);
      alert('Failed to delete quiz');
    } finally {
      setIsDeleting(false);
    }
  };

  // Phase 3: Create quiz
  const handleCreateQuiz = async () => {
    if (!newQuiz.questionText || !newQuiz.optionA || !newQuiz.optionB || !newQuiz.optionC || !newQuiz.optionD) {
      alert('Please fill in all required fields');
      return;
    }
    
    setIsCreating(true);
    try {
      const created = await createQuiz({
        audioId: manageAudioId,
        ...newQuiz,
      });
      setQuizzes([created, ...quizzes]);
      setShowAddDialog(false);
      setNewQuiz({
        questionText: '',
        optionA: '',
        optionB: '',
        optionC: '',
        optionD: '',
        correctOption: QuizOption.A,
        explanation: '',
      });
    } catch (error) {
      console.error('Failed to create quiz:', error);
      alert('Failed to create quiz');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">🧪 Quiz Test Page</h1>
        
        {/* Phase 1 & 2 Panels */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Panel 1: Random Quiz */}
          <div className="bg-gray-800 rounded-lg p-6 space-y-4">
            <h2 className="text-xl font-bold text-blue-400 mb-4">🎲 Random Quiz</h2>
            <p className="text-sm text-gray-400 mb-4">
              Get a single random quiz for an audio. Good for quick practice.
            </p>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Audio ID
              </label>
              <input
                type="number"
                value={randomAudioId}
                onChange={(e) => setRandomAudioId(Number(e.target.value))}
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                placeholder="Enter audio ID"
              />
            </div>

            <button
              onClick={handleRandomQuiz}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
            >
              🎲 Get Random Quiz
            </button>
          </div>

          {/* Panel 2: All Quizzes */}
          <div className="bg-gray-800 rounded-lg p-6 space-y-4">
            <h2 className="text-xl font-bold text-green-400 mb-4">📚 All Quizzes</h2>
            <p className="text-sm text-gray-400 mb-4">
              Go through all quizzes for an audio sequentially.
            </p>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Audio ID
              </label>
              <input
                type="number"
                value={allAudioId}
                onChange={(e) => setAllAudioId(Number(e.target.value))}
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-green-500 focus:outline-none"
                placeholder="Enter audio ID"
              />
            </div>

            <button
              onClick={handleAllQuizzes}
              className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition"
            >
              📚 Start All Quizzes
            </button>
          </div>
        </div>

        {/* Phase 3: Quiz Management Panel */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-purple-400 mb-4">⚙️ Quiz Management</h2>
          <p className="text-sm text-gray-400 mb-4">
            View, add, and delete quizzes for an audio.
          </p>
          
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Audio ID
              </label>
              <input
                type="number"
                value={manageAudioId}
                onChange={(e) => setManageAudioId(Number(e.target.value))}
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
                placeholder="Enter audio ID"
              />
            </div>
            <div className="flex items-end gap-2">
              <button
                onClick={handleLoadQuizzes}
                disabled={isLoadingQuizzes}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-semibold rounded-lg transition flex items-center gap-2"
              >
                {isLoadingQuizzes && <Loader2 className="animate-spin" size={16} />}
                Load Quizzes
              </button>
              <button
                onClick={() => setShowAddDialog(true)}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition flex items-center gap-2"
              >
                <Plus size={16} /> Add Quiz
              </button>
            </div>
          </div>

          {/* Quizzes Table */}
          {quizzes.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="py-3 px-4 text-gray-300 font-medium">ID</th>
                    <th className="py-3 px-4 text-gray-300 font-medium">Question</th>
                    <th className="py-3 px-4 text-gray-300 font-medium">Options</th>
                    <th className="py-3 px-4 text-gray-300 font-medium">Answer</th>
                    <th className="py-3 px-4 text-gray-300 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {quizzes.map((quiz) => (
                    <tr key={quiz.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                      <td className="py-3 px-4 text-gray-400">{quiz.id}</td>
                      <td className="py-3 px-4 text-white max-w-xs truncate">{quiz.questionText}</td>
                      <td className="py-3 px-4 text-gray-400 text-sm">
                        <div className="space-y-1">
                          <div>A: {quiz.optionA.substring(0, 20)}...</div>
                          <div>B: {quiz.optionB.substring(0, 20)}...</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-green-600/20 text-green-400 rounded font-bold">
                          {quiz.correctOption}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {deleteConfirm === quiz.id ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleDeleteQuiz(quiz.id)}
                              disabled={isDeleting}
                              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition flex items-center gap-1"
                            >
                              {isDeleting && <Loader2 className="animate-spin" size={12} />}
                              Confirm
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="px-3 py-1 bg-gray-600 hover:bg-gray-500 text-white text-sm rounded transition"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(quiz.id)}
                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-600/20 rounded transition"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              {isLoadingQuizzes ? 'Loading...' : 'No quizzes loaded. Click "Load Quizzes" to view.'}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="font-semibold text-white mb-3">📖 Instructions</h3>
          <ol className="text-sm text-gray-300 space-y-2 list-decimal list-inside">
            <li>Make sure backend is running with seeded data</li>
            <li>Login first (demo@example.com / password123)</li>
            <li>Enter an audioId (1-5 have quizzes from seed)</li>
            <li>Use "Random" or "All" panels to test quiz flows</li>
            <li>Use "Management" panel to view, add, or delete quizzes</li>
          </ol>
        </div>
      </div>

      {/* Quiz Modal */}
      <QuizModal />

      {/* Add Quiz Dialog */}
      {showAddDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white">➕ Add New Quiz</h2>
              <button
                onClick={() => setShowAddDialog(false)}
                className="text-gray-400 hover:text-white transition"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Audio ID: <span className="text-purple-400">{manageAudioId}</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Question Text *
                </label>
                <textarea
                  value={newQuiz.questionText}
                  onChange={(e) => setNewQuiz({ ...newQuiz, questionText: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
                  rows={3}
                  placeholder="Enter your question..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Option A *</label>
                  <input
                    type="text"
                    value={newQuiz.optionA}
                    onChange={(e) => setNewQuiz({ ...newQuiz, optionA: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Option B *</label>
                  <input
                    type="text"
                    value={newQuiz.optionB}
                    onChange={(e) => setNewQuiz({ ...newQuiz, optionB: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Option C *</label>
                  <input
                    type="text"
                    value={newQuiz.optionC}
                    onChange={(e) => setNewQuiz({ ...newQuiz, optionC: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Option D *</label>
                  <input
                    type="text"
                    value={newQuiz.optionD}
                    onChange={(e) => setNewQuiz({ ...newQuiz, optionD: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Correct Answer *</label>
                <div className="flex gap-4">
                  {Object.values(QuizOption).map((opt) => (
                    <label key={opt} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="correctOption"
                        checked={newQuiz.correctOption === opt}
                        onChange={() => setNewQuiz({ ...newQuiz, correctOption: opt })}
                        className="w-4 h-4 text-purple-600"
                      />
                      <span className={`font-bold ${newQuiz.correctOption === opt ? 'text-purple-400' : 'text-gray-400'}`}>
                        {opt}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Explanation (optional)
                </label>
                <textarea
                  value={newQuiz.explanation}
                  onChange={(e) => setNewQuiz({ ...newQuiz, explanation: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
                  rows={2}
                  placeholder="Why is this the correct answer?"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={handleCreateQuiz}
                  disabled={isCreating}
                  className="flex-1 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                >
                  {isCreating && <Loader2 className="animate-spin" size={16} />}
                  Create Quiz
                </button>
                <button
                  onClick={() => setShowAddDialog(false)}
                  className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
