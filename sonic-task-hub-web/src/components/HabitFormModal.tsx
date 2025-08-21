import React, { useState } from 'react';
import { X, Target, Sparkles } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { 
  Habit, 
  Category, 
  HabitFormData
} from '../types';
import { habitApi, apiHelpers } from '../services/api';
import toast from 'react-hot-toast';

interface HabitFormModalProps {
  userId: number;
  categories: Category[];
  habit?: Habit | null;
  onClose: () => void;
  onSave: () => void;
}

export const HabitFormModal: React.FC<HabitFormModalProps> = ({
  userId,
  categories,
  habit,
  onClose,
  onSave
}) => {
  const [loading, setLoading] = useState(false);
  const isEdit = !!habit;

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<HabitFormData>({
    defaultValues: {
      title: habit?.title || '',
      description: habit?.description || '',
      habitStage: habit?.habitStage || '',
      targetDays: habit?.targetDays || undefined,
      categoryId: habit?.categoryId || undefined
    }
  });

  const onSubmit = async (data: HabitFormData) => {
    try {
      setLoading(true);

      const submitData = {
        ...data,
        categoryId: data.categoryId || null,
        targetDays: data.targetDays || null
      };

      if (isEdit && habit) {
        await habitApi.update(userId, habit.id, submitData);
        toast.success('Habit updated successfully!');
      } else {
        await habitApi.create(userId, submitData);
        toast.success('Habit created successfully!');
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
                <Target className="w-3 h-3 text-white" />
              </div>
              {isEdit ? 'Edit Habit' : 'Create New Habit'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Build consistent practices for personal development
            </p>
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
              Habit Title *
            </label>
            <input
              type="text"
              {...register('title', { required: 'Title is required' })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-colors"
              style={{ '--tw-ring-color': '#483b85' } as React.CSSProperties}
              placeholder="e.g., Read for 30 minutes, Exercise daily"
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
              placeholder="Describe your habit and why it's important to you..."
            />
          </div>

          {/* Stage & Target Days */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Stage
              </label>
              <input
                type="text"
                {...register('habitStage')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-colors"
                style={{ '--tw-ring-color': '#483b85' } as React.CSSProperties}
                placeholder="e.g., Beginner, Intermediate"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Days
              </label>
              <input
                type="number"
                {...register('targetDays')}
                min="1"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-colors"
                style={{ '--tw-ring-color': '#483b85' } as React.CSSProperties}
                placeholder="e.g., 30, 90"
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

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-blue-900 mb-1">Habit Building Tips</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Start small and be consistent</li>
                  <li>• Link new habits to existing routines</li>
                  <li>• Track your progress daily</li>
                  <li>• Celebrate small wins along the way</li>
                </ul>
              </div>
            </div>
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
              {loading ? 'Saving...' : isEdit ? 'Update Habit' : 'Create Habit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};