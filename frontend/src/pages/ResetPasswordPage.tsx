import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ApiErrorBanner, SuccessBanner } from '../components/Banners';
import { ApiError, resetPassword } from '../services/authService';

interface PasswordRule {
  id: string;
  label: string;
  test: (value: string) => boolean;
}

const PASSWORD_RULES: PasswordRule[] = [
  { id: 'length', label: 'At least 8 characters', test: (value) => value.length >= 8 },
  { id: 'uppercase', label: 'At least one uppercase letter', test: (value) => /[A-Z]/.test(value) },
  { id: 'lowercase', label: 'At least one lowercase letter', test: (value) => /[a-z]/.test(value) },
  { id: 'number', label: 'At least one number', test: (value) => /\d/.test(value) },
  {
    id: 'special',
    label: 'At least one special character',
    test: (value) => /[^A-Za-z0-9]/.test(value),
  },
];

interface LocationState {
  resetToken?: string;
}

function ResetPasswordPage(): React.ReactElement {
  const navigate = useNavigate();
  const location = useLocation();
  const resetToken = (location.state as LocationState | null)?.resetToken ?? null;

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newPasswordTouched, setNewPasswordTouched] = useState(false);
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);

  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!successMessage) {
      return undefined;
    }
    const timer = setTimeout(() => {
      navigate('/login', { replace: true });
    }, 2000);
    return () => clearTimeout(timer);
  }, [successMessage, navigate]);

  const failedRules = PASSWORD_RULES.filter((rule) => !rule.test(newPassword));
  const passwordValid = failedRules.length === 0;
  const confirmError =
    confirmPasswordTouched && confirmPassword !== newPassword ? 'Passwords do not match.' : null;

  const isSubmitDisabled =
    !resetToken ||
    isSubmitting ||
    newPassword.trim() === '' ||
    confirmPassword.trim() === '' ||
    !passwordValid ||
    confirmPassword !== newPassword;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setNewPasswordTouched(true);
    setConfirmPasswordTouched(true);
    setApiError(null);

    if (!resetToken || !passwordValid || confirmPassword !== newPassword) {
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await resetPassword({ resetToken, newPassword, confirmPassword });
      setSuccessMessage(result?.detail ?? 'Password reset successful.');
    } catch (error) {
      if (error instanceof ApiError) {
        setApiError(error.message);
      } else {
        setApiError('Unable to reach the server. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: '20px',
        padding: '24px',
      }}
    >
      <div style={{ width: '400px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <h1
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 600,
              fontSize: '33px',
              color: 'var(--color-text-heading)',
              margin: 0,
            }}
          >
            Reset Password
          </h1>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '16px', color: 'var(--color-text-subtitle)' }}>
            Choose a new password for your account.
          </p>
        </div>

        {apiError && <ApiErrorBanner message={apiError} />}
        {successMessage && <SuccessBanner message={`${successMessage} Redirecting to login...`} />}

        {!resetToken && (
          <ApiErrorBanner message="Your password reset session is invalid or has expired. Please start again." />
        )}

        <form onSubmit={handleSubmit} noValidate>
          <label
            htmlFor="newPassword"
            style={{
              display: 'block',
              fontFamily: "'Inter', sans-serif",
              fontWeight: 500,
              fontSize: '14px',
              color: 'var(--color-text-label)',
              marginBottom: '6px',
            }}
          >
            New Password
          </label>
          <input
            id="newPassword"
            name="newPassword"
            type="password"
            value={newPassword}
            placeholder="Please Enter"
            onChange={(event) => setNewPassword(event.target.value)}
            onBlur={() => setNewPasswordTouched(true)}
            aria-required="true"
            aria-invalid={newPasswordTouched && !passwordValid ? 'true' : 'false'}
            aria-describedby="password-rules"
            style={{
              width: '100%',
              height: 'var(--input-height)',
              border: `1px solid ${
                newPasswordTouched && !passwordValid ? 'var(--color-border-error)' : 'var(--color-border-input)'
              }`,
              borderRadius: 'var(--radius-input)',
              padding: '12px',
              fontSize: '14px',
            }}
          />
          <ul id="password-rules" style={{ marginTop: '8px', paddingLeft: '18px' }}>
            {PASSWORD_RULES.map((rule) => {
              const met = rule.test(newPassword);
              const showAsError = newPasswordTouched && !met;
              return (
                <li
                  key={rule.id}
                  style={{
                    fontSize: '12px',
                    color: showAsError ? 'var(--color-text-error)' : met ? 'var(--color-text-success)' : '#6B6B6B',
                  }}
                >
                  <span aria-hidden="true">{met ? '✓' : showAsError ? '✕' : '•'} </span>
                  <span>{rule.label}</span>
                </li>
              );
            })}
          </ul>

          <div style={{ marginTop: '16px' }}>
            <label
              htmlFor="confirmPassword"
              style={{
                display: 'block',
                fontFamily: "'Inter', sans-serif",
                fontWeight: 500,
                fontSize: '14px',
                color: 'var(--color-text-label)',
                marginBottom: '6px',
              }}
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={confirmPassword}
              placeholder="Please Enter"
              onChange={(event) => setConfirmPassword(event.target.value)}
              onBlur={() => setConfirmPasswordTouched(true)}
              aria-required="true"
              aria-invalid={confirmError ? 'true' : 'false'}
              aria-describedby={confirmError ? 'confirm-password-error' : undefined}
              style={{
                width: '100%',
                height: 'var(--input-height)',
                border: `1px solid ${confirmError ? 'var(--color-border-error)' : 'var(--color-border-input)'}`,
                borderRadius: 'var(--radius-input)',
                padding: '12px',
                fontSize: '14px',
              }}
            />
            {confirmError && (
              <p
                id="confirm-password-error"
                style={{ color: 'var(--color-text-error)', fontSize: '12px', marginTop: '4px' }}
              >
                {confirmError}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitDisabled}
            style={{
              marginTop: '20px',
              width: '100%',
              height: 'var(--input-height)',
              background: 'var(--color-primary)',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '14px',
              border: 'none',
              borderRadius: 'var(--radius-input)',
            }}
          >
            Reset Password
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '14px' }}>
          <Link to="/login" style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default ResetPasswordPage;
