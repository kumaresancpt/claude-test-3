namespace Backend.Models;

/// <summary>
/// Categorizes rows written to the audit log (AC-09).
/// </summary>
public enum AuditEventType
{
    LoginSuccess,
    LoginFailure,
    AccountLockout,
    OtpRequested,
    OtpVerified,
    PasswordReset,
    Logout
}
