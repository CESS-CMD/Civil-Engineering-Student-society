
// Graceful fallback for photo assets that are not present in a deployment.
document.addEventListener('error', event => {
  const img = event.target;
  if (!(img instanceof HTMLImageElement) || img.dataset.fallbackApplied) return;
  img.dataset.fallbackApplied = 'true';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="420" viewBox="0 0 640 420"><rect width="640" height="420" fill="#0b1724"/><g fill="none" stroke="#24d6cf" stroke-opacity=".65" stroke-width="2"><path d="M80 340V180L180 100 280 180V340M180 100V340M80 220H280M320 340V130H540V340M320 200H540M320 270H540"/><path d="M35 365H600M35 385H600" stroke-opacity=".25"/></g><text x="320" y="405" fill="#9cb0c0" font-family="Arial,sans-serif" font-size="13" text-anchor="middle">CESS · CIVIL ENGINEERING</text></svg>`;
  img.src = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
}, true);
const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;

$('#yr').textContent = new Date().getFullYear();
const nav = $('nav'), burger = $('.burger');
burger.onclick = () => burger.setAttribute('aria-expanded', nav.classList.toggle('open'));
nav.onclick = () => nav.classList.remove('open');

fetch('data/site.json').then(r => r.json()).then(build).catch(() =>
  document.body.insertAdjacentHTML('afterbegin',
    '<p class="err">Content could not load. Serve the site from a web server instead of opening index.html directly.</p>'));

function build(d) {
  $('#tagline').textContent = d.tagline;
  $('#stats').innerHTML = [[d.team.length, 'Core members'], [d.events.length, 'Events and competitions'], [d.objectives.length, 'Objectives']]
    .map(([n, l]) => `<div><b data-n="${n}">0</b>${l}</div>`).join('');
  $('#about-text').innerHTML = d.about.map(p => `<p>${esc(p)}</p>`).join('');
  $('#pillars').innerHTML = d.pillars.map(p => `<div class="pillar"><span>${p.icon}</span><h3>${esc(p.title)}</h3><p>${esc(p.text)}</p></div>`).join('');
  $('#objectives').innerHTML = d.objectives.map(o => `<div><h3>${esc(o.title)}</h3><p>${esc(o.text)}</p></div>`).join('');
  events(d.events);
  $('#message-list').innerHTML = d.messages.map(m => `<article class="msg"><div><img src="${esc(m.photo)}" alt="${esc(m.name)}" loading="lazy"><p class="who"><strong>${esc(m.name)}</strong><br>${esc(m.role)}<br><a href="mailto:${esc(m.email)}">${esc(m.email)}</a></p></div><div><h3>${esc(m.title)}</h3>${m.text.map(t => `<p>${esc(t)}</p>`).join('')}<p class="sign">${esc(m.sign)}</p></div></article>`).join('');
  $('#team-grid').innerHTML = d.team.map(t => `<div class="member"><img src="${esc(t.photo)}" alt="${esc(t.name)}" loading="lazy"><div><h3>${esc(t.name)}</h3><span>${esc(t.role)}</span><a href="mailto:${esc(t.email)}">${esc(t.email)}</a></div></div>`).join('');
  gallery(d.gallery);
  counters(); tilt(); spy();
}

function events(list) {
  const types = ['All', ...new Set(list.map(e => e.type))];
  const f = $('#filters'), g = $('#event-grid');
  const show = t => {
    f.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', b.textContent === t));
    g.innerHTML = list.filter(e => t === 'All' || e.type === t)
      .map(e => `<div class="card"><small>${esc(e.type)}</small><h3>${esc(e.title)}</h3><p>${esc(e.text)}</p></div>`).join('');
    tilt();
  };
  f.innerHTML = types.map(t => `<button aria-pressed="false">${esc(t)}</button>`).join('');
  f.onclick = e => e.target.tagName === 'BUTTON' && show(e.target.textContent);
  show('All');
}

function counters() {
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    io.unobserve(e.target);
    const n = +e.target.dataset.n, t0 = performance.now();
    const step = t => { const k = calm ? 1 : Math.min((t - t0) / 1200, 1); e.target.textContent = Math.round(n * k); k < 1 && requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }));
  document.querySelectorAll('[data-n]').forEach(el => io.observe(el));
}

function tilt() {
  if (calm || !matchMedia('(hover:hover)').matches) return;
  document.querySelectorAll('.card,.member').forEach(el => {
    if (el._t) return; el._t = 1;
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      el.style.transform = `rotateY(${x * 12}deg) rotateX(${-y * 12}deg) translateZ(10px)`;
    });
    el.addEventListener('pointerleave', () => el.style.transform = '');
  });
}

function spy() {
  const links = [...nav.querySelectorAll('a')];
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) links.forEach(a => a.classList.toggle('on', a.hash === '#' + e.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  links.forEach(a => { const s = $(a.hash); s && io.observe(s); });
}

function gallery(items) {
  const ring = $('#ring'), n = items.length, step = 360 / n;
  ring.innerHTML = items.map((g, i) => `<figure data-i="${i}"><img src="${esc(g.src)}" alt="${esc(g.caption)}" loading="lazy" draggable="false"></figure>`).join('');
  let i = 0, timer;
  const place = () => {
    const R = Math.round(ring.firstElementChild.offsetWidth / 2 / Math.tan(Math.PI / n)) + 24;
    ring.querySelectorAll('figure').forEach((f, k) => f.style.transform = `rotateY(${k * step}deg) translateZ(${R}px)`);
    ring.style.transform = `translateZ(${-R}px) rotateY(${-i * step}deg)`;
    $('#cap').textContent = `${i + 1} of ${n}. ${items[((i % n) + n) % n].caption}`;
  };
  const go = d => { i += d; place(); };
  $('#next').onclick = () => { go(1); auto(); };
  $('#prev').onclick = () => { go(-1); auto(); };
  ring.onclick = e => { const f = e.target.closest('figure'); if (f) { i += Math.round(((+f.dataset.i - i) % n + n + n / 2) % n - n / 2); place(); auto(); } };
  const auto = () => { clearInterval(timer); if (!calm) timer = setInterval(() => go(1), 4500); };
  addEventListener('resize', place);
  place(); auto();
}
