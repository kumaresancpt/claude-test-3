using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "audit_log_entries",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    timestamp = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    username = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    ip_address = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    user_agent = table.Column<string>(type: "character varying(512)", maxLength: 512, nullable: false),
                    event_type = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    result = table.Column<string>(type: "character varying(512)", maxLength: 512, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_audit_log_entries", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "otp_entries",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    email = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    otp_hash = table.Column<string>(type: "text", nullable: false),
                    expires_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    attempt_count = table.Column<int>(type: "integer", nullable: false),
                    used = table.Column<bool>(type: "boolean", nullable: false),
                    reset_token = table.Column<string>(type: "text", nullable: true),
                    reset_token_expires_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    reset_token_used = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_otp_entries", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "users",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    username = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    email = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    password_hash = table.Column<string>(type: "text", nullable: false),
                    role = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    failed_login_count = table.Column<int>(type: "integer", nullable: false),
                    first_failed_attempt_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    lockout_until = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    security_stamp = table.Column<string>(type: "text", nullable: false),
                    password_history_json = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_users", x => x.id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_otp_entries_email",
                table: "otp_entries",
                column: "email");

            migrationBuilder.CreateIndex(
                name: "IX_otp_entries_reset_token",
                table: "otp_entries",
                column: "reset_token");

            migrationBuilder.CreateIndex(
                name: "IX_users_email",
                table: "users",
                column: "email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_users_username",
                table: "users",
                column: "username",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "audit_log_entries");

            migrationBuilder.DropTable(
                name: "otp_entries");

            migrationBuilder.DropTable(
                name: "users");
        }
    }
}
