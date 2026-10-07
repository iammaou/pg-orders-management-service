using Microsoft.EntityFrameworkCore;
using Service.Data;
using Service.DTO;
using Service.Entities;
using Service.Mappers;

namespace Service.Services;

public interface IOrderService
{
    Task<List<OrderDto>> GetAllOrdersAsync();
    Task<OrderDto?> GetOrderAsync(Guid id);
    Task<OrderDto> CreateNewOrderAsync(CreateOrderDto order);
    Task<bool> DeleteOrderAsync(Guid id);
}

public class OrderService(ApplicationDbContext dbContext) : IOrderService
{

    public async Task<List<OrderDto>> GetAllOrdersAsync()
    {
        var orders = await dbContext.Orders
            .AsNoTracking()
            .Include(order => order.QuantityGroups)
                .ThenInclude(group => group.Quantities)
            .ToListAsync();

        return orders.Select(order => order.ToDto()).ToList();
    }

    public async Task<OrderDto?> GetOrderAsync(Guid id)
    {
        var order = await dbContext.Orders
            .AsNoTracking()
            .Include(order => order.QuantityGroups)
                .ThenInclude(group => group.Quantities)
            .FirstOrDefaultAsync(order => order.Id == id);

        return order == null ? null : order.ToDto();
    }

    public async Task<OrderDto> CreateNewOrderAsync(CreateOrderDto order)
    {
        Order newOrder = order.ToEntity();

        dbContext.Add(newOrder);
        await dbContext.SaveChangesAsync();

        return newOrder.ToDto();
    }

    public async Task<bool> DeleteOrderAsync(Guid id)
    {
        var order = await dbContext.Orders
            .AsNoTracking()
            .Include(order => order.QuantityGroups)
                .ThenInclude(group => group.Quantities)
            .FirstOrDefaultAsync(order => order.Id == id);
        
        if (order == null) return false;

        dbContext.Remove(order);
        await dbContext.SaveChangesAsync();

        return true;
    }
}
