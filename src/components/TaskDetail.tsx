import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { X, Calendar, Tag, Trash2, Star, Edit3, Plus } from 'lucide-react';
import MDEditor from '@uiw/react-md-editor';

export function TaskDetail() {
  const { tasks, activeTaskId, setActiveTask, updateTask, deleteTask, toggleImportant, theme } = useStore();
  const [newTag, setNewTag] = useState('');
  const [showNotesEditor, setShowNotesEditor] = useState(false);
  const [draftNotes, setDraftNotes] = useState('');

  const task = tasks.find((t) => t.id === activeTaskId);

  const effectiveTheme = theme === 'system'
    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : theme;

  // 打开编辑器时初始化草稿
  useEffect(() => {
    if (showNotesEditor) {
      setDraftNotes(task?.notes || '');
    }
  }, [showNotesEditor, task?.notes]);

  // 键盘快捷键：Ctrl+Enter 保存，Esc 取消
  useEffect(() => {
    if (!showNotesEditor) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowNotesEditor(false);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        handleSaveNotes();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showNotesEditor, draftNotes]);

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

  const handleOpenNotesEditor = () => {
    setShowNotesEditor(true);
  };

  const handleSaveNotes = () => {
    updateTask(task.id, { notes: draftNotes });
    setShowNotesEditor(false);
  };

  const handleCancelNotes = () => {
    setShowNotesEditor(false);
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

        {/* 备注区域：默认预览 + 编辑按钮 */}
        <div className="detail-section notes-section">
          <div className="notes-header">
            <label>
              <Edit3 size={16} />
              备注
            </label>
            <button
              className="notes-edit-btn"
              onClick={handleOpenNotesEditor}
              title="编辑备注"
            >
              {task.notes ? (
                <>
                  <Edit3 size={12} /> 编辑
                </>
              ) : (
                <>
                  <Plus size={12} /> 添加备注
                </>
              )}
            </button>
          </div>

          {task.notes ? (
            <div className="notes-preview" data-color-mode={effectiveTheme}>
              <MDEditor.Markdown source={task.notes} />
            </div>
          ) : (
            <div className="notes-empty" onClick={handleOpenNotesEditor}>
              <span>添加备注（支持 Markdown）</span>
            </div>
          )}
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

      {/* 备注编辑弹窗 */}
      {showNotesEditor && (
        <div className="notes-modal-backdrop" onClick={handleCancelNotes}>
          <div
            className="notes-modal"
            data-color-mode={effectiveTheme}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="notes-modal-header">
              <h3>编辑备注</h3>
              <div className="notes-modal-actions">
                <span className="notes-modal-hint">Ctrl+Enter 保存</span>
                <button className="notes-modal-btn cancel" onClick={handleCancelNotes}>
                  取消
                </button>
                <button className="notes-modal-btn save" onClick={handleSaveNotes}>
                  保存
                </button>
              </div>
            </div>

            <div className="notes-modal-body">
              <MDEditor
                value={draftNotes}
                onChange={(value) => setDraftNotes(value || '')}
                preview="live"
                height={380}
                hideToolbar={false}
                visibleDragbar={false}
                textareaProps={{
                  placeholder: '输入 Markdown 内容...',
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
