using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Service.Migrations
{
    /// <inheritdoc />
    public partial class ConfigureOrderRelationshipsAndPrecision : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_OrderQuantity_OrderQuantityGroup_OrderQuantityGroupId",
                table: "OrderQuantity");

            migrationBuilder.DropForeignKey(
                name: "FK_OrderQuantityGroup_Orders_OrderId",
                table: "OrderQuantityGroup");

            migrationBuilder.CreateIndex(
                name: "IX_Orders_Status",
                table: "Orders",
                column: "Status");

            migrationBuilder.AddForeignKey(
                name: "FK_OrderQuantity_OrderQuantityGroup_OrderQuantityGroupId",
                table: "OrderQuantity",
                column: "OrderQuantityGroupId",
                principalTable: "OrderQuantityGroup",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_OrderQuantityGroup_Orders_OrderId",
                table: "OrderQuantityGroup",
                column: "OrderId",
                principalTable: "Orders",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_OrderQuantity_OrderQuantityGroup_OrderQuantityGroupId",
                table: "OrderQuantity");

            migrationBuilder.DropForeignKey(
                name: "FK_OrderQuantityGroup_Orders_OrderId",
                table: "OrderQuantityGroup");

            migrationBuilder.DropIndex(
                name: "IX_Orders_Status",
                table: "Orders");

            migrationBuilder.AddForeignKey(
                name: "FK_OrderQuantity_OrderQuantityGroup_OrderQuantityGroupId",
                table: "OrderQuantity",
                column: "OrderQuantityGroupId",
                principalTable: "OrderQuantityGroup",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_OrderQuantityGroup_Orders_OrderId",
                table: "OrderQuantityGroup",
                column: "OrderId",
                principalTable: "Orders",
                principalColumn: "Id");
        }
    }
}
