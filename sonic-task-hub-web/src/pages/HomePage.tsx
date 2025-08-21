import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, TrendingUp, Clock, Calendar, Users } from 'lucide-react';
import { Task, Habit, Note, Event, TaskStatus, HabitStatus, NoteStatus } from '../types';
import { taskApi, habitApi, noteApi, eventApi, apiHelpers } from '../services/api';

interface HomePageProps {
  userId: number;
}

export const HomePage: React.FC<HomePageProps> = ({ userId }) => {
  const [stats, setStats] = useState({
    tasks: { total: 0, pending: 0, completed: 0 },
    habits: { total: 0, active: 0, completed: 0 },
    notes: { total: 0, active: 0 },
    events: { total: 0, upcoming: 0 }
  });
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [activeHabits, setActiveHabits] = useState<Habit[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [userId]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load recent data with small page sizes for dashboard
      const [tasksRes, habitsRes, notesRes, eventsRes] = await Promise.all([
        taskApi.getWithFilters(userId, { page: 0, size: 5, sortBy: 'createdAt', sortDirection: 'desc' }),
        habitApi.getWithFilters(userId, { status: HabitStatus.ACTIVE, page: 0, size: 3 }),
        noteApi.getWithFilters(userId, { status: NoteStatus.ACTIVE, page: 0, size: 1 }),
        eventApi.getWithFilters(userId, { page: 0, size: 5, sortBy: 'eventDateTime', sortDirection: 'asc' })
      ]);

      // Set recent items
      if (tasksRes.data.success) {
        setRecentTasks(tasksRes.data.data.content);
        setStats(prev => ({
          ...prev,
          tasks: {
            total: tasksRes.data.data.totalElements,
            pending: tasksRes.data.data.content.filter(t => t.status === TaskStatus.PENDING).length,
            completed: tasksRes.data.data.content.filter(t => t.status === TaskStatus.COMPLETED).length
          }
        }));
      }

      if (habitsRes.data.success) {
        setActiveHabits(habitsRes.data.data.content);
        setStats(prev => ({
          ...prev,
          habits: {
            total: habitsRes.data.data.totalElements,
            active: habitsRes.data.data.content.filter(h => h.status === HabitStatus.ACTIVE).length,
            completed: habitsRes.data.data.content.filter(h => h.status === HabitStatus.COMPLETED).length
          }
        }));
      }

      if (notesRes.data.success) {
        setStats(prev => ({
          ...prev,
          notes: {
            total: notesRes.data.data.totalElements,
            active: notesRes.data.data.content.filter(n => n.status === NoteStatus.ACTIVE).length
          }
        }));
      }

      if (eventsRes.data.success) {
        const now = new Date();
        const upcoming = eventsRes.data.data.content.filter(e => new Date(e.eventDateTime) > now);
        setUpcomingEvents(upcoming);
        setStats(prev => ({
          ...prev,
          events: {
            total: eventsRes.data.data.totalElements,
            upcoming: upcoming.length
          }
        }));
      }

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const getProgressPercentage = (habit: Habit) => {
    if (!habit.targetDays || habit.targetDays === 0) return 0;
    return Math.min((habit.completedDays / habit.targetDays) * 100, 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's your productivity overview.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link to="/tasks" className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tasks</p>
                <p className="text-2xl font-bold text-gray-900">{stats.tasks.total}</p>
                <p className="text-xs text-gray-500">{stats.tasks.pending} pending</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📝</span>
              </div>
            </div>
          </Link>

          <Link to="/habits" className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Habits</p>
                <p className="text-2xl font-bold text-gray-900">{stats.habits.total}</p>
                <p className="text-xs text-gray-500">{stats.habits.active} active</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🎯</span>
              </div>
            </div>
          </Link>

          <Link to="/notes" className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Notes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.notes.total}</p>
                <p className="text-xs text-gray-500">{stats.notes.active} active</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">💭</span>
              </div>
            </div>
          </Link>

          <Link to="/events" className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Events</p>
                <p className="text-2xl font-bold text-gray-900">{stats.events.total}</p>
                <p className="text-xs text-gray-500">{stats.events.upcoming} upcoming</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📅</span>
              </div>
            </div>
          </Link>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Recent Tasks */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Tasks</h2>
              <Link 
                to="/tasks" 
                className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
              >
                View all
              </Link>
            </div>
            
            {recentTasks.length > 0 ? (
              <div className="space-y-3">
                {recentTasks.slice(0, 4).map((task) => (
                  <div key={task.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {task.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {task.dueDate ? `Due ${formatDate(task.dueDate)}` : 'No due date'}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      task.status === TaskStatus.COMPLETED ? 'bg-green-100 text-green-800' :
                      task.status === TaskStatus.IN_PROGRESS ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {task.status.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 text-2xl mb-2">📝</div>
                <p className="text-sm text-gray-500 mb-3">No tasks yet</p>
                <Link 
                  to="/tasks"
                  className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                >
                  <Plus className="w-4 h-4" />
                  Create your first task
                </Link>
              </div>
            )}
          </div>

          {/* Active Habits */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Active Habits</h2>
              <Link 
                to="/habits" 
                className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
              >
                View all
              </Link>
            </div>
            
            {activeHabits.length > 0 ? (
              <div className="space-y-4">
                {activeHabits.map((habit) => (
                  <div key={habit.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-gray-900">{habit.title}</h3>
                      <span className="text-xs text-gray-500">
                        {habit.completedDays}/{habit.targetDays || 0} days
                      </span>
                    </div>
                    {habit.targetDays && (
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full transition-all"
                          style={{ 
                            width: `${getProgressPercentage(habit)}%`,
                            backgroundColor: '#483b85'
                          }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 text-2xl mb-2">🎯</div>
                <p className="text-sm text-gray-500 mb-3">No active habits</p>
                <Link 
                  to="/habits"
                  className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                >
                  <Plus className="w-4 h-4" />
                  Start building habits
                </Link>
              </div>
            )}
          </div>

          {/* Upcoming Events */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Upcoming Events</h2>
              <Link 
                to="/events" 
                className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
              >
                View all
              </Link>
            </div>
            
            {upcomingEvents.length > 0 ? (
              <div className="space-y-3">
                {upcomingEvents.slice(0, 4).map((event) => {
                  const { date, time } = formatDateTime(event.eventDateTime);
                  return (
                    <div key={event.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {event.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {date} at {time}
                        </p>
                      </div>
                      {event.isRecurring && (
                        <span className="text-xs text-blue-600">🔄</span>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 text-2xl mb-2">📅</div>
                <p className="text-sm text-gray-500 mb-3">No upcoming events</p>
                <Link 
                  to="/events"
                  className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                >
                  <Plus className="w-4 h-4" />
                  Schedule an event
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              to="/tasks"
              className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-colors"
            >
              <span className="text-2xl">📝</span>
              <span className="text-sm font-medium text-gray-700">New Task</span>
            </Link>
            
            <Link
              to="/habits"
              className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-green-400 hover:bg-green-50 transition-colors"
            >
              <span className="text-2xl">🎯</span>
              <span className="text-sm font-medium text-gray-700">New Habit</span>
            </Link>
            
            <Link
              to="/notes"
              className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-purple-400 hover:bg-purple-50 transition-colors"
            >
              <span className="text-2xl">💭</span>
              <span className="text-sm font-medium text-gray-700">New Note</span>
            </Link>
            
            <Link
              to="/events"
              className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-yellow-400 hover:bg-yellow-50 transition-colors"
            >
              <span className="text-2xl">📅</span>
              <span className="text-sm font-medium text-gray-700">New Event</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};