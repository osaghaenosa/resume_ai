// LoginRouteWrapper.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import LoginPage from '../components/LoginPage.tsx';
import { User } from '../types';

const LoginRouteWrapper: React.FC = () => {
  const navigate = useNavigate();
  
  const handleLoginSuccess = (user: User) => {
    navigate('/');
  };
  
  const handleNavigateToSignup = () => {
    navigate('/signup');
  };
  
  const handleNavigateToForgotPassword = () => {
    // Handle forgot password navigation
    navigate('/forgotpassword');
  };
  
  return (
    <LoginPage 
      onLoginSuccess={handleLoginSuccess}
      onNavigateToSignup={handleNavigateToSignup}
      onNavigateToForgotPassword={handleNavigateToForgotPassword}
    />
  );
};

export default LoginRouteWrapper;