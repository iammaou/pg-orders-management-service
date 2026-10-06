using System.ComponentModel.DataAnnotations;
using Service.Entities;

namespace Service.DTO;

public class OrderDto
{
    public Guid Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public List<OrderQuantityGroupDto> QuantityGroups { get; set; } = new();
    public DateTime CreatedAt { get; set; }
    public DateTime Deadline { get; set; }
    public decimal TotalPrice { get; set; }
    public OrderStatus Status { get; set; }
}

public class OrderQuantityGroupDto
{
    public int Id { get; set; }
    public string GroupKey { get; set; } = string.Empty;
    public List<OrderQuantityDto> Quantities { get; set; } = new();
}

public class OrderQuantityDto
{
    public int Id { get; set; }
    public string Size { get; set; } = string.Empty;
    public int Quantity { get; set; }
}