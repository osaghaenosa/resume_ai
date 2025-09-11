import React from 'react';
import { useNavigate } from 'react-router-dom';
import ForgotPasswordPage from '../components/ForgotPasswordPage';

const ForgotPasswordRouteWrapper: React.FC = () => {
  const navigate = useNavigate();
  
  const handleBackToLogin = () => {
    navigate('/login');
  };
  
  return (
    <ForgotPasswordPage 
      onBackToLogin={handleBackToLogin}
    />
  );
};

export default ForgotPasswordRouteWrapper;