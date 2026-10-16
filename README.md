# pg-orders-management-service

## Goal

`pg-orders-management-service` is an order-management microservice for print and manufacturing workflows that tracks named orders, size-based quantity groups, deadlines, prices, and lifecycle status. It exposes a REST API over ASP.NET Core for creating, reading, updating, deleting, and paginating orders backed by SQL Server. The service targets internal clients and integrations that require validated input, deterministic paging, and API-key-gated access.

## Architecture & Tech Stack

The repository is split into `backend/` for the production .NET API, `frontend/` for an empty Vite + React scaffold reserved for future UI work, and `docker-compose.yml` at the root for local orchestration. The backend uses a two-project solution with strict separation between HTTP transport in `WebAPI` and persistence plus business logic in `Service`. Controllers stay thin and delegate to `IOrderService`, while Entity Framework Core handles mapping, querying, and migrations with automatic `MigrateAsync()` on startup in `backend/WebAPI/Program.cs`.

- **WebAPI Layer** — hosts controllers, `ApiKeyMiddleware`, `GlobalExceptionHandler`, Swagger, health checks, and DI wiring in `backend/WebAPI/Program.cs`.
- **Service Layer** — contains `ApplicationDbContext`, `ConnectionStringBuilder`, entities, DTOs, `OrderMapper`, `OrderService`, and EF Core migrations under `backend/Service/`.
- **Data Module** — defines the `Orders` aggregate in `backend/Service/Data/ApplicationDbContext.cs` and builds the SQL Server connection string from environment variables.
- **DTO Module** — defines `CreateOrderDTO`, `UpdateOrderDTO`, `OrderDto`, `OrderQueryParameters`, and `PagedResult<T>` with data-annotation validation in `backend/Service/DTO/`.
- **Mapping Module** — converts between entities and DTOs via `backend/Service/Mappers/OrderMapper.cs`.
- **Business Logic Module** — implements CRUD, filtered and sorted paged listing, and group and quantity sync in `backend/Service/Services/OrderService.cs`.
- **Operations Module** — provisions SQL Server and the containerized API via `docker-compose.yml` and `backend/Dockerfile`, and exposes `/health` and `/swagger` endpoints.
- **Frontend Placeholder** — empty Vite scaffold in `frontend/` with `frontend/src/App.tsx`, `frontend/src/main.tsx`, and `frontend/index.html`; no API integration exists yet.

### Project Stack Breakdown

- **Backend:** `ASP.NET Core` (`Microsoft.NET.Sdk.Web`) with `C#`, nullable reference types and implicit usings enabled
- **Database:** `SQL Server 2022-CU14-ubuntu-22.04` via `docker-compose.yml` service `db` on `1433:1433`
- **ORM:** `Microsoft.EntityFrameworkCore 9.0.0` with `Microsoft.EntityFrameworkCore.SqlServer 9.0.0` and `Microsoft.EntityFrameworkCore.Tools 9.0.0`
- **Runtime:** `.NET 10.0` (`net10.0` in `backend/Service/Service.csproj` and `backend/WebAPI/WebAPI.csproj`, `mcr.microsoft.com/dotnet/sdk:10.0` build image, `mcr.microsoft.com/dotnet/aspnet:10.0` runtime image)
- **Configuration:** `DotNetEnv 3.2.0` with `Env.TraversePath().Load()` in `backend/WebAPI/Program.cs`
- **API Docs:** `Swashbuckle.AspNetCore 9.0.6` with `X-API-Key` security definition
- **Frontend:** `React 19.2.8` with `react-dom 19.2.8`, `Vite 8.3.0`, `TypeScript ~6.0.2`, `@vitejs/plugin-react 6.1.1` in `frontend/package.json`
- **Testing:** no test framework — build, migration, and manual endpoint verification only
- **Containerization:** `Docker` multi-stage build in `backend/Dockerfile` and `Docker Compose` with `db` and `api` services — `api` exposes `8080:8080` with `ASPNETCORE_URLS=http://+:8080`

### Key Architectural Features

- **Thin Controllers** — `backend/WebAPI/Controllers/OrderController.cs` delegates all work to `IOrderService`.
- **Automatic Migration on Startup** — `backend/WebAPI/Program.cs` calls `db.Database.MigrateAsync()` and exits with code `1` if migration fails.
- **Fully Containerized Runtime** — `backend/Dockerfile` publishes `WebAPI` in `Release` and runs `dotnet WebAPI.dll` on port `8080`; `docker-compose.yml` starts `api` after `db` is healthy.
- **Environment-Based Connection Strings** — `backend/Service/Data/ConnectionStringBuilder.cs` builds the connection string from `SQL_USER`, `SQL_PASSWORD`, `SQL_SERVER`, and `SQL_DATABASE`.
- **Design-Time Factory** — `backend/Service/Data/ApplicationDbContextFactory.cs` loads `.env` for `dotnet ef` commands.
- **Validated DTOs** — `CreateOrderDTO` enforces `Name`, quantity-group minimums, future `Deadline`, and `Quantity` range constraints.
- **Deterministic Paging** — `OrderService.GetAllOrdersAsync` applies status filtering, `deadline` and `createdat` and `Id` ordering with `Id` tiebreakers, `AsNoTracking`, and `Skip` and `Take`.
- **Orphan Cleanup on Update** — `SyncGroups` and `SyncQuantities` remove groups or lines omitted from `UpdateOrderDTO`.
- **API-Key Gate** — `backend/WebAPI/Middleware/ApiKeyMiddleware.cs` enforces `X-API-Key` with constant-time comparison, bypassing only `/health`.
- **Centralized Errors** — `GlobalExceptionHandler` registered via `AddExceptionHandler` maps exceptions to JSON problem responses using `backend/WebAPI/DTO/ErrorResponse.cs`.
- **Frontend Reserved** — `frontend/` is an untouched Vite template (`function App() { return "react"; }`); backend runs independently of it.

## How to Run

Choose a dockerized run where `db` and `api` both start via Compose, or a local run where only SQL Server is containerized and the API starts with `dotnet run`. The API self-migrates on startup, so no manual migration is required for minimal setup. The frontend is optional and runs separately.

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) — runs the `db` service in both paths and the `api` service in the dockerized path.
- [.NET 10 SDK](https://dotnet.microsoft.com/download/dotnet/10.0) — required for the local-run path and for `dotnet ef` commands.
- [Node.js 20+ and npm](https://nodejs.org/) — required only to run the empty `frontend/` Vite scaffold.
- [Git](https://git-scm.com/downloads) — for cloning the repository.

### Quick Start

1. **Clone the repository** — fetch the source and enter the project directory.

```bash
git clone git@github.com:iammaou/pg-orders-management-service.git
cd pg-orders-management-service
```

2. **Create the environment file** — copy the example and set a strong password and API key.

```bash
cp backend/.env.example backend/.env
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
dotnet restore backend/OrdersManagement.sln
dotnet build backend/OrdersManagement.sln
dotnet run --project backend/WebAPI --launch-profile http
```

5. **Run the frontend placeholder (optional)** — start the empty Vite scaffold; it has no backend integration yet.

```bash
cd frontend
npm install
npm run dev
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
- Frontend dev server (Vite default, no API calls): `http://localhost:5173`

## API Reference

All routes are served by `OrderController` with prefix `api/Order` and consume or produce `application/json`. Every route except `GET /health` requires the `X-API-Key` header — see `backend/WebAPI/Middleware/ApiKeyMiddleware.cs`. Route templates below reproduce the literal templates in `backend/WebAPI/Controllers/OrderController.cs`.

### Order Endpoints

| Method   | Route                  | Description                          | Success             | Errors              |
| -------- | ---------------------- | ------------------------------------ | ------------------- | ------------------- |
| `GET`    | `/api/Order`           | List orders with filtering and paging | `200` with `PagedResult<OrderDto>` | `400`, `401` |
| `GET`    | `/api/Order/id:guid`   | Get single order by `id`             | `200` with `OrderDto` | `401`, `404`      |
| `POST`   | `/api/Order`           | Create order from `CreateOrderDTO`   | `201` with `OrderDto` and `Location` header | `400`, `401` |
| `PUT`    | `/api/Order/id:guid`   | Replace order from `UpdateOrderDTO`  | `200` with `OrderDto` | `400`, `401`, `404` |
| `DELETE` | `/api/Order/id:guid`   | Delete order by `id`                 | `204` with empty body | `401`, `404`      |
| `GET`    | `/health`              | Liveness probe, no key required      | `200` with `Healthy` text | —                |

### HTTP Status Code Conventions

- `200` — successful `GET` and `PUT`; returns `OrderDto` or `PagedResult<OrderDto>`.
- `201` — successful `POST`; returns created `OrderDto` with `Location` pointing at `GetOrder`.
- `204` — successful `DELETE`; empty body via `NoContent()`.
- `400` — validation or `ArgumentException` from bad query or DTO; JSON envelope.
- `401` — missing or incorrect `X-API-Key`; plain-text body from middleware.
- `404` — order id not found; empty body via `NotFound()`.
- `500` — missing server-side `API_KEYS` config or unhandled exception.

## Querying: Filtering, Sorting & Paging

`GET /api/Order` binds `backend/Service/DTO/OrderQueryParameters.cs` from the query string. Invalid `Page` or `PageSize` values return `400`; an invalid `SortBy` value throws `ArgumentException` and is mapped to `400` by `GlobalExceptionHandler`.

| Parameter      | Type           | Default | Description                                                                                    |
| -------------- | -------------- | ------- | ---------------------------------------------------------------------------------------------- |
| `Page`         | `int`          | `1`     | Page number — must be ≥ 1.                                                                     |
| `PageSize`     | `int`          | `10`    | Items per page — 1–100.                                                                        |
| `Status`       | `OrderStatus?` | —       | Filter by status — one of `Created`, `Ordered`, `Finished`, `ReportedAsFinished`, `Delivered`.  |
| `SortBy`       | `string?`      | —       | Sort key — one of `deadline`, `createdat`, or omitted for `Id` ordering — case-insensitive.     |
| `IsDescending` | `bool`         | `false` | Sort direction — `false` for ascending, `true` for descending — applies to any `SortBy`.        |

## Error Handling

Errors are produced by two mechanisms: the custom `InvalidModelStateResponseFactory` in `backend/WebAPI/Program.cs` for validation failures and `GlobalExceptionHandler` registered with `AddExceptionHandler` for thrown exceptions. `ApiKeyMiddleware` short-circuits authentication failures with plain-text `401` or `500` bodies. Handler responses use `backend/WebAPI/DTO/ErrorResponse.cs` with `StatusCode`, `Title`, `TraceId`, `Detail`, and `Timestamp` — `Detail` is populated only when `IHostEnvironment.IsDevelopment()` is true, so dockerized responses running as `Production` omit exception details.

| Error Type                         | Status | Title                               |
| ---------------------------------- | ------ | ----------------------------------- |
| Model validation failure           | `400`  | `Validation failed`                 |
| `ArgumentException`                | `400`  | `Invalid request parameters`        |
| `UnauthorizedAccessException`      | `401`  | `Unauthorized access`               |
| Missing or wrong `X-API-Key`       | `401`  | — plain-text body, no JSON envelope |
| `KeyNotFoundException`             | `404`  | `Resource not found`                |
| Missing order (`null` result)      | `404`  | Empty body via `NotFound()`         |
| Missing `API_KEYS` server config   | `500`  | — plain-text body `API_KEYS were not setup` |
| Unhandled `Exception`              | `500`  | `An unexpected error occurred`      |

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

- **No unit tests** — no `*Tests.csproj`, `xunit`, `NUnit`, or `MSTest` reference exists in `backend/OrdersManagement.sln`.
- **Build verification** — compile both projects with `dotnet build backend/OrdersManagement.sln` from the repository root.
- **Container build verification** — validate `backend/Dockerfile` with `docker compose build api` from the repository root.
- **Migration verification** — automatic via `MigrateAsync()` on startup; manual check with `dotnet ef migrations list --project backend/Service --startup-project backend/WebAPI`.
- **Frontend checks** — typecheck and lint the empty scaffold with `npm run build` and `npm run lint` inside `frontend/`.
- **Smoke tests** — exercise `GET /health` without a key and `GET /api/Order` with header `X-API-Key: <your-api-key>` via `backend/WebAPI/WebAPI.http` or `curl` against `http://localhost:8080` in Docker or `http://localhost:5147` for local runs.
