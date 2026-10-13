import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import * as AuthContextModule from '../context/AuthContext';

describe('ProtectedRoute Component', () => {
  test('shows loading indicator when session is restoring', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      isAuthenticated: false,
      loading: true
    });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <ProtectedRoute>
          <div>Secret Dashboard Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByText(/Restoring your session/i)).toBeInTheDocument();
    expect(screen.queryByText(/Secret Dashboard Content/i)).not.toBeInTheDocument();
  });

  test('redirects unauthenticated user to login', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      isAuthenticated: false,
      loading: false
    });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <div>Secret Dashboard Content</div>
              </ProtectedRoute>
            } 
          />
          <Route path="/login" element={<div>Login Page Form</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/Login Page Form/i)).toBeInTheDocument();
    expect(screen.queryByText(/Secret Dashboard Content/i)).not.toBeInTheDocument();
  });

  test('renders protected child component when authenticated', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      isAuthenticated: true,
      loading: false
    });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <ProtectedRoute>
          <div>Secret Dashboard Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByText(/Secret Dashboard Content/i)).toBeInTheDocument();
  });
});
