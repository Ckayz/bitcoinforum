'use client';

interface Category {
  id: string;
  name: string;
  description: string;
}

interface CategoryTabsProps {
  categories: Category[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function CategoryTabs({ categories, activeTab, onTabChange }: CategoryTabsProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-8 border-b border-zinc-800">
      <button
        onClick={() => onTabChange('all')}
        className={`px-4 py-2 rounded-t-lg transition-colors ${
          activeTab === 'all'
            ? 'bg-orange-500 text-white border-b-2 border-orange-500'
            : 'text-gray-300 hover:text-white hover:bg-zinc-800'
        }`}
      >
        All Posts
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onTabChange(category.id)}
          className={`px-4 py-2 rounded-t-lg transition-colors ${
            activeTab === category.id
              ? 'bg-orange-500 text-white border-b-2 border-orange-500'
              : 'text-gray-300 hover:text-white hover:bg-zinc-800'
          }`}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}
