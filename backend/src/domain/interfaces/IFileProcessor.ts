
export interface IFileProcessor {
  processAndZip(filePath: string, outputZipPath: string): Promise<void>;
}
                    