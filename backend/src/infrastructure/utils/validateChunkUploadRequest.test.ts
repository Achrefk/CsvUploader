import { validateChunkUploadRequest } from './validateChunkUploadRequest';
import { Request } from 'express';

describe('validateChunkUploadRequest', () => {
  it('should return parsed fields from a valid request', () => {
    const mockRequest = {
      body: {
        chunkIndex: '0',
        totalChunks: '5',
        fileName: 'test.csv',
        uploadId: '12345',
      },
      file: {
        path: 'mock/path',
      },
    } as unknown as Request;

    const result = validateChunkUploadRequest(mockRequest);

    expect(result).toEqual({
      chunkIndex: 0,
      totalChunks: 5,
      fileName: 'test.csv',
      uploadId: '12345',
    });
  });

  it('should throw an error if file is missing', () => {
    const mockRequest = {
      body: {
        chunkIndex: '0',
        totalChunks: '5',
        fileName: 'test.csv',
        uploadId: '12345',
      },
      file: undefined,
    } as unknown as Request;

    expect(() => validateChunkUploadRequest(mockRequest)).toThrow('Invalid chunk upload request.');
  });

  it('should throw an error if chunkIndex is missing', () => {
    const mockRequest = {
      body: {
        totalChunks: '5',
        fileName: 'test.csv',
        uploadId: '12345',
      },
      file: {
        path: 'mock/path',
      },
    } as unknown as Request;

    expect(() => validateChunkUploadRequest(mockRequest)).toThrow('Invalid chunk upload request.');
  });

  it('should throw an error if totalChunks is missing', () => {
    const mockRequest = {
      body: {
        chunkIndex: '0',
        fileName: 'test.csv',
        uploadId: '12345',
      },
      file: {
        path: 'mock/path',
      },
    } as unknown as Request;

    expect(() => validateChunkUploadRequest(mockRequest)).toThrow('Invalid chunk upload request.');
  });

  it('should throw an error if fileName is missing', () => {
    const mockRequest = {
      body: {
        chunkIndex: '0',
        totalChunks: '5',
        uploadId: '12345',
      },
      file: {
        path: 'mock/path',
      },
    } as unknown as Request;

    expect(() => validateChunkUploadRequest(mockRequest)).toThrow('Invalid chunk upload request.');
  });

  it('should throw an error if uploadId is missing', () => {
    const mockRequest = {
      body: {
        chunkIndex: '0',
        totalChunks: '5',
        fileName: 'test.csv',
      },
      file: {
        path: 'mock/path',
      },
    } as unknown as Request;

    expect(() => validateChunkUploadRequest(mockRequest)).toThrow('Invalid chunk upload request.');
  });
});
