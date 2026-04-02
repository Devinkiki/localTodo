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
  reorderTasks: (fromIndex: number, toIndex: number, groupKey: string) => void;
  moveTask: (taskId: string, targetListId: string, targetIndex: number) => void;

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

  // 为旧数据兼容：缺失 order 字段的任务自动补上
  initialState.tasks = initialState.tasks.map((t: Task, i: number) => ({
    ...t,
    order: t.order ?? i,
  }));

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
          order: state.tasks.length,
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

    /**
     * 组内排序：在同一分组内拖动调整任务顺序
     * @param fromIndex 源位置索引
     * @param toIndex 目标位置索引
     * @param groupKey 分组标识（listId 或 filter 类型）
     */
    reorderTasks: (fromIndex: number, toIndex: number, groupKey: string) => {
      updateAndSave((state) => {
        // 获取当前视图下按 order 排序的任务
        const viewTasks = state.tasks
          .filter((t) => {
            if (groupKey === 'myDay') return t.myDay && !t.completed;
            if (groupKey === 'important') return t.important && !t.completed;
            if (groupKey === 'all') return !t.completed;
            return t.listId === groupKey && !t.completed;
          })
          .sort((a, b) => a.order - b.order);

        if (fromIndex < 0 || fromIndex >= viewTasks.length || toIndex < 0) {
          return {};
        }

        const [movedTask] = viewTasks.splice(fromIndex, 1);
        // toIndex 可以等于 viewTasks.length（拖到末尾）
        const clampedToIndex = Math.min(toIndex, viewTasks.length);
        viewTasks.splice(clampedToIndex, 0, movedTask);

        // 重新分配 order 值
        const updatedTasks = new Map<string, number>();
        viewTasks.forEach((t, i) => updatedTasks.set(t.id, i));

        return {
          tasks: state.tasks.map((t) =>
            updatedTasks.has(t.id) ? { ...t, order: updatedTasks.get(t.id)! } : t
          ),
        };
      });
    },

    /**
     * 跨列表移动任务：将任务从一个列表拖到另一个列表
     * @param taskId 要移动的任务 ID
     * @param targetListId 目标列表 ID
     * @param targetIndex 在目标列表中的插入位置
     */
    moveTask: (taskId: string, targetListId: string, targetIndex: number) => {
      updateAndSave((state) => {
        const draggedTask = state.tasks.find((t) => t.id === taskId);
        if (!draggedTask) return {};

        // 获取目标列表中未完成任务（排除被拖任务本身）
        const targetTasks = state.tasks
          .filter((t) => t.listId === targetListId && !t.completed && t.id !== taskId)
          .sort((a, b) => a.order - b.order);

        // 计算插入位置
        const clampedIndex = Math.min(Math.max(0, targetIndex), targetTasks.length);
        targetTasks.splice(clampedIndex, 0, draggedTask);

        // 重新分配目标列表中所有任务的 order
        const updatedOrders = new Map<string, number>();
        targetTasks.forEach((t, i) => updatedOrders.set(t.id, i));

        return {
          tasks: state.tasks.map((t) => {
            if (updatedOrders.has(t.id)) {
              return {
                ...t,
                listId: targetListId,
                order: updatedOrders.get(t.id)!,
                updatedAt: new Date().toISOString(),
              };
            }
            return t;
          }),
        };
      });
    },
  };
});
