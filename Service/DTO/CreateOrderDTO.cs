using System.ComponentModel.DataAnnotations;

namespace Service.DTO;

public class CreateOrderDto : IValidatableObject
{
    [Required]
    [StringLength(200, MinimumLength = 1)]
    public string Name { get; set; } = string.Empty;

    [MinLength(1, ErrorMessage = "An order must have at least one quantity group.")]
    public List<CreateOrderQuantityGroupDto> QuantityGroups { get; set; } = new();

    [Required]
    public DateTime Deadline { get; set; }

    public IEnumerable<ValidationResult> Validate(ValidationContext context)
    {
        if (Deadline <= DateTime.UtcNow)
        {
            yield return new ValidationResult(
                "Deadline must be in the future.",
                new[] { nameof(Deadline) });
        }
    }
}

public class CreateOrderQuantityGroupDto
{
    [Required]
    [StringLength(30, MinimumLength = 1)]
    public string GroupKey { get; set; } = string.Empty;

    [MinLength(1, ErrorMessage = "An orderQuantityGroup must have at least one orderQuantity group.")]
    public List<CreateOrderQuantityDto> Quantities { get; set; } = new();
}

public class CreateOrderQuantityDto
{
    [Required]
    [StringLength(30, MinimumLength = 1)]
    public string Size { get; set; } = string.Empty;

    [Range(1, int.MaxValue, ErrorMessage = "Quantity must be at least 1.")]
    public int Quantity { get; set; }
}