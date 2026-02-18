// projects.js — Three.js planetary projects visualization
(function(){
  if(!window.THREE) return console.warn('Three.js not loaded');

  // slowed rotation speeds, pixel-appropriate sizes
  const projects = [
    {id:'NIMBUS', title:'NIMBUS Task Manager', desc:'No-fluff task manager — Rails backend deployed on Render pgSQL', url:'https://nimbus-dwan.onrender.com/', color:0x5ca46e, size:22, distance:110, speed:0.06},
    {id:'OpenTrainer', title:'OpenTrainer', desc:'AI / ML — Train classifiers without code', url:'https://github.com/aysuri-0807/OpenTrainer', color:0x78d6ff, size:18, distance:170, speed:0.04},
    {id:'EcoCar', title:'EcoCarCAVS2025AFS', desc:'Autonomous systems — vehicle simulation & testing', url:'https://github.com/aysuri-0807/EcoCarCAVS2025AFS', color:0xffb86b, size:28, distance:230, speed:0.03},
    {id:'EasyIBKR', title:'EasyIBKR', desc:'Backend / Finance — IBKR trading helper', url:'https://github.com/aysuri-0807/EasyIBKR', color:0x8fe88a, size:16, distance:290, speed:0.08},
    {id:'PoliteTrashCan', title:'PoliteTrashCan', desc:'Embedded / IoT — speech-controlled hardware', url:'https://github.com/aysuri-0807/PoliteTrashCan', color:0xff7fbf, size:14, distance:350, speed:0.02},
    {id:'Spotify', title:'Spotify_Recommendations', desc:'Full-stack — recommendation web app', url:'https://github.com/aysuri-0807/Spotify_Recommendations', color:0x8ea6ff, size:20, distance:410, speed:0.015}
  ];

  // Basic three.js setup
  const canvas = document.getElementById('projectsCanvas');
  const container = canvas.parentElement;
  const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias:true, alpha:true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x020409);

  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 5000);
  camera.position.set(0, 220, 900);

  // lights (subtle)
  const amb = new THREE.AmbientLight(0xffffff, 0.3);
  scene.add(amb);

  // star field
  (function addStars(){
    const starGeo = new THREE.BufferGeometry();
    const count = 1200;
    const pos = new Float32Array(count * 3);
    for(let i=0;i<count;i++){
      const r = 1800;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2*Math.random()-1);
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);
      pos[i*3]=x; pos[i*3+1]=y; pos[i*3+2]=z;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(pos,3));
    const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color:0x4fd8ff, size:1 }));
    scene.add(stars);
  })();

  // sun (wireframe sphere)
  const sunGeom = new THREE.SphereGeometry(60, 32, 32);
  const sunWire = new THREE.LineSegments(new THREE.WireframeGeometry(sunGeom), new THREE.LineBasicMaterial({ color:0xffd27f, opacity:0.9 }));
  scene.add(sunWire);

  // create planets, sprites and orbit lines
  const planetVisuals = []; // wireframe visuals
  const planetHitMeshes = []; // invisible meshes for stable raycasting
  const planetSprites = [];
  projects.forEach((p, idx)=>{
    const g = new THREE.SphereGeometry(p.size, 24, 24);
    const mat = new THREE.LineBasicMaterial({ color: p.color, opacity:0.95 });
    const wire = new THREE.LineSegments(new THREE.WireframeGeometry(g), mat);
    wire.userData = { ...p, idx };
    // initial position on x axis
    wire.position.set(p.distance, 0, 0);
    planetVisuals.push(wire);
    scene.add(wire);

    // invisible hit mesh for raycasting (prevents jitter from line segments)
    const hitMat = new THREE.MeshBasicMaterial({ visible: false });
    const hitMesh = new THREE.Mesh(g, hitMat);
    hitMesh.userData = { ...p, idx };
    hitMesh.position.copy(wire.position);
    planetHitMeshes.push(hitMesh);
    scene.add(hitMesh);

    // create a small SVG icon for each project and add as a sprite
    const svg = `
      <svg xmlns='http://www.w3.org/2000/svg' width='128' height='128'>
        <rect width='100%' height='100%' fill='none'/>
        <circle cx='64' cy='64' r='54' fill='${('#'+p.color.toString(16).padStart(6,'0'))}' opacity='0.14'/>
        <circle cx='64' cy='64' r='44' fill='none' stroke='${('#'+p.color.toString(16).padStart(6,'0'))}' stroke-width='6' />
        <text x='64' y='74' font-size='42' font-family='Arial' font-weight='700' text-anchor='middle' fill='${('#'+p.color.toString(16).padStart(6,'0'))}'>${p.title.charAt(0)}</text>
      </svg>`;
    const url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    const loader = new THREE.TextureLoader();
    loader.load(url, (tex)=>{
      tex.minFilter = THREE.LinearFilter;
      const mat = new THREE.SpriteMaterial({ map: tex, depthTest: false });
      const sprite = new THREE.Sprite(mat);
      // scale relative to planet size
      sprite.scale.set(p.size * 2.2, p.size * 2.2, 1);
      scene.add(sprite);
        planetSprites[idx] = sprite;
    });

    // orbit line (thin wire circle)
    const segments = 256;
    const orbitGeom = new THREE.BufferGeometry();
    const pts = new Float32Array(segments * 3);
    for(let i=0;i<segments;i++){
      const a = (i/segments) * Math.PI * 2;
      const x = Math.cos(a) * p.distance;
      const z = Math.sin(a) * p.distance * 0.55; // slight elliptical tilt
      pts[i*3]=x; pts[i*3+1]=0; pts[i*3+2]=z;
    }
    orbitGeom.setAttribute('position', new THREE.BufferAttribute(pts,3));
    const orbitLine = new THREE.LineLoop(orbitGeom, new THREE.LineBasicMaterial({ color:0x0b2c33, opacity:0.6 }));
    scene.add(orbitLine);
  });

  // raycaster for hover/click
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  let hovered = null;

  function resize(){
    const rect = container.getBoundingClientRect();
    renderer.setSize(rect.width, rect.height);
    camera.aspect = rect.width / rect.height;
    camera.updateProjectionMatrix();
  }

  window.addEventListener('resize', resize);
  resize();

  let last = 0;
  // speed multiplier (1 = normal). On hover we smoothly approach targetMultiplier (<1)
  let speedMultiplier = 1.0;
  let targetMultiplier = 1.0;
  function animate(t){
    const time = t * 0.001;
    renderer.render(scene, camera);

    // rotate sun
    sunWire.rotation.y = time * 0.12;

    // smoothly approach targetMultiplier
    speedMultiplier += (targetMultiplier - speedMultiplier) * 0.08;

    // update planets positions; they always move but speed scaled by speedMultiplier
    planetVisuals.forEach((vis,i)=>{
      const p = projects[i];
      const ang = time * p.speed * speedMultiplier + i * 0.9;
      const x = Math.cos(ang) * p.distance;
      const z = Math.sin(ang) * p.distance * 0.55;
      const y = Math.sin(ang * 0.5) * 12;
      vis.position.set(x, y, z);
      vis.rotation.y += 0.008 + i*0.001;
      // update corresponding hit mesh and sprite
      const hit = planetHitMeshes[i];
      if(hit) hit.position.copy(vis.position);
      const sp = planetSprites[i];
      if(sp) sp.position.copy(vis.position);
    });

    // subtle scene rotation for parallax
    scene.rotation.y = Math.sin(time * 0.05) * 0.05;

    // raycast hover handling
    raycaster.setFromCamera(mouse, camera);
    // only test against invisible hit meshes for stability
    const intersects = raycaster.intersectObjects(planetHitMeshes, true);
    if(intersects.length){
      const obj = intersects[0].object;
      if(hovered !== obj){
        hovered = obj;
        const d = obj.userData;
        showPreview(d.title, d.desc, d.url);
        // slow down but don't stop
        targetMultiplier = 0.12;
      }
    } else {
      if(hovered !== null) {
        hovered = null;
        hidePreview();
        targetMultiplier = 1.0;
      }
    }

    requestAnimationFrame(animate);
  }

  function showPreview(title, desc, url){
    const prev = document.getElementById('canvasPreview');
    if(!prev) return;
    document.getElementById('previewTitle').textContent = title;
    document.getElementById('previewDesc').textContent = desc;
    document.getElementById('previewLink').href = url;
    prev.classList.add('visible');
  }
  function hidePreview(){
    const prev = document.getElementById('canvasPreview');
    if(prev) prev.classList.remove('visible');
  }

  // mouse events
  function onMove(e){
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    // position preview near top-right of canvas
    const prev = document.getElementById('canvasPreview');
    if(prev) {
      prev.style.right = '20px';
      prev.style.top = '20px';
    }
  }
  renderer.domElement.addEventListener('mousemove', onMove);
  // clicking no longer opens modal; hover shows info. Keep click to open github in new tab as optional:
  renderer.domElement.addEventListener('click', (e)=>{
    if(hovered){
      const d = hovered.userData;
      window.open(d.url, '_blank', 'noopener');
    }
  });

  requestAnimationFrame(animate);

})();
