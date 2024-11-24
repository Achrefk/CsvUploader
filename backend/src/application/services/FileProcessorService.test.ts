import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import { FileProcessorService } from './FileProcessorService';
import { ICSVHandler } from '../../domain/interfaces/ICSVHandler';

jest.mock('fs');
jest.mock('archiver');

describe('FileProcessorService', () => {
  const mockCSVHandler: ICSVHandler = {
    splitCSVByGender: jest.fn(),
  };
  const fileProcessor = new FileProcessorService(mockCSVHandler);

  const mockFilePath = '/mock/uploads/input.csv';
  const mockOutputZipPath = '/mock/uploads/output.zip';
  const mockMaleFilePath = '/mock/uploads/male.csv';
  const mockFemaleFilePath = '/mock/uploads/female.csv';

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock write stream
    const writeStream = {
      on: jest.fn(),
      end: jest.fn(),
    };
    (fs.createWriteStream as jest.Mock).mockReturnValue(writeStream);
  });

  it('should process the CSV file and create a ZIP archive', async () => {
    // Mock archiver
    const mockArchive = {
      pipe: jest.fn(),
      file: jest.fn(),
      finalize: jest.fn().mockResolvedValue(undefined),
    };
    (archiver as any).mockReturnValue(mockArchive);

    // Mock unlinkSync
    (fs.unlinkSync as jest.Mock).mockImplementation(() => {});

    await fileProcessor.processAndZip(mockFilePath, mockOutputZipPath);

    // Validate CSV splitting
    expect(mockCSVHandler.splitCSVByGender).toHaveBeenCalledWith(
      mockFilePath,
      mockMaleFilePath,
      mockFemaleFilePath
    );

    // Validate archive creation
    expect(archiver).toHaveBeenCalledWith('zip', { zlib: { level: 9 } });
    expect(mockArchive.pipe).toHaveBeenCalled();
    expect(mockArchive.file).toHaveBeenCalledWith(mockMaleFilePath, { name: 'male.csv' });
    expect(mockArchive.file).toHaveBeenCalledWith(mockFemaleFilePath, { name: 'female.csv' });
    expect(mockArchive.finalize).toHaveBeenCalled();

    // Validate cleanup
    expect(fs.unlinkSync).toHaveBeenCalledWith(mockMaleFilePath);
    expect(fs.unlinkSync).toHaveBeenCalledWith(mockFemaleFilePath);
  });

  it('should throw an error if archiver fails to finalize', async () => {
    const mockArchive = {
      pipe: jest.fn(),
      file: jest.fn(),
      finalize: jest.fn().mockRejectedValue(new Error('Archive error')),
    };
    (archiver as any).mockReturnValue(mockArchive);

    await expect(fileProcessor.processAndZip(mockFilePath, mockOutputZipPath)).rejects.toThrow(
      'Archive error'
    );

    // Validate that unlinkSync was not called
    expect(fs.unlinkSync).not.toHaveBeenCalled();
  });

  it('should throw an error if CSV splitting fails', async () => {
    (mockCSVHandler.splitCSVByGender as jest.Mock).mockRejectedValue(
      new Error('CSV splitting error')
    );

    await expect(fileProcessor.processAndZip(mockFilePath, mockOutputZipPath)).rejects.toThrow(
      'CSV splitting error'
    );

    // Validate that archiver was not called
    expect(archiver).not.toHaveBeenCalled();
    expect(fs.unlinkSync).not.toHaveBeenCalled();
  });
});
