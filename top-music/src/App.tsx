import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';

// Placeholder for Dashboard (we'll build this next)
const Dashboard = () => {
    return (
        <div className="flex h-screen items-center justify-center bg-background-dark text-white font-display">
            <h1 className="text-3xl">Welcome to Your Dashboard</h1>
        </div>
    );
};

// Protected Route Component (Placeholder)
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    // In a real app, check for auth token/cookie or global auth state
    // For now, we'll check for the 'login=success' query param from the callback redirect
    // or the presence of the cookie (which we can't fully check in JS if httpOnly)
    // We'll rely on a simple API call check in the Dashboard itself later.
    
    // Simplest verification for demo:
    const params = new URLSearchParams(window.location.search);
    const success = params.get('login') === 'success';

    // This is VERY naive client-side protection. Real protection is on the API.
    // If we're successful, or if we assume we have cookies:
    return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        {/* We'll add the dashboard route properly once we have auth state management */}
         <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
