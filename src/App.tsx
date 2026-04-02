import { Sidebar } from './components/Sidebar';
import { TaskList } from './components/TaskList';
import { TaskDetail } from './components/TaskDetail';
import { SearchBar } from './components/SearchBar';
import { useStore } from './store/useStore';

function App() {
  const { activeTaskId } = useStore();

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
