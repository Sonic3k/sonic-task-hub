import React, { useState } from 'react';
import { X, Calendar, Sparkles } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { 
  Event, 
  Category, 
  EventFormData, 
  RecurringPattern,
  RECURRING_PATTERN_LABELS
} from '../types';
import { eventApi, apiHelpers } from '../services/api';
import toast from 'react-hot-toast';

interface EventFormModalProps {
  userId: number;
  categories: Category[];
  event?: Event | null;
  onClose: () => void;
  onSave: () => void;
}

export const EventFormModal: React.FC<EventFormModalProps> = ({
  userId,
  categories,
  event,
  onClose,
  onSave
}) => {
  const [loading, setLoading] = useState(false);
  const isEdit = !!event;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<EventFormData>({
    defaultValues: {
      title: event?.title || '',
      description: event?.description || '',
      eventDateTime: event?.eventDateTime ? 
        new Date(event.eventDateTime).toISOString().slice(0, 16) : '',
      location: event?.location || '',
      reminderMinutes: event?.reminderMinutes || undefined,
      isRecurring: event?.isRecurring || false,
      recurringPattern: event?.recurringPattern || undefined,
      recurringInterval: event?.recurringInterval || undefined,
      recurringEndDate: event?.recurringEndDate ? 
        new Date(event.recurringEndDate).toISOString().slice(0, 16) : '',
      categoryId: event?.categoryId || undefined
    }
  });

  const watchIsRecurring = watch('isRecurring');
  const watchRecurringPattern = watch('recurringPattern');

  const onSubmit = async (data: EventFormData) => {
    try {
      setLoading(true);

      const submitData = {
        ...data,
        eventDateTime: new Date(data.eventDateTime).toISOString(),
        categoryId: data.categoryId || null,
        reminderMinutes: data.reminderMinutes || null,
        recurringPattern: data.isRecurring ? data.recurringPattern : null,
        recurringInterval: data.isRecurring ? data.recurringInterval : null,
        recurringEndDate: data.isRecurring && data.recurringEndDate ? 
          new Date(data.recurringEndDate).toISOString() : null
      };

      if (isEdit && event) {
        await eventApi.update(userId, event.id, submitData);
        toast.success('Event updated successfully!');
      } else {
        await eventApi.create(userId, submitData);
        toast.success('Event created successfully!');
      }

      onSave();
    } catch (error) {
      toast.error(apiHelpers.handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const needsInterval = watchRecurringPattern === RecurringPattern.EVERY_N_DAYS || 
                       watchRecurringPattern === RecurringPattern.EVERY_N_WEEKS;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center"
                   style={{ backgroundColor: '#483b85' }}>
                <Calendar className="w-3 h-3 text-white" />
              </div>
              {isEdit ? 'Edit Event' : 'Create New Event'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Schedule events with location, reminders, and recurring patterns
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
              Event Title *
            </label>
            <input
              type="text"
              {...register('title', { required: 'Title is required' })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-colors"
              style={{ '--tw-ring-color': '#483b85' } as React.CSSProperties}
              placeholder="e.g., Team Meeting, Birthday Party"
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
              placeholder="Add details about the event..."
            />
          </div>

          {/* Date & Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date & Time *
            </label>
            <input
              type="datetime-local"
              {...register('eventDateTime', { required: 'Date and time is required' })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-colors"
              style={{ '--tw-ring-color': '#483b85' } as React.CSSProperties}
            />
            {errors.eventDateTime && (
              <p className="text-red-500 text-sm mt-1">{errors.eventDateTime.message}</p>
            )}
          </div>

          {/* Location & Reminder */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                {...register('location')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-colors"
                style={{ '--tw-ring-color': '#483b85' } as React.CSSProperties}
                placeholder="e.g., Conference Room A"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reminder (minutes before)
              </label>
              <select
                {...register('reminderMinutes')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-colors"
                style={{ '--tw-ring-color': '#483b85' } as React.CSSProperties}
              >
                <option value="">No reminder</option>
                <option value="5">5 minutes</option>
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="60">1 hour</option>
                <option value="120">2 hours</option>
                <option value="1440">1 day</option>
                <option value="2880">2 days</option>
                <option value="10080">1 week</option>
              </select>
            </div>
          </div>

          {/* Recurring */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <input
                type="checkbox"
                {...register('isRecurring')}
                className="rounded"
              />
              <label className="text-sm font-medium text-gray-700">
                Recurring Event
              </label>
            </div>

            {watchIsRecurring && (
              <div className="space-y-4 pl-6 border-l-2 border-gray-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recurring Pattern
                  </label>
                  <select
                    {...register('recurringPattern')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-colors"
                    style={{ '--tw-ring-color': '#483b85' } as React.CSSProperties}
                  >
                    <option value="">Select pattern</option>
                    {Object.entries(RECURRING_PATTERN_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                {needsInterval && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Interval
                    </label>
                    <input
                      type="number"
                      min="1"
                      {...register('recurringInterval')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-colors"
                      style={{ '--tw-ring-color': '#483b85' } as React.CSSProperties}
                      placeholder="e.g., 2 for every 2 weeks"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date (optional)
                  </label>
                  <input
                    type="datetime-local"
                    {...register('recurringEndDate')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-colors"
                    style={{ '--tw-ring-color': '#483b85' } as React.CSSProperties}
                  />
                </div>
              </div>
            )}
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
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-yellow-900 mb-1">Event Tips</h3>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Set reminders to never miss important events</li>
                  <li>• Use recurring patterns for regular meetings</li>
                  <li>• Include location details for easy navigation</li>
                  <li>• Recurring events generate multiple instances automatically</li>
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
              {loading ? 'Saving...' : isEdit ? 'Update Event' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};