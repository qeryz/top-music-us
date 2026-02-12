import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import NavBar from './components/NavBar';
import { AuthProvider, useAuth } from './context/AuthContext';

// Lazy Load Pages
const TripPlanner = lazy(() => import('./pages/TripPlanner'));
const TripPreview = lazy(() => import('./pages/TripPreview'));

// Loading Fallback Component
const PageLoader = () => (
    <div className="flex h-screen items-center justify-center bg-zinc-950 text-white">
        <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-white/60 font-medium">Loading...</p>
        </div>
    </div>
);

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated, isLoading } = useAuth();
    
    if (isLoading) {
        return <PageLoader />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }
    return <>{children}</>;
};

const AppContent = () => {
    const { isAuthenticated, isLoading, login, logout } = useAuth();

    if (isLoading) {
        return <PageLoader />;
    }

    return (
        <>
            <NavBar 
                isAuthenticated={isAuthenticated} 
                onLogin={login} 
                onLogout={logout} 
            />
            <Suspense fallback={<PageLoader />}>
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
            </Suspense>
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
