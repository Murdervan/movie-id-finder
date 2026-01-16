let movies = [];
const search = document.getElementById("search");
const results = document.getElementById("results");
const status = document.getElementById("status");

// Load JSON database
fetch("data/movie_ids.json")
  .then(res => res.json())
  .then(data => {
    movies = data;
    status.textContent = `Filmdatabasen er klar (${movies.length} film)`;
  })
  .catch(() => {
    status.textContent = "❌ Kunne ikke indlæse filmdata";
  });

// Search
search.addEventListener("input", () => {
  const q = search.value.toLowerCase().trim();
  results.innerHTML = "";

  if (q.length < 2) return;

  const matches = movies
    .filter(m => m.title && m.title.toLowerCase().includes(q))
    .slice(0, 20);

  if (!matches.length) {
    results.innerHTML = "❌ Ingen resultater";
    return;
  }

  for (const m of matches) {
    results.innerHTML += `
      <div class="movie">
        <h3>${m.title} (${m.release_date?.slice(0,4) || "?"})</h3>
        <div class="small">
          TMDB ID: ${m.id}<br>
          IMDb ID: ${m.imdb_id || "N/A"}
        </div>
        <div class="small">
          <a href="https://www.imdb.com/title/${m.imdb_id}" target="_blank">IMDb</a> |
          <a href="https://www.themoviedb.org/movie/${m.id}" target="_blank">TMDB</a>
        </div>
      </div>
    `;
  }
});
