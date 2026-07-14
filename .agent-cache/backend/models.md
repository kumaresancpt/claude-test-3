# Backend Models Cache

### User (backend/Models/User.cs)
- Id (Guid, PK), Username (unique), Email (unique), PasswordHash, Role (UserRole enum),
  FailedLoginCount, FirstFailedAttemptAt, LockoutUntil, SecurityStamp, PasswordHistoryJson,
  CreatedAt, UpdatedAt

### UserRole (backend/Models/UserRole.cs)
- Enum: Admin, Receptionist, SecurityGuard

### OtpEntry (backend/Models/OtpEntry.cs)
- Id (Guid, PK), Email, OtpHash, ExpiresAt, AttemptCount, Used, ResetToken,
  ResetTokenExpiresAt, ResetTokenUsed, CreatedAt

### AuditLogEntry (backend/Models/AuditLogEntry.cs)
- Id (Guid, PK), Timestamp, Username, IpAddress, UserAgent, EventType (AuditEventType enum), Result

### AuditEventType (backend/Models/AuditEventType.cs)
- Enum: login event/failure/lockout/reset/logout categories (see file for exact members)

### DTOs (backend/Models/DTOs/)
- LoginRequest.cs — username, password, role
- ForgotPasswordRequest.cs — email
- VerifyOtpRequest.cs — email, otp
- ResetPasswordRequest.cs — resetToken, newPassword, confirmPassword
- AuthResults.cs — LoginResponse / result shapes (accessToken, role, redirectUrl, detail)
