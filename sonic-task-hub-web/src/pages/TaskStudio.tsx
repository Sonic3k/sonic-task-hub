import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, ChevronDown, MoreHorizontal, Plus, Check, Clock, Trash2, FileText, GitBranch, TrendingUp, Palette, ExternalLink } from 'lucide-react';
import { 
  Item, 
  ItemFilters, 
  ItemType, 
  ItemStatus, 
  Priority, 
  Complexity,
  Category,
  PageResponse,
  PRIORITY_COLORS,
  COMPLEXITY_COLORS,
  STATUS_COLORS,
  TYPE_ICONS,
  PRIORITY_ICONS,
  COMPLEXITY_ICONS
} from '../types';
import { itemApi, categoryApi, apiHelpers } from '../services/api';
import { ItemFormModal } from '../components/ItemFormModal';
import { SnoozeModal } from '../components/SnoozeModal';
import { ExportModal } from '../components/ExportModal';
import { ProgressModal } from '../components/ProgressModal';
import toast from 'react-hot-toast';

interface TaskStudioProps {
  userId: number;
}

export const TaskStudio: React.FC<TaskStudioProps> = ({ userId }) => {
  // State management
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  
  const [filters, setFilters] = useState<ItemFilters>({
    page: 0,
    size: 20,
    sortBy: 'createdAt',
    sortDirection: 'desc'
  });

  // Modals
  const [showItemForm, setShowItemForm] = useState(false);
  const [showSnoozeModal, setShowSnoozeModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [parentItemForSubtask, setParentItemForSubtask] = useState<Item | null>(null);
  const [progressItem, setProgressItem] = useState<Item | null>(null);

  // Load data functions
  useEffect(() => {
    loadItems();
    loadCategories();
  }, [userId, filters]);

  const loadItems = async () => {
    try {
      setLoading(true);
      const response = await itemApi.getWithFilters(userId, filters);
      
      if (response.data.success && response.data.data) {
        const pageData = response.data.data;
        setItems(pageData.content);
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

  // All handler functions
  const updateFilters = (newFilters: Partial<ItemFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 0 }));
    setSelectedItems(new Set());
  };

  const handleSearch = (searchTerm: string) => {
    updateFilters({ search: searchTerm || undefined });
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
    setSelectedItems(new Set());
  };

  const handleSort = (sortBy: string) => {
    const sortDirection = filters.sortBy === sortBy && filters.sortDirection === 'desc' ? 'asc' : 'desc';
    setFilters(prev => ({ ...prev, sortBy, sortDirection }));
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(new Set(items.map(item => item.id)));
    } else {
      setSelectedItems(new Set());
    }
  };

  const handleSelectItem = (itemId: number, checked: boolean) => {
    const newSelected = new Set(selectedItems);
    if (checked) {
      newSelected.add(itemId);
    } else {
      newSelected.delete(itemId);
    }
    setSelectedItems(newSelected);
  };

  const handleCompleteItem = async (itemId: number) => {
    try {
      await itemApi.complete(userId, itemId);
      toast.success('Item completed!');
      loadItems();
    } catch (error) {
      toast.error(apiHelpers.handleApiError(error));
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    if (confirm('Are you sure you want to delete this item?')) {
      try {
        await itemApi.delete(userId, itemId);
        toast.success('Item deleted!');
        loadItems();
      } catch (error) {
        toast.error(apiHelpers.handleApiError(error));
      }
    }
  };

  const handleBulkComplete = async () => {
    try {
      await itemApi.bulkComplete(userId, Array.from(selectedItems));
      toast.success(`${selectedItems.size} items completed!`);
      setSelectedItems(new Set());
      loadItems();
    } catch (error) {
      toast.error(apiHelpers.handleApiError(error));
    }
  };

  const handleBulkSnooze = () => {
    if (selectedItems.size > 0) {
      setShowSnoozeModal(true);
    }
  };

  const handleBulkDelete = async () => {
    if (confirm(`Are you sure you want to delete ${selectedItems.size} items?`)) {
      try {
        await itemApi.bulkDelete(userId, Array.from(selectedItems));
        toast.success(`${selectedItems.size} items deleted!`);
        setSelectedItems(new Set());
        loadItems();
      } catch (error) {
        toast.error(apiHelpers.handleApiError(error));
      }
    }
  };

  const onSnoozeComplete = async (snoozeUntil: string) => {
    try {
      await itemApi.bulkSnooze(userId, Array.from(selectedItems), snoozeUntil);
      toast.success(`${selectedItems.size} items snoozed!`);
      setSelectedItems(new Set());
      setShowSnoozeModal(false);
      loadItems();
    } catch (error) {
      toast.error(apiHelpers.handleApiError(error));
    }
  };

  const handleItemSaved = () => {
    setShowItemForm(false);
    setEditingItem(null);
    setParentItemForSubtask(null);
    setFilters(prev => ({ ...prev, page: 0 }));
    setTimeout(() => {
      loadItems();
    }, 100);
  };

  const handleAddSubtask = (parentItem: Item) => {
    setParentItemForSubtask(parentItem);
    setEditingItem(null);
    setShowItemForm(true);
  };

  const handleAddProgress = (item: Item) => {
    setProgressItem(item);
    setShowProgressModal(true);
  };

  const handleProgressSaved = () => {
    setShowProgressModal(false);
    setProgressItem(null);
    loadItems();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  const formatDueDate = (dueDate?: string) => {
    if (!dueDate) return null;
    
    const due = new Date(dueDate);
    const now = new Date();
    const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return <span className="text-red-600 font-medium">Overdue</span>;
    } else if (diffDays === 0) {
      return <span className="text-orange-600 font-medium">Today</span>;
    } else if (diffDays <= 3) {
      return <span className="text-yellow-600 font-medium">{diffDays} days</span>;
    } else {
      return <span className="text-gray-600">{diffDays} days</span>;
    }
  };

  const getCategoryDisplay = (item: Item) => {
    if (!item.categoryName) return '-';
    return (
      <div className="flex items-center gap-2">
        <div 
          className="w-3 h-3 rounded-full" 
          style={{ backgroundColor: item.categoryColor || '#6B7280' }}
        />
        <span className="text-sm">{item.categoryName}</span>
      </div>
    );
  };

  const getStatsData = () => {
    const pendingCount = items.filter(i => i.status === ItemStatus.PENDING).length;
    const completedCount = items.filter(i => i.status === ItemStatus.COMPLETED).length;
    const habitsCount = items.filter(i => i.type === ItemType.HABIT).length;
    const overdueCount = items.filter(i => i.dueDate && new Date(i.dueDate) < new Date() && i.status !== ItemStatus.COMPLETED).length;

    return { pendingCount, completedCount, habitsCount, overdueCount };
  };

  const { pendingCount, completedCount, habitsCount, overdueCount } = getStatsData();

  return (
    <div className="min-h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                     style={{ backgroundColor: '#483b85' }}>
                  <Palette className="w-4 h-4 text-white" />
                </div>
                <h1 className="text-2xl font-semibold text-gray-900">Task Studio</h1>
                <span className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-md">
                  Hub Management
                </span>
              </div>
              <p className="text-gray-600 text-sm">
                {totalElements} total items • {pendingCount} pending • {completedCount} completed
                {overdueCount > 0 && <span className="text-red-600 font-medium"> • {overdueCount} overdue</span>}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowExportModal(true)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors text-sm font-medium"
              >
                <FileText className="w-4 h-4 inline mr-2" />
                Export
              </button>
              <button
                onClick={() => setShowItemForm(true)}
                className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity shadow-sm text-sm font-medium"
                style={{ backgroundColor: '#483b85' }}
              >
                <Plus className="w-4 h-4 inline mr-2" />
                Add Item
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600 font-medium">Pending</span>
              </div>
              <div className="text-2xl font-semibold text-gray-900">{pendingCount}</div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <Check className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600 font-medium">Completed</span>
              </div>
              <div className="text-2xl font-semibold text-gray-900">{completedCount}</div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600 font-medium">Habits</span>
              </div>
              <div className="text-2xl font-semibold text-gray-900">{habitsCount}</div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-4 h-4 text-center text-gray-400 text-xs">⚠️</span>
                <span className="text-sm text-gray-600 font-medium">Overdue</span>
              </div>
              <div className="text-2xl font-semibold text-gray-900">{overdueCount}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="relative flex-1 min-w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search tasks, habits, reminders..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-colors bg-white"
                style={{ '--tw-ring-color': '#483b85' } as React.CSSProperties}
                onChange={(e) => handleSearch(e.target.value)}
                defaultValue={filters.search || ''}
              />
            </div>

            <select
              value={filters.type || ''}
              onChange={(e) => updateFilters({ type: e.target.value as ItemType || undefined })}
              className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent bg-white text-sm"
              style={{ '--tw-ring-color': '#483b85' } as React.CSSProperties}
            >
              <option value="">All Types</option>
              <option value={ItemType.TASK}>📝 Tasks</option>
              <option value={ItemType.HABIT}>🎯 Habits</option>
              <option value={ItemType.REMINDER}>💭 Reminders</option>
            </select>

            <select
              value={filters.status || ''}
              onChange={(e) => updateFilters({ status: e.target.value as ItemStatus || undefined })}
              className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent bg-white text-sm"
              style={{ '--tw-ring-color': '#483b85' } as React.CSSProperties}
            >
              <option value="">All Status</option>
              <option value={ItemStatus.PENDING}>Pending</option>
              <option value={ItemStatus.IN_PROGRESS}>In Progress</option>
              <option value={ItemStatus.COMPLETED}>Completed</option>
              <option value={ItemStatus.SNOOZED}>Snoozed</option>
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
              onChange={(e) => updateFilters({ categoryId: e.target.value ? Number(e.target.value) : undefined })}
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

            <select
              value={filters.size}
              onChange={(e) => updateFilters({ size: Number(e.target.value) })}
              className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent bg-white text-sm"
              style={{ '--tw-ring-color': '#483b85' } as React.CSSProperties}
            >
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedItems.size > 0 && (
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="px-8 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-gray-700 font-medium">
                  {selectedItems.size} items selected
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleBulkComplete}
                    className="px-3 py-1.5 bg-gray-900 text-white rounded-md hover:bg-gray-800 text-sm font-medium transition-colors"
                  >
                    <Check className="w-4 h-4 inline mr-1" />
                    Complete
                  </button>
                  <button
                    onClick={handleBulkSnooze}
                    className="px-3 py-1.5 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm font-medium transition-colors"
                  >
                    <Clock className="w-4 h-4 inline mr-1" />
                    Snooze
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    className="px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium transition-colors"
                  >
                    <Trash2 className="w-4 h-4 inline mr-1" />
                    Delete
                  </button>
                </div>
              </div>
              <button
                onClick={() => setSelectedItems(new Set())}
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Clear Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="px-8 py-6">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2"
                 style={{ borderBottomColor: '#483b85' }}></div>
          </div>
        ) : (
          <>
            {/* Items Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="w-12 p-4">
                      <input
                        type="checkbox"
                        checked={selectedItems.size === items.length && items.length > 0}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="rounded border-gray-300 text-gray-600 focus:ring-gray-500"
                      />
                    </th>
                    <th className="text-left p-4 font-medium text-gray-700">#</th>
                    <th 
                      className="text-left p-4 font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('title')}
                    >
                      <div className="flex items-center gap-2">
                        Title
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      </div>
                    </th>
                    <th 
                      className="text-left p-4 font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('type')}
                    >
                      Type
                    </th>
                    <th 
                      className="text-left p-4 font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('priority')}
                    >
                      Priority
                    </th>
                    <th 
                      className="text-left p-4 font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('complexity')}
                    >
                      Complexity
                    </th>
                    <th 
                      className="text-left p-4 font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('status')}
                    >
                      Status
                    </th>
                    <th 
                      className="text-left p-4 font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('dueDate')}
                    >
                      Due Date
                    </th>
                    <th className="text-left p-4 font-medium text-gray-700">Category</th>
                    <th className="text-left p-4 font-medium text-gray-700">Progress</th>
                    <th className="w-20 p-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={selectedItems.has(item.id)}
                          onChange={(e) => handleSelectItem(item.id, e.target.checked)}
                          className="rounded border-gray-300 text-gray-600 focus:ring-gray-500"
                        />
                      </td>
                      <td className="p-4">
                        <Link 
                          to={`/studio/item/${item.itemNumber}`}
                          className="text-sm font-mono text-blue-600 hover:underline"
                        >
                          #{item.itemNumber}
                        </Link>
                      </td>
                      <td className="p-4">
                        <div className="flex items-start gap-3">
                          <span className="text-lg">{TYPE_ICONS[item.type]}</span>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              {item.parentItemId && (
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                  <GitBranch className="w-3 h-3" />
                                  <span>Subtask</span>
                                </div>
                              )}
                              <Link 
                                to={`/studio/item/${item.itemNumber}`}
                                className="font-medium text-gray-900 hover:text-blue-600 flex items-center gap-1"
                              >
                                {item.title}
                                <ExternalLink className="w-3 h-3 opacity-50" />
                              </Link>
                            </div>
                            {item.description && (
                              <div className="text-sm text-gray-600 mt-1 line-clamp-2">
                                {item.description}
                              </div>
                            )}
                            {item.parentItemTitle && (
                              <div className="text-xs text-gray-500 mt-1">
                                ↳ Subtask of: {item.parentItemTitle}
                              </div>
                            )}
                            {item.type === ItemType.HABIT && item.habitStage && (
                              <div className="text-xs text-purple-600 mt-1">
                                Stage: {item.habitStage}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                          {item.type.toLowerCase()}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${PRIORITY_COLORS[item.priority]}`}>
                          {PRIORITY_ICONS[item.priority]} {item.priority.toLowerCase()}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${COMPLEXITY_COLORS[item.complexity]}`}>
                          {COMPLEXITY_ICONS[item.complexity]} {item.complexity.toLowerCase()}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[item.status]}`}>
                          {item.status.replace('_', ' ').toLowerCase()}
                        </span>
                      </td>
                      <td className="p-4">
                        {formatDueDate(item.dueDate)}
                      </td>
                      <td className="p-4">
                        {getCategoryDisplay(item)}
                      </td>
                      <td className="p-4">
                        {item.type === ItemType.HABIT && item.habitTargetDays ? (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">
                              {item.habitCompletedDays || 0}/{item.habitTargetDays}
                            </span>
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className="h-2 rounded-full transition-all"
                                style={{ 
                                  width: `${((item.habitCompletedDays || 0) / item.habitTargetDays) * 100}%`,
                                  backgroundColor: '#483b85'
                                }}
                              />
                            </div>
                          </div>
                        ) : item.subtaskCount > 0 ? (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">
                              {item.completedSubtaskCount}/{item.subtaskCount}
                            </span>
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className="h-2 rounded-full transition-all bg-gray-600"
                                style={{ 
                                  width: `${(item.completedSubtaskCount / item.subtaskCount) * 100}%`
                                }}
                              />
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          {item.status !== ItemStatus.COMPLETED && (
                            <button
                              onClick={() => handleCompleteItem(item.id)}
                              className="p-1.5 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                              title="Complete"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          
                          <button
                            onClick={() => handleAddSubtask(item)}
                            className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                            title="Add Subtask"
                          >
                            <GitBranch className="w-4 h-4" />
                          </button>

                          {item.type === ItemType.HABIT && (
                            <button
                              onClick={() => handleAddProgress(item)}
                              className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title="Log Progress"
                            >
                              <TrendingUp className="w-4 h-4" />
                            </button>
                          )}
                          
                          <button
                            onClick={() => {
                              setEditingItem(item);
                              setParentItemForSubtask(null);
                              setShowItemForm(true);
                            }}
                            className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                            title="Edit"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
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

              {/* Empty state */}
              {items.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-4xl mb-4">📝</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No items yet</h3>
                  <p className="text-gray-600 mb-6">Create your first task, habit, or reminder to get started</p>
                  <button
                    onClick={() => setShowItemForm(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: '#483b85' }}
                  >
                    <Plus className="w-4 h-4" />
                    Create Your First Item
                  </button>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-600">
                  Showing {(filters.page || 0) * (filters.size || 20) + 1} to {Math.min(((filters.page || 0) + 1) * (filters.size || 20), totalElements)} of {totalElements} results
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
                    const page = i + Math.max(0, (filters.page || 0) - 2);
                    if (page >= totalPages) return null;
                    
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
      {showItemForm && (
        <ItemFormModal
          userId={userId}
          categories={categories}
          item={editingItem}
          parentItem={parentItemForSubtask}
          onClose={() => {
            setShowItemForm(false);
            setEditingItem(null);
            setParentItemForSubtask(null);
          }}
          onSave={handleItemSaved}
        />
      )}

      {showSnoozeModal && (
        <SnoozeModal
          onClose={() => setShowSnoozeModal(false)}
          onSnooze={onSnoozeComplete}
          itemCount={selectedItems.size}
        />
      )}

      {showExportModal && (
        <ExportModal
          userId={userId}
          filters={filters}
          onClose={() => setShowExportModal(false)}
        />
      )}

      {showProgressModal && progressItem && (
        <ProgressModal
          userId={userId}
          item={progressItem}
          onClose={() => setShowProgressModal(false)}
          onSave={handleProgressSaved}
        />
      )}
    </div>
  );
};