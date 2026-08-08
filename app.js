/* Shared rendering logic for movies.html and series.html */

const PAGE_SIZE = 60;

function fmtDate(d){
  if(!d) return "—";
  const [y,m,day] = d.split('-');
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${day} ${months[parseInt(m,10)-1]} ${y}`;
}

function cardHTML(item){
  const genre = (item.genres || "").split(',')[0]?.trim() || "—";
  return `
  <a class="card" href="${item.url}" target="_blank" rel="noopener">
    <div class="c-top">
      <div>
        <div class="c-year">${item.year || "—"}</div>
      </div>
      <div class="c-rating">${item.yourRating}<span class="of10">/10</span></div>
    </div>
    <div class="c-title">${item.title}</div>
    <div class="c-genre">${genre}</div>
    <div class="c-foot">
      <span>Rated ${fmtDate(item.dateRated)}</span>
      <span class="c-imdb">IMDb ${item.imdbRating ?? "—"}</span>
    </div>
  </a>`;
}

/**
 * Sets up a filterable, sortable, paginated card list.
 * @param {Array} items - full array of items for the current subcategory
 * @param {HTMLElement} grid - container to render cards into
 * @param {HTMLElement} searchInput
 * @param {HTMLElement} sortSelect
 * @param {HTMLElement} loadMoreBtn
 * @param {HTMLElement} countEl
 */
function initList(items, grid, searchInput, sortSelect, loadMoreBtn, countEl){
  let filtered = items.slice();
  let shown = 0;

  function sortItems(){
    const mode = sortSelect.value;
    filtered.sort((a,b)=>{
      if(mode === 'rating-desc') return b.yourRating - a.yourRating;
      if(mode === 'rating-asc') return a.yourRating - b.yourRating;
      if(mode === 'year-desc') return (b.year||0) - (a.year||0);
      if(mode === 'year-asc') return (a.year||0) - (b.year||0);
      if(mode === 'date-desc') return (b.dateRated||'').localeCompare(a.dateRated||'');
      if(mode === 'date-asc') return (a.dateRated||'').localeCompare(b.dateRated||'');
      if(mode === 'title-asc') return a.title.localeCompare(b.title);
      return 0;
    });
  }

  function applyFilter(){
    const q = searchInput.value.trim().toLowerCase();
    filtered = items.filter(it => !q || it.title.toLowerCase().includes(q));
    sortItems();
    shown = 0;
    grid.innerHTML = '';
    renderNext();
  }

  function renderNext(){
    const next = filtered.slice(shown, shown + PAGE_SIZE);
    grid.insertAdjacentHTML('beforeend', next.map(cardHTML).join(''));
    shown += next.length;
    countEl.textContent = `${filtered.length} title${filtered.length===1?'':'s'}`;
    loadMoreBtn.style.display = shown < filtered.length ? 'block' : 'none';
    if(filtered.length === 0){
      grid.innerHTML = '<div class="empty-state">No titles match.</div>';
    }
  }

  searchInput.addEventListener('input', applyFilter);
  sortSelect.addEventListener('change', applyFilter);
  loadMoreBtn.addEventListener('click', renderNext);

  sortItems();
  renderNext();
}
