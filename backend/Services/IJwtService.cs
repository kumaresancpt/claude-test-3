using System.Security.Claims;
using Backend.Models;

namespace Backend.Services;

public interface IJwtService
{
    /// <summary>Issues a signed JWT for the given user, embedding their id, username, role and current SecurityStamp.</summary>
    (string Token, DateTime ExpiresAtUtc) GenerateToken(User user, int expiryMinutes);

    /// <summary>Validates a token's signature/expiry (not its SecurityStamp) and returns its claims, or null if invalid.</summary>
    ClaimsPrincipal? ValidateToken(string token);
}
