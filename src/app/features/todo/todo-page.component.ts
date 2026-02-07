import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { TodoStore } from './todo.store';
import { FilterOption } from './types';

@Component({
  selector: 'app-todo-page',
  standalone: true,
  template: `
    <section class="mx-auto w-full max-w-2xl space-y-4">
      <header>
        <h2 class="text-2xl font-semibold tracking-tight text-foreground">Todo List</h2>
        <p class="text-sm text-muted-foreground">Signals + localStorage.</p>
      </header>

      <div class="rounded-xl border border-border bg-card p-4 shadow-sm">
        <div class="flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            class="h-10 flex-1 rounded-md border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground "
            placeholder="Add a todo..."
            [value]="newTitle()"
            (input)="onTitleInput($event)"
            (keydown.enter)="addTodo()"
          />

          <button
            type="button"
            class="h-10 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground  hover:bg-primary/90"
            (click)="addTodo()"
          >
            Add
          </button>
        </div>
      </div>

      <section class="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        @if (!store.visibleTodos().length) {
          <p class="p-6 text-center text-sm text-muted-foreground">No todos for this filter.</p>
        } @else {
          <ul class="divide-y divide-border">
            @for (todo of store.visibleTodos(); track todo.id) {
              <li class="flex items-center gap-3 p-4">
                <input
                  type="checkbox"
                  class="h-4 w-4 accent-primary"
                  [checked]="todo.completed"
                  (change)="store.toggle(todo.id)"
                />

                <span
                  class="flex-1 text-sm text-foreground"
                  [class.text-muted-foreground]="todo.completed"
                  [class.line-through]="todo.completed"
                >
                  {{ todo.title }}
                </span>

                <button
                  type="button"
                  class="rounded-md px-2 py-1 text-xs font-medium text-muted-foreground  hover:bg-muted hover:text-foreground"
                  (click)="store.remove(todo.id)"
                >
                  Delete
                </button>
              </li>
            }
          </ul>
        }

        <footer class="space-y-3 border-t border-border bg-muted/30 p-4">
          <div class="flex flex-wrap gap-4 text-xs text-muted-foreground">
            <span>Total: {{ store.totalCount() }}</span>
            <span>Active: {{ store.activeCount() }}</span>
            <span>Completed: {{ store.completedCount() }}</span>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            @for (option of filterOptions; track option.value) {
              <button
                type="button"
                class="rounded-md px-3 py-1.5 text-xs font-medium "
                [class.bg-primary]="store.filter() === option.value"
                [class.text-primary-foreground]="store.filter() === option.value"
                [class.bg-transparent]="store.filter() !== option.value"
                [class.text-foreground]="store.filter() !== option.value"
                [class.hover:bg-muted]="store.filter() !== option.value"
                (click)="store.setFilter(option.value)"
              >
                {{ option.label }}
              </button>
            }

            @if (store.completedCount() > 0) {
              <button
                type="button"
                class="ml-auto rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground  hover:bg-muted hover:text-foreground"
                (click)="store.clearCompleted()"
              >
                Clear completed
              </button>
            }
          </div>

          <p class="text-xs text-muted-foreground">
            @switch (store.filter()) {
              @case ('all') {
                Showing all todos.
              }
              @case ('active') {
                Showing active todos only.
              }
              @case ('completed') {
                Showing completed todos only.
              }
            }
          </p>
        </footer>
      </section>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TodoPageComponent {
  readonly store = inject(TodoStore);
  readonly newTitle = signal('');
  readonly filterOptions: readonly FilterOption[] = [
    { value: 'all', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'completed', label: 'Completed' },
  ];

  addTodo(): void {
    const title = this.newTitle();
    this.store.add(title);
    this.newTitle.set('');
  }

  onTitleInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement | null;
    this.newTitle.set(inputElement?.value ?? '');
  }
}
