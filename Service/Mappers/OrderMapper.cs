namespace Service.Mappers;

using Service.Entities;
using Service.DTO;

public static class OrderMapper
{
    public static OrderDto ToDto(this Order order)
    {
        return new()
        {
            Id = order.Id,
            Name = order.Name,
            CreatedAt = order.CreatedAt,
            Deadline = order.Deadline,
            TotalPrice = order.TotalPrice,
            Status = order.Status,
            QuantityGroups = [.. order.QuantityGroups.Select(g => g.ToDto())]
        };
    }

    public static OrderQuantityGroupDto ToDto(this OrderQuantityGroup group)
    {
        return new()
        {
            Id = group.Id,
            GroupKey = group.GroupKey,
            Quantities = [.. group.Quantities.Select(q => q.ToDto())]
        };
    }

    public static OrderQuantityDto ToDto(this OrderQuantity quantity)
    {
        return new()
        {
            Id = quantity.Id,
            Size = quantity.Size,
            Quantity = quantity.Quantity
        };
    }

    public static Order ToEntity(this OrderDto order)
    {
        return new()
        {
            Id = order.Id,
            Name = order.Name,
            CreatedAt = order.CreatedAt,
            Deadline = order.Deadline,
            TotalPrice = order.TotalPrice,
            Status = order.Status,
            QuantityGroups = [.. order.QuantityGroups.Select(g => g.ToEntity())]
        };
    }

    public static OrderQuantityGroup ToEntity(this OrderQuantityGroupDto group)
    {
        return new()
        {
            Id = group.Id,
            GroupKey = group.GroupKey,
            Quantities = [.. group.Quantities.Select(q => q.ToEntity())]
        };
    }

    public static OrderQuantity ToEntity(this OrderQuantityDto quantity)
    {
        return new()
        {
            Id = quantity.Id,
            Size = quantity.Size,
            Quantity = quantity.Quantity
        };
    }

    public static Order ToEntity(this CreateOrderDto dto) => new()
    {
        Id = Guid.NewGuid(),
        Name = dto.Name,
        Deadline = dto.Deadline,
        CreatedAt = DateTime.UtcNow,
        Status = OrderStatus.Created,
        TotalPrice = 0m,
        QuantityGroups = [.. dto.QuantityGroups.Select(g => g.ToEntity())]
    };  

    public static OrderQuantityGroup ToEntity(this CreateOrderQuantityGroupDto dto) => new()
    {
        GroupKey = dto.GroupKey,
        Quantities = [.. dto.Quantities.Select(q => q.ToEntity())]
    };

    public static OrderQuantity ToEntity(this CreateOrderQuantityDto dto) => new()
    {
        Size = dto.Size,
        Quantity = dto.Quantity
    };
    }