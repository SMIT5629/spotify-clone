import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, setAuthToken } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const checkAuth = async () => {
        try {
            const data = await authApi.getMe();
            if (data && data.user) {
                setUser(data.user);
            }
        } catch (error) {
            // Not logged in or invalid token
            setUser(null);
            setAuthToken(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const login = async (identifier, password) => {
        const payload = identifier.includes('@') 
            ? { email: identifier, password } 
            : { username: identifier, password };

        const data = await authApi.login(payload);
        if (data.token) {
            setAuthToken(data.token);
        }
        setUser(data.user);
        return data;
    };

    const register = async (username, email, password, role = 'user') => {
        const data = await authApi.register({ username, email, password, role });
        if (data.token) {
            setAuthToken(data.token);
        }
        setUser(data.user);
        return data;
    };

    const logout = async () => {
        try {
            await authApi.logout();
        } catch (e) {
            console.error('Logout error:', e);
        } finally {
            setAuthToken(null);
            setUser(null);
        }
    };

    const updateProfile = async (formData) => {
        const data = await authApi.updateProfile(formData);
        if (data.user) {
            setUser(data.user);
        }
        return data;
    };

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated: !!user,
            isLoading,
            login,
            register,
            logout,
            updateProfile,
            refreshUser: checkAuth
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
