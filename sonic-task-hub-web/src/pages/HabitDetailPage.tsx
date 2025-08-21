import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, Edit2, Trash2, Target, TrendingUp, 
  Play, Pause, Archive, Calendar, Tag, Hash
} from 'lucide-react';
import { 
  Habit, 
  Category,
  HabitProgress,
  HabitStatus,
  HABIT_STATUS_COLORS,
  HABIT_ICONS
} from '../types';
import { habitApi, categoryApi, habitProgressApi, apiHelpers } from '../services/api';
import { HabitFormModal } from '../components/HabitFormModal';
import { HabitProgressModal } from '../components/HabitProgressModal';
import toast from 'react-hot-toast';

interface HabitDetailPageProps {
  userId: number;
}

export const HabitDetailPage: React.FC<HabitDetailPageProps> = ({ userId }) => {
  const { habitNumber } = useParams<{ habitNumber: string }>();
  const navigate = useNavigate();
  
  const [habit, setHabit] = useState<Habit | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [progressHistory, setProgressHistory] = useState<HabitProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);

  useEffect(() => {
    if (habitNumber) {
      loadHabit();
      loadCategories();
    }
  }, [habitNumber, userId]);

  const loadHabit = async () => {
    try {
      setLoading(true);
      const response = await habitApi.getByNumber(userId, parseInt(habitNumber!));
      
      if (response.data.success && response.data.data) {
        setHabit(response.data.data);
        loadProgressHistory(response.data.data.id);
      }
    } catch (error) {
      toast.error('Habit not found');
      navigate('/habits');
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

  const loadProgressHistory = async (habitId: number) => {
    try {
      const response = await habitProgressApi.getForHabit(userId, habitId);
      if (response.data.success && response.data.data) {
        setProgressHistory(response.data.data);
      }
    } catch (error) {
      console.error('Failed to load progress history:', error);
    }
  };

  const handleUpdateStatus = async (status: HabitStatus) => {
    if (!habit) return;
    
    try {
      await habitApi.updateStatus(userId, habit.id, status);
      toast.success(`Habit ${status.toLowerCase()}!`);
      loadHabit();
    } catch (error) {
      toast.error(apiHelpers.handleApiError(error));
    }
  };

  const handleDelete = async () => {
    if (!habit || !confirm('Are you sure you want to delete this habit?')) return;
    
    try {
      await habitApi.delete(userId, habit.id);
      toast.success('Habit deleted!');
      navigate('/habits');
    } catch (error) {
      toast.error(apiHelpers.handleApiError(error));
    }
  };

  const handleHabitSaved = () => {
    setShowEditModal(false);
    loadHabit();
  };

  const handleProgressSaved = () => {
    setShowProgressModal(false);
    loadHabit();
    if (habit) loadProgressHistory(habit.id);
  };

  const getProgressPercentage = () => {
    if (!habit || !habit.targetDays || habit.targetDays === 0) return 0;
    return Math.min((habit.completedDays / habit.targetDays) * 100, 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!habit) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Habit not found</h2>
          <Link to="/habits" className="text-blue-600 hover:text-blue-700">
            ← Back to Habits
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              to="/habits"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">🎯</span>
                <h1 className="text-2xl font-bold text-gray-900">
                  #{habit.habitNumber} {habit.title}
                </h1>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${HABIT_STATUS_COLORS[habit.status]}`}>
                  {HABIT_ICONS[habit.status]} {habit.status}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {habit.status === HabitStatus.ACTIVE && (
                <>
                  <button
                    onClick={() => setShowProgressModal(true)}
                    className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: '#483b85' }}
                  >
                    <TrendingUp className="w-4 h-4" />
                    Log Progress
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(HabitStatus.PAUSED)}
                    className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                    title="Pause"
                  >
                    <Pause className="w-4 h-4" />
                  </button>
                </>
              )}
              
              {habit.status === HabitStatus.PAUSED && (
                <button
                  onClick={() => handleUpdateStatus(HabitStatus.ACTIVE)}
                  className="flex items-center gap-2 px-4 py-2 text-green-600 border border-green-600 rounded-lg hover:bg-green-50 transition-colors"
                >
                  <Play className="w-4 h-4" />
                  Resume
                </button>
              )}

              <button
                onClick={() => setShowEditModal(true)}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleUpdateStatus(HabitStatus.ARCHIVED)}
                className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                title="Archive"
              >
                <Archive className="w-4 h-4" />
              </button>
              <button
                onClick={handleDelete}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            {habit.description && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Description
                </h2>
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">{habit.description}</p>
                </div>
              </div>
            )}

            {/* Progress History */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-gray-400" />
                Progress History
              </h2>
              
              {progressHistory.length > 0 ? (
                <div className="space-y-3">
                  {progressHistory.slice(0, 10).map((progress) => (
                    <div key={progress.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {formatDate(progress.sessionDate)}
                          </p>
                          {progress.notes && (
                            <p className="text-xs text-gray-500 mt-1">{progress.notes}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        {progress.duration && (
                          <p className="text-sm text-gray-600">{progress.duration} min</p>
                        )}
                        {progress.progressValue && (
                          <p className="text-xs text-gray-500">
                            {progress.progressValue} {progress.progressUnit}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-sm mb-4">No progress logged yet</p>
                  {habit.status === HabitStatus.ACTIVE && (
                    <button
                      onClick={() => setShowProgressModal(true)}
                      className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      Log your first session
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Progress Overview */}
            {habit.targetDays && habit.targetDays > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-gray-400" />
                  Progress Overview
                </h2>
                
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Progress</span>
                    <span className="text-sm font-medium">
                      {habit.completedDays} / {habit.targetDays} days
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="h-3 rounded-full transition-all"
                      style={{ 
                        width: `${getProgressPercentage()}%`,
                        backgroundColor: '#483b85'
                      }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {Math.round(getProgressPercentage())}% complete
                  </div>
                </div>
              </div>
            )}

            {/* Habit Details */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Hash className="w-5 h-5 text-gray-400" />
                Habit Details
              </h2>
              
              <div className="space-y-4">
                {habit.habitStage && (
                  <div>
                    <label className="text-sm text-gray-600">Current Stage</label>
                    <div className="mt-1 text-sm font-medium text-gray-900">
                      {habit.habitStage}
                    </div>
                  </div>
                )}

                {habit.targetDays && (
                  <div>
                    <label className="text-sm text-gray-600">Target Days</label>
                    <div className="mt-1 text-sm text-gray-900">
                      {habit.targetDays} days
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-sm text-gray-600">Sessions Logged</label>
                  <div className="mt-1 text-sm text-gray-900">
                    {habit.completedDays} sessions
                  </div>
                </div>

                {habit.categoryName && (
                  <div>
                    <label className="text-sm text-gray-600">Category</label>
                    <div className="mt-1">
                      <span
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white"
                        style={{ backgroundColor: habit.categoryColor }}
                      >
                        <Tag className="w-3 h-3 mr-1" />
                        {habit.categoryName}
                      </span>
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-sm text-gray-600">Created</label>
                  <div className="mt-1 text-sm text-gray-900">
                    {formatDate(habit.createdAt)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showEditModal && (
        <HabitFormModal
          userId={userId}
          categories={categories}
          habit={habit}
          onClose={() => setShowEditModal(false)}
          onSave={handleHabitSaved}
        />
      )}

      {showProgressModal && (
        <HabitProgressModal
          userId={userId}
          habit={habit}
          onClose={() => setShowProgressModal(false)}
          onSave={handleProgressSaved}
        />
      )}
    </div>
  );
};