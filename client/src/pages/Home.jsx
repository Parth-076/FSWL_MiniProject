import React from 'react';
import UrlForm from '../components/UrlForm';

export default function Home() {
  return (
    <div className="home-page" id="home-view">
      <section className="hero">
        <div className="container">
          <h1 className="hero-title">
            Shorten Your Links
          </h1>

          <p className="hero-subtitle">
            Transform long URLs into concise, manageable links in seconds.
          </p>

          <UrlForm placeholder="Paste a long link to shorten..." autoFocus />
        </div>
      </section>
    </div>
  );
}
