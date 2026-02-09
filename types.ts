
export interface ReportAnalysis {
  summary: string;
  keyFindings: string[];
  notableValues: NotableValue[];
  questionsForDoctor: string[];
}

export interface NotableValue {
  testName: string;
  value: string;
  referenceRange: string;
  category: 'within' | 'borderline' | 'outside';
  explanation: string;
}

export interface ProcessingState {
  isAnalyzing: boolean;
  isGeneratingAudio: boolean;
  error: string | null;
}

export interface UploadedFile {
  id: string;
  file: File;
  preview: string;
}
