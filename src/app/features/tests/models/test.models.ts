export type QuestionType = 'single' | 'multiple';

export interface TestOption {
  id: string;
  text: string;
}

export interface TestQuestion {
  id: string;
  text: string;
  type: QuestionType;
  options: TestOption[];
  correctOptionIds: string[];
}

export interface Test {
  id: string;
  name: string;
  durationMinutes: number;
  passPercent: number;
  questions: TestQuestion[];
}

export interface TestSummary {
  id: string;
  name: string;
  durationMinutes: number;
  questionCount: number;
  passPercent: number;
}

export interface TestsPayload {
  tests: Test[];
}

export interface TestSession {
  testId: string;
  currentQuestionIndex: number;
  answers: Record<string, string[]>;
  startedAt: number;
  durationMinutes: number;
  questionCount: number;
  submitted: boolean;
  submittedAt: number | null;
}

export interface AnswerSelectionChange {
  optionId: string;
  mode: 'replace' | 'toggle';
}
