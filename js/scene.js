import * as THREE from 'three';

const canvas = document.getElementById('scene');
try { canvas && start(canvas); } catch (e) { canvas && canvas.remove(); }

function start(canvas) {
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(38, 1, .1, 100);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x07111c, 1.8));
  const sun = new THREE.DirectionalLight(0x9dfaf5, 1.7); sun.position.set(6, 9, 7); scene.add(sun);

  // Warren truss bridge: two trusses joined by cross beams and a deck.
  const N = 8, L = 2, H = 2.3, W = 2.4;
  const mats = [0x24d6cf, 0x8ba8c2, 0xd8e7f1].map(c => new THREE.MeshStandardMaterial({ color: c, roughness: .38, metalness: .35, emissive: c === 0x24d6cf ? 0x063c3b : 0x07111c, emissiveIntensity: .45 }));
  const bridge = new THREE.Group(); scene.add(bridge);
  const parts = [];
  const V = (i, y, z) => new THREE.Vector3((i - N / 2) * L, y, z);
  const beam = (a, b, t, m) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(t, t, a.distanceTo(b)), mats[m]);
    mesh.position.copy(a).add(b).multiplyScalar(.5); mesh.lookAt(b);
    bridge.add(mesh);
    parts.push({ mesh, to: mesh.position.clone(), from: mesh.position.clone().add(new THREE.Vector3((Math.random() - .5) * 26, Math.random() * 14 + 4, (Math.random() - .5) * 26)), delay: parts.length * .035 });
  };
  for (const z of [-W / 2, W / 2]) for (let i = 0; i < N; i++) {
    beam(V(i, 0, z), V(i + 1, 0, z), .16, 0);
    if (i && i < N - 1) beam(V(i, H, z), V(i + 1, H, z), .16, 0);
    beam(i % 2 ? V(i, H, z) : V(i, 0, z), i % 2 ? V(i + 1, 0, z) : V(i + 1, H, z), .12, 1);
  }
  for (const z of [-W / 2, W / 2]) for (let i = 1; i < N; i++) beam(V(i, 0, z), V(i, H, z), .1, 2);
  for (let i = 0; i <= N; i++) beam(V(i, 0, -W / 2), V(i, 0, W / 2), .12, 2);
  const deck = new THREE.Mesh(new THREE.BoxGeometry(N * L, .08, W), new THREE.MeshStandardMaterial({ color: 0x0b1724, roughness: .75, metalness: .15 }));
  deck.position.y = .08; bridge.add(deck);
  bridge.position.y = -1.2;

  // Subtle technical ground grid, matching the dark cyan interface.
  const groundGrid = new THREE.GridHelper(38, 38, 0x1a8e98, 0x173047);
  groundGrid.position.y = -1.28;
  groundGrid.material.transparent = true;
  groundGrid.material.opacity = 0.34;
  scene.add(groundGrid);

  let mx = 0, my = 0, drag = 0, spin = -.55, down = null, vis = true;
  canvas.addEventListener('pointerdown', e => { down = e.clientX; canvas.style.cursor = 'grabbing'; });
  addEventListener('pointerup', () => { down = null; canvas.style.cursor = ''; });
  addEventListener('pointermove', e => {
    mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5;
    if (down !== null) { drag += (e.clientX - down) * .008; down = e.clientX; }
  });
  new IntersectionObserver(([e]) => vis = e.isIntersecting).observe(canvas);

  const size = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false); cam.aspect = w / h;
    const wide = w > 860; cam.position.set(wide ? 3.5 : 0, 3.2, wide ? 17 : 24); cam.lookAt(wide ? 3 : 0, 0, 0);
    cam.updateProjectionMatrix();
  };
  new ResizeObserver(size).observe(canvas); size();

  const clock = new THREE.Clock();
  (function frame() {
    requestAnimationFrame(frame);
    if (!vis) return;
    const t = clock.getElapsedTime();
    for (const p of parts) {
      const k = calm ? 1 : Math.min(Math.max((t - .3 - p.delay) / 1.4, 0), 1), e = 1 - Math.pow(1 - k, 3);
      p.mesh.position.lerpVectors(p.from, p.to, e); p.mesh.scale.setScalar(Math.max(e, .001));
    }
    if (!calm && down === null) spin += .0016;
    bridge.rotation.y = spin + drag + mx * .35 + scrollY * .0015;
    bridge.rotation.x = my * .15;
    renderer.render(scene, cam);
  })();
}
