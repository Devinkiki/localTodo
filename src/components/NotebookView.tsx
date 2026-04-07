import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import MDEditor from '@uiw/react-md-editor';

/**
 * 记事本视图组件
 * 左侧：笔记本列表 + 新建按钮
 * 右侧：Markdown 编辑器（支持实时预览）
 */
export function NotebookView() {
  const { notebooks, activeNotebookId, addNotebook, updateNotebook, deleteNotebook, setActiveNotebook, setFilter, theme } = useStore();
  const [draftContent, setDraftContent] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [showNewInput, setShowNewInput] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  // 当前选中的笔记本
  const activeNotebook = notebooks.find((n) => n.id === activeNotebookId);

  // 切换笔记本时同步草稿内容
  useEffect(() => {
    if (activeNotebook) {
      setDraftContent(activeNotebook.content);
    } else {
      setDraftContent('');
    }
  }, [activeNotebookId, activeNotebook?.content]);

  // 计算 MDEditor 主题模式
  const effectiveTheme = theme === 'system'
    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : theme;

  // 切换笔记本时同步内容
  const handleSelectNotebook = (id: string) => {
    const nb = notebooks.find((n) => n.id === id);
    if (nb) {
      setDraftContent(nb.content);
      setActiveNotebook(id);
    }
  };

  // 保存 Markdown 内容
  const handleSaveContent = (value?: string) => {
    if (activeNotebookId && value !== undefined) {
      updateNotebook(activeNotebookId, { content: value });
      setDraftContent(value);
    }
  };

  // 新建笔记本
  const handleAddNotebook = () => {
    if (newTitle.trim()) {
      addNotebook(newTitle.trim());
      setNewTitle('');
      setShowNewInput(false);
    }
  };

  // 开始编辑标题
  const startEditTitle = (nb: typeof activeNotebook) => {
    if (nb) {
      setEditingId(nb.id);
      setEditTitle(nb.title);
    }
  };

  // 保存标题
  const saveTitle = () => {
    if (editingId && editTitle.trim()) {
      updateNotebook(editingId, { title: editTitle.trim() });
      setEditingId(null);
      setEditTitle('');
    }
  };

  // 返回全部待办
  const handleBackToAll = () => {
    setFilter('all');
  };

  return (
    <div className="notebook-view">
      {/* 左侧笔记本列表 */}
      <div className="notebook-sidebar">
        <div className="notebook-sidebar-header">
          <button className="notebook-back-btn" onClick={handleBackToAll} title="返回全部待办">
            ← 全部待办
          </button>
        </div>

        <div className="notebook-list">
          {notebooks.length === 0 ? (
            <div className="notebook-empty">
              <p>暂无记事本</p>
              <span>点击下方 + 创建你的第一个记事本</span>
            </div>
          ) : (
            notebooks.map((nb) => (
              <div
                key={nb.id}
                className={`notebook-item ${activeNotebookId === nb.id ? 'active' : ''}`}
                onClick={() => handleSelectNotebook(nb.id)}
              >
                {editingId === nb.id ? (
                  <div className="notebook-edit-mode" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveTitle();
                        if (e.key === 'Escape') {
                          setEditingId(null);
                          setEditTitle('');
                        }
                      }}
                      autoFocus
                      className="notebook-edit-input"
                    />
                    <button className="notebook-edit-confirm" onClick={saveTitle} title="保存">
                      <Check size={14} />
                    </button>
                    <button
                      className="notebook-edit-cancel"
                      onClick={() => {
                        setEditingId(null);
                        setEditTitle('');
                      }}
                      title="取消"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="notebook-title">{nb.title}</span>
                    <div className="notebook-actions" onClick={(e) => e.stopPropagation()}>
                      <button
                        className="notebook-action-btn"
                        onClick={() => startEditTitle(nb)}
                        title="重命名"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        className="notebook-action-btn notebook-delete"
                        onClick={() => deleteNotebook(nb.id)}
                        title="删除"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>

        {/* 新建笔记本 */}
        {showNewInput ? (
          <div className="notebook-new-input">
            <input
              type="text"
              placeholder="记事本名称"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddNotebook();
                if (e.key === 'Escape') {
                  setShowNewInput(false);
                  setNewTitle('');
                }
              }}
              autoFocus
            />
            <div className="notebook-new-actions">
              <button
                className="notebook-confirm-btn"
                onClick={handleAddNotebook}
              >
                创建
              </button>
              <button
                className="notebook-cancel-btn"
                onClick={() => {
                  setShowNewInput(false);
                  setNewTitle('');
                }}
              >
                取消
              </button>
            </div>
          </div>
        ) : (
          <button
            className="notebook-add-btn"
            onClick={() => setShowNewInput(true)}
          >
            <Plus size={16} />
            <span>新建记事本</span>
          </button>
        )}
      </div>

      {/* 右侧编辑器 */}
      <div className="notebook-editor">
        {activeNotebook ? (
          <>
            <div className="notebook-editor-header">
              <h3 className="notebook-editor-title">{activeNotebook.title}</h3>
              <span className="notebook-editor-updated">
                更新于 {new Date(activeNotebook.updatedAt).toLocaleString('zh-CN', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            <div data-color-mode={effectiveTheme} className="notebook-md-editor">
              <MDEditor
                value={draftContent}
                onChange={handleSaveContent}
                preview="live"
                height="calc(100vh - 180px)"
              />
            </div>
          </>
        ) : (
          <div className="notebook-editor-empty">
            <p>选择一个记事本开始编辑</p>
            <span>或创建新的记事本</span>
          </div>
        )}
      </div>
    </div>
  );
}
