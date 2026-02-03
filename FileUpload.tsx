
import React, { useState, useRef } from 'react';
import { formatSize } from '../utils/fileHelpers';

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSizeMB?: number;
}

export const FileUpload: React.FC<FileUploadProps> = ({ 
  onFilesSelected, 
  accept = ".pdf,.jpg,.png,.txt", 
  multiple = true,
  maxSizeMB = 10 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const fileArray = Array.from(files);
    
    // Validation
    const invalidFiles = fileArray.filter(f => f.size > maxSizeMB * 1024 * 1024);
    if (invalidFiles.length > 0) {
      setError(`Some files are too large. Maximum size is ${maxSizeMB}MB.`);
      return;
    }

    setError(null);
    onFilesSelected(fileArray);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => setIsDragging(false);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="w-full">
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`group relative flex flex-col items-center gap-6 rounded-3xl border-2 border-dashed transition-all duration-300 p-12 cursor-pointer 
          ${isDragging 
            ? 'border-primary bg-primary/10' 
            : 'border-white/10 bg-surface-dark/50 hover:bg-surface-hover hover:border-primary/50'}`}
      >
        <div className={`size-16 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${isDragging ? 'bg-primary text-white' : 'bg-primary/10 text-primary'}`}>
          <span className="material-symbols-outlined text-3xl">cloud_upload</span>
        </div>
        <div className="text-center">
          <p className="text-xl font-bold mb-1">Drop files here</p>
          <p className="text-sm text-slate-500">or click to browse from computer</p>
          <p className="text-[10px] text-slate-600 mt-2 uppercase tracking-widest font-bold">
            Max {maxSizeMB}MB • {accept.replace(/\./g, ' ')}
          </p>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept={accept}
          multiple={multiple}
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>
      {error && (
        <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <span className="material-symbols-outlined text-sm">error</span>
          {error}
        </div>
      )}
    </div>
  );
};
