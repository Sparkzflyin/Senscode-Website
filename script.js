document.addEventListener("DOMContentLoaded", () => {
  // 1. Page Transition Fade-In
  const transitionLayer = document.getElementById("page-transition");
  if (transitionLayer) {
    setTimeout(() => {
      transitionLayer.style.opacity = "0";
    }, 50);
  }

  // 2. Theme Logic
  const toggle = document.getElementById("theme-toggle");
  const html = document.documentElement;

  if (toggle) {
    const currentTheme = localStorage.getItem("theme") || "dark";
    html.setAttribute("data-theme", currentTheme);
    toggle.innerText = currentTheme === "dark" ? "Light Mode" : "Dark Mode";

    toggle.addEventListener("click", () => {
      const nextTheme = html.getAttribute("data-theme") === "dark" ? "light" : "dark";
      html.setAttribute("data-theme", nextTheme);
      localStorage.setItem("theme", nextTheme);
      toggle.innerText = nextTheme === "dark" ? "Light Mode" : "Dark Mode";
    });
  }

  // 3. Smooth Fade-Out for Internal Links
  document.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", (e) => {
      const isInternal = link.hostname === window.location.hostname || !link.hostname;
      if (isInternal && !link.hash && !link.target) {
        e.preventDefault();
        const destination = link.href;
        if (transitionLayer) {
          transitionLayer.style.opacity = "1";
        }
        setTimeout(() => {
          window.location.href = destination;
        }, 600);
      }
    });
  });

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

  document.querySelectorAll(".reveal, .story-text").forEach((el) => observer.observe(el));

  // 5. Spotlight Effect
  document.querySelectorAll(".glass-panel, .card").forEach((card) => {
    if (!card.querySelector('.spotlight')) {
      const spotlight = document.createElement("div");
      spotlight.classList.add("spotlight");
      card.appendChild(spotlight);
    }

    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--x", `${e.clientX - rect.left}px`);
      card.style.setProperty("--y", `${e.clientY - rect.top}px`);
    });
  });

  // 6. Back to Top
  const btt = document.getElementById("back-to-top");
  if (btt) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 400) {
        btt.classList.add("visible");
      } else {
        btt.classList.remove("visible");
      }
    });
    btt.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  // 7. Mobile Menu Toggle
  const hamburger = document.getElementById("hamburger");
  const mobileMenu = document.getElementById("mobile-menu");

  if (hamburger && mobileMenu) {
    hamburger.addEventListener("click", () => {
      hamburger.classList.toggle("active");
      mobileMenu.classList.toggle("active");
      document.body.style.overflow = mobileMenu.classList.contains("active") ? "hidden" : "auto";
    });

    document.querySelectorAll(".mobile-menu a").forEach((link) => {
      link.addEventListener("click", () => {
        hamburger.classList.remove("active");
        mobileMenu.classList.remove("active");
        document.body.style.overflow = "auto";
      });
    });
  }

  // 8. Mobile Navbar Auto-Hide on Scroll
  let lastScrollY = window.scrollY;
  const navbar = document.querySelector(".navbar");

  if (navbar) {
    window.addEventListener("scroll", () => {
      if (window.innerWidth <= 768) {
        if (lastScrollY < window.scrollY && window.scrollY > 50) {
          navbar.classList.add("navbar--hidden");
        } else {
          navbar.classList.remove("navbar--hidden");
        }
      }
      lastScrollY = window.scrollY;
    });
  }
});
