import React, { useState } from 'react';
import { X, Download, FileText, Table, Filter, Sparkles } from 'lucide-react';
import { Item, ItemFilters, ItemType, ItemStatus, Priority } from '../types';
import { itemApi, apiHelpers } from '../services/api';
import toast from 'react-hot-toast';

interface ExportModalProps {
  userId: number;
  filters: ItemFilters;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  userId,
  filters,
  onClose
}) => {
  const [loading, setLoading] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv');
  const [includeCompleted, setIncludeCompleted] = useState(true);
  const [includeSnoozed, setIncludeSnoozed] = useState(true);
  const [includeSubtasks, setIncludeSubtasks] = useState(true);
  const [dateRange, setDateRange] = useState<'all' | 'week' | 'month' | 'custom'>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const handleExport = async () => {
    try {
      setLoading(true);

      const exportFilters: ItemFilters = {
        ...filters,
        page: 0,
        size: 10000,
      };

      const response = await itemApi.getWithFilters(userId, exportFilters);
      
      if (!response.data.success || !response.data.data) {
        throw new Error('Failed to fetch items for export');
      }

      let items = response.data.data.content;

      // Client-side filtering
      if (!includeCompleted) {
        items = items.filter(item => item.status !== ItemStatus.COMPLETED);
      }
      
      if (!includeSnoozed) {
        items = items.filter(item => item.status !== ItemStatus.SNOOZED);
      }

      if (!includeSubtasks) {
        items = items.filter(item => !item.parentItemId);
      }

      // Apply custom date range filter
      if (dateRange === 'custom' && customStartDate && customEndDate) {
        const start = new Date(customStartDate);
        const end = new Date(customEndDate);
        items = items.filter(item => {
          const createdAt = new Date(item.createdAt);
          return createdAt >= start && createdAt <= end;
        });
      }

      // Generate export data
      if (exportFormat === 'csv') {
        exportToCSV(items);
      } else {
        exportToJSON(items);
      }

      toast.success(`Exported ${items.length} items successfully!`);
      onClose();

    } catch (error) {
      toast.error(apiHelpers.handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = (items: Item[]) => {
    const headers = [
      'ID', 'Title', 'Description', 'Type', 'Priority', 'Complexity', 'Status',
      'Due Date', 'Completed At', 'Category', 'Parent Item', 'Subtask Count',
      'Estimated Duration', 'Actual Duration', 'Created At', 'Updated At'
    ];

    const csvContent = [
      headers.join(','),
      ...items.map(item => [
        item.id,
        `"${(item.title || '').replace(/"/g, '""')}"`,
        `"${(item.description || '').replace(/"/g, '""')}"`,
        item.type,
        item.priority,
        item.complexity,
        item.status,
        item.dueDate ? new Date(item.dueDate).toLocaleDateString() : '',
        item.completedAt ? new Date(item.completedAt).toLocaleDateString() : '',
        item.categoryName || '',
        item.parentItemTitle || '',
        item.subtaskCount,
        item.estimatedDuration || '',
        item.actualDuration || '',
        new Date(item.createdAt).toLocaleDateString(),
        new Date(item.updatedAt).toLocaleDateString()
      ].join(','))
    ].join('\n');

    downloadFile(csvContent, 'sonic-task-hub-export.csv', 'text/csv');
  };

  const exportToJSON = (items: Item[]) => {
    const jsonContent = JSON.stringify({
      exportDate: new Date().toISOString(),
      totalItems: items.length,
      filters: filters,
      items: items
    }, null, 2);

    downloadFile(jsonContent, 'sonic-task-hub-export.json', 'application/json');
  };

  const downloadFile = (content: string, filename: string, contentType: string) => {
    const blob = new Blob([content], { type: contentType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
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
                <Download className="w-3 h-3 text-white" />
              </div>
              Export Data
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Export your tasks, habits, and reminders
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Export Format */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Export Format
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-colors ${
                exportFormat === 'csv' 
                  ? 'border-transparent text-white shadow-sm' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              style={exportFormat === 'csv' ? { backgroundColor: '#483b85' } : {}}>
                <input
                  type="radio"
                  name="exportFormat"
                  value="csv"
                  checked={exportFormat === 'csv'}
                  onChange={(e) => setExportFormat(e.target.value as 'csv' | 'json')}
                  className="sr-only"
                />
                <div>
                  <div className="flex items-center gap-2 font-medium">
                    <Table className="w-4 h-4" />
                    CSV
                  </div>
                  <div className={`text-xs ${exportFormat === 'csv' ? 'text-white/80' : 'text-gray-600'}`}>
                    Excel compatible
                  </div>
                </div>
              </label>

              <label className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-colors ${
                exportFormat === 'json' 
                  ? 'border-transparent text-white shadow-sm' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              style={exportFormat === 'json' ? { backgroundColor: '#483b85' } : {}}>
                <input
                  type="radio"
                  name="exportFormat"
                  value="json"
                  checked={exportFormat === 'json'}
                  onChange={(e) => setExportFormat(e.target.value as 'csv' | 'json')}
                  className="sr-only"
                />
                <div>
                  <div className="flex items-center gap-2 font-medium">
                    <FileText className="w-4 h-4" />
                    JSON
                  </div>
                  <div className={`text-xs ${exportFormat === 'json' ? 'text-white/80' : 'text-gray-600'}`}>
                    Raw data format
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Date Range
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as 'all' | 'week' | 'month' | 'custom')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent mb-3"
              style={{ '--tw-ring-color': '#483b85' } as React.CSSProperties}
            >
              <option value="all">All time</option>
              <option value="week">Last 7 days</option>
              <option value="month">Last 30 days</option>
              <option value="custom">Custom range</option>
            </select>

            {dateRange === 'custom' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    style={{ '--tw-ring-color': '#483b85' } as React.CSSProperties}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">End Date</label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    style={{ '--tw-ring-color': '#483b85' } as React.CSSProperties}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Include Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Include in Export
            </label>
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={includeCompleted}
                  onChange={(e) => setIncludeCompleted(e.target.checked)}
                  className="rounded border-gray-300"
                  style={{ color: '#483b85' }}
                />
                <span className="text-sm text-gray-700">Completed items</span>
              </label>
              
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={includeSnoozed}
                  onChange={(e) => setIncludeSnoozed(e.target.checked)}
                  className="rounded border-gray-300"
                  style={{ color: '#483b85' }}
                />
                <span className="text-sm text-gray-700">Snoozed items</span>
              </label>
              
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={includeSubtasks}
                  onChange={(e) => setIncludeSubtasks(e.target.checked)}
                  className="rounded border-gray-300"
                  style={{ color: '#483b85' }}
                />
                <span className="text-sm text-gray-700">Subtasks</span>
              </label>
            </div>
          </div>

          {/* Current Filters Info */}
          {(filters.type || filters.status || filters.priority || filters.search) && (
            <div className="rounded-xl p-4 border"
                 style={{ backgroundColor: '#f8f6ff', borderColor: '#483b85' }}>
              <div className="flex items-center gap-2 font-medium mb-2"
                   style={{ color: '#483b85' }}>
                <Filter className="w-4 h-4" />
                <span className="text-sm">Active Filters</span>
              </div>
              <div className="text-xs space-y-1"
                   style={{ color: '#483b85' }}>
                {filters.type && <div>Type: {filters.type}</div>}
                {filters.status && <div>Status: {filters.status}</div>}
                {filters.priority && <div>Priority: {filters.priority}</div>}
                {filters.search && <div>Search: "{filters.search}"</div>}
              </div>
              <div className="text-xs mt-2 opacity-80"
                   style={{ color: '#483b85' }}>
                Export will include these filters
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={loading}
            className="px-6 py-3 text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-opacity"
            style={{ backgroundColor: '#483b85' }}
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Download className="w-4 h-4" />
            )}
            Export {exportFormat.toUpperCase()}
          </button>
        </div>
      </div>
    </div>
  );
};