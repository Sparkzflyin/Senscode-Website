document.addEventListener("DOMContentLoaded", () => {
  // 1. Page Transition Fade-In

  // 2. Theme Logic
  const toggles = document.querySelectorAll(".theme-toggle");
  const html = document.documentElement;

  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");
  const isMobile = window.matchMedia("(max-width: 768px)").matches;
  const systemTheme = prefersDark.matches ? "dark" : "light";

  // Respect localStorage preference universally, fallback to system theme.
  const currentTheme = localStorage.getItem("theme") || systemTheme;

  html.setAttribute("data-theme", currentTheme);
  toggles.forEach(toggle => {
    toggle.innerText = currentTheme === "dark" ? "Light Mode" : "Dark Mode";
  });

  prefersDark.addEventListener("change", (e) => {
    if (!localStorage.getItem("theme")) {
      const newSystemTheme = e.matches ? "dark" : "light";
      html.setAttribute("data-theme", newSystemTheme);
      toggles.forEach(toggle => {
        toggle.innerText = newSystemTheme === "dark" ? "Light Mode" : "Dark Mode";
      });
    }
  });

  toggles.forEach(toggle => {
    toggle.addEventListener("click", () => {
      const nextTheme = html.getAttribute("data-theme") === "dark" ? "light" : "dark";
      html.setAttribute("data-theme", nextTheme);
      localStorage.setItem("theme", nextTheme);
      toggles.forEach(t => {
        t.innerText = nextTheme === "dark" ? "Light Mode" : "Dark Mode";
      });
    });
  });

  // 3. Smooth Fade-Out for Internal Links

  // 4. Scroll Reveal & Story Text
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

  document
    .querySelectorAll(".reveal, .story-text")
    .forEach((el) => observer.observe(el));

  // 5. Advanced Card Tilt & Spotlight Effect
  document
    .querySelectorAll(".glass-panel, .card, .process-step")
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
    btt.addEventListener("click", () =>
      window.scrollTo({ top: 0, behavior: "smooth" }),
    );
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
  let ticking = false;

  window.addEventListener("scroll", () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
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
        ticking = false;
      });
      ticking = true;
    }
  });

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
      } catch (error) {
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
    ".hero-content h1, .founder-note h2",
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

    // Always introduce a typo if there are multiple words
    if (text.trim().indexOf(" ") !== -1) {
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

    let i = 0;
    function processAction() {
      if (i < actions.length) {
        const action = actions[i];
        i++;

        if (action.type === "type") {
          animatedPart.textContent += action.char;
          const speed = Math.floor(Math.random() * 80) + 70; // Slower typing
          setTimeout(processAction, speed);
        } else if (action.type === "delete") {
          animatedPart.textContent = animatedPart.textContent.slice(0, -1);
          const speed = Math.floor(Math.random() * 40) + 30; // Fast deletion
          setTimeout(processAction, speed);
        } else if (action.type === "pause") {
          setTimeout(processAction, action.ms);
        }
      } else {
        setTimeout(() => {
          animatedPart.classList.add("done");
        }, 2500);
      }
    }

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
});
