document.addEventListener("DOMContentLoaded", () => {
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
      { threshold: 0.2 },
    );
    revealEls.forEach((el) => observer.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("active"));
  }

  // 5. Advanced Card Tilt & Spotlight Effect
  document
    .querySelectorAll(
      ".glass-panel:not(.no-spotlight), .card:not(.no-spotlight), .process-step:not(.no-spotlight)",
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
    hamburger.addEventListener("click", () => {
      hamburger.classList.toggle("active");
      mobileMenu.classList.toggle("active");
      document.body.style.overflow = mobileMenu.classList.contains("active")
        ? "hidden"
        : "";
    });

    document.querySelectorAll(".mobile-menu a").forEach((link) => {
      link.addEventListener("click", () => {
        hamburger.classList.remove("active");
        mobileMenu.classList.remove("active");
        document.body.style.overflow = "";
      });
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
    { passive: true },
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
  const currentPage = currentPath.split("/").pop() || "index.html";

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
      } catch {
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
    ".hero-content h1, .founder-note h1, .founder-note h2",
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

    let actions = [];

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
          secondWord.length,
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
      for (let c of firstWordAndSpace) actions.push({ type: "type", char: c });
      for (let c of typoWord) actions.push({ type: "type", char: c });
      actions.push({ type: "pause", ms: 400 });
      for (let i = 0; i < typoWord.length; i++)
        actions.push({ type: "delete" });
      actions.push({ type: "pause", ms: 200 });
      for (let c of secondWord + restOfText)
        actions.push({ type: "type", char: c });
    } else {
      for (let c of text) actions.push({ type: "type", char: c });
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

      // Wrap everything before the footer
      while (document.body.firstChild && document.body.firstChild !== footer) {
        mainWrapper.appendChild(document.body.firstChild);
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
          scrollPos - (docHeight - footerHeight),
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
              isOrange ? "#ff9500" : "var(--link)",
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
            ".exploding-orb:not(.implode)",
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
    document.body.appendChild(cursor);
    document.body.appendChild(follower);

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
      "a, button, .card, .interactive-orb, .theme-toggle, .process-step, .blow-up-btn",
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
        "(prefers-reduced-motion: reduce)",
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
      "input[type='checkbox']",
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
        500,
      );
    };

    checkboxes.forEach((cb) => {
      cb.addEventListener("change", calculateTotal);
    });
  }
});
