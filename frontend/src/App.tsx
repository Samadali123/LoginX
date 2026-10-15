import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Landing } from './pages/Landing';
import { Home } from './pages/Home';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Single Public Landing Page (Login & Sign Up open as popups on this page) */}
          <Route path="/" element={<Landing />} />

          {/* Redirect any /login or /register direct routes to "/" with modal popup trigger */}
          <Route path="/login" element={<Navigate to="/" replace state={{ openModal: 'signin' }} />} />
          <Route path="/register" element={<Navigate to="/" replace state={{ openModal: 'signup' }} />} />

          {/* Protected portal routes: strictly redirects to "/" if not authenticated */}
          <Route element={<ProtectedRoute />}>
            <Route path="/portal" element={<Home />} />
            <Route path="/dashboard" element={<Home />} />
            <Route path="/home" element={<Home />} />
          </Route>

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
