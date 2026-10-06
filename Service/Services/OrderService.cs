using System;
using Microsoft.EntityFrameworkCore;
using Service.Data;
using Service.Entities;

namespace Service.Services;

public interface IOrderService
{
    Task<List<Order>> GetAllOrdersAsync();
}

public class OrderService(ApplicationDbContext dbContext) : IOrderService
{
    private readonly ApplicationDbContext dbContext = dbContext;

    public async Task<List<Order>> GetAllOrdersAsync()
    {
        var orders = await dbContext.Orders.AsNoTracking().ToListAsync();

        return orders;
    }
}
