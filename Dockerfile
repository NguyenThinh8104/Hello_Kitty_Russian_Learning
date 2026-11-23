FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY global.json ./
COPY NgaNgo.Web/NgaNgo.Web.csproj NgaNgo.Web/
RUN dotnet restore NgaNgo.Web/NgaNgo.Web.csproj
COPY NgaNgo.Web/ NgaNgo.Web/
RUN dotnet publish NgaNgo.Web/NgaNgo.Web.csproj -c Release -o /app --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app
COPY --from=build /app ./
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
USER $APP_UID
ENTRYPOINT ["dotnet", "NgaNgo.Web.dll"]
