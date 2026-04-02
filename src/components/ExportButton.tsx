import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Download, ChevronDown } from 'lucide-react';
import * as XLSX from 'xlsx';

export type ExportFormat = 'json' | 'xls';

/**
 * ExportButton 组件
 * 支持 JSON / XLS 两种格式导出数据
 */
export function ExportButton() {
  const { tasks, lists } = useStore();
  const [showMenu, setShowMenu] = useState(false);

  /**
   * 构建导出数据（与 localStorage 结构一致）
   */
  const getExportData = () => ({
    tasks,
    lists,
    exportedAt: new Date().toISOString(),
  });

  /**
   * 导出为 JSON 文件
   */
  const exportJson = () => {
    const data = getExportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    downloadBlob(blob, `local-todo-backup-${getDateStr()}.json`);
    setShowMenu(false);
  };

  /**
   * 导出为 XLS 文件（两个工作表：tasks 和 lists）
   */
  const exportXls = () => {
    const wb = XLSX.utils.book_new();

    // tasks 工作表
    const tasksWs = XLSX.utils.json_to_sheet(tasks);
    XLSX.utils.book_append_sheet(wb, tasksWs, 'tasks');

    // lists 工作表
    const listsWs = XLSX.utils.json_to_sheet(lists);
    XLSX.utils.book_append_sheet(wb, listsWs, 'lists');

    const blob = new Blob([XLSX.write(wb, { bookType: 'xlsx', type: 'array' })], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    downloadBlob(blob, `local-todo-backup-${getDateStr()}.xlsx`);
    setShowMenu(false);
  };

  /**
   * 触发浏览器下载
   */
  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getDateStr = () => new Date().toISOString().split('T')[0];

  return (
    <div className="export-wrapper">
      <button
        className="export-btn"
        onClick={() => setShowMenu(!showMenu)}
        title="导出数据"
      >
        <Download size={16} />
        <span>导出数据</span>
        <ChevronDown size={14} className="export-chevron" />
      </button>

      {showMenu && (
        <>
          {/* 点击遮罩关闭 */}
          <div className="export-menu-backdrop" onClick={() => setShowMenu(false)} />
          <div className="export-menu">
            <button onClick={exportJson}>JSON 格式</button>
            <button onClick={exportXls}>XLS 格式</button>
          </div>
        </>
      )}
    </div>
  );
}
