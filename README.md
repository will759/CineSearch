# 🎬 CineSearch — Movie Search App

🔗 Demo online (Frontend): https://cine-search-livid.vercel.app/
🔗 API online (Backend): https://cinesearch-production.up.railway.app/api/movies

**Stack:** React + TypeScript (frontend) · C# ASP.NET Core (backend)

---

## Estrutura do Projeto

```

├── backend/                    ← C# ASP.NET Core API
│   ├── Controllers/
│   │   └── MoviesController.cs    GET /api/movies, GET /api/movies/{id}, GET /api/movies/genres
│   ├── Models/
│   │   └── Movie.cs               Movie, MovieFilterRequest, PagedResult<T>
│   ├── Services/
│   │   └── MovieService.cs        Lógica de busca, filtro e paginação
│   ├── Program.cs                 DI, CORS, Swagger
│   └── MovieSearchApi.csproj
│
└── frontend/                   ← React + TypeScript (Vite)
    └── src/
        ├── types/movie.ts         Interfaces TypeScript (Movie, PagedResult, Filter)
        ├── services/movieApi.ts   Camada de chamadas HTTP
        ├── hooks/useMovieSearch.ts Custom hook com debounce
        ├── App.tsx                UI completa (cards, modal, filtros, paginação)
        └── App.css                Tema cinematográfico dark
```

---

## Como rodar

### Backend (C# ASP.NET Core)

```bash
cd backend
dotnet run
# API disponível em: http://localhost:5000
# Swagger UI em:    http://localhost:5000/swagger
```

**Endpoints:**
| Método | Rota                  | Descrição                        |
|--------|-----------------------|----------------------------------|
| GET    | /api/movies           | Busca com filtros + paginação    |
| GET    | /api/movies/{id}      | Detalhes de um filme             |
| GET    | /api/movies/genres    | Lista de gêneros disponíveis     |

**Query params para GET /api/movies:**
```
query       string    Busca por título, diretor ou descrição
genre       string    Filtro por gênero (ex: "Sci-Fi")
yearFrom    int       Ano mínimo
yearTo      int       Ano máximo
minRating   double    Rating mínimo (0-10)
sortBy      string    "title" | "year" | "rating"
sortOrder   string    "asc" | "desc"
page        int       Página atual (default: 1)
pageSize    int       Itens por página (default: 12)
```

### Frontend (React + TypeScript)

```bash
cd frontend
npm install
npm run dev
# App disponível em: http://localhost:5173
```

---

## O que foi praticado

### API Calls (TypeScript)
- **`services/movieApi.ts`** — camada isolada de chamadas HTTP
- `buildQueryString()` — serialização de filtros como query params
- `apiFetch<T>()` — wrapper genérico com error handling tipado
- Fetch nativo com `URLSearchParams` (sem axios)

### Filtering & Sorting (C#)
- **`MovieService.cs`** — LINQ com filtros encadeados
- Busca por texto com `.Contains()` case-insensitive
- Pattern matching no sort: `(sortBy, sortOrder) switch { ... }`
- Paginação com `.Skip().Take()`

### React Patterns
- **`useMovieSearch.ts`** — custom hook que encapsula toda a lógica
- Debounce na busca (300ms) com `useRef` + `clearTimeout`
- Estado derivado: resetar página ao mudar filtros
- `useEffect` com cleanup function

### TypeScript
- Interfaces para `Movie`, `PagedResult<T>`, `MovieFilterRequest`
- Generics: `PagedResult<Movie>`, `apiFetch<T>`
- Union types para `sortBy` e `sortOrder`
- Destructuring e optional chaining

---

## Próximos passos (para evoluir o projeto)

1. **SQL Server** — trocar a lista estática por EF Core + banco real
2. **Auth** — JWT com login/cadastro
3. **Favoritos** — salvar filmes por usuário
4. **TMDB API** — integrar dados reais de filmes
5. **Testes** — xUnit no backend, Vitest no frontend
