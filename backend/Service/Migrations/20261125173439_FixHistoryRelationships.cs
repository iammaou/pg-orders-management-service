using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Service.Migrations
{
    /// <inheritdoc />
    public partial class FixHistoryRelationships : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_OrderHistoryQuantity_OrderHistoryQuantityGroup_OrderHistoryQuantityGroupId",
                table: "OrderHistoryQuantity");

            migrationBuilder.DropForeignKey(
                name: "FK_OrderHistoryQuantityGroup_OrderHistory_OrderHistoryId",
                table: "OrderHistoryQuantityGroup");

            migrationBuilder.DropPrimaryKey(
                name: "PK_OrderHistoryQuantityGroup",
                table: "OrderHistoryQuantityGroup");

            migrationBuilder.DropPrimaryKey(
                name: "PK_OrderHistoryQuantity",
                table: "OrderHistoryQuantity");

            migrationBuilder.RenameTable(
                name: "OrderHistoryQuantityGroup",
                newName: "OrderHistoryQuantityGroups");

            migrationBuilder.RenameTable(
                name: "OrderHistoryQuantity",
                newName: "OrderHistoryQuantities");

            migrationBuilder.RenameIndex(
                name: "IX_OrderHistoryQuantityGroup_OrderHistoryId",
                table: "OrderHistoryQuantityGroups",
                newName: "IX_OrderHistoryQuantityGroups_OrderHistoryId");

            migrationBuilder.RenameIndex(
                name: "IX_OrderHistoryQuantity_OrderHistoryQuantityGroupId",
                table: "OrderHistoryQuantities",
                newName: "IX_OrderHistoryQuantities_OrderHistoryQuantityGroupId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_OrderHistoryQuantityGroups",
                table: "OrderHistoryQuantityGroups",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_OrderHistoryQuantities",
                table: "OrderHistoryQuantities",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_OrderHistoryQuantities_OrderHistoryQuantityGroups_OrderHistoryQuantityGroupId",
                table: "OrderHistoryQuantities",
                column: "OrderHistoryQuantityGroupId",
                principalTable: "OrderHistoryQuantityGroups",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_OrderHistoryQuantityGroups_OrderHistory_OrderHistoryId",
                table: "OrderHistoryQuantityGroups",
                column: "OrderHistoryId",
                principalTable: "OrderHistory",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_OrderHistoryQuantities_OrderHistoryQuantityGroups_OrderHistoryQuantityGroupId",
                table: "OrderHistoryQuantities");

            migrationBuilder.DropForeignKey(
                name: "FK_OrderHistoryQuantityGroups_OrderHistory_OrderHistoryId",
                table: "OrderHistoryQuantityGroups");

            migrationBuilder.DropPrimaryKey(
                name: "PK_OrderHistoryQuantityGroups",
                table: "OrderHistoryQuantityGroups");

            migrationBuilder.DropPrimaryKey(
                name: "PK_OrderHistoryQuantities",
                table: "OrderHistoryQuantities");

            migrationBuilder.RenameTable(
                name: "OrderHistoryQuantityGroups",
                newName: "OrderHistoryQuantityGroup");

            migrationBuilder.RenameTable(
                name: "OrderHistoryQuantities",
                newName: "OrderHistoryQuantity");

            migrationBuilder.RenameIndex(
                name: "IX_OrderHistoryQuantityGroups_OrderHistoryId",
                table: "OrderHistoryQuantityGroup",
                newName: "IX_OrderHistoryQuantityGroup_OrderHistoryId");

            migrationBuilder.RenameIndex(
                name: "IX_OrderHistoryQuantities_OrderHistoryQuantityGroupId",
                table: "OrderHistoryQuantity",
                newName: "IX_OrderHistoryQuantity_OrderHistoryQuantityGroupId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_OrderHistoryQuantityGroup",
                table: "OrderHistoryQuantityGroup",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_OrderHistoryQuantity",
                table: "OrderHistoryQuantity",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_OrderHistoryQuantity_OrderHistoryQuantityGroup_OrderHistoryQuantityGroupId",
                table: "OrderHistoryQuantity",
                column: "OrderHistoryQuantityGroupId",
                principalTable: "OrderHistoryQuantityGroup",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_OrderHistoryQuantityGroup_OrderHistory_OrderHistoryId",
                table: "OrderHistoryQuantityGroup",
                column: "OrderHistoryId",
                principalTable: "OrderHistory",
                principalColumn: "Id");
        }
    }
}
