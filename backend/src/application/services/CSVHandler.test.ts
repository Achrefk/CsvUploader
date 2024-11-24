import fs from 'fs';
import { CSVHandler } from './CSVHandler';

jest.mock('fs');
jest.mock('csv-parser');

describe('CSVHandler', () => {
  const mockInputPath = 'mock_input.csv';
  const mockMaleOutputPath = 'mock_male_output.csv';
  const mockFemaleOutputPath = 'mock_female_output.csv';
  let csvHandler: CSVHandler;

  beforeEach(() => {
    jest.clearAllMocks();
    csvHandler = new CSVHandler();
  });

  it('should split rows by gender into separate files', async () => {
    const mockData = [
      { name: 'John', gender: 'male' },
      { name: 'Jane', gender: 'female' },
      { name: 'Bob', gender: 'male' },
    ];

    const readStream: any= {
      pipe: jest.fn().mockReturnThis(),
      on: jest.fn((event, callback) => {
        if (event === 'data') {
          mockData.forEach((row) => callback(row));
        }
        if (event === 'end') {
          callback();
        }
        return readStream;
      }),
    };
    (fs.createReadStream as jest.Mock).mockReturnValue(readStream);

    const maleWriteStream = { write: jest.fn(), end: jest.fn() };
    const femaleWriteStream = { write: jest.fn(), end: jest.fn() };

    (fs.createWriteStream as jest.Mock).mockImplementation((path) => {
      if (path === mockMaleOutputPath) return maleWriteStream;
      if (path === mockFemaleOutputPath) return femaleWriteStream;
      throw new Error('Unexpected file path');
    });

    await csvHandler.splitCSVByGender(mockInputPath, mockMaleOutputPath, mockFemaleOutputPath);

    expect(maleWriteStream.write).toHaveBeenCalledTimes(2); 
    expect(maleWriteStream.write).toHaveBeenCalledWith('John,male\n');
    expect(maleWriteStream.write).toHaveBeenCalledWith('Bob,male\n');

    expect(femaleWriteStream.write).toHaveBeenCalledTimes(1); 
    expect(femaleWriteStream.write).toHaveBeenCalledWith('Jane,female\n');

    expect(maleWriteStream.end).toHaveBeenCalled();
    expect(femaleWriteStream.end).toHaveBeenCalled();
  });

  it('should handle an empty input file gracefully', async () => {
    const mockData: any[] = []; 

    const readStream: any = {
      pipe: jest.fn().mockReturnThis(),
      on: jest.fn((event, callback) => {
        if (event === 'end') {
          callback();
        }
        return readStream;
      }),
    };
    (fs.createReadStream as jest.Mock).mockReturnValue(readStream);

    const maleWriteStream = { write: jest.fn(), end: jest.fn() };
    const femaleWriteStream = { write: jest.fn(), end: jest.fn() };

    (fs.createWriteStream as jest.Mock).mockImplementation((path) => {
      if (path === mockMaleOutputPath) return maleWriteStream;
      if (path === mockFemaleOutputPath) return femaleWriteStream;
      throw new Error('Unexpected file path');
    });

    await csvHandler.splitCSVByGender(mockInputPath, mockMaleOutputPath, mockFemaleOutputPath);

    expect(maleWriteStream.write).not.toHaveBeenCalled();
    expect(femaleWriteStream.write).not.toHaveBeenCalled();

    expect(maleWriteStream.end).toHaveBeenCalled();
    expect(femaleWriteStream.end).toHaveBeenCalled();
  });

  it('should handle an error during reading', async () => {
    const readStream: any = {
      pipe: jest.fn().mockReturnThis(),
      on: jest.fn((event, callback) => {
        if (event === 'error') {
          callback(new Error('Read error'));
        }
        return readStream;
      }),
    };
    (fs.createReadStream as jest.Mock).mockReturnValue(readStream);

    await expect(
      csvHandler.splitCSVByGender(mockInputPath, mockMaleOutputPath, mockFemaleOutputPath)
    ).rejects.toThrow('Read error');
  });

  it('should handle an error during writing', async () => {
    const mockData = [{ name: 'John', gender: 'male' }];

    const readStream: any = {
      pipe: jest.fn().mockReturnThis(),
      on: jest.fn((event, callback) => {
        if (event === 'data') {
          mockData.forEach((row) => callback(row));
        }
        if (event === 'end') {
          callback();
        }
        return readStream;
      }),
    };
    (fs.createReadStream as jest.Mock).mockReturnValue(readStream);

    const maleWriteStream = { write: jest.fn().mockImplementation(() => { throw new Error('Write error'); }), end: jest.fn() };
    const femaleWriteStream = { write: jest.fn(), end: jest.fn() };

    (fs.createWriteStream as jest.Mock).mockImplementation((path) => {
      if (path === mockMaleOutputPath) return maleWriteStream;
      if (path === mockFemaleOutputPath) return femaleWriteStream;
      throw new Error('Unexpected file path');
    });

    await expect(
      csvHandler.splitCSVByGender(mockInputPath, mockMaleOutputPath, mockFemaleOutputPath)
    ).rejects.toThrow('Write error');
  });
});
