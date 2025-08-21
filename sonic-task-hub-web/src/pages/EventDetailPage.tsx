import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, Edit2, Trash2, Calendar, Clock, MapPin, 
  Repeat, Bell, Tag, Hash
} from 'lucide-react';
import { 
  Event, 
  Category,
  RecurringPattern,
  EVENT_ICONS,
  RECURRING_PATTERN_LABELS
} from '../types';
import { eventApi, categoryApi, apiHelpers } from '../services/api';
import { EventFormModal } from '../components/EventFormModal';
import toast from 'react-hot-toast';

interface EventDetailPageProps {
  userId: number;
}

export const EventDetailPage: React.FC<EventDetailPageProps> = ({ userId }) => {
  const { eventNumber } = useParams<{ eventNumber: string }>();
  const navigate = useNavigate();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    if (eventNumber) {
      loadEvent();
      loadCategories();
    }
  }, [eventNumber, userId]);

  const loadEvent = async () => {
    try {
      setLoading(true);
      const response = await eventApi.getByNumber(userId, parseInt(eventNumber!));
      
      if (response.data.success && response.data.data) {
        setEvent(response.data.data);
      }
    } catch (error) {
      toast.error('Event not found');
      navigate('/events');
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

  const handleDelete = async () => {
    if (!event || !confirm('Are you sure you want to delete this event?')) return;
    
    try {
      await eventApi.delete(userId, event.id);
      toast.success('Event deleted!');
      navigate('/events');
    } catch (error) {
      toast.error(apiHelpers.handleApiError(error));
    }
  };

  const handleEventSaved = () => {
    setShowEditModal(false);
    loadEvent();
  };

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return {
      date: date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const formatReminderText = (minutes?: number) => {
    if (!minutes) return 'No reminder';
    if (minutes < 60) return `${minutes} minutes before`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} before`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} before`;
  };

  const isUpcoming = () => {
    if (!event) return false;
    return new Date(event.eventDateTime) > new Date();
  };

  const isPast = () => {
    if (!event) return false;
    return new Date(event.eventDateTime) < new Date();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Event not found</h2>
          <Link to="/events" className="text-blue-600 hover:text-blue-700">
            ← Back to Events
          </Link>
        </div>
      </div>
    );
  }

  const { date, time } = formatDateTime(event.eventDateTime);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              to="/events"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">
                  {event.isRecurring ? EVENT_ICONS.recurring : EVENT_ICONS.default}
                </span>
                <h1 className="text-2xl font-bold text-gray-900">
                  #{event.eventNumber} {event.title}
                </h1>
                {isUpcoming() && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-green-800 bg-green-100">
                    Upcoming
                  </span>
                )}
                {isPast() && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-gray-800 bg-gray-100">
                    Past
                  </span>
                )}
              </div>
              {event.masterEventTitle && (
                <p className="text-sm text-gray-600">
                  Part of: <span className="font-medium">{event.masterEventTitle}</span>
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowEditModal(true)}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleDelete}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Date & Time Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">When</h2>
                  <p className="text-sm text-gray-600">Event date and time</p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-lg font-medium text-gray-900">{date}</p>
                <p className="text-gray-600 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {time}
                </p>
              </div>
            </div>

            {/* Location Card */}
            {event.location && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Where</h2>
                    <p className="text-sm text-gray-600">Event location</p>
                  </div>
                </div>
                <p className="text-gray-900">{event.location}</p>
              </div>
            )}

            {/* Description */}
            {event.description && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Description
                </h2>
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">{event.description}</p>
                </div>
              </div>
            )}

            {/* Recurring Info */}
            {event.isRecurring && event.recurringPattern && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Repeat className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Recurring Pattern</h2>
                    <p className="text-sm text-gray-600">This event repeats</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-gray-900">
                    {RECURRING_PATTERN_LABELS[event.recurringPattern]}
                    {event.recurringInterval && event.recurringInterval > 1 && 
                      ` (every ${event.recurringInterval})`}
                  </p>
                  {event.recurringEndDate && (
                    <p className="text-sm text-gray-600">
                      Until: {new Date(event.recurringEndDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Event Details */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Hash className="w-5 h-5 text-gray-400" />
                Event Details
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-600">Type</label>
                  <div className="mt-1 text-sm text-gray-900">
                    {event.isRecurring ? 'Recurring Event' : 'Single Event'}
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-600">Reminder</label>
                  <div className="mt-1 flex items-center gap-2">
                    <Bell className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-900">
                      {formatReminderText(event.reminderMinutes)}
                    </span>
                  </div>
                </div>

                {event.categoryName && (
                  <div>
                    <label className="text-sm text-gray-600">Category</label>
                    <div className="mt-1">
                      <span
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white"
                        style={{ backgroundColor: event.categoryColor }}
                      >
                        <Tag className="w-3 h-3 mr-1" />
                        {event.categoryName}
                      </span>
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-sm text-gray-600">Created</label>
                  <div className="mt-1 text-sm text-gray-900">
                    {new Date(event.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-yellow-900 mb-1">Event Tips</h3>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    {isUpcoming() ? (
                      <>
                        <li>• Add this to your calendar app</li>
                        <li>• Set additional reminders if needed</li>
                        <li>• Plan your travel time to the location</li>
                      </>
                    ) : (
                      <>
                        <li>• This event has already occurred</li>
                        <li>• You can still edit details if needed</li>
                        <li>• Consider adding follow-up notes</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <EventFormModal
          userId={userId}
          categories={categories}
          event={event}
          onClose={() => setShowEditModal(false)}
          onSave={handleEventSaved}
        />
      )}
    </div>
  );
};