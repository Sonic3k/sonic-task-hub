import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Tag, User, Sparkles } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { 
  Item, 
  Category, 
  ItemFormData, 
  ItemType, 
  Priority, 
  Complexity,
  TYPE_ICONS,
  PRIORITY_ICONS,
  COMPLEXITY_ICONS
} from '../types';
import { itemApi, apiHelpers } from '../services/api';
import toast from 'react-hot-toast';

interface ItemFormModalProps {
  userId: number;
  categories: Category[];
  item?: Item | null;
  parentItem?: Item | null;
  onClose: () => void;
  onSave: () => void;
}

export const ItemFormModal: React.FC<ItemFormModalProps> = ({
  userId,
  categories,
  item,
  parentItem,
  onClose,
  onSave
}) => {
  const [loading, setLoading] = useState(false);
  const isEdit = !!item;
  const isSubtask = !!parentItem;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<ItemFormData>({
    defaultValues: {
      title: item?.title || '',
      description: item?.description || '',
      type: item?.type || (isSubtask ? parentItem?.type : ItemType.TASK),
      priority: item?.priority || Priority.MEDIUM,
      complexity: item?.complexity || Complexity.MEDIUM,
      dueDate: item?.dueDate ? item.dueDate.split('T')[0] : '',
      categoryId: item?.categoryId || parentItem?.categoryId || undefined,
      parentItemId: parentItem?.id || item?.parentItemId || undefined,
      estimatedDuration: item?.estimatedDuration || undefined
    }
  });

  const watchedType = watch('type');

  useEffect(() => {
    if (parentItem) {
      setValue('parentItemId', parentItem.id);
      setValue('type', parentItem.type);
      setValue('categoryId', parentItem.categoryId);
    }
  }, [parentItem, setValue]);

  const onSubmit = async (data: ItemFormData) => {
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
        parentItemId: data.parentItemId || null,
        estimatedDuration: data.estimatedDuration || null
      };

      if (isEdit && item) {
        await itemApi.update(userId, item.id, submitData);
        toast.success('Item updated successfully!');
      } else {
        await itemApi.create(userId, submitData);
        toast.success(`${isSubtask ? 'Subtask' : 'Item'} created successfully!`);
      }

      onSave();
    } catch (error) {
      toast.error(apiHelpers.handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const getTypeDescription = (type: ItemType) => {
    switch (type) {
      case ItemType.TASK:
        return 'Action items with deadlines and priorities';
      case ItemType.HABIT:
        return 'Recurring practices for personal development';
      case ItemType.REMINDER:
        return 'Strategic thinking items and life decisions';
      default:
        return '';
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
              {isEdit ? 'Edit Item' : isSubtask ? 'Add Subtask' : 'Add New Item'}
            </h2>
            {isSubtask && parentItem && (
              <p className="text-sm text-gray-600 mt-1">
                Subtask of: <span className="font-medium">{parentItem.title}</span>
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
              <p className="text-red-600 text-sm mt-1">{errors.title.message}</p>
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-colors resize-none"
              style={{ '--tw-ring-color': '#483b85' } as React.CSSProperties}
              placeholder="Additional details..."
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {Object.values(ItemType).map((type) => (
                <div key={type}>
                  <label className={`relative flex flex-col p-4 border-2 rounded-xl cursor-pointer transition-all hover:border-gray-300 ${
                    watchedType === type 
                      ? 'border-transparent shadow-sm text-white' 
                      : 'border-gray-200'
                  } ${isSubtask ? 'opacity-50 cursor-not-allowed' : ''}`}
                  style={watchedType === type ? { backgroundColor: '#483b85' } : {}}>
                    <input
                      type="radio"
                      value={type}
                      {...register('type')}
                      className="sr-only"
                      disabled={isSubtask}
                    />
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{TYPE_ICONS[type]}</span>
                      <span className="font-medium">{type}</span>
                    </div>
                    <span className={`text-xs ${watchedType === type ? 'text-white/80' : 'text-gray-600'}`}>
                      {getTypeDescription(type)}
                    </span>
                  </label>
                </div>
              ))}
            </div>
            {isSubtask && (
              <p className="text-xs mt-2" style={{ color: '#483b85' }}>
                ℹ️ Subtasks inherit the same type as their parent item
              </p>
            )}
          </div>

          {/* Priority & Complexity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                {...register('priority')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                style={{ '--tw-ring-color': '#483b85' } as React.CSSProperties}
              >
                {Object.values(Priority).map((priority) => (
                  <option key={priority} value={priority}>
                    {PRIORITY_ICONS[priority]} {priority}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Complexity
              </label>
              <select
                {...register('complexity')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                style={{ '--tw-ring-color': '#483b85' } as React.CSSProperties}
              >
                {Object.values(Complexity).map((complexity) => (
                  <option key={complexity} value={complexity}>
                    {COMPLEXITY_ICONS[complexity]} {complexity}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Due Date & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Due Date
              </label>
              <input
                type="date"
                {...register('dueDate')}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                style={{ '--tw-ring-color': '#483b85' } as React.CSSProperties}
              />
              <p className="text-xs text-gray-500 mt-1">
                Optional: When should this be completed?
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Estimated Duration (minutes)
              </label>
              <input
                type="number"
                min="1"
                {...register('estimatedDuration', { 
                  valueAsNumber: true,
                  min: { value: 1, message: 'Duration must be at least 1 minute' }
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                style={{ '--tw-ring-color': '#483b85' } as React.CSSProperties}
                placeholder="e.g., 30"
              />
              {errors.estimatedDuration && (
                <p className="text-red-600 text-sm mt-1">{errors.estimatedDuration.message}</p>
              )}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Tag className="w-4 h-4 inline mr-1" />
              Category
            </label>
            <select
              {...register('categoryId', { valueAsNumber: true })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
              style={{ '--tw-ring-color': '#483b85' } as React.CSSProperties}
              disabled={isSubtask}
            >
              <option value="">No category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name} {category.isDefault ? '(Default)' : '(Custom)'}
                </option>
              ))}
            </select>
            {isSubtask && (
              <p className="text-xs text-gray-500 mt-1">
                Subtasks inherit the parent's category
              </p>
            )}
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
              {isEdit ? 'Update Item' : isSubtask ? 'Add Subtask' : 'Create Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};