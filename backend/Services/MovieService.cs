using System.Text.Json;
using System.Text.Json.Serialization;
using MovieSearchApi.Models;

namespace MovieSearchApi.Services;

public interface IMovieService
{
    Task<PagedResult<Movie>> SearchMoviesAsync(MovieFilterRequest filter);
    Task<List<string>> GetGenresAsync();
}

public class MovieService : IMovieService
{
    private readonly HttpClient _http;
    private readonly string _apiKey;
    private const string BaseUrl = "https://api.themoviedb.org/3";

    // JsonSerializer configurado para ler snake_case do TMDB
    private static readonly JsonSerializerOptions _jsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower
    };

    public MovieService(HttpClient http, IConfiguration config)
    {
        _http   = http;
        _apiKey = config["Tmdb:ApiKey"] ?? throw new InvalidOperationException(
            "TMDB API key nao encontrada. Adicione em appsettings.Development.json");
    }

    public async Task<PagedResult<Movie>> SearchMoviesAsync(MovieFilterRequest filter)
    {
        var endpoint = string.IsNullOrWhiteSpace(filter.Query)
            ? $"{BaseUrl}/movie/popular?api_key={_apiKey}&language=pt-BR&page={filter.Page}"
            : $"{BaseUrl}/search/movie?api_key={_apiKey}&language=pt-BR&query={Uri.EscapeDataString(filter.Query)}&page={filter.Page}";

        var response = await _http.GetAsync(endpoint);
        response.EnsureSuccessStatusCode();

        var json = await response.Content.ReadAsStringAsync();
        var tmdb = JsonSerializer.Deserialize<TmdbResponse>(json, _jsonOptions);

        if (tmdb is null) return new PagedResult<Movie>();

        var items = tmdb.Results.Select(m => new Movie
        {
            Id          = m.Id,
            Title       = m.Title ?? "",
            Year        = m.ReleaseDate?.Length >= 4 ? int.Parse(m.ReleaseDate[..4]) : 0,
            Genre       = "",
            Rating      = m.VoteAverage,
            Director    = "",
            Description = m.Overview ?? "",
            Duration    = 0,
            PosterUrl   = string.IsNullOrEmpty(m.PosterPath)
                            ? ""
                            : $"https://image.tmdb.org/t/p/w500{m.PosterPath}",
            Language    = m.OriginalLanguage ?? ""
        }).ToList();

        return new PagedResult<Movie>
        {
            Items      = items,
            TotalCount = tmdb.TotalResults,
            Page       = tmdb.Page,
            PageSize   = 20,
            TotalPages = Math.Min(tmdb.TotalPages, 500)
        };
    }

    public async Task<List<string>> GetGenresAsync()
    {
        var response = await _http.GetAsync(
            $"{BaseUrl}/genre/movie/list?api_key={_apiKey}&language=pt-BR");
        response.EnsureSuccessStatusCode();

        var json = await response.Content.ReadAsStringAsync();
        var tmdb = JsonSerializer.Deserialize<TmdbGenreResponse>(json, _jsonOptions);

        return tmdb?.Genres.Select(g => g.Name).ToList() ?? new List<string>();
    }
}

// ─── TMDB Models ──────────────────────────────────────────────────────────────

public class TmdbResponse
{
    public List<TmdbMovie> Results     { get; set; } = new();
    public int             Page        { get; set; }
    public int             TotalPages  { get; set; }
    public int             TotalResults { get; set; }
}

public class TmdbMovie
{
    public int     Id               { get; set; }
    public string? Title            { get; set; }
    public string? Overview         { get; set; }
    public string? PosterPath       { get; set; }
    public double  VoteAverage      { get; set; }
    public string? ReleaseDate      { get; set; }
    public string? OriginalLanguage { get; set; }
}

public class TmdbGenreResponse
{
    public List<TmdbGenre> Genres { get; set; } = new();
}

public class TmdbGenre
{
    public int    Id   { get; set; }
    public string Name { get; set; } = "";
}