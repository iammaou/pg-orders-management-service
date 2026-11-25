using Microsoft.EntityFrameworkCore;
using Service.Entities;

namespace Service.Data;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : DbContext(options)
{
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Order>(entity =>
        {
            entity.HasIndex(o => o.Status);
            entity.Property(o => o.TotalPrice).HasPrecision(18, 2);
            entity.HasIndex(o => o.IsHandover);

            entity.HasMany(o => o.QuantityGroups)
                .WithOne()
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<OrderQuantityGroup>(entity =>
        {
            entity.HasMany(g => g.Quantities)
                .WithOne()
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<OrderHistory>(entity =>
        {
            entity.Property(o => o.TotalPrice).HasPrecision(18, 2);

            entity.HasMany(o => o.QuantityGroups)
                .WithOne()
                .HasForeignKey("OrderHistoryId")
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<OrderHistoryQuantityGroup>(entity =>
        {
            entity.HasMany(g => g.Quantities)
                .WithOne()
                .HasForeignKey("OrderHistoryQuantityGroupId")
                .OnDelete(DeleteBehavior.Cascade);
        });
    }

    public DbSet<Order> Orders {get;set;}
    public DbSet<OrderHistory> OrderHistory {get;set;}
    public DbSet<OrderHistoryQuantityGroup> OrderHistoryQuantityGroups { get; set; }
    public DbSet<OrderHistoryQuantity> OrderHistoryQuantities { get; set; }
}