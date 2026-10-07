using System.ComponentModel.DataAnnotations;
using Service.Entities;

namespace Service.DTO;

public class UpdateOrderDTO
{
    [Required]
    [StringLength(200, MinimumLength = 1)]
    public required string Name {get;set;}
    [MinLength(1, ErrorMessage = "An order must have at least one quantity group.")]
    public List<UpdateOrderQuantityGroupDTO> QuantityGroups {get;set;} = new();
    public DateTime Deadline {get;set;}
    public decimal TotalPrice {get;set;}
    public OrderStatus Status {get;set;}
}

public class UpdateOrderQuantityGroupDTO
{
    // null / 0 = new quantity line; set = existing line to update
    public int? Id{get;set;}
    [Required]
    [StringLength(30, MinimumLength = 1)]
    public required string GroupKey {get;set;}
    [MinLength(1, ErrorMessage = "An orderQuantityGroup must have at least one orderQuantity group.")]
    public List<UpdateOrderQuantityDTO> Quantities {get;set;} = new();
}

public class UpdateOrderQuantityDTO
{
    // null / 0 = new quantity line; set = existing line to update
    public int? Id{get;set;}
    [Required]
    [StringLength(30, MinimumLength = 1)]
    public required string Size {get;set;}
    [Required]
    [Range(1, int.MaxValue, ErrorMessage = "Quantity must be at least 1.")]
    public int Quantity {get;set;}
}