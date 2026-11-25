using System;
using Microsoft.EntityFrameworkCore;
using Service.Data;
using Service.DTO;
using Service.Entities;
using Service.Mappers;

namespace Service.Services;

public interface IOrderHistoryService
{
    Task<PagedResult<OrderDto>> GetFullOrderHistory(OrderQueryParameters query);
    Task<OrderDto?> GetOrderFromHistoryAsync(Guid id);
    Task<OrderDto> CreateNewOrderInHistoryAsync(CreateOrderDTO order);
    Task<bool> DeleteOrderFromHistoryAsync(Guid id);
}

public class OrderHistoryService(ApplicationDbContext dbContext): IOrderHistoryService
{
  public async Task<PagedResult<OrderDto>> GetFullOrderHistory(OrderQueryParameters query)
  {
    IQueryable<Order> orderHistoryQuery = dbContext.OrderHistory.AsNoTracking().Include(order => order.QuantityGroups)
      .ThenInclude(group => group.Quantities);

    if(query.IsHandover == true)
    {
      orderHistoryQuery = orderHistoryQuery.Where(p => p.IsHandover == true);
    }

    if (query.Status.HasValue)
    {
      orderHistoryQuery = orderHistoryQuery.Where(p => p.Status == query.Status.Value);
    }

    orderHistoryQuery = query.SortBy?.ToLower() switch
    {
      "deadline" => query.IsDescending ? orderHistoryQuery.OrderByDescending(o => o.Deadline).ThenBy(o => o.Id) : orderHistoryQuery.OrderBy(o => o.Deadline).ThenBy(o => o.Id),
      "createdat" => query.IsDescending ? orderHistoryQuery.OrderByDescending(o => o.CreatedAt).ThenBy(o => o.Id) : orderHistoryQuery.OrderBy(o => o.CreatedAt).ThenBy(o => o.Id),
      _ => query.IsDescending? orderHistoryQuery.OrderByDescending(o => o.Id) : orderHistoryQuery.OrderBy(o => o.Id)
    };

    var totalCount = await orderHistoryQuery.CountAsync();

    var page = Math.Max(query.Page, 1);
    var pageSize = Math.Clamp(query.PageSize, 1, 100);

    var items = await orderHistoryQuery
      .Skip((page - 1) * pageSize)
      .Take(pageSize)
      .Select(o => o.ToDto())
      .ToListAsync();

    return new PagedResult<OrderDto>
    {
      Items = items,
      TotalCount = totalCount,
      Page = page,
      PageSize = pageSize
    };
  }

  public async Task<OrderDto?> GetOrderFromHistoryAsync(Guid id)
    {
        var order = await dbContext.OrderHistory
            .AsNoTracking()
            .Include(order => order.QuantityGroups)
                .ThenInclude(group => group.Quantities)
            .FirstOrDefaultAsync(order => order.Id == id);

        return order == null ? null : order.ToDto();
    }

    public async Task<OrderDto> CreateNewOrderInHistoryAsync(CreateOrderDTO order)
    {
        Order newOrder = order.ToEntity();

        dbContext.OrderHistory.Add(newOrder);
        await dbContext.SaveChangesAsync();

        return newOrder.ToDto();
    }

    public async Task<bool> DeleteOrderFromHistoryAsync(Guid id)
    {
        var order = await dbContext.OrderHistory
            .Include(order => order.QuantityGroups)
                .ThenInclude(group => group.Quantities)
            .FirstOrDefaultAsync(order => order.Id == id);
        
        if (order == null) return false;

        foreach (var quantityGroup in order.QuantityGroups)
        {
            foreach (var quantity in quantityGroup.Quantities)
            {
                dbContext.Remove(quantity);
            }
            dbContext.Remove(quantityGroup);
        }

        dbContext.Remove(order);
        await dbContext.SaveChangesAsync();

        return true;
    }
}
