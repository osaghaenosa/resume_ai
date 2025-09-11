
// LoginRouteWrapper.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import SignupPage from '../components/SignupPage.tsx';
import { User } from '../types';

const SignupRouteWrapper: React.FC = () => {
  const navigate = useNavigate();
  
  const handleLoginSuccess = (user: User) => {
    navigate('/');
  };
  
  const handleNavigateToLogin = () => {
    navigate('/login');
  };
  
  const handleNavigateToForgotPassword = () => {
    // Handle forgot password navigation
    alert('Forgot password functionality');
  };
  
  return (
    <SignupPage 
      onLoginSuccess={handleLoginSuccess}
      onNavigateToLogin={handleNavigateToLogin}
      onNavigateToForgotPassword={handleNavigateToForgotPassword}
    />
  );
};

export default SignupRouteWrapper;