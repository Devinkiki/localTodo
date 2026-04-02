import { useState, useRef } from 'react';
import { Upload, X, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import {
  validateJsonData,
  validateXlsData,
  normalizeXlsRecord,
  type ImportData,
} from '../utils/importValidator';

/**
 * ImportButton 组件
 * 支持 JSON / XLS 格式导入数据，含字段校验和错误提示
 */
export function ImportButton() {
  const [showModal, setShowModal] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * 读取 JSON 文件并校验
   */
  const handleJsonImport = async (file: File) => {
    try {
      const text = await file.text();
      const raw = JSON.parse(text);
      const result = validateJsonData(raw);

      if (!result.valid) {
        setErrors(result.errors);
        return false;
      }

      // 写入 store
      applyImport(raw as ImportData);
      return true;
    } catch {
      setErrors(['文件解析失败：请确认是有效的 JSON 文件']);
      return false;
    }
  };

  /**
   * 读取 XLS 文件并校验
   */
  const handleXlsImport = async (file: File) => {
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });

      // 检查是否存在 required sheets
      const sheetNames = workbook.SheetNames;
      const missingSheets: string[] = [];
      if (!sheetNames.includes('tasks')) missingSheets.push('"tasks"');
      if (!sheetNames.includes('lists')) missingSheets.push('"lists"');

      if (missingSheets.length > 0) {
        setErrors([`缺少工作表：${missingSheets.join('、')}`]);
        return false;
      }

      // 解析 sheets 为 JSON
      const rawTasks = XLSX.utils.sheet_to_json(workbook.Sheets['tasks'], { defval: '' });
      const rawLists = XLSX.utils.sheet_to_json(workbook.Sheets['lists'], { defval: '' });

      // 规范化 XLS 数据（类型转换）
      const taskFields = ['id', 'title', 'notes', 'completed', 'important', 'myDay', 'dueDate', 'listId', 'tags', 'createdAt', 'updatedAt'];
      const listFields = ['id', 'name', 'color', 'createdAt'];

      const normalizedTasks = rawTasks.map((record) =>
        normalizeXlsRecord(record as Record<string, unknown>, taskFields)
      );
      const normalizedLists = rawLists.map((record) =>
        normalizeXlsRecord(record as Record<string, unknown>, listFields)
      );

      const data = { tasks: normalizedTasks, lists: normalizedLists };
      const result = validateXlsData(data);

      if (!result.valid) {
        setErrors(result.errors);
        return false;
      }

      applyImport(data as unknown as ImportData);
      return true;
    } catch {
      setErrors(['文件解析失败：请确认是有效的 Excel 文件（.xlsx）']);
      return false;
    }
  };

  /**
   * 将导入的数据写入 store 并保存
   */
  const applyImport = (data: ImportData) => {
    // 通过 Zustand store 批量更新
    // 注意：这里直接操作 localStorage 来替换数据，然后刷新状态
    const STORAGE_KEY = 'local-todo-data';
    const importPayload = {
      tasks: data.tasks,
      lists: data.lists,
      lastVisit: new Date().toISOString().split('T')[0],
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(importPayload));

    // 触发页面刷新以重新加载状态
    window.location.reload();
  };

  /**
   * 文件选择处理
   */
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrors([]);
    setImporting(true);

    const ext = file.name.split('.').pop()?.toLowerCase();
    let success = false;

    if (ext === 'json') {
      success = await handleJsonImport(file);
    } else if (ext === 'xlsx' || ext === 'xls') {
      success = await handleXlsImport(file);
    } else {
      setErrors(['不支持的文件格式：请选择 .json 或 .xlsx 文件']);
    }

    setImporting(false);

    if (success) {
      setShowModal(false);
    }

    // 重置 input 以允许重复选择同一文件
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <button
        className="import-btn"
        onClick={() => {
          setShowModal(true);
          setErrors([]);
        }}
        title="导入数据"
      >
        <Upload size={16} />
        <span>导入数据</span>
      </button>

      {showModal && (
        <div className="import-modal">
          <div className="import-modal-content">
            <div className="import-modal-header">
              <h3>导入数据</h3>
              <button className="icon-btn" onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="import-modal-body">
              <p className="import-hint">
                选择之前导出的 JSON 或 XLSX 文件进行导入。
                <br />
                <strong>注意：</strong>导入将覆盖当前所有数据。
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept=".json,.xlsx,.xls"
                onChange={handleFileSelect}
                disabled={importing}
                className="import-file-input"
              />

              {importing && (
                <div className="import-loading">正在处理文件，请稍候...</div>
              )}

              {/* 错误提示 */}
              {errors.length > 0 && (
                <div className="import-errors">
                  <div className="import-errors-header">
                    <AlertCircle size={16} />
                    <span>校验失败，无法导入</span>
                  </div>
                  <ul>
                    {errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
