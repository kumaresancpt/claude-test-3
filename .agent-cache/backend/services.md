# Backend Services Cache

### IAuthService / AuthService (backend/Services/IAuthService.cs, AuthService.cs)
- Login, Logout, ForgotPassword, VerifyOtp, ResetPassword, GetSession
- bcrypt hashing, account lockout after 5 failed attempts / 15 min, role-based redirect URL, password history (last 5)

### IJwtService / JwtService (backend/Services/IJwtService.cs, JwtService.cs)
- Issues/validates access tokens (JwtSettings: SecretKey, Issuer, ExpiryMinutes, KeepLoggedInExpiryMinutes)

### IAuditLogService / AuditLogService (backend/Services/IAuditLogService.cs, AuditLogService.cs)
- Writes immutable AuditLogEntry rows for login/failure/lockout/reset/logout events

### ISmtpService / ConsoleSmtpService (backend/Services/ISmtpService.cs, ConsoleSmtpService.cs)
- Sends OTP emails (console-based stub implementation for local dev)

### Registered in Program.cs (DI)
- builder.Services.AddScoped<IJwtService, JwtService>();
- builder.Services.AddScoped<IAuditLogService, AuditLogService>();
- builder.Services.AddScoped<ISmtpService, ConsoleSmtpService>();
- builder.Services.AddScoped<IAuthService, AuthService>();
- builder.Services.AddDbContext<AppDbContext>(...)
- builder.Services.AddControllers(); AddEndpointsApiExplorer(); AddSwaggerGen(...); AddCors(...); AddAuthorization();

### Middleware pipeline (Program.cs)
- app.UseSwagger(); app.UseSwaggerUI(); app.UseCors(); app.UseAuthentication(); app.UseAuthorization();
