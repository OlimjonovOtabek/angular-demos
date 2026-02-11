import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, input, output } from '@angular/core';
import { FormControl, FormRecord, ReactiveFormsModule } from '@angular/forms';
import { OptionLetterPipe } from '../../../../shared/pipes/option-letter.pipe';
import { AnswerSelectionChange, TestQuestion } from '../../models/test.models';

@Component({
  selector: 'app-question-viewer',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, OptionLetterPipe],
  template: `
    @if (question(); as currentQuestion) {
      <section class="rounded-lg border border-border bg-card p-4">
        <p class="mb-4 text-lg font-semibold text-card-foreground">{{ currentQuestion.text }}</p>

        @if (currentQuestion.type === 'single') {
          <div class="space-y-2">
            @for (option of currentQuestion.options; track option.id; let optionIndex = $index) {
              <label
                class="flex cursor-pointer items-center gap-3 rounded-md border border-border px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"
              >
                <input
                  type="radio"
                  [value]="option.id"
                  [formControl]="singleChoiceControl"
                  (change)="onSingleChoice(option.id)"
                />
                <span class="font-medium text-primary">{{ optionIndex | optionLetter }}.</span>
                <span>{{ option.text }}</span>
              </label>
            }
          </div>
        } @else {
          <form [formGroup]="multipleChoiceForm" class="space-y-2">
            @for (option of currentQuestion.options; track option.id; let optionIndex = $index) {
              <label
                class="flex cursor-pointer items-center gap-3 rounded-md border border-border px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"
              >
                <input type="checkbox" [formControlName]="option.id" (change)="onMultiChoice(option.id)" />
                <span class="font-medium text-primary">{{ optionIndex | optionLetter }}.</span>
                <span>{{ option.text }}</span>
              </label>
            }
          </form>
        }
      </section>
    } @else {
      <section class="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
        Question is not available.
      </section>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuestionViewerComponent {
  readonly question = input<TestQuestion | null>(null);
  readonly selectedOptionIds = input<string[]>([]);
  readonly answerChanged = output<AnswerSelectionChange>();

  readonly singleChoiceControl = new FormControl<string | null>(null);
  multipleChoiceForm = new FormRecord<FormControl<boolean>>({});

  constructor() {
    effect(() => {
      const question = this.question();
      const selectedOptionIds = this.selectedOptionIds();

      if (!question) {
        return;
      }

      if (question.type === 'single') {
        this.singleChoiceControl.setValue(selectedOptionIds[0] ?? null, { emitEvent: false });
        return;
      }

      const nextForm = new FormRecord<FormControl<boolean>>({});
      for (const option of question.options) {
        nextForm.addControl(
          option.id,
          new FormControl(selectedOptionIds.includes(option.id), { nonNullable: true }),
        );
      }

      this.multipleChoiceForm = nextForm;
    });
  }

  onSingleChoice(optionId: string): void {
    this.answerChanged.emit({
      optionId,
      mode: 'replace',
    });
  }

  onMultiChoice(optionId: string): void {
    this.answerChanged.emit({
      optionId,
      mode: 'toggle',
    });
  }
}
