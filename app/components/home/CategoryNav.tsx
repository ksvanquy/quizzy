'use client';

interface Category {
  _id: string;
  name: string;
  slug: string;
  parentId: string | null;
  displayOrder: number;
  isActive: boolean;
  quizCount?: number;
  icon?: string;
}

interface CategoryNavProps {
  parentCategories: Category[];
  selectedParentId: string | null;
  selectedCategoryId: string | null;
  childCategories: Category[];
  onParentSelect: (parentId: string | null) => void;
  onChildSelect: (childId: string | null) => void;
  onShowAll: () => void;
  totalQuizCount: number;
}

export function CategoryNav({
  parentCategories,
  selectedParentId,
  selectedCategoryId,
  childCategories,
  onParentSelect,
  onChildSelect,
  onShowAll,
  totalQuizCount,
}: CategoryNavProps) {
  // Debug log
  console.log('CategoryNav - Parent Categories:', parentCategories);
  console.log('CategoryNav - Child Categories:', childCategories);
  
  return (
    <>
      {/* Parent Categories - Horizontal Scroll */}
      <div className="border-t bg-gradient-to-r from-indigo-50 to-purple-50">
        <div className="container mx-auto px-4">
          <div className="flex gap-3 overflow-x-auto py-4 scrollbar-hide">
            {/* Tất cả button */}
            <button
              key="all-categories"
              onClick={onShowAll}
              className={`flex items-center gap-2 px-6 py-3 rounded-full whitespace-nowrap transition font-medium flex-shrink-0 ${
                selectedParentId === null
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-indigo-50 border border-gray-200'
              }`}
            >
              <span className="text-xl">🎯</span>
              <span>Tất cả</span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  selectedParentId === null
                    ? 'bg-indigo-500'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {totalQuizCount}
              </span>
            </button>

            {/* Parent Categories */}
            {parentCategories.map((cat, index) => (
              <button
                key={cat._id || `parent-${index}`}
                onClick={() => {
                  onParentSelect(cat._id);
                  onChildSelect(null);
                }}
                className={`flex items-center gap-2 px-6 py-3 rounded-full whitespace-nowrap transition font-medium flex-shrink-0 ${
                  selectedParentId === cat._id
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-indigo-50 border border-gray-200'
                }`}
              >
                <span className="text-xl">{cat.icon || '📚'}</span>
                <span>{cat.name}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    selectedParentId === cat._id
                      ? 'bg-indigo-500'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {cat.quizCount || 0}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sub Categories - Horizontal Scroll */}
      {childCategories.length > 0 && (
        <div className="border-t bg-white">
          <div className="container mx-auto px-4">
            <div className="flex gap-2 overflow-x-auto py-3 scrollbar-hide">
              <button
                key="all-children"
                onClick={() => onChildSelect(null)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition text-sm font-medium flex-shrink-0 ${
                  selectedCategoryId === null
                    ? 'bg-indigo-100 text-indigo-700 border-2 border-indigo-300'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Tất cả
              </button>

              {childCategories.map((cat, index) => (
                <button
                  key={cat._id || `child-${index}`}
                  onClick={() => onChildSelect(cat._id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition text-sm font-medium flex-shrink-0 ${
                    selectedCategoryId === cat._id
                      ? 'bg-indigo-100 text-indigo-700 border-2 border-indigo-300'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <span>{cat.icon || '📖'}</span>
                  <span>{cat.name}</span>
                  <span className="bg-white px-1.5 py-0.5 rounded text-xs font-semibold">
                    {cat.quizCount || 0}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

