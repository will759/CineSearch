namespace MovieSearchApi.Models;

public class Movie
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public int Year { get; set; }
    public string Genre { get; set; } = string.Empty;
    public double Rating { get; set; }
    public string Director { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int Duration { get; set; }
    public string PosterUrl { get; set; } = string.Empty;
    public string Language { get; set; } = string.Empty;
}

public class MovieFilterRequest
{
    public string? Query { get; set; }
    public string? Genre { get; set; }
    public int? YearFrom { get; set; }
    public int? YearTo { get; set; }
    public double? MinRating { get; set; }
    public string? SortBy { get; set; }
    public string? SortOrder { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}

public class PagedResult<T>
{
    public List<T> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages { get; set; } // ← agora é gravável
}