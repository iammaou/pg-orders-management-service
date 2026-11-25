using System;

namespace Service.Entities;

public class OrderHistory
{
    public Guid Id {get;set;}
    public required string Name {get;set;}
    public List<OrderHistoryQuantityGroup> QuantityGroups {get;set;} = new();
    public DateTime CreatedAt {get;set;}
    public DateTime Deadline {get;set;}
    public decimal TotalPrice {get;set;}
    public OrderStatus Status {get;set;}
    public bool IsHandover {get;set;}
}

public class OrderHistoryQuantityGroup
{
    public int Id {get;set;}
    public required string GroupKey {get;set;}
    public List<OrderHistoryQuantity> Quantities {get;set;} = new();
}

public class OrderHistoryQuantity
{
    public int Id {get;set;}
    public required string Size {get;set;}
    public int Quantity {get;set;}
}