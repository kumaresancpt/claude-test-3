import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ApiErrorBanner, SuccessBanner } from '../components/Banners';
import { ApiError, forgotPassword, verifyOtp } from '../services/authService';

const REQUIRED_MESSAGE = 'This field is required.';
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OTP_PATTERN = /^\d{6}$/;

type Step = 'email' | 'otp';

function ForgotPasswordPage(): React.ReactElement {
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpTouched, setOtpTouched] = useState(false);

  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const emailError = (() => {
    if (!emailTouched) return null;
    if (email.trim() === '') return REQUIRED_MESSAGE;
    if (!EMAIL_PATTERN.test(email.trim())) return 'Please enter a valid email address.';
    return null;
  })();

  const otpError = (() => {
    if (!otpTouched) return null;
    if (otp.trim() === '') return REQUIRED_MESSAGE;
    if (!OTP_PATTERN.test(otp.trim())) return 'Please enter the 6-digit code.';
    return null;
  })();

  const handleEmailSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setEmailTouched(true);
    setApiError(null);
    setSuccessMessage(null);

    if (email.trim() === '' || !EMAIL_PATTERN.test(email.trim())) {
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await forgotPassword({ email: email.trim() });
      setSuccessMessage(`${result?.detail ?? 'OTP sent'}. Please check your inbox - the code is valid for 10 minutes.`);
      setStep('otp');
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

  const handleOtpSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setOtpTouched(true);
    setApiError(null);

    if (otp.trim() === '' || !OTP_PATTERN.test(otp.trim())) {
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await verifyOtp({ email: email.trim(), otp: otp.trim() });
      navigate('/reset-password', { state: { resetToken: result.resetToken } });
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
            Forgot Password
          </h1>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '16px', color: 'var(--color-text-subtitle)' }}>
            {step === 'email'
              ? "Enter your email and we'll send you a one-time code."
              : 'Enter the 6-digit code sent to your email.'}
          </p>
        </div>

        {apiError && <ApiErrorBanner message={apiError} />}
        {successMessage && <SuccessBanner message={successMessage} />}

        {step === 'email' && (
          <form onSubmit={handleEmailSubmit} noValidate>
            <label
              htmlFor="email"
              style={{
                display: 'block',
                fontFamily: "'Inter', sans-serif",
                fontWeight: 500,
                fontSize: '14px',
                color: 'var(--color-text-label)',
                marginBottom: '6px',
              }}
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              placeholder="ex., john@example.com"
              onChange={(event) => setEmail(event.target.value)}
              onBlur={() => setEmailTouched(true)}
              aria-required="true"
              aria-invalid={emailError ? 'true' : 'false'}
              aria-describedby={emailError ? 'email-error' : undefined}
              style={{
                width: '100%',
                height: 'var(--input-height)',
                border: `1px solid ${emailError ? 'var(--color-border-error)' : 'var(--color-border-input)'}`,
                borderRadius: 'var(--radius-input)',
                padding: '12px',
                fontSize: '14px',
              }}
            />
            {emailError && (
              <p id="email-error" style={{ color: 'var(--color-text-error)', fontSize: '12px', marginTop: '4px' }}>
                {emailError}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
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
              Send OTP
            </button>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={handleOtpSubmit} noValidate>
            <label
              htmlFor="otp"
              style={{
                display: 'block',
                fontFamily: "'Inter', sans-serif",
                fontWeight: 500,
                fontSize: '14px',
                color: 'var(--color-text-label)',
                marginBottom: '6px',
              }}
            >
              6-digit OTP
            </label>
            <input
              id="otp"
              name="otp"
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              placeholder="123456"
              onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
              onBlur={() => setOtpTouched(true)}
              aria-required="true"
              aria-invalid={otpError ? 'true' : 'false'}
              aria-describedby={otpError ? 'otp-error' : undefined}
              style={{
                width: '100%',
                height: 'var(--input-height)',
                border: `1px solid ${otpError ? 'var(--color-border-error)' : 'var(--color-border-input)'}`,
                borderRadius: 'var(--radius-input)',
                padding: '12px',
                fontSize: '14px',
                letterSpacing: '4px',
              }}
            />
            {otpError && (
              <p id="otp-error" style={{ color: 'var(--color-text-error)', fontSize: '12px', marginTop: '4px' }}>
                {otpError}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
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
              Verify OTP
            </button>
          </form>
        )}

        <p style={{ textAlign: 'center', fontSize: '14px' }}>
          <Link to="/login" style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
