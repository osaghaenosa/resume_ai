import React, {
  createContext, useState, useContext, ReactNode, useEffect
} from 'react';
import axios from 'axios';
import {
  User, Document,
  SignupCredentials, LoginCredentials,
  DocumentRequest
} from '../types';

const API = process.env.REACT_APP_API_URL;

interface AuthContextType {
  currentUser: User | null;
  login: (credentials: LoginCredentials) => Promise<User>;
  signup: (credentials: SignupCredentials) => Promise<User>;
  logout: () => void;
  consumeToken: () => Promise<void>;
  upgradePlan: () => Promise<void>;
  addDocument: (
    doc: Omit<Document, 'id' | 'createdAt' | 'isPublic'>,
    request: DocumentRequest
  ) => Promise<Document>;
  updateDocument: (
    doc: Document,
    request: DocumentRequest
  ) => Promise<Document>;
  deleteDocument: (docId: string) => Promise<void>;
  publishDocument: (docId: string) => Promise<void>;
  getPublicDocument: (docId: string) => Promise<Document | null>;
  generationCompleted: boolean;
  markGenerationCompleted: () => void;
  clearGenerationCompleted: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [generationCompleted, setGenerationCompleted] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.get(`${API}/user/me`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => setCurrentUser(res.data.user))
        .catch(() => logout());
    }
  }, []);

  const signup = async (credentials: SignupCredentials) => {
    const res = await axios.post(`${API}/auth/signup`, credentials);
    const { user, token } = res.data;
    localStorage.setItem('token', token);
    setCurrentUser(user);
    return user;
  };

  const login = async (credentials: LoginCredentials) => {
    const res = await axios.post(`${API}/auth/login`, credentials);
    const { user, token } = res.data;
    localStorage.setItem('token', token);
    setCurrentUser(user);
    return user;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
  };

  const authHeaders = () => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error("No token found");
    return { Authorization: `Bearer ${token}` };
  };

  const consumeToken = async () => {
    const res = await axios.post(`${API}/user/consumeToken`, {}, { headers: authHeaders() });
    setCurrentUser(res.data.user);
  };

  const upgradePlan = async () => {
    const res = await axios.post(`${API}/user/upgradePlan`, {}, { headers: authHeaders() });
    setCurrentUser(res.data.user);
  };

  const addDocument = async (doc: Omit<Document, 'id' | 'createdAt' | 'isPublic'>, request: DocumentRequest) => {
    const res = await axios.post(`${API}/user/documents`, { ...doc, sourceRequest: request }, { headers: authHeaders() });
    setCurrentUser(res.data.user);
    return res.data.document;
  };

  const updateDocument = async (doc: Document, request: DocumentRequest) => {
    if (!doc.id) throw new Error("Missing document ID for update");

    const res = await axios.put(`${API}/user/documents/${doc.id}`, {
      title: doc.title,
      content: doc.content,
      sourceRequest: request
    }, { headers: authHeaders() });

    setCurrentUser(res.data.user);
    return res.data.document;
  };



  const deleteDocument = async (docId: string) => {
    const res = await axios.delete(`${API}/user/documents/${docId}`, { headers: authHeaders() });
    setCurrentUser(res.data.user);
  };

  const publishDocument = async (docId: string) => {
    const res = await axios.post(`${API}/user/documents/${docId}/publish`, {}, { headers: authHeaders() });
    setCurrentUser(res.data.user);
  };

  const getPublicDocument = async (docId: string) => {
    try {
      const res = await axios.get(`${API}/public/documents/${docId}`);
      return res.data.document;
    } catch {
      return null;
    }
  };

  const markGenerationCompleted = () => setGenerationCompleted(true);
  const clearGenerationCompleted = () => setGenerationCompleted(false);

  return (
    <AuthContext.Provider value={{
      currentUser, login, signup, logout,
      consumeToken, upgradePlan,
      addDocument, updateDocument, deleteDocument,
      publishDocument, getPublicDocument,
      generationCompleted, markGenerationCompleted,
      clearGenerationCompleted
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
