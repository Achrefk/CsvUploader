import React from 'react';
import { render, screen } from '@testing-library/react';
import { FileUploader } from './FileUploader';
import '@testing-library/jest-dom';

jest.mock('../hooks/useFileUploader', () => {
  return {
    useFileUploader: jest.fn(),
  };
});

const mockedUseFileUploader = require('../hooks/useFileUploader').useFileUploader;

describe('FileUploader', () => {
  it('renders the component', () => {
    mockedUseFileUploader.mockReturnValue({
      file: null,
      setFile: jest.fn(),
      progress: 0,
      isUploading: false,
      isDownloading: false,
      error: null,
      handleUpload: jest.fn(),
      resetState: jest.fn(),
      clearError: jest.fn(),
    });

    render(<FileUploader />);
    expect(screen.getByTestId('container')).toBeInTheDocument();
    expect(screen.getByTestId('drop-area')).toBeInTheDocument();
    expect(screen.getByTestId('upload-button')).toBeInTheDocument();
  });

  it('disables the upload button while uploading', () => {
    mockedUseFileUploader.mockReturnValue({
      file: null,
      setFile: jest.fn(),
      progress: 0,
      isUploading: true, 
      isDownloading: false,
      error: null,
      handleUpload: jest.fn(),
      resetState: jest.fn(),
      clearError: jest.fn(),
    });

    render(<FileUploader />);
    const uploadButton = screen.getByTestId('upload-button');
    expect(uploadButton).toBeDisabled(); 
  });

  it('disables the upload button while downloading', () => {
    mockedUseFileUploader.mockReturnValue({
      file: null,
      setFile: jest.fn(),
      progress: 0,
      isUploading: false,
      isDownloading: true, 
      error: null,
      handleUpload: jest.fn(),
      resetState: jest.fn(),
      clearError: jest.fn(),
    });

    render(<FileUploader />);
    const uploadButton = screen.getByTestId('upload-button');
    expect(uploadButton).toBeDisabled(); 
  });
});
