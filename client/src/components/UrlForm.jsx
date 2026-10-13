import React, { useState } from 'react';
import { urlAPI } from '../api';
import { Link2, ArrowRight, Check, Copy, AlertCircle } from 'lucide-react';

export default function UrlForm({ onUrlCreated, placeholder = 'Paste a long link to shorten...', autoFocus = false }) {
  const [originalUrl, setOriginalUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [createdResult, setCreatedResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setCopyError(null);
    setCreatedResult(null);

    let urlToSubmit = originalUrl.trim();

    if (!urlToSubmit) {
      setError('Please enter a destination URL.');
      return;
    }

    // Auto-prefix protocol if missing
    if (!/^https?:\/\//i.test(urlToSubmit)) {
      if (/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(urlToSubmit)) {
        urlToSubmit = `https://${urlToSubmit}`;
      } else {
        setError('Please enter a valid URL starting with http:// or https://');
        return;
      }
    }

    try {
      setLoading(true);
      const res = await urlAPI.createShortUrl({ originalUrl: urlToSubmit });
      
      const shortCode = res.shortCode || res.url?.shortCode;
      const baseUrl = import.meta.env?.VITE_SHORT_URL_BASE || (import.meta.env?.VITE_API_BASE_URL ? import.meta.env.VITE_API_BASE_URL.replace(/\/api\/?$/, '') : window.location.origin);
      const fullShortUrl = `${baseUrl}/api/urls/${shortCode}`;

      const urlData = {
        ...res.url,
        shortCode,
        originalUrl: urlToSubmit,
        fullShortUrl,
        clicks: res.url?.clicks || 0,
        createdAt: res.url?.createdAt || new Date().toISOString()
      };

      setCreatedResult(urlData);
      setOriginalUrl('');

      if (onUrlCreated) {
        onUrlCreated(urlData);
      }
    } catch (err) {
      setError(err.message || 'Failed to shorten URL. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (text) => {
    setCopyError(null);
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        const successful = document.execCommand('copy');
        document.body.removeChild(textarea);
        if (successful) {
          setCopied(true);
          setTimeout(() => setCopied(false), 2500);
        } else {
          throw new Error('Clipboard copy not supported');
        }
      }
    } catch {
      setCopyError('Unable to copy automatically. Please select and copy manually.');
    }
  };

  return (
    <div className="url-form-container" id="url-form-wrapper">
      <form onSubmit={handleSubmit} className="url-form" id="shorten-url-form" noValidate>
        <div className="input-group">
          <Link2 className="input-icon" size={18} />
          <input
            id="url-input-field"
            type="url"
            className="url-input"
            value={originalUrl}
            onChange={(e) => {
              setOriginalUrl(e.target.value);
              if (error) setError(null);
            }}
            placeholder={placeholder}
            autoFocus={autoFocus}
            disabled={loading}
            aria-label="Destination URL"
          />
        </div>

        <div className="form-submit-row">
          <button
            type="submit"
            className="btn btn-primary"
            id="url-submit-btn"
            disabled={loading || !originalUrl.trim()}
          >
            {loading ? (
              <>
                <div className="loading-spinner" />
                <span>Shortening...</span>
              </>
            ) : (
              <>
                <span>Shorten URL</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Error state */}
      {error && (
        <div className="error-banner" id="url-form-error" role="alert">
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {/* Success state */}
      {createdResult && (
        <div className="success-banner" id="url-form-success" role="status">
          <div className="success-details">
            <span className="success-label">Success! Your short link is ready:</span>
            <a
              href={createdResult.fullShortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="success-link"
              id="generated-short-link"
            >
              {createdResult.fullShortUrl}
            </a>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              id="copy-generated-url-btn"
              onClick={() => handleCopy(createdResult.fullShortUrl)}
              style={{ padding: '0.45rem 0.85rem', fontSize: '0.875rem' }}
            >
              {copied ? <Check size={15} /> : <Copy size={15} />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
        </div>
      )}

      {copyError && (
        <div className="error-banner" id="clipboard-copy-error" style={{ marginTop: '0.5rem' }}>
          <AlertCircle size={16} />
          <span>{copyError}</span>
        </div>
      )}
    </div>
  );
}
