import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Link2, LayoutDashboard, LogIn, UserPlus, LogOut, User, Menu, X } from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar" id="main-navigation">
      <div className="container navbar-container">
        {/* Brand */}
        <Link to="/" className="navbar-brand" id="nav-brand-logo">
          <div className="brand-icon">
            <Link2 size={20} />
          </div>
          <span>SnipURL</span>
        </Link>

        {/* Mobile menu toggle */}
        <button
          id="mobile-menu-toggle"
          className="btn-icon"
          style={{ display: 'none' }}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Desktop Navigation */}
        <ul className="navbar-nav" id="desktop-nav-links">
          <li>
            <NavLink 
              to="/" 
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              id="nav-link-home"
            >
              Home
            </NavLink>
          </li>

          {isAuthenticated ? (
            <>
              <li>
                <NavLink 
                  to="/dashboard" 
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  id="nav-link-dashboard"
                >
                  <LayoutDashboard size={15} style={{ marginRight: '6px', verticalAlign: 'text-bottom' }} />
                  Dashboard
                </NavLink>
              </li>

              <li className="user-badge" id="nav-user-badge">
                <User size={13} />
                <span>{user?.name || user?.email}</span>
              </li>

              <li>
                <button 
                  onClick={handleLogout} 
                  className="btn btn-secondary" 
                  id="nav-btn-logout"
                  style={{ padding: '0.45rem 0.9rem', fontSize: '0.875rem' }}
                >
                  <LogOut size={14} />
                  <span>Logout</span>
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <NavLink 
                  to="/login" 
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  id="nav-link-login"
                >
                  <LogIn size={15} style={{ marginRight: '6px', verticalAlign: 'text-bottom' }} />
                  Login
                </NavLink>
              </li>
              <li>
                <Link to="/register" className="btn btn-primary" id="nav-btn-register" style={{ padding: '0.45rem 1rem', fontSize: '0.875rem' }}>
                  <UserPlus size={15} />
                  <span>Get Started</span>
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}
