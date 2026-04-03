import { useStore } from '../store/useStore';
import { Search } from 'lucide-react';

export function SearchBar() {
  const { searchQuery, setSearchQuery } = useStore();

  return (
    <div className="search-bar">
      <Search size={16} />
      <input
        type="text"
        placeholder="搜索"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      {searchQuery && (
        <button className="clear-search" onClick={() => setSearchQuery('')}>
          ×
        </button>
      )}
    </div>
  );
}
