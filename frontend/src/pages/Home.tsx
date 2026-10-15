import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  LogOut,
  Mail,
  Fingerprint,
  Calendar,
  ShieldCheck,
  Lock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logoImg from '../assets/Logo.png';

export const Home: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      navigate('/', { replace: true });
    } catch {
      navigate('/', { replace: true });
    } finally {
      setLoggingOut(false);
    }
  };

  if (!user) {
    return null;
  }

  const formattedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Active Session';

  return (
    <div className="elite-canvas">
      {/* Precision Background */}
      <div className="elite-grid-backdrop" />
      <div className="elite-radial-ambient" />

      {/* Top Precision Navbar: Logo left and Theme-matching Dark Sign Out button right */}
      <header className="elite-navbar">
        <div className="elite-nav-inner">
          <Link to="/" className="elite-brand">
            <img src={logoImg} alt="LoginX Logo" className="elite-brand-logo" />
            <span className="elite-brand-title">LoginX</span>
          </Link>

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="elite-portal-signout"
            id="portal-signout-btn"
            title="Sign out of your account"
          >
            <LogOut size={14} />
            <span>{loggingOut ? 'Signing Out...' : 'Sign Out'}</span>
          </button>
        </div>
      </header>

      {/* Main Content: High-UX Psychological Architecture */}
      <main className="elite-portal-content">
        <div className="elite-portal-hero">
          <h1 className="elite-portal-title">Welcome back, {user.username}</h1>
          <p className="elite-portal-subtitle">
            Your official LoginX identity is authenticated and protected by isolated cryptographic vaults.
          </p>
        </div>

        {/* Executive Identity Card */}
        <div className="elite-identity-card">
          {/* Identity Summary Header */}
          <div className="elite-identity-header">
            <div className="elite-identity-avatar">
              <span>{user.username.charAt(0).toUpperCase()}</span>
            </div>
            <div className="elite-identity-meta">
              <h2 className="elite-identity-name">{user.username}</h2>
              <div className="elite-identity-email">
                <Mail size={13} />
                <span>{user.email}</span>
              </div>
            </div>
          </div>

          {/* Clean Row-based Credential Architecture */}
          <div className="elite-identity-specs">
            {/* Citizen Identifier Row */}
            <div className="elite-spec-row">
              <div className="elite-spec-key">
                <Fingerprint size={15} />
                <span>Citizen UUID</span>
              </div>
              <div className="elite-spec-val-group">
                <span className="elite-spec-val mono">{user.id}</span>
              </div>
            </div>

            {/* Registration Date Row */}
            <div className="elite-spec-row">
              <div className="elite-spec-key">
                <Calendar size={15} />
                <span>Account Created</span>
              </div>
              <div className="elite-spec-val-group">
                <span className="elite-spec-val">{formattedDate}</span>
              </div>
            </div>

            {/* In-Transit Encryption Row */}
            <div className="elite-spec-row">
              <div className="elite-spec-key">
                <Lock size={15} />
                <span>Transit Protection</span>
              </div>
              <div className="elite-spec-val-group">
                <span className="elite-spec-val">RSA-OAEP 2048-Bit (SHA-256)</span>
              </div>
            </div>

            {/* Session Security Row */}
            <div className="elite-spec-row">
              <div className="elite-spec-key">
                <ShieldCheck size={15} />
                <span>Session Architecture</span>
              </div>
              <div className="elite-spec-val-group">
                <span className="elite-spec-val security-highlight">
                  HTTP-Only Cookie (15m JWT Session)
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer matching Landing Page */}
      <footer className="elite-footer">
        <div className="elite-footer-inner centered">
          <p className="elite-footer-brand-title">LoginX — Secure Authentication & Identity Platform</p>
          <p className="elite-copyright">© 2026 LoginX Inc. Designed with zero-knowledge privacy and end-to-end security.</p>
        </div>
      </footer>
    </div>
  );
};
