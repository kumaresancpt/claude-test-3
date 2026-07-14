import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import RoleSelector from '../components/RoleSelector';
import { ApiErrorBanner } from '../components/Banners';
import { EyeIcon, EyeOffIcon, UserIcon } from '../components/icons';
import { ApiError, login, parseLockoutMinutes } from '../services/authService';
import { ACCESS_TOKEN_KEY, Role } from '../services/types';

const REQUIRED_MESSAGE = 'This field is required.';

function formatCountdown(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function LoginPage(): React.ReactElement {
  const navigate = useNavigate();

  const [role, setRole] = useState<Role>('Admin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [usernameTouched, setUsernameTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);

  const lockoutIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (lockoutIntervalRef.current) {
        clearInterval(lockoutIntervalRef.current);
      }
    };
  }, []);

  const usernameError = usernameTouched && username.trim() === '' ? REQUIRED_MESSAGE : null;
  const passwordError = passwordTouched && password.trim() === '' ? REQUIRED_MESSAGE : null;

  const isLocked = lockoutSeconds > 0;
  const isLoginDisabled = username.trim() === '' || password.trim() === '' || isSubmitting || isLocked;

  const startLockoutCountdown = (minutes: number): void => {
    if (lockoutIntervalRef.current) {
      clearInterval(lockoutIntervalRef.current);
    }
    let remaining = Math.round(minutes * 60);
    setLockoutSeconds(remaining);
    lockoutIntervalRef.current = setInterval(() => {
      remaining -= 1;
      if (remaining <= 0) {
        remaining = 0;
        setLockoutSeconds(0);
        if (lockoutIntervalRef.current) {
          clearInterval(lockoutIntervalRef.current);
          lockoutIntervalRef.current = null;
        }
      } else {
        setLockoutSeconds(remaining);
      }
    }, 1000);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setUsernameTouched(true);
    setPasswordTouched(true);
    setApiError(null);
    setSuccessMessage(null);

    if (username.trim() === '' || password.trim() === '' || isLocked) {
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await login({ username, password, role, keepLoggedIn });
      localStorage.setItem(ACCESS_TOKEN_KEY, result.accessToken);
      setSuccessMessage('Login successful. Redirecting...');
      navigate(result.redirectUrl);
    } catch (error) {
      if (error instanceof ApiError) {
        setApiError(error.message);
        if (error.status === 423) {
          const minutes = parseLockoutMinutes(error.message);
          if (minutes !== null) {
            startLockoutCountdown(minutes);
          }
        }
      } else {
        setApiError('Unable to reach the server. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <div style={{ display: 'flex', flex: 1 }}>
        {/* Left half: background handshake photo */}
        <div style={{ flex: 1, position: 'relative', minHeight: '600px', overflow: 'hidden' }}>
          {/* TODO: replace with actual asset exported from Figma */}
          <div
            data-missing-image
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: '#D9C7B8',
              objectFit: 'cover',
            }}
          />
        </div>

        {/* Right half: white form panel */}
        <div
          style={{
            width: 'var(--panel-width)',
            flexShrink: 0,
            background: 'var(--color-bg-white)',
            borderTopLeftRadius: 'var(--radius-panel)',
            borderBottomLeftRadius: 'var(--radius-panel)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={{ width: 'var(--field-width)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Logo block */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {/* TODO: replace with actual asset exported from Figma */}
                <div
                  data-missing-image
                  aria-hidden="true"
                  style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: 'var(--color-primary)' }}
                />
                <span
                  style={{
                    fontFamily: 'var(--font-family-satoshi)',
                    fontWeight: 900,
                    fontSize: '31px',
                    color: 'var(--color-primary)',
                    textTransform: 'uppercase',
                  }}
                >
                  VISITOR
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-family-satoshi)',
                    fontWeight: 500,
                    fontSize: '12px',
                    color: '#000000',
                  }}
                >
                  Powered by
                </span>
                {/* TODO: replace with actual asset exported from Figma */}
                <div
                  data-missing-image
                  aria-hidden="true"
                  role="img"
                  aria-label="CPT Logo"
                  style={{ width: '48px', height: '14px', backgroundColor: '#CCCCCC', borderRadius: '2px' }}
                />
              </div>
            </div>

            {/* Heading */}
            <div>
              <h1
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 600,
                  fontSize: '33px',
                  lineHeight: '41.6px',
                  color: 'var(--color-text-heading)',
                  margin: 0,
                }}
              >
                Login
              </h1>
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 400,
                  fontSize: '20px',
                  color: 'var(--color-text-subtitle)',
                  margin: '4px 0 0 0',
                }}
              >
                Welcome to Visitor
              </p>
            </div>

            {apiError && <ApiErrorBanner message={apiError} />}
            {isLocked && (
              <div
                role="timer"
                aria-live="polite"
                style={{ fontSize: '14px', color: 'var(--color-text-error)', fontWeight: 600 }}
              >
                Try again in {formatCountdown(lockoutSeconds)}
              </div>
            )}
            {successMessage && <div role="status">{successMessage}</div>}

            <form onSubmit={handleSubmit} noValidate>
              <RoleSelector value={role} onChange={setRole} />

              <div style={{ marginTop: '20px' }}>
                <label
                  htmlFor="username"
                  style={{
                    display: 'block',
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 500,
                    fontSize: '14px',
                    color: 'var(--color-text-label)',
                    marginBottom: '6px',
                  }}
                >
                  Username
                </label>
                <div style={{ position: 'relative', width: 'var(--field-width)' }}>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    value={username}
                    placeholder="ex., john@123"
                    onChange={(event) => setUsername(event.target.value)}
                    onBlur={() => setUsernameTouched(true)}
                    aria-required="true"
                    aria-invalid={usernameError ? 'true' : 'false'}
                    aria-describedby={usernameError ? 'username-error' : undefined}
                    style={{
                      width: '100%',
                      height: 'var(--input-height)',
                      background: '#ffffff',
                      border: `1px solid ${usernameError ? 'var(--color-border-error)' : 'var(--color-border-input)'}`,
                      borderRadius: 'var(--radius-input)',
                      padding: '12px 40px 12px 12px',
                      fontSize: '14px',
                      color: 'var(--color-text-body)',
                    }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      pointerEvents: 'none',
                    }}
                  >
                    <UserIcon />
                  </span>
                </div>
                {usernameError && (
                  <p
                    id="username-error"
                    style={{ color: 'var(--color-text-error)', fontSize: '12px', marginTop: '4px' }}
                  >
                    {usernameError}
                  </p>
                )}
              </div>

              <div style={{ marginTop: '16px' }}>
                <label
                  htmlFor="password"
                  style={{
                    display: 'block',
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 500,
                    fontSize: '14px',
                    color: 'var(--color-text-label)',
                    marginBottom: '6px',
                  }}
                >
                  Password
                </label>
                <div style={{ position: 'relative', width: 'var(--field-width)' }}>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    placeholder="Please Enter"
                    onChange={(event) => setPassword(event.target.value)}
                    onBlur={() => setPasswordTouched(true)}
                    aria-required="true"
                    aria-invalid={passwordError ? 'true' : 'false'}
                    aria-describedby={passwordError ? 'password-error' : undefined}
                    style={{
                      width: '100%',
                      height: 'var(--input-height)',
                      background: '#ffffff',
                      border: `1px solid ${passwordError ? 'var(--color-border-error)' : 'var(--color-border-input)'}`,
                      borderRadius: 'var(--radius-input)',
                      padding: '12px 40px 12px 12px',
                      fontSize: '14px',
                      color: 'var(--color-text-body)',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    aria-pressed={showPassword}
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'transparent',
                      border: 'none',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
                {passwordError && (
                  <p
                    id="password-error"
                    style={{ color: 'var(--color-text-error)', fontSize: '12px', marginTop: '4px' }}
                  >
                    {passwordError}
                  </p>
                )}
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: '16px',
                  width: 'var(--field-width)',
                }}
              >
                <label
                  htmlFor="keepLoggedIn"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 400,
                    fontSize: '14px',
                    color: 'var(--color-text-body)',
                  }}
                >
                  <input
                    id="keepLoggedIn"
                    name="keepLoggedIn"
                    type="checkbox"
                    checked={keepLoggedIn}
                    onChange={(event) => setKeepLoggedIn(event.target.checked)}
                    style={{
                      width: '16px',
                      height: '16px',
                      border: '1.5px solid var(--color-border-checkbox)',
                      borderRadius: 'var(--radius-checkbox)',
                      margin: 0,
                    }}
                  />
                  Keep me logged In
                </label>
                <Link
                  to="/forgot-password"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '14px',
                    color: 'var(--color-primary)',
                    textDecoration: 'underline',
                  }}
                >
                  Forgot Password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isLoginDisabled}
                style={{
                  marginTop: '20px',
                  width: 'var(--field-width)',
                  height: 'var(--input-height)',
                  background: 'var(--color-primary)',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '14px',
                  border: 'none',
                  borderRadius: 'var(--radius-input)',
                }}
              >
                Login
              </button>
            </form>

            <p style={{ textAlign: 'center', fontSize: '14px', color: 'var(--color-text-body)', margin: 0 }}>
              Don&apos;t have an account?{' '}
              <a
                href="#"
                onClick={(event) => event.preventDefault()}
                style={{
                  color: 'var(--color-primary)',
                  textDecoration: 'underline',
                  fontWeight: 600,
                }}
              >
                Sign up
              </a>
            </p>
          </div>
        </div>
      </div>

      <footer
        style={{
          textAlign: 'center',
          fontSize: '14px',
          color: 'var(--color-text-footer)',
          padding: '16px 0',
        }}
      >
        Copyright 2026 Changepond. All Rights Reserved.
      </footer>
    </div>
  );
}

export default LoginPage;
