import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Tag, Sparkles } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { 
  Task, 
  Category, 
  TaskFormData, 
  Priority, 
  Complexity,
  TASK_ICONS,
  PRIORITY_COLORS,
  COMPLEXITY_COLORS
} from '../types';
import { taskApi, apiHelpers } from '../services/api';
import toast from 'react-hot-toast';

interface TaskFormModalProps {
  userId: number;
  categories: Category[];
  task?: Task | null;
  parentTask?: Task | null;
  onClose: () => void;
  onSave: () => void;
}

export const TaskFormModal: React.FC<TaskFormModalProps> = ({
  userId,
  categories,
  task,
  parentTask,
  onClose,
  onSave
}) => {
  const [loading, setLoading] = useState(false);
  const isEdit = !!task;
  const isSubtask = !!parentTask;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<TaskFormData>({
    defaultValues: {
      title: task?.title || '',
      description: task?.description || '',
      priority: task?.priority || Priority.MEDIUM,
      complexity: task?.complexity || Complexity.MEDIUM,
      dueDate: task?.dueDate ? task.dueDate.split('T')[0] : '',
      categoryId: task?.categoryId || parentTask?.categoryId || undefined,
      parentTaskId: parentTask?.id || task?.parentTaskId || undefined,
      estimatedDuration: task?.estimatedDuration || undefined
    }
  });

  useEffect(() => {
    if (parentTask) {
      setValue('parentTaskId', parentTask.id);
      setValue('categoryId', parentTask.categoryId);
    }
  }, [parentTask, setValue]);

  const onSubmit = async (data: TaskFormData) => {
    try {
      setLoading(true);

      let dueDate = null;
      if (data.dueDate && data.dueDate.trim() !== '') {
        try {
          const dateObj = new Date(data.dueDate + 'T23:59:59');
          dueDate = dateObj.toISOString();
        } catch (error) {
          console.error('Date conversion error:', error);
          dueDate = null;
        }
      }

      const submitData = {
        ...data,
        dueDate: dueDate,
        categoryId: data.categoryId || null,
        parentTaskId: data.parentTaskId || null,
        estimatedDuration: data.estimatedDuration || null
      };

      if (isEdit && task) {
        await taskApi.update(userId, task.id, submitData);
        toast.success('Task updated successfully!');
      } else {
        await taskApi.create(userId, submitData);
        toast.success(`${isSubtask ? 'Subtask' : 'Task'} created successfully!`);
      }

      onSave();
    } catch (error) {
      toast.error(apiHelpers.handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center"
                   style={{ backgroundColor: '#483b85' }}>
                <Sparkles className="w-3 h-3 text-white" />
              </div>
              {isEdit ? 'Edit Task' : isSubtask ? 'Add Subtask' : 'Add New Task'}
            </h2>
            {isSubtask && parentTask && (
              <p className="text-sm text-gray-600 mt-1">
                Subtask of: <span className="font-medium">{parentTask.title}</span>
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              {...register('title', { required: 'Title is required' })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-colors"
              style={{ '--tw-ring-color': '#483b85' } as React.CSSProperties}
              placeholder="What needs to be done?"
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-colors"
              style={{ '--tw-ring-color': '#483b85' } as React.CSSProperties}
              placeholder="Add more details..."
            />
          </div>

          {/* Priority & Complexity */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                {...register('priority', { required: 'Priority is required' })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-colors"
                style={{ '--tw-ring-color': '#483b85' } as React.CSSProperties}
              >
                <option value={Priority.LOW}>🔵 Low</option>
                <option value={Priority.MEDIUM}>🟡 Medium</option>
                <option value={Priority.HIGH}>🔴 High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Complexity
              </label>
              <select
                {...register('complexity', { required: 'Complexity is required' })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-colors"
                style={{ '--tw-ring-color': '#483b85' } as React.CSSProperties}
              >
                <option value={Complexity.EASY}>⚡ Easy</option>
                <option value={Complexity.MEDIUM}>📝 Medium</option>
                <option value={Complexity.HARD}>💻 Hard</option>
              </select>
            </div>
          </div>

          {/* Due Date & Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date
              </label>
              <input
                type="date"
                {...register('dueDate')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-colors"
                style={{ '--tw-ring-color': '#483b85' } as React.CSSProperties}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estimated Duration (minutes)
              </label>
              <input
                type="number"
                {...register('estimatedDuration')}
                min="1"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-colors"
                style={{ '--tw-ring-color': '#483b85' } as React.CSSProperties}
                placeholder="e.g., 60"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              {...register('categoryId')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-colors"
              style={{ '--tw-ring-color': '#483b85' } as React.CSSProperties}
            >
              <option value="">Select a category</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              style={{ backgroundColor: '#483b85' }}
            >
              {loading ? 'Saving...' : isEdit ? 'Update Task' : isSubtask ? 'Add Subtask' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};