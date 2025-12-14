'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { Header } from '@/app/components/home/Header';
import { CategoryNav } from '@/app/components/home/CategoryNav';
import { QuizCard } from '@/app/components/home/QuizCard';

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

export default function QuizzesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Calculate quiz count for each category
  const categoriesWithCount = categories.map(cat => {
    let count = 0;
    
    if (cat.parentId === null) {
      // For parent categories, count quizzes from all child categories
      const childCats = categories.filter(c => c.parentId === cat._id);
      if (childCats.length > 0) {
        const childIds = childCats.map(c => c._id);
        count = quizzes.filter(q => {
          const qCatId = q.categoryId || (typeof q.category === 'string' ? q.category : q.category?._id);
          return childIds.includes(qCatId);
        }).length;
      } else {
        // Parent without children - count directly
        count = quizzes.filter(q => {
          const qCatId = q.categoryId || (typeof q.category === 'string' ? q.category : q.category?._id);
          return qCatId === cat._id;
        }).length;
      }
    } else {
      // For child categories, count directly
      count = quizzes.filter(q => {
        const qCatId = q.categoryId || (typeof q.category === 'string' ? q.category : q.category?._id);
        return qCatId === cat._id;
      }).length;
    }
    
    return { ...cat, quizCount: count };
  });

  // Get child categories when parent is selected
  const childCategories = selectedParentId
    ? categoriesWithCount.filter(cat => cat.parentId === selectedParentId)
    : [];

  useEffect(() => {
    async function fetchData() {
      try {
        const catsRes = await fetch('/api/categories?limit=100');
        if (catsRes.ok) {
          const catsData = await catsRes.json();
          // API returns { success, data: { items, total, page, limit } }
        const cats = catsData.data?.items || catsData.data || [];
        setCategories(Array.isArray(cats) ? cats : []);
        }

        const quizzesRes = await fetch('/api/quizzes');
        if (quizzesRes.ok) {
          const quizzesData = await quizzesRes.json();
          // API returns { success, data: { items, total, page, limit } } or { success, data: [...] }
          let quizList = [];
          if (quizzesData.data?.items) {
            quizList = quizzesData.data.items;
          } else if (Array.isArray(quizzesData.data)) {
            quizList = quizzesData.data;
          } else if (quizzesData.data?.quizzes) {
            quizList = quizzesData.data.quizzes;
          }
          setQuizzes(Array.isArray(quizList) ? quizList : []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Filter quizzes based on selected category
  let filteredQuizzes = quizzes;
  if (selectedChildId) {
    // Filter by specific child category
    filteredQuizzes = quizzes.filter(q => {
      const catId = q.categoryId || (typeof q.category === 'string' ? q.category : q.category?._id);
      return catId === selectedChildId;
    });
  } else if (selectedParentId) {
    // Filter by parent category - include all children
    const parentCat = categories.find(p => p._id === selectedParentId);
    
    if (parentCat) {
      const childCats = categories.filter(cat => cat.parentId === parentCat._id);
      
      if (childCats.length > 0) {
        const childIds = childCats.map(c => c._id);
        filteredQuizzes = quizzes.filter(q => {
          const catId = q.categoryId || (typeof q.category === 'string' ? q.category : q.category?._id);
          return childIds.includes(catId);
        });
      } else {
        filteredQuizzes = quizzes.filter(q => {
          const catId = q.categoryId || (typeof q.category === 'string' ? q.category : q.category?._id);
          return catId === selectedParentId;
        });
      }
    }
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Category Navigation */}
      <CategoryNav 
        parentCategories={categoriesWithCount.filter(cat => cat.parentId === null)}
        selectedParentId={selectedParentId}
        selectedCategoryId={selectedChildId}
        childCategories={childCategories}
        onParentSelect={handleParentSelect}
        onChildSelect={handleChildSelect}
        onShowAll={handleShowAll}
        totalQuizCount={quizzes.length}
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
              {filteredQuizzes.map((quiz, index) => {
                const key = quiz._id || quiz.slug || `quiz-${index}`;
                return <QuizCard key={key} quiz={quiz} />;
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
