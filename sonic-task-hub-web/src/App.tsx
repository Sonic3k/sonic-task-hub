import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { TaskStudio } from './pages/TaskStudio';
import { ItemDetailPage } from './pages/ItemDetailPage';
import { Sidebar } from './components/Sidebar';
import './styles/App.css';

const AppContent: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="h-screen flex overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <Routes>
          <Route 
            path="/" 
            element={<Navigate to="/studio" replace />} 
          />
          <Route 
            path="/studio" 
            element={<TaskStudio userId={user!.id} />} 
          />
          <Route 
            path="/studio/item/:itemNumber" 
            element={<ItemDetailPage userId={user!.id} />} 
          />
          <Route 
            path="*" 
            element={<Navigate to="/studio" replace />} 
          />
        </Routes>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#483b85',
              color: '#fff',
              borderRadius: '8px',
              fontSize: '14px',
            },
            success: {
              iconTheme: {
                primary: '#198754',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#dc3545',
                secondary: '#fff',
              },
            },
          }}
        />
      </Router>
    </AuthProvider>
  );
};

export default App;