# pg-orders-management-service

## Goal

`pg-orders-management-service` is an order-management microservice for print/manufacturing workflows that track named orders, size-based quantity groups, deadlines, prices, and lifecycle status. It exposes a versionless REST API over ASP.NET Core for creating, reading, updating, deleting, and paginating orders backed by SQL Server. The service targets internal clients and integrations that require validated input, deterministic paging, and API-key-gated access.

## Architecture & Tech Stack

The solution uses a two-project layout with strict separation between HTTP transport in `WebAPI` and persistence plus business logic in `Service`. Controllers stay thin and delegate to `IOrderService`, while Entity Framework Core handles mapping, querying, and migrations.

- **WebAPI Layer** — hosts controllers, `ApiKeyMiddleware`, `GlobalExceptionHandler`, Swagger, health checks, and DI wiring in `WebAPI/Program.cs`.
- **Service Layer** — contains `ApplicationDbContext`, `ConnectionStringBuilder`, entities, DTOs, `OrderMapper`, `OrderService`, and EF Core migrations.
- **Data Module** — defines the `Orders` aggregate (`Service/Data/ApplicationDbContext.cs`) and builds the SQL Server connection string from environment variables.
- **DTO Module** — defines `CreateOrderDTO`, `UpdateOrderDTO`, `OrderDto`, `OrderQueryParameters`, and `PagedResult<T>` with data-annotation validation.
- **Mapping Module** — converts between entities and DTOs via `Service/Mappers/OrderMapper.cs`.
- **Business Logic Module** — implements CRUD, filtered/sorted/paged listing, and group/quantity sync in `Service/Services/OrderService.cs`.
- **Operations Module** — provisions SQL Server via `docker-compose.yml` and exposes `/health` and `/swagger` endpoints.

### Project Stack Breakdown

- **Backend:** `ASP.NET Core 9` (`Microsoft.NET.Sdk.Web`) with `C#` and nullable reference types enabled
- **Database:** `SQL Server 2022-CU14-ubuntu-22.04` via `docker-compose.yml` service `db` on `1433:1433`
- **ORM:** `Microsoft.EntityFrameworkCore 9.0.0` with `Microsoft.EntityFrameworkCore.SqlServer 9.0.0` and `Microsoft.EntityFrameworkCore.Tools 9.0.0`
- **Runtime:** `.NET 9.0` (`net9.0` in `Service/Service.csproj` and `WebAPI/WebAPI.csproj`)
- **Configuration:** `DotNetEnv 3.2.0` with `Env.TraversePath().Load()` in `WebAPI/Program.cs` and `Service/Data/ApplicationDbContextFactory.cs`
- **API Docs:** `Swashbuckle.AspNetCore 9.0.6`
- **Testing:** — no test project or test framework is present in the workspace
- **CI/CD:** — no pipeline configuration is present in the workspace
- **Containerization:** `Docker Compose` for infrastructure only — the `db` service uses `mcr.microsoft.com/mssql/server:2022-CU14-ubuntu-22.04` with a `mssql_data` volume and `healthcheck` via `sqlcmd`

### Key Architectural Features

- **Thin Controllers** — `WebAPI/Controllers/OrderController.cs` delegates all work to `IOrderService`.
- **Environment-Based Connection Strings** — `Service/Data/ConnectionStringBuilder.cs` builds the connection string from `SQL_USER`, `SQL_PASSWORD`, `SQL_SERVER`, and `SQL_DATABASE`.
- **Design-Time Factory** — `Service/Data/ApplicationDbContextFactory.cs` loads `.env` for `dotnet ef` commands.
- **Validated DTOs** — `CreateOrderDTO` enforces `Name`, quantity-group minimums, future `Deadline`, and `Quantity` range constraints.
- **Deterministic Paging** — `OrderService.GetAllOrdersAsync` applies status filtering, `deadline`/`createdat`/`id` ordering with `Id` tiebreakers, `AsNoTracking`, and `Skip`/`Take`.
- **Orphan Cleanup on Update** — `SyncGroups` and `SyncQuantities` remove groups or lines omitted from `UpdateOrderDTO`.
- **API-Key Gate** — `WebAPI/Middleware/ApiKeyMiddleware.cs` enforces `X-API-Key` with constant-time comparison, bypassing only `/health`.
- **Centralized Errors** — `GlobalExceptionHandler` (`WebAPI/Handlers /GlobalExceptionHandler.cs`) maps exceptions to JSON problem responses.

## How to Run

The API runs from `WebAPI` with SQL Server provisioned by `docker-compose.yml`. Database configuration comes from environment variables — no hardcoded credentials are present in the workspace.

### Prerequisites

- [.NET 9 SDK](https://dotnet.microsoft.com/download/dotnet/9.0) — builds `OrdersManagement.sln` targeting `net9.0`.
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) — runs the `db` SQL Server container from `docker-compose.yml`.
- [Git](https://git-scm.com/downloads) — for cloning the repository.
- `dotnet-ef 9.0` — for applying migrations — installable via `dotnet tool install --global dotnet-ef --version 9.*`.

### Quick Start

1. **Clone the repository** — fetch the source and enter the project directory.

```bash
git clone git@github.com:iammaou/pg-orders-management-service.git
cd pg-orders-management-service
```

2. **Create the environment file** — set the required database and API-key variables consumed by `ConnectionStringBuilder` and `ApiKeyMiddleware`.

```bash
cat > .env <<'EOF'
SQL_USER=sa
SQL_PASSWORD=<your-strong-password>
SQL_SERVER=localhost,1433
SQL_DATABASE=OrdersDb
API_KEYS=<your-api-key>
EOF
```

3. **Start SQL Server** — launch the `db` service in the background and wait for the `healthcheck` to pass.

```bash
docker compose up -d db
docker compose ps
```

4. **Restore and build the solution** — compile `Service` and `WebAPI` from `OrdersManagement.sln`.

```bash
dotnet restore OrdersManagement.sln
dotnet build OrdersManagement.sln
```

5. **Apply database migrations** — create the `Orders`, `OrderQuantityGroup`, and `OrderQuantity` tables from `Service/Migrations`.

```bash
dotnet ef database update --project Service --startup-project WebAPI
```

6. **Run the API** — start `WebAPI` with the `http` launch profile.

```bash
dotnet run --project WebAPI --launch-profile http
```

7. **Verify access** — confirm the service and entry points are reachable.

- API base URL: `http://localhost:5147`
- Health check (no key required): `http://localhost:5147/health`
- Swagger UI (Development only): `http://localhost:5147/swagger`
- Orders collection (requires `X-API-Key`): `http://localhost:5147/api/Order`
- HTTPS profile (if trusted cert is installed): `https://localhost:7085`

## API Reference

All routes are served by `OrderController` with prefix `api/Order` and consume or produce `application/json`. Every route except `GET /health` requires the `X-API-Key` header — see `WebAPI/Middleware/ApiKeyMiddleware.cs`. Route templates below reproduce the literal templates in `WebAPI/Controllers/OrderController.cs`.

### Order Endpoints

| Method   | Route                  | Description                                              | Success            | Errors               |
| -------- | ---------------------- | -------------------------------------------------------- | ------------------ | -------------------- |
| `GET`    | `/api/Order`           | List orders as `PagedResult<OrderDto>` with query paging. | `200 OK`           | `400`, `401`, `500`  |
| `GET`    | `/api/Order/id:guid`   | Get a single order by `id`.                              | `200 OK`           | `401`, `404`, `500`  |
| `POST`   | `/api/Order`           | Create an order from `CreateOrderDTO`.                   | `201 Created`      | `400`, `401`, `500`  |
| `PUT`    | `/api/Order/id:guid`   | Replace name, deadline, price, status, and quantity tree. | `200 OK`           | `400`, `401`, `404`, `500` |
| `DELETE` | `/api/Order/id:guid`   | Delete an order and its quantity groups and lines.       | `204 No Content`   | `401`, `404`, `500`  |
| `GET`    | `/health`              | Liveness probe — `Public`, no API key required.          | `200 OK`           | `500`                |

### HTTP Status Code Conventions

- `200 OK` — request succeeded — used for list, get, and update responses.
- `201 Created` — order created — includes `Location` header from `CreatedAtAction`.
- `204 No Content` — delete succeeded with no body.
- `400 Bad Request` — model validation failed or `SortBy` contained a disallowed value.
- `401 Unauthorized` — `X-API-Key` header is missing or incorrect.
- `404 Not Found` — no order exists for the given `id`.
- `500 Internal Server Error` — unhandled failure or `API_KEYS` not configured on the server.

## Querying: Filtering, Sorting & Paging

`GET /api/Order` binds `Service/DTO/OrderQueryParameters.cs` from the query string. Invalid `Page` or `PageSize` values return `400`; an invalid `SortBy` value throws `ArgumentException` and is mapped to `400` by `GlobalExceptionHandler`. The service additionally clamps values with `Math.Max(query.Page, 1)` and `Math.Clamp(query.PageSize, 1, 100)`.

| Parameter      | Type            | Default      | Description                                                                          |
| -------------- | --------------- | ------------ | ------------------------------------------------------------------------------------ |
| `Page`         | `int`           | `1`          | Page number — must be ≥ 1.                                                           |
| `PageSize`     | `int`           | `10`         | Items per page — 1–100.                                                              |
| `Status`       | `OrderStatus?`  | —            | Filter by status — one of `Created`, `Ordered`, `Finished`, `ReportedAsFinished`, `Delivered`. |
| `SortBy`       | `string?`       | —            | Sort key — one of `deadline`, `createdat`, or omitted for `Id` ordering — case-insensitive. |
| `IsDescending` | `bool`          | `false`      | Sort direction — `false` for ascending, `true` for descending — applies to any `SortBy`. |

## Error Handling

Errors are produced by two mechanisms: the custom `InvalidModelStateResponseFactory` in `WebAPI/Program.cs` for validation failures and `GlobalExceptionHandler` in `WebAPI/Handlers /GlobalExceptionHandler.cs` for thrown exceptions. `ApiKeyMiddleware` short-circuits authentication failures with plain-text `401` or `500` bodies. Unhandled responses use `WebAPI/DTO/ErrorResponse.cs` with `StatusCode`, `Title`, `TraceId`, `Detail`, and `Timestamp` — `Detail` is populated only when `IHostEnvironment.IsDevelopment()` is true.

| Error Type                  | Status | Title                       |
| --------------------------- | ------ | --------------------------- |
| Model validation failure    | `400`  | `Validation failed`         |
| `ArgumentException`         | `400`  | `Invalid request parameters` |
| `UnauthorizedAccessException` | `401` | `Unauthorized access`       |
| Missing or wrong `X-API-Key` | `401` | — plain-text body, no JSON envelope |
| `KeyNotFoundException`      | `404`  | `Resource not found`        |
| Missing order (`null` result) | `404` | Empty body via `NotFound()` |
| Missing `API_KEYS` server configuration | `500` | — plain-text body `API_KEYS were not setup` |
| Unhandled `Exception`       | `500`  | `An unexpected error occurred` |

### Example Error Response

```json
{
  "statusCode": 404,
  "title": "Resource not found",
  "traceId": "0HN9ABCD000000:00000001",
  "detail": null,
  "timestamp": "2026-10-12T00:00:00Z"
}
```

## Testing

No test project, test framework, or CI workflow exists in the workspace — verification is performed via build, migration, and manual endpoint checks.

- **No unit tests** — no `*Tests.csproj`, `xunit`, `NUnit`, or `MSTest` reference exists in `OrdersManagement.sln`.
- **Build verification** — compile both projects with `dotnet build OrdersManagement.sln` from the repository root.
- **Migration verification** — validate the model against SQL Server with `dotnet ef migrations list --project Service --startup-project WebAPI` in `Service/Migrations`.
- **Smoke tests** — exercise `GET /health` (no key) and `GET /api/Order` with header `X-API-Key: <your-api-key>` in `WebAPI/WebAPI.http` or `curl`.
