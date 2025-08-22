import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, Edit2, Trash2, Clock, Calendar, Tag, User, 
  CheckCircle, GitBranch, FileText, Plus, Target, Hash
} from 'lucide-react';
import { 
  Task, 
  Category,
  TaskStatus,
  Priority,
  Complexity,
  PRIORITY_COLORS,
  COMPLEXITY_COLORS,
  TASK_STATUS_COLORS,
  TASK_ICONS
} from '../types';
import { taskApi, categoryApi, apiHelpers } from '../services/api';
import { TaskFormModal } from '../components/TaskFormModal';
import toast from 'react-hot-toast';

interface TaskDetailPageProps {
  userId: number;
}

export const TaskDetailPage: React.FC<TaskDetailPageProps> = ({ userId }) => {
  const { taskNumber } = useParams<{ taskNumber: string }>();
  const navigate = useNavigate();
  
  const [task, setTask] = useState<Task | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    if (taskNumber) {
      loadTask();
      loadCategories();
    }
  }, [taskNumber, userId]);

  const loadTask = async () => {
    try {
      setLoading(true);
      const response = await taskApi.getByNumber(userId, parseInt(taskNumber!));
      
      if (response.data.success && response.data.data) {
        setTask(response.data.data);
      }
    } catch (error) {
      toast.error('Task not found');
      navigate('/tasks');
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

  const handleComplete = async () => {
    if (!task) return;
    
    try {
      await taskApi.complete(userId, task.id);
      toast.success('Task completed!');
      loadTask();
    } catch (error) {
      toast.error(apiHelpers.handleApiError(error));
    }
  };

  const handleDelete = async () => {
    if (!task || !confirm('Are you sure you want to delete this task?')) return;
    
    try {
      await taskApi.delete(userId, task.id);
      toast.success('Task deleted!');
      navigate('/tasks');
    } catch (error) {
      toast.error(apiHelpers.handleApiError(error));
    }
  };

  const handleTaskSaved = () => {
    setShowEditModal(false);
    loadTask();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return '-';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Task not found</h2>
          <Link to="/tasks" className="text-blue-600 hover:text-blue-700">
            ← Back to Tasks
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              to="/tasks"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">📝</span>
                <h1 className="text-2xl font-bold text-gray-900">
                  #{task.taskNumber} {task.title}
                </h1>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${TASK_STATUS_COLORS[task.status]}`}>
                  {task.status.replace('_', ' ')}
                </span>
              </div>
              {task.parentTaskTitle && (
                <p className="text-sm text-gray-600">
                  Subtask of: <span className="font-medium">{task.parentTaskTitle}</span>
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {task.status !== TaskStatus.COMPLETED && (
                <button
                  onClick={handleComplete}
                  className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: '#483b85' }}
                >
                  <CheckCircle className="w-4 h-4" />
                  Complete
                </button>
              )}
              <button
                onClick={() => setShowEditModal(true)}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Edit2 className="w-4 h-4" />
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
            {task.description && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-gray-400" />
                  Description
                </h2>
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">{task.description}</p>
                </div>
              </div>
            )}

            {/* Subtasks */}
            {task.subtaskCount > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <GitBranch className="w-5 h-5 text-gray-400" />
                  Subtasks ({task.completedSubtaskCount}/{task.subtaskCount})
                </h2>
                {task.subtasks && task.subtasks.length > 0 ? (
                  <div className="space-y-3">
                    {task.subtasks.map((subtask) => (
                      <div key={subtask.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className={`w-4 h-4 rounded-full ${
                          subtask.status === TaskStatus.COMPLETED ? 'bg-green-500' : 'bg-gray-300'
                        }`}></div>
                        <div className="flex-1">
                          <Link
                            to={`/tasks/${subtask.taskNumber}`}
                            className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors"
                          >
                            #{subtask.taskNumber} {subtask.title}
                          </Link>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${PRIORITY_COLORS[subtask.priority]}`}>
                              {TASK_ICONS[subtask.priority]} {subtask.priority}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No subtasks found</p>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Task Details */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Hash className="w-5 h-5 text-gray-400" />
                Task Details
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-600">Priority</label>
                  <div className="mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${PRIORITY_COLORS[task.priority]}`}>
                      {TASK_ICONS[task.priority]} {task.priority}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-600">Complexity</label>
                  <div className="mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${COMPLEXITY_COLORS[task.complexity]}`}>
                      {task.complexity}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-600">Due Date</label>
                  <div className="mt-1 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-900">{formatDate(task.dueDate)}</span>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-600">Estimated Duration</label>
                  <div className="mt-1 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-900">{formatDuration(task.estimatedDuration)}</span>
                  </div>
                </div>

                {task.actualDuration && (
                  <div>
                    <label className="text-sm text-gray-600">Actual Duration</label>
                    <div className="mt-1 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900">{formatDuration(task.actualDuration)}</span>
                    </div>
                  </div>
                )}

                {task.categoryName && (
                  <div>
                    <label className="text-sm text-gray-600">Category</label>
                    <div className="mt-1">
                      <span
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white"
                        style={{ backgroundColor: task.categoryColor }}
                      >
                        <Tag className="w-3 h-3 mr-1" />
                        {task.categoryName}
                      </span>
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-sm text-gray-600">Created</label>
                  <div className="mt-1 text-sm text-gray-900">
                    {formatDate(task.createdAt)}
                  </div>
                </div>

                {task.completedAt && (
                  <div>
                    <label className="text-sm text-gray-600">Completed</label>
                    <div className="mt-1 text-sm text-gray-900">
                      {formatDate(task.completedAt)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <TaskFormModal
          userId={userId}
          categories={categories}
          task={task}
          onClose={() => setShowEditModal(false)}
          onSave={handleTaskSaved}
        />
      )}
    </div>
  );
};