import { TestQuestion, TestSession } from '../models/test.models';

const STORAGE_KEY_PREFIX = 'test_session_';

export function isAnswerCorrect(question: TestQuestion, selectedOptionIds: string[]): boolean {
  if (question.type === 'single') {
    return areEqualSets(selectedOptionIds.slice(0, 1), question.correctOptionIds.slice(0, 1));
  }

  return areEqualSets(selectedOptionIds, question.correctOptionIds);
}

function areEqualSets(left: string[], right: string[]): boolean {
  if (left.length !== right.length) {
    return false;
  }

  const leftSet = new Set(left);
  const rightSet = new Set(right);

  if (leftSet.size !== rightSet.size) {
    return false;
  }

  for (const item of leftSet) {
    if (!rightSet.has(item)) {
      return false;
    }
  }

  return true;
}

export function isValidSession(value: unknown, testId: string): value is TestSession {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const record = value as Record<string, unknown>;

  if (
    record['testId'] !== testId ||
    typeof record['currentQuestionIndex'] !== 'number' ||
    typeof record['startedAt'] !== 'number' ||
    typeof record['durationMinutes'] !== 'number' ||
    typeof record['questionCount'] !== 'number' ||
    typeof record['submitted'] !== 'boolean'
  ) {
    return false;
  }

  const submittedAt = record['submittedAt'];

  if (!(typeof submittedAt === 'number' || submittedAt === null)) {
    return false;
  }

  const answers = record['answers'];

  if (typeof answers !== 'object' || answers === null) {
    return false;
  }

  for (const selectedOptionIds of Object.values(answers as Record<string, unknown>)) {
    if (
      !Array.isArray(selectedOptionIds) ||
      selectedOptionIds.some((item) => typeof item !== 'string')
    ) {
      return false;
    }
  }

  return true;
}

export function storageKey(testId: string): string {
  return `${STORAGE_KEY_PREFIX}${testId}`;
}
