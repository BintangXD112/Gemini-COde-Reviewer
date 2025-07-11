
import React, { useRef, useState, ChangeEvent, DragEvent, FocusEvent, Suspense, lazy } from 'react';
import { SUPPORTED_LANGUAGES } from '../constants';

const FaFileCode = lazy(() => import('react-icons/fa').then(mod => ({ default: mod.FaFileCode })));

export interface MultiFileCode {
  filename: string;
  code: string;
  language: string;
}

interface CodeInputProps {
  files: MultiFileCode[];
  setFiles: (files: MultiFileCode[]) => void;
  onReview: () => void;
  isLoading: boolean;
}

export const CodeInput: React.FC<CodeInputProps> = ({ files, setFiles, onReview, isLoading }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList) return;
    await handleFiles(fileList);
    e.target.value = '';
  };

  const handleFiles = async (fileList: FileList) => {
    const allowed = ['.js', '.py', '.ts', '.java'];
    const newFiles: MultiFileCode[] = [];
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
      if (!allowed.includes(ext)) {
        alert('Only .js, .py, .ts, .java files are supported!');
        continue;
      }
      const text = await file.text();
      let language = SUPPORTED_LANGUAGES.find(l => ext.includes(l.value.slice(0, 2)))?.value || 'javascript';
      newFiles.push({ filename: file.name, code: text, language });
    }
    setFiles([...files, ...newFiles]);
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await handleFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(true);
  };
  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleCodeChange = (idx: number, value: string) => {
    setFiles(files.map((f, i) => i === idx ? { ...f, code: value } : f));
  };
  const handleRemove = (idx: number) => {
    setFiles(files.filter((_, i) => i !== idx));
  };
  const handleFocus = (idx: number) => setActiveIdx(idx);
  const handleBlur = (_: FocusEvent<HTMLTextAreaElement>) => setActiveIdx(null);

  return (
    <div
      className={`bg-slate-800 rounded-lg shadow-lg p-1 flex flex-col h-full ring-1 ring-slate-700 transition-all duration-300 ${dragActive ? 'ring-2 ring-cyan-400' : ''}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      tabIndex={0}
      aria-label="Code input area. Drag and drop files or use upload button."
    >
      {/* Upload file */}
      <div className="p-3 border-b border-slate-700 flex items-center gap-3">
        <input
          type="file"
          accept=".js,.py,.ts,.java"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          multiple
        />
        <button
          type="button"
          className="bg-slate-700 hover:bg-cyan-700 text-slate-100 px-4 py-2 rounded-md text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-cyan-400"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
        >
          Upload Files
        </button>
        <span className="text-xs text-slate-400">(js, py, ts, java, multi-file)</span>
      </div>
      <div className={`flex-grow p-1 space-y-6 overflow-y-auto transition-all duration-300 ${dragActive ? 'bg-cyan-900/10 border-2 border-dashed border-cyan-400' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {files.length === 0 && (
          <div className="text-slate-400 text-sm text-center py-8 select-none">
            <div className="flex flex-col items-center justify-center gap-2">
              <span className="text-3xl"><FaFileCode /></span>
              <span>Drag & drop files here or use the upload button.</span>
            </div>
          </div>
        )}
        {files.map((file, idx) => (
          <div key={file.filename + idx} className={`bg-slate-900/60 rounded-lg p-3 border border-slate-700 relative transition-all duration-200 ${activeIdx === idx ? 'ring-2 ring-cyan-400' : ''}`}> 
            <div className="flex items-center justify-between mb-2">
              <span className="flex items-center gap-2 font-mono text-xs text-slate-300">
                <Suspense fallback={<span className="w-4 h-4 inline-block bg-cyan-400 rounded animate-pulse" />}> 
                  <FaFileCode className="text-cyan-400" />
                </Suspense>
                {file.filename}
              </span>
              <button className="text-xs text-red-400 hover:text-red-200 focus:outline-none focus:ring-2 focus:ring-red-400 rounded" onClick={() => handleRemove(idx)} disabled={isLoading} aria-label={`Remove file ${file.filename}`}>Remove</button>
            </div>
            <textarea
              value={file.code}
              onChange={e => handleCodeChange(idx, e.target.value)}
              placeholder="Paste your code here..."
              className="w-full h-40 bg-transparent text-slate-200 p-3 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder-slate-500 border border-slate-700 rounded"
              disabled={isLoading}
              onFocus={() => handleFocus(idx)}
              onBlur={handleBlur}
              aria-label={`Code editor for file ${file.filename}`}
            />
          </div>
        ))}
      </div>
      <div className="p-3 border-t border-slate-700">
        <button
          onClick={onReview}
          disabled={isLoading || files.length === 0}
          className="w-full flex items-center justify-center bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Reviewing All Files...
            </>
          ) : (
            'Review All Files'
          )}
        </button>
      </div>
    </div>
  );
};
