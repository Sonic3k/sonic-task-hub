import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, TrendingUp, Play, Pause, Archive, Trash2, Target } from 'lucide-react';
import { 
  Habit, 
  HabitFilters, 
  HabitStatus, 
  Category,
  PageResponse,
  HABIT_STATUS_COLORS,
  HABIT_ICONS
} from '../types';
import { habitApi, categoryApi, apiHelpers } from '../services/api';
import { HabitFormModal } from '../components/HabitFormModal';
import { HabitProgressModal } from '../components/HabitProgressModal';
import toast from 'react-hot-toast';

interface HabitStudioProps {
  userId: number;
}

export const HabitStudio: React.FC<HabitStudioProps> = ({ userId }) => {
  // State management
  const [habits, setHabits] = useState<Habit[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  const [filters, setFilters] = useState<HabitFilters>({
    page: 0,
    size: 20,
    sortBy: 'createdAt',
    sortDirection: 'desc'
  });

  // Modals
  const [showHabitForm, setShowHabitForm] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [progressHabit, setProgressHabit] = useState<Habit | null>(null);

  // Load data functions
  useEffect(() => {
    loadHabits();
    loadCategories();
  }, [userId, filters]);

  const loadHabits = async () => {
    try {
      setLoading(true);
      const response = await habitApi.getWithFilters(userId, filters);
      
      if (response.data.success && response.data.data) {
        const pageData = response.data.data;
        setHabits(pageData.content);
        setTotalElements(pageData.totalElements);
        setTotalPages(pageData.totalPages);
      }
    } catch (error) {
      toast.error(apiHelpers.handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await categoryApi.getAvailableForUser(userId);
      if (response.data.success && response.data.data) {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  // Filter functions
  const updateFilters = (newFilters: Partial<HabitFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 0 }));
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setFilters(prev => ({ ...prev, page: newPage }));
    }
  };

  // Habit actions
  const handleUpdateStatus = async (habitId: number, status: HabitStatus) => {
    try {
      await habitApi.updateStatus(userId, habitId, status);
      toast.success(`Habit ${status.toLowerCase()}!`);
      loadHabits();
    } catch (error) {
      toast.error(apiHelpers.handleApiError(error));
    }
  };

  const handleDeleteHabit = async (habitId: number) => {
    if (!confirm('Are you sure you want to delete this habit?')) return;
    
    try {
      await habitApi.delete(userId, habitId);
      toast.success('Habit deleted!');
      loadHabits();
    } catch (error) {
      toast.error(apiHelpers.handleApiError(error));
    }
  };

  const handleHabitSaved = () => {
    setShowHabitForm(false);
    setEditingHabit(null);
    loadHabits();
  };

  const handleProgressSaved = () => {
    setShowProgressModal(false);
    setProgressHabit(null);
    loadHabits();
  };

  const getProgressPercentage = (habit: Habit) => {
    if (!habit.targetDays || habit.targetDays === 0) return 0;
    return Math.min((habit.completedDays / habit.targetDays) * 100, 100);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                     style={{ backgroundColor: '#483b85' }}>
                  🎯
                </div>
                Habit Studio
              </h1>
              <p className="text-gray-600 mt-2">Build and track your daily habits</p>
            </div>
            <button
              onClick={() => setShowHabitForm(true)}
              className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#483b85' }}
            >
              <Plus className="w-4 h-4" />
              New Habit
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="Search habits..."
                value={filters.search || ''}
                onChange={(e) => updateFilters({ search: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent bg-white"
                style={{ '--tw-ring-color': '#483b85' } as React.CSSProperties}
              />
            </div>

            <select
              value={filters.status || ''}
              onChange={(e) => updateFilters({ status: e.target.value as HabitStatus || undefined })}
              className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent bg-white text-sm"
              style={{ '--tw-ring-color': '#483b85' } as React.CSSProperties}
            >
              <option value="">All Status</option>
              <option value={HabitStatus.ACTIVE}>🎯 Active</option>
              <option value={HabitStatus.PAUSED}>⏸️ Paused</option>
              <option value={HabitStatus.COMPLETED}>✅ Completed</option>
              <option value={HabitStatus.ARCHIVED}>📦 Archived</option>
            </select>

            <select
              value={filters.categoryId || ''}
              onChange={(e) => updateFilters({ categoryId: e.target.value ? parseInt(e.target.value) : undefined })}
              className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent bg-white text-sm"
              style={{ '--tw-ring-color': '#483b85' } as React.CSSProperties}
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Habits Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {habits.map((habit) => (
                <div key={habit.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <Link
                        to={`/habits/${habit.habitNumber}`}
                        className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                      >
                        #{habit.habitNumber} {habit.title}
                      </Link>
                      {habit.description && (
                        <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                          {habit.description}
                        </p>
                      )}
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${HABIT_STATUS_COLORS[habit.status]}`}>
                      {HABIT_ICONS[habit.status]} {habit.status}
                    </span>
                  </div>

                  {/* Progress */}
                  {habit.targetDays && habit.targetDays > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Progress</span>
                        <span className="text-sm font-medium">
                          {habit.completedDays} / {habit.targetDays} days
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full transition-all"
                          style={{ 
                            width: `${getProgressPercentage(habit)}%`,
                            backgroundColor: '#483b85'
                          }}
                        />
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {Math.round(getProgressPercentage(habit))}% complete
                      </div>
                    </div>
                  )}

                  {/* Stage */}
                  {habit.habitStage && (
                    <div className="mb-4">
                      <span className="text-sm text-gray-600">Stage: </span>
                      <span className="text-sm font-medium">{habit.habitStage}</span>
                    </div>
                  )}

                  {/* Category */}
                  {habit.categoryName && (
                    <div className="mb-4">
                      <span
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white"
                        style={{ backgroundColor: habit.categoryColor }}
                      >
                        {habit.categoryName}
                      </span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                    {habit.status === HabitStatus.ACTIVE && (
                      <>
                        <button
                          onClick={() => {
                            setProgressHabit(habit);
                            setShowProgressModal(true);
                          }}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-white rounded-lg hover:opacity-90 transition-opacity"
                          style={{ backgroundColor: '#483b85' }}
                        >
                          <TrendingUp className="w-4 h-4" />
                          Log Progress
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(habit.id, HabitStatus.PAUSED)}
                          className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                          title="Pause"
                        >
                          <Pause className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    
                    {habit.status === HabitStatus.PAUSED && (
                      <button
                        onClick={() => handleUpdateStatus(habit.id, HabitStatus.ACTIVE)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-green-600 border border-green-600 rounded-lg hover:bg-green-50 transition-colors"
                      >
                        <Play className="w-4 h-4" />
                        Resume
                      </button>
                    )}

                    <button
                      onClick={() => handleUpdateStatus(habit.id, HabitStatus.ARCHIVED)}
                      className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                      title="Archive"
                    >
                      <Archive className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => handleDeleteHabit(habit.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {habits.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 text-4xl mb-4">🎯</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No habits found</h3>
                <p className="text-gray-500 mb-4">Start building your first habit</p>
                <button
                  onClick={() => setShowHabitForm(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: '#483b85' }}
                >
                  <Plus className="w-4 h-4" />
                  Create Habit
                </button>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Showing {habits.length} of {totalElements} habits
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange((filters.page || 0) - 1)}
                    disabled={filters.page === 0}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = Math.max(0, Math.min(totalPages - 5, (filters.page || 0) - 2)) + i;
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-2 text-sm border rounded-md transition-colors ${
                          filters.page === page
                            ? 'text-white border-transparent'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                        style={filters.page === page ? { backgroundColor: '#483b85' } : {}}
                      >
                        {page + 1}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => handlePageChange((filters.page || 0) + 1)}
                    disabled={filters.page === totalPages - 1}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      {showHabitForm && (
        <HabitFormModal
          userId={userId}
          categories={categories}
          habit={editingHabit}
          onClose={() => {
            setShowHabitForm(false);
            setEditingHabit(null);
          }}
          onSave={handleHabitSaved}
        />
      )}

      {showProgressModal && progressHabit && (
        <HabitProgressModal
          userId={userId}
          habit={progressHabit}
          onClose={() => setShowProgressModal(false)}
          onSave={handleProgressSaved}
        />
      )}
    </div>
  );
};