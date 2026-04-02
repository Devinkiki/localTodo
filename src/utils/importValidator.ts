import type { Task, TodoList } from '../types';

/** 校验结果 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/** 导入数据结构 */
export interface ImportData {
  tasks: Task[];
  lists: TodoList[];
}

// Task 必填字段清单
const REQUIRED_TASK_FIELDS: (keyof Task)[] = [
  'id', 'title', 'notes', 'completed', 'important',
  'myDay', 'dueDate', 'listId', 'tags', 'createdAt', 'updatedAt',
];

// List 必填字段清单
const REQUIRED_LIST_FIELDS: (keyof TodoList)[] = [
  'id', 'name', 'color', 'createdAt',
];

/**
 * 校验单个 Task 对象的字段和类型
 */
function validateTask(task: unknown, index: number): string[] {
  const errors: string[] = [];
  const prefix = `tasks[${index}]`;

  if (task === null || typeof task !== 'object' || Array.isArray(task)) {
    return [`${prefix}: 不是有效的对象`];
  }

  const t = task as Record<string, unknown>;

  // 检查必填字段是否存在
  for (const field of REQUIRED_TASK_FIELDS) {
    if (!(field in t)) {
      errors.push(`${prefix}: 缺少字段 "${field}"`);
    }
  }

  // 类型校验（仅对已存在的字段）
  if ('id' in t && typeof t.id !== 'string') errors.push(`${prefix}: "id" 应为字符串`);
  if ('title' in t && typeof t.title !== 'string') errors.push(`${prefix}: "title" 应为字符串`);
  if ('notes' in t && typeof t.notes !== 'string') errors.push(`${prefix}: "notes" 应为字符串`);
  if ('completed' in t && typeof t.completed !== 'boolean') errors.push(`${prefix}: "completed" 应为布尔值`);
  if ('important' in t && typeof t.important !== 'boolean') errors.push(`${prefix}: "important" 应为布尔值`);
  if ('myDay' in t && typeof t.myDay !== 'boolean') errors.push(`${prefix}: "myDay" 应为布尔值`);
  if ('listId' in t && typeof t.listId !== 'string') errors.push(`${prefix}: "listId" 应为字符串`);
  if ('createdAt' in t && typeof t.createdAt !== 'string') errors.push(`${prefix}: "createdAt" 应为字符串`);
  if ('updatedAt' in t && typeof t.updatedAt !== 'string') errors.push(`${prefix}: "updatedAt" 应为字符串`);

  // dueDate: string | null
  if ('dueDate' in t && t.dueDate !== null && typeof t.dueDate !== 'string') {
    errors.push(`${prefix}: "dueDate" 应为字符串或 null`);
  }

  // tags: string[]
  if ('tags' in t) {
    if (!Array.isArray(t.tags)) {
      errors.push(`${prefix}: "tags" 应为数组`);
    } else if (!t.tags.every((tag: unknown) => typeof tag === 'string')) {
      errors.push(`${prefix}: "tags" 中的元素应全部为字符串`);
    }
  }

  return errors;
}

/**
 * 校验单个 TodoList 对象的字段和类型
 */
function validateList(list: unknown, index: number): string[] {
  const errors: string[] = [];
  const prefix = `lists[${index}]`;

  if (list === null || typeof list !== 'object' || Array.isArray(list)) {
    return [`${prefix}: 不是有效的对象`];
  }

  const l = list as Record<string, unknown>;

  for (const field of REQUIRED_LIST_FIELDS) {
    if (!(field in l)) {
      errors.push(`${prefix}: 缺少字段 "${field}"`);
    }
  }

  if ('id' in l && typeof l.id !== 'string') errors.push(`${prefix}: "id" 应为字符串`);
  if ('name' in l && typeof l.name !== 'string') errors.push(`${prefix}: "name" 应为字符串`);
  if ('color' in l && typeof l.color !== 'string') errors.push(`${prefix}: "color" 应为字符串`);
  if ('createdAt' in l && typeof l.createdAt !== 'string') errors.push(`${prefix}: "createdAt" 应为字符串`);

  return errors;
}

/**
 * 校验 JSON 格式导入数据
 */
export function validateJsonData(raw: unknown): ValidationResult {
  const errors: string[] = [];

  if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) {
    return { valid: false, errors: ['数据格式无效：顶层应为对象'] };
  }

  const data = raw as Record<string, unknown>;

  // 检查顶层字段
  if (!('tasks' in data)) {
    errors.push('缺少顶层字段 "tasks"');
  }
  if (!('lists' in data)) {
    errors.push('缺少顶层字段 "lists"');
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  // 校验 tasks 数组
  if (!Array.isArray(data.tasks)) {
    errors.push('"tasks" 应为数组');
  } else {
    data.tasks.forEach((task, i) => {
      errors.push(...validateTask(task, i));
    });
  }

  // 校验 lists 数组
  if (!Array.isArray(data.lists)) {
    errors.push('"lists" 应为数组');
  } else {
    data.lists.forEach((list, i) => {
      errors.push(...validateList(list, i));
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * 校验从 XLS 解析出的数据
 * XLS 数据包含两个 sheet: "tasks" 和 "lists"
 */
export function validateXlsData(raw: unknown): ValidationResult {
  const errors: string[] = [];

  if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) {
    return { valid: false, errors: ['数据格式无效：顶层应为对象'] };
  }

  const data = raw as Record<string, unknown>;

  if (!('tasks' in data)) {
    errors.push('缺少 "tasks" 工作表数据');
  }
  if (!('lists' in data)) {
    errors.push('缺少 "lists" 工作表数据');
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  if (!Array.isArray(data.tasks)) {
    errors.push('"tasks" 应为数组');
  } else {
    data.tasks.forEach((task, i) => {
      errors.push(...validateTask(task, i));
    });
  }

  if (!Array.isArray(data.lists)) {
    errors.push('"lists" 应为数组');
  } else {
    data.lists.forEach((list, i) => {
      errors.push(...validateList(list, i));
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * 将 XLS 单元格值转换为正确的类型
 * Excel 中布尔值可能被存为字符串，需要转换
 */
export function normalizeXlsValue(value: unknown, field: string): unknown {
  // 布尔字段：将字符串 "true"/"false" 转为布尔值
  const booleanFields = ['completed', 'important', 'myDay'];
  if (booleanFields.includes(field)) {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true';
    }
    if (typeof value === 'number') return value === 1;
  }

  // tags 字段：将逗号分隔字符串转为数组
  if (field === 'tags') {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      return value.split(',').map((t) => t.trim()).filter(Boolean);
    }
    return [];
  }

  // dueDate 字段：空字符串转为 null
  if (field === 'dueDate') {
    if (value === '' || value === null || value === undefined) return null;
    return String(value);
  }

  // 其余字段转为字符串
  if (value === null || value === undefined) return '';
  return String(value);
}

/**
 * 规范化 XLS 解析出的整条记录
 */
export function normalizeXlsRecord(record: Record<string, unknown>, fields: string[]): Record<string, unknown> {
  const normalized: Record<string, unknown> = {};
  for (const field of fields) {
    normalized[field] = normalizeXlsValue(record[field], field);
  }
  return normalized;
}
