import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';

function renderLoginPage() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <LoginPage />
    </MemoryRouter>
  );
}

describe('LoginPage', () => {
  beforeEach(() => {
    localStorage.clear();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('shows required field errors on blur and disables Login button while fields are empty', () => {
    renderLoginPage();

    const usernameInput = screen.getByLabelText('Username');
    const passwordInput = screen.getByLabelText('Password');
    const loginButton = screen.getByRole('button', { name: 'Login' });

    expect(loginButton).toBeDisabled();

    fireEvent.blur(usernameInput);
    expect(screen.getByText('This field is required.')).toBeInTheDocument();

    fireEvent.blur(passwordInput);
    expect(screen.getAllByText('This field is required.')).toHaveLength(2);

    expect(loginButton).toBeDisabled();

    fireEvent.change(usernameInput, { target: { value: 'john' } });
    fireEvent.change(passwordInput, { target: { value: 'secret123' } });

    expect(loginButton).not.toBeDisabled();
  });

  test('shows the generic backend error message on invalid credentials (401)', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ detail: 'Invalid username or password.' }),
    });

    renderLoginPage();

    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'john' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'wrongpass' } });
    fireEvent.click(screen.getByRole('button', { name: 'Login' }));

    await waitFor(() => {
      expect(screen.getByText('Invalid username or password.')).toBeInTheDocument();
    });

    expect(localStorage.getItem('accessToken')).toBeNull();
  });

  test('password visibility toggle persists across state updates including a failed login', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ detail: 'Invalid username or password.' }),
    });

    renderLoginPage();

    const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
    expect(passwordInput.type).toBe('password');

    const toggleButton = screen.getByRole('button', { name: 'Show password' });
    fireEvent.click(toggleButton);

    expect(passwordInput.type).toBe('text');

    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'john' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
    fireEvent.click(screen.getByRole('button', { name: 'Login' }));

    await waitFor(() => {
      expect(screen.getByText('Invalid username or password.')).toBeInTheDocument();
    });

    expect((screen.getByLabelText('Password') as HTMLInputElement).type).toBe('text');
  });

  test('displays a lockout countdown when the backend returns a 423 response', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 423,
      json: async () => ({ detail: 'Account locked. Try again in 1 minutes.' }),
    });

    renderLoginPage();

    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'john' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'wrongpass' } });
    fireEvent.click(screen.getByRole('button', { name: 'Login' }));

    await waitFor(() => {
      expect(screen.getByText('Account locked. Try again in 1 minutes.')).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: 'Login' })).toBeDisabled();
    expect(screen.getByRole('timer')).toHaveTextContent('01:00');
  });
});
