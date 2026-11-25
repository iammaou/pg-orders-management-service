namespace Service.Mappers;

using Service.Entities;
using Service.DTO;

public static class OrderHistoryMapper
{
    public static OrderHistory ToOrderHistory(this Order order) => new()
    {
        Id = Guid.NewGuid(),
        Name = order.Name,
        QuantityGroups = [.. order.QuantityGroups.Select(g => g.ToHistoryEntity())],
        CreatedAt = order.CreatedAt,
        Deadline = order.Deadline,
        TotalPrice = order.TotalPrice,
        Status = order.Status,
        IsHandover = order.IsHandover
    };

    public static OrderHistoryQuantityGroup ToHistoryEntity(this OrderQuantityGroup group) => new()
    {
        Id = 0,
        GroupKey = group.GroupKey,
        Quantities = [.. group.Quantities.Select(q => q.ToHistoryEntity())]
    };

    public static OrderHistoryQuantity ToHistoryEntity(this OrderQuantity quantity) => new()
    {
        Id = 0,
        Size = quantity.Size,
        Quantity = quantity.Quantity
    };

    public static OrderDto HistoryToDto(this OrderHistory order)
    {
        return new()
        {
            Id = order.Id,
            Name = order.Name,
            CreatedAt = order.CreatedAt,
            Deadline = order.Deadline,
            TotalPrice = order.TotalPrice,
            Status = order.Status,
            QuantityGroups = [.. order.QuantityGroups.Select(g => g.HistoryToDto())],
            IsHandover = order.IsHandover
        };
    }

    public static OrderQuantityGroupDto HistoryToDto(this OrderHistoryQuantityGroup group)
    {
        return new()
        {
            Id = group.Id, // This is int, matches DTO
            GroupKey = group.GroupKey,
            Quantities = [.. group.Quantities.Select(q => q.HistoryToDto())]
        };
    }

    public static OrderQuantityDto HistoryToDto(this OrderHistoryQuantity quantity)
    {
        return new()
        {
            Id = quantity.Id, 
            Size = quantity.Size,
            Quantity = quantity.Quantity
        };
    }
}