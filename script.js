document.addEventListener("DOMContentLoaded", () => {
  // Theme
  const toggle = document.getElementById("theme-toggle");
  const html = document.documentElement;
  html.setAttribute("data-theme", localStorage.getItem("theme") || "dark");
  toggle.addEventListener("click", () => {
    const next = html.getAttribute("data-theme") === "dark" ? "light" : "dark";
    html.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  });

  // Mobile Menu
  const hamburger = document.getElementById("hamburger");
  const mobileMenu = document.getElementById("mobile-menu");
  hamburger.addEventListener("click", () => {
    mobileMenu.classList.toggle("active");
    document.body.style.overflow = mobileMenu.classList.contains("active")
      ? "hidden"
      : "auto";
  });

  // Scroll Reveal
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) e.target.classList.add("active");
      });
    },
    { threshold: 0.1 },
  );
  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

  // Back to Top
  const btt = document.getElementById("back-to-top");
  window.addEventListener("scroll", () =>
    btt.classList.toggle("visible", window.scrollY > 400),
  );
  btt.addEventListener("click", () =>
    window.scrollTo({ top: 0, behavior: "smooth" }),
  );

  // Visit Counter
  const display = document.getElementById("count-display");
  let count = parseInt(localStorage.getItem("vCount")) || 15420;
  const update = () => {
    count += Math.floor(Math.random() * 2);
    display.innerText = count.toLocaleString() + " Live Views";
    localStorage.setItem("vCount", count);
  };
  setInterval(update, 5000);
  update();

  // Contact Form Flow
  const contactForm = document.getElementById("contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = document.getElementById("submit-btn");
      btn.innerText = "Sending...";
      const response = await fetch(contactForm.action, {
        method: "POST",
        body: new FormData(contactForm),
        headers: { Accept: "application/json" },
      });
      if (response.ok) {
        document.getElementById("contact-container").innerHTML =
          `<h2>✓ Sent</h2><p>Talk soon.</p>`;
      }
    });
  }
});
