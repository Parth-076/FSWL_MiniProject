import React, { useEffect, useState } from 'react';
import { urlAPI } from '../api';
import { X, BarChart3, ExternalLink, Calendar, MousePointerClick, QrCode } from 'lucide-react';

export default function AnalyticsModal({ url, onClose }) {
  const [analytics, setAnalytics] = useState(url);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchStats() {
      if (!url?._id) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const data = await urlAPI.getUrlAnalytics(url._id);
        if (isMounted && data?.url) {
          setAnalytics(data.url);
        }
      } catch (err) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchStats();
    return () => { isMounted = false; };
  }, [url]);

  if (!url) return null;

  const baseUrl = import.meta.env?.VITE_SHORT_URL_BASE || (import.meta.env?.VITE_API_BASE_URL ? import.meta.env.VITE_API_BASE_URL.replace(/\/api\/?$/, '') : window.location.origin);
  const shortUrl = `${baseUrl}/api/urls/${analytics.shortCode}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(shortUrl)}`;

  return (
    <div className="modal-backdrop" id="analytics-modal-backdrop" onClick={onClose}>
      <div 
        className="modal-content" 
        id="analytics-modal-dialog" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="analytics-modal-title"
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div className="stat-icon">
              <BarChart3 size={18} />
            </div>
            <h2 id="analytics-modal-title" style={{ fontSize: '1.25rem' }}>Link Analytics</h2>
          </div>

          <button 
            type="button" 
            className="btn-icon" 
            onClick={onClose}
            id="close-analytics-modal-btn"
            aria-label="Close analytics modal"
          >
            <X size={18} />
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div className="loading-spinner" style={{ margin: '0 auto 1rem' }} />
            <p style={{ color: 'var(--text-muted)' }}>Fetching latest engagement data...</p>
          </div>
        ) : error ? (
          <div className="error-banner">
            <span>{error}</span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Click Count Highlight */}
            <div className="modal-stat-box">
              <div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Engagements</span>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-display)' }}>
                  {analytics.clicks || 0}
                </div>
              </div>
              <div className="badge-clicks" style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem' }}>
                <MousePointerClick size={14} />
                <span>Active Track</span>
              </div>
            </div>

            {/* Links summary */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>Short Code</span>
                <span className="code-pill">
                  {analytics.shortCode}
                </span>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>Short Link</span>
                <a 
                  href={shortUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="modal-short-link"
                >
                  {shortUrl}
                  <ExternalLink size={13} />
                </a>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>Destination</span>
                <p style={{ color: 'var(--text-main)', wordBreak: 'break-all', fontSize: '0.85rem' }}>
                  {analytics.originalUrl}
                </p>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>Created At</span>
                <span style={{ color: 'var(--text-main)', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                  <Calendar size={13} />
                  {analytics.createdAt ? new Date(analytics.createdAt).toLocaleString() : 'N/A'}
                </span>
              </div>
            </div>

            {/* QR Code Section */}
            <div className="qr-box">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: 'var(--text-muted)', marginBottom: '0.75rem', fontSize: '0.85rem' }}>
                <QrCode size={15} />
                <span>Instant Mobile QR Scan</span>
              </div>
              <img 
                src={qrCodeUrl} 
                alt={`QR code for ${shortUrl}`}
                className="qr-image"
                loading="lazy"
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button type="button" className="btn btn-secondary" onClick={onClose} id="dismiss-analytics-btn">
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
