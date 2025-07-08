
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { User, UserPlan, Document, SignupCredentials, LoginCredentials } from '../types';

// --- Local Storage Database Wrapper ---
const DB_KEY = 'aiResumeGenUsers';
const CURRENT_USER_ID_KEY = 'aiResumeGenCurrentUser';

const db = {
    getUsers: (): User[] => {
        const usersJson = localStorage.getItem(DB_KEY);
        return usersJson ? JSON.parse(usersJson) : [];
    },
    saveUsers: (users: User[]) => {
        localStorage.setItem(DB_KEY, JSON.stringify(users));
    },
    getCurrentUserId: (): string | null => {
        return localStorage.getItem(CURRENT_USER_ID_KEY);
    },
    setCurrentUserId: (userId: string) => {
        localStorage.setItem(CURRENT_USER_ID_KEY, userId);
    },
    clearCurrentUserId: () => {
        localStorage.removeItem(CURRENT_USER_ID_KEY);
    }
};

// --- Auth Context ---
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

const TOKEN_CONFIG: Record<UserPlan, number> = {
    Free: 3,
    Pro: 100,
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    // Effect to load user from local storage on initial app load
    useEffect(() => {
        const userId = db.getCurrentUserId();
        if (userId) {
            const users = db.getUsers();
            const user = users.find(u => u.id === userId);
            if (user) {
                // Omit password from state for security
                const { password, ...userWithoutPassword } = user;
                setCurrentUser(userWithoutPassword);
            }
        }
    }, []);

    const updateUserInDb = (updatedUser: User) => {
        const users = db.getUsers();
        const userIndex = users.findIndex(u => u.id === updatedUser.id);
        if (userIndex !== -1) {
            users[userIndex] = updatedUser;
            db.saveUsers(users);
        }
    };
    
    const signup = async (credentials: SignupCredentials): Promise<void> => {
        const users = db.getUsers();
        if (users.some(user => user.email === credentials.email)) {
            throw new Error('An account with this email already exists.');
        }

        const newUser: User = {
            id: `user_${Date.now()}`,
            name: credentials.name,
            email: credentials.email,
            password: credentials.password, // In a real app, this would be hashed
            plan: 'Free',
            tokens: TOKEN_CONFIG.Free,
            documents: [],
        };
        
        users.push(newUser);
        db.saveUsers(users);
        db.setCurrentUserId(newUser.id);
        
        const { password, ...userForState } = newUser;
        setCurrentUser(userForState);
    };

    const login = async (credentials: LoginCredentials): Promise<void> => {
        const users = db.getUsers();
        const user = users.find(u => u.email === credentials.email);

        if (!user || user.password !== credentials.password) {
            throw new Error('Invalid email or password.');
        }

        db.setCurrentUserId(user.id);
        const { password, ...userForState } = user;
        setCurrentUser(userForState);
    };

    const logout = () => {
        db.clearCurrentUserId();
        setCurrentUser(null);
    };

    const performUserUpdate = (updateFn: (user: User) => User) => {
        setCurrentUser(prevUser => {
            if (!prevUser) return null;
            const updatedUser = updateFn(prevUser);
            // We need the full user object with password to save to DB
            const users = db.getUsers();
            const fullUser = users.find(u => u.id === updatedUser.id);
            if(fullUser) {
                updateUserInDb({ ...fullUser, ...updatedUser });
            }
            return updatedUser;
        });
    };

    const consumeToken = () => {
        performUserUpdate(user => user.tokens > 0 ? { ...user, tokens: user.tokens - 1 } : user);
    };
    
    const upgradePlan = () => {
         performUserUpdate(user => user.plan === 'Free' ? { ...user, plan: 'Pro', tokens: TOKEN_CONFIG.Pro } : user);
    };

    const addDocument = (doc: Omit<Document, 'id' | 'createdAt'>) => {
        const newDoc: Document = {
            ...doc,
            id: `doc_${Date.now()}`,
            createdAt: new Date().toISOString(),
        };
        performUserUpdate(user => ({
            ...user,
            documents: [newDoc, ...user.documents]
        }));
    };

    const updateDocument = (updatedDoc: Document) => {
        performUserUpdate(user => ({
            ...user,
            documents: user.documents.map(d => d.id === updatedDoc.id ? updatedDoc : d)
        }));
    };

    const deleteDocument = (docId: string) => {
        performUserUpdate(user => ({
            ...user,
            documents: user.documents.filter(d => d.id !== docId)
        }));
    };

    return (
        <AuthContext.Provider value={{ currentUser, login, signup, logout, consumeToken, upgradePlan, addDocument, updateDocument, deleteDocument }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
