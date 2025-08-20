import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, Edit2, Trash2, Clock, Calendar, Tag, User, 
  CheckCircle, GitBranch, TrendingUp, FileText, Plus,
  Sparkles, Target, Hash
} from 'lucide-react';
import { 
  Item, 
  Category,
  ItemType,
  ItemStatus,
  Priority,
  Complexity,
  PRIORITY_COLORS,
  COMPLEXITY_COLORS,
  STATUS_COLORS,
  TYPE_ICONS
} from '../types';
import { itemApi, categoryApi, progressApi, apiHelpers } from '../services/api';
import { ItemFormModal } from '../components/ItemFormModal';
import { ProgressModal } from '../components/ProgressModal';
import toast from 'react-hot-toast';

interface ItemDetailPageProps {
  userId: number;
}

export const ItemDetailPage: React.FC<ItemDetailPageProps> = ({ userId }) => {
  const { itemNumber } = useParams<{ itemNumber: string }>();
  const navigate = useNavigate();
  
  const [item, setItem] = useState<Item | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [progressHistory, setProgressHistory] = useState<any[]>([]);

  useEffect(() => {
    if (itemNumber) {
      loadItem();
      loadCategories();
    }
  }, [itemNumber, userId]);

  const loadItem = async () => {
    try {
      setLoading(true);
      const response = await itemApi.getByNumber(userId, parseInt(itemNumber!));
      
      if (response.data.success && response.data.data) {
        setItem(response.data.data);
        
        // Load progress history for habits
        if (response.data.data.type === ItemType.HABIT) {
          loadProgressHistory(response.data.data.id);
        }
      }
    } catch (error) {
      toast.error('Item not found');
      navigate('/studio');
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

  const loadProgressHistory = async (itemId: number) => {
    try {
      const response = await progressApi.getForItem(userId, itemId);
      if (response.data.success && response.data.data) {
        setProgressHistory(response.data.data);
      }
    } catch (error) {
      console.error('Failed to load progress history:', error);
    }
  };

  const handleComplete = async () => {
    if (!item) return;
    
    try {
      await itemApi.complete(userId, item.id);
      toast.success('Item completed!');
      loadItem();
    } catch (error) {
      toast.error(apiHelpers.handleApiError(error));
    }
  };

  const handleDelete = async () => {
    if (!item) return;
    
    if (confirm('Are you sure you want to delete this item?')) {
      try {
        await itemApi.delete(userId, item.id);
        toast.success('Item deleted!');
        navigate('/studio');
      } catch (error) {
        toast.error(apiHelpers.handleApiError(error));
      }
    }
  };

  const handleUpdateStatus = async (newStatus: ItemStatus) => {
    if (!item) return;
    
    try {
      await itemApi.updateStatus(userId, item.id, newStatus);
      toast.success('Status updated!');
      loadItem();
    } catch (error) {
      toast.error(apiHelpers.handleApiError(error));
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2"
             style={{ borderBottomColor: '#483b85' }}></div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">Item not found</h2>
        <Link to="/studio" className="text-blue-600 hover:underline mt-4 inline-block">
          Back to Studio
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/studio')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              
              <div className="flex items-center gap-3">
                <span className="text-2xl">{TYPE_ICONS[item.type]}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">#{item.itemNumber}</span>
                    <h1 className="text-xl font-semibold text-gray-900">{item.title}</h1>
                  </div>
                  <div className="flex items-center gap-4 mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[item.status]}`}>
                      {item.status.replace('_', ' ').toLowerCase()}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${PRIORITY_COLORS[item.priority]}`}>
                      {item.priority.toLowerCase()}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${COMPLEXITY_COLORS[item.complexity]}`}>
                      {item.complexity.toLowerCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {item.status !== ItemStatus.COMPLETED && (
                <button
                  onClick={handleComplete}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                >
                  <CheckCircle className="w-4 h-4 inline mr-2" />
                  Complete
                </button>
              )}
              
              {item.type === ItemType.HABIT && (
                <button
                  onClick={() => setShowProgressModal(true)}
                  className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
                  style={{ backgroundColor: '#483b85' }}
                >
                  <TrendingUp className="w-4 h-4 inline mr-2" />
                  Log Progress
                </button>
              )}
              
              <button
                onClick={() => setShowEditModal(true)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                <Edit2 className="w-4 h-4 inline mr-2" />
                Edit
              </button>
              
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
              >
                <Trash2 className="w-4 h-4 inline mr-2" />
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-400" />
                Description
              </h2>
              <div className="text-gray-700 whitespace-pre-wrap">
                {item.description || 'No description provided'}
              </div>
            </div>

            {/* Habit Progress */}
            {item.type === ItemType.HABIT && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-gray-400" />
                  Habit Progress
                </h2>
                
                {item.habitStage && (
                  <div className="mb-4">
                    <span className="text-sm text-gray-600">Current Stage: </span>
                    <span className="font-medium">{item.habitStage}</span>
                  </div>
                )}
                
                {item.habitTargetDays && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Progress</span>
                      <span className="text-sm font-medium">
                        {item.habitCompletedDays || 0} / {item.habitTargetDays} days
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all"
                        style={{ 
                          width: `${((item.habitCompletedDays || 0) / item.habitTargetDays) * 100}%`,
                          backgroundColor: '#483b85'
                        }}
                      />
                    </div>
                  </div>
                )}

                {progressHistory.length > 0 ? (
                  <div className="space-y-2 mt-4">
                    <h3 className="text-sm font-medium text-gray-700">Recent Sessions</h3>
                    {progressHistory.slice(0, 5).map((progress: any) => (
                      <div key={progress.id} className="flex items-center justify-between py-2 border-b border-gray-100">
                        <div>
                          <div className="text-sm text-gray-900">
                            {new Date(progress.sessionDate).toLocaleDateString()}
                          </div>
                          {progress.notes && (
                            <div className="text-xs text-gray-600">{progress.notes}</div>
                          )}
                        </div>
                        <div className="text-sm text-gray-600">
                          {progress.duration && `${progress.duration} min`}
                          {progress.progressValue && ` • ${progress.progressValue} ${progress.progressUnit || ''}`}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No progress logged yet</p>
                )}
              </div>
            )}

            {/* Subtasks */}
            {item.subtasks && item.subtasks.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <GitBranch className="w-5 h-5 text-gray-400" />
                  Subtasks ({item.completedSubtaskCount}/{item.subtaskCount})
                </h2>
                <div className="space-y-2">
                  {item.subtasks.map((subtask) => (
                    <Link
                      key={subtask.id}
                      to={`/studio/item/${subtask.itemNumber}`}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={subtask.status === ItemStatus.COMPLETED}
                          readOnly
                          className="rounded border-gray-300"
                        />
                        <span className={subtask.status === ItemStatus.COMPLETED ? 'line-through text-gray-500' : ''}>
                          #{subtask.itemNumber} - {subtask.title}
                        </span>
                      </div>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[subtask.status]}`}>
                        {subtask.status.toLowerCase()}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Details */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Details</h2>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-600 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Created by
                  </span>
                  <p className="font-medium">{item.userDisplayName}</p>
                </div>
                
                {item.categoryName && (
                  <div>
                    <span className="text-sm text-gray-600 flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      Category
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.categoryColor || '#6B7280' }}
                      />
                      <span className="font-medium">{item.categoryName}</span>
                    </div>
                  </div>
                )}
                
                {item.dueDate && (
                  <div>
                    <span className="text-sm text-gray-600 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Due Date
                    </span>
                    <p className="font-medium">{formatDate(item.dueDate)}</p>
                  </div>
                )}
                
                {item.estimatedDuration && (
                  <div>
                    <span className="text-sm text-gray-600 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Estimated Duration
                    </span>
                    <p className="font-medium">{item.estimatedDuration} minutes</p>
                  </div>
                )}
                
                {item.actualDuration && (
                  <div>
                    <span className="text-sm text-gray-600 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Actual Duration
                    </span>
                    <p className="font-medium">{item.actualDuration} minutes</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <select
                  value={item.status}
                  onChange={(e) => handleUpdateStatus(e.target.value as ItemStatus)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent text-sm"
                  style={{ '--tw-ring-color': '#483b85' } as React.CSSProperties}
                >
                  {Object.values(ItemStatus).map(status => (
                    <option key={status} value={status}>
                      {status.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Timestamps */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-600">Created</span>
                  <p className="font-medium">{formatDate(item.createdAt)}</p>
                </div>
                <div>
                  <span className="text-gray-600">Last Updated</span>
                  <p className="font-medium">{formatDate(item.updatedAt)}</p>
                </div>
                {item.completedAt && (
                  <div>
                    <span className="text-gray-600">Completed</span>
                    <p className="font-medium">{formatDate(item.completedAt)}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showEditModal && (
        <ItemFormModal
          userId={userId}
          categories={categories}
          item={item}
          onClose={() => setShowEditModal(false)}
          onSave={() => {
            setShowEditModal(false);
            loadItem();
          }}
        />
      )}

      {showProgressModal && (
        <ProgressModal
          userId={userId}
          item={item}
          onClose={() => setShowProgressModal(false)}
          onSave={() => {
            setShowProgressModal(false);
            loadItem();
            loadProgressHistory(item.id);
          }}
        />
      )}
    </div>
  );
};