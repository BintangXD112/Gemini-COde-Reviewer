
import React, { useState, useCallback } from 'react';
import { CodeInput, MultiFileCode } from './components/CodeInput';
import { FeedbackDisplay, ToastContainer, ToastItem, ReviewHistory, ReviewHistoryItem } from './components/FeedbackDisplay';
import { Header } from './components/Header';
import { reviewCode } from './services/geminiService';
import type { FeedbackItem } from './types';
import { SUPPORTED_LANGUAGES } from './constants';

function App() {
  const [files, setFiles] = useState<MultiFileCode[]>([]);
  const [feedbacks, setFeedbacks] = useState<{ filename: string; feedback: FeedbackItem[]; language: string }[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [history, setHistory] = useState<ReviewHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('review_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Simpan history ke localStorage setiap kali berubah
  React.useEffect(() => {
    localStorage.setItem('review_history', JSON.stringify(history));
  }, [history]);

  // Helper untuk push notifikasi
  const pushToast = (message: string, type: 'error' | 'success' = 'success') => {
    setToasts(prev => [...prev, { id: Date.now() + Math.random(), message, type }]);
  };
  const handleCloseToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleReview = useCallback(async () => {
    if (!files.length || files.every(f => !f.code.trim())) {
      pushToast("Please upload or enter code in at least one file.", 'error');
      return;
    }
    setIsLoading(true);
    setError(null);
    setFeedbacks([]);

    try {
      const results = await Promise.all(
        files.map(async (file) => {
          const feedback = await reviewCode(file.code, file.language);
          return { filename: file.filename, feedback, language: file.language };
        })
      );
      setFeedbacks(results);
      // Simpan ke history
      setHistory(prev => [
        { code: JSON.stringify(files), language: 'multi', feedback: results, timestamp: Date.now() },
        ...prev.slice(0, 19)
      ]);
      if (results.every(r => r.feedback.length === 0)) {
        pushToast("No issues found in any file. Great job!", 'success');
      }
    } catch (err) {
      console.error(err);
      pushToast(err instanceof Error ? err.message : 'An unknown error occurred.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [files]);

  // Fungsi untuk memilih/memuat ulang review dari history
  const handleSelectHistory = (item: ReviewHistoryItem) => {
    try {
      const parsedFiles = JSON.parse(item.code);
      setFiles(parsedFiles);
      setFeedbacks(item.feedback);
      setError(null);
    } catch {
      setError('Failed to load history.');
    }
  };
  
  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    const selectedLang = SUPPORTED_LANGUAGES.find(l => l.value === newLanguage);
    if(selectedLang) {
      setCode(selectedLang.placeholder);
      setFeedback([]);
      setError(null);
    }
  };

  // Handler hapus satu history
  const handleDeleteHistory = (idx: number) => {
    setHistory(prev => {
      const newHist = prev.filter((_, i) => i !== idx);
      pushToast('History deleted.', 'success');
      return newHist;
    });
  };
  // Handler hapus semua history
  const handleClearAllHistory = () => {
    setHistory([]);
    pushToast('All history cleared.', 'success');
  };


  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      <Header />
      <ToastContainer toasts={toasts} onClose={handleCloseToast} />
      <main className="flex-grow container mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-4 grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 items-start transition-all duration-300">
        <div className="h-full flex flex-col">
          <ReviewHistory
            history={history}
            onSelect={handleSelectHistory}
            onDelete={handleDeleteHistory}
            onClearAll={handleClearAllHistory}
          />
          <CodeInput
            files={files}
            setFiles={setFiles}
            onReview={handleReview}
            isLoading={isLoading}
          />
        </div>
        <div className="h-full flex flex-col space-y-6 overflow-y-auto transition-all duration-300">
          {feedbacks.length === 0 && (
            <div className="text-slate-400 text-sm text-center py-8">No review results yet.</div>
          )}
          {feedbacks.map((fb, idx) => (
            <div key={fb.filename + idx} className="mb-6 animate-fade-in">
              <div className="font-mono text-xs text-slate-300 mb-2">{fb.filename} ({fb.language})</div>
              <FeedbackDisplay
                feedback={fb.feedback}
                isLoading={isLoading}
                error={error}
                language={fb.language}
              />
            </div>
          ))}
        </div>
      </main>
      <footer className="w-full py-4 text-center text-xs text-slate-500 border-t border-slate-800 bg-slate-900/80 mt-4">
        &copy; {new Date().getFullYear()} Gemini Code Reviewer. Powered by Gemini AI.
      </footer>
    </div>
  );
}

export default App;
