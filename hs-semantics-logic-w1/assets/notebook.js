/* Humanities through Semantics and Logic (Honors) · notebook engine
   Each page sets window.LESSON = { key, course, title, kicker, Q:{...} } before loading this file.
   Sheets are <section class="sheet" data-label="..."> in order. Questions are <div data-q="id"></div>.

   Question types (LESSON.Q[id]):
     mc     { type:'mc', n, prompt, row, opts:[[text, 1|0, feedback], ...] }
     sort   { type:'sort', prompt, cats:[...], items:[[text, catIndex, feedbackRight, hintWrong], ...] }
     mark   { type:'mark', prompt, segs:[ 'plain text', [text, 'premise'|'conclusion'|'neither', hintWrong], ... ], fb }
     text   { type:'text', n, prompt, min }                       written response, saved, never scored
     reflect{ type:'reflect', n, prompt, opts:[[text, response], ...] }   check-in: no right answer; any choice completes it
     worked { type:'worked', setup, steps:[{ prompt, opts:[[text,1|0,fb],...] }], solution }   steps unlock in order */
(function(){
var L = window.LESSON, Q = L.Q || {};
function $(s, r){ return (r || document).querySelector(s); }
function $$(s, r){ return [].slice.call((r || document).querySelectorAll(s)); }

/* storage */
var KEY = 'sl-honors-' + L.key;
var ST = (function(){ try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch(e){ return {}; } })();
ST.ans = ST.ans || {}; ST.misc = ST.misc || {};
function save(){ try { localStorage.setItem(KEY, JSON.stringify(ST)); } catch(e){} }
function record(id, ok, val){
  var a = ST.ans[id] || (ST.ans[id] = { first: ok, tries: 0 });
  a.tries++; a.ok = ok; if (val !== undefined) a.v = val;
  save(); refresh();
}
function esc(t){ return String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

/* rendering */
function say(fb, cls, msg){ fb.className = 'fb ' + cls; fb.innerHTML = msg; }
/* stable per-question shuffle, so the right answer's position varies but never moves between visits */
function shuffled(id, opts){
  var h = 2166136261, i, j, t, out = opts.map(function(o, k){ return [o, k]; });
  for (i = 0; i < id.length; i++) h = Math.imul(h ^ id.charCodeAt(i), 16777619);
  for (i = out.length - 1; i > 0; i--) { h = Math.imul(h ^ (h >>> 13), 1597334677) >>> 0; j = h % (i + 1); t = out[i]; out[i] = out[j]; out[j] = t; }
  return out;
}
function mcBlock(host, id, prompt, opts, row, n, onRight, mix){
  var a = ST.ans[id];
  host.insertAdjacentHTML('beforeend', (prompt ? '<p class="q-p">' + (n ? '<span class="qn">' + n + '</span>' : '') + prompt + '</p>' : '') +
    '<div class="opts' + (row ? ' row' : '') + '"></div><div class="fb"></div>');
  var box = host.lastElementChild.previousElementSibling, fb = host.lastElementChild;
  host.setAttribute('data-qid', id);
  (mix ? shuffled(String(L.key) + '/' + id, opts) : opts.map(function(o, k){ return [o, k]; })).forEach(function(ok){
    var o = ok[0], b = document.createElement('button'); b.type = 'button'; b.className = 'opt'; b.innerHTML = o[0]; b.dataset.i = ok[1];
    b.addEventListener('click', function(){
      if (ST.ans[id] && ST.ans[id].ok) return;
      $$('.opt', box).forEach(function(x){ x.classList.remove('no'); });
      b.classList.add(o[1] ? 'ok' : 'no');
      say(fb, o[1] ? 'ok' : 'no', o[2] || (o[1] ? 'Correct.' : 'Not quite. Try again.'));
      record(id, !!o[1], b.textContent);
      if (o[1]) { $$('.opt', box).forEach(function(x){ x.disabled = true; }); if (onRight) onRight(); }
    });
    box.appendChild(b);
    if (a && a.ok && a.v === b.textContent) { b.classList.add('ok'); say(fb, 'ok', o[2] || 'Correct.'); }
  });
  if (a && a.ok) $$('.opt', box).forEach(function(x){ x.disabled = true; });
}
var ROLE = { premise:'Premise', conclusion:'Conclusion', neither:'Neither' };
function render(holder){
  var id = holder.dataset.q, q = Q[id];
  if (!q) { holder.innerHTML = '<p class="fb no" style="display:block">Missing question: ' + esc(id) + '</p>'; return; }
  holder.classList.add('q');
  if (q.type === 'mc') return mcBlock(holder, id, q.prompt, q.opts, q.row, q.n, null, !q.keep);
  if (q.type === 'reflect') { holder.classList.add('reflect'); return mcBlock(holder, id, q.prompt, q.opts.map(function(o){ return [o[0], 1, o[1]]; }), q.row, q.n); }
  if (q.type === 'sort') {
    holder.innerHTML = q.prompt ? '<p class="q-p">' + (q.n ? '<span class="qn">' + q.n + '</span>' : '') + q.prompt + '</p>' : '';
    q.items.forEach(function(it, i){
      var row = document.createElement('div'); row.className = 'srow';
      row.innerHTML = '<div class="lbl">' + it[0] + '</div>'; holder.appendChild(row);
      var cell = document.createElement('div'); row.appendChild(cell);
      mcBlock(cell, id + '.' + i, '', q.cats.map(function(c, k){ return [c, k === it[1] ? 1 : 0, k === it[1] ? it[2] : (it[3] || 'Not this one. Look again at what the statement is doing.')]; }), true);
      row.appendChild(cell.lastElementChild);
      cell.removeAttribute('data-qid'); row.setAttribute('data-qid', id + '.' + i);
    });
    return;
  }
  if (q.type === 'mark') {
    var segN = 0, html = '';
    q.segs.forEach(function(s){ if (typeof s === 'string') html += esc(s); else html += '<span class="seg" data-s="' + segN + '"><sup>' + (++segN) + '</sup>' + esc(s[0]) + '</span>'; });
    holder.innerHTML = (q.prompt ? '<p class="q-p">' + (q.n ? '<span class="qn">' + q.n + '</span>' : '') + q.prompt + '</p>' : '') +
      '<div class="key"><span class="kp">premise</span><span class="kc">conclusion</span></div><div class="arg">' + html + '</div>';
    var k = 0;
    q.segs.forEach(function(s){
      if (typeof s === 'string') return;
      var i = k++, sid = id + '.' + i, row = document.createElement('div'); row.className = 'srow';
      row.innerHTML = '<div class="lbl"><b style="font-style:normal;font-family:var(--sans);font-size:13px;color:var(--mute)">' + (i + 1) + '</b> ' + esc(s[0]) + '</div>';
      holder.appendChild(row);
      var cell = document.createElement('div'); row.appendChild(cell);
      var roles = q.roles || ['premise', 'conclusion'];
      mcBlock(cell, sid, '', roles.map(function(r){ return [ROLE[r], r === s[1] ? 1 : 0, r === s[1] ? (s[3] || 'Correct.') : (s[2] || 'Not quite. Ask what this part is doing: supporting, or being supported?')]; }), true, null, function(){
        $('.seg[data-s="' + i + '"]', holder).classList.add('r-' + s[1]);
      });
      row.appendChild(cell.lastElementChild);
      cell.removeAttribute('data-qid'); row.setAttribute('data-qid', sid);
      if (ST.ans[sid] && ST.ans[sid].ok) $('.seg[data-s="' + i + '"]', holder).classList.add('r-' + s[1]);
    });
    return;
  }
  if (q.type === 'text') {
    var a = ST.ans[id];
    holder.setAttribute('data-qid', id);
    holder.innerHTML = '<p class="q-p">' + (q.n ? '<span class="qn">' + q.n + '</span>' : '') + q.prompt + '</p>' +
      '<textarea aria-label="Your answer"></textarea><div class="inrow" style="margin-top:6px"><button class="btn" type="button">Save</button><span class="saved-dot"></span></div><div class="fb"></div>';
    var ta = $('textarea', holder), dot = $('.saved-dot', holder), fb = $('.fb', holder), min = q.min || 20;
    if (a) { ta.value = a.v || ''; dot.textContent = '● saved'; }
    $('button', holder).addEventListener('click', function(){
      var v = ta.value.trim();
      if (v.length < min) { say(fb, 'no', 'Write a complete answer before saving.'); return; }
      fb.className = 'fb'; dot.textContent = '● saved';
      var e = ST.ans[id] || (ST.ans[id] = { first: true, tries: 0 }); e.tries++; e.ok = true; e.v = v; save(); refresh();
    });
    ta.addEventListener('input', function(){ dot.textContent = ''; });
    return;
  }
  if (q.type === 'worked') {
    holder.innerHTML = '<div class="wk-setup">' + q.setup + '</div>';
    var steps = q.steps.map(function(s, i){
      var st = document.createElement('div'); st.className = 'step';
      st.innerHTML = '<div class="sn">' + (i + 1) + '</div><div class="q"></div>';
      holder.appendChild(st); return st;
    });
    var sol = document.createElement('div'); sol.className = 'solution';
    sol.innerHTML = '<h5>Worked solution</h5>' + q.solution; holder.appendChild(sol);
    function unlock(){
      var open = true;
      steps.forEach(function(st, i){ st.classList.toggle('locked', !open); var a = ST.ans[id + '.s' + i]; open = open && !!(a && a.ok); });
      sol.classList.toggle('on', open);
    }
    q.steps.forEach(function(s, i){ mcBlock($('.q', steps[i]), id + '.s' + i, s.prompt, s.opts, s.row, null, unlock, !s.keep); });
    unlock();
    return;
  }
}
$$('[data-q]').forEach(render);
$$('.flip').forEach(function(f){ f.setAttribute('role', 'button'); f.tabIndex = 0;
  f.addEventListener('click', function(){ f.classList.toggle('on'); });
  f.addEventListener('keydown', function(e){ if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); f.classList.toggle('on'); } }); });

/* free inputs (name field, checklists) persist too */
$$('[data-keep]').forEach(function(el){
  var k = el.dataset.keep, v = ST.misc[k];
  if (el.type === 'checkbox') { el.checked = !!v; el.addEventListener('change', function(){ ST.misc[k] = el.checked; save(); }); }
  else { if (v != null) el.value = v; el.addEventListener('input', function(){ ST.misc[k] = el.value; save(); }); }
});

/* sheets + strip */
var SHEETS = $$('.sheet'), cur = 0;
SHEETS.forEach(function(s, i){
  var tb = $('.tb', s);
  if (tb) tb.innerHTML = '<div><small>Sheet</small><div class="no">' + String(i).padStart(2, '0') + '</div></div><div><small>' + (s.dataset.kind || 'Station') + '</small><h2>' + s.dataset.label + '</h2></div>' +
    '<div class="tm"><small>Time</small>≈ ' + (s.dataset.time || '10') + ' min</div><div class="ck"><small>Status</small><span class="stat">—</span></div>' +
    '<div class="stamp"><img src="' + (L.assets || 'assets/') + 'optima-owl.png" alt="Optima Academy Online"></div>';
});
var stops = $('#stops');
function reqOf(s){ return $$('[data-qid]', s).map(function(e){ return e.getAttribute('data-qid'); }); }
function done(s, i){ var r = reqOf(s); return r.length ? r.every(function(id){ return ST.ans[id] && ST.ans[id].ok; }) : !!(ST.misc.seen && ST.misc.seen[i]); }
function refresh(){
  var n = 0;
  SHEETS.forEach(function(s, i){
    var r = reqOf(s), d = done(s, i), got = r.filter(function(id){ return ST.ans[id]; }).length, first = r.filter(function(id){ return ST.ans[id] && ST.ans[id].first; }).length;
    if (d) n++;
    s.classList.toggle('complete', d);
    var st = $('.stat', s); if (st) st.textContent = d ? '✓ complete' : (r.length ? got + ' / ' + r.length : '—');
    $$('.act', s).forEach(function(a){
      var ar = reqOf(a), sc = $('.score', a);
      if (sc && ar.length) sc.textContent = ar.filter(function(id){ return ST.ans[id] && ST.ans[id].ok; }).length + ' / ' + ar.length;
    });
    var b = stops && stops.children[i];
    if (b) { b.classList.toggle('done', d); b.classList.toggle('cur', i === cur); }
  });
  var p = $('#pct'); if (p) p.textContent = Math.round(n / SHEETS.length * 100) + '%';
  var sm = $('#summary'); if (sm) drawSummary(sm, n);
}
function drawSummary(sm, n){
  var tot = 0, first = 0, ok = 0;
  SHEETS.forEach(function(s){ reqOf(s).forEach(function(id){ if (Q[id] && /^(text|reflect)$/.test(Q[id].type)) return; tot++; var a = ST.ans[id]; if (a && a.first) first++; if (a && a.ok) ok++; }); });
  sm.innerHTML = '<div><small>Checks answered correctly</small><b>' + ok + ' / ' + tot + '</b></div><div><small>Right on the first try</small><b>' + first + ' / ' + tot + '</b></div><div><small>Sheets complete</small><b>' + n + ' / ' + SHEETS.length + '</b></div>';
}
function show(i){
  cur = Math.max(0, Math.min(SHEETS.length - 1, i));
  SHEETS.forEach(function(s, k){ s.classList.toggle('on', k === cur); });
  ST.misc.seen = ST.misc.seen || {}; ST.misc.seen[cur] = 1; ST.misc.cur = cur; save(); refresh();
  var top = SHEETS[cur].getBoundingClientRect().top + window.scrollY - ($('.strip') ? $('.strip').offsetHeight : 0) - 10;
  if (window.scrollY > top) window.scrollTo({ top: top });
  var b = stops && stops.children[cur]; if (b && b.scrollIntoView) b.scrollIntoView({ block:'nearest', inline:'nearest' });
}
if (stops) SHEETS.forEach(function(s, i){
  var b = document.createElement('button'); b.type = 'button'; b.className = 'stop';
  b.innerHTML = '<i>' + (i + 1) + '</i>' + (s.dataset.short || s.dataset.label);
  b.addEventListener('click', function(){ show(i); }); stops.appendChild(b);
});
document.addEventListener('click', function(e){ var g = e.target.closest('[data-go]'); if (g) show(+g.dataset.go); });
show(ST.misc.cur || 0);

/* PDF (assignment pages): gathers every written response under its prompt */
var pdfBtn = $('#pdfBtn'), LOGO = null;
if (pdfBtn && window.fetch && /^http/.test(location.protocol) && $('#wordmark')) fetch($('#wordmark').src).then(function(r){ return r.blob(); }).then(function(b){
  var fr = new FileReader(); fr.onload = function(){ LOGO = fr.result; }; fr.readAsDataURL(b);
}).catch(function(){});
if (pdfBtn) pdfBtn.addEventListener('click', function(){
  var name = (ST.misc.name || '').trim();
  var missing = $$('[data-qid]').filter(function(e){ return !ST.ans[e.getAttribute('data-qid')]; }).length;
  var note = $('#pdfNote');
  if (!name) { note.textContent = 'Type your name on the first sheet first.'; return; }
  if (!window.jspdf) { note.textContent = 'The PDF tool did not load. Check your connection and reload the page.'; return; }
  var doc = new window.jspdf.jsPDF({ unit:'pt', format:'letter' }), W = 612, H = 792, M = 54, y = M;
  doc.setProperties({ title: L.title + ' · ' + name, subject: L.course, author: name, creator: 'Optima Academy Online' });
  function need(h){ if (y + h > H - M) { doc.addPage(); y = M; } }
  function txt(s, size, style, color, indent){
    doc.setFont('helvetica', style || 'normal'); doc.setFontSize(size); var c = color || [14, 28, 66]; doc.setTextColor(c[0], c[1], c[2]);
    doc.splitTextToSize(s, W - 2 * M - (indent || 0)).forEach(function(l){ need(size * 1.4); doc.text(l, M + (indent || 0), y); y += size * 1.4; });
  }
  function plain(h){ var d = document.createElement('div'); d.innerHTML = h; return d.textContent.replace(/\s+/g, ' ').trim(); }
  if (LOGO) try { doc.addImage(LOGO, 'PNG', W - M - 106, 18, 106, 30, 'logo', 'FAST'); y = 70; } catch(e){}
  txt(L.course.toUpperCase(), 8.5, 'bold', [107, 102, 86]); y += 6;
  txt(L.title, 18, 'bold'); y += 2;
  txt(name + '   ·   ' + new Date().toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' }), 11, 'normal', [103, 48, 143]);
  y += 4; doc.setDrawColor(14, 28, 66); doc.setLineWidth(1); doc.line(M, y, W - M, y); y += 20;
  SHEETS.forEach(function(s){
    var ids = reqOf(s).filter(function(id){ return Q[id] && Q[id].type === 'text'; });
    if (!ids.length) return;
    need(40); txt(s.dataset.label, 13, 'bold', [181, 98, 10]); y += 2;
    ids.forEach(function(id){
      var a = ST.ans[id];
      txt(plain((Q[id].n ? Q[id].n + '. ' : '') + Q[id].prompt), 10, 'bold', null, 0); y += 1;
      txt(a ? a.v : '(not answered)', 10.5, 'normal', a ? null : [176, 58, 46], 12); y += 10;
    });
    y += 6;
  });
  need(20); txt('Optima Academy Online · Academic Design and Curriculum (AcDC)', 8, 'normal', [107, 102, 86]);
  doc.save((L.file || L.key) + '_' + name.replace(/[^A-Za-z0-9]+/g, '_') + '.pdf');
  note.textContent = missing ? 'Saved. ' + missing + ' response' + (missing > 1 ? 's are' : ' is') + ' still blank in the PDF.' : 'Saved to your downloads.';
});
})();
