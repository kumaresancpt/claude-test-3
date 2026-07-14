import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ResetPasswordPage from '../pages/ResetPasswordPage';

function renderPage(resetToken: string | null = 'valid-token') {
  return render(
    <MemoryRouter
      initialEntries={[{ pathname: '/reset-password', state: resetToken ? { resetToken } : undefined }]}
    >
      <ResetPasswordPage />
    </MemoryRouter>
  );
}

describe('ResetPasswordPage', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.useRealTimers();
  });

  test('shows an invalid session banner and disables submit when no reset token is present', () => {
    renderPage(null);

    expect(
      screen.getByText('Your password reset session is invalid or has expired. Please start again.')
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reset Password' })).toBeDisabled();
  });

  test('shows unmet password rules and a mismatch error, keeping submit disabled', () => {
    renderPage();

    const newPasswordInput = screen.getByLabelText('New Password');
    const confirmInput = screen.getByLabelText('Confirm Password');

    fireEvent.change(newPasswordInput, { target: { value: 'weak' } });
    fireEvent.blur(newPasswordInput);

    expect(screen.getByText('At least 8 characters')).toBeInTheDocument();

    fireEvent.change(confirmInput, { target: { value: 'different' } });
    fireEvent.blur(confirmInput);

    expect(screen.getByText('Passwords do not match.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reset Password' })).toBeDisabled();
  });

  test('submits a valid password and shows a success message before redirecting', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ detail: 'Password reset successful' }),
    });

    renderPage();

    fireEvent.change(screen.getByLabelText('New Password'), { target: { value: 'StrongPass1!' } });
    fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'StrongPass1!' } });

    const submitButton = screen.getByRole('button', { name: 'Reset Password' });
    expect(submitButton).not.toBeDisabled();
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Password reset successful/)).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/auth/reset-password',
      expect.objectContaining({ method: 'POST' })
    );
  });

  test('shows the backend error message on failure (e.g. reused password)', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ detail: 'New password cannot be the same as a previous password.' }),
    });

    renderPage();

    fireEvent.change(screen.getByLabelText('New Password'), { target: { value: 'StrongPass1!' } });
    fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'StrongPass1!' } });
    fireEvent.click(screen.getByRole('button', { name: 'Reset Password' }));

    await waitFor(() => {
      expect(
        screen.getByText('New password cannot be the same as a previous password.')
      ).toBeInTheDocument();
    });
  });
});
