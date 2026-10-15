import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [checking, setChecking] = React.useState<boolean>(!user);

  React.useEffect(() => {
    if (!user) {
      refreshUser().finally(() => setChecking(false));
    } else {
      setChecking(false);
    }
  }, []);

  if (checking) {
    return (
      <div className="loginx-loading-screen">
        <div className="loginx-spinner-ring"></div>
        <p className="loginx-loading-text">Verifying secure session...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace state={{ openModal: 'signin' }} />;
  }

  return <Outlet />;
};

export const PublicOnlyRoute: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loginx-loading-screen">
        <div className="loginx-spinner-ring"></div>
        <p className="loginx-loading-text">Initializing...</p>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/portal" replace />;
  }

  return <Outlet />;
};
