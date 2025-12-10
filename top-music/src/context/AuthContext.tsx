import React, { createContext, useContext, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: any;
    login: () => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [user, setUser] = useState<any>(null); // Placeholder for future user data

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
                // Clear the query param to clean up URL
                window.history.replaceState({}, document.title, window.location.pathname);
                setIsLoading(false);
                return;
            }

            // 2. Check localStorage (since httpOnly cookies are invisible to JS)
            const storedAuth = localStorage.getItem('is_authenticated') === 'true';
            if (storedAuth) {
                setIsAuthenticated(true);
            } else {
                 // Fallback check for cookie existence (visual only)
                const hasCookie = document.cookie.split(';').some((item) => item.trim().startsWith('access_token='));
                setIsAuthenticated(hasCookie);
                if (hasCookie) localStorage.setItem('is_authenticated', 'true');
            }

            setIsLoading(false);
        };

        checkAuth();
    }, [location]);

    const login = () => {
        // Redirect to Backend Login Endpoint
        window.location.href = 'http://127.0.0.1:5000/login';
    };

    const logout = () => {
        localStorage.removeItem('is_authenticated');
        setIsAuthenticated(false);
        setUser(null);
        navigate('/');
    };

    return (
        <AuthContext.Provider value={{
            isAuthenticated,
            isLoading,
            user,
            login,
            logout,
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthProvider;