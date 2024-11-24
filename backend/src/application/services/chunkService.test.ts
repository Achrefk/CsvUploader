import fs from 'fs';
import { ChunkService } from './chunkService';

jest.mock('fs');

describe('ChunkService', () => {
  const mockChunkStorage = 'mock_chunks';
  let chunkService: ChunkService;

  beforeEach(() => {
    jest.resetAllMocks();
    chunkService = new ChunkService(mockChunkStorage);
  });

  describe('constructor', () => {
    it('should create chunk storage directory if it does not exist', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);
      (fs.mkdirSync as jest.Mock).mockImplementation(() => {});

      new ChunkService(mockChunkStorage);

      expect(fs.existsSync).toHaveBeenCalledWith(mockChunkStorage);
      expect(fs.mkdirSync).toHaveBeenCalledWith(mockChunkStorage, { recursive: true });
    });


  });

  describe('handleChunkUpload', () => {
    it('should save the chunk in the correct directory', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);
      (fs.mkdirSync as jest.Mock).mockImplementation(() => {});
      (fs.renameSync as jest.Mock).mockImplementation(() => {});

      const chunk = {
        path: 'temp_chunk_path',
      } as Express.Multer.File;

      const uploadId = 'test_upload_id';
      const chunkIndex = 0;

      await chunkService.handleChunkUpload(chunk, uploadId, chunkIndex);

      expect(fs.mkdirSync).toHaveBeenCalledWith(`${mockChunkStorage}/${uploadId}`);
      expect(fs.renameSync).toHaveBeenCalledWith(
        chunk.path,
        `${mockChunkStorage}/${uploadId}/chunk_${chunkIndex}`
      );
    });
  });

  describe('mergeChunks', () => {
    it('should merge chunks into a single file and remove chunk files and directory', async () => {
      (fs.readdirSync as jest.Mock).mockReturnValue(['chunk_0', 'chunk_1']);
      (fs.readFileSync as jest.Mock).mockReturnValue(Buffer.from('chunk_data'));
      (fs.createWriteStream as jest.Mock).mockReturnValue({
        write: jest.fn(),
        end: jest.fn(),
      } as unknown as fs.WriteStream);
      (fs.unlinkSync as jest.Mock).mockImplementation(() => {});
      (fs.rmdirSync as jest.Mock).mockImplementation(() => {});

      const uploadId = 'test_upload_id';
      const fileName = 'test_file.txt';
      const totalChunks = 2;

      const result = await chunkService.mergeChunks(uploadId, fileName, totalChunks);

      expect(result).toEqual('uploads/test_file.txt');
      expect(fs.readFileSync).toHaveBeenCalledTimes(totalChunks);
      expect(fs.unlinkSync).toHaveBeenCalledTimes(totalChunks);
      expect(fs.rmdirSync).toHaveBeenCalledWith(`${mockChunkStorage}/${uploadId}`);
    });
  });

  describe('deleteOriginalFile', () => {
    it('should delete the file if it exists', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.unlinkSync as jest.Mock).mockImplementation(() => {});

      const filePath = 'mock_file.txt';
      chunkService.deleteOriginalFile(filePath);

      expect(fs.existsSync).toHaveBeenCalledWith(filePath);
      expect(fs.unlinkSync).toHaveBeenCalledWith(filePath);
    });

    it('should not delete the file if it does not exist', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      const filePath = 'mock_file.txt';
      chunkService.deleteOriginalFile(filePath);

      expect(fs.existsSync).toHaveBeenCalledWith(filePath);
      expect(fs.unlinkSync).not.toHaveBeenCalled();
    });
  });
});
