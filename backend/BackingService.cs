using Microsoft.EntityFrameworkCore;

/// <summary>
/// Protocolo de Respaldo del Guardián (secondra-spec v1.8). Respaldos entre usuarios autenticados.
/// </summary>
public sealed class BackingService
{
    private readonly AppDbContext _db;

    public BackingService(AppDbContext db) => _db = db;

    public async Task<IResult> CreateAsync(
        Guid vouchingUserId,
        Guid targetGuardianId,
        CreateGuardianBackingRequest? req,
        CancellationToken cancellationToken = default)
    {
        if (vouchingUserId == targetGuardianId)
            return Results.BadRequest(new { error = "No puedes respaldarte a ti mismo." });

        var vouchText = string.IsNullOrWhiteSpace(req?.VouchText) ? null : req!.VouchText!.Trim();
        if (vouchText is not null && vouchText.Length > 2000)
            return Results.BadRequest(new { error = "El comentario no puede superar 2000 caracteres." });

        var targetExists = await _db.Users.AnyAsync(u => u.Id == targetGuardianId, cancellationToken);
        if (!targetExists)
            return Results.NotFound(new { error = "Guardián no encontrado." });

        var duplicate = await _db.GuardianBackings.AnyAsync(
            b => b.VouchingUserId == vouchingUserId && b.TargetGuardianId == targetGuardianId,
            cancellationToken);
        if (duplicate)
            return Results.BadRequest(new { error = "Ya respaldaste a este Guardián." });

        var row = new GuardianBacking
        {
            Id = Guid.NewGuid(),
            VouchingUserId = vouchingUserId,
            TargetGuardianId = targetGuardianId,
            VouchText = vouchText,
            CreatedAt = DateTimeOffset.UtcNow,
        };
        _db.GuardianBackings.Add(row);
        await _db.SaveChangesAsync(cancellationToken);

        await RecalculateTrustForTargetAsync(targetGuardianId, cancellationToken);

        var dto = new GuardianBackingPublicDto(row.Id, row.VouchingUserId, row.TargetGuardianId, row.VouchText, row.CreatedAt);
        return Results.Created($"/guardians/{targetGuardianId}/backings/{row.Id}", dto);
    }

    public async Task<IResult> ListReceivedAsync(
        Guid targetGuardianId,
        CancellationToken cancellationToken = default)
    {
        var rows = await (
            from b in _db.GuardianBackings.AsNoTracking()
            join u in _db.Users.AsNoTracking() on b.VouchingUserId equals u.Id
            where b.TargetGuardianId == targetGuardianId
            orderby b.CreatedAt descending
            select new GuardianBackingReceivedDto(
                b.Id,
                b.VouchingUserId,
                b.TargetGuardianId,
                b.VouchText,
                b.CreatedAt,
                u.FirstName,
                u.LastName,
                u.TrustLevel)
        ).ToListAsync(cancellationToken);

        return Results.Ok(rows);
    }

    private async Task RecalculateTrustForTargetAsync(Guid targetGuardianId, CancellationToken cancellationToken)
    {
        var target = await _db.Users.FirstOrDefaultAsync(u => u.Id == targetGuardianId, cancellationToken);
        if (target is null) return;

        var count = await _db.GuardianBackings.CountAsync(b => b.TargetGuardianId == targetGuardianId, cancellationToken);
        target.BackingCount = count;
        target.TrustLevel = count switch
        {
            >= 10 => TrustLevel.GuardianHonor,
            >= 5 => TrustLevel.VecinoConfiable,
            _ => TrustLevel.Novato,
        };
        await _db.SaveChangesAsync(cancellationToken);
    }
}

public class CreateGuardianBackingRequest
{
    public string? VouchText { get; set; }
}

public record GuardianBackingPublicDto(
    Guid Id,
    Guid VouchingUserId,
    Guid TargetGuardianId,
    string? VouchText,
    DateTimeOffset CreatedAt);

public record GuardianBackingReceivedDto(
    Guid Id,
    Guid VouchingUserId,
    Guid TargetGuardianId,
    string? VouchText,
    DateTimeOffset CreatedAt,
    string VouchingFirstName,
    string VouchingLastName,
    TrustLevel VouchingTrustLevel);
