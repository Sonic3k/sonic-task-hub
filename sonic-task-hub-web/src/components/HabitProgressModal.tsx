import React, { useState } from 'react';
import { X, TrendingUp, Calendar } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { 
  Habit, 
  HabitProgressFormData
} from '../types';
import { habitProgressApi, apiHelpers } from '../services/api';
import toast from 'react-hot-toast';

interface HabitProgressModalProps {
  userId: number;
  habit: Habit;
  onClose: () => void;
  onSave: () => void;
}

export const HabitProgressModal: React.FC<HabitProgressModalProps> = ({
  userId,
  habit,
  onClose,
  onSave
}) => {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<HabitProgressFormData>({
    defaultValues: {
      sessionDate: new Date().toISOString().split('T')[0],
      duration: undefined,
      notes: '',
      progressValue: undefined,
      progressUnit: ''
    }
  });

  const onSubmit = async (data: HabitProgressFormData) => {
    try {
      setLoading(true);

      const submitData = {
        sessionDate: data.sessionDate,
        duration: data.duration || null,
        notes: data.notes || null,
        progressValue: data.progressValue || null,
        progressUnit: data.progressUnit || null
      };

      await habitProgressApi.log(userId, habit.id, submitData);
      toast.success('Progress logged successfully!');
      onSave();
    } catch (error) {
      toast.error(apiHelpers.handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center"
                   style={{ backgroundColor: '#483b85' }}>
                <TrendingUp className="w-3 h-3 text-white" />
              </div>
              Log Progress
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {habit.title}
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
          {/* Session Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Session Date *
            </label>
            <input
              type="date"
              {...register('sessionDate', { required: 'Session date is required' })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-colors"
              style={{ '--tw-ring-color': '#483b85' } as React.CSSProperties}
            />
            {errors.sessionDate && (
              <p className="text-red-500 text-sm mt-1">{errors.sessionDate.message}</p>
            )}
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration (minutes)
            </label>
            <input
              type="number"
              {...register('duration')}
              min="1"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-colors"
              style={{ '--tw-ring-color': '#483b85' } as React.CSSProperties}
              placeholder="e.g., 30"
            />
          </div>

          {/* Progress Value & Unit */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Progress Value
              </label>
              <input
                type="number"
                step="0.1"
                {...register('progressValue')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-colors"
                style={{ '--tw-ring-color': '#483b85' } as React.CSSProperties}
                placeholder="e.g., 5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unit
              </label>
              <input
                type="text"
                {...register('progressUnit')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-colors"
                style={{ '--tw-ring-color': '#483b85' } as React.CSSProperties}
                placeholder="e.g., km, pages, reps"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              {...register('notes')}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-colors"
              style={{ '--tw-ring-color': '#483b85' } as React.CSSProperties}
              placeholder="How did it go? Any observations or thoughts..."
            />
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
              {loading ? 'Logging...' : 'Log Progress'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};