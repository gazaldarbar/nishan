/* =========================================================
   SHARED RENDERING LOGIC
   movies.html + series.html
   + THE WATCHLIST CINEMA ENGINE
   ========================================================= */

const PAGE_SIZE = 60;


/* =========================================================
   DATE FORMATTER
   ========================================================= */

function fmtDate(d){

  if(!d) return "—";

  const [y,m,day] = d.split('-');

  const months = [
    "Jan","Feb","Mar","Apr",
    "May","Jun","Jul","Aug",
    "Sep","Oct","Nov","Dec"
  ];

  return `${day} ${months[parseInt(m,10)-1]} ${y}`;

}


/* =========================================================
   CARD
   ========================================================= */

function cardHTML(item){

  const genre =
    (item.genres || "")
      .split(',')[0]
      ?.trim() || "—";

  return `

  <a
    class="card"
    href="${item.url}"
    target="_blank"
    rel="noopener">

    <div class="c-top">

      <div>

        <div class="c-year">
          ${item.year || "—"}
        </div>

      </div>

      <div class="c-rating">

        ${item.yourRating}

        <span class="of10">
          /10
        </span>

      </div>

    </div>


    <div class="c-title">
      ${item.title}
    </div>


    <div class="c-genre">
      ${genre}
    </div>


    <div class="c-foot">

      <span>
        Rated ${fmtDate(item.dateRated)}
      </span>

      <span class="c-imdb">
        IMDb ${item.imdbRating ?? "—"}
      </span>

    </div>

  </a>`;

}


/* =========================================================
   LIST ENGINE
   ========================================================= */

function initList(
  items,
  grid,
  searchInput,
  sortSelect,
  loadMoreBtn,
  countEl
){

  let filtered = items.slice();

  let shown = 0;


  function sortItems(){

    const mode =
      sortSelect.value;

    filtered.sort((a,b)=>{

      if(mode === 'rating-desc')
        return b.yourRating - a.yourRating;

      if(mode === 'rating-asc')
        return a.yourRating - b.yourRating;

      if(mode === 'year-desc')
        return (b.year||0) - (a.year||0);

      if(mode === 'year-asc')
        return (a.year||0) - (b.year||0);

      if(mode === 'date-desc')
        return (b.dateRated||'')
          .localeCompare(a.dateRated||'');

      if(mode === 'date-asc')
        return (a.dateRated||'')
          .localeCompare(b.dateRated||'');

      if(mode === 'title-asc')
        return a.title.localeCompare(b.title);

      return 0;

    });

  }


  function applyFilter(){

    const q =
      searchInput.value
        .trim()
        .toLowerCase();


    /*
       Search now checks:

       TITLE
       GENRE
       DIRECTOR
       YEAR
       IMDb RATING
    */

    filtered =
      items.filter(it => {

        if(!q) return true;

        const title =
          String(it.title || "")
            .toLowerCase();

        const genres =
          String(it.genres || "")
            .toLowerCase();

        const director =
          String(it.director || "")
            .toLowerCase();

        const year =
          String(it.year || "")
            .toLowerCase();

        const imdb =
          String(it.imdbRating || "")
            .toLowerCase();


        return (

          title.includes(q) ||

          genres.includes(q) ||

          director.includes(q) ||

          year.includes(q) ||

          imdb.includes(q)

        );

      });


    sortItems();

    shown = 0;

    grid.innerHTML = '';

    renderNext();

  }


  function renderNext(){

    const next =
      filtered.slice(
        shown,
        shown + PAGE_SIZE
      );


    grid.insertAdjacentHTML(
      'beforeend',
      next.map(cardHTML).join('')
    );


    shown += next.length;


    countEl.textContent =
      `${filtered.length} title${
        filtered.length===1
          ? ''
          : 's'
      }`;


    loadMoreBtn.style.display =
      shown < filtered.length
        ? 'block'
        : 'none';


    if(filtered.length === 0){

      grid.innerHTML =
        '<div class="empty-state">No titles match.</div>';

    }

  }


  searchInput.addEventListener(
    'input',
    applyFilter
  );


  sortSelect.addEventListener(
    'change',
    applyFilter
  );


  loadMoreBtn.addEventListener(
    'click',
    renderNext
  );


  sortItems();

  renderNext();

}


/* =========================================================
   CINEMA ENGINE
   ONLY RUNS ON index.html
   ========================================================= */

(function CinemaEngine(){

  const isHome =
    document.getElementById(
      "ratingDistribution"
    );

  if(!isHome) return;


  let movieDatabase = [];

  let seriesDatabase = [];


  /* =======================================================
     HELPERS
     ======================================================= */

  const qs =
    selector =>
      document.querySelector(selector);


  const safeNumber =
    value =>
      Number(value) || 0;


  const escapeHTML =
    value => {

      return String(value ?? "")
        .replace(/&/g,"&amp;")
        .replace(/</g,"&lt;")
        .replace(/>/g,"&gt;")
        .replace(/"/g,"&quot;")
        .replace(/'/g,"&#039;");

    };


  /* =======================================================
     FLATTEN MOVIES.JSON
     ======================================================= */

  function flattenMovieData(data){

    const result = [];

    if(!data || typeof data !== "object")
      return result;


    Object.entries(data)
      .forEach(
        ([language, titles]) => {

          if(!Array.isArray(titles))
            return;


          titles.forEach(item => {

            result.push({

              ...item,

              language:
                language

            });

          });

        }
      );


    return result;

  }


  /* =======================================================
     LOAD DATA
     ======================================================= */

  async function loadData(){

    try{

      const movieResponse =
        await fetch("movies.json");

      const movieJSON =
        await movieResponse.json();

      movieDatabase =
        flattenMovieData(movieJSON);


    }catch(error){

      console.error(
        "Could not load movies.json",
        error
      );

    }


    /*
       series.json exists in your repository,
       so we also calculate the series count.
    */

    try{

      const seriesResponse =
        await fetch("series.json");

      const seriesJSON =
        await seriesResponse.json();


      /*
         Handles both:

         [
           {...}
         ]

         and:

         {
           "English":[...],
           "Malayalam":[...]
         }
      */

      if(Array.isArray(seriesJSON)){

        seriesDatabase =
          seriesJSON;

      }else{

        seriesDatabase =
          flattenMovieData(seriesJSON);

      }


    }catch(error){

      console.warn(
        "series.json could not be loaded.",
        error
      );

    }


    initializeDashboard();

  }


  /* =======================================================
     BASIC STATS
     ======================================================= */

  function buildBasicStats(){

    const total =
      movieDatabase.length +
      seriesDatabase.length;


    const movieCount =
      movieDatabase.length;


    const seriesCount =
      seriesDatabase.length;


    const average =
      movieDatabase.length
        ? movieDatabase.reduce(
            (sum,movie) =>
              sum +
              safeNumber(movie.yourRating),
            0
          ) /
          movieDatabase.length
        : 0;


    animateNumber(
      qs("#totalTitles"),
      total
    );


    animateNumber(
      qs("#movieCount"),
      movieCount
    );


    animateNumber(
      qs("#seriesCount"),
      seriesCount
    );


    if(qs("#averageRating")){

      qs("#averageRating")
        .textContent =
          average.toFixed(2);

    }


    if(qs("#movieTileCount")){

      qs("#movieTileCount")
        .textContent =
          movieCount.toLocaleString();

    }


    if(qs("#seriesTileCount")){

      qs("#seriesTileCount")
        .textContent =
          seriesCount.toLocaleString();

    }

  }


  /* =======================================================
     ANIMATED COUNTERS
     ======================================================= */

  function animateNumber(
    element,
    target
  ){

    if(!element) return;


    const duration = 1300;

    const start =
      performance.now();


    function update(now){

      const progress =
        Math.min(
          (now - start) /
          duration,
          1
        );


      const eased =
        1 -
        Math.pow(
          1 - progress,
          3
        );


      const value =
        Math.floor(
          target * eased
        );


      element.textContent =
        value.toLocaleString();


      if(progress < 1){

        requestAnimationFrame(
          update
        );

      }

    }


    requestAnimationFrame(update);

  }


  /* =======================================================
     RATING DISTRIBUTION
     ======================================================= */

  function buildRatingDistribution(){

    const container =
      qs("#ratingDistribution");

    if(!container) return;


    const counts =
      {};

    for(
      let rating = 1;
      rating <= 10;
      rating++
    ){

      counts[rating] = 0;

    }


    movieDatabase.forEach(
      movie => {

        const rating =
          Math.round(
            safeNumber(
              movie.yourRating
            )
          );


        if(
          rating >= 1 &&
          rating <= 10
        ){

          counts[rating]++;

        }

      }
    );


    const max =
      Math.max(
        ...Object.values(counts),
        1
      );


    container.innerHTML = "";


    for(
      let rating = 10;
      rating >= 1;
      rating--
    ){

      const percentage =
        counts[rating] /
        max *
        100;


      container.insertAdjacentHTML(
        "beforeend",
        `

        <div class="rating-row-new">

          <div class="rating-label-new">
            ${rating}
          </div>

          <div class="rating-track-new">

            <div
              class="rating-fill-new"
              style="width:${percentage}%">
            </div>

          </div>

          <div class="rating-count-new">
            ${counts[rating]}
          </div>

        </div>

        `
      );

    }

  }


  /* =======================================================
     GENERIC BAR BUILDER
     ======================================================= */

  function buildBarList(
    containerID,
    values,
    limit
  ){

    const container =
      qs(containerID);

    if(!container) return;


    const sorted =
      Object.entries(values)
        .sort(
          (a,b) =>
            b[1] - a[1]
        )
        .slice(0,limit);


    if(!sorted.length){

      container.innerHTML =
        "<div class='empty-state'>No data.</div>";

      return;

    }


    const max =
      sorted[0][1];


    container.innerHTML = "";


    sorted.forEach(
      ([name,count]) => {

        const percentage =
          count /
          max *
          100;


        container.insertAdjacentHTML(
          "beforeend",
          `

          <div class="bar-item">

            <div class="bar-name">
              ${escapeHTML(name)}
            </div>

            <div class="bar-track">

              <div
                class="bar-fill"
                style="width:${percentage}%">
              </div>

            </div>

            <div class="bar-value">
              ${count}
            </div>

          </div>

          `
        );

      }
    );

  }


  /* =======================================================
     LANGUAGE DNA
     ======================================================= */

  function buildLanguageDNA(){

    const languages = {};


    movieDatabase.forEach(
      movie => {

        const language =
          movie.language ||
          "Unknown";


        languages[language] =
          (languages[language] || 0)
          + 1;

      }
    );


    buildBarList(
      "#languageDNA",
      languages,
      10
    );

  }


  /* =======================================================
     GENRE DNA
     ======================================================= */

  function buildGenreDNA(){

    const genres = {};


    movieDatabase.forEach(
      movie => {

        String(
          movie.genres || ""
        )
        .split(",")
        .map(
          genre =>
            genre.trim()
        )
        .filter(Boolean)
        .forEach(
          genre => {

            genres[genre] =
              (genres[genre] || 0)
              + 1;

          }
        );

      }
    );


    buildBarList(
      "#genreDNA",
      genres,
      12
    );

  }


  /* =======================================================
     DIRECTORS
     ======================================================= */

  function buildDirectors(){

    const directors = {};


    movieDatabase.forEach(
      movie => {

        const names =
          String(
            movie.director || ""
          )
          .split(",")
          .map(
            name =>
              name.trim()
          )
          .filter(Boolean);


        names.forEach(
          director => {

            if(!directors[director]){

              directors[director] = {

                count:0,
                total:0

              };

            }


            directors[director].count++;

            directors[director].total +=
              safeNumber(
                movie.yourRating
              );

          }
        );

      }
    );


    const sorted =
      Object.entries(directors)
        .sort(
          (a,b) =>
            b[1].count -
            a[1].count
        )
        .slice(0,12);


    const container =
      qs("#directorList");


    if(!container) return;


    container.innerHTML = "";


    sorted.forEach(
      ([name,data]) => {

        const average =
          data.total /
          data.count;


        container.insertAdjacentHTML(
          "beforeend",
          `

          <div class="director-card">

            <div class="director-name">
              ${escapeHTML(name)}
            </div>

            <div class="director-meta">
              ${data.count} title${
                data.count === 1
                  ? ""
                  : "s"
              }
            </div>

            <div class="director-rating">
              ${average.toFixed(1)}/10
            </div>

          </div>

          `
        );

      }
    );

  }


  /* =======================================================
     RATING PERSONALITY
     ======================================================= */

  function buildRatingPersonality(){

    const container =
      qs("#ratingPersonality");

    const description =
      qs("#personalityDescription");


    if(!container) return;


    const ratings =
      movieDatabase.map(
        movie =>
          safeNumber(
            movie.yourRating
          )
      )
      .filter(
        rating =>
          rating > 0
      );


    if(!ratings.length)
      return;


    const average =
      ratings.reduce(
        (a,b) => a+b,
        0
      ) /
      ratings.length;


    const high =
      ratings.filter(
        r => r >= 8
      ).length /
      ratings.length;


    const low =
      ratings.filter(
        r => r <= 5
      ).length /
      ratings.length;


    let personality =
      "THE BALANCED CRITIC";


    let text =
      "You don't hand out extreme scores easily. Your ratings tend to stay close to the middle of the scale.";


    if(average >= 8){

      personality =
        "THE GENEROUS CINEPHILE";

      text =
        "You are unusually generous with ratings. When a movie works for you, you are very willing to reward it.";

    }

    else if(
      average <= 6
    ){

      personality =
        "THE HARD MARKER";

      text =
        "Getting a high rating from you actually means something. Your archive has a relatively demanding scoring system.";

    }

    else if(
      high > .25
    ){

      personality =
        "THE HYPE BELIEVER";

      text =
        "You have a substantial collection of 8+ ratings. When cinema hits, you really let it hit.";

    }

    else if(
      low > .25
    ){

      personality =
        "THE EXECUTIONER";

      text =
        "Your archive contains plenty of low scores. You are perfectly comfortable punishing movies that don't work.";

    }


    container.textContent =
      personality;


    description.textContent =
      text;

  }


  /* =======================================================
     IMDb VS YOU
     ======================================================= */

  function buildIMDbComparison(){

    const container =
      qs("#imdbComparison");

    if(!container) return;


    const valid =
      movieDatabase.filter(
        movie =>
          safeNumber(
            movie.yourRating
          ) &&
          safeNumber(
            movie.imdbRating
          )
      );


    if(!valid.length) return;


    const differences =
      valid.map(
        movie => ({

          movie,

          difference:
            safeNumber(
              movie.yourRating
            ) -
            safeNumber(
              movie.imdbRating
            )

        })
      );


    const averageDifference =
      differences.reduce(
        (sum,item) =>
          sum + item.difference,
        0
      ) /
      differences.length;


    const mostLoved =
      [...differences]
        .sort(
          (a,b) =>
            b.difference -
            a.difference
        )
        .slice(0,3);


    const mostHated =
      [...differences]
        .sort(
          (a,b) =>
            a.difference -
            b.difference
        )
        .slice(0,3);


    const formatTitles =
      list =>
        list
          .map(
            item =>
              `${escapeHTML(
                item.movie.title
              )} (${item.difference > 0 ? "+" : ""}${item.difference.toFixed(1)})`
          )
          .join("<br>");


    container.innerHTML = `

      <div class="comparison-card">

        <h4>
          YOUR AVERAGE DIFFERENCE
        </h4>

        <div class="comparison-value">
          ${averageDifference >= 0 ? "+" : ""}
          ${averageDifference.toFixed(2)}
        </div>

        <p>
          Compared with IMDb, your ratings are
          ${averageDifference >= 0 ? "higher" : "lower"}
          on average.
        </p>

      </div>


      <div class="comparison-card">

        <h4>
          YOU LOVED IT MORE
        </h4>

        <div class="comparison-value">
          ↑
        </div>

        <p>
          ${formatTitles(mostLoved)}
        </p>

      </div>


      <div class="comparison-card">

        <h4>
          YOU WERE HARSHER
        </h4>

        <div class="comparison-value">
          ↓
        </div>

        <p>
          ${formatTitles(mostHated)}
        </p>

      </div>

    `;

  }


  /* =======================================================
     RATING EVOLUTION
     ======================================================= */

  function buildRatingEvolution(){

    const container =
      qs("#ratingEvolution");

    if(!container) return;


    const years = {};


    movieDatabase.forEach(
      movie => {

        const year =
          safeNumber(
            movie.year
          );

        const rating =
          safeNumber(
            movie.yourRating
          );


        if(
          !year ||
          !rating
        )
          return;


        if(!yea
