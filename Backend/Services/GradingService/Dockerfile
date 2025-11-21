FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["Services/GradingService/GradingService.API/GradingService.API.csproj", "Services/GradingService/GradingService.API/"]
COPY ["Services/GradingService/GradingService.Application/GradingService.Application.csproj", "Services/GradingService/GradingService.Application/"]
COPY ["Services/GradingService/GradingService.Domain/GradingService.Domain.csproj", "Services/GradingService/GradingService.Domain/"]
COPY ["Services/GradingService/GradingService.Infrastructure/GradingService.Infrastructure.csproj", "Services/GradingService/GradingService.Infrastructure/"]
COPY ["SharedLibrary/SharedLibrary.csproj", "SharedLibrary/"]
RUN dotnet restore "Services/GradingService/GradingService.API/GradingService.API.csproj"
COPY . .
WORKDIR "/src/Services/GradingService/GradingService.API"
RUN dotnet build "GradingService.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "GradingService.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "GradingService.API.dll"]