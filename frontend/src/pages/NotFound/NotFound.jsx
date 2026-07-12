import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Common/Button';

const NotFound = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center space-y-6">
      <h1 className="text-4xl font-black text-brand-title">404 - Not Found</h1>
      <p className="text-sm text-slate-500 font-semibold uppercase tracking-wider">
        The requested operations deck is unavailable.
      </p>
      <Button onClick={() => navigate('/')}>Return to Mission Control</Button>
    </div>
  );
};

export default NotFound;
