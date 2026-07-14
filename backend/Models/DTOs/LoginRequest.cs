using System.ComponentModel.DataAnnotations;

namespace Backend.Models.DTOs;

public class LoginRequest
{
    public string? Username { get; set; }

    public string? Password { get; set; }

    /// <summary>
    /// Role selected on the client (e.g. a role tab on the login form). This is NEVER trusted to
    /// compute the redirect -- the server always derives redirectUrl from the authenticated user's
    /// own Role (AC-03) -- it is only used to make sure the credentials being verified match the
    /// role the caller thinks they are logging into.
    /// </summary>
    public string? Role { get; set; }

    public bool KeepLoggedIn { get; set; }
}
