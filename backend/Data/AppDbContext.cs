using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();

    public DbSet<OtpEntry> OtpEntries => Set<OtpEntry>();

    public DbSet<AuditLogEntry> AuditLogEntries => Set<AuditLogEntry>();

    public DbSet<Visitor> Visitors => Set<Visitor>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("users");
            entity.HasKey(u => u.Id);
            entity.HasIndex(u => u.Username).IsUnique();
            entity.HasIndex(u => u.Email).IsUnique();
            entity.Property(u => u.Id).HasColumnName("id");
            entity.Property(u => u.Username).HasColumnName("username").HasMaxLength(100).IsRequired();
            entity.Property(u => u.Email).HasColumnName("email").HasMaxLength(256).IsRequired();
            entity.Property(u => u.PasswordHash).HasColumnName("password_hash").IsRequired();
            entity.Property(u => u.Role).HasColumnName("role").HasConversion<string>().HasMaxLength(32).IsRequired();
            entity.Property(u => u.FailedLoginCount).HasColumnName("failed_login_count");
            entity.Property(u => u.FirstFailedAttemptAt).HasColumnName("first_failed_attempt_at");
            entity.Property(u => u.LockoutUntil).HasColumnName("lockout_until");
            entity.Property(u => u.SecurityStamp).HasColumnName("security_stamp").IsRequired();
            entity.Property(u => u.PasswordHistoryJson).HasColumnName("password_history_json");
            entity.Property(u => u.CreatedAt).HasColumnName("created_at");
            entity.Property(u => u.UpdatedAt).HasColumnName("updated_at");
        });

        modelBuilder.Entity<OtpEntry>(entity =>
        {
            entity.ToTable("otp_entries");
            entity.HasKey(o => o.Id);
            entity.HasIndex(o => o.Email);
            entity.HasIndex(o => o.ResetToken);
            entity.Property(o => o.Id).HasColumnName("id");
            entity.Property(o => o.Email).HasColumnName("email").HasMaxLength(256).IsRequired();
            entity.Property(o => o.OtpHash).HasColumnName("otp_hash").IsRequired();
            entity.Property(o => o.ExpiresAt).HasColumnName("expires_at");
            entity.Property(o => o.AttemptCount).HasColumnName("attempt_count");
            entity.Property(o => o.Used).HasColumnName("used");
            entity.Property(o => o.ResetToken).HasColumnName("reset_token");
            entity.Property(o => o.ResetTokenExpiresAt).HasColumnName("reset_token_expires_at");
            entity.Property(o => o.ResetTokenUsed).HasColumnName("reset_token_used");
            entity.Property(o => o.CreatedAt).HasColumnName("created_at");
        });

        modelBuilder.Entity<AuditLogEntry>(entity =>
        {
            entity.ToTable("audit_log_entries");
            entity.HasKey(a => a.Id);
            entity.Property(a => a.Id).HasColumnName("id");
            entity.Property(a => a.Timestamp).HasColumnName("timestamp");
            entity.Property(a => a.Username).HasColumnName("username").HasMaxLength(100).IsRequired();
            entity.Property(a => a.IpAddress).HasColumnName("ip_address").HasMaxLength(64).IsRequired();
            entity.Property(a => a.UserAgent).HasColumnName("user_agent").HasMaxLength(512).IsRequired();
            entity.Property(a => a.EventType).HasColumnName("event_type").HasConversion<string>().HasMaxLength(32).IsRequired();
            entity.Property(a => a.Result).HasColumnName("result").HasMaxLength(512).IsRequired();
        });

        modelBuilder.Entity<Visitor>(entity =>
        {
            entity.ToTable("visitors");
            entity.HasKey(v => v.Id);
            entity.Property(v => v.Id).HasColumnName("id");
            entity.Property(v => v.Name).HasColumnName("name").HasMaxLength(200).IsRequired();
            entity.Property(v => v.Company).HasColumnName("company").HasMaxLength(200).IsRequired();
            entity.Property(v => v.Host).HasColumnName("host").HasMaxLength(200).IsRequired();
            entity.Property(v => v.Purpose).HasColumnName("purpose").HasConversion<string>().HasMaxLength(32).IsRequired();
            entity.Property(v => v.CheckInTime).HasColumnName("check_in_time").IsRequired();
            entity.Property(v => v.CheckOutTime).HasColumnName("check_out_time");
            entity.Property(v => v.Status).HasColumnName("status").HasConversion<string>().HasMaxLength(32).IsRequired();
            entity.Property(v => v.BadgeStatus).HasColumnName("badge_status").HasConversion<string>().HasMaxLength(32).IsRequired();
            entity.Property(v => v.PhoneNumber).HasColumnName("phone_number").HasMaxLength(32);
            entity.Property(v => v.Email).HasColumnName("email").HasMaxLength(256);
            entity.Property(v => v.CreatedAt).HasColumnName("created_at");
            entity.Property(v => v.UpdatedAt).HasColumnName("updated_at");
            entity.HasIndex(v => v.CheckInTime);
            entity.HasIndex(v => v.Status);
        });
    }
}
