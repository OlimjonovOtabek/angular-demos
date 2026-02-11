import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TestQuestion } from '../../models/test.models';

@Component({
  selector: 'app-question-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <aside class="rounded-lg border border-border bg-card p-3">
      <p class="mb-3 text-sm font-semibold text-card-foreground">Questions</p>

      <div class="grid grid-cols-5 gap-2">
        @for (question of questions(); track question.id; let index = $index) {
          <button
            type="button"
            class="h-9 rounded-md border text-xs font-medium transition-colors"
            [ngClass]="{
              'border-primary bg-primary text-primary-foreground': index === currentIndex(),
              'border-primary/60 bg-primary/10 text-primary':
                index !== currentIndex() && isAnswered(question.id),
              'border-border bg-muted text-muted-foreground':
                index !== currentIndex() && !isAnswered(question.id),
            }"
            (click)="questionSelected.emit(index)"
          >
            {{ index + 1 }}
          </button>
        }
      </div>
    </aside>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuestionListComponent {
  readonly questions = input.required<TestQuestion[]>();
  readonly currentIndex = input(0);
  readonly answers = input<Record<string, string[]>>({});
  readonly questionSelected = output<number>();

  isAnswered(questionId: string): boolean {
    return (this.answers()[questionId]?.length ?? 0) > 0;
  }
}
