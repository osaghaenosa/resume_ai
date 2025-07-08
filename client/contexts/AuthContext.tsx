// === AuthContext.tsx (Updated Frontend with MongoDB + Node.js Backend) ===

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { User, UserPlan, Document, SignupCredentials, LoginCredentials } from '../types';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';
const CURRENT_USER_ID_KEY = 'aiResumeGenCurrentUser';

interface AuthContextType {
    currentUser: User | null;
    login: (credentials: LoginCredentials) => Promise<void>;
    signup: (credentials: SignupCredentials) => Promise<void>;
    logout: () => void;
    consumeToken: () => void;
    upgradePlan: () => void;
    addDocument: (doc: Omit<Document, 'id' | 'createdAt'>) => void;
    updateDocument: (doc: Document) => void;
    deleteDocument: (docId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    useEffect(() => {
        const userId = localStorage.getItem(CURRENT_USER_ID_KEY);
        if (userId) {
            axios.get(`${API_URL}/user/${userId}`)
                .then(res => setCurrentUser(res.data))
                .catch(() => localStorage.removeItem(CURRENT_USER_ID_KEY));
        }
    }, []);

    const signup = async (credentials: SignupCredentials): Promise<void> => {
        const res = await axios.post(`${API_URL}/auth/signup`, credentials);
        setCurrentUser(res.data);
        localStorage.setItem(CURRENT_USER_ID_KEY, res.data._id);
    };

    const login = async (credentials: LoginCredentials): Promise<void> => {
        const res = await axios.post(`${API_URL}/auth/login`, credentials);
        setCurrentUser(res.data);
        localStorage.setItem(CURRENT_USER_ID_KEY, res.data._id);
    };

    const logout = () => {
        setCurrentUser(null);
        localStorage.removeItem(CURRENT_USER_ID_KEY);
    };

    const updateUser = async (updatedUser: User) => {
        await axios.put(`${API_URL}/user/${updatedUser._id}`, updatedUser);
        setCurrentUser(updatedUser);
    };

    const consumeToken = () => {
        if (!currentUser || currentUser.tokens <= 0) return;
        const updated = { ...currentUser, tokens: currentUser.tokens - 1 };
        updateUser(updated);
    };

    const upgradePlan = () => {
        if (!currentUser || currentUser.plan === 'Pro') return;
        const updated = { ...currentUser, plan: 'Pro', tokens: 100 };
        updateUser(updated);
    };

    const addDocument = (doc: Omit<Document, 'id' | 'createdAt'>) => {
        if (!currentUser) return;
        const newDoc: Document = {
            ...doc,
            id: `doc_${Date.now()}`,
            createdAt: new Date().toISOString(),
        };
        const updated = { ...currentUser, documents: [newDoc, ...currentUser.documents] };
        updateUser(updated);
    };

    const updateDocument = (updatedDoc: Document) => {
        if (!currentUser) return;
        const updated = {
            ...currentUser,
            documents: currentUser.documents.map(doc => doc.id === updatedDoc.id ? updatedDoc : doc)
        };
        updateUser(updated);
    };

    const deleteDocument = (docId: string) => {
        if (!currentUser) return;
        const updated = {
            ...currentUser,
            documents: currentUser.documents.filter(doc => doc.id !== docId)
        };
        updateUser(updated);
    };

    return (
        <AuthContext.Provider value={{ currentUser, login, signup, logout, consumeToken, upgradePlan, addDocument, updateDocument, deleteDocument }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};
