import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of, shareReplay } from 'rxjs';
import { Test, TestSummary, TestsPayload } from '../models/test.models';

const TESTS_ENDPOINT = 'mock/tests.json';

@Injectable({ providedIn: 'root' })
export class TestApiService {
  private readonly http = inject(HttpClient);

  private readonly tests$ = this.http.get<TestsPayload>(TESTS_ENDPOINT).pipe(
    map((payload) => payload.tests),
    catchError(() => of([] as Test[])),
    shareReplay({ bufferSize: 1, refCount: false }),
  );

  getTests(): Observable<TestSummary[]> {
    return this.tests$.pipe(
      map((tests) =>
        tests.map((test) => ({
          id: test.id,
          name: test.name,
          durationMinutes: test.durationMinutes,
          questionCount: test.questions.length,
          passPercent: test.passPercent,
        })),
      ),
    );
  }

  getTestById(testId: string): Observable<Test | null> {
    return this.tests$.pipe(map((tests) => tests.find((test) => test.id === testId) ?? null));
  }
}
