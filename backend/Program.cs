using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.Json.Serialization;
using System.Text.Json;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// --- 1. REGISTRO DE SERVICIOS ---

builder.WebHost.ConfigureKestrel(options =>
{
    options.Limits.KeepAliveTimeout = TimeSpan.FromSeconds(65);
    options.Limits.RequestHeadersTimeout = TimeSpan.FromSeconds(60);
});

builder.Services.ConfigureHttpJsonOptions(o =>
{
    o.SerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    o.SerializerOptions.PropertyNameCaseInsensitive = true;
    o.SerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    o.SerializerOptions.ReadCommentHandling = JsonCommentHandling.Disallow;
    o.SerializerOptions.AllowTrailingCommas = false;
    o.SerializerOptions.Converters.Add(new JsonStringEnumConverter(JsonNamingPolicy.CamelCase, allowIntegerValues: false));
});

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
    });
});

var jwtKey = builder.Configuration["Jwt:Key"] ?? throw new InvalidOperationException("Falta Jwt:Key en configuración.");
if (jwtKey.Length < 32)
    throw new InvalidOperationException("Jwt:Key debe tener al menos 32 caracteres.");

var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "Secondra";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "SecondraApp";

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = signingKey,
            ValidateIssuer = true,
            ValidIssuer = jwtIssuer,
            ValidateAudience = true,
            ValidAudience = jwtAudience,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromMinutes(1),
        };
    });
builder.Services.AddAuthorization();

// Una sola instancia para registro y login (mismo algoritmo y opciones de PBKDF2).
builder.Services.AddSingleton<IPasswordHasher<User>, PasswordHasher<User>>();
builder.Services.AddSingleton(sp => new JwtTokenService(sp.GetRequiredService<IConfiguration>(), signingKey));
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<BackingService>();

// BD in-memory: al reiniciar el proceso los datos se pierden (útil para desarrollo).
// Si PasswordHash no es un hash PBKDF2 válido (p. ej. texto plano antiguo), VerifyHashedPassword puede
// lanzar; el middleware global de excepciones responde 500. Acción: resetear la BD o recrear usuarios vía POST /auth/register.
builder.Services.AddDbContext<AppDbContext>(opt => opt.UseInMemoryDatabase("SegundaVidaDB"));

var app = builder.Build();

// --- 2. PIPELINE ---

app.UseExceptionHandler(errorApp =>
{
    errorApp.Run(async context =>
    {
        context.Response.StatusCode = StatusCodes.Status500InternalServerError;
        context.Response.ContentType = "application/json";
        await context.Response.WriteAsJsonAsync(new { error = "Error interno del servidor." });
    });
});

app.UseCors();
app.UseAuthentication();
app.UseAuthorization();

// --- ENDPOINTS ---

app.MapGet("/health", () => new { status = "Healthy", version = "1.8.0" });

app.MapPost("/auth/login", async (LoginRequest req, AuthService auth) => await auth.LoginAsync(req));

app.MapPost("/auth/register", async (RegisterUserRequest req, AuthService auth) => await auth.RegisterAsync(req));

app.MapGet("/items", async (AppDbContext db) => await db.Items.AsNoTracking().ToListAsync());

app.MapPost("/items", async (CreateItemRequest req, AppDbContext db) =>
{
    var name = req.Name?.Trim() ?? "";
    if (string.IsNullOrEmpty(name))
        return Results.BadRequest(new { error = "El nombre es obligatorio." });
    if (req.Price <= 0)
        return Results.BadRequest(new { error = "El precio debe ser mayor que cero." });

    var location = req.Location?.Trim() ?? "";
    if (string.IsNullOrEmpty(location))
        return Results.BadRequest(new { error = "La ubicación es obligatoria." });

    var whatsapp = req.WhatsApp?.Trim() ?? "";
    if (string.IsNullOrEmpty(whatsapp))
        return Results.BadRequest(new { error = "WhatsApp es obligatorio." });
    if (whatsapp.Length < 8 || whatsapp.Length > 32)
        return Results.BadRequest(new { error = "WhatsApp debe tener entre 8 y 32 caracteres." });

    var desc = string.IsNullOrWhiteSpace(req.Description) ? null : req.Description.Trim();

    var item = new Item
    {
        Id = Guid.NewGuid(),
        Name = name,
        Description = desc,
        Price = req.Price,
        Category = req.Category,
        Condition = req.Condition,
        Location = location,
        WhatsApp = whatsapp,
        CreatedAt = DateTimeOffset.UtcNow,
    };

    db.Items.Add(item);
    await db.SaveChangesAsync();

    return Results.Created($"/items/{item.Id}", item);
}).RequireAuthorization();

app.MapGet("/users/me", async (ClaimsPrincipal principal, AuthService auth) =>
{
    var sub = principal.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? principal.FindFirstValue(JwtRegisteredClaimNames.Sub);
    if (string.IsNullOrEmpty(sub) || !Guid.TryParse(sub, out var userId))
        return Results.Unauthorized();
    return await auth.GetCurrentUserAsync(userId);
}).RequireAuthorization();

app.MapGet("/users/me/backings", async (ClaimsPrincipal principal, BackingService backing) =>
{
    var sub = principal.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? principal.FindFirstValue(JwtRegisteredClaimNames.Sub);
    if (string.IsNullOrEmpty(sub) || !Guid.TryParse(sub, out var userId))
        return Results.Unauthorized();
    return await backing.ListReceivedAsync(userId);
}).RequireAuthorization();

app.MapPost("/guardians/{targetGuardianId:guid}/backings", async (
    Guid targetGuardianId,
    CreateGuardianBackingRequest? req,
    ClaimsPrincipal principal,
    BackingService backing) =>
{
    var sub = principal.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? principal.FindFirstValue(JwtRegisteredClaimNames.Sub);
    if (string.IsNullOrEmpty(sub) || !Guid.TryParse(sub, out var vouchingUserId))
        return Results.Unauthorized();
    return await backing.CreateAsync(vouchingUserId, targetGuardianId, req);
}).RequireAuthorization();

var port = Environment.GetEnvironmentVariable("PORT") ?? "10000";
app.Run($"http://0.0.0.0:{port}");

// --- JWT ---

public sealed class JwtTokenService
{
    private readonly string _issuer;
    private readonly string _audience;
    private readonly SymmetricSecurityKey _signingKey;
    private readonly int _expiresMinutes;

    public JwtTokenService(IConfiguration cfg, SymmetricSecurityKey signingKey)
    {
        _signingKey = signingKey;
        _issuer = cfg["Jwt:Issuer"] ?? "Secondra";
        _audience = cfg["Jwt:Audience"] ?? "SecondraApp";
        _expiresMinutes = int.TryParse(cfg["Jwt:ExpiresMinutes"], out var m) ? m : 60;
    }

    public (string Token, int ExpiresInSeconds) CreateToken(User user)
    {
        var creds = new SigningCredentials(_signingKey, SecurityAlgorithms.HmacSha256);
        var expires = DateTime.UtcNow.AddMinutes(_expiresMinutes);
        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new(JwtRegisteredClaimNames.Email, user.Email),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        };
        var token = new JwtSecurityToken(
            _issuer,
            _audience,
            claims,
            notBefore: DateTime.UtcNow.AddSeconds(-30),
            expires: expires,
            signingCredentials: creds);
        var jwt = new JwtSecurityTokenHandler().WriteToken(token);
        var expiresIn = (int)Math.Max(1, (expires - DateTime.UtcNow).TotalSeconds);
        return (jwt, expiresIn);
    }
}

// --- MODELOS (secondra-spec.yaml) ---

public enum ItemCategory
{
    Ropa,
    Electronica,
    Hogar,
    Libros,
    Deportes,
    Otro,
}

public enum ItemCondition
{
    Nuevo,
    Bueno,
    Regular,
}

public enum TrustLevel
{
    Novato,
    VecinoConfiable,
    GuardianHonor,
}

public class GuardianBacking
{
    public Guid Id { get; set; }
    public Guid VouchingUserId { get; set; }
    public Guid TargetGuardianId { get; set; }
    public string? VouchText { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}

public class Item
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public ItemCategory Category { get; set; }
    public ItemCondition Condition { get; set; }
    public string Location { get; set; } = string.Empty;
    public string WhatsApp { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; }
}

public class CreateItemRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public ItemCategory Category { get; set; }
    public ItemCondition Condition { get; set; }
    public string Location { get; set; } = string.Empty;
    public string WhatsApp { get; set; } = string.Empty;
}

public class User
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string ZipCode { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; }
    public TrustLevel TrustLevel { get; set; } = TrustLevel.Novato;
    public int BackingCount { get; set; }
    public bool IsIdentityVerified { get; set; }
}

public record UserPublicDto(
    Guid Id,
    string Email,
    string FirstName,
    string LastName,
    string Phone,
    string ZipCode,
    DateTimeOffset CreatedAt,
    TrustLevel TrustLevel,
    int BackingCount,
    bool IsIdentityVerified);

public record LoginResponseDto(
    string AccessToken,
    string TokenType,
    int ExpiresIn,
    UserPublicDto User);

/// <summary>
/// Body JSON camelCase: { "email", "password" }. Hash en BD vía Register: PasswordHasher.HashPassword (mismo verificador).
/// </summary>
public class LoginRequest
{
    [JsonPropertyName("email")]
    public string Email { get; set; } = string.Empty;

    [JsonPropertyName("password")]
    public string Password { get; set; } = string.Empty;
}

public class RegisterUserRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string ZipCode { get; set; } = string.Empty;
}

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Item> Items => Set<Item>();
    public DbSet<User> Users => Set<User>();
    public DbSet<GuardianBacking> GuardianBackings => Set<GuardianBacking>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Item>(e =>
        {
            e.Property(x => x.Name).HasMaxLength(200);
            e.Property(x => x.Description).HasMaxLength(4000);
            e.Property(x => x.Location).HasMaxLength(500);
            e.Property(x => x.WhatsApp).HasMaxLength(32);
        });

        modelBuilder.Entity<User>(e =>
        {
            e.HasIndex(x => x.Email).IsUnique();
            e.Property(x => x.Email).HasMaxLength(254);
            e.Property(x => x.PasswordHash).HasMaxLength(512);
            e.Property(x => x.FirstName).HasMaxLength(100);
            e.Property(x => x.LastName).HasMaxLength(100);
            e.Property(x => x.Phone).HasMaxLength(20);
            e.Property(x => x.ZipCode).HasMaxLength(20);
        });

        modelBuilder.Entity<GuardianBacking>(e =>
        {
            e.HasIndex(x => new { x.VouchingUserId, x.TargetGuardianId }).IsUnique();
            e.Property(x => x.VouchText).HasMaxLength(2000);
        });
    }
}
