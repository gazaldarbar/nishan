/* =========================================================
   THE WATCHLIST — COMPLETE APP.JS
   ========================================================= */

/* =========================================================
   GLOBAL SETTINGS
   ========================================================= */

const PAGE_SIZE = 60;
/* =========================================================
   CINEMATIC INTRO — SCROLL LOCK
   ========================================================= */

(function initCinemaIntro(){

  const intro = document.getElementById("cinemaIntro");

  if(!intro) return;

  // Prevent the homepage from scrolling underneath the intro
  document.documentElement.classList.add("intro-active");
  document.body.classList.add("intro-active");

  // Always start at the top
  window.scrollTo(0, 0);

  // Keep intro visible for the opening animation
  setTimeout(() => {

    intro.classList.add("hide");

    // Wait until the fade-out has finished
    setTimeout(() => {

      document.documentElement.classList.remove("intro-active");
      document.body.classList.remove("intro-active");

      // Make absolutely sure the homepage starts at the top
      window.scrollTo(0, 0);

    }, 1000);

  }, 2500);

})();


/* =========================================================
   COMMON HELPERS
   ========================================================= */

function fmtDate(d){

  if(!d) return "—";

  const parts = String(d).split("-");

  if(parts.length < 3) return d;

  const [y,m,day] = parts;

  const months = [
    "Jan","Feb","Mar","Apr",
    "May","Jun","Jul","Aug",
    "Sep","Oct","Nov","Dec"
  ];

  const month =
    months[parseInt(m,10)-1] || "";

  return `${day} ${month} ${y}`;

}


function safeNumber(value){

  const n = Number(value);

  return Number.isFinite(n) ? n : 0;

}


function escapeHTML(value){

  return String(value ?? "")
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#039;");

}


function qs(selector){

  return document.querySelector(selector);

}


/* =========================================================
   MOVIE / SERIES CARD
   ========================================================= */

function cardHTML(item){

  const genre =
    String(item.genres || "")
      .split(",")[0]
      ?.trim() || "—";

  const title =
    escapeHTML(item.title || "Untitled");

  const url =
    escapeHTML(item.url || "#");

  const year =
    escapeHTML(item.year || "—");

  const rating =
    safeNumber(item.yourRating);

  const imdb =
    item.imdbRating !== undefined &&
    item.imdbRating !== null &&
    item.imdbRating !== ""
      ? escapeHTML(item.imdbRating)
      : "—";

  return `

    <a
      class="card"
      href="${url}"
      target="_blank"
      rel="noopener noreferrer"
    >

      <div class="c-top">

        <div>

          <div class="c-year">
            ${year}
          </div>

        </div>

        <div class="c-rating">

          ${rating || "—"}

          <span class="of10">
            /10
          </span>

        </div>

      </div>

      <div class="c-title">
        ${title}
      </div>

      <div class="c-genre">
        ${escapeHTML(genre)}
      </div>

      <div class="c-foot">

        <span>
          Rated ${fmtDate(item.dateRated)}
        </span>

        <span class="c-imdb">
          IMDb ${imdb}
        </span>

      </div>

    </a>

  `;

}


/* =========================================================
   LIST ENGINE
   MOVIES.HTML + SERIES.HTML
   ========================================================= */

function initList(
  items,
  grid,
  searchInput,
  sortSelect,
  loadMoreBtn,
  countEl
){

  /*
   * Prevent old listeners from stacking if the user
   * changes language/category multiple times.
   */

  const newSearch =
    searchInput.cloneNode(true);

  const newSort =
    sortSelect.cloneNode(true);

  const newLoad =
    loadMoreBtn.cloneNode(true);

  searchInput.replaceWith(newSearch);
  sortSelect.replaceWith(newSort);
  loadMoreBtn.replaceWith(newLoad);

  searchInput = newSearch;
  sortSelect = newSort;
  loadMoreBtn = newLoad;

  let filtered = Array.isArray(items)
    ? items.slice()
    : [];

  let shown = 0;


  function sortItems(){

    const mode =
      sortSelect.value;


    filtered.sort((a,b)=>{

      if(mode === "rating-desc"){
        return (
          safeNumber(b.yourRating) -
          safeNumber(a.yourRating)
        );
      }


      if(mode === "rating-asc"){
        return (
          safeNumber(a.yourRating) -
          safeNumber(b.yourRating)
        );
      }


      if(mode === "year-desc"){
        return (
          safeNumber(b.year) -
          safeNumber(a.year)
        );
      }


      if(mode === "year-asc"){
        return (
          safeNumber(a.year) -
          safeNumber(b.year)
        );
      }


      if(mode === "date-desc"){
        return String(b.dateRated || "")
          .localeCompare(
            String(a.dateRated || "")
          );
      }


      if(mode === "date-asc"){
        return String(a.dateRated || "")
          .localeCompare(
            String(b.dateRated || "")
          );
      }


      if(mode === "title-asc"){
        return String(a.title || "")
          .localeCompare(
            String(b.title || ""),
            undefined,
            {
              sensitivity:"base"
            }
          );
      }


      return 0;

    });

  }


  function applyFilter(){

    const q =
      searchInput.value
        .trim()
        .toLowerCase();


    filtered =
      items.filter(item => {

        if(!q) return true;


        const searchable = [

          item.title,

          item.genres,

          item.director,

          item.year,

          item.imdbRating,

          item.yourRating,

          item.dateRated

        ]
        .map(value =>
          String(value ?? "")
            .toLowerCase()
        );


        return searchable.some(
          value => value.includes(q)
        );

      });


    sortItems();

    shown = 0;

    grid.innerHTML = "";

    renderNext();

  }


  function renderNext(){

    const next =
      filtered.slice(
        shown,
        shown + PAGE_SIZE
      );


    if(next.length){

      grid.insertAdjacentHTML(
        "beforeend",
        next
          .map(cardHTML)
          .join("")
      );

    }


    shown += next.length;


    countEl.textContent =
      `${filtered.length} title${
        filtered.length === 1
          ? ""
          : "s"
      }`;


    loadMoreBtn.style.display =
      shown < filtered.length
        ? "block"
        : "none";


    if(filtered.length === 0){

      grid.innerHTML =
        `<div class="empty-state">
          No titles match.
        </div>`;

    }

  }


  searchInput.addEventListener(
    "input",
    applyFilter
  );


  sortSelect.addEventListener(
    "change",
    applyFilter
  );


  loadMoreBtn.addEventListener(
    "click",
    renderNext
  );


  sortItems();

  renderNext();

}


/* =========================================================
   CINEMA ENGINE
   ONLY RUNS ON INDEX.HTML
   ========================================================= */

(function CinemaEngine(){

  const ratingDistribution =
    document.getElementById(
      "ratingDistribution"
    );


  /*
   * If this element does not exist,
   * we're on movies.html / series.html.
   */

  if(!ratingDistribution){

    return;

  }


  let movieDatabase = [];

  let seriesDatabase = [];


  /* =======================================================
     FETCH JSON
     ======================================================= */

  async function fetchJSON(url){

    const response =
      await fetch(url, {
        cache:"no-store"
      });


    if(!response.ok){

      throw new Error(
        `${url} returned ${response.status}`
      );

    }


    return response.json();

  }


  /* =======================================================
     FLATTEN MOVIE DATA
     ======================================================= */

  function flattenMovieData(data){

    const result = [];


    if(!data || typeof data !== "object"){

      return result;

    }


    Object.entries(data).forEach(
      ([language,titles]) => {

        if(!Array.isArray(titles)){

          return;

        }


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
     FLATTEN SERIES DATA
     ======================================================= */

  function flattenSeriesData(data){

    if(Array.isArray(data)){

      return data.slice();

    }


    if(data && typeof data === "object"){

      return flattenMovieData(data);

    }


    return [];

  }


  /* =======================================================
     LOAD DATA
     ======================================================= */

  async function loadData(){

    try{

      const movieJSON =
        await fetchJSON("movies.json");


      movieDatabase =
        flattenMovieData(movieJSON);


      console.log(
        `Loaded ${movieDatabase.length} movies`
      );

    }
    catch(error){

      console.error(
        "Could not load movies.json:",
        error
      );

      movieDatabase = [];

    }


    try{

      const seriesJSON =
        await fetchJSON("series.json");


      seriesDatabase =
        flattenSeriesData(seriesJSON);


      console.log(
        `Loaded ${seriesDatabase.length} series`
      );

    }
    catch(error){

      console.warn(
        "Could not load series.json:",
        error
      );

      seriesDatabase = [];

    }


    initializeDashboard();

  }


  /* =======================================================
     BASIC STATS
     ======================================================= */

  function buildBasicStats(){

    const movieCount =
      movieDatabase.length;


    const seriesCount =
      seriesDatabase.length;


    const total =
      movieCount +
      seriesCount;


    const ratings =
      movieDatabase
        .map(item =>
          safeNumber(item.yourRating)
        )
        .filter(r => r > 0);


    const average =
      ratings.length
        ? ratings.reduce(
            (a,b) => a+b,
            0
          ) / ratings.length
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
     ANIMATED NUMBERS
     ======================================================= */

  function animateNumber(
    element,
    target
  ){

    if(!element) return;


    target =
      safeNumber(target);


    const duration =
      1300;


    const start =
      performance.now();


    function update(now){

      const progress =
        Math.min(
          (now-start) /
          duration,
          1
        );


      const eased =
        1 -
        Math.pow(
          1-progress,
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


    const counts = {};


    for(let rating=1;rating<=10;rating++){

      counts[rating] = 0;

    }


    movieDatabase.forEach(movie => {

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

    });


    const max =
      Math.max(
        ...Object.values(counts),
        1
      );


    container.innerHTML = "";


    for(
      let rating=10;
      rating>=1;
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
     GENERIC BAR LIST
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
        `<div class="empty-state">
          No data.
        </div>`;

      return;

    }


    const max =
      sorted[0][1] || 1;


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


    movieDatabase.forEach(movie => {

      const language =
        movie.language ||
        "Unknown";


      languages[language] =
        (languages[language] || 0) + 1;

    });


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


    movieDatabase.forEach(movie => {

      String(movie.genres || "")
        .split(",")
        .map(g => g.trim())
        .filter(Boolean)
        .forEach(genre => {

          genres[genre] =
            (genres[genre] || 0) + 1;

        });

    });


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


    movieDatabase.forEach(movie => {

      const names =
        String(movie.director || "")
          .split(",")
          .map(name => name.trim())
          .filter(Boolean);


      names.forEach(director => {

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

      });

    });


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
          data.count
            ? data.total /
              data.count
            : 0;


        container.insertAdjacentHTML(
          "beforeend",
          `

          <div class="director-card">

            <div class="director-name">
              ${escapeHTML(name)}
            </div>

            <div class="director-meta">
              ${data.count}
              title${data.count === 1 ? "" : "s"}
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
      movieDatabase
        .map(movie =>
          safeNumber(
            movie.yourRating
          )
        )
        .filter(
          rating => rating > 0
        );


    if(!ratings.length){

      container.textContent =
        "NO DATA";

      return;

    }


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
    else if(average <= 6){

      personality =
        "THE HARD MARKER";


      text =
        "Getting a high rating from you actually means something. Your archive has a relatively demanding scoring system.";

    }
    else if(high > .25){

      personality =
        "THE HYPE BELIEVER";


      text =
        "You have a substantial collection of 8+ ratings. When cinema hits, you really let it hit.";

    }
    else if(low > .25){

      personality =
        "THE EXECUTIONER";


      text =
        "Your archive contains plenty of low scores. You are perfectly comfortable punishing movies that don't work.";

    }


    container.textContent =
      personality;


    if(description){

      description.textContent =
        text;

    }

  }


  /* =======================================================
     IMDb VS YOU
     ======================================================= */

  function buildIMDbComparison(){

    const container =
      qs("#imdbComparison");


    if(!container) return;


    const valid =
      movieDatabase.filter(movie => {

        return (
          safeNumber(movie.yourRating) > 0 &&
          safeNumber(movie.imdbRating) > 0
        );

      });


    if(!valid.length){

      container.innerHTML =
        `<div class="empty-state">
          No IMDb comparison data.
        </div>`;

      return;

    }


    const differences =
      valid.map(movie => ({

        movie,

        difference:
          safeNumber(
            movie.yourRating
          ) -
          safeNumber(
            movie.imdbRating
          )

      }));


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


    function formatTitles(list){

      return list
        .map(item => {

          const difference =
            item.difference;


          return `
            ${escapeHTML(item.movie.title)}
            (${difference > 0 ? "+" : ""}${difference.toFixed(1)})
          `;

        })
        .join("<br>");

    }


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


    movieDatabase.forEach(movie => {

      const year =
        parseInt(
          movie.year,
          10
        );


      const rating =
        safeNumber(
          movie.yourRating
        );


      if(!year || !rating)
        return;


      if(!years[year]){

        years[year] = {

          total:0,
          count:0

        };

      }


      years[year].total += rating;

      years[year].count++;

    });


    const sortedYears =
      Object.keys(years)
        .map(Number)
        .sort((a,b)=>a-b);


    if(!sortedYears.length){

      container.innerHTML =
        `<div class="empty-state">
          No evolution data.
        </div>`;

      return;

    }


    const maxRating = 10;


    container.innerHTML = "";


    sortedYears.forEach(year => {

      const average =
        years[year].total /
        years[year].count;


      const height =
        Math.max(
          2,
          average /
          maxRating *
          180
        );


      container.insertAdjacentHTML(
        "beforeend",
        `

        <div class="evolution-column">

          <div class="evolution-rating">
            ${average.toFixed(1)}
          </div>

          <div
            class="evolution-bar"
            style="height:${height}px">
          </div>

          <div class="evolution-year">
            ${year}
          </div>

        </div>

        `

      );

    });

  }


  /* =======================================================
     RECORDS
     ======================================================= */

  function buildRecords(){

    const container =
      qs("#recordsList") ||
      qs("#recordList") ||
      qs("#records");


    if(!container) return;


    if(!movieDatabase.length){

      container.innerHTML =
        `<div class="empty-state">
          No records available.
        </div>`;

      return;

    }


    const ratings =
      movieDatabase.filter(
        movie =>
          safeNumber(
            movie.yourRating
          ) > 0
      );


    const highest =
      [...ratings]
        .sort(
          (a,b) =>
            safeNumber(b.yourRating) -
            safeNumber(a.yourRating)
        )[0];


    const lowest =
      [...ratings]
        .sort(
          (a,b) =>
            safeNumber(a.yourRating) -
            safeNumber(b.yourRating)
        )[0];


    const oldest =
      [...movieDatabase]
        .filter(
          movie =>
            safeNumber(movie.year)
        )
        .sort(
          (a,b) =>
            safeNumber(a.year) -
            safeNumber(b.year)
        )[0];


    const newest =
      [...movieDatabase]
        .filter(
          movie =>
            safeNumber(movie.year)
        )
        .sort(
          (a,b) =>
            safeNumber(b.year) -
            safeNumber(a.year)
        )[0];


    const records = [

      {
        number:
          highest
            ? `${highest.yourRating}/10`
            : "—",

        label:
          highest
            ? `Highest Rated · ${highest.title}`
            : "Highest Rated"
      },

      {
        number:
          lowest
            ? `${lowest.yourRating}/10`
            : "—",

        label:
          lowest
            ? `Lowest Rated · ${lowest.title}`
            : "Lowest Rated"
      },

      {
        number:
          oldest
            ? oldest.year
            : "—",

        label:
          oldest
            ? `Oldest Film · ${oldest.title}`
            : "Oldest Film"
      },

      {
        number:
          newest
            ? newest.year
            : "—",

        label:
          newest
            ? `Newest Film · ${newest.title}`
            : "Newest Film"
      }

    ];


    container.innerHTML =
      records
        .map(record => `

          <div class="record-card">

            <span class="record-number">
              ${escapeHTML(record.number)}
            </span>

            <span class="record-label">
              ${escapeHTML(record.label)}
            </span>

          </div>

        `)
        .join("");

  }


  /* =======================================================
     TITLE WALL
     ======================================================= */

  function buildTitleWall(){

    const containers = [

      qs("#titleWall"),

      qs("#topTitles"),

      qs("#highestRatedTitles")

    ];


    const container =
      containers.find(Boolean);


    if(!container) return;


    const titles =
      [...movieDatabase]
        .filter(
          movie =>
            safeNumber(
              movie.yourRating
            ) > 0
        )
        .sort(
          (a,b) =>
            safeNumber(b.yourRating) -
            safeNumber(a.yourRating)
        )
        .slice(0,10);


    container.innerHTML =
      titles
        .map(movie => `

          <a
            class="title-card"
            href="${escapeHTML(movie.url || "#")}"
            target="_blank"
            rel="noopener noreferrer"
          >

            <div class="title-card-main">

              <div class="title-card-name">
                ${escapeHTML(movie.title)}
              </div>

              <div class="title-card-meta">

                ${movie.year || "—"}
                ·
                ${escapeHTML(
                  String(movie.genres || "")
                    .split(",")[0] || "—"
                )}

              </div>

            </div>

            <div class="title-card-rating">
              ${safeNumber(movie.yourRating)}/10
            </div>

          </a>

        `)
        .join("");

  }


  /* =======================================================
     HALL OF SHAME
     ======================================================= */

  function buildHallOfShame(){

    const container =
      qs("#hallOfShame") ||
      qs("#shameList");


    if(!container) return;


    const titles =
      [...movieDatabase]
        .filter(
          movie =>
            safeNumber(
              movie.yourRating
            ) > 0
        )
        .sort(
          (a,b) =>
            safeNumber(a.yourRating) -
            safeNumber(b.yourRating)
        )
        .slice(0,10);


    container.innerHTML =
      titles
        .map(movie => `

          <a
            class="title-card"
            href="${escapeHTML(movie.url || "#")}"
            target="_blank"
            rel="noopener noreferrer"
          >

            <div class="title-card-main">

              <div class="title-card-name">
                ${escapeHTML(movie.title)}
              </div>

              <div class="title-card-meta">
                ${movie.year || "—"}
              </div>

            </div>

            <div class="title-card-rating">
              ${safeNumber(movie.yourRating)}/10
            </div>

          </a>

        `)
        .join("");

  }
 /* =======================================================
     YEAR TIMELINE
     ======================================================= */

  function buildYearTimeline(){

    const container =
      qs("#yearTimeline");


    if(!container) return;


    const years = {};


    movieDatabase.forEach(movie => {

      const year =
        parseInt(
          movie.year,
          10
        );


      if(!year) return;


      years[year] =
        (years[year] || 0) + 1;

    });


    const sorted =
      Object.keys(years)
        .map(Number)
        .sort((a,b)=>a-b);


    if(!sorted.length){

      container.innerHTML =
        `<div class="empty-state">
          No year data.
        </div>`;

      return;

    }


    const max =
      Math.max(
        ...sorted.map(
          year => years[year]
        ),
        1
      );


    container.innerHTML = "";


    sorted.forEach(year => {

      const count =
        years[year];


      const height =
        Math.max(
          2,
          count /
          max *
          170
        );


      container.insertAdjacentHTML(
        "beforeend",
        `

        <div class="year-item">

          <div class="year-count">
            ${count}
          </div>

          <div
            class="year-bar"
            style="height:${height}px">
          </div>

          <div class="year-label">
            ${year}
          </div>

        </div>

        `

      );

    });

  }


  /* =======================================================
     RANDOM MOVIE
     ======================================================= */

  function initRandomMovie(){

    const button =
      qs("#randomButton");


    const result =
      qs("#randomResult");


    if(!button || !result)
      return;


    button.addEventListener(
      "click",
      () => {

        if(!movieDatabase.length){

          result.textContent =
            "NO MOVIES AVAILABLE";

          return;

        }


        const random =
          movieDatabase[
            Math.floor(
              Math.random() *
              movieDatabase.length
            )
          ];


        result.innerHTML = `

          <a
            href="${escapeHTML(random.url || "#")}"
            target="_blank"
            rel="noopener noreferrer"
          >

            ${escapeHTML(random.title)}

            <span style="
              font-family:'Archivo',sans-serif;
              font-size:.6em;
              color:#777;
              margin-left:.5rem;
            ">

              ${random.year || ""}
              ·
              ${safeNumber(random.yourRating)}/10

            </span>

          </a>

        `;

      }
    );

  }


  /* =======================================================
     ARCHIVE SEARCH
     ======================================================= */

  function initArchiveSearch(){

    const input =
      qs("#archiveSearch") ||
      qs("#homeSearch") ||
      qs("#searchArchive");


    const results =
      qs("#searchResults");


    const count =
      qs("#searchResultCount");


    if(!input || !results)
      return;


    function search(){

      const query =
        input.value
          .trim()
          .toLowerCase();


      if(!query){

        results.innerHTML = "";


        if(count){

          count.textContent = "";

        }

        return;

      }


      const allTitles = [

        ...movieDatabase.map(
          movie => ({
            ...movie,
            type:"Movie"
          })
        ),

        ...seriesDatabase.map(
          series => ({
            ...series,
            type:"Series"
          })
        )

      ];


      const matches =
        allTitles
          .filter(item => {

            return [

              item.title,
              item.genres,
              item.director,
              item.year,
              item.language

            ]
            .some(value =>
              String(value ?? "")
                .toLowerCase()
                .includes(query)
            );

          })
          .slice(0,20);


      if(count){

        count.textContent =
          `${matches.length} result${
            matches.length === 1
              ? ""
              : "s"
          }`;

      }


      if(!matches.length){

        results.innerHTML =
          `<div class="empty-state">
            No titles found.
          </div>`;

        return;

      }


      results.innerHTML =
        matches
          .map(item => `

            <a
              class="search-result"
              href="${escapeHTML(item.url || "#")}"
              target="_blank"
              rel="noopener noreferrer"
            >

              <div>

                <div class="search-result-title">
                  ${escapeHTML(item.title)}
                </div>

                <div class="search-result-meta">

                  ${item.type}
                  ·
                  ${item.year || "—"}
                  ${item.language
                    ? ` · ${escapeHTML(item.language)}`
                    : ""}

                </div>

              </div>

              <div class="search-result-rating">
                ${safeNumber(item.yourRating)}/10
              </div>

            </a>

          `)
          .join("");

    }


    input.addEventListener(
      "input",
      search
    );

  }


 /* =======================================================
     CINEMATIC INTRO
     ======================================================= */

  function initCinemaIntro(){

    const intro =
      qs("#cinemaIntro");


    if(!intro)
      return;


    /*
     * Prevent the intro from appearing again
     * during the same browser session.
     */

    const alreadySeen =
      sessionStorage.getItem(
        "watchlistCinemaIntro"
      );


    if(alreadySeen){

      intro.classList.add("hide");

      return;

    }


    setTimeout(() => {

      intro.classList.add("hide");

      sessionStorage.setItem(
        "watchlistCinemaIntro",
        "1"
      );

    },2600);

  }

  /* =======================================================
     INITIALIZE DASHBOARD
     ======================================================= */

  function initializeDashboard(){

    buildBasicStats();

    buildRatingDistribution();

    buildLanguageDNA();

    buildGenreDNA();

    buildDirectors();

    buildRatingPersonality();

    buildIMDbComparison();

    buildRatingEvolution();

    buildRecords();

    buildTitleWall();

    buildHallOfShame();

    buildYearTimeline();

    initRandomMovie();

    initArchiveSearch();

    initCinemaIntro();

  }


  /* =======================================================
     START
     ======================================================= */

  loadData();

})();


/* =========================================================
   SAFETY:
   HANDLE MOVIES / SERIES HASH NAVIGATION
   ========================================================= */

window.addEventListener(
  "error",
  event => {

    console.error(
      "Watchlist error:",
      event.error || event.message
    );

  }
);
