import { Request } from 'express';

export const validateChunkUploadRequest = (req: Request): {
  chunkIndex: number;
  totalChunks: number;
  fileName: string;
  uploadId: string;
} => {
  const { chunkIndex, totalChunks, fileName, uploadId } = req.body;

  if (
    !req.file || 
    chunkIndex === undefined || 
    totalChunks === undefined || 
    !fileName || 
    !uploadId
  ) {
    throw new Error('Invalid chunk upload request.');
  }

  return {
    chunkIndex: parseInt(chunkIndex, 10),
    totalChunks: parseInt(totalChunks, 10),
    fileName,
    uploadId,
  };
};
