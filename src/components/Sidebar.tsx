import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Plus, Star, Calendar, CheckCheck, Trash2 } from 'lucide-react';
import { ExportButton } from './ExportButton';
import { ImportButton } from './ImportButton';

const LIST_COLORS = ['#4C8AFF', '#FF6B6B', '#51CF66', '#FFD43B', '#CC5DE8', '#FF922B', '#20C997'];

export function Sidebar() {
  const { lists, activeListId, activeFilter, addList, deleteList, setActiveList, setFilter } = useStore();
  const [showAddList, setShowAddList] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListColor, setNewListColor] = useState(LIST_COLORS[0]);

  const handleAddList = () => {
    if (newListName.trim()) {
      addList(newListName.trim(), newListColor);
      setNewListName('');
      setShowAddList(false);
    }
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>Local Todo</h2>
        <div className="header-actions">
          <ExportButton />
          <ImportButton />
        </div>
      </div>

      <div className="sidebar-nav">
        <button
          className={`nav-item ${activeFilter === 'myDay' ? 'active' : ''}`}
          onClick={() => setFilter('myDay')}
        >
          <Calendar size={18} />
          <span>我的一天</span>
        </button>
        <button
          className={`nav-item ${activeFilter === 'important' ? 'active' : ''}`}
          onClick={() => setFilter('important')}
        >
          <Star size={18} />
          <span>重要待办</span>
        </button>
        <button
          className={`nav-item ${activeFilter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          <CheckCheck size={18} />
          <span>所有待办</span>
        </button>
      </div>

      <div className="sidebar-divider" />

      <div className="sidebar-section">
        <div className="section-header">
          <h3>待办类型</h3>
          <button className="icon-btn" onClick={() => setShowAddList(true)} title="添加待办类型">
            <Plus size={16} />
          </button>
        </div>

        <div className="list-items">
          {lists.map((list) => (
            <div
              key={list.id}
              className={`list-item-wrapper ${activeListId === list.id && activeFilter === 'all' ? 'active' : ''}`}
            >
              <button
                className="list-item"
                onClick={() => setActiveList(list.id)}
              >
                <span className="list-color" style={{ backgroundColor: list.color }} />
                <span className="list-name">{list.name}</span>
              </button>
              <button
                className="list-delete-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteList(list.id);
                }}
                title="删除列表"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {showAddList && (
        <div className="add-list-modal">
          <div className="add-list-content">
            <h3>新建待办类型</h3>
            <input
              type="text"
              placeholder="待办类型名称"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddList()}
              autoFocus
            />
            <div className="color-picker">
              {LIST_COLORS.map((color) => (
                <button
                  key={color}
                  className={`color-dot ${newListColor === color ? 'selected' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setNewListColor(color)}
                />
              ))}
            </div>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowAddList(false)}>
                取消
              </button>
              <button className="btn-confirm" onClick={handleAddList}>
                创建
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
