# Local Todo

轻量级本地化 Todo 应用，融合微软 Todo 的任务管理与语雀的轻量笔记能力。基于 React + TypeScript + Vite 构建，数据通过 localStorage 持久化，无需后端。

> **产品定位**：微软Todo（任务管理）+ 语雀轻量版（Markdown 笔记）+ 本地优先（隐私安全）

![License](https://img.shields.io/badge/license-MIT-blue.svg)

## 功能特性

### 任务管理

- **多列表管理** — 创建、切换、删除自定义列表（默认含"任务"和"会议"列表）
- **我的一天 (My Day)** — 每日自动重置，专注当天任务
- **重要标记** — 星标重要任务
- **截止日期** — 快捷设置（今天/明天/下周）或自定义日期选择
- **标签系统** — 为任务添加自定义标签
- **搜索过滤** — 实时搜索任务标题、备注和标签
- **拖拽排序** — 支持组内排序和跨列表移动任务
- **已完成复盘** — 已完成任务展示完成时间和所属列表

### 笔记能力

- **Markdown 备注** — 任务备注支持完整 Markdown 语法（标题、列表、代码块、表格、链接等）
- **弹窗编辑器** — 点击备注弹出完整编辑器，支持工具栏快捷插入和实时预览
- **代码高亮** — 代码块自动语法高亮
- **暗色主题适配** — Markdown 编辑器自动跟随系统主题

### 主题与体验

- **暗色主题** — 支持浅色 / 暗色 / 跟随系统三种模式，Sidebar 底部一键切换
- **气泡动画** — 侧边栏导航项切换时带弹性缓动的气泡展开效果
- **三栏布局** — 侧边栏 + 任务列表 + 详情面板，响应式交互

### 数据安全

- **数据持久化** — 所有数据自动保存到 localStorage，刷新不丢失
- **数据导入导出** — 支持 JSON / XLS 格式导出备份，导入时自动校验数据完整性

## 技术栈

| 技术 | 用途 |
|------|------|
| React 19 | UI 框架 |
| TypeScript | 类型安全 |
| Vite | 构建工具 |
| Zustand | 状态管理 |
| date-fns | 日期处理 |
| lucide-react | 图标库 |
| @uiw/react-md-editor | Markdown 编辑器 |
| react-syntax-highlighter | 代码块语法高亮 |
| xlsx (SheetJS) | Excel 导入导出 |

## 快速开始

### 环境要求

- Node.js 18+
- npm / yarn / pnpm

### 安装与运行

```bash
# 安装依赖
npm install

# 启动开发服务器 (http://localhost:5173)
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

## 项目结构

```
local-todo/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── eslint.config.js
└── src/
    ├── main.tsx              # 应用入口
    ├── App.tsx               # 根组件（三栏布局 + 内容动画）
    ├── index.css             # 全局样式（含暗色主题变量）
    ├── types/
    │   └── index.ts          # TypeScript 类型定义
    ├── store/
    │   └── useStore.ts       # Zustand 状态管理 + localStorage + 主题
    └── components/
        ├── Sidebar.tsx       # 侧边栏（导航、列表管理、主题切换、导入导出）
        ├── TaskList.tsx      # 任务列表（增删改查、过滤、拖拽排序）
        ├── TaskDetail.tsx    # 任务详情面板（含 Markdown 备注弹窗编辑器）
        ├── SearchBar.tsx     # 搜索栏
        ├── ExportButton.tsx  # 数据导出（JSON / XLS）
        └── ImportButton.tsx  # 数据导入（含校验）
    └── utils/
        └── importValidator.ts  # 导入数据校验工具
```

## 数据存储

所有数据存储在浏览器 `localStorage` 中，key 为 `local-todo-data`，结构如下：

```json
{
  "tasks": [],
  "lists": [],
  "lastVisit": "2026-04-02"
}
```

主题设置存储在独立的 key `local-todo-theme` 中，值为 `"light"` | `"dark"` | `"system"`。

> **注意**：清除浏览器数据会丢失所有任务。建议通过侧边栏的「导出数据」功能定期备份（支持 JSON / XLS 格式），需要恢复时使用「导入数据」功能。

## 开发

```bash
# 类型检查
npx tsc --noEmit

# Lint
npm run lint
```

## License

MIT
