import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Music, LogOut, ChevronLeft, ChevronRight, Settings, Palette } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const navigation = [
    { name: 'Task Studio', href: '/studio', icon: Palette, description: 'Hub Management' },
    // Future navigation items:
    // { name: 'Main Hub', href: '/hub', icon: Home, description: 'Daily Overview' },
    // { name: 'Analytics', href: '/analytics', icon: BarChart3, description: 'Progress Insights' },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <div className={`bg-white border-r border-gray-200 transition-all duration-300 flex flex-col h-screen ${
      collapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Header - Only logo uses purple */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center gap-3">
              {/* Logo - Purple accent */}
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                   style={{ backgroundColor: '#483b85' }}>
                <Music className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  Sonic Task Hub
                </h1>
                <p className="text-xs text-gray-500">Productivity System</p>
              </div>
            </div>
          )}
          {/* Collapse button - neutral */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-gray-400" />
            )}
          </button>
        </div>
      </div>

      {/* Navigation - Subtle active state */}
      <div className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all group ${
                  isActive
                    ? 'bg-gray-100 text-gray-900 border-r-2'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
                style={isActive ? { borderRightColor: '#483b85' } : {}}
                title={collapsed ? item.name : ''}
              >
                {/* Icon - purple only when active */}
                <item.icon className={`w-5 h-5 ${
                  isActive 
                    ? 'text-gray-700' 
                    : 'text-gray-400 group-hover:text-gray-600'
                }`} />
                {!collapsed && (
                  <div className="flex-1">
                    <div className={`font-medium ${
                      isActive 
                        ? 'text-gray-900' 
                        : 'text-gray-700 group-hover:text-gray-900'
                    }`}>
                      {item.name}
                    </div>
                    <div className={`text-xs ${
                      isActive 
                        ? 'text-gray-500' 
                        : 'text-gray-500 group-hover:text-gray-600'
                    }`}>
                      {item.description}
                    </div>
                  </div>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Profile - Purple avatar, neutral controls */}
      <div className="border-t border-gray-100 p-3">
        <div className="flex items-center gap-3">
          {/* Avatar - Purple accent */}
          <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-medium"
               style={{ backgroundColor: '#483b85' }}>
            {user?.displayName?.charAt(0)?.toUpperCase() || user?.username?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">
                {user?.displayName || user?.username}
              </div>
              <div className="text-xs text-gray-500 truncate">
                {user?.email || 'Task Hub Manager'}
              </div>
            </div>
          )}
        </div>
        
        {/* Action buttons - neutral with subtle hover */}
        {!collapsed && (
          <div className="flex items-center gap-1 mt-3">
            <button
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs text-gray-600 hover:bg-gray-100 hover:text-gray-700 rounded-md transition-colors"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
              Settings
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center px-3 py-2 text-xs text-gray-600 hover:bg-gray-100 hover:text-red-600 rounded-md transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
        
        {collapsed && (
          <div className="flex flex-col gap-1 mt-3">
            <button
              className="p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 rounded-md transition-colors"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:bg-gray-100 hover:text-red-600 rounded-md transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};