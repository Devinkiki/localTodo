import { useState } from 'react';
import { useStore } from '../store/useStore';
import { X, Calendar, Tag, Trash2, Star } from 'lucide-react';

export function TaskDetail() {
  const { tasks, activeTaskId, setActiveTask, updateTask, deleteTask, toggleImportant } = useStore();
  const [newTag, setNewTag] = useState('');

  const task = tasks.find((t) => t.id === activeTaskId);

  if (!task) {
    return (
      <div className="task-detail empty">
        <p>选择一个任务查看详情</p>
      </div>
    );
  }

  const handleAddTag = () => {
    if (newTag.trim() && !task.tags.includes(newTag.trim())) {
      updateTask(task.id, { tags: [...task.tags, newTag.trim()] });
      setNewTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    updateTask(task.id, { tags: task.tags.filter((t) => t !== tag) });
  };

  return (
    <div className="task-detail">
      <div className="detail-header">
        <button className="icon-btn" onClick={() => setActiveTask(null)} title="关闭详情">
          <X size={18} />
        </button>
      </div>

      <div className="detail-content">
        <input
          className="detail-title-input"
          type="text"
          value={task.title}
          onChange={(e) => updateTask(task.id, { title: e.target.value })}
        />

        <div className="detail-section">
          <label>备注</label>
          <textarea
            placeholder="添加备注"
            value={task.notes}
            onChange={(e) => updateTask(task.id, { notes: e.target.value })}
            rows={4}
          />
        </div>

        <div className="detail-section">
          <label>
            <Calendar size={16} />
            截止日期
          </label>
          <input
            type="date"
            value={task.dueDate ? task.dueDate.split('T')[0] : ''}
            onChange={(e) => updateTask(task.id, { dueDate: e.target.value ? new Date(e.target.value).toISOString() : null })}
          />
          {task.dueDate && (
            <button
              className="btn-link"
              onClick={() => updateTask(task.id, { dueDate: null })}
            >
              清除日期
            </button>
          )}
        </div>

        <div className="detail-section">
          <label>
            <Star size={16} />
            重要
          </label>
          <button
            className={`toggle-btn ${task.important ? 'on' : 'off'}`}
            onClick={() => toggleImportant(task.id)}
          >
            {task.important ? '已标记重要' : '标记为重要'}
          </button>
        </div>

        <div className="detail-section">
          <label>
            <Tag size={16} />
            标签
          </label>
          <div className="tags-container">
            {task.tags.map((tag) => (
              <span key={tag} className="tag">
                {tag}
                <button onClick={() => handleRemoveTag(tag)}>
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
          <div className="add-tag-row">
            <input
              type="text"
              placeholder="添加标签"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
            />
            <button className="btn-small" onClick={handleAddTag}>
              添加
            </button>
          </div>
        </div>

        <div className="detail-section danger">
          <button className="btn-danger" onClick={() => deleteTask(task.id)}>
            <Trash2 size={16} />
            删除任务
          </button>
        </div>
      </div>
    </div>
  );
}
