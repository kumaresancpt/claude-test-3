# Backend Routes Cache

### AuthController (backend/Controllers/AuthController.cs)
- Base route: api/[controller] → api/Auth
- POST   api/Auth/login          — [HttpPost("login")]
- POST   api/Auth/logout         — [HttpPost("logout")]
- POST   api/Auth/forgot-password — [HttpPost("forgot-password")]
- POST   api/Auth/verify-otp     — [HttpPost("verify-otp")]
- POST   api/Auth/reset-password — [HttpPost("reset-password")]
- GET    api/Auth/session        — [HttpGet("session")]

### Registered in Program.cs
- app.MapControllers(); (line 179) — all [ApiController]-attributed controllers auto-routed
