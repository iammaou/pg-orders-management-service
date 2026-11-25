using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Service.Migrations
{
    /// <inheritdoc />
    public partial class AddOrderHistoryTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Discriminator",
                table: "Orders");

            migrationBuilder.CreateTable(
                name: "OrderHistory",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Deadline = table.Column<DateTime>(type: "datetime2", nullable: false),
                    TotalPrice = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    IsHandover = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OrderHistory", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "OrderHistoryQuantityGroup",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    GroupKey = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    OrderHistoryId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OrderHistoryQuantityGroup", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OrderHistoryQuantityGroup_OrderHistory_OrderHistoryId",
                        column: x => x.OrderHistoryId,
                        principalTable: "OrderHistory",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "OrderHistoryQuantity",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Size = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Quantity = table.Column<int>(type: "int", nullable: false),
                    OrderHistoryQuantityGroupId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OrderHistoryQuantity", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OrderHistoryQuantity_OrderHistoryQuantityGroup_OrderHistoryQuantityGroupId",
                        column: x => x.OrderHistoryQuantityGroupId,
                        principalTable: "OrderHistoryQuantityGroup",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_OrderHistoryQuantity_OrderHistoryQuantityGroupId",
                table: "OrderHistoryQuantity",
                column: "OrderHistoryQuantityGroupId");

            migrationBuilder.CreateIndex(
                name: "IX_OrderHistoryQuantityGroup_OrderHistoryId",
                table: "OrderHistoryQuantityGroup",
                column: "OrderHistoryId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "OrderHistoryQuantity");

            migrationBuilder.DropTable(
                name: "OrderHistoryQuantityGroup");

            migrationBuilder.DropTable(
                name: "OrderHistory");

            migrationBuilder.AddColumn<string>(
                name: "Discriminator",
                table: "Orders",
                type: "nvarchar(13)",
                maxLength: 13,
                nullable: false,
                defaultValue: "");
        }
    }
}
