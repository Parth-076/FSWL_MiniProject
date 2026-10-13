import React from 'react';
import { Link } from 'react-router-dom';
import { Home, AlertCircle, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="container" id="not-found-view" style={{ textAlign: 'center', padding: '6rem 1rem' }}>
      <div className="not-found-icon-box">
        <AlertCircle size={32} />
      </div>

      <h1 style={{ fontSize: '3rem', marginBottom: '0.5rem', fontFamily: 'var(--font-display)' }}>404</h1>
      <h2 style={{ fontSize: '1.35rem', marginBottom: '1rem', color: 'var(--text-main)' }}>Page Not Found</h2>
      <p style={{ color: 'var(--text-muted)', maxWidth: '450px', margin: '0 auto 2.5rem', fontSize: '0.95rem' }}>
        The page or short link you are looking for doesn't exist, has been removed, or has expired.
      </p>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
        <Link to="/" className="btn btn-primary" id="not-found-home-btn">
          <Home size={15} />
          <span>Return Home</span>
        </Link>
        <Link to="/dashboard" className="btn btn-secondary" id="not-found-dashboard-btn">
          <ArrowLeft size={15} />
          <span>To Dashboard</span>
        </Link>
      </div>
    </div>
  );
}
