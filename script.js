const API_KEY = "b7a512be09653a21e9b9cc99a026ae46";
const q = document.getElementById("q");
const results = document.getElementById("results");
const topBtn = document.getElementById("topBtn");
let searchId = 0;

//LOAD LATEST MOVIES
async function loadLatestMovies() {
  try {
    const res = await fetch(`https://api.themoviedb.org/3/movie/now_playing?api_key=${API_KEY}&language=en-US&page=1`);
    const data = await res.json();

    const container = document.getElementById("latest-movies-container");
    if (!container || !data.results) return;

    container.innerHTML = "";

    const movies = data.results.slice(0, 5);

    for (const movie of movies) {

      let imdbId = "N/A";
      try {
        const ext = await fetch(`https://api.themoviedb.org/3/movie/${movie.id}/external_ids?api_key=${API_KEY}`);
        const extData = await ext.json();

        if (extData.imdb_id) {
          imdbId = extData.imdb_id.replace(/^tt/, "");
        }
      } catch {}

      const poster = movie.poster_path
        ? `https://image.tmdb.org/t/p/w200${movie.poster_path}`
        : "https://via.placeholder.com/80x120?text=No+Image";

      let releaseClass = "release-date-red";
      if (movie.release_date) {
        const releaseDate = new Date(movie.release_date);
        const today = new Date();
        const diffDays = (today - releaseDate) / (1000 * 60 * 60 * 24);
        if (diffDays <= 30) releaseClass = "release-date-neon";
      }

      container.innerHTML += `
        <div class="latest-movie-item">
          <img class="latest-movie-poster" src="${poster}" alt="${movie.title}">
          <div class="latest-movie-info">

            <div class="latest-movie-title">${movie.title}</div>

            <div class="latest-movie-meta">
              Release: <span class="${releaseClass}">
                ${movie.release_date || "N/A"}
              </span>
            </div>

            <div class="latest-movie-rating">⭐ ${movie.vote_average}</div>

            <div class="latest-movie-id">
              <span class="tmdb-id" data-id="${movie.id}">
                TMDb ID: ${movie.id}
              </span>

              ${imdbId !== "N/A" ? `
                <span class="imdb-id" data-id="${imdbId}">
                  IMDb ID: ${imdbId}
                </span>
              ` : ""}
            </div>

            <div>
              <a href="https://www.themoviedb.org/movie/${movie.id}" target="_blank">
                View on TMDB
              </a>
            </div>

          </div>
        </div>
      `;
    }

  } catch (err) {
    console.error("Latest movies error:", err);
  }
}

document.addEventListener("DOMContentLoaded", loadLatestMovies);

document.addEventListener("click", function(e) {

  if (e.target.classList.contains("tmdb-id") ||
      e.target.classList.contains("imdb-id")) {

    const id = e.target.getAttribute("data-id");
    if (!id) return;

    navigator.clipboard.writeText(id);


    setTimeout(() => {
      e.target.innerText = original;
    }, 1000);
  }

});

// COPY BUTTON (SEARCH RESULTS)
function copyToClipboard(id, button) {
  navigator.clipboard.writeText(id);
  button.textContent = "Copied!";
  button.classList.add("copied");
  setTimeout(() => {
    button.textContent = "Copy";
    button.classList.remove("copied");
  }, 1500);
}

// SCROLL TO TOP
window.onscroll = () => {
  topBtn.style.display = document.documentElement.scrollTop > 100 ? "block" : "none";
};

function topFunction() {
  document.documentElement.scrollTop = 0;
}

// SEARCH MOVIES + TV
q.addEventListener("input", async () => {
  const currentSearch = ++searchId;
  results.innerHTML = "";

  let queryText = q.value.trim().replace(/\s+/g, ' ');
  if (queryText.length < 2) return;
  const query = encodeURIComponent(queryText);

  const [movieRes, tvRes] = await Promise.all([
    fetch(`https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${query}`).then(r => r.json()),
    fetch(`https://api.themoviedb.org/3/search/tv?api_key=${API_KEY}&query=${query}`).then(r => r.json())
  ]);

  if (currentSearch !== searchId) return;

  const combined = [
    ...movieRes.results.map(r => ({ ...r, media_type: "movie" })),
    ...tvRes.results.map(r => ({ ...r, media_type: "tv" }))
  ];

  for (const item of combined) {

    const detailUrl = item.media_type === "movie"
      ? `https://api.themoviedb.org/3/movie/${item.id}?api_key=${API_KEY}`
      : `https://api.themoviedb.org/3/tv/${item.id}?api_key=${API_KEY}`;

    const d = await fetch(detailUrl).then(r => r.json());
    if (currentSearch !== searchId) return;

    const title = d.title || d.name;
    const year = (d.release_date || d.first_air_date || "").slice(0, 4) || "N/A";
    const poster = d.poster_path
      ? `https://image.tmdb.org/t/p/w200${d.poster_path}`
      : "https://via.placeholder.com/100x150?text=No+Image";

    const tmdbLink = item.media_type === "movie"
      ? `https://www.themoviedb.org/movie/${d.id}`
      : `https://www.themoviedb.org/tv/${d.id}`;

    const imdbIdNum = d.imdb_id ? d.imdb_id.replace(/^tt/, "") : null;
    const imdbLink = imdbIdNum ? `https://www.imdb.com/title/tt${imdbIdNum}/` : "#";

    const tvdbSearch = `https://www.thetvdb.com/search?query=${encodeURIComponent(title)}`;
    const genreBadges = d.genres?.map(g => `<span class="badge">${g.name}</span>`).join("") || "";

    results.innerHTML += `
<div class="movie">
  <div class="poster-wrap">
    <img src="${poster}" alt="${title}" loading="lazy">
    <div class="poster-emoji">${item.media_type === "tv" ? "📺" : "🎬"}</div>
    <div class="poster-type">${item.media_type === "tv" ? "TV Series" : "Movie"}</div>
  </div>
  <div class="movie-info">
    <b>${title} (${year})</b>
    <div class="badges">${genreBadges}</div>
    <p>⭐ Rating: ${d.vote_average || "N/A"} | Votes: ${d.vote_count || 0}</p>
    <p>${d.overview?.slice(0,150) || "No description"}${d.overview?.length > 150 ? "..." : ""}</p>

    <div class="id-box tmdb">
      <a href="${tmdbLink}" target="_blank">TMDb ID: ${d.id}</a>
      <button class="copy-btn" onclick="copyToClipboard('${d.id}', this)">Copy</button>
    </div>

    ${imdbIdNum ? `
    <div class="id-box imdb">
      <a href="${imdbLink}" target="_blank">IMDb ID: ${imdbIdNum}</a>
      <button class="copy-btn" onclick="copyToClipboard('${imdbIdNum}', this)">Copy</button>
    </div>` : ""}

    ${item.media_type === "tv" ? `
    <div class="id-box tvdb">
      <span>TheTVDb ID Page</span>
      <a class="open-btn" href="${tvdbSearch}" target="_blank">OPEN</a>
    </div>` : ""}
  </div>
</div>`;
  }
});


// CLICK TO COPY (SIDEBAR IDs)
document.addEventListener("click", function(e) {
  if (e.target.classList.contains("tmdb-id") || 
      e.target.classList.contains("imdb-id")) {

    const id = e.target.getAttribute("data-id");
    navigator.clipboard.writeText(id);

    const original = e.target.innerText;
    e.target.innerText = "Copied!";
    e.target.style.opacity = "0.6";

    setTimeout(() => {
      e.target.innerText = original;
      e.target.style.opacity = "1";
    }, 800);
  }
});
