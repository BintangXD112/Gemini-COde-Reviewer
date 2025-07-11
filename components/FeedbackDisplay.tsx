
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-java';
import React, { useEffect } from 'react';
import { FeedbackCategory } from '../types';
import type { FeedbackItem } from '../types';
import { useState } from 'react';

const categoryStyles: Record<FeedbackCategory, { bg: string; text: string; border: string; icon: React.ReactNode }> = {
  [FeedbackCategory.BUG]: {
    bg: 'bg-red-900/50',
    text: 'text-red-300',
    border: 'border-red-700/50',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
  },
  [FeedbackCategory.PERFORMANCE]: {
    bg: 'bg-yellow-900/50',
    text: 'text-yellow-300',
    border: 'border-yellow-700/50',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
  },
  [FeedbackCategory.STYLE]: {
    bg: 'bg-blue-900/50',
    text: 'text-blue-300',
    border: 'border-blue-700/50',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
  },
  [FeedbackCategory.SUGGESTION]: {
    bg: 'bg-purple-900/50',
    text: 'text-purple-300',
    border: 'border-purple-700/50',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 001.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" /><path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" /></svg>
  },
   [FeedbackCategory.SECURITY]: {
    bg: 'bg-orange-900/50',
    text: 'text-orange-300',
    border: 'border-orange-700/50',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
  }
};

const FeedbackCard: React.FC<{ item: FeedbackItem; language?: string }> = ({ item, language }) => {
  const styles = categoryStyles[item.category] || categoryStyles[FeedbackCategory.SUGGESTION];
  const lang = language || 'javascript';
  const highlighted = Prism.highlight(item.suggestion, Prism.languages[lang] || Prism.languages.javascript, lang);
  return (
    <div className={`rounded-xl border-2 ${styles.border} ${styles.bg} overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group`}> 
      <div className={`flex items-center p-3 border-b-2 ${styles.border} ${styles.text} bg-slate-900/80`}> 
        <span className="mr-2">{styles.icon}</span>
        <span className="font-bold uppercase tracking-wider text-xs px-2 py-1 rounded bg-slate-800/80 border border-slate-700 group-hover:bg-cyan-900/40 transition-all duration-200">
          {item.category}
        </span>
        <span className="ml-auto text-xs text-slate-400 font-mono">Line: {item.line > 0 ? item.line : 'N/A'}</span>
      </div>
      <div className="p-4">
        <p className="text-slate-200 mb-3 leading-relaxed">{item.comment}</p>
        <div className="bg-slate-900/80 rounded-md p-3 border border-slate-700">
          <p className="text-xs font-semibold text-green-400 mb-1">Suggestion:</p>
          <pre className="text-sm text-green-200 whitespace-pre-wrap font-mono overflow-x-auto"><code dangerouslySetInnerHTML={{ __html: highlighted }} /></pre>
        </div>
      </div>
    </div>
  );
};

const Loader: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-full">
        <div className="w-16 h-16 border-4 border-cyan-400 border-dashed rounded-full animate-spin border-t-transparent"></div>
        <p className="mt-4 text-slate-400">Analyzing code...</p>
    </div>
);

const Placeholder: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-full text-center p-4 border-2 border-dashed border-slate-700 rounded-lg">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-slate-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m12.728 0l.707-.707M6.343 17.657l-.707.707m12.728 0l.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
        <h3 className="text-xl font-semibold text-slate-300">Ready for Review</h3>
        <p className="text-slate-500 mt-2 max-w-sm">Enter your code on the left, select the language, and click "Review Code" to get AI-powered feedback.</p>
    </div>
);

interface FeedbackDisplayProps {
  feedback: FeedbackItem[];
  isLoading: boolean;
  error: string | null;
}

function feedbackToMarkdown(feedback: FeedbackItem[], filename: string, language?: string) {
  let md = `# Code Review Feedback for ${filename}\n`;
  if (language) md += `**Language:** ${language}\n\n`;
  if (!feedback.length) return md + '\n_No issues found._';
  feedback.forEach((item, i) => {
    md += `\n## Issue ${i + 1}\n`;
    md += `- **Category:** ${item.category}\n`;
    md += `- **Line:** ${item.line > 0 ? item.line : 'N/A'}\n`;
    md += `- **Comment:** ${item.comment}\n`;
    md += `- **Suggestion:**\n\n\t${item.suggestion}\n`;
  });
  return md;
}

function downloadFile(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}

export const FeedbackDisplay: React.FC<FeedbackDisplayProps & { language?: string; filename?: string }> = ({ feedback, isLoading, error, language, filename }) => {
  return (
    <div className="bg-slate-800 rounded-lg shadow-lg flex flex-col h-full ring-1 ring-slate-700 min-h-[500px] lg:min-h-[70vh]">
      <div className="p-4 border-b border-slate-700 flex items-center justify-between gap-2">
        <h2 className="text-lg font-bold text-slate-200">Review Feedback</h2>
        <div className="flex gap-2">
          <button
            className="px-3 py-1 text-xs rounded bg-cyan-700 hover:bg-cyan-600 text-white font-semibold transition"
            onClick={() => downloadFile(
              `${filename || 'feedback'}.md`,
              feedbackToMarkdown(feedback, filename || 'Code', language),
              'text/markdown')}
            disabled={isLoading || !feedback.length}
          >
            Export MD
          </button>
          <button
            className="px-3 py-1 text-xs rounded bg-slate-700 hover:bg-slate-600 text-white font-semibold transition"
            onClick={() => downloadFile(
              `${filename || 'feedback'}.json`,
              JSON.stringify(feedback, null, 2),
              'application/json')}
            disabled={isLoading || !feedback.length}
          >
            Export JSON
          </button>
        </div>
      </div>
      <div className="flex-grow p-4 overflow-y-auto">
        {isLoading && <Loader />}
        {!isLoading && error && (
          <div className="flex items-center justify-center h-full text-center text-yellow-400">
            <p>{error}</p>
          </div>
        )}
        {!isLoading && !error && feedback.length === 0 && <Placeholder />}
        {!isLoading && !error && feedback.length > 0 && (
          <div className="space-y-4">
            {feedback.map((item, index) => (
              <FeedbackCard key={index} item={item} language={language} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export interface ReviewHistoryItem {
  code: string;
  language: string;
  feedback: FeedbackItem[];
  timestamp: number;
}

export const ReviewHistory: React.FC<{
  history: ReviewHistoryItem[];
  onSelect: (item: ReviewHistoryItem) => void;
  onDelete?: (idx: number) => void;
  onClearAll?: () => void;
}> = ({ history, onSelect, onDelete, onClearAll }) => {
  const [open, setOpen] = useState(true);
  if (!history.length) return null;
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <button
          className="text-base font-bold text-slate-300 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          onClick={() => setOpen(o => !o)}
          aria-expanded={open}
        >
          <span>{open ? '▼' : '►'}</span> Review History
        </button>
        {onClearAll && (
          <button
            className="text-xs text-red-400 hover:text-red-200 px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-red-400 border border-red-400 ml-2"
            onClick={() => {
              if (window.confirm('Clear all review history?')) onClearAll();
            }}
            aria-label="Clear all history"
          >
            Clear All
          </button>
        )}
      </div>
      {open && (
        <ul className="space-y-2 transition-all duration-300">
          {history.map((item, idx) => (
            <li key={item.timestamp} className="bg-slate-700/60 rounded-md p-3 flex items-center justify-between group">
              <div>
                <div className="text-xs text-slate-400 mb-1">{new Date(item.timestamp).toLocaleString()} - {item.language}</div>
                <div className="text-xs text-slate-200 truncate max-w-xs">{item.code.slice(0, 60)}{item.code.length > 60 ? '...' : ''}</div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="ml-2 px-3 py-1 bg-cyan-700 hover:bg-cyan-600 text-white text-xs rounded transition focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  onClick={() => onSelect(item)}
                  aria-label="Load review"
                >
                  Load
                </button>
                {onDelete && (
                  <button
                    className="px-2 py-1 text-xs text-red-400 hover:text-red-200 rounded focus:outline-none focus:ring-2 focus:ring-red-400"
                    onClick={() => onDelete(idx)}
                    aria-label="Delete this history"
                  >
                    ✕
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export interface ToastItem {
  id: number;
  message: string;
  type?: 'error' | 'success';
}

export const ToastContainer: React.FC<{
  toasts: ToastItem[];
  onClose: (id: number) => void;
}> = ({ toasts, onClose }) => (
  <div className="fixed top-6 right-2 sm:right-6 z-50 flex flex-col gap-3 items-end w-full max-w-xs sm:max-w-sm pointer-events-none">
    {toasts.map(t => (
      <Toast
        key={t.id}
        message={t.message}
        type={t.type}
        onClose={() => onClose(t.id)}
      />
    ))}
  </div>
);

export const Toast: React.FC<{ message: string; type?: 'error' | 'success'; onClose: () => void }> = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className={`animate-fade-in pointer-events-auto px-6 py-4 rounded-lg shadow-lg text-white font-semibold transition-all duration-300 flex items-center w-full
      ${type === 'error' ? 'bg-red-600' : 'bg-cyan-600'}`}
      role="alert"
    >
      <span className="flex-1">{message}</span>
      <button className="ml-4 text-white/80 hover:text-white text-lg font-bold" onClick={onClose}>&times;</button>
    </div>
  );
};
