
// Database loader
let dbLoaded = false;

async function loadDatabase() {
  try {
    const resp = await fetch('k53-database.json');
    const db = await resp.json();

    // Populate global arrays from DB
    window.K.SIGNS = db.signs.map(s => ({
      id: s.id, svg: s.svg, name: s.name, fam: s.family,
      mean: s.meaning, cat: s.category, analogy: s.analogy
    }));
    window.K.RULES = db.rules.map(r => ({
      q: r.q, a: r.a, w: r.w
    })).slice(0, 50);
    window.K.CONTROLS = db.controls.map(c => ({
      q: c.q, opts: c.opts, ans: c.ans, ex: c.ex
    })).slice(0, 11);
    window.K.MOCK_EXTRA = db.mock_extra.map(m => ({
      q: m.q, opts: m.opts, ans: m.ans, ex: m.ex
    })).slice(0, 28);
    window.K.MARKINGS = db.markings;
    window.K.ROW = db.row;
    window.K.SECTION_META = db.section_meta;

    dbLoaded = true;
    console.log('✅ K53 Database loaded');
  } catch (e) {
    console.warn('⚠️ Failed to load K53 database, using embedded fallback');
    // Fallback to embedded data
    initEmbeddedFallback();
  }
}

// Run on app init
setTimeout(loadDatabase, 100);
