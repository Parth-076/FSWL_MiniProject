import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UrlCard from '../components/UrlCard';

describe('UrlCard Component', () => {
  const sampleUrl = {
    _id: '60d5ec49f1b2c8b1f8e4e1a1',
    originalUrl: 'https://react.dev/reference/react',
    shortCode: 'reactdocs',
    clicks: 42,
    createdAt: '2026-10-10T12:00:00.000Z'
  };

  test('renders short link, original URL, and click count', () => {
    render(<UrlCard url={sampleUrl} />);

    expect(screen.getByText(/reactdocs/i)).toBeInTheDocument();
    expect(screen.getByText('https://react.dev/reference/react')).toBeInTheDocument();
    expect(screen.getByText(/42 clicks/i)).toBeInTheDocument();
  });

  test('calls onDelete callback when delete button is confirmed', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const onDeleteMock = vi.fn().mockResolvedValueOnce(true);

    render(<UrlCard url={sampleUrl} onDelete={onDeleteMock} />);

    const deleteBtn = screen.getByLabelText(/Delete short link/i);
    fireEvent.click(deleteBtn);

    expect(window.confirm).toHaveBeenCalled();
    await waitFor(() => {
      expect(onDeleteMock).toHaveBeenCalledWith('60d5ec49f1b2c8b1f8e4e1a1');
    });
  });

  test('calls onViewAnalytics callback when stats button is clicked', () => {
    const onAnalyticsMock = vi.fn();

    render(<UrlCard url={sampleUrl} onViewAnalytics={onAnalyticsMock} />);

    const statsBtn = screen.getByRole('button', { name: /View analytics/i });
    fireEvent.click(statsBtn);

    expect(onAnalyticsMock).toHaveBeenCalledWith(sampleUrl);
  });
});
