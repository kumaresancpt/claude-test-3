# Database Schema Cache

ORM: Entity Framework Core (Npgsql) — backend/Data/AppDbContext.cs
Migration applied: 20260713135034_InitialCreate → database `auth_dev` @ localhost:5432 (2026-07-14)

### users
- id (uuid, PK), username (unique), email (unique), password_hash, role,
  failed_login_count, first_failed_attempt_at, lockout_until, security_stamp,
  password_history_json, created_at, updated_at
- Indexes: IX_users_username (unique), IX_users_email (unique)

### otp_entries
- id (uuid, PK), email, otp_hash, expires_at, attempt_count, used,
  reset_token, reset_token_expires_at, reset_token_used, created_at
- Indexes: IX_otp_entries_email, IX_otp_entries_reset_token

### audit_log_entries
- id (uuid, PK), timestamp, username, ip_address, user_agent, event_type, result
- No indexes beyond PK (append-only audit log)
