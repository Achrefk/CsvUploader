
export interface ICSVHandler {
  splitCSVByGender(inputPath: string, maleOutputPath: string, femaleOutputPath: string): Promise<void>;
}
                    