import fs from 'fs';
import { Readable } from 'stream';
import { CSVHandler } from '../../application/services/CSVHandler';

jest.mock('fs');

describe('CSVHandler', () => {
  let mockCreateReadStream: jest.Mock;
  let mockCreateWriteStream: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockCreateReadStream = jest.fn();
    mockCreateWriteStream = jest.fn().mockReturnValue({
      write: jest.fn(),
      end: jest.fn(),
    });

    (fs.createReadStream as jest.Mock) = mockCreateReadStream;
    (fs.createWriteStream as jest.Mock) = mockCreateWriteStream;
  });

  it('should split a CSV file by gender into male and female files', async () => {
    const mockCsvStream = new Readable({
      read() {
        this.push('name,gender\n');
        this.push('John,male\n');
        this.push('Jane,female\n');
        this.push('Mike,male\n');
        this.push(null); 
      },
    });

    mockCreateReadStream.mockReturnValue(mockCsvStream);

    const mockMaleStream = {
      write: jest.fn(),
      end: jest.fn(),
    };
    const mockFemaleStream = {
      write: jest.fn(),
      end: jest.fn(),
    };

    mockCreateWriteStream.mockImplementation((filePath: string) => {
      if (filePath.includes('male')) return mockMaleStream;
      if (filePath.includes('female')) return mockFemaleStream;
      return { write: jest.fn(), end: jest.fn() };
    });

    const csvHandler = new CSVHandler();

    await csvHandler.splitCSVByGender(
      'input.csv',
      'output_male.csv',
      'output_female.csv'
    );

    expect(mockMaleStream.write).toHaveBeenCalledWith('John,male\n');
    expect(mockMaleStream.write).toHaveBeenCalledWith('Mike,male\n');

    expect(mockMaleStream.end).toHaveBeenCalled();
  });
});
