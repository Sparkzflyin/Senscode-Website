"use strict";

// Generative WebGL aurora/fluid hover effect for bento cards.
// One canvas is created lazily per card on first hover, then reused. Only the
// hovered card animates — everything else is paused, so you never pay the
// cost of N simultaneous shaders. Honors reduce-motion + coarse-pointer + the
// browser-engine perf settings exposed by script.js.

(() => {
  const SELECTOR = ".bento-item";

  // Skip on mobile (no hover pointer) and when motion is reduced.
  const fine = window.matchMedia("(pointer: fine)").matches;
  if (!fine) return;
  const reducedOS = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  if (reducedOS) return;

  const cards = document.querySelectorAll(SELECTOR);
  if (!cards.length) return;

  // Vertex shader: render a full-card quad in clip space, pass UVs through.
  const VERT = `
    attribute vec2 a_pos;
    varying vec2 v_uv;
    void main() {
      v_uv = a_pos * 0.5 + 0.5;
      gl_Position = vec4(a_pos, 0.0, 1.0);
    }
  `;

  // Fragment shader: layered domain-warped noise that ripples around the
  // cursor. Edge-faded so the effect blends into the card frame instead of
  // slamming against the rounded border.
  const FRAG = `
    precision mediump float;
    varying vec2 v_uv;
    uniform float u_time;
    uniform vec2 u_mouse;     // 0..1, top-left origin (we flip Y on input)
    uniform float u_intensity; // 0..1, ramps with hover
    uniform vec3 u_color1;
    uniform vec3 u_color2;

    // Hash + value-noise pair, cheap and tileable enough for a card.
    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    }
    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(
        mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
        mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
        u.y
      );
    }
    float fbm(vec2 p) {
      float v = 0.0;
      float a = 0.5;
      for (int i = 0; i < 4; i++) {
        v += a * noise(p);
        p *= 2.0;
        a *= 0.5;
      }
      return v;
    }

    void main() {
      vec2 uv = v_uv;
      // Warp toward cursor — domain offset by an fbm of position+time.
      vec2 q = vec2(
        fbm(uv * 3.0 + u_time * 0.15),
        fbm(uv * 3.0 - u_time * 0.10 + 4.7)
      );
      vec2 r = uv + 0.35 * (q - 0.5);

      // Cursor influence: pull warp center toward the mouse for a "fluid" feel.
      float d = distance(uv, u_mouse);
      float pull = exp(-d * 4.0) * u_intensity;
      r = mix(r, u_mouse, pull * 0.45);

      float n = fbm(r * 4.0 + u_time * 0.08);

      // Color blend: cool base → warm at noise crests near the cursor.
      vec3 color = mix(u_color1, u_color2, smoothstep(0.35, 0.85, n + pull * 0.5));

      // Soft edge fade so the effect dies gracefully into the card frame.
      float edge = smoothstep(0.0, 0.12, uv.x) *
                   smoothstep(1.0, 0.88, uv.x) *
                   smoothstep(0.0, 0.12, uv.y) *
                   smoothstep(1.0, 0.88, uv.y);

      float alpha = u_intensity * edge * 0.85;
      gl_FragColor = vec4(color, alpha);
    }
  `;

  function compile(gl, type, src) {
    const sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      console.warn("[shader] compile error:", gl.getShaderInfoLog(sh));
      gl.deleteShader(sh);
      return null;
    }
    return sh;
  }

  function makeProgram(gl) {
    const v = compile(gl, gl.VERTEX_SHADER, VERT);
    const f = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!v || !f) return null;
    const p = gl.createProgram();
    gl.attachShader(p, v);
    gl.attachShader(p, f);
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      console.warn("[shader] link error:", gl.getProgramInfoLog(p));
      return null;
    }
    return p;
  }

  function readAccent(card) {
    // Use the link/accent CSS variables so the effect tracks dark/light theme
    // and any future palette tweaks. Fallback to brand orange/blue.
    const cs = getComputedStyle(card);
    const link = cs.getPropertyValue("--link").trim() || "#2997ff";
    const accent = cs.getPropertyValue("--hover-border").trim() || "#ff9500";
    return { c1: hexToRgb01(link), c2: hexToRgb01(accent) };
  }
  function hexToRgb01(hex) {
    let h = hex.replace("#", "");
    if (h.length === 3)
      h = h
        .split("")
        .map((c) => c + c)
        .join("");
    const num = parseInt(h, 16);
    return [
      ((num >> 16) & 255) / 255,
      ((num >> 8) & 255) / 255,
      (num & 255) / 255,
    ];
  }

  function setup(card) {
    const canvas = document.createElement("canvas");
    canvas.className = "card-shader";
    card.insertBefore(canvas, card.firstChild);

    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: false,
      premultipliedAlpha: false,
      preserveDrawingBuffer: false,
    });
    if (!gl) {
      // Browser refused to give us a context — bail silently, card stays static.
      canvas.remove();
      return null;
    }
    const program = makeProgram(gl);
    if (!program) {
      canvas.remove();
      return null;
    }
    gl.useProgram(program);

    // Single full-screen quad.
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    );
    const aPos = gl.getAttribLocation(program, "a_pos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const u = {
      time: gl.getUniformLocation(program, "u_time"),
      mouse: gl.getUniformLocation(program, "u_mouse"),
      intensity: gl.getUniformLocation(program, "u_intensity"),
      color1: gl.getUniformLocation(program, "u_color1"),
      color2: gl.getUniformLocation(program, "u_color2"),
    };

    const { c1, c2 } = readAccent(card);
    gl.uniform3f(u.color1, c1[0], c1[1], c1[2]);
    gl.uniform3f(u.color2, c2[0], c2[1], c2[2]);

    return { canvas, gl, u, program };
  }

  function resize(state, card) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = card.getBoundingClientRect();
    const w = Math.max(1, Math.floor(rect.width * dpr));
    const h = Math.max(1, Math.floor(rect.height * dpr));
    if (state.canvas.width !== w || state.canvas.height !== h) {
      state.canvas.width = w;
      state.canvas.height = h;
      state.gl.viewport(0, 0, w, h);
    }
  }

  cards.forEach((card) => {
    let state = null;
    let raf = null;
    let intensity = 0;
    let target = 0;
    let mouseUv = [0.5, 0.5];
    let startTime = 0;

    function frame(now) {
      if (!state) return;
      if (!startTime) startTime = now;
      // Honor a runtime motion-toggle change.
      if (document.body.classList.contains("reduce-motion")) {
        target = 0;
      }
      // Smooth fade in/out of the effect.
      intensity += (target - intensity) * 0.12;
      resize(state, card);
      const { gl, u } = state;
      gl.useProgram(state.program);
      gl.uniform1f(u.time, (now - startTime) / 1000);
      gl.uniform2f(u.mouse, mouseUv[0], mouseUv[1]);
      gl.uniform1f(u.intensity, intensity);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      if (intensity < 0.005 && target === 0) {
        // Fully faded out — release the rAF until the next hover.
        raf = null;
        state.canvas.classList.remove("is-active");
        return;
      }
      raf = requestAnimationFrame(frame);
    }

    function ensureRunning() {
      if (raf == null) {
        startTime = 0;
        raf = requestAnimationFrame(frame);
      }
    }

    card.addEventListener("mouseenter", () => {
      if (!state) state = setup(card);
      if (!state) return;
      target = 1;
      state.canvas.classList.add("is-active");
      ensureRunning();
    });

    card.addEventListener("mousemove", (e) => {
      if (!state) return;
      const rect = card.getBoundingClientRect();
      mouseUv[0] = (e.clientX - rect.left) / rect.width;
      // Flip Y because GL UV space has origin at bottom-left.
      mouseUv[1] = 1 - (e.clientY - rect.top) / rect.height;
    });

    card.addEventListener("mouseleave", () => {
      target = 0;
      ensureRunning();
    });
  });
})();
