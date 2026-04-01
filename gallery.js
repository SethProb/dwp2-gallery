(function () {

  // ── Config ──────────────────────────────────────────────
  const API_URL     = 'https://dwp2-gallery.vercel.app/api/sheet';
  const FONT_URL    = null; // fonts loaded globally via @font-face
  const PAGE_SIZE   = 9;
  const TARGET_SEL  = '#dwp2-gallery';
  // ────────────────────────────────────────────────────────

  const PALETTES = [
    ['#E8D5C4','#C4956A','#8B6355'],['#C8D8E8','#7FA8C8','#4A6E8A'],
    ['#D4E8D4','#7AB87A','#4A7A4A'],['#E8D4E8','#B87AB8','#7A4A7A'],
    ['#E8E4C8','#C8B870','#8A7A40'],['#D4D8E8','#8090C0','#485888'],
    ['#E8CCC8','#C08888','#885050'],['#C8E8E4','#70C0B8','#407870'],
    ['#E8DCE0','#C09098','#806068'],['#EDE8D4','#B8A870','#7A6A40'],
    ['#D4E4EC','#70A8C8','#405878'],['#ECE4D4','#C8A07A','#885840'],
  ];

  // fonts loaded globally via @font-face — no injection needed

  // ── Inject styles ───────────────────────────────────────
  const CSS = `
    .dwp2-wrap { font-family: 'Archivo', sans-serif; user-select: none; -webkit-user-select: none; padding: 1.5rem 0; }
    .dwp2-hdr { display: flex; align-items: center; justify-content: space-between; gap: 16px; border-bottom: 0.5px solid #e0e0e0; padding-bottom: 14px; margin-bottom: 1.5rem; flex-wrap: wrap; }
    .dwp2-hdr-left { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
    .dwp2-title { font-family: 'Meno Display', serif; font-size: 22px; font-weight: 800; letter-spacing: -0.02em; line-height: 1; color: #111; }
    .dwp2-count { font-size: 11px; color: #888; letter-spacing: 0.06em; text-transform: uppercase; margin-top: 4px; }
    .dwp2-search { display: flex; align-items: center; border: 0.5px solid #ccc; border-radius: 8px; background: #fff; height: 32px; width: 200px; flex-shrink: 0; overflow: hidden; transition: border-color 0.15s; }
    .dwp2-search:hover { border-color: #aaa; }
    .dwp2-search:focus-within { border-color: #cb2c30; box-shadow: 0 0 0 2px rgba(203,44,48,0.15); }
    .dwp2-search-icon { width: 30px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
    .dwp2-search-icon svg { width: 12px; height: 12px; stroke: #888; opacity: 0.5; display: block; }
    .dwp2-search input { flex: 1; min-width: 0; height: 100%; font-family: 'Archivo', sans-serif; font-size: 13px; color: #111; background: transparent; border: none; border-left: 0.5px solid #e5e5e5; outline: none; box-shadow: none; -webkit-appearance: none; appearance: none; padding: 0 8px; margin: 0; }
    .dwp2-search input::placeholder { color: #bbb; }
    .dwp2-clear { flex-shrink: 0; width: 0; overflow: hidden; display: flex; align-items: center; justify-content: center; background: transparent; border: none; outline: none; cursor: pointer; padding: 0; color: #888; font-size: 11px; line-height: 1; opacity: 0; transition: width 0.15s, opacity 0.15s; }
    .dwp2-clear.visible { width: 24px; opacity: 0.45; pointer-events: all; }
    .dwp2-clear.visible:hover { opacity: 1; }
    @media (max-width: 480px) { .dwp2-hdr { flex-wrap: wrap; } .dwp2-search { width: 100%; } }
    .dwp2-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1px; background: #e0e0e0; border: 0.5px solid #e0e0e0; border-radius: 8px; overflow: hidden; }
    @media (max-width: 600px) { .dwp2-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
    @media (max-width: 380px) { .dwp2-grid { grid-template-columns: repeat(1, minmax(0, 1fr)); } }
    .dwp2-card { background: #fff; cursor: pointer; overflow: hidden; }
    .dwp2-card-img { width: 100%; aspect-ratio: 4/3; overflow: hidden; position: relative; background: #f5f5f5; }
    .dwp2-card-img canvas { width: 100%; height: 100%; display: block; transition: transform 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94); }
    .dwp2-card:hover .dwp2-card-img canvas { transform: scale(1.06); }
    .dwp2-card-shield { position: absolute; inset: 0; z-index: 2; }
    .dwp2-featured-badge { position: absolute; top: 8px; left: 8px; z-index: 3; background: #cb2c30; border-radius: 4px; padding: 3px 7px; font-size: 10px; font-family: 'Archivo', sans-serif; font-weight: 500; letter-spacing: 0.06em; text-transform: uppercase; color: #ffffff; }
    .dwp2-card-caption { padding: 9px 11px 11px; border-top: 0.5px solid #ebebeb; background: #fff; transition: background 0.15s; }
    .dwp2-card:hover .dwp2-card-caption { background: #fafafa; }
    .dwp2-card-name { font-family: 'Didot', serif; font-style: italic; font-size: 13px; color: #111; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1.3; }
    .dwp2-card-view { font-size: 10px; color: #999; letter-spacing: 0.06em; text-transform: uppercase; margin-top: 4px; opacity: 0; transform: translateY(3px); transition: opacity 0.2s, transform 0.2s; }
    .dwp2-card:hover .dwp2-card-view { opacity: 1; transform: translateY(0); }
    .dwp2-load-wrap { text-align: center; margin-top: 1.25rem; }
    .dwp2-load-btn { font-size: 13px; padding: 9px 28px; cursor: pointer; font-family: 'Archivo', sans-serif; letter-spacing: 0.03em; background: #fff; border: 0.5px solid #cb2c30; border-radius: 8px; color: #111; transition: background 0.15s, color 0.15s, border-color 0.15s; }
    .dwp2-load-btn:hover { background: #cb2c30; color: #ffffff; border-color: #cb2c30; }
    .dwp2-load-wrap.hidden { display: none; }
    .dwp2-no-results { text-align: center; padding: 3rem 0; font-size: 13px; color: #888; display: none; }
    .dwp2-lb { display: none; position: fixed; inset: 0; background: rgba(8,8,8,0.9); z-index: 999999; align-items: center; justify-content: center; flex-direction: column; gap: 14px; padding: 20px; }
    .dwp2-lb.open { display: flex; }
    .dwp2-lb-inner { position: relative; }
    .dwp2-lb canvas { display: block; border-radius: 6px; max-width: min(88vw, 640px); max-height: min(65vh, 440px); }
    .dwp2-lb-shield { position: absolute; inset: 0; border-radius: 6px; }
    .dwp2-lb-close { position: fixed; top: 20px; right: 24px; width: 36px; height: 36px; border-radius: 50%; background: rgba(255,255,255,0.1); border: 0.5px solid rgba(255,255,255,0.2); color: rgba(255,255,255,0.7); font-size: 16px; cursor: pointer; display: flex; align-items: center; justify-content: center; z-index: 1000000; transition: background 0.15s, color 0.15s; }
    .dwp2-lb-close:hover { background: rgba(255,255,255,0.22); color: #fff; }
    .dwp2-lb-name { font-family: 'Didot', serif; font-style: italic; font-size: 18px; color: rgba(255,255,255,0.92); text-align: center; }
    .dwp2-lb-nav { display: flex; gap: 8px; }
    .dwp2-lb-nav button { background: rgba(255,255,255,0.08); border: 0.5px solid rgba(255,255,255,0.15); color: rgba(255,255,255,0.65); padding: 8px 22px; border-radius: 4px; cursor: pointer; font-size: 13px; font-family: 'Archivo', sans-serif; min-width: 80px; transition: background 0.15s, color 0.15s, border-color 0.15s; }
    .dwp2-lb-nav button:hover { background: #cb2c30; color: #ffffff; border-color: #cb2c30; }
  `;

  // Always remove and re-inject styles so updates take effect immediately
  const existing = document.querySelector('style[data-dwp2]');
  if (existing) existing.remove();
  const s = document.createElement('style');
  s.setAttribute('data-dwp2', '1');
  s.textContent = CSS;
  document.head.appendChild(s);

  // ── Helpers ─────────────────────────────────────────────
  function shuffle(a) {
    const r = [...a];
    for (let i = r.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [r[i], r[j]] = [r[j], r[i]];
    }
    return r;
  }

  function dName(f, l) {
    f = (f || '').trim(); l = (l || '').trim();
    if (!f && !l) return 'Anonymous';
    if (!l) return f;
    return f + ' ' + l[0].toUpperCase() + '.';
  }

  function parseCSV(text) {
    return text.trim().split('\n').map(line => {
      const cols = []; let cur = '', inQ = false;
      for (const c of line) {
        if (c === '"') inQ = !inQ;
        else if (c === ',' && !inQ) { cols.push(cur.trim()); cur = ''; }
        else cur += c;
      }
      cols.push(cur.trim()); return cols;
    });
  }

  function makeImageCanvas(w, h, url) {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const ctx = c.getContext('2d');
    const img = new Image(); img.crossOrigin = 'anonymous';
    img.onload = () => {
      const s = Math.max(w / img.naturalWidth, h / img.naturalHeight);
      const sw = img.naturalWidth * s, sh = img.naturalHeight * s;
      ctx.drawImage(img, (w - sw) / 2, (h - sh) / 2, sw, sh);
    };
    img.onerror = () => { ctx.fillStyle = '#eee'; ctx.fillRect(0, 0, w, h); };
    img.src = url;
    return c;
  }

  // ── Build gallery ────────────────────────────────────────
  function buildGallery(container) {
    document.addEventListener('contextmenu', e => e.preventDefault());
    document.addEventListener('dragstart', e => e.preventDefault());

    container.innerHTML = `
      <div class="dwp2-wrap">
        <div class="dwp2-hdr">
          <div class="dwp2-hdr-left">
            <div class="dwp2-title">Your Artwork</div>
            <div class="dwp2-count" id="dwp2-count"></div>
          </div>
          <div class="dwp2-search">
            <div class="dwp2-search-icon">
              <svg viewBox="0 0 16 16" fill="none" stroke-width="1.6">
                <circle cx="6.5" cy="6.5" r="4.5"/>
                <line x1="10.5" y1="10.5" x2="14" y2="14"/>
              </svg>
            </div>
            <input type="text" id="dwp2-search" placeholder="Search by name" autocomplete="off" spellcheck="false" />
            <button class="dwp2-clear" id="dwp2-clear">✕</button>
          </div>
        </div>
        <div class="dwp2-grid" id="dwp2-grid"></div>
        <div class="dwp2-no-results" id="dwp2-no-results">No entries match your search.</div>
        <div class="dwp2-load-wrap" id="dwp2-load-wrap">
          <button class="dwp2-load-btn" id="dwp2-load-more">Load more</button>
        </div>
      </div>
      <div class="dwp2-lb" id="dwp2-lb">
        <button class="dwp2-lb-close" id="dwp2-lb-close">✕</button>
        <div class="dwp2-lb-inner">
          <canvas id="dwp2-lb-canvas"></canvas>
          <div class="dwp2-lb-shield"></div>
        </div>
        <div class="dwp2-lb-name" id="dwp2-lb-name"></div>
        <div class="dwp2-lb-nav">
          <button id="dwp2-lb-prev">← Prev</button>
          <button id="dwp2-lb-next">Next →</button>
        </div>
      </div>
    `;

    const grid      = document.getElementById('dwp2-grid');
    const countEl   = document.getElementById('dwp2-count');
    const noResults = document.getElementById('dwp2-no-results');
    const lmWrap    = document.getElementById('dwp2-load-wrap');
    const lb        = document.getElementById('dwp2-lb');
    const lbCanvas  = document.getElementById('dwp2-lb-canvas');
    const lbName    = document.getElementById('dwp2-lb-name');
    const searchEl  = document.getElementById('dwp2-search');
    const clearBtn  = document.getElementById('dwp2-clear');

    let baseEntries = [], filtered = [], shown = 0, lbIdx = 0, searchQ = '';

    function updateCount() { countEl.textContent = shown + ' of ' + filtered.length; }

    function applyFilters() {
      filtered = searchQ
        ? baseEntries.filter(e => (e.first + ' ' + e.last).toLowerCase().includes(searchQ))
        : [...baseEntries];
      grid.innerHTML = ''; shown = 0;
      noResults.style.display = filtered.length === 0 ? 'block' : 'none';
      if (filtered.length) loadMore(); else updateCount();
    }

    function loadMore() {
      const next = Math.min(shown + PAGE_SIZE, filtered.length);
      for (let i = shown; i < next; i++) {
        const e = filtered[i];
        const card = document.createElement('div'); card.className = 'dwp2-card';
        const iw = document.createElement('div'); iw.className = 'dwp2-card-img';
        iw.appendChild(makeImageCanvas(400, 300, e.url));
        const sh = document.createElement('div'); sh.className = 'dwp2-card-shield'; iw.appendChild(sh);
        if (e.featured) {
          const badge = document.createElement('div');
          badge.className = 'dwp2-featured-badge';
          badge.textContent = '★ Featured';
          iw.appendChild(badge);
        }
        const cap = document.createElement('div'); cap.className = 'dwp2-card-caption';
        cap.innerHTML = `<div class="dwp2-card-name">${dName(e.first, e.last)}</div><div class="dwp2-card-view">View</div>`;
        card.appendChild(iw); card.appendChild(cap);
        card.addEventListener('click', () => openLb(i));
        grid.appendChild(card);
      }
      shown = next; updateCount();
      lmWrap.classList.toggle('hidden', shown >= filtered.length);
    }

    function openLb(i) {
      lbIdx = i; const e = filtered[i];
      const src = makeImageCanvas(820, 615, e.url);
      lbCanvas.width = 820; lbCanvas.height = 615;
      const img = new Image(); img.crossOrigin = 'anonymous';
      img.onload = () => {
        const ctx = lbCanvas.getContext('2d');
        const s = Math.max(820 / img.naturalWidth, 615 / img.naturalHeight);
        const sw = img.naturalWidth * s, sh = img.naturalHeight * s;
        ctx.clearRect(0, 0, 820, 615);
        ctx.drawImage(img, (820 - sw) / 2, (615 - sh) / 2, sw, sh);
      };
      img.src = e.url;
      lbName.textContent = dName(e.first, e.last);
      lb.classList.add('open');
    }

    document.getElementById('dwp2-lb-close').onclick = () => lb.classList.remove('open');
    lb.addEventListener('click', e => { if (e.target === lb) lb.classList.remove('open'); });
    document.getElementById('dwp2-lb-prev').onclick = () => { lbIdx = (lbIdx - 1 + shown) % shown; openLb(lbIdx); };
    document.getElementById('dwp2-lb-next').onclick = () => { lbIdx = (lbIdx + 1) % shown; openLb(lbIdx); };
    document.addEventListener('keydown', e => {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'ArrowLeft') document.getElementById('dwp2-lb-prev').click();
      if (e.key === 'ArrowRight') document.getElementById('dwp2-lb-next').click();
      if (e.key === 'Escape') lb.classList.remove('open');
    });

    document.getElementById('dwp2-load-more').onclick = loadMore;

    let st;
    searchEl.addEventListener('input', function () {
      clearTimeout(st);
      clearBtn.classList.toggle('visible', this.value.length > 0);
      st = setTimeout(() => { searchQ = this.value.trim().toLowerCase(); applyFilters(); }, 200);
    });
    clearBtn.onclick = () => {
      searchEl.value = ''; searchQ = '';
      clearBtn.classList.remove('visible');
      applyFilters(); searchEl.focus();
    };

    // ── Fetch data ─────────────────────────────────────────
    fetch(API_URL)
      .then(r => r.text())
      .then(text => {
        const rows = parseCSV(text).slice(1);
        const approved  = rows.filter(r => r[0] && (r[3] || '').trim().toLowerCase() === 'approved');
        const featured  = approved.filter(r => (r[6] || '').trim().toLowerCase() === 'yes');
        const rest      = shuffle(approved.filter(r => (r[6] || '').trim().toLowerCase() !== 'yes'));
        baseEntries = [...featured, ...rest].map((r, i) => ({
          url:      r[0].replace(/^"|"$/g, '').trim(),
          first:    r[1] || '',
          last:     r[2] || '',
          featured: (r[6] || '').trim().toLowerCase() === 'yes',
          palette:  PALETTES[i % PALETTES.length],
          idx:      i,
        }));
        applyFilters();
      })
      .catch(() => {
        noResults.style.display = 'block';
        noResults.textContent = 'Gallery unavailable. Please try again later.';
      });
  }

  // ── Init ─────────────────────────────────────────────────
  function init() {
    const container = document.querySelector(TARGET_SEL);
    if (container) { buildGallery(container); return; }
    // If target div not in DOM yet, wait for it
    const obs = new MutationObserver(() => {
      const el = document.querySelector(TARGET_SEL);
      if (el) { obs.disconnect(); buildGallery(el); }
    });
    obs.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
