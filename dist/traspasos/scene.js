/* ============================================================
   Escena 3D inmersiva — WebGL / Three.js (r137)
   Fondo: estrellas, planetas procedurales (shaders GLSL),
   atmósferas, anillos, nebulosas y sol. Con parallax de cámara.
   No interfiere con la UI (canvas con pointer-events:none).
   ============================================================ */
(function () {
  "use strict";

  const PREF_KEY = "immersive";
  const reduceMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Estado de preferencia (por defecto activado)
  let enabled = (localStorage.getItem(PREF_KEY) || "on") === "on";

  const canvas = document.getElementById("bg");
  const btn = document.getElementById("btnImmersive");

  let three = null; // contexto de la escena cuando está activa

  /* ---------------- GLSL compartido ---------------- */
  const NOISE_GLSL = `
    vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
    vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
    vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
    vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
    float snoise(vec3 v){
      const vec2 C=vec2(1.0/6.0,1.0/3.0); const vec4 D=vec4(0.0,0.5,1.0,2.0);
      vec3 i=floor(v+dot(v,C.yyy)); vec3 x0=v-i+dot(i,C.xxx);
      vec3 g=step(x0.yzx,x0.xyz); vec3 l=1.0-g;
      vec3 i1=min(g.xyz,l.zxy); vec3 i2=max(g.xyz,l.zxy);
      vec3 x1=x0-i1+C.xxx; vec3 x2=x0-i2+C.yyy; vec3 x3=x0-D.yyy;
      i=mod289(i);
      vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))
        +i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
      float n_=0.142857142857; vec3 ns=n_*D.wyz-D.xzx;
      vec4 j=p-49.0*floor(p*ns.z*ns.z);
      vec4 x_=floor(j*ns.z); vec4 y_=floor(j-7.0*x_);
      vec4 x=x_*ns.x+ns.yyyy; vec4 y=y_*ns.x+ns.yyyy;
      vec4 h=1.0-abs(x)-abs(y);
      vec4 b0=vec4(x.xy,y.xy); vec4 b1=vec4(x.zw,y.zw);
      vec4 s0=floor(b0)*2.0+1.0; vec4 s1=floor(b1)*2.0+1.0;
      vec4 sh=-step(h,vec4(0.0));
      vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy; vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
      vec3 p0=vec3(a0.xy,h.x); vec3 p1=vec3(a0.zw,h.y);
      vec3 p2=vec3(a1.xy,h.z); vec3 p3=vec3(a1.zw,h.w);
      vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
      p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
      vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0); m=m*m;
      return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
    }
    float fbm(vec3 p){ float v=0.0,a=0.5; for(int i=0;i<6;i++){v+=a*snoise(p);p*=2.02;a*=0.5;} return v; }
  `;

  /* ---------------- Textura de resplandor (canvas) ---------------- */
  function glowTexture() {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const g = c.getContext("2d");
    const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grd.addColorStop(0, "rgba(255,255,255,1)");
    grd.addColorStop(0.25, "rgba(255,255,255,0.55)");
    grd.addColorStop(0.55, "rgba(255,255,255,0.12)");
    grd.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = grd;
    g.fillRect(0, 0, 128, 128);
    const t = new THREE.CanvasTexture(c);
    return t;
  }

  /* ---------------- Construcción de la escena ---------------- */
  function build() {
    const renderer = new THREE.WebGLRenderer({
      canvas, antialias: true, alpha: true, powerPreference: "high-performance",
    });
    renderer.setClearColor(0x000000, 0);
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(DPR);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 200);
    camera.position.set(0, 0, 16);

    const clock = new THREE.Clock();
    const glow = glowTexture();
    const sunPos = new THREE.Vector3(-22, 14, -8);
    const sunDir = sunPos.clone().normalize();

    /* ---- Estrellas ---- */
    const starCount = window.innerWidth < 700 ? 2600 : 5200;
    const sg = new THREE.BufferGeometry();
    const pos = new Float32Array(starCount * 3);
    const col = new Float32Array(starCount * 3);
    const siz = new Float32Array(starCount);
    const pha = new Float32Array(starCount);
    const palette = [
      [0.75, 0.82, 1.0], [1.0, 0.95, 0.85], [0.85, 0.9, 1.0],
      [1.0, 0.85, 0.75], [0.9, 0.95, 1.0], [1.0, 1.0, 1.0],
    ];
    for (let i = 0; i < starCount; i++) {
      const r = 40 + Math.random() * 90;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(ph) * Math.cos(th);
      pos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
      pos[i * 3 + 2] = r * Math.cos(ph) - 30;
      const c = palette[(Math.random() * palette.length) | 0];
      col[i * 3] = c[0]; col[i * 3 + 1] = c[1]; col[i * 3 + 2] = c[2];
      siz[i] = 0.6 + Math.random() * 2.4;
      pha[i] = Math.random() * 6.28;
    }
    sg.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    sg.setAttribute("aColor", new THREE.BufferAttribute(col, 3));
    sg.setAttribute("aSize", new THREE.BufferAttribute(siz, 1));
    sg.setAttribute("aPhase", new THREE.BufferAttribute(pha, 1));
    const starMat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: { uTime: { value: 0 }, uDpr: { value: DPR } },
      vertexShader: `
        attribute float aSize; attribute float aPhase; attribute vec3 aColor;
        varying vec3 vColor; uniform float uTime; uniform float uDpr;
        void main(){
          vColor=aColor;
          vec4 mv=modelViewMatrix*vec4(position,1.0);
          float tw=0.65+0.35*sin(uTime*1.6+aPhase);
          gl_PointSize=aSize*uDpr*(330.0/-mv.z)*tw;
          gl_Position=projectionMatrix*mv;
        }`,
      fragmentShader: `
        varying vec3 vColor;
        void main(){
          vec2 d=gl_PointCoord-0.5; float r=length(d);
          float a=smoothstep(0.5,0.0,r); a=pow(a,1.5);
          float core=smoothstep(0.12,0.0,r);
          gl_FragColor=vec4(vColor+core*0.6, a);
        }`,
    });
    scene.add(new THREE.Points(sg, starMat));

    /* ---- Nebulosas (sprites aditivos) ---- */
    const nebColors = [0x6d3bff, 0x2563eb, 0xec4899, 0x14b8a6];
    nebColors.forEach((cHex, i) => {
      const m = new THREE.SpriteMaterial({
        map: glow, color: cHex, transparent: true,
        blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.18,
      });
      const s = new THREE.Sprite(m);
      const ang = (i / nebColors.length) * Math.PI * 2;
      s.position.set(Math.cos(ang) * 34, Math.sin(ang) * 20 - 4, -45 - i * 6);
      const sc = 55 + Math.random() * 35;
      s.scale.set(sc, sc, 1);
      scene.add(s);
    });

    /* ---- Sol ---- */
    const sunGroup = new THREE.Group();
    sunGroup.position.copy(sunPos);
    const sunMesh = new THREE.Mesh(
      new THREE.SphereGeometry(2.4, 32, 32),
      new THREE.MeshBasicMaterial({ color: 0xfff2cc })
    );
    sunGroup.add(sunMesh);
    const sunGlow = new THREE.Sprite(new THREE.SpriteMaterial({
      map: glow, color: 0xffd27a, transparent: true,
      blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.9,
    }));
    sunGlow.scale.set(26, 26, 1);
    sunGroup.add(sunGlow);
    scene.add(sunGroup);

    /* ---- Planetas ---- */
    const planetVert = `
      varying vec3 vN; varying vec3 vPos; varying vec3 vView;
      void main(){
        vPos=position;
        vN=normalize(mat3(modelMatrix)*normal);
        vec4 wp=modelMatrix*vec4(position,1.0);
        vView=normalize(cameraPosition-wp.xyz);
        gl_Position=projectionMatrix*viewMatrix*wp;
      }`;
    const planetFrag = `
      ${NOISE_GLSL}
      varying vec3 vN; varying vec3 vPos; varying vec3 vView;
      uniform float uTime; uniform vec3 uSun;
      uniform vec3 uLow; uniform vec3 uHigh; uniform vec3 uAtmo;
      uniform float uType; uniform float uScale;
      void main(){
        vec3 p=normalize(vPos);
        float n=fbm(p*uScale + vec3(0.0,0.0,uTime*0.03));
        vec3 surf;
        if(uType<0.5){            // rocoso / tierra
          float land=smoothstep(0.0,0.25,n);
          vec3 sea=mix(uLow*0.6, uLow, 0.5+0.5*n);
          vec3 ground=mix(uHigh*0.7, uHigh, smoothstep(0.0,0.6,n));
          surf=mix(sea, ground, land);
          float ice=smoothstep(0.7,0.85,abs(p.y));
          surf=mix(surf, vec3(0.95), ice);
        } else if(uType<1.5){     // gigante gaseoso con bandas
          float bands=sin(p.y*14.0 + fbm(p*3.0)*3.0 + uTime*0.05);
          surf=mix(uLow, uHigh, 0.5+0.5*bands);
          surf+= 0.08*fbm(p*8.0);
        } else if(uType<2.5){     // lava
          float crack=smoothstep(0.1,0.5,abs(n));
          surf=mix(uHigh, uLow, crack);
          surf+= pow(max(0.0,-n),2.0)*vec3(1.0,0.4,0.0)*1.5;
        } else {                  // helado
          float cr=fbm(p*uScale*1.5);
          surf=mix(uLow, uHigh, smoothstep(-0.2,0.4,cr));
          surf+= smoothstep(0.6,0.9,abs(cr))*0.3;
        }
        float lambert=clamp(dot(normalize(vN),normalize(uSun)),0.0,1.0);
        float light=0.05 + lambert;
        float fres=pow(1.0-max(dot(vView,normalize(vN)),0.0),3.0);
        vec3 col=surf*light + uAtmo*fres*(0.4+0.8*lambert);
        gl_FragColor=vec4(col,1.0);
      }`;

    function makePlanet(opt) {
      const g = new THREE.Group();
      const mat = new THREE.ShaderMaterial({
        vertexShader: planetVert, fragmentShader: planetFrag,
        uniforms: {
          uTime: { value: 0 }, uSun: { value: sunDir },
          uLow: { value: new THREE.Color(opt.low) },
          uHigh: { value: new THREE.Color(opt.high) },
          uAtmo: { value: new THREE.Color(opt.atmo) },
          uType: { value: opt.type }, uScale: { value: opt.scale || 2.2 },
        },
      });
      const planet = new THREE.Mesh(new THREE.SphereGeometry(opt.r, 64, 64), mat);
      g.add(planet);

      // Atmósfera (halo fresnel aditivo)
      const atmoMat = new THREE.ShaderMaterial({
        transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
        side: THREE.FrontSide,
        uniforms: { uColor: { value: new THREE.Color(opt.atmo) }, uSun: { value: sunDir } },
        vertexShader: `varying vec3 vN; varying vec3 vView;
          void main(){ vN=normalize(mat3(modelMatrix)*normal);
            vec4 wp=modelMatrix*vec4(position,1.0); vView=normalize(cameraPosition-wp.xyz);
            gl_Position=projectionMatrix*viewMatrix*wp; }`,
        fragmentShader: `varying vec3 vN; varying vec3 vView; uniform vec3 uColor; uniform vec3 uSun;
          void main(){ float fres=pow(1.0-max(dot(vView,normalize(vN)),0.0),2.5);
            float lam=clamp(dot(normalize(vN),normalize(uSun)),0.0,1.0);
            gl_FragColor=vec4(uColor, fres*(0.25+0.75*lam)*0.9); }`,
      });
      const atmo = new THREE.Mesh(new THREE.SphereGeometry(opt.r * 1.14, 48, 48), atmoMat);
      g.add(atmo);

      // Anillo opcional
      if (opt.ring) {
        const ringMat = new THREE.ShaderMaterial({
          transparent: true, side: THREE.DoubleSide, depthWrite: false,
          uniforms: {
            uColor: { value: new THREE.Color(opt.ring) },
            uInner: { value: opt.r * 1.4 }, uOuter: { value: opt.r * 2.3 },
          },
          vertexShader: `varying vec2 vL; void main(){ vL=position.xy;
            gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
          fragmentShader: `${NOISE_GLSL}
            varying vec2 vL; uniform vec3 uColor; uniform float uInner; uniform float uOuter;
            void main(){
              float r=length(vL); float t=(r-uInner)/(uOuter-uInner);
              if(t<0.0||t>1.0) discard;
              float bands=0.5+0.5*sin(t*70.0);
              float detail=0.6+0.4*fbm(vec3(vL*0.6,0.0));
              float gap=smoothstep(0.46,0.5,abs(t-0.52));
              float a=bands*detail*gap*(1.0-smoothstep(0.9,1.0,t))*smoothstep(0.0,0.06,t);
              gl_FragColor=vec4(uColor, a*0.7);
            }`,
        });
        const ring = new THREE.Mesh(new THREE.RingGeometry(opt.r * 1.4, opt.r * 2.3, 128), ringMat);
        ring.rotation.x = -1.15;
        ring.rotation.y = 0.25;
        g.add(ring);
      }

      // Luna opcional
      if (opt.moon) {
        const moonMat = new THREE.ShaderMaterial({
          vertexShader: planetVert, fragmentShader: planetFrag,
          uniforms: {
            uTime: { value: 0 }, uSun: { value: sunDir },
            uLow: { value: new THREE.Color(0x5a5a66) },
            uHigh: { value: new THREE.Color(0xb8b8c2) },
            uAtmo: { value: new THREE.Color(0x222233) },
            uType: { value: 0 }, uScale: { value: 4.0 },
          },
        });
        const moon = new THREE.Mesh(new THREE.SphereGeometry(opt.r * 0.28, 32, 32), moonMat);
        const mo = new THREE.Group(); mo.add(moon);
        moon.position.x = opt.r * 2.1;
        g.userData.moonOrbit = mo; g.userData.moonMat = moonMat;
        g.add(mo);
      }

      g.position.set(opt.x, opt.y, opt.z);
      g.userData.mat = mat;
      g.userData.spin = opt.spin || 0.05;
      g.userData.tilt = opt.tilt || 0.3;
      planet.rotation.z = opt.tilt || 0.3;
      atmo.rotation.z = opt.tilt || 0.3;
      scene.add(g);
      return g;
    }

    const planets = [
      makePlanet({ r: 3.0, x: -6, y: 1.5, z: 0, type: 0, low: 0x14306b, high: 0x2fae6b, atmo: 0x6fb6ff, scale: 2.4, spin: 0.06, tilt: 0.35, moon: true }),
      makePlanet({ r: 4.2, x: 9, y: -2.5, z: -6, type: 1, low: 0x6b3f1d, high: 0xe8c79a, atmo: 0xffd9a0, scale: 2.0, spin: 0.04, tilt: 0.22, ring: 0xd9b78a }),
      makePlanet({ r: 1.9, x: 4.5, y: 4.2, z: -3, type: 2, low: 0x3a0a06, high: 0xff5a1f, atmo: 0xff7a3c, scale: 3.0, spin: 0.10, tilt: 0.5 }),
      makePlanet({ r: 2.3, x: -11, y: -4, z: -10, type: 3, low: 0x2a4a6b, high: 0xcfe8ff, atmo: 0xafe0ff, scale: 2.6, spin: 0.05, tilt: 0.4 }),
    ];

    /* ---- Parallax ---- */
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    function onMove(e) {
      const t = e.touches ? e.touches[0] : e;
      mouse.tx = (t.clientX / window.innerWidth - 0.5) * 2;
      mouse.ty = (t.clientY / window.innerHeight - 0.5) * 2;
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onMove, { passive: true });

    function resize() {
      const w = window.innerWidth, h = window.innerHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    window.addEventListener("resize", resize);
    resize();

    let raf = 0;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      starMat.uniforms.uTime.value = t;

      planets.forEach((g, i) => {
        g.children[0].rotation.y += g.userData.spin * 0.016;
        g.userData.mat.uniforms.uTime.value = t;
        g.position.y += Math.sin(t * 0.4 + i) * 0.003;
        if (g.userData.moonOrbit) {
          g.userData.moonOrbit.rotation.y = t * 0.4;
          g.userData.moonMat.uniforms.uTime.value = t;
        }
      });
      sunGlow.material.opacity = 0.8 + 0.15 * Math.sin(t * 1.2);

      mouse.x += (mouse.tx - mouse.x) * 0.04;
      mouse.y += (mouse.ty - mouse.y) * 0.04;
      camera.position.x = Math.sin(t * 0.05) * 1.4 + mouse.x * 2.2;
      camera.position.y = Math.cos(t * 0.04) * 0.9 - mouse.y * 1.6;
      camera.lookAt(0, 0, -2);

      renderer.render(scene, camera);
    };
    animate();

    if (reduceMotion) cancelAnimationFrame(raf); // un solo frame

    // Pausa al ocultar la pestaña
    const onVis = () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else if (!reduceMotion) { clock.getDelta(); animate(); }
    };
    document.addEventListener("visibilitychange", onVis);

    return {
      destroy() {
        cancelAnimationFrame(raf);
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("touchmove", onMove);
        window.removeEventListener("resize", resize);
        document.removeEventListener("visibilitychange", onVis);
        scene.traverse((o) => {
          if (o.geometry) o.geometry.dispose();
          if (o.material) {
            if (o.material.map) o.material.map.dispose();
            o.material.dispose();
          }
        });
        renderer.dispose();
      },
    };
  }

  /* ---------------- Activar / desactivar ---------------- */
  function start() {
    if (three || !canvas) return;
    if (!window.THREE) { loadThree().then(start); return; }
    try {
      three = build();
      document.body.classList.add("imm");
      canvas.style.display = "block";
    } catch (e) {
      console.warn("3D no disponible:", e);
      document.body.classList.remove("imm");
      if (canvas) canvas.style.display = "none";
    }
  }
  function stop() {
    if (three) { three.destroy(); three = null; }
    document.body.classList.remove("imm");
    if (canvas) canvas.style.display = "none";
  }

  let threePromise = null;
  function loadThree() {
    if (window.THREE) return Promise.resolve();
    if (threePromise) return threePromise;
    threePromise = new Promise((res, rej) => {
      const s = document.createElement("script");
      s.src = "vendor/three.min.js";
      s.onload = res; s.onerror = rej;
      document.head.appendChild(s);
    });
    return threePromise;
  }

  function updateBtn() {
    if (!btn) return;
    btn.textContent = enabled ? "🌌" : "🌑";
    btn.title = enabled ? "Desactivar modo inmersivo 3D" : "Activar modo inmersivo 3D";
    btn.classList.toggle("on", enabled);
  }

  if (btn) {
    btn.addEventListener("click", () => {
      enabled = !enabled;
      localStorage.setItem(PREF_KEY, enabled ? "on" : "off");
      updateBtn();
      enabled ? start() : stop();
    });
  }
  updateBtn();

  // Arranque: carga diferida de Three.js solo si está activado
  if (enabled) {
    if (document.readyState === "complete") loadThree().then(start);
    else window.addEventListener("load", () => loadThree().then(start));
  }
})();
