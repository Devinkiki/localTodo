import { useStore } from '../store/useStore';
import { Star, CalendarClock, Sunrise, ArrowRightCircle, GripVertical } from 'lucide-react';
import { useState, useRef } from 'react';

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
    reorderTasks,
    moveTask,
  } = useStore();
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [datePickerTaskId, setDatePickerTaskId] = useState<string | null>(null);
  const [moveMenuTaskId, setMoveMenuTaskId] = useState<string | null>(null);

  // Drag state — 使用 refs 避免拖拽过程中的 React 重渲染中断 HTML5 拖拽
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverGroupId, setDragOverGroupId] = useState<string | null>(null);
  const dragOverTaskIdRef = useRef<string | null>(null);
  const dragOverGroupElRef = useRef<HTMLElement | null>(null);
  const dragOverTaskElRef = useRef<HTMLElement | null>(null);
  const dragOverListElRef = useRef<HTMLElement | null>(null);

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

  const getDueDateColor = (dueDate: string | null): string => {
    if (!dueDate) return 'var(--text-secondary)';
    const date = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const taskDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    if (taskDay < today) return 'var(--accent-red)';
    if (taskDay.getTime() === today.getTime()) return 'var(--accent-blue)';
    return 'var(--text-secondary)';
  };

  /**
   * 格式化完成时间（用于已完成任务复盘）
   * 今天 → "今天 HH:mm"
   * 昨天 → "昨天 HH:mm"
   * 本周 → "周X HH:mm"
   * 更早 → "M月D日"
   */
  const getCompletedAtLabel = (updatedAt: string) => {
    const date = new Date(updatedAt);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const taskDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const timeStr = date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });

    if (taskDay.getTime() === today.getTime()) return `今天 ${timeStr}`;
    if (taskDay.getTime() === yesterday.getTime()) return `昨天 ${timeStr}`;
    if (taskDay > yesterday) {
      const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
      return `${weekdays[date.getDay()]} ${timeStr}`;
    }
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  };

  /**
   * 获取任务所属的待办类型名称和颜色
   */
  const getTaskListInfo = (task: typeof activeTasks[0]) => {
    const list = lists.find((l) => l.id === task.listId);
    return {
      name: list?.name || '未知类型',
      color: list?.color || 'var(--text-muted)',
    };
  };

  // Filter tasks
  let filteredTasks = tasks;

  if (activeFilter === 'myDay') {
    // 我的一天：包含已完成和未完成的 myDay 任务
    filteredTasks = tasks.filter((t) => t.myDay);
  } else if (activeFilter === 'important') {
    // 重要待办：包含已完成和未完成的 important 任务
    filteredTasks = tasks.filter((t) => t.important);
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
  // 已完成任务按完成时间倒序（最近完成的在上面）
  const completedTasks = filteredTasks
    .filter((t) => t.completed)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  /**
   * 按列表类别分组任务（仅 myDay / important / 所有待办 视图需要）
   */
  const getGroupedTasks = () => {
    // 当前查看的是具体某个列表，不需要分组
    if (activeFilter === 'all' && activeListId) return null;

    const groups = new Map<string, typeof activeTasks>();
    for (const task of activeTasks) {
      const list = lists.find((l) => l.id === task.listId);
      const groupName = list ? list.name : '未知列表';
      if (!groups.has(groupName)) {
        groups.set(groupName, []);
      }
      groups.get(groupName)!.push(task);
    }
    return Array.from(groups.entries());
  };

  const groupedTasks = getGroupedTasks();

  /**
   * 判断当前视图是否支持拖拽排序
   */
  const isDragEnabled = () => !searchQuery.trim();

  /**
   * 获取任务的分组 key
   */
  const getGroupKey = (taskListId: string) => {
    if (activeFilter === 'myDay') return 'myDay';
    if (activeFilter === 'important') return 'important';
    if (activeFilter === 'all' && !activeListId) return 'all';
    return taskListId;
  };

  // ===== Drag handlers =====

  /** 清除之前的拖拽高亮 */
  const clearDragHighlight = () => {
    dragOverTaskElRef.current?.classList.remove('drag-over');
    dragOverTaskElRef.current = null;
    dragOverGroupElRef.current?.classList.remove('drag-over-group');
    dragOverGroupElRef.current = null;
    dragOverListElRef.current?.classList.remove('drag-over-list');
    dragOverListElRef.current = null;
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', taskId);
    // 设置拖拽图像为半透明元素
    e.dataTransfer.setDragImage(e.currentTarget, 20, 20);
    requestAnimationFrame(() => {
      document.querySelector(`[data-task-id="${taskId}"]`)?.classList.add('dragging');
    });
  };

  const handleDragEnd = () => {
    document.querySelector(`.task-item.dragging`)?.classList.remove('dragging');
    clearDragHighlight();
    setDraggedTaskId(null);
    setDragOverGroupId(null);
    dragOverTaskIdRef.current = null;
  };

  const handleDragOverGroup = (e: React.DragEvent, groupKey: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    // 高亮分组容器（直接 DOM 操作，避免重渲染）
    if (dragOverGroupElRef.current !== e.currentTarget) {
      clearDragHighlight();
      dragOverGroupElRef.current = e.currentTarget as HTMLElement;
      dragOverGroupElRef.current.classList.add('drag-over-group');
      setDragOverGroupId(groupKey);
    }
  };

  const handleDragOverTask = (e: React.DragEvent, taskId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    // 直接 DOM 操作切换高亮，避免 React 重渲染中断拖拽
    if (dragOverTaskIdRef.current !== taskId) {
      clearDragHighlight();
      dragOverTaskIdRef.current = taskId;
      dragOverTaskElRef.current = e.currentTarget as HTMLElement;
      dragOverTaskElRef.current.classList.add('drag-over');
    }
  };

  const handleDropOnTask = (e: React.DragEvent, targetTaskId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const draggedId = e.dataTransfer.getData('text/plain');
    if (!draggedId || draggedId === targetTaskId) {
      handleDragEnd();
      return;
    }

    const targetTask = tasks.find((t) => t.id === targetTaskId);
    const draggedTask = tasks.find((t) => t.id === draggedId);
    if (!targetTask || !draggedTask) {
      handleDragEnd();
      return;
    }

    const draggedGroupKey = getGroupKey(draggedTask.listId);
    const targetGroupKey = getGroupKey(targetTask.listId);

    if (draggedGroupKey === targetGroupKey) {
      // 同组内排序
      const viewTasks = tasks
        .filter((t) => {
          if (draggedGroupKey === 'myDay') return t.myDay && !t.completed;
          if (draggedGroupKey === 'important') return t.important && !t.completed;
          if (draggedGroupKey === 'all') return !t.completed;
          return t.listId === draggedGroupKey && !t.completed;
        })
        .sort((a, b) => a.order - b.order);

      const fromIndex = viewTasks.findIndex((t) => t.id === draggedId);
      const toIndex = viewTasks.findIndex((t) => t.id === targetTaskId);

      if (fromIndex !== -1 && toIndex !== -1) {
        reorderTasks(fromIndex, toIndex, draggedGroupKey);
      }
    } else if (draggedTask.listId !== targetTask.listId) {
      // 跨组移动
      const targetTasks = tasks
        .filter((t) => t.listId === targetTask.listId && !t.completed)
        .sort((a, b) => a.order - b.order);
      const targetIndex = targetTasks.findIndex((t) => t.id === targetTaskId);
      moveTask(draggedId, targetTask.listId, Math.max(0, targetIndex));
    }

    handleDragEnd();
  };

  const handleDropOnGroup = (e: React.DragEvent, groupKey: string) => {
    e.preventDefault();
    e.stopPropagation();
    const draggedId = e.dataTransfer.getData('text/plain');
    if (!draggedId) {
      handleDragEnd();
      return;
    }

    const draggedTask = tasks.find((t) => t.id === draggedId);
    if (!draggedTask) {
      handleDragEnd();
      return;
    }

    const targetList = lists.find((l) => l.id === groupKey);

    if (targetList && targetList.id !== draggedTask.listId) {
      // 拖到具体列表上 — 跨列表移动
      moveTask(draggedId, targetList.id, 0);
    } else if (groupKey === 'myDay' || groupKey === 'important' || groupKey === 'all') {
      // 特殊分组视图下拖到空白区域 — 不做跨列表移动，仅提示
      handleDragEnd();
      return;
    } else if (targetList && targetList.id === draggedTask.listId) {
      // 同列表内拖到底部
      const listTasks = tasks
        .filter((t) => t.listId === groupKey && !t.completed)
        .sort((a, b) => a.order - b.order);
      const fromIndex = listTasks.findIndex((t) => t.id === draggedId);
      reorderTasks(fromIndex, listTasks.length, groupKey);
    }

    handleDragEnd();
  };

  /**
   * 单列表视图的容器级拖拽（支持空列表或列表底部 drop）
   */
  const handleDragOverList = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverListElRef.current !== e.currentTarget) {
      clearDragHighlight();
      dragOverListElRef.current = e.currentTarget as HTMLElement;
      dragOverListElRef.current.classList.add('drag-over-list');
    }
  };

  const handleDropOnList = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const draggedId = e.dataTransfer.getData('text/plain');
    if (!draggedId) {
      handleDragEnd();
      return;
    }

    const draggedTask = tasks.find((t) => t.id === draggedId);
    if (!draggedTask) {
      handleDragEnd();
      return;
    }

    // 当前视图是具体列表时，支持从其他列表拖入
    if (activeFilter === 'all' && activeListId && draggedTask.listId !== activeListId) {
      const listTasks = tasks
        .filter((t) => t.listId === activeListId && !t.completed)
        .sort((a, b) => a.order - b.order);
      moveTask(draggedId, activeListId, listTasks.length);
    } else if (activeFilter === 'all' && activeListId && draggedTask.listId === activeListId) {
      // 同列表内拖到底部
      const listTasks = tasks
        .filter((t) => t.listId === activeListId && !t.completed)
        .sort((a, b) => a.order - b.order);
      const fromIndex = listTasks.findIndex((t) => t.id === draggedId);
      reorderTasks(fromIndex, listTasks.length, activeListId);
    }

    handleDragEnd();
  };

  const getListName = () => {
    if (activeFilter === 'myDay') return '我的一天';
    if (activeFilter === 'important') return '重要待办';
    if (activeFilter === 'all' && !activeListId) return '所有待办';
    const list = lists.find((l) => l.id === activeListId);
    return list?.name || '任务';
  };

  const getListColor = () => {
    if (activeFilter === 'myDay') return 'var(--accent-blue)';
    if (activeFilter === 'important') return 'var(--accent-yellow)';
    if (activeFilter === 'all' && !activeListId) return 'var(--text-secondary)';
    const list = lists.find((l) => l.id === activeListId);
    return list?.color || 'var(--accent-blue)';
  };

  const handleToggleMyDay = (id: string) => {
    toggleMyDay(id);
    if (activeFilter === 'myDay') {
      setFilter('all');
    }
  };

  const handleToggleImportant = (id: string) => {
    toggleImportant(id);
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

  /**
   * 移动任务到指定列表
   */
  const handleMoveTask = (taskId: string, targetListId: string) => {
    updateTask(taskId, { listId: targetListId });
    setMoveMenuTaskId(null);
  };

  /**
   * 渲染单个任务行
   */
  const renderTask = (task: (typeof activeTasks)[0], showMoveMenu: boolean = false) => {
    const isDragging = draggedTaskId === task.id;

    return (
      <div
        key={task.id}
        data-task-id={task.id}
        className={`task-item ${isDragging ? 'dragging' : ''}`}
        onDragOver={(e) => handleDragOverTask(e, task.id)}
        onDrop={(e) => handleDropOnTask(e, task.id)}
        onClick={() => setActiveTask(task.id)}
      >
        <div
          className="drag-handle"
          title="拖拽排序"
          draggable={isDragEnabled()}
          onDragStart={(e) => handleDragStart(e, task.id)}
          onDragEnd={handleDragEnd}
        >
          <GripVertical size={14} />
        </div>
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
            <Star size={16} fill={task.important ? 'var(--accent-yellow)' : 'none'} color="var(--accent-yellow)" />
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
              <CalendarClock size={16} />
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
            title={task.myDay ? '从我的一天中移除' : '添加到我的一天'}
          >
            <Sunrise size={16} fill={task.myDay ? 'var(--accent-blue)' : 'none'} color="var(--accent-blue)" />
          </button>
          {showMoveMenu && (
            <div className="move-task-wrapper">
              <button
                className="icon-btn move-task-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setMoveMenuTaskId(moveMenuTaskId === task.id ? null : task.id);
                }}
                title="移动到其他列表"
              >
                <ArrowRightCircle size={16} />
              </button>
              {moveMenuTaskId === task.id && (
                <div className="move-task-menu" onClick={(e) => e.stopPropagation()}>
                  {lists
                    .filter((l) => l.id !== task.listId)
                    .map((list) => (
                      <button
                        key={list.id}
                        onClick={() => handleMoveTask(task.id, list.id)}
                      >
                        <span className="move-list-color" style={{ backgroundColor: list.color }} />
                        {list.name}
                      </button>
                    ))}
                  {lists.filter((l) => l.id !== task.listId).length === 0 && (
                    <span className="move-empty">无其他列表</span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="task-list-container">
      <div className="task-list-header">
        <h2 style={{ color: getListColor() }}>{getListName()}</h2>
        <span className="task-count">{activeTasks.length} 个待办任务</span>
      </div>

      <div
        className="task-list"
        onDragOver={activeFilter === 'all' && activeListId ? handleDragOverList : undefined}
        onDrop={activeFilter === 'all' && activeListId ? handleDropOnList : undefined}
      >
        {/* 按列表分组视图（我的一天 / 重要待办 / 所有待办） */}
        {groupedTasks ? (
          groupedTasks.length > 0 ? (
            groupedTasks.map(([groupName, groupTasks]) => {
              const list = lists.find((l) => l.name === groupName);
              const groupKey = list ? list.id : groupName;
              const isGroupDragOver = dragOverGroupId === groupKey && draggedTaskId !== null;

              return (
                <div
                  key={groupName}
                  className={`task-group ${isGroupDragOver ? 'drag-over-group' : ''}`}
                  onDragOver={(e) => handleDragOverGroup(e, groupKey)}
                  onDrop={(e) => handleDropOnGroup(e, groupKey)}
                >
                  <div className="task-group-header">
                    <span
                      className="task-group-dot"
                      style={{ backgroundColor: list?.color || 'var(--text-muted)' }}
                    />
                    <span className="task-group-name">{groupName}</span>
                    <span className="task-group-count">{groupTasks.length}</span>
                  </div>
                  {groupTasks.map((task) => renderTask(task, true))}
                </div>
              );
            })
          ) : (
            <div className="empty-state">
              <p>暂无任务</p>
            </div>
          )
        ) : (
          /* 单个列表视图（不分组） */
          <>
            {activeTasks.map((task) => renderTask(task))}
            {activeTasks.length === 0 && (
              <div className="empty-state">
                <p>暂无任务</p>
              </div>
            )}
          </>
        )}

        <div className="add-task">
          <button className="task-checkbox" />
          <input
            type="text"
            placeholder="添加待办"
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
            {completedTasks.map((task) => {
              const listInfo = getTaskListInfo(task);
              return (
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
                    <div className="task-meta completed-meta">
                      {/* 待办类型标签 */}
                      <span className="task-list-badge">
                        <span className="list-badge-dot" style={{ backgroundColor: listInfo.color }} />
                        {listInfo.name}
                      </span>
                      {/* 完成时间 */}
                      <span className="completed-at">
                        ✓ {getCompletedAtLabel(task.updatedAt)}
                      </span>
                      {/* 截止日期（如有） */}
                      {task.dueDate && (
                        <span className="task-due-date" style={{ color: getDueDateColor(task.dueDate) }}>
                          截止: {getDueDateLabel(task.dueDate)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
