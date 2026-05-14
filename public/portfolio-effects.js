// Idempotency guard — Next loads this script once per session via App Router.
if (!window.__senscodePortfolioRan) {
window.__senscodePortfolioRan = true;

const runPortfolioInit = () => {
  // Orb interaction
  const labOrb = document.getElementById("lab-orb");
  if (labOrb) {
    labOrb.addEventListener("click", () => {
      labOrb.classList.add("bounce-glow");
      setTimeout(() => {
        labOrb.classList.remove("bounce-glow");
      }, 600);
    });
  }

  // Bento Typewriter — removed. The original wiped #bento-typewriter-p's
  // textContent and injected spans, which crashes React's reconciler when
  // the page later unmounts (route change). Bring back as a dedicated
  // BentoTypewriter React component if you want the effect.

  // Localized Particle Canvas Logic
  const localCanvas = document.getElementById("local-particle-canvas");
  if (localCanvas) {
    const ctx = localCanvas.getContext("2d");
    let width, height;
    let particles = [];

    const initLocalParticles = () => {
      const parent = localCanvas.parentElement;
      if (parent.clientWidth === 0) {
        setTimeout(initLocalParticles, 100);
        return;
      }

      width = localCanvas.width = parent.clientWidth;
      height = localCanvas.height = parent.clientHeight;
      particles = [];

      // Pack it with dots
      const numParticles = 150;
      for (let i = 0; i < numParticles; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 1.5,
          vy: (Math.random() - 0.5) * 1.5,
          radius: Math.random() * 2 + 1,
        });
      }
    };

    let localMouseX = -1000;
    let localMouseY = -1000;

    localCanvas.addEventListener("mousemove", (e) => {
      const rect = localCanvas.getBoundingClientRect();
      localMouseX = e.clientX - rect.left;
      localMouseY = e.clientY - rect.top;
    });

    localCanvas.addEventListener("mouseleave", () => {
      localMouseX = -1000;
      localMouseY = -1000;
    });

    // Mobile touch events
    localCanvas.addEventListener(
      "touchmove",
      (e) => {
        e.preventDefault();
        if (e.touches.length > 0) {
          const rect = localCanvas.getBoundingClientRect();
          localMouseX = e.touches[0].clientX - rect.left;
          localMouseY = e.touches[0].clientY - rect.top;
        }
      },
      { passive: false }
    );

    localCanvas.addEventListener("touchend", () => {
      localMouseX = -1000;
      localMouseY = -1000;
    });
    localCanvas.addEventListener("touchcancel", () => {
      localMouseX = -1000;
      localMouseY = -1000;
    });

    const explodeParticles = (x, y) => {
      if (particles) {
        particles.forEach((p) => {
          const dx = p.x - x;
          const dy = p.y - y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 200) {
            const angle = Math.atan2(dy, dx);
            const force = (200 - dist) * 0.15;
            p.vx += Math.cos(angle) * force;
            p.vy += Math.sin(angle) * force;
          }
        });
      }
    };

    localCanvas.addEventListener("click", (e) => {
      const rect = localCanvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      explodeParticles(clickX, clickY);
    });

    localCanvas.addEventListener("touchstart", (e) => {
      if (e.touches.length > 0) {
        const rect = localCanvas.getBoundingClientRect();
        const touchX = e.touches[0].clientX - rect.left;
        const touchY = e.touches[0].clientY - rect.top;
        explodeParticles(touchX, touchY);
      }
    });

    const drawLocalParticles = () => {
      if (document.hidden) {
        requestAnimationFrame(drawLocalParticles);
        return;
      }
      ctx.clearRect(0, 0, width, height);
      const isLight =
        document.documentElement.getAttribute("data-theme") === "light";
      const baseColor = isLight ? "0, 102, 204" : "255, 149, 0";
      const lineColor = isLight ? "0,0,0" : "255,255,255";

      if (particles) {
        particles.forEach((p, i) => {
          p.x += p.vx;
          p.y += p.vy;

          const currentSpeed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
          if (currentSpeed > 2.0) {
            p.vx *= 0.92;
            p.vy *= 0.92;
          } else if (currentSpeed < 0.2 && currentSpeed > 0) {
            p.vx *= 1.05;
            p.vy *= 1.05;
          }

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

          const dx = localMouseX - p.x;
          const dy = localMouseY - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 80) {
            p.x -= dx * 0.05;
            p.y -= dy * 0.05;
          }

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${baseColor}, 0.8)`;
          ctx.fill();

          for (let j = i + 1; j < particles.length; j++) {
            const p2 = particles[j];
            const dx2 = p.x - p2.x;
            const dy2 = p.y - p2.y;
            const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
            if (dist2 < 80) {
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.strokeStyle = `rgba(${lineColor}, ${0.2 - dist2 / 400})`;
              ctx.lineWidth = 0.8;
              ctx.stroke();
            }
          }
        });
      }
      requestAnimationFrame(drawLocalParticles);
    };

    initLocalParticles();

    const resizeObserver = new ResizeObserver(() => {
      if (localCanvas.parentElement.clientWidth > 0) {
        initLocalParticles();
      }
    });
    resizeObserver.observe(localCanvas.parentElement);

    drawLocalParticles();
  }
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", runPortfolioInit);
} else {
  runPortfolioInit();
}

} // end idempotency guard
