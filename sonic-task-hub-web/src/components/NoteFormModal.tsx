import React, { useState } from 'react';
import { X, Lightbulb, Sparkles } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { 
  Note, 
  Category, 
  NoteFormData, 
  Priority,
  NOTE_ICONS
} from '../types';
import { noteApi, apiHelpers } from '../services/api';
import toast from 'react-hot-toast';

interface NoteFormModalProps {
  userId: number;
  categories: Category[];
  note?: Note | null;
  onClose: () => void;
  onSave: () => void;
}

export const NoteFormModal: React.FC<NoteFormModalProps> = ({
  userId,
  categories,
  note,
  onClose,
  onSave
}) => {
  const [loading, setLoading] = useState(false);
  const isEdit = !!note;

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<NoteFormData>({
    defaultValues: {
      title: note?.title || '',
      description: note?.description || '',
      priority: note?.priority || Priority.MEDIUM,
      categoryId: note?.categoryId || undefined
    }
  });

  const onSubmit = async (data: NoteFormData) => {
    try {
      setLoading(true);

      const submitData = {
        ...data,
        categoryId: data.categoryId || null
      };

      if (isEdit && note) {
        await noteApi.update(userId, note.id, submitData);
        toast.success('Note updated successfully!');
      } else {
        await noteApi.create(userId, submitData);
        toast.success('Note created successfully!');
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
                <Lightbulb className="w-3 h-3 text-white" />
              </div>
              {isEdit ? 'Edit Note' : 'Create New Note'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Capture ideas and thoughts for later brainstorming
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
              Note Title *
            </label>
            <input
              type="text"
              {...register('title', { required: 'Title is required' })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-colors"
              style={{ '--tw-ring-color': '#483b85' } as React.CSSProperties}
              placeholder="What's on your mind?"
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content
            </label>
            <textarea
              {...register('description')}
              rows={8}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-colors"
              style={{ '--tw-ring-color': '#483b85' } as React.CSSProperties}
              placeholder="Expand on your idea, add details, context, or anything that might be helpful later..."
            />
          </div>

          {/* Priority & Category */}
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
                <option value={Priority.LOW}>📝 Low</option>
                <option value={Priority.MEDIUM}>📋 Medium</option>
                <option value={Priority.HIGH}>📌 High</option>
              </select>
            </div>

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
          </div>

          {/* Info */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-purple-600 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-purple-900 mb-1">Note-Taking Tips</h3>
                <ul className="text-sm text-purple-700 space-y-1">
                  <li>• Write freely without overthinking</li>
                  <li>• Include context and background information</li>
                  <li>• Use keywords for easier searching later</li>
                  <li>• Set priority based on urgency to brainstorm</li>
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
              {loading ? 'Saving...' : isEdit ? 'Update Note' : 'Create Note'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};