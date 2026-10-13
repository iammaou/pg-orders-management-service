# pg-orders-management-service

## Goal

`pg-orders-management-service` is an order-management microservice for print and manufacturing workflows that track named orders, size-based quantity groups, deadlines, prices, and lifecycle status. It exposes a REST API over ASP.NET Core for creating, reading, updating, deleting, and paginating orders backed by SQL Server. The service targets internal clients and integrations that require validated input, deterministic paging, and API-key-gated access.

## Architecture & Tech Stack

The solution uses a two-project layout with strict separation between HTTP transport in `WebAPI` and persistence plus business logic in `Service`. Controllers stay thin and delegate to `IOrderService`, while Entity Framework Core handles mapping, querying, and migrations. The API and the database both run as Docker Compose services, with a supported local-run path for development.

- **WebAPI Layer** — hosts controllers, `ApiKeyMiddleware`, `GlobalExceptionHandler`, Swagger, health checks, and DI wiring in `WebAPI/Program.cs`.
- **Service Layer** — contains `ApplicationDbContext`, `ConnectionStringBuilder`, entities, DTOs, `OrderMapper`, `OrderService`, and EF Core migrations.
- **Data Module** — defines the `Orders` aggregate in `Service/Data/ApplicationDbContext.cs` and builds the SQL Server connection string from environment variables.
- **DTO Module** — defines `CreateOrderDTO`, `UpdateOrderDTO`, `OrderDto`, `OrderQueryParameters`, and `PagedResult<T>` with data-annotation validation.
- **Mapping Module** — converts between entities and DTOs via `Service/Mappers/OrderMapper.cs`.
- **Business Logic Module** — implements CRUD, filtered and sorted paged listing, and group and quantity sync in `Service/Services/OrderService.cs`.
- **Operations Module** — provisions SQL Server and the containerized API via `docker-compose.yml` and `Dockerfile`, and exposes `/health` and `/swagger` endpoints.

### Project Stack Breakdown

- **Backend:** `ASP.NET Core 9` (`Microsoft.NET.Sdk.Web`) with `C#` and nullable reference types enabled
- **Database:** `SQL Server 2022-CU14-ubuntu-22.04` via `docker-compose.yml` service `db` on `1433:1433`
- **ORM:** `Microsoft.EntityFrameworkCore 9.0.0` with `Microsoft.EntityFrameworkCore.SqlServer 9.0.0` and `Microsoft.EntityFrameworkCore.Tools 9.0.0`
- **Runtime:** `.NET 9.0` (`net9.0` in `Service/Service.csproj` and `WebAPI/WebAPI.csproj`, `mcr.microsoft.com/dotnet/sdk:9.0` build image, `mcr.microsoft.com/dotnet/aspnet:9.0` runtime image)
- **Configuration:** `DotNetEnv 3.2.0` with `Env.TraversePath().Load()` in `WebAPI/Program.cs` and `Service/Data/ApplicationDbContextFactory.cs`
- **API Docs:** `Swashbuckle.AspNetCore 9.0.6`
- **Containerization:** `Docker` multi-stage build in `Dockerfile` and `Docker Compose` with `db` and `api` services — `api` exposes `8080:8080` with `ASPNETCORE_URLS=http://+:8080`

### Key Architectural Features

- **Thin Controllers** — `WebAPI/Controllers/OrderController.cs` delegates all work to `IOrderService`.
- **Fully Containerized Runtime** — `Dockerfile` publishes `WebAPI` in `Release` and runs `dotnet WebAPI.dll` on port `8080`; `docker-compose.yml` starts `api` after `db` is healthy.
- **Environment-Based Connection Strings** — `Service/Data/ConnectionStringBuilder.cs` builds the connection string from `SQL_USER`, `SQL_PASSWORD`, `SQL_SERVER`, and `SQL_DATABASE`.
- **Design-Time Factory** — `Service/Data/ApplicationDbContextFactory.cs` loads `.env` for `dotnet ef` commands.
- **Validated DTOs** — `CreateOrderDTO` enforces `Name`, quantity-group minimums, future `Deadline`, and `Quantity` range constraints.
- **Deterministic Paging** — `OrderService.GetAllOrdersAsync` applies status filtering, `deadline` and `createdat` and `id` ordering with `Id` tiebreakers, `AsNoTracking`, and `Skip` and `Take`.
- **Orphan Cleanup on Update** — `SyncGroups` and `SyncQuantities` remove groups or lines omitted from `UpdateOrderDTO`.
- **API-Key Gate** — `WebAPI/Middleware/ApiKeyMiddleware.cs` enforces `X-API-Key` with constant-time comparison, bypassing only `/health`.
- **Centralized Errors** — `GlobalExceptionHandler` in `WebAPI/Handlers /GlobalExceptionHandler.cs` maps exceptions to JSON problem responses.

## How to Run

Choose one of two supported paths: a fully dockerized run where `db` and `api` both start via Compose, or a local run where only SQL Server is containerized and the API starts with `dotnet run`. Both paths share the same `.env` file and migration step.

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) — runs the `db` service in both paths and the `api` service in the dockerized path.
- [.NET 9 SDK](https://dotnet.microsoft.com/download/dotnet/9.0) — required for the local-run path and for `dotnet ef` migrations in both paths.
- [Git](https://git-scm.com/downloads) — for cloning the repository.
- `dotnet-ef 9.0` — for applying migrations — installable via `dotnet tool install --global dotnet-ef --version 9.*`.

### Quick Start

1. **Clone the repository** — fetch the source and enter the project directory.

```bash
git clone git@github.com:iammaou/pg-orders-management-service.git
cd pg-orders-management-service
```

2. **Create the environment file** — copy the example and set a strong password and API key.

```bash
cp .env.example .env
```

3. **Run fully dockerized (API + database)** — build the `api` image and start both services; use this path for production-like execution and skip the next step.

```bash
docker compose up -d --build
docker compose ps
docker compose logs -f api db
```

4. **Run locally (containerized database, host API)** — start only `db` and run `WebAPI` on the host; use this path for development and debugging instead of the previous step.

```bash
docker compose up -d db
dotnet restore OrdersManagement.sln
dotnet build OrdersManagement.sln
dotnet run --project WebAPI --launch-profile http
```

5. **Apply database migrations** — create the `Orders`, `OrderQuantityGroup`, and `OrderQuantity` tables from `Service/Migrations` in a separate shell while `db` is healthy.

```bash
dotnet ef database update --project Service --startup-project WebAPI
```

6. **Verify access** — confirm the service and entry points for the chosen path are reachable.

- Dockerized API base URL: `http://localhost:8080`
- Dockerized health check (no key required): `http://localhost:8080/health`
- Dockerized orders collection (requires `X-API-Key`): `http://localhost:8080/api/Order`
- Local API base URL: `http://localhost:5147`
- Local health check: `http://localhost:5147/health`
- Local Swagger UI (Development only): `http://localhost:5147/swagger`
- Local HTTPS profile (if trusted cert is installed): `https://localhost:7085`
- SQL Server endpoint (both paths): `localhost,1433`

## API Reference

All routes are served by `OrderController` with prefix `api/Order` and consume or produce `application/json`. Every route except `GET /health` requires the `X-API-Key` header — see `WebAPI/Middleware/ApiKeyMiddleware.cs`. Route templates below reproduce the literal templates in `WebAPI/Controllers/OrderController.cs`.

### Order Endpoints

| Method   | Route                | Description                                               | Success            | Errors                     |
| -------- | -------------------- | --------------------------------------------------------- | ------------------ | -------------------------- |
| `GET`    | `/api/Order`         | List orders as `PagedResult<OrderDto>` with query paging. | `200 OK`           | `400`, `401`, `500`        |
| `GET`    | `/api/Order/id:guid` | Get a single order by `id`.                               | `200 OK`           | `401`, `404`, `500`        |
| `POST`   | `/api/Order`         | Create an order from `CreateOrderDTO`.                    | `201 Created`      | `400`, `401`, `500`        |
| `PUT`    | `/api/Order/id:guid` | Replace name, deadline, price, status, and quantity tree. | `200 OK`           | `400`, `401`, `404`, `500` |
| `DELETE` | `/api/Order/id:guid` | Delete an order and its quantity groups and lines.        | `204 No Content`   | `401`, `404`, `500`        |
| `GET`    | `/health`            | Liveness probe — `Public`, no API key required.           | `200 OK`           | `500`                      |

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

| Parameter      | Type           | Default | Description                                                                                    |
| -------------- | -------------- | ------- | ---------------------------------------------------------------------------------------------- |
| `Page`         | `int`          | `1`     | Page number — must be ≥ 1.                                                                     |
| `PageSize`     | `int`          | `10`    | Items per page — 1–100.                                                                        |
| `Status`       | `OrderStatus?` | —       | Filter by status — one of `Created`, `Ordered`, `Finished`, `ReportedAsFinished`, `Delivered`.  |
| `SortBy`       | `string?`      | —       | Sort key — one of `deadline`, `createdat`, or omitted for `Id` ordering — case-insensitive.     |
| `IsDescending` | `bool`         | `false` | Sort direction — `false` for ascending, `true` for descending — applies to any `SortBy`.        |

## Error Handling

Errors are produced by two mechanisms: the custom `InvalidModelStateResponseFactory` in `WebAPI/Program.cs` for validation failures and `GlobalExceptionHandler` in `WebAPI/Handlers /GlobalExceptionHandler.cs` for thrown exceptions. `ApiKeyMiddleware` short-circuits authentication failures with plain-text `401` or `500` bodies. Unhandled responses use `WebAPI/DTO/ErrorResponse.cs` with `StatusCode`, `Title`, `TraceId`, `Detail`, and `Timestamp` — `Detail` is populated only when `IHostEnvironment.IsDevelopment()` is true, so dockerized responses running as `Production` omit exception details.

| Error Type                    | Status | Title                          |
| ----------------------------- | ------ | ------------------------------ |
| Model validation failure      | `400`  | `Validation failed`            |
| `ArgumentException`           | `400`  | `Invalid request parameters`   |
| `UnauthorizedAccessException` | `401`  | `Unauthorized access`          |
| Missing or wrong `X-API-Key`  | `401`  | — plain-text body, no JSON envelope |
| `KeyNotFoundException`        | `404`  | `Resource not found`           |
| Missing order (`null` result) | `404`  | Empty body via `NotFound()`    |
| Missing `API_KEYS` server config | `500` | — plain-text body `API_KEYS were not setup` |
| Unhandled `Exception`         | `500`  | `An unexpected error occurred` |

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
- **Container build verification** — validate `Dockerfile` with `docker compose build api` from the repository root.
- **Migration verification** — validate the model against SQL Server with `dotnet ef migrations list --project Service --startup-project WebAPI` in `Service/Migrations`.
- **Smoke tests** — exercise `GET /health` without a key and `GET /api/Order` with header `X-API-Key: <your-api-key>` via `WebAPI/WebAPI.http` or `curl` against `http://localhost:8080` in Docker or `http://localhost:5147` for local runs.
