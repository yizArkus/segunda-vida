using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

/// <summary>
/// Autenticación y registro (secondra-spec). Usa la misma instancia inyectada de <see cref="IPasswordHasher{User}"/> que el contenedor DI.
/// </summary>
public sealed class AuthService
{
    private readonly AppDbContext _db;
    private readonly IPasswordHasher<User> _hasher;
    private readonly JwtTokenService _jwt;

    public AuthService(AppDbContext db, IPasswordHasher<User> hasher, JwtTokenService jwt)
    {
        _db = db;
        _hasher = hasher;
        _jwt = jwt;
    }

    public async Task<IResult> LoginAsync(LoginRequest req, CancellationToken cancellationToken = default)
    {
        var password = (req.Password ?? "").Trim();
        var email = NormalizeEmail(req.Email);

        if (string.IsNullOrEmpty(email) || string.IsNullOrEmpty(password))
            return Results.BadRequest(new { error = "Correo y contraseña son obligatorios." });
        if (!IsValidEmail(email))
            return Results.BadRequest(new { error = "Correo no válido." });

        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == email, cancellationToken);
        if (user is null)
            return Results.Json(new { error = "Credenciales incorrectas." }, statusCode: StatusCodes.Status401Unauthorized);
        if (string.IsNullOrEmpty(user.PasswordHash))
            return Results.Json(new { error = "Credenciales incorrectas." }, statusCode: StatusCodes.Status401Unauthorized);

        var verify = _hasher.VerifyHashedPassword(user, user.PasswordHash, password);
        if (verify == PasswordVerificationResult.Failed)
            return Results.Json(new { error = "Credenciales incorrectas." }, statusCode: StatusCodes.Status401Unauthorized);

        if (verify == PasswordVerificationResult.SuccessRehashNeeded)
        {
            user.PasswordHash = _hasher.HashPassword(user, password);
            await _db.SaveChangesAsync(cancellationToken);
        }

        var (token, expiresIn) = _jwt.CreateToken(us);
        return Results.Ok(new LoginResponseDto(token, "Bearer", expiresIn, ToPublic(user)));
    }

    public async Task<IResult> RegisterAsync(RegisterUserRequest req, CancellationToken cancellationToken = default)
    {
        var email = NormalizeEmail(req.Email);
        if (string.IsNullOrEmpty(email))
            return Results.BadRequest(new { error = "El correo es obligatorio." });
        if (!IsValidEmail(email))
            return Results.BadRequest(new { error = "Ingresa un correo electrónico válido." });
        if (email.Length > 254)
            return Results.BadRequest(new { error = "El correo es demasiado largo." });

        var pwd = (req.Password ?? "").Trim();
        if (!TryValidateRegistrationPassword(pwd, out var pwdError))
            return Results.BadRequest(new { error = pwdError });

        var first = req.FirstName?.Trim() ?? "";
        var last = req.LastName?.Trim() ?? "";
        if (string.IsNullOrEmpty(first))
            return Results.BadRequest(new { error = "El nombre es obligatorio." });
        if (first.Length > 100)
            return Results.BadRequest(new { error = "El nombre no puede superar 100 caracteres." });
        if (string.IsNullOrEmpty(last))
            return Results.BadRequest(new { error = "El apellido es obligatorio." });
        if (last.Length > 100)
            return Results.BadRequest(new { error = "El apellido no puede superar 100 caracteres." });

        var phone = req.Phone?.Trim() ?? "";
        if (string.IsNullOrEmpty(phone))
            return Results.BadRequest(new { error = "El teléfono es obligatorio." });
        if (phone.Length < 8 || phone.Length > 20)
            return Results.BadRequest(new { error = "El teléfono debe tener entre 8 y 20 caracteres." });

        var zip = req.ZipCode?.Trim() ?? "";
        if (string.IsNullOrEmpty(zip))
            return Results.BadRequest(new { error = "El código postal es obligatorio." });
        if (zip.Length > 20)
            return Results.BadRequest(new { error = "El código postal no puede superar 20 caracteres." });

        if (await _db.Users.AsNoTracking().AnyAsync(u => u.Email == email, cancellationToken))
            return Results.Conflict(new { error = "Ese correo ya está registrado." });

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = email,
            FirstName = first,
            LastName = last,
            Phone = phone,
            ZipCode = zip,
            CreatedAt = DateTimeOffset.UtcNow,
            TrustLevel = TrustLevel.Novato,
            BackingCount = 0,
            IsIdentityVerified = false,
        };
        user.PasswordHash = _hasher.HashPassword(user, pwd);

        _db.Users.Add(user);
        await _db.SaveChangesAsync(cancellationToken);

        return Results.Created($"/users/{user.Id}", ToPublic(user));
    }

    public async Task<IResult> GetCurrentUserAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var user = await _db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);
        if (user is null)
            return Results.NotFound(new { error = "Usuario no encontrado." });
        return Results.Ok(ToPublic(user));
    }

    private static UserPublicDto ToPublic(User u) =>
        new(
            u.Id,
            u.Email,
            u.FirstName,
            u.LastName,
            u.Phone,
            u.ZipCode,
            u.CreatedAt,
            u.TrustLevel,
            u.BackingCount,
            u.IsIdentityVerified);

    private static string NormalizeEmail(string? raw)
    {
        if (string.IsNullOrWhiteSpace(raw)) return "";
        return raw.Trim().ToLowerInvariant();
    }

    private static bool IsValidEmail(string email)
    {
        try
        {
            _ = new System.Net.Mail.MailAddress(email);
            return email.Contains('@', StringComparison.Ordinal) && email.Split('@').Length == 2;
        }
        catch
        {
            return false;
        }
    }

    /// <summary>
    /// Regla secondra-spec: ≥8 caracteres, al menos una mayúscula (Unicode) y un dígito.
    /// </summary>
    private static bool TryValidateRegistrationPassword(string? pwd, out string error)
    {
        if (string.IsNullOrEmpty(pwd))
        {
            error = "La contraseña es obligatoria.";
            return false;
        }
        if (pwd.Length < 8 || pwd.Length > 128)
        {
            error = "La contraseña debe tener entre 8 y 128 caracteres.";
            return false;
        }
        if (!pwd.Any(char.IsUpper))
        {
            error = "La contraseña debe incluir al menos una letra mayúscula.";
            return false;
        }
        if (!pwd.Any(char.IsDigit))
        {
            error = "La contraseña debe incluir al menos un número.";
            return false;
        }
        error = "";
        return true;
    }
}
