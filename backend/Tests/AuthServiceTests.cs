using Backend.Data;
using Backend.Models;
using Backend.Models.DTOs;
using Backend.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;
using Xunit;

namespace Backend.Tests;

public class AuthServiceTests
{
    private const string PlainPassword = "CorrectHorse1!";
    private const string WrongPassword = "WrongPassword1!";

    private static AppDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new AppDbContext(options);
    }

    private static IConfiguration CreateConfiguration()
    {
        var settings = new Dictionary<string, string?>
        {
            ["JwtSettings:SecretKey"] = "unit-test-secret-key-at-least-32-characters-long",
            ["JwtSettings:Issuer"] = "backend-auth-tests",
            ["JwtSettings:ExpiryMinutes"] = "30",
            ["JwtSettings:KeepLoggedInExpiryMinutes"] = "10080"
        };

        return new ConfigurationBuilder().AddInMemoryCollection(settings).Build();
    }

    private static User CreateTestUser(AppDbContext context, string username = "jdoe", UserRole role = UserRole.Admin)
    {
        var user = new User
        {
            Username = username,
            Email = $"{username}@example.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(PlainPassword, 12),
            Role = role
        };

        context.Users.Add(user);
        context.SaveChanges();
        return user;
    }

    private static AuthService CreateAuthService(
        AppDbContext context,
        IConfiguration? configuration = null,
        IJwtService? jwtService = null,
        ISmtpService? smtpService = null)
    {
        var auditLogService = new AuditLogService(context, NullLogger<AuditLogService>.Instance);

        IJwtService jwt;
        if (jwtService != null)
        {
            jwt = jwtService;
        }
        else
        {
            var jwtMock = new Mock<IJwtService>();
            jwtMock
                .Setup(j => j.GenerateToken(It.IsAny<User>(), It.IsAny<int>()))
                .Returns(("fake-jwt-token", DateTime.UtcNow.AddMinutes(30)));
            jwt = jwtMock.Object;
        }

        var smtp = smtpService ?? Mock.Of<ISmtpService>();

        return new AuthService(context, jwt, auditLogService, smtp, configuration ?? CreateConfiguration());
    }

    [Fact]
    public async Task LoginAsync_WithValidCredentials_ReturnsAccessTokenRoleAndRedirectUrl()
    {
        using var context = CreateContext();
        var user = CreateTestUser(context, "jdoe", UserRole.Admin);
        var service = CreateAuthService(context);

        var request = new LoginRequest { Username = user.Username, Password = PlainPassword, KeepLoggedIn = false };

        var result = await service.LoginAsync(request, "127.0.0.1", "xunit-test-agent");

        Assert.True(result.Success);
        Assert.Equal(200, result.StatusCode);
        Assert.Equal("fake-jwt-token", result.AccessToken);
        Assert.Equal("Admin", result.Role);
        Assert.Equal("/dashboard", result.RedirectUrl);
    }

    [Fact]
    public async Task LoginAsync_AfterFiveConsecutiveFailedAttempts_LocksAccountAndReturns423()
    {
        using var context = CreateContext();
        var user = CreateTestUser(context, "lockme", UserRole.Receptionist);
        var service = CreateAuthService(context);

        var badRequest = new LoginRequest { Username = user.Username, Password = WrongPassword };

        LoginResult? lastResult = null;
        for (var attempt = 1; attempt <= 5; attempt++)
        {
            lastResult = await service.LoginAsync(badRequest, "127.0.0.1", "xunit-test-agent");
        }

        Assert.NotNull(lastResult);
        Assert.False(lastResult!.Success);
        Assert.Equal(423, lastResult.StatusCode);
        Assert.Contains("locked", lastResult.Detail, StringComparison.OrdinalIgnoreCase);

        var persistedUser = await context.Users.FindAsync(user.Id);
        Assert.NotNull(persistedUser!.LockoutUntil);
        Assert.True(persistedUser.LockoutUntil > DateTime.UtcNow);
        Assert.Equal(5, persistedUser.FailedLoginCount);

        // A 6th attempt (even with the *correct* password) must still be rejected while locked -- the
        // lockout is enforced server-side and is not bypassable by e.g. refreshing the browser.
        var correctRequest = new LoginRequest { Username = user.Username, Password = PlainPassword };
        var sixthResult = await service.LoginAsync(correctRequest, "127.0.0.1", "xunit-test-agent");
        Assert.Equal(423, sixthResult.StatusCode);
    }

    [Fact]
    public async Task LoginAsync_EverySuccessAndFailure_WritesExactlyOneAuditLogEntry()
    {
        using var context = CreateContext();
        var user = CreateTestUser(context, "audited", UserRole.SecurityGuard);
        var service = CreateAuthService(context);

        var failedRequest = new LoginRequest { Username = user.Username, Password = WrongPassword };
        await service.LoginAsync(failedRequest, "10.0.0.1", "xunit-test-agent");

        Assert.Equal(1, context.AuditLogEntries.Count());
        var failureEntry = context.AuditLogEntries.Single();
        Assert.Equal(AuditEventType.LoginFailure, failureEntry.EventType);
        Assert.Equal(user.Username, failureEntry.Username);
        Assert.Equal("10.0.0.1", failureEntry.IpAddress);

        var successRequest = new LoginRequest { Username = user.Username, Password = PlainPassword };
        await service.LoginAsync(successRequest, "10.0.0.2", "xunit-test-agent");

        Assert.Equal(2, context.AuditLogEntries.Count());
        var successEntry = context.AuditLogEntries.OrderByDescending(e => e.Timestamp).First();
        Assert.Equal(AuditEventType.LoginSuccess, successEntry.EventType);
        Assert.Equal("Success", successEntry.Result);
    }

    [Fact]
    public async Task LoginAsync_WithEmptyUsernameOrPassword_ReturnsBadRequestWithoutHittingTheDatabase()
    {
        using var context = CreateContext();
        var service = CreateAuthService(context);

        var result = await service.LoginAsync(new LoginRequest { Username = "", Password = "" }, "127.0.0.1", "xunit-test-agent");

        Assert.False(result.Success);
        Assert.Equal(400, result.StatusCode);
        Assert.Equal("Username and password are required.", result.Detail);
    }

    [Fact]
    public async Task LoginAsync_WithWrongPassword_ReturnsGenericInvalidCredentialsMessage()
    {
        using var context = CreateContext();
        var user = CreateTestUser(context, "genericmsg", UserRole.Admin);
        var service = CreateAuthService(context);

        var result = await service.LoginAsync(
            new LoginRequest { Username = user.Username, Password = WrongPassword },
            "127.0.0.1",
            "xunit-test-agent");

        Assert.False(result.Success);
        Assert.Equal(401, result.StatusCode);
        Assert.Equal("Invalid username or password.", result.Detail);
    }

    [Fact]
    public async Task LoginAsync_WithUnknownUsername_ReturnsSameGenericMessageAsWrongPassword()
    {
        using var context = CreateContext();
        var service = CreateAuthService(context);

        var result = await service.LoginAsync(
            new LoginRequest { Username = "nobody", Password = WrongPassword },
            "127.0.0.1",
            "xunit-test-agent");

        Assert.False(result.Success);
        Assert.Equal(401, result.StatusCode);
        Assert.Equal("Invalid username or password.", result.Detail);
    }
}
