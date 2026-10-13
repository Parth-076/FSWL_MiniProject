import React, { useState } from 'react';
import { Copy, Check, Trash2, BarChart3, ExternalLink, Calendar, MousePointerClick, AlertCircle } from 'lucide-react';

export default function UrlCard({ url, onDelete, onViewAnalytics }) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  // Construct short URL using configured base URL or current origin
  const baseUrl = import.meta.env?.VITE_SHORT_URL_BASE || (import.meta.env?.VITE_API_BASE_URL ? import.meta.env.VITE_API_BASE_URL.replace(/\/api\/?$/, '') : window.location.origin);
  const shortUrl = `${baseUrl}/api/urls/${url.shortCode}`;

  const handleCopy = async () => {
    setCopyError(null);
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(shortUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = shortUrl;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        const successful = document.execCommand('copy');
        document.body.removeChild(textarea);
        if (successful) {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } else {
          throw new Error('Clipboard failed');
        }
      }
    } catch {
      setCopyError('Failed to copy. Please copy manually.');
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm(`Delete short link for "${url.originalUrl}"?`);
    if (!confirmDelete) return;

    try {
      setDeleting(true);
      setDeleteError(null);
      if (onDelete) {
        await onDelete(url._id);
      }
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete URL');
    } finally {
      setDeleting(false);
    }
  };

  const formattedDate = url.createdAt 
    ? new Date(url.createdAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    : 'Recently';

  return (
    <div className="url-card" id={`url-card-${url._id || url.shortCode}`}>
      <div className="url-card-header">
        <div className="url-card-main">
          <a
            href={shortUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="short-url-link"
            id={`link-short-${url.shortCode}`}
            title="Open short link"
          >
            <span>{shortUrl}</span>
            <ExternalLink size={14} style={{ opacity: 0.7 }} />
          </a>

          <span 
            className="original-url-text" 
            title={url.originalUrl}
            id={`original-url-${url.shortCode}`}
          >
            {url.originalUrl}
          </span>
        </div>

        <div className="url-card-actions">
          <button
            type="button"
            className="btn btn-secondary"
            id={`btn-copy-${url.shortCode}`}
            onClick={handleCopy}
            aria-label="Copy short link"
            style={{ padding: '0.45rem 0.8rem', fontSize: '0.85rem' }}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          {onViewAnalytics && (
            <button
              type="button"
              className="btn btn-secondary"
              id={`btn-analytics-${url.shortCode}`}
              onClick={() => onViewAnalytics(url)}
              aria-label="View analytics"
              style={{ padding: '0.45rem 0.8rem', fontSize: '0.85rem' }}
            >
              <BarChart3 size={14} />
              <span>Stats</span>
            </button>
          )}

          {onDelete && (
            <button
              type="button"
              className="btn btn-danger"
              id={`btn-delete-${url.shortCode}`}
              onClick={handleDelete}
              disabled={deleting}
              aria-label="Delete short link"
              style={{ padding: '0.45rem 0.8rem', fontSize: '0.85rem' }}
            >
              {deleting ? (
                <div className="loading-spinner" style={{ width: '0.875rem', height: '0.875rem' }} />
              ) : (
                <Trash2 size={14} />
              )}
            </button>
          )}
        </div>
      </div>

      <div className="url-card-meta">
        <span className="badge-clicks" id={`badge-clicks-${url.shortCode}`}>
          <MousePointerClick size={13} />
          <span>{url.clicks || 0} {url.clicks === 1 ? 'click' : 'clicks'}</span>
        </span>

        <span className="date-meta">
          <Calendar size={13} />
          <span>Created {formattedDate}</span>
        </span>
      </div>

      {copyError && (
        <div className="error-banner" style={{ margin: 0, padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}>
          <AlertCircle size={14} />
          <span>{copyError}</span>
        </div>
      )}

      {deleteError && (
        <div className="error-banner" style={{ margin: 0, padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}>
          <AlertCircle size={14} />
          <span>{deleteError}</span>
        </div>
      )}
    </div>
  );
}
