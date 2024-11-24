import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { ChunkService } from '../../application/services/chunkService';
import { FileProcessorService } from '../../application/services/FileProcessorService';
import { CSVHandler } from '../../application/services/CSVHandler';
import { validateChunkUploadRequest } from '../utils/validateChunkUploadRequest';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

const chunkService = new ChunkService('uploads/chunks');
const fileProcessor = new FileProcessorService(new CSVHandler());

router.post('/upload-chunk', upload.single('chunk'), async (req: Request, res: Response) => {
  try {
    const { chunkIndex, totalChunks, fileName, uploadId } = validateChunkUploadRequest(req);

    if (!req.file) {
      throw new Error('No file uploaded.');
    }

    await chunkService.handleChunkUpload(req.file, uploadId, chunkIndex);

    const chunkDir = path.join('uploads/chunks', uploadId);
    const uploadedChunks = fs.readdirSync(chunkDir).length;

    if (uploadedChunks === totalChunks) {
      const mergedFilePath = await chunkService.mergeChunks(uploadId, fileName, totalChunks);
      const zipOutputPath = path.join('uploads', `${Date.now()}_processed.zip`);

      await fileProcessor.processAndZip(mergedFilePath, zipOutputPath);
      chunkService.deleteOriginalFile(mergedFilePath);

      return res.status(200).json({ zipPath: zipOutputPath });
    }

    res.status(200).json({ message: `Chunk ${chunkIndex} uploaded successfully.` });
  } catch (error: any) {
    console.error('Error during chunk upload:', error.message);
    res.status(400).json({ error: error.message || 'Internal server error.' });
  }
});

router.get('/download-zip', (req: Request, res: Response) => {
  const zipPath = req.query.zipPath as string;

  try {
    if (!zipPath || !fs.existsSync(zipPath)) {
      throw new Error('ZIP file not found.');
    }

    res.setHeader('Content-Disposition', `attachment; filename="processed.zip"`);
    res.setHeader('Content-Type', 'application/zip');

    const stream = fs.createReadStream(zipPath);

    stream.pipe(res).on('finish', () => {
      console.log('ZIP file sent successfully.');
      fs.unlinkSync(zipPath); 
    });

    stream.on('error', (err) => {
      console.error('Error while streaming ZIP file:', err.message);
      res.status(500).json({ error: 'Failed to send ZIP file.' });
    });
  } catch (error: any) {
    console.error('Error during file download:', error.message);
    res.status(400).json({ error: error.message || 'Internal server error.' });
  }
});

export default router;
