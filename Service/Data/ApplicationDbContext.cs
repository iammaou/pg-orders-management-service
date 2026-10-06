using Microsoft.EntityFrameworkCore;
using Service.Entities;

namespace Service.Data;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : DbContext(options)
{
    public DbSet<Order> Orders {get;set;}
}
