import { renderHook, act } from '@testing-library/react';
import { useFileUploader } from './useFileUploader';
import { uploadChunk, downloadZip } from '../services/fileUploaderService';

jest.mock('../services/fileUploaderService', () => ({
  uploadChunk: jest.fn(),
  downloadZip: jest.fn(),
}));

describe('useFileUploader hook', () => {
  const mockUploadChunk = uploadChunk as jest.Mock;
  const mockDownloadZip = downloadZip as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should upload chunks and update progress', async () => {
    const { result } = renderHook(() => useFileUploader());
    const file = new File(['a'.repeat(3 * 1024 * 1024)], 'test.csv', { type: 'text/csv' });
    const zipPath = '/path/to/zip.zip';

    mockUploadChunk.mockResolvedValue({ zipPath });
    mockDownloadZip.mockResolvedValue({});

    act(() => {
      result.current.setFile(file);
    });

    await act(async () => {
      await result.current.handleUpload();
    });

    expect(mockUploadChunk).toHaveBeenCalledTimes(3); 
    expect(mockUploadChunk).toHaveBeenCalledWith(expect.any(Blob), 0, 3, 'test.csv', expect.any(String));
    expect(mockDownloadZip).toHaveBeenCalledWith(zipPath, expect.any(Function));
    expect(result.current.isUploading).toBe(false);
    expect(result.current.isDownloading).toBe(false);
    expect(result.current.file).toBeNull();
    expect(result.current.error).toBeNull();
  });
});
