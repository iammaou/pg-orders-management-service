using System.ComponentModel.DataAnnotations;

namespace Service.DTO;

public class PagedResult<T>
{
    public IEnumerable<T> Items {get;set;} = [];
    public int TotalCount {get;set;}

    [Range(1, int.MaxValue, ErrorMessage = "Page number must be at least 1")] 
    public int Page {get;set;}

    [Range(1, 100, ErrorMessage = "Page size must be between 1 and 100")]
    public int PageSize {get;set;}

    
}