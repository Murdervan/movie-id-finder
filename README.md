<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Film Link Finder</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; max-width: 600px; }
    input { padding: 5px; font-size: 16px; width: 300px; }
    button { padding: 5px 10px; font-size: 16px; margin-left: 5px; }
    a { display: block; margin: 5px 0; color: blue; text-decoration: underline; }
    .not-found { color: red; margin-top: 10px; }
  </style>
</head>
<body>
  <h1>Film Link Finder</h1>
  <p>Skriv navnet på en film:</p>
  <input type="text" id="filmTitle" placeholder="Fx The Godfather">
  <button onclick="findFilm()">Find links</button>

  <h2>Resultat:</h2>
  <div id="result"></div>

  <script>
    // Liste over film med IMDb- og TMDb-ID’er
    const films = [
      { title: "The Godfather", imdb: "tt0068646", tmdb: "238" },
      { title: "Pulp Fiction", imdb: "tt0110912", tmdb: "680" },
      { title: "The Dark Knight", imdb: "tt0468569", tmdb: "155" },
      { title: "Forrest Gump", imdb: "tt0109830", tmdb: "13" },
      { title: "Star Wars: Episode IV - A New Hope", imdb: "tt0076759", tmdb: "11" },
      { title: "Casablanca", imdb: "tt0034583", tmdb: "111" },
      { title: "The Shawshank Redemption", imdb: "tt0111161", tmdb: "278" },
      { title: "Inception", imdb: "tt1375666", tmdb: "27205" },
      { title: "Fight Club", imdb: "tt0137523", tmdb: "550" }
    ];

    function findFilm() {
      const titleInput = document.getElementById("filmTitle").value.trim().toLowerCase();
      const resultDiv = document.getElementById("result");
      resultDiv.innerHTML = "";

      if (!titleInput) {
        alert("Indtast et filmnavn!");
        return;
      }

      const film = films.find(f => f.title.toLowerCase() === titleInput);

      if (!film) {
        resultDiv.innerHTML = `<div class="not-found">Film ikke fundet i listen.</div>`;
        return;
      }

      resultDiv.innerHTML = `
        <a href="https://www.imdb.com/title/${film.imdb}/" target="_blank">IMDb link: ${film.imdb}</a>
        <a href="https://www.themoviedb.org/movie/${film.tmdb}" target="_blank">TMDb link: ${film.tmdb}</a>
      `;
    }
  </script>
</body>
</html>
