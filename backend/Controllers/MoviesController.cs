using Microsoft.AspNetCore.Mvc;
using MovieSearchApi.Models;
using MovieSearchApi.Services;

namespace MovieSearchApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MoviesController : ControllerBase
{
    private readonly IMovieService _movieService;
    private readonly ILogger<MoviesController> _logger;

    public MoviesController(IMovieService movieService, ILogger<MoviesController> logger)
    {
        _movieService = movieService;
        _logger       = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetMovies([FromQuery] MovieFilterRequest filter)
    {
        _logger.LogInformation("Searching movies: query={Query}", filter.Query);
        var result = await _movieService.SearchMoviesAsync(filter);
        return Ok(result);
    }

    [HttpGet("genres")]
    public async Task<IActionResult> GetGenres()
    {
        var genres = await _movieService.GetGenresAsync();
        return Ok(genres);
    }
}