using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Backend.Models;
using Microsoft.IdentityModel.Tokens;

namespace Backend.Services;

/// <summary>Well-known claim types used across issuance and validation, kept in one place to avoid typos.</summary>
public static class AppClaimTypes
{
    public const string SecurityStamp = "securityStamp";
    public const string Username = "username";
}

public class JwtService : IJwtService
{
    private readonly IConfiguration _configuration;

    public JwtService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    private string SecretKey => _configuration["JwtSettings:SecretKey"]
        ?? throw new InvalidOperationException("JwtSettings:SecretKey is not configured.");

    private string Issuer => _configuration["JwtSettings:Issuer"]
        ?? throw new InvalidOperationException("JwtSettings:Issuer is not configured.");

    public (string Token, DateTime ExpiresAtUtc) GenerateToken(User user, int expiryMinutes)
    {
        var keyBytes = Encoding.UTF8.GetBytes(SecretKey);
        var expiresAt = DateTime.UtcNow.AddMinutes(expiryMinutes);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(AppClaimTypes.Username, user.Username),
            new(ClaimTypes.Role, user.Role.ToString()),
            new(AppClaimTypes.SecurityStamp, user.SecurityStamp),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var credentials = new SigningCredentials(new SymmetricSecurityKey(keyBytes), SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: Issuer,
            audience: Issuer,
            claims: claims,
            notBefore: DateTime.UtcNow,
            expires: expiresAt,
            signingCredentials: credentials);

        return (new JwtSecurityTokenHandler().WriteToken(token), expiresAt);
    }

    public ClaimsPrincipal? ValidateToken(string token)
    {
        var handler = new JwtSecurityTokenHandler();
        var keyBytes = Encoding.UTF8.GetBytes(SecretKey);

        var validationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = Issuer,
            ValidateAudience = true,
            ValidAudience = Issuer,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(keyBytes),
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromSeconds(30)
        };

        try
        {
            var principal = handler.ValidateToken(token, validationParameters, out _);
            return principal;
        }
        catch (SecurityTokenException)
        {
            return null;
        }
        catch (ArgumentException)
        {
            return null;
        }
    }
}
