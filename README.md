# Local Todo

轻量级本地 Todo 应用，灵感来自 Microsoft Todo。基于 React + TypeScript + Vite 构建，数据通过 localStorage 持久化，无需后端。

![License](https://img.shields.io/badge/license-MIT-blue.svg)

## 功能特性

- **多列表管理** — 创建、切换、删除自定义列表（默认含"任务"和"会议"列表）
- **我的一天 (My Day)** — 每日自动重置，专注当天任务
- **重要标记** — 星标重要任务
- **截止日期** — 快捷设置（今天/明天/下周）或自定义日期选择
- **标签系统** — 为任务添加自定义标签
- **搜索过滤** — 实时搜索任务标题、备注和标签
- **任务详情面板** — 侧滑面板编辑备注、日期、标签等
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
    ├── App.tsx               # 根组件（三栏布局）
    ├── App.css               # 根组件样式（已清理）
    ├── index.css             # 全局样式
    ├── types/
    │   └── index.ts          # TypeScript 类型定义
    ├── store/
    │   └── useStore.ts       # Zustand 状态管理 + localStorage
    └── components/
        ├── Sidebar.tsx       # 侧边栏（导航、列表管理、导入导出）
        ├── TaskList.tsx      # 任务列表（增删改查、过滤）
        ├── TaskDetail.tsx    # 任务详情面板
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
