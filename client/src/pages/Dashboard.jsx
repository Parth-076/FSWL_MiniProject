import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { urlAPI } from '../api';
import UrlForm from '../components/UrlForm';
import UrlCard from '../components/UrlCard';
import AnalyticsModal from '../components/AnalyticsModal';
import { 
  Link2, 
  MousePointerClick, 
  TrendingUp, 
  Search, 
  RefreshCw, 
  AlertCircle, 
  Inbox
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAnalyticsUrl, setSelectedAnalyticsUrl] = useState(null);

  // Fetch only this authenticated user's URLs
  const loadUserUrls = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await urlAPI.getMyUrls();
      setUrls(data.urls || []);
    } catch (err) {
      setError(err.message || 'Unable to load your links. Please check API connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUserUrls();
  }, [loadUserUrls]);

  // Callback when a new URL is generated via UrlForm
  const handleUrlCreated = (newUrl) => {
    setUrls((prev) => [newUrl, ...prev]);
  };

  // Delete URL handler connected to real API
  const handleDeleteUrl = async (id) => {
    await urlAPI.deleteUrl(id);
    setUrls((prev) => prev.filter((item) => item._id !== id));
  };

  // Filter URLs based on user search term
  const filteredUrls = urls.filter((item) => {
    const q = searchQuery.toLowerCase();
    const original = (item.originalUrl || '').toLowerCase();
    const code = (item.shortCode || '').toLowerCase();
    return original.includes(q) || code.includes(q);
  });

  // Calculate high-level statistics
  const totalUrls = urls.length;
  const totalClicks = urls.reduce((acc, curr) => acc + (curr.clicks || 0), 0);
  const topUrl = urls.length > 0 
    ? [...urls].sort((a, b) => (b.clicks || 0) - (a.clicks || 0))[0] 
    : null;

  return (
    <div className="container" id="dashboard-view" style={{ paddingTop: '2.5rem' }}>
      {/* Welcome header */}
      <div className="dashboard-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', marginBottom: '0.35rem' }}>
              Welcome, {user?.name || 'User'}
            </h1>
            <p style={{ color: 'var(--text-muted)' }}>
              Create, organize, and monitor performance across your shortened links.
            </p>
          </div>

          <button
            type="button"
            className="btn btn-secondary"
            id="refresh-dashboard-btn"
            onClick={loadUserUrls}
            disabled={loading}
            style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
          >
            <RefreshCw size={14} className={loading ? 'loading-spinner' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Aggregate Statistics */}
      <div className="stats-grid" id="dashboard-stats-grid">
        <div className="stat-card" id="stat-total-links">
          <div className="stat-icon">
            <Link2 size={20} />
          </div>
          <div>
            <div className="stat-value">{totalUrls}</div>
            <div className="stat-label">Total Short Links</div>
          </div>
        </div>

        <div className="stat-card" id="stat-total-clicks">
          <div className="stat-icon">
            <MousePointerClick size={20} />
          </div>
          <div>
            <div className="stat-value">{totalClicks}</div>
            <div className="stat-label">Total Link Clicks</div>
          </div>
        </div>

        <div className="stat-card" id="stat-top-link">
          <div className="stat-icon">
            <TrendingUp size={20} />
          </div>
          <div>
            <div className="stat-value">{topUrl ? topUrl.clicks || 0 : 0}</div>
            <div className="stat-label">Top Link Engagements</div>
          </div>
        </div>
      </div>

      {/* URL Shortener Form Section */}
      <div className="card" id="dashboard-create-url-card" style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <Link2 size={16} />
          <h2 style={{ fontSize: '1.2rem' }}>Create a New Short Link</h2>
        </div>
        <UrlForm onUrlCreated={handleUrlCreated} placeholder="Paste long URL to attach to your account..." />
      </div>

      {/* User URL List Section */}
      <div className="dashboard-section-header">
        <div>
          <h2 style={{ fontSize: '1.35rem' }}>Your Links ({urls.length})</h2>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem' }}>
            All shortened links belonging exclusively to your account
          </p>
        </div>

        {urls.length > 0 && (
          <div className="search-box">
            <Search size={15} className="search-icon" />
            <input
              type="text"
              className="search-input"
              id="search-links-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by URL or code..."
              aria-label="Search links"
            />
          </div>
        )}
      </div>

      {/* Error state with retry */}
      {error && (
        <div className="error-banner" id="dashboard-fetch-error" style={{ marginBottom: '1.5rem' }}>
          <AlertCircle size={16} />
          <div style={{ flex: 1 }}>{error}</div>
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={loadUserUrls}
            style={{ padding: '0.3rem 0.75rem', fontSize: '0.85rem' }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading && urls.length === 0 ? (
        <div id="dashboard-loading-state" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <div className="loading-spinner" style={{ width: '2rem', height: '2rem', margin: '0 auto 1.25rem' }} />
          <p style={{ color: 'var(--text-muted)' }}>Retrieving your links...</p>
        </div>
      ) : filteredUrls.length === 0 ? (
        /* Empty state */
        <div className="empty-state" id="dashboard-empty-state">
          <div className="empty-icon">
            <Inbox size={28} />
          </div>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>
            {searchQuery ? 'No matching links found' : 'No shortened links yet'}
          </h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto', fontSize: '0.9rem' }}>
            {searchQuery 
              ? 'Try modifying your search term or clear the search input to see all links.' 
              : 'Paste a long link above to generate your first tracked short URL.'}
          </p>
          {searchQuery && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setSearchQuery('')}
              style={{ marginTop: '1rem', padding: '0.45rem 0.9rem', fontSize: '0.85rem' }}
            >
              Clear Search Filter
            </button>
          )}
        </div>
      ) : (
        /* Render URL cards */
        <div className="url-list" id="dashboard-url-list">
          {filteredUrls.map((item) => (
            <UrlCard
              key={item._id || item.shortCode}
              url={item}
              onDelete={handleDeleteUrl}
              onViewAnalytics={(selected) => setSelectedAnalyticsUrl(selected)}
            />
          ))}
        </div>
      )}

      {/* Analytics Modal */}
      {selectedAnalyticsUrl && (
        <AnalyticsModal
          url={selectedAnalyticsUrl}
          onClose={() => setSelectedAnalyticsUrl(null)}
        />
      )}
    </div>
  );
}
