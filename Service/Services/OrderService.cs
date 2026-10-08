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
    Task<OrderDto> CreateNewOrderAsync(CreateOrderDTO order);
    Task<bool> DeleteOrderAsync(Guid id);
    Task<OrderDto?> UpdateOrderAsync(Guid id, UpdateOrderDTO updatedOrder);
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

    public async Task<OrderDto> CreateNewOrderAsync(CreateOrderDTO order)
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

    public async Task<OrderDto?> UpdateOrderAsync(Guid id, UpdateOrderDTO updatedOrder)
    {
        var order = await dbContext.Orders
            .Include(order => order.QuantityGroups)
                .ThenInclude(group => group.Quantities)
            .FirstOrDefaultAsync(order => order.Id == id);
        
        if (order == null) return null;

        order.Name = updatedOrder.Name;
        order.Deadline = updatedOrder.Deadline;
        order.Status = updatedOrder.Status;
        order.TotalPrice = updatedOrder.TotalPrice;

        SyncGroups(order, updatedOrder.QuantityGroups);

        await dbContext.SaveChangesAsync();
        return order.ToDto();
    }

    private static void SyncGroups(Order order, List<UpdateOrderQuantityGroupDTO> incoming)
    {
        // puts all already existing Ids into incoming ids for just editing
        var incomingIds = incoming
            .Where(group => group.Id != null)
            .Select(group => group.Id!.Value)
            .ToHashSet();

        // checks which groups from the order need to be removed and removes them (if client did not mention it it should be removed)
        var groupsToRemove = order.QuantityGroups
            .Where(group => !incomingIds.Contains(group.Id))
            .ToList();
        foreach (var group in groupsToRemove)
            order.QuantityGroups.Remove(group);

        foreach (var groupDTO in incoming)
        {
            var group = groupDTO.Id != null 
                ? order.QuantityGroups.FirstOrDefault(group => group.Id == groupDTO.Id) 
                : null;

            // if the group is null its treated as new and is therefor created
            if(group == null)
            {
                group = new OrderQuantityGroup { GroupKey = groupDTO.GroupKey };
                order.QuantityGroups.Add(group);
            } else // if the group is not null treat it as existing and overwrite its group key with the one from groupDTO
            {
                group.GroupKey = groupDTO.GroupKey;
            }

            SyncQuantities(group, groupDTO.Quantities);
        }

        
    }

    private static void SyncQuantities(OrderQuantityGroup group, List<UpdateOrderQuantityDTO> incoming)
    {
        // puts all already existing Ids into incoming ids for just editing
        var incomingIds = incoming
            .Where(quantity => quantity.Id != null)
            .Select(quantity => quantity.Id!.Value)
            .ToHashSet();

        // checks which quantities from the order need to be removed and removes them (if client did not mention it it should be removed)
        var quantitiesToRemove = group.Quantities
            .Where(quantity => !incomingIds.Contains(quantity.Id))
            .ToList();
        foreach (var quantity in quantitiesToRemove)
            group.Quantities.Remove(quantity);

        foreach (var quantityDTO in incoming)
        {
            var quantity = quantityDTO.Id is not null
                ? group.Quantities.FirstOrDefault(quantity => quantity.Id == quantityDTO.Id)
                : null;

            // if the group is null its treated as new and is therefor created
            if (quantity is null)
            {
                group.Quantities.Add(new OrderQuantity
                {
                    Size = quantityDTO.Size,
                    Quantity = quantityDTO.Quantity
                });
            } else // if the group is not null treat it as existing and overwrite its group key with the one from groupDTO
            {
                quantity.Size = quantityDTO.Size;
                quantity.Quantity = quantityDTO.Quantity;
            }
        }
    }
}
