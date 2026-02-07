import { computed, effect, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { Todo, TodoFilter } from './types';
import { parseTodos, randomId, TODO_STORAGE_KEY } from './utils';

@Injectable({ providedIn: 'root' })
export class TodoStore {
  readonly todos = signal<Todo[]>([]);
  readonly filter = signal<TodoFilter>('all');

  readonly totalCount = computed(() => this.todos().length);
  readonly activeCount = computed(() => this.todos().filter((todo) => !todo.completed).length);
  readonly completedCount = computed(() => this.todos().filter((todo) => todo.completed).length);

  readonly visibleTodos = computed(() => {
    const currentFilter = this.filter();
    const todos = this.todos();

    switch (currentFilter) {
      case 'active':
        return todos.filter((todo) => !todo.completed);
      case 'completed':
        return todos.filter((todo) => todo.completed);
      default:
        return todos;
    }
  });

  constructor() {
    this.loadFromStorage();
    const serialized = JSON.stringify(this.todos());
    localStorage.setItem(TODO_STORAGE_KEY, serialized);
  }

  loadFromStorage(): void {
    let nextTodos: Todo[] = [];

    try {
      const rawValue = localStorage.getItem(TODO_STORAGE_KEY);
      nextTodos = parseTodos(rawValue);
    } catch {
      nextTodos = [];
    }
    this.todos.set(nextTodos);
  }

  add(title: string): void {
    const normalizedTitle = title.trim();

    if (!normalizedTitle) {
      return;
    }

    const nextTodo: Todo = {
      id: randomId(),
      title: normalizedTitle,
      completed: false,
      createdAt: Date.now(),
    };

    this.todos.set([...this.todos(), nextTodo]);
  }

  toggle(id: string): void {
    this.todos.set(
      this.todos().map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo)),
    );
  }

  remove(id: string): void {
    this.todos.set(this.todos().filter((todo) => todo.id !== id));
  }

  setFilter(filter: TodoFilter): void {
    this.filter.set(filter);
  }

  clearCompleted(): void {
    this.todos.set(this.todos().filter((todo) => !todo.completed));
  }
}
