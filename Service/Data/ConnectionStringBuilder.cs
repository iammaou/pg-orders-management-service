namespace Service.Data;

public static class ConnectionStringBuilder
{
    public static string BuildFromEnv()
    {
        var user = Environment.GetEnvironmentVariable("SQL_USER")
            ?? throw new InvalidOperationException("SQL_USER is not set");

        var password = Environment.GetEnvironmentVariable("SQL_PASSWORD")
            ?? throw new InvalidOperationException("SQL_PASSWORD is not set");

        var server   = Environment.GetEnvironmentVariable("SQL_SERVER")   ?? "localhost,1433";
        var database = Environment.GetEnvironmentVariable("SQL_DATABASE") ?? "OrdersDb";

        return $"Server={server};Database={database};User Id={user};Password={password};" +
               "TrustServerCertificate=True;Encrypt=False;";
    }
}