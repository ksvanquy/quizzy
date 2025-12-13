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

interface CategoryTree {
  parent: Category;
  children: Category[];
}

export default function QuizzesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [filteredQuizzes, setFilteredQuizzes] = useState<any[]>([]);

  // Flatten categories into tree structure
  const categoryTree = useMemo(() => {
    const parents = categories.filter(cat => cat.parentId === null);
    return parents.map(parent => ({
      parent,
      children: categories.filter(cat => cat.parentId === parent._id)
    }));
  }, [categories]);

  const parentCategories = useMemo(() => 
    categoryTree.map(tree => tree.parent), 
    [categoryTree]
  );

  const childCategories = useMemo(() => {
    if (!selectedParentId) return [];
    const tree = categoryTree.find(t => t.parent._id === selectedParentId);
    return tree ? tree.children : [];
  }, [categoryTree, selectedParentId]);

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

  // Debug log
  console.log('Category Tree:', categoryTree);
  console.log('Selected Parent ID:', selectedParentId);
  console.log('Child Categories:', childCategories);

  // Get child IDs for filtering
  const childIds = selectedParentId ? childCategories.map(c => c._id) : [];

  // Filter quizzes based on selected category
  useEffect(() => {
    let result = quizzes;
    if (selectedChildId) {
      result = quizzes.filter(q => {
        const catId = typeof q.categoryId === 'string' ? q.categoryId : q.categoryId?._id;
        return catId === selectedChildId;
      });
    } else if (selectedParentId && childIds.length > 0) {
      // Show quizzes from all children of selected parent
      result = quizzes.filter(q => {
        const catId = typeof q.categoryId === 'string' ? q.categoryId : q.categoryId?._id;
        return childIds.includes(catId);
      });
    }
    setFilteredQuizzes(result);
  }, [quizzes, selectedParentId, selectedChildId, childIds]);

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
      
      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6 text-sm">
          <Link href="/" className="text-indigo-600 hover:text-indigo-700">
            Trang chủ
          </Link>
          <span className="mx-2 text-gray-500">/</span>
          <span className="text-gray-600">Bài thi</span>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          📋 Danh sách bài thi
        </h1>

      {/* Category Navigation */}
        <CategoryNav 
          parentCategories={parentCategories}
          selectedParentId={selectedParentId}
          selectedCategoryId={selectedChildId}
          childCategories={childCategories}
          onParentSelect={handleParentSelect}
          onChildSelect={handleChildSelect}
          onShowAll={handleShowAll}
          totalQuizCount={quizzes.length}
        />

        {/* Quiz Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Đang tải...</p>
          </div>
        ) : filteredQuizzes.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center border border-gray-200">
            <p className="text-gray-600 text-lg">Không có bài thi nào</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQuizzes.map((quiz, index) => {
              // Ensure unique key: use _id if available and unique, fallback to slug or index
              const key = quiz._id || quiz.slug || `quiz-${index}`;
              return <QuizCard key={key} quiz={quiz} />;
            })}
          </div>
        )}
      </main>
    </div>
  );
}
