import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  FileText, 
  Target, 
  Lightbulb, 
  Calendar,
  Tag,
  User,
  LogOut,
  Sparkles
} from 'lucide-react';

interface SidebarProps {
  userId: number;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ userId, onLogout }) => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const navItems = [
    {
      path: '/',
      icon: Home,
      label: 'Dashboard',
      emoji: '🏠'
    },
    {
      path: '/tasks',
      icon: FileText,
      label: 'Tasks',
      emoji: '📝',
      description: 'Deadlines & priorities'
    },
    {
      path: '/habits',
      icon: Target,
      label: 'Habits',
      emoji: '🎯',
      description: 'Progress sessions'
    },
    {
      path: '/notes',
      icon: Lightbulb,
      label: 'Notes',
      emoji: '💭',
      description: 'Ideas & thoughts'
    },
    {
      path: '/events',
      icon: Calendar,
      label: 'Events',
      emoji: '📅',
      description: 'Schedule & reminders'
    }
  ];

  const utilityItems = [
    {
      path: '/categories',
      icon: Tag,
      label: 'Categories',
      emoji: '🏷️'
    },
    {
      path: '/profile',
      icon: User,
      label: 'Profile',
      emoji: '👤'
    }
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen fixed left-0 top-0 z-30">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 flex-shrink-0">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
               style={{ backgroundColor: '#483b85' }}>
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Sonic Task Hub</h1>
            <p className="text-xs text-gray-500">Productivity reimagined</p>
          </div>
        </Link>
      </div>

      {/* Navigation - Scrollable */}
      <div className="flex-1 overflow-y-auto py-6">
        {/* Main Navigation */}
        <div className="px-3 mb-8">
          <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Main
          </h3>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                    active
                      ? 'text-white shadow-sm'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  style={active ? { backgroundColor: '#483b85' } : {}}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-lg">{item.emoji}</span>
                    <div>
                      <div className={`font-medium ${active ? 'text-white' : 'text-gray-900'}`}>
                        {item.label}
                      </div>
                      {item.description && (
                        <div className={`text-xs ${active ? 'text-gray-200' : 'text-gray-500'}`}>
                          {item.description}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Utility Navigation */}
        <div className="px-3">
          <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Utilities
          </h3>
          <nav className="space-y-1">
            {utilityItems.map((item) => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                    active
                      ? 'text-white shadow-sm'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  style={active ? { backgroundColor: '#483b85' } : {}}
                >
                  <span className="text-lg mr-3">{item.emoji}</span>
                  <span className={active ? 'text-white' : 'text-gray-900'}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer - Fixed at bottom */}
      <div className="p-3 border-t border-gray-200 flex-shrink-0">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
};