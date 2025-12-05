'use client';

import { useEffect, useState } from 'react';
import { Header } from './components/home/Header';
import { CategoryNav } from './components/home/CategoryNav';
import { QuizCard } from './components/home/QuizCard';

interface Category {
  _id: string;
  name: string;
  slug: string;
  parentId: number | null;
  displayOrder: number;
  isActive: boolean;
  quizCount?: number;
  icon?: string;
}

export default function HomePage() {
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const categoriesRes = await fetch('/api/categories');
        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json();
          setAllCategories(categoriesData.data || []);
        }

        const quizzesRes = await fetch('/api/quizzes');
        if (quizzesRes.ok) {
          const quizzesData = await quizzesRes.json();
          setQuizzes(quizzesData.data?.quizzes || quizzesData.data || []);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Separate parent and child categories
  const parentCategories = allCategories.filter(cat => cat.parentId === null);
  const childCategories = selectedParentId
    ? allCategories.filter(cat => {
        const parentCat = allCategories.find(p => p._id === selectedParentId);
        return parentCat && cat.parentId === parentCat.displayOrder;
      })
    : [];

  // Get child IDs for filtering
  const childIds = selectedParentId ? childCategories.map(c => c._id) : [];

  // Filter quizzes based on selected category
  let filteredQuizzes = quizzes;
  if (selectedChildId) {
    filteredQuizzes = quizzes.filter(q => {
      const catId = typeof q.category === 'string' ? q.category : q.category?._id;
      return catId === selectedChildId;
    });
  } else if (selectedParentId && childIds.length > 0) {
    // Show quizzes from all children of selected parent
    filteredQuizzes = quizzes.filter(q => {
      const catId = typeof q.category === 'string' ? q.category : q.category?._id;
      return childIds.includes(catId);
    });
  }

  const handleParentSelect = (parentId: string | null) => {
    setSelectedParentId(parentId);
    setSelectedChildId(null);
  };

  const handleChildSelect = (childId: string | null) => {
    setSelectedChildId(childId);
  };

  const handleShowAll = () => {
    setSelectedParentId(null);
    setSelectedChildId(null);
  };

  const totalQuizCount = quizzes.length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Category Navigation */}
      <CategoryNav
        parentCategories={parentCategories}
        selectedParentId={selectedParentId}
        selectedCategoryId={selectedChildId}
        childCategories={childCategories}
        onParentSelect={handleParentSelect}
        onChildSelect={handleChildSelect}
        onShowAll={handleShowAll}
        totalQuizCount={totalQuizCount}
      />

      {/* Main Content - Quiz Cards Grid */}
      <div className="container mx-auto px-4 py-6">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">Đang tải bài thi...</p>
          </div>
        ) : filteredQuizzes.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <p className="text-gray-600 text-lg">Chưa có bài thi nào trong danh mục này</p>
          </div>
        ) : (
          <>
            <div className="mb-4 text-sm text-gray-600">
              Hiển thị <span className="font-semibold">{filteredQuizzes.length}</span> bài thi
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
              {filteredQuizzes.map(quiz => (
                <QuizCard key={quiz._id} quiz={quiz} />
              ))}
            </div>
          </>
        )}
      </div>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
