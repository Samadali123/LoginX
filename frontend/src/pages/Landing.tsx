import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AuthModal } from '../components/AuthModal';
import logoImg from '../assets/Logo.png';

interface LandingProps {
  initialModal?: 'signin' | 'signup' | null;
}

export const Landing: React.FC<LandingProps> = ({ initialModal = null }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  // Initialize modal state from route state or props
  const [authModal, setAuthModal] = useState<'signin' | 'signup' | null>(() => {
    return initialModal || (location.state as any)?.openModal || null;
  });

  // Sync state if initialModal or navigation state triggers modal
  useEffect(() => {
    if (initialModal) {
      setAuthModal(initialModal);
    } else if ((location.state as any)?.openModal) {
      setAuthModal((location.state as any).openModal);
    }
  }, [initialModal, location.state]);

  const handleCloseModal = () => {
    setAuthModal(null);
  };

  const handleOpenModal = (mode: 'signin' | 'signup') => {
    setAuthModal(mode);
  };

  return (
    <div className="elite-canvas">
      {/* Precision Engineering Dot Grid Background */}
      <div className="elite-grid-backdrop" />
      <div className="elite-radial-ambient" />

      {/* Top Precision Navbar */}
      <header className="elite-navbar">
        <div className="elite-nav-inner">
          {/* Brand: Logo + LoginX */}
          <Link to="/" className="elite-brand">
            <img src={logoImg} alt="LoginX Logo" className="elite-brand-logo" />
            <span className="elite-brand-title">LoginX</span>
          </Link>

          {/* Navigation Action Buttons: Only Sign Up in Navbar */}
          <div className="elite-nav-actions">
            {user ? (
              <div className="elite-user-badge">
                <span className="elite-user-id">
                  {user.username}
                </span>
                <Link to="/portal" className="elite-btn-cta">
                  <span>Enter Portal</span>
                  <ArrowRight size={14} />
                </Link>
                <button
                  onClick={() => logout()}
                  className="elite-icon-btn"
                  title="Sign out"
                  aria-label="Sign out"
                >
                  <LogOut size={15} />
                </button>
              </div>
            ) : (
              <div className="elite-guest-actions">
                <button
                  type="button"
                  onClick={() => handleOpenModal('signup')}
                  className="elite-btn-cta"
                  id="nav-signup-trigger"
                >
                  <span>Sign Up</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Hero Viewport */}
      <main className="elite-hero-container">
        {/* Hero Title */}
        <h1 className="elite-hero-title">
          Sign In with absolute confidence
        </h1>

        {/* Human Psychology Subtitle */}
        <p className="elite-hero-subtitle">
          Engineered for users who refuse compromise. Passwords encrypted on-device before transmission,
          guarded by isolated HTTP-Only cookies, and sealed into zero-knowledge vaults.
        </p>

        {/* Main Hero Call to Actions: Only Sign In in Hero */}
        <div className="elite-hero-ctas">
          {user ? (
            <Link to="/portal" className="elite-primary-cta">
              <span>Go to Your Citizen Portal</span>
              <ArrowRight size={18} />
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => handleOpenModal('signin')}
              className="elite-primary-cta"
              id="hero-signin-cta"
            >
              <span>Sign In to LoginX</span>
            </button>
          )}
        </div>
      </main>

      {/* Modern Centered Footer */}
      <footer className="elite-footer">
        <div className="elite-footer-inner centered">
          <p className="elite-footer-brand-title">
            LoginX — Secure Authentication & Identity Platform
          </p>
          <p className="elite-copyright">
            © 2026 LoginX Inc. Designed with zero-knowledge privacy and end-to-end security.
          </p>
        </div>
      </footer>

      {/* Authentication Popup Modal */}
      <AuthModal
        isOpen={authModal !== null}
        initialMode={authModal || 'signin'}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default Landing;
