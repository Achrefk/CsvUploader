
import fs from 'fs';
import csv from 'csv-parser';
import { ICSVHandler } from '../../domain/interfaces/ICSVHandler';

export class CSVHandler implements ICSVHandler {
  async splitCSVByGender(inputPath: string, maleOutputPath: string, femaleOutputPath: string): Promise<void> {
    const maleStream = fs.createWriteStream(maleOutputPath);
    const femaleStream = fs.createWriteStream(femaleOutputPath);

    return new Promise((resolve, reject) => {
      fs.createReadStream(inputPath)
        .pipe(csv())
        .on('data', (row) => {
          const line = `${Object.values(row).join(',')}
`;
          if (row.gender === 'male') {
            maleStream.write(line);
          } else if (row.gender === 'female') {
            femaleStream.write(line);
          }
        })
        .on('end', () => {
          maleStream.end();
          femaleStream.end();
          resolve();
        })
        .on('error', (err) => reject(err));
    });
  }
}
                    