FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["Services/ScanService/ScanService.API/ScanService.API.csproj", "Services/ScanService/ScanService.API/"]
COPY ["Services/ScanService/ScanService.Application/ScanService.Application.csproj", "Services/ScanService/ScanService.Application/"]
COPY ["Services/ScanService/ScanService.Domain/ScanService.Domain.csproj", "Services/ScanService/ScanService.Domain/"]
COPY ["Services/ScanService/ScanService.Infrastructure/ScanService.Infrastructure.csproj", "Services/ScanService/ScanService.Infrastructure/"]
COPY ["SharedLibrary/SharedLibrary.csproj", "SharedLibrary/"]
RUN dotnet restore "Services/ScanService/ScanService.API/ScanService.API.csproj"
COPY . .
WORKDIR "/src/Services/ScanService/ScanService.API"
RUN dotnet build "ScanService.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "ScanService.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "ScanService.API.dll"]