import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Calendar, Clock, MapPin, Repeat, Trash2, Edit } from 'lucide-react';
import { 
  Event, 
  EventFilters, 
  Category,
  PageResponse,
  EVENT_ICONS,
  RECURRING_PATTERN_LABELS
} from '../types';
import { eventApi, categoryApi, apiHelpers } from '../services/api';
import { EventFormModal } from '../components/EventFormModal';
import toast from 'react-hot-toast';

interface EventStudioProps {
  userId: number;
}

export const EventStudio: React.FC<EventStudioProps> = ({ userId }) => {
  // State management
  const [events, setEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  const [filters, setFilters] = useState<EventFilters>({
    page: 0,
    size: 20,
    sortBy: 'eventDateTime',
    sortDirection: 'asc'
  });

  // Modals
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  // Load data functions
  useEffect(() => {
    loadEvents();
    loadCategories();
  }, [userId, filters]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const response = await eventApi.getWithFilters(userId, filters);
      
      if (response.data.success && response.data.data) {
        const pageData = response.data.data;
        setEvents(pageData.content);
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

  // Filter functions
  const updateFilters = (newFilters: Partial<EventFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 0 }));
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setFilters(prev => ({ ...prev, page: newPage }));
    }
  };

  // Event actions
  const handleDeleteEvent = async (eventId: number) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    
    try {
      await eventApi.delete(userId, eventId);
      toast.success('Event deleted!');
      loadEvents();
    } catch (error) {
      toast.error(apiHelpers.handleApiError(error));
    }
  };

  const handleEventSaved = () => {
    setShowEventForm(false);
    setEditingEvent(null);
    loadEvents();
  };

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const formatReminderText = (minutes?: number) => {
    if (!minutes) return '';
    if (minutes < 60) return `${minutes}m before`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h before`;
    const days = Math.floor(hours / 24);
    return `${days}d before`;
  };

  const isUpcoming = (eventDateTime: string) => {
    return new Date(eventDateTime) > new Date();
  };

  const isPast = (eventDateTime: string) => {
    return new Date(eventDateTime) < new Date();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                     style={{ backgroundColor: '#483b85' }}>
                  📅
                </div>
                Event Studio
              </h1>
              <p className="text-gray-600 mt-2">Schedule and manage your events with reminders</p>
            </div>
            <button
              onClick={() => setShowEventForm(true)}
              className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#483b85' }}
            >
              <Plus className="w-4 h-4" />
              New Event
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="Search events..."
                value={filters.search || ''}
                onChange={(e) => updateFilters({ search: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent bg-white"
                style={{ '--tw-ring-color': '#483b85' } as React.CSSProperties}
              />
            </div>

            <select
              value={filters.categoryId || ''}
              onChange={(e) => updateFilters({ categoryId: e.target.value ? parseInt(e.target.value) : undefined })}
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
              value={filters.sortDirection || 'asc'}
              onChange={(e) => updateFilters({ sortDirection: e.target.value as 'asc' | 'desc' })}
              className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent bg-white text-sm"
              style={{ '--tw-ring-color': '#483b85' } as React.CSSProperties}
            >
              <option value="asc">📅 Upcoming First</option>
              <option value="desc">📅 Recent First</option>
            </select>
          </div>
        </div>

        {/* Events List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {events.map((event) => {
                const { date, time } = formatDateTime(event.eventDateTime);
                const upcoming = isUpcoming(event.eventDateTime);
                const past = isPast(event.eventDateTime);
                
                return (
                  <div 
                    key={event.id} 
                    className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow ${
                      past ? 'opacity-75' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="text-2xl">
                            {event.isRecurring ? EVENT_ICONS.recurring : EVENT_ICONS.default}
                          </div>
                          <div>
                            <Link
                              to={`/events/${event.eventNumber}`}
                              className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                            >
                              #{event.eventNumber} {event.title}
                            </Link>
                            {event.masterEventTitle && (
                              <p className="text-sm text-gray-500">
                                Part of: {event.masterEventTitle}
                              </p>
                            )}
                          </div>
                          {upcoming && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-green-800 bg-green-100">
                              Upcoming
                            </span>
                          )}
                          {past && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-gray-800 bg-gray-100">
                              Past
                            </span>
                          )}
                        </div>

                        {event.description && (
                          <p className="text-gray-600 mb-4 line-clamp-2">
                            {event.description}
                          </p>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                          {/* Date & Time */}
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <div>
                              <div className="font-medium">{date}</div>
                              <div className="text-xs">{time}</div>
                            </div>
                          </div>

                          {/* Location */}
                          {event.location && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <MapPin className="w-4 h-4" />
                              <span className="truncate">{event.location}</span>
                            </div>
                          )}

                          {/* Reminder */}
                          {event.reminderMinutes && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Clock className="w-4 h-4" />
                              <span>{formatReminderText(event.reminderMinutes)}</span>
                            </div>
                          )}

                          {/* Recurring */}
                          {event.isRecurring && event.recurringPattern && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Repeat className="w-4 h-4" />
                              <span>
                                {RECURRING_PATTERN_LABELS[event.recurringPattern]}
                                {event.recurringInterval && event.recurringInterval > 1 && 
                                  ` (${event.recurringInterval})`}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Category */}
                        {event.categoryName && (
                          <div className="mb-4">
                            <span
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white"
                              style={{ backgroundColor: event.categoryColor }}
                            >
                              {event.categoryName}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => {
                            setEditingEvent(event);
                            setShowEventForm(true);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {events.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 text-4xl mb-4">📅</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
                <p className="text-gray-500 mb-4">Start scheduling your first event</p>
                <button
                  onClick={() => setShowEventForm(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: '#483b85' }}
                >
                  <Plus className="w-4 h-4" />
                  Create Event
                </button>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Showing {events.length} of {totalElements} events
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
                    const page = Math.max(0, Math.min(totalPages - 5, (filters.page || 0) - 2)) + i;
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

      {/* Modal */}
      {showEventForm && (
        <EventFormModal
          userId={userId}
          categories={categories}
          event={editingEvent}
          onClose={() => {
            setShowEventForm(false);
            setEditingEvent(null);
          }}
          onSave={handleEventSaved}
        />
      )}
    </div>
  );
};