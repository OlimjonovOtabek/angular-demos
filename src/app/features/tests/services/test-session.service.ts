import { Injectable, effect, signal } from '@angular/core';
import { Test, TestSession } from '../models/test.models';
import { isValidSession, storageKey } from '../utils/test-scoring.util';

const PERSIST_THROTTLE_MS = 400;
const TIMER_TICK_MS = 1000;

@Injectable({ providedIn: 'root' })
export class TestSessionService {
  readonly session = signal<TestSession | null>(null);
  readonly remainingSeconds = signal(0);

  private persistTimeoutId: number | null = null;
  private timerIntervalId: number | null = null;

  constructor() {
    effect(() => {
      const session = this.session();

      if (!session) {
        this.stopTimer();
        this.clearPersistTimeout();
        return;
      }

      if (session.submitted) {
        this.stopTimer();
      } else {
        this.startTimer();
      }

      this.schedulePersist(session);
    });
  }

  startSession(test: Test): void {
    const nextSession: TestSession = {
      testId: test.id,
      currentQuestionIndex: 0,
      answers: {},
      startedAt: Date.now(),
      durationMinutes: test.durationMinutes,
      questionCount: test.questions.length,
      submitted: false,
      submittedAt: null,
    };

    this.session.set(nextSession);
    this.refreshRemainingSeconds();
    this.setToStorage(nextSession);
  }

  restoreSession(testId: string): TestSession | null {
    const rawSession = this.readSessionStorage(testId);

    if (!rawSession) {
      this.session.set(null);
      this.remainingSeconds.set(0);
      return null;
    }

    this.session.set(rawSession);
    this.refreshRemainingSeconds();

    if (this.remainingSeconds() === 0 && !rawSession.submitted) {
      this.submit();
    }

    return this.session();
  }

  selectAnswer(questionId: string, optionId: string, mode: 'replace' | 'toggle'): void {
    const currentSession = this.session();

    if (!currentSession || currentSession.submitted) {
      return;
    }

    const previousSelections = currentSession.answers[questionId] ?? [];
    const nextSelections =
      mode === 'replace'
        ? [optionId]
        : previousSelections.includes(optionId)
          ? previousSelections.filter((id) => id !== optionId)
          : [...previousSelections, optionId];

    const nextAnswers: Record<string, string[]> = {
      ...currentSession.answers,
    };

    if (nextSelections.length === 0) {
      delete nextAnswers[questionId];
    } else {
      nextAnswers[questionId] = nextSelections;
    }

    this.session.set({
      ...currentSession,
      answers: nextAnswers,
    });
  }

  goToQuestion(index: number): void {
    const currentSession = this.session();

    if (!currentSession) {
      return;
    }

    const maxIndex = Math.max(0, currentSession.questionCount - 1);
    const clampedIndex = Math.min(maxIndex, Math.max(0, Math.floor(index)));

    this.session.set({
      ...currentSession,
      currentQuestionIndex: clampedIndex,
    });
  }

  next(): void {
    const currentSession = this.session();

    if (!currentSession) {
      return;
    }

    this.goToQuestion(currentSession.currentQuestionIndex + 1);
  }

  prev(): void {
    const currentSession = this.session();

    if (!currentSession) {
      return;
    }

    this.goToQuestion(currentSession.currentQuestionIndex - 1);
  }

  submit(): void {
    const currentSession = this.session();

    if (!currentSession || currentSession.submitted) {
      return;
    }

    const submittedSession: TestSession = {
      ...currentSession,
      submitted: true,
      submittedAt: Date.now(),
    };

    this.session.set(submittedSession);
    this.stopTimer();
    this.setToStorage(submittedSession);
  }

  clearSession(testId: string): void {
    try {
      localStorage.removeItem(storageKey(testId));
    } catch {
      console.error('Error localestorage da removeItem');
    }

    const currentSession = this.session();

    if (currentSession?.testId === testId) {
      this.session.set(null);
      this.remainingSeconds.set(0);
      this.stopTimer();
      this.clearPersistTimeout();
    }
  }

  private readSessionStorage(testId: string): TestSession | null {
    try {
      const rawValue = localStorage.getItem(storageKey(testId));

      if (!rawValue) {
        return null;
      }

      const parsed: unknown = JSON.parse(rawValue);

      if (!isValidSession(parsed, testId)) {
        this.clearSession(testId);
        return null;
      }

      return parsed;
    } catch {
      return null;
    }
  }

  private refreshRemainingSeconds(): void {
    const currentSession = this.session();

    if (!currentSession) {
      this.remainingSeconds.set(0);
      return;
    }

    const totalSeconds = currentSession.durationMinutes * 60;
    const elapsedSeconds = Math.floor((Date.now() - currentSession.startedAt) / 1000);
    const nextRemaining = Math.max(0, totalSeconds - elapsedSeconds);

    this.remainingSeconds.set(nextRemaining);
  }

  private startTimer(): void {
    this.refreshRemainingSeconds();

    if (this.timerIntervalId !== null) {
      return;
    }

    this.timerIntervalId = setInterval(() => {
      this.refreshRemainingSeconds();
      const currentSession = this.session();

      if (!currentSession || currentSession.submitted) {
        this.stopTimer();
        return;
      }

      if (this.remainingSeconds() === 0) {
        this.submit();
      }
    }, TIMER_TICK_MS);
  }

  private stopTimer(): void {
    if (this.timerIntervalId !== null) {
      clearInterval(this.timerIntervalId);
      this.timerIntervalId = null;
    }
  }

  private schedulePersist(session: TestSession): void {
    this.clearPersistTimeout();
    this.persistTimeoutId = setTimeout(() => {
      this.setToStorage(session);
      this.persistTimeoutId = null;
    }, PERSIST_THROTTLE_MS);
  }

  private clearPersistTimeout(): void {
    if (this.persistTimeoutId !== null) {
      clearTimeout(this.persistTimeoutId);
      this.persistTimeoutId = null;
    }
  }

  private setToStorage(session: TestSession): void {
    try {
      localStorage.setItem(storageKey(session.testId), JSON.stringify(session));
    } catch (err) {
      if (err instanceof Error)
        console.error('LocalStorage set da xatolik yuz berdi !', err.message);
      else console.log('Xatolik: 11', err);
    }
  }
}
