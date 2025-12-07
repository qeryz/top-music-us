import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';

// Placeholder for Dashboard (we'll build this next)
const Dashboard = ({ onLogout }: { onLogout: () => void }) => {
    return (
        <div className="flex h-screen flex-col items-center justify-center bg-background-dark text-white font-display">
            <h1 className="text-3xl mb-4">Welcome to Your Dashboard</h1>
             <button 
                onClick={onLogout}
                className="bg-primary text-black font-bold py-2 px-4 rounded-full hover:bg-[#1ed760] transition-colors"
            >
                Logout
            </button>
        </div>
    );
};

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
        const checkAuth = () => {
             // 1. Check for login success from URL (redirect from backend)
            const params = new URLSearchParams(location.search);
            const loginSuccess = params.get('login') === 'success';

            if (loginSuccess) {
                setIsAuthenticated(true);
                // Clear the query param
                window.history.replaceState({}, document.title, window.location.pathname);
                setLoading(false);
                return;
            }

            // 2. Check for existing cookie (simple check)
            // Note: httpOnly cookies can't be read by JS, but we can assume if we persisted state 
            // or if we make an API call that succeeds, we are auth'd.
            // For this simple demo, we'll rely on the session state usually, 
            // but since we refresh on reload, we need a way to persist.
            // Let's check if we have a non-httpOnly cookie or just try to fetch user data.
            // ideally we hit an endpoint like /api/me to verify.
            
            // For now, let's just default to false if no URL param, 
            // essentially requiring re-login on refresh for this strict MVP unless we add user fetching.
            // To make it better, let's assume if we are on dashboard we might be auth'd? No, that's unsafe.
            
            // IMPROVEMENT: Let's try to fetch a protected resource to verify auth.
            // But for the specific "login flow" request, URL param is the key trigger.
             document.cookie.split(';').some((item) => item.trim().startsWith('access_token=')) 
                ? setIsAuthenticated(true) 
                : setIsAuthenticated(false);

            setLoading(false);
        };

        checkAuth();
    }, [location]);

    const handleLogout = () => {
        // Clear cookies (needs backend support usually for httpOnly, or just clear client state)
        // For now, just reset state
        setIsAuthenticated(false);
        navigate('/');
    };

    if (loading) {
        return <div className="flex h-screen items-center justify-center bg-background-dark text-white">Loading...</div>;
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
                        <Dashboard onLogout={handleLogout} />
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
