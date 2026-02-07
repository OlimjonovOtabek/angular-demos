export type TodoFilter = 'all' | 'active' | 'completed';

export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;
}

export type FilterOption = Readonly<{ value: TodoFilter; label: string }>;
