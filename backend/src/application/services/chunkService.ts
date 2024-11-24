import fs from 'fs';
import path from 'path';

export class ChunkService {
  private readonly chunkStorage: string;

  constructor(chunkStorage: string) {
    this.chunkStorage = chunkStorage;

    if (!fs.existsSync(this.chunkStorage)) {
      fs.mkdirSync(this.chunkStorage, { recursive: true });
    }
  }

  async handleChunkUpload(chunk: Express.Multer.File, uploadId: string, chunkIndex: number): Promise<void> {
    const chunkDir = path.join(this.chunkStorage, uploadId);

    if (!fs.existsSync(chunkDir)) {
      fs.mkdirSync(chunkDir);
    }

    const chunkPath = path.join(chunkDir, `chunk_${chunkIndex}`);
    fs.renameSync(chunk.path, chunkPath);
  }

  async mergeChunks(uploadId: string, fileName: string, totalChunks: number): Promise<string> {
    const chunkDir = path.join(this.chunkStorage, uploadId);
    const outputFilePath = path.join('uploads', fileName);

    const writeStream = fs.createWriteStream(outputFilePath);

    for (let i = 0; i < totalChunks; i++) {
      const chunkPath = path.join(chunkDir, `chunk_${i}`);
      const data = fs.readFileSync(chunkPath);
      writeStream.write(data);
      fs.unlinkSync(chunkPath);
    }

    writeStream.end();
    fs.rmdirSync(chunkDir);

    return outputFilePath;
  } 
  deleteOriginalFile(filePath: string): void {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
}
