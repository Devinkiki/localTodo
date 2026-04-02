import { useStore } from '../store/useStore';
import { Star, Calendar } from 'lucide-react';
import { useState } from 'react';

export function TaskList() {
  const {
    tasks,
    lists,
    activeListId,
    activeFilter,
    searchQuery,
    toggleTask,
    toggleImportant,
    toggleMyDay,
    addTask,
    setActiveTask,
    updateTask,
    setFilter,
  } = useStore();
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [datePickerTaskId, setDatePickerTaskId] = useState<string | null>(null);

  const quickDates = [
    { label: '今天', days: 0 },
    { label: '明天', days: 1 },
    { label: '下周', days: 7 },
  ];

  const getDueDateLabel = (dueDate: string | null) => {
    if (!dueDate) return null;
    const date = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const taskDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    if (taskDay.getTime() === today.getTime()) return '今天';
    if (taskDay.getTime() === tomorrow.getTime()) return '明天';
    if (taskDay < today) return '已逾期';
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  };

  const getDueDateColor = (dueDate: string | null) => {
    if (!dueDate) return 'var(--text-secondary)';
    const date = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const taskDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    if (taskDay < today) return 'var(--accent-red)';
    if (taskDay.getTime() === today.getTime()) return 'var(--accent-blue)';
    return 'var(--text-secondary)';
  };

  // Filter tasks
  let filteredTasks = tasks;

  if (activeFilter === 'myDay') {
    filteredTasks = tasks.filter((t) => t.myDay && !t.completed);
  } else if (activeFilter === 'important') {
    filteredTasks = tasks.filter((t) => t.important && !t.completed);
  } else if (activeFilter === 'all') {
    if (activeListId) {
      filteredTasks = tasks.filter((t) => t.listId === activeListId);
    } else {
      filteredTasks = tasks;
    }
  }

  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filteredTasks = filteredTasks.filter(
      (t) =>
        t.title.toLowerCase().includes(query) ||
        t.notes.toLowerCase().includes(query) ||
        t.tags.some((tag) => tag.toLowerCase().includes(query))
    );
  }

  const activeTasks = filteredTasks.filter((t) => !t.completed);
  const completedTasks = filteredTasks.filter((t) => t.completed);

  const getListName = () => {
    if (activeFilter === 'myDay') return '我的一天';
    if (activeFilter === 'important') return '重要';
    if (activeFilter === 'all' && !activeListId) return '所有任务';
    const list = lists.find((l) => l.id === activeListId);
    return list?.name || '任务';
  };

  const getListColor = () => {
    if (activeFilter === 'myDay') return '#4C8AFF';
    if (activeFilter === 'important') return '#FFD43B';
    if (activeFilter === 'all' && !activeListId) return '#6b6375';
    const list = lists.find((l) => l.id === activeListId);
    return list?.color || '#4C8AFF';
  };

  const handleToggleMyDay = (id: string) => {
    toggleMyDay(id);
    // If we're in My Day view, toggling off makes the task disappear — switch to all tasks
    if (activeFilter === 'myDay') {
      setFilter('all');
    }
  };

  const handleToggleImportant = (id: string) => {
    toggleImportant(id);
    // If we're in Important view, toggling off makes the task disappear — switch to all tasks
    if (activeFilter === 'important') {
      setFilter('all');
    }
  };

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      addTask(newTaskTitle.trim(), activeListId || undefined);
      setNewTaskTitle('');
    }
  };

  return (
    <div className="task-list-container">
      <div className="task-list-header">
        <h2 style={{ color: getListColor() }}>{getListName()}</h2>
        <span className="task-count">{activeTasks.length} 个待办任务</span>
      </div>

      <div className="task-list">
        {activeTasks.map((task) => (
          <div
            key={task.id}
            className="task-item"
            onClick={() => setActiveTask(task.id)}
          >
            <button
              className={`task-checkbox ${task.completed ? 'completed' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                toggleTask(task.id);
              }}
            >
              {task.completed && <span>✓</span>}
            </button>
            <div className="task-content">
              <span className="task-title">{task.title}</span>
              <div className="task-meta">
                {task.dueDate && (
                  <span className="task-due-date" style={{ color: getDueDateColor(task.dueDate) }}>
                    {getDueDateLabel(task.dueDate)}
                  </span>
                )}
              </div>
            </div>
            <div className="task-actions" onClick={(e) => e.stopPropagation()}>
              <button
                className={`icon-btn ${task.important ? 'starred' : ''}`}
                onClick={() => handleToggleImportant(task.id)}
                title="标记重要"
              >
                <Star size={16} fill={task.important ? '#FFD43B' : 'none'} color="#FFD43B" />
              </button>
              <div className="date-picker-wrapper">
                <button
                  className={`icon-btn ${task.dueDate ? 'has-date' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setDatePickerTaskId(datePickerTaskId === task.id ? null : task.id);
                  }}
                  title="设置日期"
                >
                  <Calendar size={16} />
                </button>
                {datePickerTaskId === task.id && (
                  <div className="date-picker-popup" onClick={(e) => e.stopPropagation()}>
                    <div className="quick-dates">
                      {quickDates.map((qd) => {
                        const date = new Date();
                        date.setDate(date.getDate() + qd.days);
                        const iso = date.toISOString();
                        return (
                          <button
                            key={qd.label}
                            className={`quick-date-btn ${task.dueDate && new Date(task.dueDate).toDateString() === date.toDateString() ? 'selected' : ''}`}
                            onClick={() => {
                              updateTask(task.id, { dueDate: iso });
                              setDatePickerTaskId(null);
                            }}
                          >
                            {qd.label}
                          </button>
                        );
                      })}
                    </div>
                    <input
                      type="date"
                      value={task.dueDate ? task.dueDate.split('T')[0] : ''}
                      onChange={(e) => {
                        if (e.target.value) {
                          updateTask(task.id, { dueDate: new Date(e.target.value).toISOString() });
                        }
                        setDatePickerTaskId(null);
                      }}
                    />
                    {task.dueDate && (
                      <button
                        className="clear-date-btn"
                        onClick={() => {
                          updateTask(task.id, { dueDate: null });
                          setDatePickerTaskId(null);
                        }}
                      >
                        清除日期
                      </button>
                    )}
                  </div>
                )}
              </div>
              <button
                className={`icon-btn ${task.myDay ? 'active' : ''}`}
                onClick={() => handleToggleMyDay(task.id)}
                title="添加到我的日程"
              >
                <span className="my-day-dot" />
              </button>
            </div>
          </div>
        ))}

        {activeTasks.length === 0 && (
          <div className="empty-state">
            <p>暂无任务</p>
          </div>
        )}

        <div className="add-task">
          <button className="task-checkbox" />
          <input
            type="text"
            placeholder="添加任务"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
          />
        </div>

        {completedTasks.length > 0 && (
          <>
            <div className="completed-header">
              <span>已完成 ({completedTasks.length})</span>
            </div>
            {completedTasks.map((task) => (
              <div
                key={task.id}
                className="task-item completed"
                onClick={() => setActiveTask(task.id)}
              >
                <button
                  className="task-checkbox completed"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleTask(task.id);
                  }}
                >
                  <span>✓</span>
                </button>
                <div className="task-content">
                  <span className="task-title">{task.title}</span>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
