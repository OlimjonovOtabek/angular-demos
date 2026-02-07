import { Todo } from './types';

export const TODO_STORAGE_KEY = 'todos';
export function randomId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function parseTodos(rawValue: string | null): Todo[] {
  if (!rawValue) {
    return [];
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(rawValue);
  } catch {
    return [];
  }

  if (!Array.isArray(parsed)) {
    return [];
  }

  return parsed.flatMap((item) => {
    const normalized = normalizeTodo(item);
    return normalized ? [normalized] : [];
  });
}

export function normalizeTodo(value: unknown): Todo | null {
  if (!isRecord(value)) {
    return null;
  }

  const { id, title, completed, createdAt } = value;

  if (typeof id !== 'string' || typeof title !== 'string' || typeof completed !== 'boolean') {
    return null;
  }

  return {
    id,
    title,
    completed,
    createdAt: typeof createdAt === 'number' ? createdAt : Date.now(),
  };
}
