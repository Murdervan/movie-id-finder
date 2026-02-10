const API_KEY = "b7a512be09653a21e9b9cc99a026ae46";
const q = document.getElementById("q");
const results = document.getElementById("results");
const topBtn = document.getElementById("topBtn");
let searchId = 0;

// Copy ID
function copyToClipboard(id, button) {
  navigator.clipboard.writeText(id);
  button.textContent = "Copied!";
  button.classList.add("copied");
  setTimeout(() => {
    button.textContent = "Copy";
    button.classList.remove("copied");
  }, 1500);
}

// Scroll-to-top button
window.onscroll = () => {
  topBtn.style.display = document.documentElement.scrollTop > 100 ? "block" : "none";
};
function topFunction() {
  document.documentElement.scrollTop = 0;
}

// Search movies + TV
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
    const poster = d.poster_path ? `https://image.tmdb.org/t/p/w200${d.poster_path}` : "https://via.placeholder.com/100x150?text=No+Image";

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
