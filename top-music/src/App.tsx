import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import TripPlanner from './pages/TripPlanner';
import TripPreview from './pages/TripPreview';
import NavBar from './components/NavBar';
import { AuthProvider, useAuth } from './context/AuthContext';

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated, isLoading } = useAuth();
    
    if (isLoading) {
        return <div className="flex h-screen items-center justify-center bg-black text-white">Loading...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }
    return <>{children}</>;
};

const AppContent = () => {
    const { isAuthenticated, isLoading, login, logout } = useAuth();

    if (isLoading) {
        return <div className="flex h-screen items-center justify-center bg-black text-white">Loading...</div>;
    }

    return (
        <>
            <NavBar 
                isAuthenticated={isAuthenticated} 
                onLogin={login} 
                onLogout={logout} 
            />
            <Routes>
                <Route path="/" element={
                    isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
                } />
                <Route 
                    path="/dashboard" 
                    element={
                        <ProtectedRoute>
                            <TripPlanner />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/trip-preview" 
                    element={
                        <ProtectedRoute>
                            <TripPreview />
                        </ProtectedRoute>
                    } 
                />
            </Routes>
        </>
    );
};

import { SpotifyPlayerProvider } from './context/SpotifyPlayerContext';

function App() {
  return (
    <Router>
       <AuthProvider>
          <SpotifyPlayerProvider>
             <AppContent />
          </SpotifyPlayerProvider>
       </AuthProvider>
    </Router>
  );
}

export default App;
