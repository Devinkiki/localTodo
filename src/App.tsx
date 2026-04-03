import { useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { TaskList } from './components/TaskList';
import { TaskDetail } from './components/TaskDetail';
import { SearchBar } from './components/SearchBar';
import { useStore } from './store/useStore';

function App() {
  const { activeTaskId, theme, setTheme } = useStore();

  // 监听系统主题变化
  useEffect(() => {
    if (theme !== 'system') return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      // 仅更新 DOM，不触发 state 变化（避免无限循环）
      const effective = mediaQuery.matches ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', effective);
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, setTheme]);

  return (
    <div className="app">
      <Sidebar />
      <div className="main-content">
        <SearchBar />
        <TaskList />
      </div>
      {activeTaskId && <TaskDetail />}
    </div>
  );
}

export default App;
