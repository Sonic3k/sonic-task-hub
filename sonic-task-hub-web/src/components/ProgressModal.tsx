import React, { useState } from 'react';
import { X, TrendingUp, Clock, Calendar, Hash, FileText, Sparkles } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Item, ProgressFormData } from '../types';
import { progressApi, apiHelpers } from '../services/api';
import toast from 'react-hot-toast';

interface ProgressModalProps {
  userId: number;
  item: Item;
  onClose: () => void;
  onSave: () => void;
}

export const ProgressModal: React.FC<ProgressModalProps> = ({
  userId,
  item,
  onClose,
  onSave
}) => {
  const [loading, setLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<ProgressFormData>({
    defaultValues: {
      sessionDate: new Date().toISOString().split('T')[0],
      duration: undefined,
      notes: '',
      progressValue: undefined,
      progressUnit: ''
    }
  });

  const onSubmit = async (data: ProgressFormData) => {
    try {
      setLoading(true);

      const submitData = {
        ...data,
        sessionDate: data.sessionDate || new Date().toISOString().split('T')[0],
        duration: data.duration || undefined,
        progressValue: data.progressValue || undefined,
        progressUnit: data.progressUnit || undefined
      };

      await progressApi.log(userId, item.id, submitData);
      toast.success('Progress logged successfully!');
      onSave();
    } catch (error) {
      toast.error(apiHelpers.handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const getProgressUnitSuggestions = () => {
    const suggestions = [
      'minutes', 'hours', 'pages', 'chapters', 'exercises', 'reps', 
      'sets', 'kilometers', 'miles', 'words', 'lessons', 'sessions'
    ];
    return suggestions;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
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
              Track your progress for: <span className="font-medium">{item.title}</span>
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
              <Calendar className="w-4 h-4 inline mr-1" />
              Session Date *
            </label>
            <input
              type="date"
              {...register('sessionDate', { required: 'Session date is required' })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
              style={{ '--tw-ring-color': '#483b85' } as React.CSSProperties}
            />
            {errors.sessionDate && (
              <p className="text-red-600 text-sm mt-1">{errors.sessionDate.message}</p>
            )}
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="w-4 h-4 inline mr-1" />
              Duration (minutes)
            </label>
            <input
              type="number"
              min="1"
              {...register('duration', { 
                valueAsNumber: true,
                min: { value: 1, message: 'Duration must be at least 1 minute' }
              })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
              style={{ '--tw-ring-color': '#483b85' } as React.CSSProperties}
              placeholder="e.g., 30"
            />
            {errors.duration && (
              <p className="text-red-600 text-sm mt-1">{errors.duration.message}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              How long did you spend on this activity?
            </p>
          </div>

          {/* Progress Value & Unit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Hash className="w-4 h-4 inline mr-1" />
                Progress Value
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                {...register('progressValue', { 
                  valueAsNumber: true,
                  min: { value: 0, message: 'Progress value cannot be negative' }
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                style={{ '--tw-ring-color': '#483b85' } as React.CSSProperties}
                placeholder="e.g., 5"
              />
              {errors.progressValue && (
                <p className="text-red-600 text-sm mt-1">{errors.progressValue.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unit
              </label>
              <input
                type="text"
                {...register('progressUnit')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                style={{ '--tw-ring-color': '#483b85' } as React.CSSProperties}
                placeholder="e.g., pages, reps"
                list="progressUnitSuggestions"
              />
              <datalist id="progressUnitSuggestions">
                {getProgressUnitSuggestions().map(unit => (
                  <option key={unit} value={unit} />
                ))}
              </datalist>
            </div>
          </div>

          <div className="text-xs text-gray-500">
            Example: Read 5 pages, Did 10 reps, Practiced for 3 hours
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="w-4 h-4 inline mr-1" />
              Notes
            </label>
            <textarea
              {...register('notes')}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent resize-none"
              style={{ '--tw-ring-color': '#483b85' } as React.CSSProperties}
              placeholder="How did it go? Any insights or observations..."
            />
            <p className="text-xs text-gray-500 mt-1">
              Optional: Record your thoughts, feelings, or key insights from this session
            </p>
          </div>

          {/* Quick Examples */}
          <div className="rounded-xl p-4 border"
               style={{ backgroundColor: '#f8f6ff', borderColor: '#483b85' }}>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2"
                style={{ color: '#483b85' }}>
              <Sparkles className="w-4 h-4" />
              Quick Examples
            </h4>
            <div className="text-xs space-y-1"
                 style={{ color: '#483b85' }}>
              <div><strong>Reading:</strong> 30 min, 15 pages</div>
              <div><strong>Exercise:</strong> 45 min, 3 sets of workout</div>
              <div><strong>Learning:</strong> 60 min, 2 lessons completed</div>
              <div><strong>Practice:</strong> 25 min, felt more confident today</div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-opacity"
              style={{ backgroundColor: '#483b85' }}
            >
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              <TrendingUp className="w-4 h-4" />
              Log Progress
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};