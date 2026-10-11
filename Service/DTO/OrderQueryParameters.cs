using System.ComponentModel.DataAnnotations;
using Service.Entities;

namespace Service.DTO;

public class OrderQueryParameters
{
    [Range(1, int.MaxValue, ErrorMessage = "Page number must be at least 1")]
    public int Page {get;set;} = 1;

    [Range(1, 100, ErrorMessage = "Page size must be between 1 and 100")]
    public int PageSize {get;set;} = 10;

    public OrderStatus Status {get;set;}
    public bool IsDescending {get;set;}

    private string? _sortBy;
    public string? SortBy
    {
        get => _sortBy;
        set
        {
            // Only allow specific values
            var allowedValues = new[] { "deadline", "createdat", null };
            if (value != null && !allowedValues.Contains(value.ToLower()))
            {
                throw new ArgumentException($"SortBy must be one of: {string.Join(", ", allowedValues)}");
            }
            _sortBy = value;
        }
    }
}