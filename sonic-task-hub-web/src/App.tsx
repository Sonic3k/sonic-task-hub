import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthContext } from './contexts/AuthContext';
import { Sidebar } from './components/Sidebar';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { TaskStudio } from './pages/TaskStudio';
import { HabitStudio } from './pages/HabitStudio';
import { NoteStudio } from './pages/NoteStudio';
import { EventStudio } from './pages/EventStudio';
import { TaskDetailPage } from './pages/TaskDetailPage';
import { HabitDetailPage } from './pages/HabitDetailPage';
import { NoteDetailPage } from './pages/NoteDetailPage';
import { EventDetailPage } from './pages/EventDetailPage';
import { User } from './types';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
          
          {user ? (
            <>
              <Sidebar userId={user.id} onLogout={logout} />
              <div className="ml-64 min-h-screen">
                <Routes>
                  <Route path="/" element={<HomePage userId={user.id} />} />
                  <Route path="/tasks" element={<TaskStudio userId={user.id} />} />
                  <Route path="/tasks/:taskNumber" element={<TaskDetailPage userId={user.id} />} />
                  <Route path="/habits" element={<HabitStudio userId={user.id} />} />
                  <Route path="/habits/:habitNumber" element={<HabitDetailPage userId={user.id} />} />
                  <Route path="/notes" element={<NoteStudio userId={user.id} />} />
                  <Route path="/notes/:noteNumber" element={<NoteDetailPage userId={user.id} />} />
                  <Route path="/events" element={<EventStudio userId={user.id} />} />
                  <Route path="/events/:eventNumber" element={<EventDetailPage userId={user.id} />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </div>
            </>
          ) : (
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          )}
        </div>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;