document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("theme-toggle");
  const html = document.documentElement;

  // 1. Theme Initial Load
  const savedTheme = localStorage.getItem("theme") || "dark";
  html.setAttribute("data-theme", savedTheme);
  toggle.innerText = savedTheme === "dark" ? "Light Mode" : "Dark Mode";

  toggle.addEventListener("click", () => {
    const current = html.getAttribute("data-theme");
    const next = current === "dark" ? "light" : "dark";
    html.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
    toggle.innerText = next === "dark" ? "Light Mode" : "Dark Mode";
  });

  // 2. Intersection Observer for Story & Reveals
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

  // 3. Spotlight Movement
  document.querySelectorAll(".glass-panel, .card").forEach((card) => {
    const spotlight = document.createElement("div");
    spotlight.classList.add("spotlight");
    card.appendChild(spotlight);

    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--x", `${e.clientX - rect.left}px`);
      card.style.setProperty("--y", `${e.clientY - rect.top}px`);
    });
  });

  // 5. Back to Top
  const btt = document.getElementById("back-to-top");
  window.addEventListener(
    "scroll",
    () => (btt.style.opacity = window.scrollY > 400 ? "1" : "0"),
  );
  btt.onclick = () => window.scrollTo({ top: 0, behavior: "smooth" });
});
document.addEventListener("DOMContentLoaded", () => {
  // 1. Page Transition Fade-In
  const transitionLayer = document.getElementById("page-transition");
  if (transitionLayer) {
    // Small delay to ensure the browser has started rendering
    setTimeout(() => {
      transitionLayer.style.opacity = "0";
    }, 50);
  }

  // 2. Theme Logic & Button Text Fix
  const toggle = document.getElementById("theme-toggle");
  const html = document.documentElement;

  // Set initial button text based on current theme
  const currentTheme = localStorage.getItem("theme") || "dark";
  html.setAttribute("data-theme", currentTheme);
  toggle.innerText = currentTheme === "dark" ? "Light Mode" : "Dark Mode";

  toggle.addEventListener("click", () => {
    const next = html.getAttribute("data-theme") === "dark" ? "light" : "dark";
    html.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
    // Update the button text so the user knows what the NEXT click does
    toggle.innerText = next === "dark" ? "Light Mode" : "Dark Mode";
  });

  // 3. Smooth Fade-Out for Internal Links
  document.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", (e) => {
      // Check if the link is internal (not Instagram/LinkedIn)
      const isInternal =
        link.hostname === window.location.hostname || !link.hostname;

      if (isInternal && !link.hash && !link.target) {
        e.preventDefault();
        const destination = link.href;

        if (transitionLayer) {
          transitionLayer.style.opacity = "1";
        }

        // Wait for the CSS transition (0.8s) then redirect
        setTimeout(() => {
          window.location.href = destination;
        }, 600);
      }
    });
  });

  // 4. Scroll Reveal (Your existing logic)
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

  // 5. Spotlight effect (Your existing logic)
  document.querySelectorAll(".glass-panel").forEach((card) => {
    const spotlight = document.createElement("div");
    spotlight.classList.add("spotlight");
    card.appendChild(spotlight);

    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--x", `${e.clientX - rect.left}px`);
      card.style.setProperty("--y", `${e.clientY - rect.top}px`);
    });
  });
});
// 1. Theme Logic
const toggle = document.getElementById("theme-toggle");
const html = document.documentElement;

// Initialize theme from storage or default to dark
const savedTheme = localStorage.getItem("theme") || "dark";
html.setAttribute("data-theme", savedTheme);

// Function to update button text/icon state
const updateButtonText = (theme) => {
  // This assumes you want to show the name of the mode you will SWITCH TO
  toggle.innerText = theme === "dark" ? "Light Mode" : "Dark Mode";
};

updateButtonText(savedTheme);

toggle.addEventListener("click", () => {
  const currentTheme = html.getAttribute("data-theme");
  const nextTheme = currentTheme === "dark" ? "light" : "dark";

  html.setAttribute("data-theme", nextTheme);
  localStorage.setItem("theme", nextTheme);
  updateButtonText(nextTheme);
});
