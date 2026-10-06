namespace Service.Entities;

public enum OrderStatus
{
    Created,
    Ordered, 
    Finished,
    ReportedAsFinished,
    Delivered,
}

public class Order
{
    public Guid Id {get;set;}

    public required string Name {get;set;}
    public List<OrderQuantityGroup> QuantityGroups {get;set;} = new();
    public DateTime CreatedAt {get;set;}
    public DateTime Deadline {get;set;}
    public decimal TotalPrice {get;set;}
    public OrderStatus Status {get;set;}
}

public class OrderQuantityGroup
{
    public int Id {get;set;}
    public required string GroupKey {get;set;}
    public List<OrderQuantity> Quantities {get;set;} = new();
}

public class OrderQuantity
{
    public int Id {get;set;}
    public required string Size {get;set;}
    public int Quantity {get;set;}
}