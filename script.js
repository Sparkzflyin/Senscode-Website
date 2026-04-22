document.addEventListener("DOMContentLoaded", () => {
  // First-visit Intro Splash (homepage only, native <dialog>)
  const intro = document.querySelector(".site-intro");
  if (intro instanceof HTMLDialogElement) {
    if (
      typeof intro.showModal === "function" &&
      !sessionStorage.getItem("senscode-intro-seen")
    ) {
      const introBtn = intro.querySelector(".site-intro-btn");
      const introCanvas = intro.querySelector(".site-intro-particles");
      let introRafId;

      intro.showModal();

      // Hard scroll-lock while intro is open (Lenis would otherwise bypass
      // the native modal's scroll prevention via its wheel listener).
      const introPreventScroll = (e) => e.preventDefault();
      window.addEventListener("wheel", introPreventScroll, { passive: false });
      window.addEventListener("touchmove", introPreventScroll, {
        passive: false,
      });

      const introTimerIds = [];
      const introScheduleNext = (delay, fn) => {
        const id = setTimeout(fn, delay);
        introTimerIds.push(id);
        return id;
      };

      // --- Particle Text Assembly ---
      // Orange particles drift around, then converge to form a phrase, hold
      // it, dissolve back into drift, then reassemble into the next phrase.
      let introHandleResize = null;
      if (introCanvas) {
        const ictx = introCanvas.getContext("2d");
        let iParticles = [];
        let phraseIdx = 0;
        let phase = "drifting"; // drifting | assembling | holding | dispersing

        const phrases = [
          "You found it.",
          "Your next\nbig dream.",
          "Come to life.",
        ];

        const getDpr = () => window.devicePixelRatio || 1;

        const resizeIntroCanvas = () => {
          const rect = introCanvas.getBoundingClientRect();
          const dpr = getDpr();
          const cssW = Math.max(1, Math.floor(rect.width));
          const cssH = Math.max(1, Math.floor(rect.height));
          introCanvas.width = cssW * dpr;
          introCanvas.height = cssH * dpr;
          introCanvas.style.width = cssW + "px";
          introCanvas.style.height = cssH + "px";
          // Reset any prior transform, then scale so all subsequent drawing
          // commands take CSS-pixel coordinates while the backing store
          // renders at native device resolution.
          ictx.setTransform(1, 0, 0, 1, 0, 0);
          ictx.scale(dpr, dpr);
        };

        const getCssSize = () => {
          const dpr = getDpr();
          return {
            w: introCanvas.width / dpr,
            h: introCanvas.height / dpr,
          };
        };

        const initIntroParticles = () => {
          const { w, h } = getCssSize();
          const dpr = getDpr();
          // Density scales with DPR so 4K / Retina monitors get proportionally
          // more particles filling the same CSS area.
          const count = Math.min(2800, Math.floor((w * h * (1 + dpr)) / 2500));
          iParticles = [];
          for (let i = 0; i < count; i++) {
            iParticles.push({
              x: Math.random() * w,
              y: Math.random() * h,
              vx: (Math.random() - 0.5) * 0.4,
              vy: (Math.random() - 0.5) * 0.4,
              r: Math.random() * 1.5 + 1.3,
              tx: null,
              ty: null,
            });
          }
        };

        const getTextTargets = (text) => {
          const { w: cssW, h: cssH } = getCssSize();
          if (cssW < 2 || cssH < 2) return [];

          const dpr = getDpr();
          const physW = Math.floor(cssW * dpr);
          const physH = Math.floor(cssH * dpr);

          const off = document.createElement("canvas");
          off.width = physW;
          off.height = physH;
          const octx = off.getContext("2d");
          octx.scale(dpr, dpr);

          const lines = text.split("\n");
          const maxLen = Math.max(1, ...lines.map((l) => l.length));
          const fontSize =
            Math.min(cssW / (maxLen * 0.48), cssH / (lines.length * 1.6)) *
            0.88;

          octx.fillStyle = "white";
          octx.font = `italic 600 ${fontSize}px "Playfair Display", Georgia, serif`;
          octx.textAlign = "center";
          octx.textBaseline = "middle";

          const lineHeight = fontSize * 1.18;
          const startY = cssH / 2 - ((lines.length - 1) * lineHeight) / 2;
          lines.forEach((line, i) => {
            octx.fillText(line, cssW / 2, startY + i * lineHeight);
          });

          // Sample at a step that scales with DPR — same step in physical
          // pixels across all monitors → finer-grained sampling (more
          // targets per letter) on high-DPR displays.
          const img = octx.getImageData(0, 0, physW, physH).data;
          const targets = [];
          const density = 7;
          for (let y = 0; y < physH; y += density) {
            for (let x = 0; x < physW; x += density) {
              if (img[(y * physW + x) * 4 + 3] > 128) {
                targets.push({ x: x / dpr, y: y / dpr });
              }
            }
          }
          return targets;
        };

        const assignTargets = (phrase) => {
          const targets = getTextTargets(phrase);
          for (let i = targets.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [targets[i], targets[j]] = [targets[j], targets[i]];
          }
          iParticles.forEach((p, i) => {
            if (i < targets.length) {
              p.tx = targets[i].x;
              p.ty = targets[i].y;
            } else {
              p.tx = null;
              p.ty = null;
              p.vx = (Math.random() - 0.5) * 0.3;
              p.vy = (Math.random() - 0.5) * 0.3;
            }
          });
        };

        const releaseTargets = () => {
          iParticles.forEach((p) => {
            p.tx = null;
            p.ty = null;
            p.vx = (Math.random() - 0.5) * 1.2;
            p.vy = (Math.random() - 0.5) * 1.2;
          });
        };

        const runPhraseCycle = () => {
          phase = "assembling";
          assignTargets(phrases[phraseIdx]);
          introScheduleNext(1300, () => {
            phase = "holding";
            introScheduleNext(3500, () => {
              phase = "dispersing";
              releaseTargets();
              introScheduleNext(1100, () => {
                phase = "drifting";
                phraseIdx = (phraseIdx + 1) % phrases.length;
                introScheduleNext(600, runPhraseCycle);
              });
            });
          });
        };

        const drawIntroParticles = () => {
          if (document.hidden) {
            introRafId = requestAnimationFrame(drawIntroParticles);
            return;
          }
          const { w, h } = getCssSize();
          ictx.clearRect(0, 0, w, h);

          for (let i = 0; i < iParticles.length; i++) {
            const p = iParticles[i];
            if (p.tx !== null && p.ty !== null) {
              p.vx = (p.tx - p.x) * 0.11;
              p.vy = (p.ty - p.y) * 0.11;
            } else {
              if (p.x < 0) {
                p.x = 0;
                p.vx *= -1;
              } else if (p.x > w) {
                p.x = w;
                p.vx *= -1;
              }
              if (p.y < 0) {
                p.y = 0;
                p.vy *= -1;
              } else if (p.y > h) {
                p.y = h;
                p.vy *= -1;
              }
            }
            p.x += p.vx;
            p.y += p.vy;

            ictx.beginPath();
            ictx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ictx.fillStyle = "rgba(255, 149, 0, 0.85)";
            ictx.fill();
          }

          // Draw connection lines only during drift phases to keep the
          // "constellation" ambience without cluttering assembled letters.
          // Uses spatial grid + batched Path2D so cursor RAF stays smooth
          // at high particle counts.
          if (phase === "drifting" || phase === "dispersing") {
            const cellSize = 100;
            const maxDistSq = 4900; // ~70px visible threshold
            const grid = new Map();
            for (let i = 0; i < iParticles.length; i++) {
              const p = iParticles[i];
              const gx = Math.floor(p.x / cellSize);
              const gy = Math.floor(p.y / cellSize);
              const key = gx + "," + gy;
              let bucket = grid.get(key);
              if (!bucket) {
                bucket = [];
                grid.set(key, bucket);
              }
              bucket.push(p);
            }

            ictx.beginPath();
            const halfNeighbors = [
              [1, 0],
              [-1, 1],
              [0, 1],
              [1, 1],
            ];
            for (const [key, bucket] of grid) {
              const sep = key.indexOf(",");
              const cx = +key.slice(0, sep);
              const cy = +key.slice(sep + 1);

              // Pairs within the same cell
              for (let i = 0; i < bucket.length; i++) {
                const p = bucket[i];
                for (let j = i + 1; j < bucket.length; j++) {
                  const p2 = bucket[j];
                  const dx = p.x - p2.x;
                  const dy = p.y - p2.y;
                  if (dx * dx + dy * dy < maxDistSq) {
                    ictx.moveTo(p.x, p.y);
                    ictx.lineTo(p2.x, p2.y);
                  }
                }
              }

              // Pairs with half of the 8 neighbors (avoids double-counting)
              for (let n = 0; n < 4; n++) {
                const nk =
                  cx + halfNeighbors[n][0] + "," + (cy + halfNeighbors[n][1]);
                const other = grid.get(nk);
                if (!other) continue;
                for (let i = 0; i < bucket.length; i++) {
                  const p = bucket[i];
                  for (let j = 0; j < other.length; j++) {
                    const p2 = other[j];
                    const dx = p.x - p2.x;
                    const dy = p.y - p2.y;
                    if (dx * dx + dy * dy < maxDistSq) {
                      ictx.moveTo(p.x, p.y);
                      ictx.lineTo(p2.x, p2.y);
                    }
                  }
                }
              }
            }
            ictx.strokeStyle = "rgba(255, 255, 255, 0.11)";
            ictx.lineWidth = 0.5;
            ictx.stroke();
          }

          introRafId = requestAnimationFrame(drawIntroParticles);
        };

        resizeIntroCanvas();
        initIntroParticles();
        drawIntroParticles();
        introScheduleNext(1500, runPhraseCycle);

        introHandleResize = () => {
          resizeIntroCanvas();
          initIntroParticles();
          if (phase === "assembling" || phase === "holding") {
            assignTargets(phrases[phraseIdx]);
          }
        };
        window.addEventListener("resize", introHandleResize);
      }

      if (introBtn) {
        introBtn.addEventListener("click", () => {
          intro.classList.add("dismissing");
          setTimeout(() => intro.close(), 700);
        });
        setTimeout(() => introBtn.focus(), 100);
      }

      intro.addEventListener("close", () => {
        sessionStorage.setItem("senscode-intro-seen", "1");
        if (introRafId) cancelAnimationFrame(introRafId);
        introTimerIds.forEach((id) => clearTimeout(id));
        window.removeEventListener("wheel", introPreventScroll);
        window.removeEventListener("touchmove", introPreventScroll);
        if (introHandleResize) {
          window.removeEventListener("resize", introHandleResize);
        }
        intro.remove();
      });
    } else {
      intro.remove();
    }
  }

  // Lenis smooth scroll — falls back to native CSS scroll-behavior if library missing
  let lenis = null;
  if (typeof window.Lenis === "function") {
    lenis = new window.Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1,
    });
    const lenisRaf = (time) => {
      if (!document.hidden) lenis.raf(time);
      requestAnimationFrame(lenisRaf);
    };
    requestAnimationFrame(lenisRaf);
  }
  const syncLenisMotion = () => {
    if (!lenis) return;
    if (document.body.classList.contains("reduce-motion")) lenis.stop();
    else lenis.start();
  };

  // 1. Theme Logic
  const toggles = document.querySelectorAll(".theme-toggle");
  const html = document.documentElement;

  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");
  const systemTheme = prefersDark.matches ? "dark" : "light";

  // Respect localStorage preference universally, fallback to system theme.
  const currentTheme = localStorage.getItem("theme") || systemTheme;

  html.setAttribute("data-theme", currentTheme);
  toggles.forEach((toggle) => {
    toggle.innerText = currentTheme === "dark" ? "Light Mode" : "Dark Mode";
  });

  const onSchemeChange = (e) => {
    const newSystemTheme = e.matches ? "dark" : "light";
    html.setAttribute("data-theme", newSystemTheme);
    localStorage.removeItem("theme");
    toggles.forEach((toggle) => {
      toggle.innerText = newSystemTheme === "dark" ? "Light Mode" : "Dark Mode";
    });
  };
  if (typeof prefersDark.addEventListener === "function") {
    prefersDark.addEventListener("change", onSchemeChange);
  } else if (typeof prefersDark.addListener === "function") {
    prefersDark.addListener(onSchemeChange);
  }

  toggles.forEach((toggle) => {
    toggle.addEventListener("click", () => {
      const nextTheme =
        html.getAttribute("data-theme") === "dark" ? "light" : "dark";
      html.setAttribute("data-theme", nextTheme);
      localStorage.setItem("theme", nextTheme);
      toggles.forEach((t) => {
        t.innerText = nextTheme === "dark" ? "Light Mode" : "Dark Mode";
      });
    });
  });

  // Scroll Reveal & Story Text
  const revealEls = document.querySelectorAll(".reveal, .story-text");
  if (typeof IntersectionObserver === "function") {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("active");
          } else if (e.target.classList.contains("story-text")) {
            e.target.classList.remove("active");
          }
        });
      },
      { threshold: 0.2 }
    );
    revealEls.forEach((el) => observer.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("active"));
  }

  // 5. Advanced Card Tilt & Spotlight Effect
  document
    .querySelectorAll(
      ".glass-panel:not(.no-spotlight), .card:not(.no-spotlight), .process-step:not(.no-spotlight)"
    )
    .forEach((card) => {
      if (!card.querySelector(".spotlight")) {
        const spotlight = document.createElement("div");
        spotlight.classList.add("spotlight");
        card.appendChild(spotlight);
      }

      let playTimer;
      let isPlaying = false;
      let startX, startY;

      const handleTouchStart = (e) => {
        isPlaying = false;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        playTimer = setTimeout(() => {
          isPlaying = true;
        }, 50); // Enter play mode after 50ms of holding
        handleMove(e);
      };

      const handleMove = (e) => {
        if (document.body.classList.contains("reduce-motion")) {
          handleLeave();
          return;
        }
        if (e.type === "touchmove") {
          const currentX = e.touches[0].clientX;
          const currentY = e.touches[0].clientY;
          const deltaX = Math.abs(currentX - startX);
          const deltaY = Math.abs(currentY - startY);

          // If they haven't held it long enough to enter 'play mode',
          // check if they are moving significantly. If so, cancel the timer.
          if (!isPlaying && (deltaX > 10 || deltaY > 10)) {
            clearTimeout(playTimer);
          }

          if (isPlaying && e.cancelable) {
            e.preventDefault(); // lock screen for playing
          } else if (!isPlaying && deltaY > deltaX) {
            // User is scrolling vertically, let the browser handle it natively
            return;
          }
        }

        const rect = card.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        card.style.setProperty("--x", `${x}px`);
        card.style.setProperty("--y", `${y}px`);

        // 3D Tilt Physics
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const tiltX = ((y - centerY) / centerY) * -10; // Max tilt 10deg
        const tiltY = ((x - centerX) / centerX) * 10;

        card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.02, 1.02, 1.02)`;

        const spotlight = card.querySelector(".spotlight");
        if (spotlight) spotlight.style.opacity = "1";
      };

      const handleLeave = () => {
        clearTimeout(playTimer);
        isPlaying = false;
        card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;

        const spotlight = card.querySelector(".spotlight");
        if (spotlight) spotlight.style.opacity = "0";
      };

      card.addEventListener("mousemove", handleMove);
      card.addEventListener("touchmove", handleMove, { passive: false });
      card.addEventListener("touchstart", handleTouchStart, { passive: true });

      card.addEventListener("mouseleave", handleLeave);
      card.addEventListener("touchend", handleLeave);
      card.addEventListener("touchcancel", handleLeave);
    });

  // 6. Back to Top
  const btt = document.getElementById("back-to-top");
  if (btt) {
    btt.addEventListener("click", () => {
      if (lenis) lenis.scrollTo(0);
      else window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // 7. Mobile Menu Toggle
  const hamburger = document.getElementById("hamburger");
  const mobileMenu = document.getElementById("mobile-menu");

  if (hamburger && mobileMenu) {
    const setMenuState = (open) => {
      hamburger.classList.toggle("active", open);
      mobileMenu.classList.toggle("active", open);
      hamburger.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.style.overflow = open ? "hidden" : "";
    };
    const toggleMenu = () => {
      setMenuState(!mobileMenu.classList.contains("active"));
    };

    hamburger.addEventListener("click", toggleMenu);
    hamburger.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleMenu();
      }
    });

    document.querySelectorAll(".mobile-menu a").forEach((link) => {
      link.addEventListener("click", () => setMenuState(false));
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && mobileMenu.classList.contains("active")) {
        setMenuState(false);
        hamburger.focus();
      }
    });
  }

  // 8. Mobile Navbar Auto-Hide & Back to Top on Scroll
  let lastScrollY = window.scrollY;
  const navbar = document.querySelector(".navbar");
  const scrollTasks = [];
  let scrollTicking = false;

  scrollTasks.push(() => {
    if (btt) {
      if (window.scrollY > 400) {
        btt.classList.add("visible");
      } else {
        btt.classList.remove("visible");
      }
    }

    if (navbar && window.innerWidth <= 768) {
      if (lastScrollY < window.scrollY && window.scrollY > 50) {
        navbar.classList.add("navbar--hidden");
      } else {
        navbar.classList.remove("navbar--hidden");
      }
    }
    lastScrollY = window.scrollY;
  });

  window.addEventListener(
    "scroll",
    () => {
      if (!scrollTicking) {
        window.requestAnimationFrame(() => {
          for (const task of scrollTasks) task();
          scrollTicking = false;
        });
        scrollTicking = true;
      }
    },
    { passive: true }
  );

  // 9. Time Greeting Logic
  const greetingEl = document.getElementById("time-greeting");
  if (greetingEl) {
    const hour = new Date().getHours();
    let greeting = "Good evening.";
    if (hour < 12) greeting = "Good morning.";
    else if (hour < 18) greeting = "Good afternoon.";
    greetingEl.innerText = greeting;
  }

  // 11. Dynamic Navigation Highlighting
  const currentPath = window.location.pathname;
  const currentPage = currentPath.endsWith("/index.html")
    ? "/"
    : currentPath.replace(/\.html$/, "");

  document.querySelectorAll(".nav-links a, .mobile-menu a").forEach((link) => {
    const linkHref = link.getAttribute("href");
    if (linkHref === currentPage) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });

  // 12. Contact Form AJAX Submission
  const contactForm = document.getElementById("contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const submitBtn = document.getElementById("submit-btn");
      if (!submitBtn) return;
      const originalText = submitBtn.innerText;
      submitBtn.innerText = "Sending...";
      submitBtn.disabled = true;

      const data = new FormData(contactForm);
      try {
        const response = await fetch(contactForm.action, {
          method: contactForm.method,
          body: data,
          headers: {
            Accept: "application/json",
          },
        });

        if (response.ok) {
          submitBtn.innerText = "Message Sent!";
          contactForm.reset();
          setTimeout(() => {
            submitBtn.innerText = originalText;
            submitBtn.disabled = false;
          }, 5000);
        } else {
          submitBtn.innerText = "Error. Try again.";
          setTimeout(() => {
            submitBtn.innerText = originalText;
            submitBtn.disabled = false;
          }, 3000);
        }
      } catch (err) {
        console.error("Contact form submission failed:", err);
        submitBtn.innerText = "Error. Try again.";
        setTimeout(() => {
          submitBtn.innerText = originalText;
          submitBtn.disabled = false;
        }, 3000);
      }
    });
  }

  // 13. Typewriter Effect for Hero Headers
  const heroHeaders = document.querySelectorAll(
    ".hero-content h1, .founder-note h1, .founder-note h2"
  );
  heroHeaders.forEach((header) => {
    const text = header.textContent;
    header.textContent = "";

    // Accessibility structure
    const srOnly = document.createElement("span");
    srOnly.style.position = "absolute";
    srOnly.style.width = "1px";
    srOnly.style.height = "1px";
    srOnly.style.padding = "0";
    srOnly.style.margin = "-1px";
    srOnly.style.overflow = "hidden";
    srOnly.style.clip = "rect(0, 0, 0, 0)";
    srOnly.style.whiteSpace = "nowrap";
    srOnly.style.border = "0";
    srOnly.textContent = text;
    header.appendChild(srOnly);

    const animatedPart = document.createElement("span");
    animatedPart.setAttribute("aria-hidden", "true");
    animatedPart.classList.add("typewriter-cursor");
    header.appendChild(animatedPart);

    const actions = [];

    const isIndexPage =
      window.location.pathname.endsWith("index.html") ||
      window.location.pathname === "/";

    // Introduce a typo if there are multiple words AND we are on the index page
    if (text.trim().includes(" ") && isIndexPage) {
      const words = text.trim().split(" ");
      const firstWordAndSpace = words[0] + " ";
      const secondWord = words[1];
      const restOfText = text.substring(
        text.indexOf(firstWordAndSpace) +
          firstWordAndSpace.length +
          secondWord.length
      );

      // Generate a realistic transposition typo for the second word
      let typoWord = secondWord;
      if (secondWord.length >= 3) {
        typoWord =
          secondWord.charAt(0) +
          secondWord.charAt(2) +
          secondWord.charAt(1) +
          secondWord.slice(3);
      } else if (secondWord.length === 2) {
        typoWord = secondWord.charAt(1) + secondWord.charAt(0);
      } else {
        typoWord = secondWord + "x";
      }

      // Action queue: type prefix -> type typo -> pause -> delete typo -> pause -> type correctly
      for (const c of firstWordAndSpace)
        actions.push({ type: "type", char: c });
      for (const c of typoWord) actions.push({ type: "type", char: c });
      actions.push({ type: "pause", ms: 400 });
      for (let i = 0; i < typoWord.length; i++)
        actions.push({ type: "delete" });
      actions.push({ type: "pause", ms: 200 });
      for (const c of secondWord + restOfText)
        actions.push({ type: "type", char: c });
    } else {
      for (const c of text) actions.push({ type: "type", char: c });
    }

    let actionIndex = 0;
    const processAction = () => {
      if (actionIndex < actions.length) {
        const action = actions[actionIndex];
        actionIndex++;

        if (action.type === "type") {
          animatedPart.textContent += action.char;
          const speed = Math.floor(Math.random() * 80) + 70;
          setTimeout(processAction, speed);
        } else if (action.type === "delete") {
          animatedPart.textContent = animatedPart.textContent.slice(0, -1);
          const speed = Math.floor(Math.random() * 40) + 30;
          setTimeout(processAction, speed);
        } else if (action.type === "pause") {
          setTimeout(processAction, action.ms);
        }
      } else {
        setTimeout(() => {
          animatedPart.classList.add("done");
        }, 2500);
      }
    };

    // Wait for 2 seconds (with the flashing cursor) before starting to type
    setTimeout(processAction, 2000);
  });

  // Character-level Heading Reveal (panel h2s only; hero/founder-note use typewriter)
  document.querySelectorAll("main h2").forEach((h) => {
    if (h.querySelector(".typewriter-cursor")) return;
    if (h.closest(".hero, .founder-note")) return;
    const text = h.textContent.trim();
    if (!text) return;

    h.textContent = "";
    h.classList.add("split-text");

    const sr = document.createElement("span");
    sr.className = "split-sr";
    sr.textContent = text;
    h.appendChild(sr);

    const visual = document.createElement("span");
    visual.setAttribute("aria-hidden", "true");

    let charIdx = 0;
    const words = text.split(" ");
    words.forEach((word, wi) => {
      const wordEl = document.createElement("span");
      wordEl.className = "split-word";
      [...word].forEach((ch) => {
        const charEl = document.createElement("span");
        charEl.className = "char";
        charEl.style.transitionDelay = `${charIdx * 0.028}s`;
        charEl.textContent = ch;
        wordEl.appendChild(charEl);
        charIdx++;
      });
      visual.appendChild(wordEl);
      if (wi < words.length - 1) {
        visual.appendChild(document.createTextNode(" "));
      }
    });
    h.appendChild(visual);
  });

  if (typeof IntersectionObserver === "function") {
    const splitObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("active");
            splitObserver.unobserve(e.target);
          }
        });
      },
      { threshold: 0.3 }
    );
    document
      .querySelectorAll(".split-text")
      .forEach((el) => splitObserver.observe(el));
  } else {
    document
      .querySelectorAll(".split-text")
      .forEach((el) => el.classList.add("active"));
  }

  // 14. Performance Metric: Load Time
  window.addEventListener("load", () => {
    // Delay the calculation slightly to ensure the browser has finished recording the load event
    setTimeout(() => {
      const loadTimeVal = document.getElementById("load-time-val");
      if (loadTimeVal) {
        // Use the Navigation Timing API
        const [navigation] = performance.getEntriesByType("navigation");
        if (navigation && navigation.duration > 0) {
          const loadTime = Math.round(navigation.duration);
          loadTimeVal.innerText = `${loadTime}ms`;
        } else {
          // Fallback for older browsers or if duration is not yet available
          const loadTime = Math.round(performance.now());
          loadTimeVal.innerText = `${loadTime}ms`;
        }
      }
    }, 0);
  });

  // 15. Sticky Footer Reveal (Curtain Effect)
  const footer = document.querySelector(".footer-panel");
  if (footer) {
    if (!document.querySelector(".curtain-wrapper")) {
      const mainWrapper = document.createElement("div");
      mainWrapper.classList.add("curtain-wrapper");

      // Wrap everything before the footer (but leave dialogs at body level so
      // they stay in the top layer / above the curtain stacking context)
      while (document.body.firstChild && document.body.firstChild !== footer) {
        const node = document.body.firstChild;
        if (node instanceof HTMLDialogElement) {
          document.body.appendChild(node);
          continue;
        }
        mainWrapper.appendChild(node);
      }
      document.body.insertBefore(mainWrapper, footer);

      // Styling the wrapper
      mainWrapper.style.backgroundColor = "var(--bg)";
      mainWrapper.style.position = "relative";
      mainWrapper.style.zIndex = "2";
      mainWrapper.style.minHeight = "100vh";
      mainWrapper.style.boxShadow = "0 20px 40px rgba(0,0,0,0.5)";

      // Styling the footer
      footer.style.position = "fixed";
      footer.style.bottom = "0";
      footer.style.left = "0";
      footer.style.width = "100%";
      footer.style.zIndex = "1";

      const updateFooterMargin = () => {
        mainWrapper.style.marginBottom = `${footer.offsetHeight}px`;
      };

      updateFooterMargin();
      if (window.ResizeObserver) {
        new ResizeObserver(updateFooterMargin).observe(footer);
        new ResizeObserver(updateFooterMargin).observe(mainWrapper);
      } else {
        window.addEventListener("resize", updateFooterMargin);
      }

      scrollTasks.push(() => {
        const docHeight = document.documentElement.scrollHeight;
        const scrollPos = window.scrollY + window.innerHeight;
        const footerHeight = footer.offsetHeight;

        const revealAmount = Math.max(
          0,
          scrollPos - (docHeight - footerHeight)
        );

        if (revealAmount > 0 && revealAmount < footerHeight) {
          const yPos = (footerHeight - revealAmount) * 0.4;
          footer.style.transform = `translateY(${yPos}px)`;
        } else if (revealAmount >= footerHeight) {
          footer.style.transform = `translateY(0)`;
        } else {
          footer.style.transform = `translateY(${footerHeight * 0.4}px)`;
        }
      });
      window.dispatchEvent(new Event("scroll"));
    }
  }

  // 16. Luminous Orbs Parallax Effect
  const updateParallax = () => {
    const scrolled = window.scrollY;
    // Standard background orbs
    document.querySelectorAll(".orb").forEach((orb, index) => {
      const speed =
        parseFloat(orb.getAttribute("data-speed")) || ((index % 3) + 1) * 0.1;
      const yPos = scrolled * speed;
      const rot = scrolled * speed * 0.5;
      orb.style.transform = `translateY(${yPos}px) rotate(${rot}deg)`;
    });
    // Exploding orbs (use CSS variable to not conflict with animation transform)
    document.querySelectorAll(".exploding-orb").forEach((orb) => {
      const speed = parseFloat(orb.getAttribute("data-speed")) || 0;
      const yPos = scrolled * speed;
      orb.style.setProperty("--parallax-y", `${yPos}px`);
    });
  };

  scrollTasks.push(updateParallax);

  // 17. Blow Up Bento Grid
  const blowUpBtn = document.getElementById("blowUpBtn");
  if (blowUpBtn) {
    blowUpBtn.addEventListener("click", () => {
      const grid = document.querySelector(".bento-grid");
      if (grid) {
        grid.classList.toggle("blown-up");
        if (grid.classList.contains("blown-up")) {
          blowUpBtn.textContent = "Collapse";

          // Generate exploding orbs
          const rect = blowUpBtn.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;

          for (let i = 0; i < 30; i++) {
            const orb = document.createElement("div");
            orb.classList.add("exploding-orb");

            // Random properties
            const size = Math.random() * 60 + 20;
            const tx = (Math.random() - 0.5) * window.innerWidth * 0.9;
            const ty = (Math.random() - 0.5) * window.innerHeight * 0.9;
            const scale = Math.random() * 1.5 + 0.5;
            const speed = (Math.random() - 0.5) * 0.4; // Parallax speed

            // Color randomization (Blue vs Orange)
            const isOrange = Math.random() > 0.5;
            orb.style.setProperty(
              "--orb-color",
              isOrange ? "#ff9500" : "var(--link)"
            );

            orb.style.width = `${size}px`;
            orb.style.height = `${size}px`;
            orb.style.left = `${centerX}px`;
            orb.style.top = `${centerY}px`;
            orb.setAttribute("data-speed", speed);
            orb.style.setProperty("--tx", `${tx}px`);
            orb.style.setProperty("--ty", `${ty}px`);
            orb.style.setProperty("--scale", scale);

            grid.parentNode.appendChild(orb);
          }
          // Initial parallax update
          updateParallax();
        } else {
          blowUpBtn.textContent = "Blow Up";

          // Implode existing orbs
          const activeOrbs = document.querySelectorAll(
            ".exploding-orb:not(.implode)"
          );
          activeOrbs.forEach((orb) => {
            orb.classList.add("implode");
            setTimeout(() => {
              orb.remove();
            }, 800); // Wait for implode animation to finish
          });
        }
      }
    });
  }

  // 18. Magnetic Elements
  const attachMagnetic = (el) => {
    let rect;
    el.addEventListener("mouseenter", () => {
      rect = el.getBoundingClientRect();
    });
    el.addEventListener("mousemove", (e) => {
      if (document.body.classList.contains("reduce-motion")) {
        el.style.transform = "translate(0px, 0px) scale(1)";
        return;
      }
      if (!rect) return;
      const x = (e.clientX - rect.left - rect.width / 2) * 0.4;
      const y = (e.clientY - rect.top - rect.height / 2) * 0.4;
      el.style.transform = `translate(${x}px, ${y}px) scale(1.05)`;
    });
    el.addEventListener("mouseleave", () => {
      el.style.transform = `translate(0px, 0px) scale(1)`;
      rect = null;
    });
  };
  document
    .querySelectorAll(".cta-button, .theme-toggle, .small-btn, .blow-up-btn")
    .forEach(attachMagnetic);

  // 19. Custom Reactive Cursor
  if (window.matchMedia("(pointer: fine)").matches) {
    const cursor = document.createElement("div");
    cursor.classList.add("custom-cursor");
    const follower = document.createElement("div");
    follower.classList.add("cursor-follower");

    // If the intro dialog is currently open, parent the cursor inside it so
    // it participates in the dialog's top-layer stacking context. Otherwise
    // a native cursor would need to be shown (since no z-index can compete
    // with top layer). When the dialog closes, move the cursor back to body.
    const openIntro = document.querySelector(".site-intro[open]");
    const cursorHome = openIntro || document.body;
    cursorHome.appendChild(cursor);
    cursorHome.appendChild(follower);

    if (openIntro) {
      openIntro.addEventListener(
        "close",
        () => {
          document.body.appendChild(cursor);
          document.body.appendChild(follower);
        },
        { once: true }
      );
    }

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let cursorX = mouseX;
    let cursorY = mouseY;

    window.addEventListener("mousemove", (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursor.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
    });

    const animateCursor = () => {
      if (!document.hidden) {
        cursorX += (mouseX - cursorX) * 0.15;
        cursorY += (mouseY - cursorY) * 0.15;
        follower.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0)`;
      }
      requestAnimationFrame(animateCursor);
    };
    animateCursor();

    const hoverTargets = document.querySelectorAll(
      "a, button, .card, .interactive-orb, .theme-toggle, .process-step, .blow-up-btn"
    );
    hoverTargets.forEach((el) => {
      el.addEventListener("mouseenter", () => {
        follower.classList.add("hover");
        cursor.classList.add("hover");
      });
      el.addEventListener("mouseleave", () => {
        follower.classList.remove("hover");
        cursor.classList.remove("hover");
      });
    });

    // Shifting to a smaller cursor for the local constellation

    // Hide custom cursor for the estimator panel
    const estimatorPanel = document.getElementById("estimator-panel");
    if (estimatorPanel) {
      estimatorPanel.addEventListener("mouseenter", () => {
        follower.classList.add("hidden");
        cursor.classList.add("hidden");
      });
      estimatorPanel.addEventListener("mouseleave", () => {
        follower.classList.remove("hidden");
        cursor.classList.remove("hidden");
      });
    }

    const localConstellation = document.getElementById("local-particle-canvas");
    if (localConstellation) {
      localConstellation.addEventListener("mouseenter", () => {
        follower.classList.add("small");
        cursor.classList.add("small");
      });
      localConstellation.addEventListener("mouseleave", () => {
        follower.classList.remove("small");
        cursor.classList.remove("small");
      });
    }
  }

  // 20. Interactive Particle Canvas
  const canvas = document.createElement("canvas");
  canvas.id = "particle-canvas";
  const curtainWrapper = document.querySelector(".curtain-wrapper");
  if (curtainWrapper) {
    curtainWrapper.insertBefore(canvas, curtainWrapper.firstChild);
  } else {
    document.body.insertBefore(canvas, document.body.firstChild);
  }
  const ctx = canvas.getContext("2d");
  let width, height, particles;

  const initParticles = () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    particles = [];
    const numParticles = Math.min(120, Math.floor(window.innerWidth / 18));
    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        radius: Math.random() * 1.5 + 1.5,
      });
    }
  };

  let globalMouseX = window.innerWidth / 2;
  let globalMouseY = window.innerHeight / 2;
  window.addEventListener("mousemove", (e) => {
    globalMouseX = e.clientX;
    globalMouseY = e.clientY;
  });

  window.addEventListener("click", (e) => {
    const clickX = e.clientX;
    const clickY = e.clientY;
    particles.forEach((p) => {
      const dx = p.x - clickX;
      const dy = p.y - clickY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 300) {
        // Explosion radius
        const angle = Math.atan2(dy, dx);
        const force = (300 - dist) * 0.15; // Force based on distance
        p.vx += Math.cos(angle) * force;
        p.vy += Math.sin(angle) * force;
      }
    });
  });

  const drawParticles = () => {
    if (document.hidden || document.body.classList.contains("reduce-motion")) {
      ctx.clearRect(0, 0, width, height);
      requestAnimationFrame(drawParticles);
      return;
    }

    ctx.clearRect(0, 0, width, height);
    const isLight =
      document.documentElement.getAttribute("data-theme") === "light";
    const baseColor = isLight ? "0, 102, 204" : "255, 149, 0";
    const lineColor = isLight ? "0,0,0" : "255,255,255";

    particles.forEach((p, i) => {
      p.x += p.vx;
      p.y += p.vy;

      // Apply friction to gracefully slow down particles after an explosion
      const currentSpeed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      if (currentSpeed > 1.5) {
        p.vx *= 0.94;
        p.vy *= 0.94;
      } else if (currentSpeed < 0.15 && currentSpeed > 0) {
        // Ensure they don't completely stop or become too sluggish
        p.vx *= 1.01;
        p.vy *= 1.01;
      }

      // Boundary checks to prevent them from getting stuck outside
      if (p.x < 0) {
        p.x = 0;
        p.vx *= -1;
      }
      if (p.x > width) {
        p.x = width;
        p.vx *= -1;
      }
      if (p.y < 0) {
        p.y = 0;
        p.vy *= -1;
      }
      if (p.y > height) {
        p.y = height;
        p.vy *= -1;
      }

      // Mouse repel
      const dx = globalMouseX - p.x;
      const dy = globalMouseY - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120) {
        p.x -= dx * 0.02;
        p.y -= dy * 0.02;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${baseColor}, 0.5)`;
      ctx.fill();

      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dx2 = p.x - p2.x;
        const dy2 = p.y - p2.y;
        const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
        if (dist2 < 120) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(${lineColor}, ${0.15 - dist2 / 800})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    });
    requestAnimationFrame(drawParticles);
  };

  initParticles();
  drawParticles();
  window.addEventListener("resize", initParticles);

  // Matrix Konami Code
  const konamiCode = [
    "ArrowUp",
    "ArrowUp",
    "ArrowDown",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "ArrowLeft",
    "ArrowRight",
    "b",
    "a",
  ];
  let konamiIndex = 0;
  window.addEventListener("keydown", (e) => {
    if (e.key === konamiCode[konamiIndex]) {
      konamiIndex++;
      if (konamiIndex === konamiCode.length) {
        konamiIndex = 0;
        document.documentElement.setAttribute("data-theme", "matrix");
        const matrixToggles = document.querySelectorAll(".theme-toggle");
        matrixToggles.forEach((t) => (t.innerText = "Matrix Mode"));
        // Sparkle effect
        for (let i = 0; i < 50; i++) {
          const spark = document.createElement("div");
          spark.style.position = "fixed";
          spark.style.width = "5px";
          spark.style.height = "5px";
          spark.style.background = "#00ff00";
          spark.style.left = Math.random() * window.innerWidth + "px";
          spark.style.top = Math.random() * window.innerHeight + "px";
          spark.style.zIndex = "99999";
          spark.style.transition = "all 1s ease";
          document.body.appendChild(spark);
          setTimeout(() => {
            spark.style.transform = "translateY(100px)";
            spark.style.opacity = "0";
          }, 50);
          setTimeout(() => spark.remove(), 1050);
        }
      }
    } else {
      konamiIndex = 0;
    }
  });

  // Reduced Motion Toggle
  const createA11yToggle = () => {
    const navActions = document.querySelectorAll(".nav-actions, .mobile-menu");
    navActions.forEach((container) => {
      const a11yBtn = document.createElement("button");
      a11yBtn.classList.add("theme-toggle");
      a11yBtn.style.marginLeft = "10px";

      const updateA11yText = () => {
        const isReduced = document.body.classList.contains("reduce-motion");
        a11yBtn.innerText = isReduced ? "Motion: Off" : "Motion: On";
      };

      // Check OS preference
      const prefersReduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      const savedMotion = localStorage.getItem("reduce-motion");

      if (savedMotion === "true" || (savedMotion === null && prefersReduced)) {
        document.body.classList.add("reduce-motion");
      }

      updateA11yText();
      syncLenisMotion();

      a11yBtn.addEventListener("click", () => {
        document.body.classList.toggle("reduce-motion");
        const isReduced = document.body.classList.contains("reduce-motion");
        localStorage.setItem("reduce-motion", String(isReduced));
        updateA11yText();
        syncLenisMotion();
        document.querySelectorAll(".theme-toggle").forEach((btn) => {
          if (btn.innerText.includes("Motion")) {
            btn.innerText = isReduced ? "Motion: Off" : "Motion: On";
          }
        });
      });
      container.appendChild(a11yBtn);
      attachMagnetic(a11yBtn);
    });
  };
  createA11yToggle();

  // Interactive Estimator Logic
  const estimatorPanel = document.getElementById("estimator-panel");
  if (estimatorPanel) {
    const checkboxes = estimatorPanel.querySelectorAll(
      "input[type='checkbox']"
    );
    const totalPriceEl = document.getElementById("est-total-price");
    const basePrice = 300;

    const animateValue = (obj, start, end, duration) => {
      let startTimestamp = null;
      const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.textContent = `$${Math.floor(progress * (end - start) + start)}`;
        if (progress < 1) {
          window.requestAnimationFrame(step);
        } else {
          obj.textContent = `$${end}`;
        }
      };
      window.requestAnimationFrame(step);
    };

    const calculateTotal = () => {
      let currentTotal = basePrice;
      checkboxes.forEach((cb) => {
        if (cb.checked) {
          currentTotal += parseInt(cb.value, 10);
        }
      });

      if (currentTotal > 5000) {
        currentTotal = 5000;
      }

      animateValue(
        totalPriceEl,
        parseInt(totalPriceEl.innerText.replace("$", ""), 10),
        currentTotal,
        500
      );
    };

    checkboxes.forEach((cb) => {
      cb.addEventListener("change", calculateTotal);
    });
  }
});
