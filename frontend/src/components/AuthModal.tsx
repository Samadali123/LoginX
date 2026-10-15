import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'signin' | 'signup';
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'signin',
  onClose,
}) => {
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);

  // Sign In state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginSubmitted, setLoginSubmitted] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Sign Up state
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirm, setShowRegConfirm] = useState(false);
  const [regSubmitted, setRegSubmitted] = useState(false);
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);
  const [isDuplicateUser, setIsDuplicateUser] = useState(false);

  // Sync mode when initialMode changes
  useEffect(() => {
    if (initialMode) {
      setMode(initialMode);
      setLoginError(null);
      setRegError(null);
      setIsDuplicateUser(false);
    }
  }, [initialMode]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Validation rules for Sign In
  const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/i;
  const isLoginEmailEmpty = loginEmail.trim().length === 0;
  const isLoginEmailInvalid = !isLoginEmailEmpty && !emailRegex.test(loginEmail.trim());
  const isLoginPasswordEmpty = loginPassword.length === 0;

  // Validation rules for Sign Up
  const isRegUsernameValid = regUsername.trim().length >= 3;
  const isRegEmailValid = emailRegex.test(regEmail.trim());
  const hasMinLength = regPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(regPassword);
  const hasLowercase = /[a-z]/.test(regPassword);
  const hasNumber = /[0-9]/.test(regPassword);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(regPassword);
  const isRegPasswordValid =
    hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecial;
  const isRegConfirmMatched =
    regConfirmPassword.length > 0 && regConfirmPassword === regPassword;

  // Sign In Handler
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginSubmitted(true);
    setLoginError(null);

    if (isLoginEmailEmpty || isLoginEmailInvalid || isLoginPasswordEmpty) {
      return;
    }

    try {
      setLoginLoading(true);
      await login(loginEmail.trim().toLowerCase(), loginPassword);
      onClose();
      navigate('/portal', { replace: true });
    } catch {
      // User specification: show exact message "Email or Password is incorrect"
      setLoginError('Email or Password is incorrect');
    } finally {
      setLoginLoading(false);
    }
  };

  // Sign Up Handler
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegSubmitted(true);
    setRegError(null);
    setIsDuplicateUser(false);

    if (!isRegUsernameValid || !isRegEmailValid || !isRegPasswordValid || !isRegConfirmMatched) {
      return;
    }

    try {
      setRegLoading(true);
      await register(regEmail.trim().toLowerCase(), regUsername.trim(), regPassword);
      onClose();
      navigate('/portal', { replace: true });
    } catch (err: any) {
      const msg = err.message || '';
      if (
        msg.toLowerCase().includes('already') ||
        msg.toLowerCase().includes('registered') ||
        err.status === 409
      ) {
        setIsDuplicateUser(true);
        setRegError('Already Registered');
      } else {
        setRegError(msg || 'Sign Up could not be completed at this time.');
      }
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div className="elite-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className={`elite-modal-dialog ${loginError || regError ? 'shake-effect' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle top ambient glow inside modal */}
        <div className="modal-glow-top" />

        {/* Minimal Close Button */}
        <button
          className="elite-modal-dismiss"
          onClick={onClose}
          aria-label="Close authentication modal"
        >
          <X size={17} />
        </button>

        {/* Unified Brand Header */}
        <div className="elite-modal-header">
          <h2 className="modal-title">
            {mode === 'signin' ? 'Sign In to LoginX' : 'Sign Up for LoginX'}
          </h2>
          <p className="modal-subtitle">
            {mode === 'signin'
              ? 'Enter your credentials to access your secure portal.'
              : 'Create your official protected citizen identity.'}
          </p>

          {/* Precision Sliding Segment Control */}
          <div className="modal-segment-control">
            <button
              type="button"
              className={`segment-btn ${mode === 'signin' ? 'active' : ''}`}
              onClick={() => {
                setMode('signin');
                setLoginError(null);
              }}
              id="segment-tab-signin"
            >
              Sign In
            </button>
            <button
              type="button"
              className={`segment-btn ${mode === 'signup' ? 'active' : ''}`}
              onClick={() => {
                setMode('signup');
                setRegError(null);
                setIsDuplicateUser(false);
              }}
              id="segment-tab-signup"
            >
              Sign Up
            </button>
          </div>
        </div>

        {/* Modal Form Area */}
        <div className="elite-modal-body">
          {/* ================= SIGN IN TAB ================= */}
          {mode === 'signin' && (
            <form onSubmit={handleLoginSubmit} noValidate>
              {loginError && (
                <div className="elite-alert-banner error" role="alert">
                  <AlertCircle size={16} className="alert-icon" />
                  <span className="alert-text">{loginError}</span>
                </div>
              )}

              {/* Email Address Only */}
              <div className="elite-input-group">
                <label className="elite-label" htmlFor="popup-email">
                  EMAIL ADDRESS <span className="req-dot">*</span>
                </label>
                <div
                  className={`elite-input-container ${
                    loginSubmitted && (isLoginEmailEmpty || isLoginEmailInvalid)
                      ? 'has-error'
                      : ''
                  }`}
                >
                  <Mail size={16} className="field-icon-left" />
                  <input
                    id="popup-email"
                    type="email"
                    className="elite-input"
                    placeholder="example@gmail.com"
                    value={loginEmail}
                    onChange={(e) => {
                      setLoginEmail(e.target.value);
                      if (loginError) setLoginError(null);
                    }}
                    autoComplete="email"
                    autoFocus
                  />
                </div>
                {loginSubmitted && isLoginEmailEmpty && (
                  <div className="elite-field-error">Please enter your email address</div>
                )}
                {loginSubmitted && isLoginEmailInvalid && (
                  <div className="elite-field-error">Please enter a valid Gmail address (e.g. example@gmail.com)</div>
                )}
              </div>

              {/* Password */}
              <div className="elite-input-group">
                <label className="elite-label" htmlFor="popup-password">
                  PASSWORD <span className="req-dot">*</span>
                </label>
                <div
                  className={`elite-input-container ${
                    loginSubmitted && isLoginPasswordEmpty ? 'has-error' : ''
                  }`}
                >
                  <Lock size={16} className="field-icon-left" />
                  <input
                    id="popup-password"
                    type={showLoginPassword ? 'text' : 'password'}
                    className="elite-input"
                    placeholder="••••••••••••"
                    value={loginPassword}
                    onChange={(e) => {
                      setLoginPassword(e.target.value);
                      if (loginError) setLoginError(null);
                    }}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="field-toggle-btn"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                    tabIndex={-1}
                  >
                    {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {loginSubmitted && isLoginPasswordEmpty && (
                  <div className="elite-field-error">Please enter your password to sign in</div>
                )}
              </div>

              {/* Authorize & Sign In CTA */}
              <button
                type="submit"
                className="elite-submit-button"
                disabled={loginLoading}
                id="modal-submit-signin"
              >
                {loginLoading ? (
                  <span>Signing In...</span>
                ) : (
                  <span>Sign In</span>
                )}
              </button>

              {/* Switch to Sign Up */}
              <div className="modal-footer-switch">
                Don't have an account?{' '}
                <button
                  type="button"
                  className="switch-link-btn"
                  onClick={() => {
                    setMode('signup');
                    setLoginError(null);
                    setIsDuplicateUser(false);
                  }}
                >
                  Sign Up
                </button>
              </div>
            </form>
          )}

          {/* ================= SIGN UP TAB ================= */}
          {mode === 'signup' && (
            <form onSubmit={handleRegisterSubmit} noValidate>
              {regError && (
                <div
                  className={`elite-alert-banner ${isDuplicateUser ? 'conflict' : 'error'}`}
                  role="alert"
                >
                  <AlertCircle size={16} className="alert-icon" />
                  <div className="alert-body">
                    <span>{regError}</span>
                  </div>
                </div>
              )}

              {/* 1. Username Field */}
              <div className="elite-input-group">
                <label className="elite-label" htmlFor="popup-reg-user">
                  USERNAME <span className="req-dot">*</span>
                </label>
                <div
                  className={`elite-input-container ${
                    regSubmitted && !isRegUsernameValid ? 'has-error' : ''
                  }`}
                >
                  <User size={16} className="field-icon-left" />
                  <input
                    id="popup-reg-user"
                    type="text"
                    className="elite-input"
                    placeholder="e.g. citizen_alex"
                    value={regUsername}
                    onChange={(e) => {
                      setRegUsername(e.target.value);
                      if (regError) setRegError(null);
                    }}
                    autoComplete="username"
                    autoFocus
                  />
                </div>
                {regSubmitted && !isRegUsernameValid && (
                  <div className="elite-field-error">
                    Username is required and must be at least 3 characters
                  </div>
                )}
              </div>

              {/* 2. Email Address Field */}
              <div className="elite-input-group">
                <label className="elite-label" htmlFor="popup-reg-mail">
                  EMAIL ADDRESS <span className="req-dot">*</span>
                </label>
                <div
                  className={`elite-input-container ${
                    regSubmitted && !isRegEmailValid ? 'has-error' : ''
                  }`}
                >
                  <Mail size={16} className="field-icon-left" />
                  <input
                    id="popup-reg-mail"
                    type="email"
                    className="elite-input"
                    placeholder="example@gmail.com"
                    value={regEmail}
                    onChange={(e) => {
                      setRegEmail(e.target.value);
                      if (regError) setRegError(null);
                    }}
                    autoComplete="email"
                  />
                </div>
                {regSubmitted && !isRegEmailValid && (
                  <div className="elite-field-error">
                    {regEmail.trim().length === 0
                      ? 'Please enter your email address'
                      : 'Only Gmail addresses are permitted (e.g. example@gmail.com)'}
                  </div>
                )}
              </div>

              {/* 3. Password Field */}
              <div className="elite-input-group">
                <label className="elite-label" htmlFor="popup-reg-pass">
                  PASSWORD <span className="req-dot">*</span>
                </label>
                <div
                  className={`elite-input-container ${
                    regSubmitted && !isRegPasswordValid ? 'has-error' : ''
                  }`}
                >
                  <Lock size={16} className="field-icon-left" />
                  <input
                    id="popup-reg-pass"
                    type={showRegPassword ? 'text' : 'password'}
                    className="elite-input"
                    placeholder="Create a strong password"
                    value={regPassword}
                    onChange={(e) => {
                      setRegPassword(e.target.value);
                      if (regError) setRegError(null);
                    }}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="field-toggle-btn"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    aria-label={showRegPassword ? 'Hide password' : 'Show password'}
                    tabIndex={-1}
                  >
                    {showRegPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {/* Real-time Dynamic Password Complexity Checklist */}
                {regPassword.length > 0 && (
                  <div className="password-micro-checklist">
                    <span className={`micro-item ${hasMinLength ? 'met' : ''}`}>8+ chars</span>
                    <span className={`micro-item ${hasUppercase ? 'met' : ''}`}>Uppercase</span>
                    <span className={`micro-item ${hasLowercase ? 'met' : ''}`}>Lowercase</span>
                    <span className={`micro-item ${hasNumber ? 'met' : ''}`}>Number</span>
                    <span className={`micro-item ${hasSpecial ? 'met' : ''}`}>Symbol</span>
                  </div>
                )}

                {regSubmitted && !isRegPasswordValid && (
                  <div className="elite-field-error">
                    {regPassword.length === 0
                      ? 'Please enter a password'
                      : 'Password must have 8+ chars with uppercase, lowercase, number & symbol'}
                  </div>
                )}
              </div>

              {/* 4. Confirm Password Field */}
              <div className="elite-input-group">
                <label className="elite-label" htmlFor="popup-reg-repass">
                  CONFIRM PASSWORD <span className="req-dot">*</span>
                </label>
                <div
                  className={`elite-input-container ${
                    regSubmitted && !isRegConfirmMatched ? 'has-error' : ''
                  }`}
                >
                  <Lock size={16} className="field-icon-left" />
                  <input
                    id="popup-reg-repass"
                    type={showRegConfirm ? 'text' : 'password'}
                    className="elite-input"
                    placeholder="Re-enter your password to confirm"
                    value={regConfirmPassword}
                    onChange={(e) => {
                      setRegConfirmPassword(e.target.value);
                      if (regError) setRegError(null);
                    }}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="field-toggle-btn"
                    onClick={() => setShowRegConfirm(!showRegConfirm)}
                    aria-label={showRegConfirm ? 'Hide password' : 'Show password'}
                    tabIndex={-1}
                  >
                    {showRegConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {regSubmitted && !isRegConfirmMatched && (
                  <div className="elite-field-error">
                    {regConfirmPassword.length === 0
                      ? 'Please confirm your password'
                      : 'Passwords do not match'}
                  </div>
                )}
              </div>

              {/* Sign Up Submit CTA */}
              <button
                type="submit"
                className="elite-submit-button"
                disabled={regLoading}
                id="modal-submit-signup"
              >
                {regLoading ? (
                  <span>Creating Account...</span>
                ) : (
                  <span>Sign Up</span>
                )}
              </button>

              {/* Switch to Sign In */}
              <div className="modal-footer-switch">
                Already have an account?{' '}
                <button
                  type="button"
                  className="switch-link-btn"
                  onClick={() => {
                    setMode('signin');
                    setLoginError(null);
                  }}
                >
                  Sign In
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
