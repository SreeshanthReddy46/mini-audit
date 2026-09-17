'use client';

import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Upload, FileText, AlertCircle } from 'lucide-react';

interface UploadDocumentProps {
  onUpload: (file: File) => Promise<void>;
  buttonText?: string;
  isReupload?: boolean;
}

export function UploadDocument({
  onUpload,
  buttonText = 'Upload Document',
  isReupload = false
}: UploadDocumentProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      const ext = selected.name.substring(selected.name.lastIndexOf('.')).toLowerCase();
      if (!['.pdf', '.csv', '.xlsx'].includes(ext)) {
        setError('Only PDF, CSV, and XLSX formats are permitted.');
        return;
      }
      if (selected.size > 10 * 1024 * 1024) {
        setError('File size cannot exceed 10MB.');
        return;
      }
      setFile(selected);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await onUpload(file);
      setFile(null);
    } catch (err: any) {
      setError(err.message || 'Failed to upload document.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="border-2 border-dashed border-slate-300 hover:border-blue-400 transition-colors rounded-xl p-6 text-center bg-slate-50/50">
        <input
          type="file"
          id="audit-file-upload"
          accept=".pdf,.csv,.xlsx"
          onChange={handleFileChange}
          className="hidden"
        />
        <label htmlFor="audit-file-upload" className="cursor-pointer flex flex-col items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mb-2">
            <Upload className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold text-slate-700 hover:text-blue-600">
            {file ? file.name : 'Choose PDF, CSV, or XLSX file'}
          </span>
          <span className="text-[11px] text-slate-400 mt-1">Maximum size 10MB</span>
        </label>

        {file && (
          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-xs font-medium text-blue-800">
            <FileText className="w-4 h-4 text-blue-600" />
            <span>{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
          </div>
        )}
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      <Button
        type="submit"
        variant={isReupload ? 'warning' : 'primary'}
        disabled={!file}
        loading={loading}
        className="w-full"
      >
        {buttonText}
      </Button>
    </form>
  );
}
