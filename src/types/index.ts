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
  order: number; // 排序权重，数值越小越靠前
  createdAt: string;
  updatedAt: string;
}

export interface TodoList {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

/** 记事本实体 */
export interface Notebook {
  id: string;
  title: string;
  content: string; // Markdown 内容
  createdAt: string;
  updatedAt: string;
}

export type FilterType = 'all' | 'myDay' | 'important' | 'completed' | 'notebook';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface AppState {
  tasks: Task[];
  lists: TodoList[];
  activeListId: string | null;
  activeFilter: FilterType;
  activeTaskId: string | null;
  searchQuery: string;
  theme: ThemeMode;
}
