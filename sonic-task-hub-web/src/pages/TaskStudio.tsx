import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, ChevronDown, MoreHorizontal, Plus, Check, Clock, Trash2, FileText, GitBranch } from 'lucide-react';
import { 
  Task, 
  TaskFilters, 
  TaskStatus, 
  Priority, 
  Complexity,
  Category,
  PageResponse,
  PRIORITY_COLORS,
  COMPLEXITY_COLORS,
  TASK_STATUS_COLORS,
  TASK_ICONS
} from '../types';
import { taskApi, categoryApi, apiHelpers } from '../services/api';
import { TaskFormModal } from '../components/TaskFormModal';
import { SnoozeModal } from '../components/SnoozeModal';
import toast from 'react-hot-toast';

interface TaskStudioProps {
  userId: number;
}

export const TaskStudio: React.FC<TaskStudioProps> = ({ userId }) => {
  // State management
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedTasks, setSelectedTasks] = useState<Set<number>>(new Set());
  
  const [filters, setFilters] = useState<TaskFilters>({
    page: 0,
    size: 20,
    sortBy: 'createdAt',
    sortDirection: 'desc'
  });

  // Modals
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showSnoozeModal, setShowSnoozeModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [parentTaskForSubtask, setParentTaskForSubtask] = useState<Task | null>(null);

  // Load data functions
  useEffect(() => {
    loadTasks();
    loadCategories();
  }, [userId, filters]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const response = await taskApi.getWithFilters(userId, filters);
      
      if (response.data.success && response.data.data) {
        const pageData = response.data.data;
        setTasks(pageData.content);
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
  const updateFilters = (newFilters: Partial<TaskFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 0 }));
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setFilters(prev => ({ ...prev, page: newPage }));
    }
  };

  // Task actions
  const handleCompleteTask = async (taskId: number) => {
    try {
      await taskApi.complete(userId, taskId);
      toast.success('Task completed!');
      loadTasks();
    } catch (error) {
      toast.error(apiHelpers.handleApiError(error));
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    try {
      await taskApi.delete(userId, taskId);
      toast.success('Task deleted!');
      loadTasks();
    } catch (error) {
      toast.error(apiHelpers.handleApiError(error));
    }
  };

  const handleTaskSaved = () => {
    setShowTaskForm(false);
    setEditingTask(null);
    setParentTaskForSubtask(null);
    loadTasks();
  };

  // Selection functions
  const toggleTaskSelection = (taskId: number) => {
    const newSelected = new Set(selectedTasks);
    if (newSelected.has(taskId)) {
      newSelected.delete(taskId);
    } else {
      newSelected.add(taskId);
    }
    setSelectedTasks(newSelected);
  };

  const toggleAllTasks = () => {
    if (selectedTasks.size === tasks.length) {
      setSelectedTasks(new Set());
    } else {
      setSelectedTasks(new Set(tasks.map(t => t.id)));
    }
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
                  📝
                </div>
                Task Studio
              </h1>
              <p className="text-gray-600 mt-2">Manage your tasks with deadlines and priorities</p>
            </div>
            <button
              onClick={() => setShowTaskForm(true)}
              className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#483b85' }}
            >
              <Plus className="w-4 h-4" />
              New Task
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="Search tasks..."
                value={filters.search || ''}
                onChange={(e) => updateFilters({ search: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent bg-white"
                style={{ '--tw-ring-color': '#483b85' } as React.CSSProperties}
              />
            </div>

            <select
              value={filters.status || ''}
              onChange={(e) => updateFilters({ status: e.target.value as TaskStatus || undefined })}
              className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent bg-white text-sm"
              style={{ '--tw-ring-color': '#483b85' } as React.CSSProperties}
            >
              <option value="">All Status</option>
              <option value={TaskStatus.PENDING}>Pending</option>
              <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
              <option value={TaskStatus.COMPLETED}>Completed</option>
              <option value={TaskStatus.SNOOZED}>Snoozed</option>
            </select>

            <select
              value={filters.priority || ''}
              onChange={(e) => updateFilters({ priority: e.target.value as Priority || undefined })}
              className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent bg-white text-sm"
              style={{ '--tw-ring-color': '#483b85' } as React.CSSProperties}
            >
              <option value="">All Priorities</option>
              <option value={Priority.HIGH}>🔴 High</option>
              <option value={Priority.MEDIUM}>🟡 Medium</option>
              <option value={Priority.LOW}>🔵 Low</option>
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

        {/* Tasks Table */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left">
                        <input
                          type="checkbox"
                          checked={selectedTasks.size === tasks.length && tasks.length > 0}
                          onChange={toggleAllTasks}
                          className="rounded"
                        />
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Task
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Priority
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Due Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tasks.map((task) => (
                      <tr key={task.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedTasks.has(task.id)}
                            onChange={() => toggleTaskSelection(task.id)}
                            className="rounded"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-start gap-3">
                            <div className="flex-1">
                              <Link
                                to={`/tasks/${task.taskNumber}`}
                                className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors"
                              >
                                #{task.taskNumber} {task.title}
                              </Link>
                              {task.description && (
                                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                  {task.description}
                                </p>
                              )}
                              {task.subtaskCount > 0 && (
                                <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                                  <GitBranch className="w-3 h-3" />
                                  {task.completedSubtaskCount}/{task.subtaskCount} subtasks
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${PRIORITY_COLORS[task.priority]}`}>
                            {TASK_ICONS[task.priority]} {task.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${TASK_STATUS_COLORS[task.status]}`}>
                            {task.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {formatDate(task.dueDate)}
                        </td>
                        <td className="px-6 py-4">
                          {task.categoryName && (
                            <span
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white"
                              style={{ backgroundColor: task.categoryColor }}
                            >
                              {task.categoryName}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {task.status !== TaskStatus.COMPLETED && (
                              <button
                                onClick={() => handleCompleteTask(task.id)}
                                className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="Complete"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setEditingTask(task);
                                setShowTaskForm(true);
                              }}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <FileText className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteTask(task.id)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {tasks.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-4xl mb-4">📝</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
                  <p className="text-gray-500 mb-4">Get started by creating your first task</p>
                  <button
                    onClick={() => setShowTaskForm(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: '#483b85' }}
                  >
                    <Plus className="w-4 h-4" />
                    Create Task
                  </button>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Showing {tasks.length} of {totalElements} tasks
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
      {showTaskForm && (
        <TaskFormModal
          userId={userId}
          categories={categories}
          task={editingTask}
          parentTask={parentTaskForSubtask}
          onClose={() => {
            setShowTaskForm(false);
            setEditingTask(null);
            setParentTaskForSubtask(null);
          }}
          onSave={handleTaskSaved}
        />
      )}

      {showSnoozeModal && (
        <SnoozeModal
          onClose={() => setShowSnoozeModal(false)}
          onSnooze={() => {
            setShowSnoozeModal(false);
            loadTasks();
          }}
          itemCount={selectedTasks.size}
        />
      )}
    </div>
  );
};