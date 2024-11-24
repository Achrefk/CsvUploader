import { IFileProcessor } from '../../domain/interfaces/IFileProcessor';
import { ICSVHandler } from '../../domain/interfaces/ICSVHandler';
import fs from 'fs';
import path from 'path';
import archiver from 'archiver';

export class FileProcessorService implements IFileProcessor {
  constructor(private csvHandler: ICSVHandler) {}

  async processAndZip(filePath: string, outputZipPath: string): Promise<void> {
    const maleFilePath = path.join(path.dirname(filePath), 'male.csv');
    const femaleFilePath = path.join(path.dirname(filePath), 'female.csv');
    await this.csvHandler.splitCSVByGender(filePath, maleFilePath, femaleFilePath);
    const output = fs.createWriteStream(outputZipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    archive.pipe(output);
    archive.file(maleFilePath, { name: 'male.csv' });
    archive.file(femaleFilePath, { name: 'female.csv' });

    await archive.finalize();

    fs.unlinkSync(maleFilePath);
    fs.unlinkSync(femaleFilePath);
  }
}
