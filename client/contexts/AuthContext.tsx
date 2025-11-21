import React, {
  createContext, useState, useContext, ReactNode, useEffect, useCallback,
} from 'react';
import axios from 'axios';
import {
  User, Document, SignupCredentials, LoginCredentials, DocumentRequest
} from '../types';

const API = import.meta.env.VITE_API_URL;
const SHARE_API = import.meta.env.VITE_SHARE_API_URL;
const BASE_API = import.meta.env.VITE_LOCAL_API_URL;

interface AuthContextType {
  currentUser: User | null;
  login: (credentials: LoginCredentials) => Promise<User>;
  signup: (credentials: SignupCredentials) => Promise<User>;
  logout: () => void;
  resetPassword: (email: string) => Promise<void>;
  consumeToken: () => Promise<void>;
  upgradePlan: () => Promise<void>;
  addDocument: (doc: Omit<Document, 'id' | 'createdAt' | 'isPublic'>, request: DocumentRequest) => Promise<Document>;
  updateDocument: (doc: Document, request: DocumentRequest) => Promise<Document>;
  deleteDocument: (docId: string) => Promise<void>;
  publishDocument: (docId: string) => Promise<void>;
  getPublicDocument: (docId: string) => Promise<Document | null>;
  generationCompleted: boolean;
  markGenerationCompleted: () => void;
  clearGenerationCompleted: () => void;
  saveImage: (file: File) => Promise<string>; // Add this line
  resetPasswordWithToken: (token: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [generationCompleted, setGenerationCompleted] = useState(false);

  const authHeaders = () => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No token found');
    return { Authorization: `Bearer ${token}` };
  };
  
  // In your AuthContext.tsx - fix the resetPassword method
const resetPassword = async (email: string) => {
  try {
    // Change this from /reset-password to /forgot-password
    await axios.post(`${API}/auth/forgot-password`, { email });
  } catch (error: any) {
    console.error('Error resetting password:', error);
    throw new Error(error.response?.data?.message || 'Failed to reset password');
  }
};

const resetPasswordWithToken = async (token: string, newPassword: string) => {
  try {
    // This should match your backend endpoint
    await axios.post(`${API}/auth/reset-password`, { 
      token, 
      newPassword 
    });
  } catch (error: any) {
    console.error('Error resetting password:', error);
    throw new Error(error.response?.data?.message || 'Failed to reset password');
  }
};

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.get(`${API}/user/me`, { headers: authHeaders() })
        .then(res => setCurrentUser(res.data.user))
        .catch(() => logout());
    }
  }, []);
  
  const saveImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('image', file);
  
  try {
    const response = await axios.post(`${BASE_API}/upload`, formData, {
      headers: {
        ...authHeaders(),
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data.imageUrl; // Should return something like "/uploads/filename.jpg"
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

  const signup = async (credentials: SignupCredentials) => {
  try {
    const res = await axios.post(`${API}/auth/signup`, credentials);
    const { user, token } = res.data;
    localStorage.setItem("token", token);
    setCurrentUser(user);
    return user;
  } catch (error: any) {
    console.error("Signup error:", error.response?.data || error);
    throw new Error(error.response?.data?.message || "Signup failed");
  }
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

  const consumeToken = async () => {
    const res = await axios.post(`${API}/user/consumeToken`, {}, { headers: authHeaders() });
    setCurrentUser(res.data.user);
  };

  const upgradePlan = async () => {
    const res = await axios.post(`${API}/user/upgradePlan`, {}, { headers: authHeaders() });
    setCurrentUser(res.data.user);
  };

  const addDocument = async (
    doc: Omit<Document, 'id' | 'createdAt' | 'isPublic'>,
    request: DocumentRequest
  ): Promise<Document> => {
    const res = await axios.post(
      `${API}/user/documents`,
      { ...doc, sourceRequest: request },
      { headers: authHeaders() }
    );
    setCurrentUser(res.data.user);
    return res.data.document;
  };

  const updateDocument = async (
  doc: Document,
  request: DocumentRequest
): Promise<Document> => {
  try {
    if (!doc.id) throw new Error("Missing document ID");

    const res = await axios.put(
      `${API}/user/documents/${doc.id}`,
      {
        ...doc,
        sourceRequest: request
      },
      { headers: authHeaders() }
    );

    if (!res.data.user || !res.data.document) {
      throw new Error("Invalid response structure from server");
    }

    // Update current user state
    setCurrentUser(prev => {
      if (!prev) return null;
      
      // Update the specific document in the user's documents array
      const updatedDocuments = prev.documents?.map(d => 
        d.id === doc.id ? res.data.document : d
      ) || [];
      
      return {
        ...prev,
        documents: updatedDocuments,
        ...res.data.user // Merge any other user updates
      };
    });

    return res.data.document;
  } catch (error) {
    console.error('Error updating document:', error);
    throw error; // Re-throw for the calling component to handle
  }
};

  const deleteDocument = async (docId: string) => {
    const res = await axios.delete(`${API}/user/documents/${docId}`, {
      headers: authHeaders()
    });
    setCurrentUser(res.data.user);
  };

  const publishDocument = async (docId: string) => {
    const res = await axios.post(`${API}/user/documents/${docId}/publish`, {}, {
      headers: authHeaders()
    });
    setCurrentUser(res.data.user);
  };

  const getPublicDocument = async (docId: string): Promise<Document | null> => {
  try {
    const res = await axios.get(`${SHARE_API}/${docId}`);
    return res.data;
  } catch (err) {
    alert('❌ Failed to fetch document from server');
    console.error('Error fetching public doc:', err);
    return null;
  }
};

  const markGenerationCompleted = () => setGenerationCompleted(true);
  const clearGenerationCompleted = () => setGenerationCompleted(false);

  return (
    <AuthContext.Provider value={{
      currentUser,
      login,
      signup,
      logout,
      resetPassword,
      consumeToken,
      upgradePlan,
      addDocument,
      updateDocument,
      deleteDocument,
      publishDocument,
      getPublicDocument,
      generationCompleted,
      markGenerationCompleted,
      clearGenerationCompleted,
      saveImage,
      resetPasswordWithToken
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
