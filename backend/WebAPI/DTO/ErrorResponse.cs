namespace WebAPI.DTO;

public class ErrorResponse
{
    public int StatusCode {get;set;}
    public string Title {get;set;} = string.Empty;
    public string? TraceId {get;set;}
    public string? Detail {get;set;}
    public DateTime Timestamp {get;set;} = DateTime.UtcNow;
}