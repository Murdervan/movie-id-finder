const API_KEY = "b7a512be09653a21e9b9cc99a026ae46";
const q = document.getElementById("q");
const results = document.getElementById("results");
const topBtn = document.getElementById("topBtn");
let searchId = 0;
let currentMoviePage = 1;

const TRUSTED_LINKS = [
  {
    title: "NordicQuality",
    url: "https://nordicq.org/",
    note: "Quality content for our scandinavian friends."
  },
  {
    title: "WANT YOUR WEBSITE HERE?",
    url: "YOUR LINK HERE",
    note: "AND A NOTE IF NEEDIT"
  },
  {
    title: "WANT YOUR WEBSITE HERE?",
    url: "YOUR LINK HERE",
    note: "AND A NOTE IF NEEDIT"
  },
  {
    title: "Superbits",
    url: "https://superbits.org",
    note: "Sveriges största bittorrent tracker."
  },
  {
    title: "Nusens Homepage – Torrent Page",
    url: "https://homepage.nusens.net/torrent.htm",
    note: "For more torrents links, guidelines and infomation"
  }
];

async function safeCopyText(value) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch {}

  try {
    const textArea = document.createElement("textarea");
    textArea.value = value;
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
    return true;
  } catch {
    return false;
  }
}

function copyText(value, event) {
  const button = event.target;
  const originalText = button.textContent;

  safeCopyText(value).then(success => {
    button.textContent = success ? "Copied!" : "Failed";
    setTimeout(() => {
      button.textContent = originalText;
    }, 1000);
  });
}

async function loadMoviesPage(pageNum) {
  currentMoviePage = pageNum;
  const grid = document.getElementById("movies-grid");
  grid.innerHTML = '<p style="text-align:center; color:#ccc; grid-column:1 / -1;">Loading movies...</p>';

  try {
    const res = await fetch(
  `https://api.themoviedb.org/3/movie/now_playing?api_key=${API_KEY}&language=en-US&page=${pageNum}`
);

    const data = await res.json();

    if (!data.results || data.results.length === 0) {
      grid.innerHTML = '<p style="text-align:center; color:#ccc; grid-column:1 / -1;">No movies found</p>';
      return;
    }

    const moviesToShow = data.results.slice(0, 15);

    let tileHtml = "";

    for (const movie of moviesToShow) {
      let imdbId = null;
      let genres = [];
      let overview = "";

      try {
        const extRes = await fetch(`https://api.themoviedb.org/3/movie/${movie.id}/external_ids?api_key=${API_KEY}`);
        const extData = await extRes.json();
        if (extData.imdb_id) imdbId = extData.imdb_id.replace(/^tt/, "");
      } catch {}

      try {
        const detailRes = await fetch(`https://api.themoviedb.org/3/movie/${movie.id}?api_key=${API_KEY}&language=en-US`);
        const detailData = await detailRes.json();
        genres = detailData.genres?.map(g => g.name) || [];
        overview = detailData.overview || "";
      } catch {}

      const poster = movie.poster_path
        ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
        : "https://via.placeholder.com/200x300?text=No+Image";

      const year = (movie.release_date || "").slice(0, 4) || "N/A";
      const rating = movie.vote_average ? Number(movie.vote_average).toFixed(1) : "N/A";
      const popularity = movie.popularity ? Math.round(movie.popularity) : "N/A";
      const title = movie.title || "Unknown";
      const genresText = genres.slice(0, 2).join(", ") || "Unknown";
      const overviewText = overview.length > 100 ? overview.slice(0, 100) + "..." : overview || "No description available.";

      const tmdbLink = `https://www.themoviedb.org/movie/${movie.id}`;
      const imdbLink = imdbId ? `https://www.imdb.com/title/tt${imdbId}/` : "#";

      tileHtml += `
        <div class="movie-tile">
          <div class="movie-poster-wrapper">
            <img src="${poster}" alt="${title}">
            <div class="movie-overlay">
              <div class="movie-meta-top">
                <span class="meta-item">📅 ${year}</span>
                <span class="meta-item">⭐ ${rating}</span>
                <span class="meta-item">🔥 ${popularity}</span>
              </div>
              <div class="movie-genres-top">${genresText}</div>
            </div>
          </div>

          <div class="movie-info-box">
            <div class="movie-title" title="${title}">${title}</div>
            <div class="movie-synopsis">${overviewText}</div>

            <div class="movie-links">
              <a href="${tmdbLink}" target="_blank" class="link-btn tmdb-link">TMDb</a>
              ${imdbId ? `<a href="${imdbLink}" target="_blank" class="link-btn imdb-link">IMDb</a>` : ""}
            </div>

            <div class="movie-ids">
              <button class="id-tag" onclick="copyText('${movie.id}', event)">ID: ${movie.id}</button>
              ${imdbId ? `<button class="id-tag imdb" onclick="copyText('${imdbId}', event)">ID: ${imdbId}</button>` : ""}
            </div>
          </div>
        </div>
      `;
    }

    grid.innerHTML = tileHtml;

    document.querySelectorAll(".pager-btn").forEach(btn => {
      btn.classList.remove("active");
      if (Number(btn.textContent) === pageNum) {
        btn.classList.add("active");
      }
    });

  } catch (err) {
    console.error("Error loading movies:", err);
    grid.innerHTML = '<p style="text-align:center; color:#ff6b6b; grid-column:1 / -1;">Error loading movies. Please try again.</p>';
  }
}

function showPage(pageName) {
  document.getElementById("search-page").style.display = "none";
  document.getElementById("movies-page").style.display = "none";
  document.getElementById("trusted-links-page").style.display = "none";

  document.querySelectorAll(".menu-btn").forEach(btn => btn.classList.remove("active"));

  if (pageName === "search") {
    document.getElementById("search-page").style.display = "block";
    document.querySelectorAll(".menu-btn")[0].classList.add("active");
  } else if (pageName === "movies") {
    document.getElementById("movies-page").style.display = "block";
    document.querySelectorAll(".menu-btn")[1].classList.add("active");
    if (document.getElementById("movies-grid").innerHTML.includes("Loading")) {
      loadMoviesPage(1);
    }
  } else if (pageName === "trusted-links") {
    document.getElementById("trusted-links-page").style.display = "block";
    document.querySelectorAll(".menu-btn")[2].classList.add("active");
    renderTrustedLinks();
  }

  document.documentElement.scrollTop = 0;
}

function renderTrustedLinks() {
  const container = document.getElementById("trusted-links-container");

  if (TRUSTED_LINKS.length === 0) {
    container.innerHTML = '<p style="text-align:center; color:#ccc;">No trusted links added yet.</p>';
    return;
  }

  container.innerHTML = TRUSTED_LINKS.map(link => `
    <div class="trusted-link-card">
      <div class="link-info">
        <h3>${link.title}</h3>
        <p class="link-note">${link.note || "No note added."}</p>
        <p class="link-url">${link.url}</p>
      </div>
      <a href="${link.url.startsWith("http") ? link.url : "https://" + link.url}" target="_blank" class="open-link-btn">
        Open Link →
      </a>
    </div>
  `).join("");
}

function copyToClipboard(id, button) {
  safeCopyText(id).then(success => {
    const originalText = button.textContent;
    button.textContent = success ? "Copied!" : "Failed";
    button.classList.add("copied");
    setTimeout(() => {
      button.textContent = originalText;
      button.classList.remove("copied");
    }, 1000);
  });
}

function topFunction() {
  document.documentElement.scrollTop = 0;
}

window.onscroll = () => {
  topBtn.style.display = document.documentElement.scrollTop > 100 ? "block" : "none";
};

q.addEventListener("input", async () => {
  const currentSearch = ++searchId;
  results.innerHTML = "";

  let queryText = q.value.trim().replace(/\s+/g, " ");
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
      </div>
    `;
  }
});
