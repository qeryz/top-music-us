import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import TripPlanner from './pages/TripPlanner';
import TripPreview from './pages/TripPreview';

// Protected Route Component
const ProtectedRoute = ({ isAuthenticated, children }: { isAuthenticated: boolean, children: React.ReactNode }) => {
    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }
    return <>{children}</>;
};

const AppContent = () => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = async () => {
            // 1. Check for login success from URL (redirect from backend)
            const params = new URLSearchParams(location.search);
            const loginSuccess = params.get('login') === 'success';

            if (loginSuccess) {
                localStorage.setItem('is_authenticated', 'true');
                setIsAuthenticated(true);
                // Clear the query param
                window.history.replaceState({}, document.title, window.location.pathname);
                setLoading(false);
                return;
            }

            // 2. Check localStorage (since httpOnly cookies are invisible to JS)
            const storedAuth = localStorage.getItem('is_authenticated') === 'true';
            if (storedAuth) {
                setIsAuthenticated(true);
            } else {
                 // Fallback: check visible cookies just in case
                const hasCookie = document.cookie.split(';').some((item) => item.trim().startsWith('access_token='));
                setIsAuthenticated(hasCookie);
                if (hasCookie) localStorage.setItem('is_authenticated', 'true');
            }

            setLoading(false);
        };

        checkAuth();
    }, [location]);

    const handleLogout = () => {
        localStorage.removeItem('is_authenticated');
        setIsAuthenticated(false);
        navigate('/');
    };

    if (loading) {
        return <div className="flex h-screen items-center justify-center bg-black text-white">Loading...</div>;
    }

    return (
        <Routes>
            <Route path="/" element={
                isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
            } />
            <Route 
                path="/dashboard" 
                element={
                    <ProtectedRoute isAuthenticated={isAuthenticated}>
                        <TripPlanner onLogout={handleLogout} />
                    </ProtectedRoute>
                } 
            />
            <Route 
                path="/trip-preview" 
                element={
                    <ProtectedRoute isAuthenticated={isAuthenticated}>
                        <TripPreview />
                    </ProtectedRoute>
                } 
            />
        </Routes>
    );
};

function App() {
  return (
    <Router>
       <AppContent />
    </Router>
  );
}

export default App;
