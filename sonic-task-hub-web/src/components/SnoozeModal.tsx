import React, { useState } from 'react';
import { X, Clock, Calendar, Sparkles } from 'lucide-react';
import { apiHelpers } from '../services/api';

interface SnoozeModalProps {
  onClose: () => void;
  onSnooze: (snoozeUntil: string) => void;
  itemCount: number;
}

export const SnoozeModal: React.FC<SnoozeModalProps> = ({
  onClose,
  onSnooze,
  itemCount
}) => {
  const [snoozeOption, setSnoozeOption] = useState<'preset' | 'custom'>('preset');
  const [selectedPreset, setSelectedPreset] = useState<string>('1d');
  const [customDate, setCustomDate] = useState<string>('');
  const [customTime, setCustomTime] = useState<string>('09:00');

  const presetOptions = [
    { value: '1d', label: '1 day', description: 'Until tomorrow', icon: '🌅' },
    { value: '3d', label: '3 days', description: 'Until this weekend', icon: '📅' },
    { value: '1w', label: '1 week', description: 'Until next week', icon: '📆' },
    { value: '2w', label: '2 weeks', description: 'Until next fortnight', icon: '🗓️' },
    { value: '1m', label: '1 month', description: 'Until next month', icon: '📋' }
  ];

  const getPresetDate = (preset: string): Date => {
    const now = new Date();
    switch (preset) {
      case '1d':
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
      case '3d':
        return new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
      case '1w':
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      case '2w':
        return new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
      case '1m':
        return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    }
  };

  const handleSnooze = () => {
    let snoozeDate: Date;

    if (snoozeOption === 'preset') {
      snoozeDate = getPresetDate(selectedPreset);
    } else {
      if (!customDate) {
        alert('Please select a date');
        return;
      }
      snoozeDate = new Date(`${customDate}T${customTime}`);
      
      if (snoozeDate <= new Date()) {
        alert('Please select a future date and time');
        return;
      }
    }

    onSnooze(apiHelpers.formatDate(snoozeDate));
  };

  const formatPreviewDate = (): string => {
    let date: Date;
    
    if (snoozeOption === 'preset') {
      date = getPresetDate(selectedPreset);
    } else {
      if (!customDate) return '';
      date = new Date(`${customDate}T${customTime}`);
    }

    return date.toLocaleString();
  };

  const getMinDate = (): string => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
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
                <Clock className="w-3 h-3 text-white" />
              </div>
              Snooze Items
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Snooze {itemCount} selected item{itemCount !== 1 ? 's' : ''} until later
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              When should these items be unsnoozed?
            </label>
            
            <div className="space-y-4">
              {/* Preset Options */}
              <div>
                <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-gray-300 transition-colors">
                  <input
                    type="radio"
                    name="snoozeOption"
                    value="preset"
                    checked={snoozeOption === 'preset'}
                    onChange={(e) => setSnoozeOption(e.target.value as 'preset' | 'custom')}
                    className="text-blue-600"
                    style={{ color: '#483b85' }}
                  />
                  <div>
                    <div className="font-medium text-gray-900 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" style={{ color: '#483b85' }} />
                      Quick Options
                    </div>
                    <div className="text-sm text-gray-600">Choose from preset durations</div>
                  </div>
                </label>

                {snoozeOption === 'preset' && (
                  <div className="mt-3 ml-6 space-y-2">
                    {presetOptions.map((option) => (
                      <label key={option.value} className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                        <input
                          type="radio"
                          name="presetOption"
                          value={option.value}
                          checked={selectedPreset === option.value}
                          onChange={(e) => setSelectedPreset(e.target.value)}
                          className="text-blue-600"
                          style={{ color: '#483b85' }}
                        />
                        <span className="text-lg">{option.icon}</span>
                        <div>
                          <div className="font-medium text-gray-900">{option.label}</div>
                          <div className="text-sm text-gray-600">{option.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Custom Date/Time */}
              <div>
                <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-gray-300 transition-colors">
                  <input
                    type="radio"
                    name="snoozeOption"
                    value="custom"
                    checked={snoozeOption === 'custom'}
                    onChange={(e) => setSnoozeOption(e.target.value as 'preset' | 'custom')}
                    className="text-blue-600"
                    style={{ color: '#483b85' }}
                  />
                  <div>
                    <div className="font-medium text-gray-900 flex items-center gap-2">
                      <Calendar className="w-4 h-4" style={{ color: '#483b85' }} />
                      Custom Date & Time
                    </div>
                    <div className="text-sm text-gray-600">Set a specific date and time</div>
                  </div>
                </label>

                {snoozeOption === 'custom' && (
                  <div className="mt-3 ml-6 flex gap-3">
                    <div className="flex-1">
                      <input
                        type="date"
                        value={customDate}
                        onChange={(e) => setCustomDate(e.target.value)}
                        min={getMinDate()}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                        style={{ '--tw-ring-color': '#483b85' } as React.CSSProperties}
                      />
                    </div>
                    <div className="flex-1">
                      <input
                        type="time"
                        value={customTime}
                        onChange={(e) => setCustomTime(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                        style={{ '--tw-ring-color': '#483b85' } as React.CSSProperties}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Preview */}
          {formatPreviewDate() && (
            <div className="rounded-xl p-4 border"
                 style={{ backgroundColor: '#f8f6ff', borderColor: '#483b85' }}>
              <div className="flex items-center gap-2 font-medium"
                   style={{ color: '#483b85' }}>
                <Clock className="w-4 h-4" />
                <span>Items will be unsnoozed on:</span>
              </div>
              <div className="font-mono text-sm mt-1"
                   style={{ color: '#483b85' }}>
                {formatPreviewDate()}
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
            onClick={handleSnooze}
            className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2 transition-colors"
          >
            <Clock className="w-4 h-4" />
            Snooze {itemCount} Item{itemCount !== 1 ? 's' : ''}
          </button>
        </div>
      </div>
    </div>
  );
};