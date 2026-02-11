import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { take } from 'rxjs';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { Test, TestQuestion } from '../../models/test.models';
import { TestApiService } from '../../services/test-api.service';
import { TestSessionService } from '../../services/test-session.service';
import { isAnswerCorrect } from '../../utils/test-scoring.util';

type AnalysisStatus = 'correct' | 'incorrect' | 'unanswered';

interface QuestionAnalysis {
  questionId: string;
  questionText: string;
  status: AnalysisStatus;
  selectedAnswersText: string[];
  correctAnswersText: string[];
}

@Component({
  selector: 'app-test-result-page',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  template: `
    <section class="mx-auto w-full max-w-5xl space-y-4">
      @if (!test()) {
        <p class="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
          Loading result...
        </p>
      } @else {
        <header class="space-y-1">
          <h2 class="text-2xl font-semibold text-foreground">{{ test()!.name }} Results</h2>
          <p class="text-sm text-muted-foreground">
            Score: {{ percentage() }}% ·
            <span [class.text-primary]="passed()" [class.text-destructive]="!passed()">
              {{ passed() ? 'Passed' : 'Failed' }}
            </span>
          </p>
        </header>

        <section class="grid gap-3 rounded-lg border border-border bg-card p-4 sm:grid-cols-4">
          <div>
            <p class="text-xs text-muted-foreground">Correct</p>
            <p class="text-lg font-semibold text-primary">{{ correctCount() }}</p>
          </div>
          <div>
            <p class="text-xs text-muted-foreground">Incorrect</p>
            <p class="text-lg font-semibold text-destructive">{{ incorrectCount() }}</p>
          </div>
          <div>
            <p class="text-xs text-muted-foreground">Unanswered</p>
            <p class="text-lg font-semibold text-muted-foreground">{{ unansweredCount() }}</p>
          </div>
          <div>
            <p class="text-xs text-muted-foreground">Total</p>
            <p class="text-lg font-semibold text-foreground">{{ totalQuestions() }}</p>
          </div>
        </section>

        <section class="space-y-3">
          <h3 class="text-lg font-semibold text-foreground">Question Analysis</h3>

          @for (item of analysis(); track item.questionId; let index = $index) {
            <article class="space-y-2 rounded-lg border border-border bg-card p-4">
              <p class="font-medium text-card-foreground">{{ index + 1 }}. {{ item.questionText }}</p>

              <p
                class="text-sm font-medium"
                [class.text-primary]="item.status === 'correct'"
                [class.text-destructive]="item.status === 'incorrect'"
                [class.text-muted-foreground]="item.status === 'unanswered'"
              >
                {{ formatStatus(item.status) }}
              </p>

              <p class="text-sm text-foreground">
                Your answer:
                @if (item.selectedAnswersText.length) {
                  {{ item.selectedAnswersText.join(', ') }}
                } @else {
                  <span class="text-muted-foreground">Unanswered</span>
                }
              </p>

              <p class="text-sm text-foreground">
                Correct answer: {{ item.correctAnswersText.join(', ') }}
              </p>
            </article>
          }
        </section>

        <div class="flex flex-wrap gap-2">
          <app-button variant="primary" (click)="restartTest()">Restart Test</app-button>
          <app-button variant="outline" (click)="goToTestsList()">Back To Tests</app-button>
        </div>
      }
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestResultPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly testApiService = inject(TestApiService);
  private readonly testSessionService = inject(TestSessionService);

  readonly test = signal<Test | null>(null);

  readonly analysis = computed<QuestionAnalysis[]>(() => {
    const test = this.test();
    const session = this.testSessionService.session();

    if (!test || !session || session.testId !== test.id) {
      return [];
    }

    return test.questions.map((question) => {
      const selectedOptionIds = session.answers[question.id] ?? [];
      const selectedAnswersText = mapOptionIdsToText(question, selectedOptionIds);
      const correctAnswersText = mapOptionIdsToText(question, question.correctOptionIds);
      const status = resolveStatus(question, selectedOptionIds);

      return {
        questionId: question.id,
        questionText: question.text,
        status,
        selectedAnswersText,
        correctAnswersText,
      };
    });
  });

  readonly totalQuestions = computed(() => this.analysis().length);
  readonly correctCount = computed(() => this.analysis().filter((item) => item.status === 'correct').length);
  readonly incorrectCount = computed(
    () => this.analysis().filter((item) => item.status === 'incorrect').length,
  );
  readonly unansweredCount = computed(
    () => this.analysis().filter((item) => item.status === 'unanswered').length,
  );
  readonly percentage = computed(() => {
    const total = this.totalQuestions();
    if (total === 0) {
      return 0;
    }

    return Math.round((this.correctCount() / total) * 100);
  });
  readonly passed = computed(() => this.percentage() >= (this.test()?.passPercent ?? 0));

  ngOnInit(): void {
    const testId = this.route.snapshot.paramMap.get('testId');

    if (!testId) {
      void this.router.navigate(['/tests']);
      return;
    }

    this.testApiService
      .getTestById(testId)
      .pipe(take(1))
      .subscribe((test) => {
        if (!test) {
          void this.router.navigate(['/tests']);
          return;
        }

        this.test.set(test);

        const session = this.testSessionService.restoreSession(test.id);
        if (!session) {
          void this.router.navigate(['/tests']);
          return;
        }

        if (!session.submitted) {
          void this.router.navigate(['/tests', test.id, 'start']);
        }
      });
  }

  restartTest(): void {
    const test = this.test();

    if (!test) {
      return;
    }

    this.testSessionService.clearSession(test.id);
    void this.router.navigate(['/tests', test.id, 'start']);
  }

  goToTestsList(): void {
    void this.router.navigate(['/tests']);
  }

  formatStatus(status: AnalysisStatus): string {
    if (status === 'correct') {
      return 'Correct';
    }

    if (status === 'incorrect') {
      return 'Incorrect';
    }

    return 'Unanswered';
  }
}

function resolveStatus(question: TestQuestion, selectedOptionIds: string[]): AnalysisStatus {
  if (!selectedOptionIds.length) {
    return 'unanswered';
  }

  return isAnswerCorrect(question, selectedOptionIds) ? 'correct' : 'incorrect';
}

function mapOptionIdsToText(question: TestQuestion, optionIds: string[]): string[] {
  const optionMap = new Map(question.options.map((option) => [option.id, option.text]));
  return optionIds.map((id) => optionMap.get(id)).filter((value): value is string => !!value);
}
