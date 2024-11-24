import { ICSVHandler } from '../../domain/interfaces/ICSVHandler';
import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import { FileProcessorService } from '@application/services/FileProcessorService';

jest.mock('fs');
jest.mock('archiver');

describe('FileProcessorService', () => {
  const mockCsvHandler: ICSVHandler = {
    splitCSVByGender: jest.fn(),
  };

  const mockFilePath = 'mock/input.csv';
  const mockZipOutputPath = 'mock/output.zip';
  const mockMaleFilePath = path.join(path.dirname(mockFilePath), 'male.csv');
  const mockFemaleFilePath = path.join(path.dirname(mockFilePath), 'female.csv');

  let fileProcessor: FileProcessorService;

  beforeEach(() => {
    jest.clearAllMocks();
    fileProcessor = new FileProcessorService(mockCsvHandler);
  });

  it('should process the file and create a ZIP archive', async () => {
    const mockOutputStream = {
      on: jest.fn().mockImplementation((_, callback) => {
        callback();
        return mockOutputStream;
      }),
      end: jest.fn(),
    } as unknown as fs.WriteStream;

    (fs.createWriteStream as jest.Mock).mockReturnValue(mockOutputStream);

    const mockArchiver = {
      pipe: jest.fn(),
      file: jest.fn(),
      finalize: jest.fn().mockResolvedValue(undefined),
    } as unknown as archiver.Archiver;

    (archiver as any).mockReturnValue(mockArchiver);

    await fileProcessor.processAndZip(mockFilePath, mockZipOutputPath);

    expect(mockCsvHandler.splitCSVByGender).toHaveBeenCalledWith(
      mockFilePath,
      mockMaleFilePath,
      mockFemaleFilePath
    );

    expect(archiver).toHaveBeenCalledWith('zip', { zlib: { level: 9 } });
    expect(mockArchiver.pipe).toHaveBeenCalledWith(mockOutputStream);
    expect(mockArchiver.file).toHaveBeenCalledWith(mockMaleFilePath, { name: 'male.csv' });
    expect(mockArchiver.file).toHaveBeenCalledWith(mockFemaleFilePath, { name: 'female.csv' });
    expect(mockArchiver.finalize).toHaveBeenCalled();

    expect(fs.unlinkSync).toHaveBeenCalledWith(mockMaleFilePath);
    expect(fs.unlinkSync).toHaveBeenCalledWith(mockFemaleFilePath);
  });

  it('should handle errors during processing', async () => {
    const error = new Error('Test error');
    (mockCsvHandler.splitCSVByGender as jest.Mock).mockRejectedValue(error);

    await expect(fileProcessor.processAndZip(mockFilePath, mockZipOutputPath)).rejects.toThrow(
      'Test error'
    );

    expect(mockCsvHandler.splitCSVByGender).toHaveBeenCalledWith(
      mockFilePath,
      mockMaleFilePath,
      mockFemaleFilePath
    );
    expect(fs.createWriteStream).not.toHaveBeenCalled();
    expect(archiver).not.toHaveBeenCalled();
    expect(fs.unlinkSync).not.toHaveBeenCalled();
  });
});
