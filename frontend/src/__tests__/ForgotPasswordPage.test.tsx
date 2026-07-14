import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/forgot-password']}>
      <ForgotPasswordPage />
    </MemoryRouter>
  );
}

describe('ForgotPasswordPage', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('shows a validation error for an invalid email and does not call the API', () => {
    renderPage();

    const emailInput = screen.getByLabelText('Email');
    fireEvent.change(emailInput, { target: { value: 'not-an-email' } });
    fireEvent.blur(emailInput);

    expect(screen.getByText('Please enter a valid email address.')).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('sends OTP and moves to the OTP entry step on success', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ detail: 'OTP sent' }),
    });

    renderPage();

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'john@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send OTP' }));

    await waitFor(() => {
      expect(screen.getByLabelText('6-digit OTP')).toBeInTheDocument();
    });

    expect(screen.getByText(/valid for 10 minutes/i)).toBeInTheDocument();
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/auth/forgot-password',
      expect.objectContaining({ method: 'POST' })
    );
  });

  test('shows rate-limit message from the backend when OTP attempts are exceeded', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ detail: 'OTP sent' }),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: async () => ({ detail: 'Too many attempts. Please request a new OTP.' }),
      });

    renderPage();

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'john@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send OTP' }));

    await waitFor(() => {
      expect(screen.getByLabelText('6-digit OTP')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText('6-digit OTP'), { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: 'Verify OTP' }));

    await waitFor(() => {
      expect(screen.getByText('Too many attempts. Please request a new OTP.')).toBeInTheDocument();
    });
  });
});
