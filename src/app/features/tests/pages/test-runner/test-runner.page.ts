import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { take } from 'rxjs';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { InfoPanelComponent } from '../../../../shared/components/info-panel/info-panel.component';
import { QuestionListComponent } from '../../components/question-list/question-list.component';
import { QuestionViewerComponent } from '../../components/question-viewer/question-viewer.component';
import { TimerComponent } from '../../components/timer/timer.component';
import { AnswerSelectionChange, Test, TestQuestion } from '../../models/test.models';
import { TestApiService } from '../../services/test-api.service';
import { TestSessionService } from '../../services/test-session.service';

@Component({
  selector: 'app-test-runner-page',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    QuestionListComponent,
    QuestionViewerComponent,
    TimerComponent,
    InfoPanelComponent,
  ],
  template: `
    <section class="mx-auto w-full max-w-6xl space-y-4">
      @if (isLoading()) {
        <app-info-panel> Loading test... </app-info-panel>
      } @else if (!test()) {
        <app-info-panel> Test not found... </app-info-panel>
      } @else {
        <header class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 class="text-2xl font-semibold text-foreground">{{ test()!.name }}</h2>
            <p class="text-sm text-muted-foreground">
              Question {{ currentQuestionIndex() + 1 }} of {{ test()!.questions.length }}
            </p>
          </div>

          <app-test-timer [remainingSeconds]="sessionService.remainingSeconds()" />
        </header>

        <div class="grid gap-4 lg:grid-cols-[260px_1fr]">
          <app-question-list
            [questions]="test()!.questions"
            [currentIndex]="currentQuestionIndex()"
            [answers]="currentAnswers()"
            (questionSelected)="onQuestionSelected($event)"
          />

          <div class="space-y-4">
            @if (currentQuestion(); as question) {
              <app-question-viewer
                [question]="question"
                [selectedOptionIds]="selectedOptionIds()"
                (answerChanged)="onAnswerChanged($event)"
              />

              <div class="flex flex-wrap justify-between gap-2 mt-2">
                <div>
                  @if (hasPrevious()) {
                    <app-button
                      variant="outline"
                      [disabled]="!hasPrevious()"
                      (click)="sessionService.prev()"
                    >
                      Previous
                    </app-button>
                  }
                </div>

                <div class="flex gap-2">
                  @if (hasNext()) {
                    <app-button variant="secondary" (click)="sessionService.next()"
                      >Next</app-button
                    >
                  }

                  <app-button variant="primary" (click)="submitTest()">Submit</app-button>
                </div>
              </div>
            }
          </div>
        </div>
      }
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestRunnerPageComponent implements OnInit {
  readonly sessionService = inject(TestSessionService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly testApiService = inject(TestApiService);

  readonly test = signal<Test | null>(null);
  readonly isLoading = signal(true);

  readonly currentQuestionIndex = computed(
    () => this.sessionService.session()?.currentQuestionIndex ?? 0,
  );
  readonly currentAnswers = computed(() => this.sessionService.session()?.answers ?? {});

  readonly currentQuestion = computed<TestQuestion | null>(() => {
    const test = this.test();
    const index = this.currentQuestionIndex();

    if (!test || index < 0 || index >= test.questions.length) {
      return null;
    }

    return test.questions[index];
  });

  readonly selectedOptionIds = computed(() => {
    const question = this.currentQuestion();
    if (!question) {
      return [];
    }

    return this.currentAnswers()[question.id] ?? [];
  });

  readonly hasPrevious = computed(() => this.currentQuestionIndex() > 0);

  readonly hasNext = computed(() => {
    const test = this.test();
    if (!test) {
      return false;
    }

    return this.currentQuestionIndex() < test.questions.length - 1;
  });

  constructor() {
    effect(() => {
      const test = this.test();
      const session = this.sessionService.session();

      if (!test || !session || session.testId !== test.id) {
        return;
      }

      if (session.submitted) {
        void this.router.navigate(['/tests', test.id, 'result']);
      }
    });
  }

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
          this.isLoading.set(false);
          void this.router.navigate(['/tests']);
          return;
        }

        this.test.set(test);

        const restoredSession = this.sessionService.restoreSession(test.id);
        const shouldRestartSession =
          !restoredSession ||
          restoredSession.durationMinutes !== test.durationMinutes ||
          restoredSession.questionCount !== test.questions.length;

        if (shouldRestartSession) {
          this.sessionService.startSession(test);
        }

        this.isLoading.set(false);
      });
  }

  onQuestionSelected(index: number): void {
    this.sessionService.goToQuestion(index);
  }

  onAnswerChanged(event: AnswerSelectionChange): void {
    const question = this.currentQuestion();

    if (!question) {
      return;
    }

    this.sessionService.selectAnswer(question.id, event.optionId, event.mode);
  }

  submitTest(): void {
    const currentTest = this.test();

    if (!currentTest) {
      return;
    }

    this.sessionService.submit();
    void this.router.navigate(['/tests', currentTest.id, 'result']);
  }
}
