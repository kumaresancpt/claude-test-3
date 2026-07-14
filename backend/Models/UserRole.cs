namespace Backend.Models;

/// <summary>
/// The set of roles a user account can have. Drives role-based redirection (AC-03).
/// </summary>
public enum UserRole
{
    Admin,
    Receptionist,
    SecurityGuard
}
