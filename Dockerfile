# ---------- Stage 1: Build ----------
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj files first so restore is cached
COPY OrdersManagement.sln ./
COPY WebAPI/WebAPI.csproj WebAPI/
COPY Service/Service.csproj Service/

RUN dotnet restore WebAPI/WebAPI.csproj

# Copy the rest of the source
COPY . .

# Publish in Release mode
RUN dotnet publish WebAPI/WebAPI.csproj -c Release -o /app/publish /p:UseAppHost=false

# ---------- Stage 2: Runtime ----------
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

EXPOSE 8080

ENTRYPOINT ["dotnet", "WebAPI.dll"]