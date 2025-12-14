'use client';

import { useState } from 'react';
import { useQuiz } from '@/features/quiz/useQuiz';
import QuizModal from '@/features/quiz/QuizModal';

/**
 * Quick test page for Quiz functionality
 * Access: http://localhost:3000/test-quiz
 */
export default function TestQuizPage() {
  const { triggerQuiz, triggerAllQuizzes } = useQuiz();
  const [randomAudioId, setRandomAudioId] = useState(1);
  const [allAudioId, setAllAudioId] = useState(1);

  const handleRandomQuiz = () => {
    triggerQuiz(randomAudioId);
  };

  const handleAllQuizzes = () => {
    triggerAllQuizzes(allAudioId);
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">🧪 Quiz Test Page</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <p className="text-xs text-gray-400 mt-1">
                Try IDs: 1, 2, 3, 4, 5
              </p>
            </div>

            <button
              onClick={handleRandomQuiz}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
            >
              🎲 Get Random Quiz
            </button>

            <div className="mt-4 p-3 bg-gray-700/50 rounded-lg">
              <p className="text-xs text-gray-400">
                <strong>Behavior:</strong> Opens 1 random quiz → Submit → Close modal
              </p>
            </div>
          </div>

          {/* Panel 2: All Quizzes */}
          <div className="bg-gray-800 rounded-lg p-6 space-y-4">
            <h2 className="text-xl font-bold text-green-400 mb-4">📚 All Quizzes</h2>
            <p className="text-sm text-gray-400 mb-4">
              Go through all quizzes for an audio sequentially. Click "Next" to continue.
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
              <p className="text-xs text-gray-400 mt-1">
                Try IDs: 1, 2, 3, 4, 5
              </p>
            </div>

            <button
              onClick={handleAllQuizzes}
              className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition"
            >
              📚 Start All Quizzes
            </button>

            <div className="mt-4 p-3 bg-gray-700/50 rounded-lg">
              <p className="text-xs text-gray-400">
                <strong>Behavior:</strong> Opens quiz 1/N → Submit → "Next Quiz" → ... → "Finish"
              </p>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6">
          <h3 className="font-semibold text-white mb-3">📖 Instructions</h3>
          <ol className="text-sm text-gray-300 space-y-2 list-decimal list-inside">
            <li>Make sure backend is running with seeded data</li>
            <li>Login first (demo@example.com / password123)</li>
            <li>Enter an audioId (1-5 have quizzes from seed)</li>
            <li>Choose "Random" for a single quiz or "All" to go through all quizzes</li>
            <li>Select answer and submit each quiz</li>
          </ol>
        </div>

        {/* Warning */}
        <div className="mt-4 p-4 bg-yellow-900/20 border border-yellow-700 rounded-lg">
          <h3 className="font-semibold text-yellow-400 mb-2">⚠️ Note:</h3>
          <p className="text-sm text-yellow-200">
            This page requires authentication. If quiz doesn't load, make sure you're logged in.
          </p>
        </div>
      </div>

      {/* Quiz Modal */}
      <QuizModal />
    </div>
  );
}
