import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UrlForm from '../components/UrlForm';
import { urlAPI } from '../api';

vi.mock('../api', () => ({
  urlAPI: {
    createShortUrl: vi.fn()
  }
}));

describe('UrlForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('shows validation error when submitted empty', async () => {
    render(<UrlForm />);

    const form = document.getElementById('shorten-url-form');
    fireEvent.submit(form);

    expect(await screen.findByText(/Please enter a destination URL/i)).toBeInTheDocument();
    expect(urlAPI.createShortUrl).not.toHaveBeenCalled();
  });

  test('successfully creates a short URL and renders success banner', async () => {
    urlAPI.createShortUrl.mockResolvedValueOnce({
      shortCode: 'abc1234',
      originalUrl: 'https://developer.mozilla.org',
      url: {
        shortCode: 'abc1234',
        originalUrl: 'https://developer.mozilla.org',
        clicks: 0
      }
    });

    const onUrlCreated = vi.fn();
    render(<UrlForm onUrlCreated={onUrlCreated} />);

    const input = screen.getByPlaceholderText(/Paste a long link/i);
    fireEvent.change(input, { target: { value: 'https://developer.mozilla.org' } });

    const submitBtn = screen.getByRole('button', { name: /Shorten URL/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(urlAPI.createShortUrl).toHaveBeenCalledWith({
        originalUrl: 'https://developer.mozilla.org'
      });
    });

    expect(await screen.findByText(/Success! Your short link is ready:/i)).toBeInTheDocument();
    expect(screen.getByText(/abc1234/i)).toBeInTheDocument();
    expect(onUrlCreated).toHaveBeenCalled();
  });

  test('renders error banner when API call fails', async () => {
    urlAPI.createShortUrl.mockRejectedValueOnce(new Error('Server failed to shorten link'));

    render(<UrlForm />);

    const input = screen.getByPlaceholderText(/Paste a long link/i);
    fireEvent.change(input, { target: { value: 'https://api-failing-link.com' } });

    const submitBtn = screen.getByRole('button', { name: /Shorten URL/i });
    fireEvent.click(submitBtn);

    expect(await screen.findByText(/Server failed to shorten link/i)).toBeInTheDocument();
  });
});
