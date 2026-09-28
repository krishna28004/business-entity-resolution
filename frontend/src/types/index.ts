export type PageId =
  | 'overview'
  | 'datasets'
  | 'data-prep'
  | 'candidate-gen'
  | 'candidate-pairs'
  | 'entity-matching'
  | 'results'
  | 'validation'
  | 'submission';

export type DatasetStatus = 'not_uploaded' | 'uploaded' | 'error';
export type PipelineStatus = 'not_run' | 'running' | 'completed';
export type ModelStatus = 'not_connected' | 'connected' | 'evaluating';

export interface DatasetFileSpec {
  id: string;
  name: string;
  path: string;
  source: 'Source 1' | 'Source 2' | 'Source 3' | 'Ground Truth';
  category: 'TRAINING' | 'TEST';
  expectedFormat: 'TSV';
  columns: string[];
  description: string;
  status: DatasetStatus;
}

export interface ValidationRule {
  id: string;
  title: string;
  category: 'Files' | 'Schema' | 'Integrity' | 'Constraints' | 'Format';
  description: string;
  expectedBehavior: string;
  status: 'pending' | 'pass' | 'fail';
}

export interface SubmissionCheckItem {
  id: string;
  label: string;
  fileOrFolder: string;
  required: boolean;
  completed: boolean;
}

export interface PipelineStep {
  stepNumber: string;
  title: string;
  subtitle: string;
  outputArtifact?: string;
  status: 'Not Started' | 'In Progress' | 'Completed';
}
