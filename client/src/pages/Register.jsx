import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, UserPlus, AlertCircle } from 'lucide-react';

export default function Register() {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      setError('Name is required.');
      return;
    }
    if (!trimmedEmail) {
      setError('Email address is required.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      await register({
        name: trimmedName,
        email: trimmedEmail,
        password
      });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" id="register-view">
      <div className="auth-wrapper">
        <div className="card">
          <div className="auth-header">
            <h1>Create Account</h1>
            <p style={{ color: 'var(--text-muted)' }}>Start shortening, sharing, and tracking links today</p>
          </div>

          {error && (
            <div className="error-banner" id="register-error-alert" style={{ marginBottom: '1.5rem' }} role="alert">
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} id="register-form" noValidate>
            <div className="form-group">
              <label htmlFor="register-name" className="form-label">Full Name</label>
              <div className="input-group">
                <User className="input-icon" size={16} style={{ left: '0.9rem' }} />
                <input
                  id="register-name"
                  type="text"
                  className="form-control"
                  style={{ paddingLeft: '2.5rem' }}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Mercer"
                  autoComplete="name"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="register-email" className="form-label">Email Address</label>
              <div className="input-group">
                <Mail className="input-icon" size={16} style={{ left: '0.9rem' }} />
                <input
                  id="register-email"
                  type="email"
                  className="form-control"
                  style={{ paddingLeft: '2.5rem' }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="register-password" className="form-label">Password (min 6 characters)</label>
              <div className="input-group">
                <Lock className="input-icon" size={16} style={{ left: '0.9rem' }} />
                <input
                  id="register-password"
                  type="password"
                  className="form-control"
                  style={{ paddingLeft: '2.5rem' }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                  autoComplete="new-password"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="register-confirm-password" className="form-label">Confirm Password</label>
              <div className="input-group">
                <Lock className="input-icon" size={16} style={{ left: '0.9rem' }} />
                <input
                  id="register-confirm-password"
                  type="password"
                  className="form-control"
                  style={{ paddingLeft: '2.5rem' }}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              id="register-submit-btn"
              style={{ width: '100%', marginTop: '0.75rem', padding: '0.75rem' }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="loading-spinner" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <UserPlus size={16} />
                  <span>Register</span>
                </>
              )}
            </button>
          </form>

          <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" className="auth-footer-link" id="link-to-login">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
