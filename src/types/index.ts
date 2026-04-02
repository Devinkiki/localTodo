export interface Task {
  id: string;
  title: string;
  notes: string;
  completed: boolean;
  important: boolean;
  myDay: boolean;
  dueDate: string | null; // ISO date string
  listId: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TodoList {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

export type FilterType = 'all' | 'myDay' | 'important' | 'completed';

export interface AppState {
  tasks: Task[];
  lists: TodoList[];
  activeListId: string | null;
  activeFilter: FilterType;
  activeTaskId: string | null;
  searchQuery: string;
}
