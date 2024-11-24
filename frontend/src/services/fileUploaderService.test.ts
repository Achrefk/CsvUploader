import { uploadChunk, downloadZip } from './fileUploaderService';

global.fetch = jest.fn();

describe('fileUploaderService', () => {
  beforeAll(() => {
    global.URL.createObjectURL = jest.fn(() => 'blob:http://localhost/12345');
    global.URL.revokeObjectURL = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('uploadChunk', () => {
    it('should successfully upload a chunk and return response JSON', async () => {
      const mockResponse = { ok: true, json: jest.fn().mockResolvedValue({ success: true }) };
      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      const chunk = new Blob(['chunk data']);
      const chunkIndex = 0;
      const totalChunks = 3;
      const fileName = 'test.csv';
      const uploadId = '12345';

      const result = await uploadChunk(chunk, chunkIndex, totalChunks, fileName, uploadId);

      expect(fetch).toHaveBeenCalledWith('http://localhost:3001/api/upload-chunk', {
        method: 'POST',
        body: expect.any(FormData),
      });

      expect(mockResponse.json).toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });

    it('should throw an error if the upload fails', async () => {
      const mockResponse = { ok: false };
      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      const chunk = new Blob(['chunk data']);
      const chunkIndex = 0;
      const totalChunks = 3;
      const fileName = 'test.csv';
      const uploadId = '12345';

      await expect(uploadChunk(chunk, chunkIndex, totalChunks, fileName, uploadId)).rejects.toThrow(
        'Chunk 0 upload failed.'
      );

      expect(fetch).toHaveBeenCalledWith('http://localhost:3001/api/upload-chunk', {
        method: 'POST',
        body: expect.any(FormData),
      });
    });
  });

  describe('downloadZip', () => {
    it('should successfully download a ZIP file and update progress', async () => {
      const mockResponse = {
        ok: true,
        headers: { get: jest.fn().mockReturnValue('100') }, 
        body: {
          getReader: jest.fn().mockReturnValue({
            read: jest
              .fn()
              .mockResolvedValueOnce({ done: false, value: new Uint8Array(30) }) 
              .mockResolvedValueOnce({ done: false, value: new Uint8Array(30) })
              .mockResolvedValueOnce({ done: false, value: new Uint8Array(40) }) 
              .mockResolvedValueOnce({ done: true, value: null }),
          }),
        },
      };

      (fetch as jest.Mock).mockResolvedValue(mockResponse);
      const mockSetProgress = jest.fn();

      const mockAppendChild = jest.fn();
      const mockRemove = jest.fn();
      document.createElement = jest.fn().mockImplementation(() => ({
        click: jest.fn(),
        remove: mockRemove,
      }));
      document.body.appendChild = mockAppendChild;

      await downloadZip('/path/to/zip.zip', mockSetProgress);

      expect(fetch).toHaveBeenCalledWith('http://localhost:3001/api/download-zip?zipPath=%2Fpath%2Fto%2Fzip.zip');
      expect(mockSetProgress).toHaveBeenCalledWith(30); 
      expect(mockSetProgress).toHaveBeenCalledWith(60);
      expect(mockSetProgress).toHaveBeenCalledWith(100); 
      expect(URL.createObjectURL).toHaveBeenCalledWith(expect.any(Blob));
      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:http://localhost/12345');
      expect(mockAppendChild).toHaveBeenCalled();
      expect(mockRemove).toHaveBeenCalled();
    });

    it('should throw an error if the download fails', async () => {
      const mockResponse = { ok: false };
      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      const mockSetProgress = jest.fn();

      await expect(downloadZip('/path/to/zip.zip', mockSetProgress)).rejects.toThrow('Failed to download ZIP.');

      expect(fetch).toHaveBeenCalledWith('http://localhost:3001/api/download-zip?zipPath=%2Fpath%2Fto%2Fzip.zip');
      expect(mockSetProgress).not.toHaveBeenCalled();
    });
  });
});
