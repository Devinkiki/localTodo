import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { formatISO, startOfDay } from 'date-fns';
import type { Task, TodoList, FilterType } from '../types';

const STORAGE_KEY = 'local-todo-data';

interface StoreState {
  tasks: Task[];
  lists: TodoList[];
  activeListId: string | null;
  activeFilter: FilterType;
  activeTaskId: string | null;
  searchQuery: string;

  // List actions
  addList: (name: string, color: string) => void;
  renameList: (id: string, name: string) => void;
  deleteList: (id: string) => void;
  setActiveList: (id: string | null) => void;

  // Task actions
  addTask: (title: string, listId?: string) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  setActiveTask: (id: string | null) => void;

  // Filter actions
  setFilter: (filter: FilterType) => void;
  setSearchQuery: (query: string) => void;

  // My Day actions
  toggleMyDay: (id: string) => void;
  toggleImportant: (id: string) => void;

  // Data persistence
  resetMyDay: () => void;
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      // Reset My Day tasks on new day
      const lastVisit = data.lastVisit;
      const today = formatISO(startOfDay(new Date()), { representation: 'date' });
      if (lastVisit !== today) {
        data.tasks = (data.tasks || []).map((t: Task) => ({ ...t, myDay: false }));
        data.lastVisit = today;
      }
      return data;
    }
  } catch {
    // ignore
  }
  return null;
}

function saveState(state: Partial<StoreState>) {
  const data = {
    tasks: state.tasks,
    lists: state.lists,
    lastVisit: formatISO(startOfDay(new Date()), { representation: 'date' }),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

const DEFAULT_LIST_ID = 'default-list';
const MEETING_LIST_ID = 'meeting-list';

export const useStore = create<StoreState>((set) => {
  const saved = loadState();

  const initialState = {
    tasks: saved?.tasks || [],
    lists: saved?.lists || [
      { id: DEFAULT_LIST_ID, name: '任务', color: '#4C8AFF', createdAt: new Date().toISOString() },
      { id: MEETING_LIST_ID, name: '会议', color: '#FF922B', createdAt: new Date().toISOString() },
    ],
    activeListId: saved?.lists?.[0]?.id || DEFAULT_LIST_ID,
    activeFilter: 'all' as FilterType,
    activeTaskId: null,
    searchQuery: '',
  };

  const updateAndSave = (updater: (state: StoreState) => Partial<StoreState>) => {
    set((state) => {
      const changes = updater(state);
      const newState = { ...state, ...changes };
      saveState(newState);
      return changes;
    });
  };

  return {
    ...initialState,

    addList: (name: string, color: string) => {
      updateAndSave((state) => ({
        lists: [...state.lists, { id: uuidv4(), name, color, createdAt: new Date().toISOString() }],
      }));
    },

    renameList: (id: string, name: string) => {
      updateAndSave((state) => ({
        lists: state.lists.map((l) => (l.id === id ? { ...l, name } : l)),
      }));
    },

    deleteList: (id: string) => {
      updateAndSave((state) => {
        const remaining = state.lists.filter((l) => l.id !== id);
        return {
          lists: remaining,
          tasks: state.tasks.filter((t) => t.listId !== id),
          activeListId: state.activeListId === id ? (remaining[0]?.id ?? null) : state.activeListId,
        };
      });
    },

    setActiveList: (id: string | null) => set({ activeListId: id, activeFilter: 'all' }),

    addTask: (title: string, listId?: string) => {
      updateAndSave((state) => {
        const targetListId = listId || state.activeListId || state.lists[0]?.id;
        if (!targetListId) return {};
        const now = new Date().toISOString();
        const newTask: Task = {
          id: uuidv4(),
          title,
          notes: '',
          completed: false,
          important: false,
          myDay: state.activeFilter === 'myDay',
          dueDate: null,
          listId: targetListId,
          tags: [],
          createdAt: now,
          updatedAt: now,
        };
        return { tasks: [newTask, ...state.tasks] };
      });
    },

    toggleTask: (id: string) => {
      updateAndSave((state) => ({
        tasks: state.tasks.map((t) =>
          t.id === id ? { ...t, completed: !t.completed, updatedAt: new Date().toISOString() } : t
        ),
      }));
    },

    deleteTask: (id: string) => {
      updateAndSave((state) => ({
        tasks: state.tasks.filter((t) => t.id !== id),
        activeTaskId: state.activeTaskId === id ? null : state.activeTaskId,
      }));
    },

    updateTask: (id: string, updates: Partial<Task>) => {
      updateAndSave((state) => ({
        tasks: state.tasks.map((t) =>
          t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
        ),
      }));
    },

    setActiveTask: (id: string | null) => set({ activeTaskId: id }),

    setFilter: (filter: FilterType) => set({ activeFilter: filter, activeListId: null }),

    setSearchQuery: (query: string) => set({ searchQuery: query }),

    toggleMyDay: (id: string) => {
      updateAndSave((state) => ({
        tasks: state.tasks.map((t) =>
          t.id === id ? { ...t, myDay: !t.myDay, updatedAt: new Date().toISOString() } : t
        ),
      }));
    },

    toggleImportant: (id: string) => {
      updateAndSave((state) => ({
        tasks: state.tasks.map((t) =>
          t.id === id ? { ...t, important: !t.important, updatedAt: new Date().toISOString() } : t
        ),
      }));
    },

    resetMyDay: () => {
      updateAndSave((state) => ({
        tasks: state.tasks.map((t) => ({ ...t, myDay: false })),
      }));
    },
  };
});
