import React, { useEffect, useRef } from 'react';
import { useFileUploader } from '../hooks/useFileUploader';
import {
  Container,
  DropArea,
  Button,
  ErrorMessage,
  FileName,
} from '../styles/FileUploaderStyles';
import ProgressBar from './ProgressBar';

export const FileUploader: React.FC = () => {
  const {
    file,
    setFile,
    progress,
    isUploading,
    isDownloading,
    error,
    handleUpload,
    resetState,
    clearError,
  } = useFileUploader();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleClick = () => fileInputRef.current?.click();

  const handleUploadClick = async () => {
    try {
      await handleUpload();
      resetState();
    } catch (err) {
      console.error('Error during upload/download:', err);
    }
  };

  useEffect(() => {
    if (error) clearError();
  }, [error, clearError]);

  return (
    <Container data-testid="container">
      <h1>CSV File Uploader</h1>
      <DropArea
        data-testid="drop-area"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        {file ? (
          <FileName data-testid="file-name">File selected: {file.name}</FileName>
        ) : (
          <p>Drag and drop a CSV file here, or click to select</p>
        )}
        <input
          type="file"
          data-testid="file-input"
          ref={fileInputRef}
          accept=".csv"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
      </DropArea>

      <Button
        data-testid="upload-button"
        disabled={isUploading || isDownloading}
        onClick={handleUploadClick}
      >
        {isUploading
          ? 'Uploading...'
          : isDownloading
          ? 'Downloading...'
          : 'Upload'}
      </Button>

      <ProgressBar data-testid="progress-bar" progress={progress} />
      {error && <ErrorMessage data-testid="error-message">{error}</ErrorMessage>}
    </Container>
  );
};
