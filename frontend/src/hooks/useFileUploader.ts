import { useState } from 'react';
import { uploadChunk, downloadZip } from '../services/fileUploaderService';

const CHUNK_SIZE = 1024 * 1024; // 1MB

export const useFileUploader = () => {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetState = () => {
    setFile(null);
    setProgress(0);
    setIsUploading(false);
    setIsDownloading(false);
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file.');
      return;
    }

    setError(null);
    setProgress(0);
    setIsUploading(true);
    const uploadId = Date.now().toString();
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

    try {
      let zipPath = '';

      for (let i = 0; i < totalChunks; i++) {
        const start = i * CHUNK_SIZE;
        const end = Math.min(file.size, start + CHUNK_SIZE);
        const chunk = file.slice(start, end);

        const response = await uploadChunk(chunk, i, totalChunks, file.name, uploadId);

        if (response.error) {
          throw new Error(response.error); 
        }

        setProgress(Math.round(((i + 1) / totalChunks) * 90));

        if (response.zipPath) {
          zipPath = response.zipPath;
        }
      }

      if (!zipPath) {
        throw new Error('ZIP path not provided by the server.');
      }

      setIsDownloading(true);
      await downloadZip(zipPath, setProgress);

      resetState();
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setIsUploading(false);
      setIsDownloading(false);
    }
  };

  const clearError = () => {
    setTimeout(() => setError(null), 5000); 
  };

  return {
    file,
    setFile,
    progress,
    isUploading,
    isDownloading,
    error,
    handleUpload,
    resetState,
    clearError,
  };
};
