"use strict";

// Contact-page enhancements: floating labels, inline validation, live Yuma
// status widget, conditional fields, auto-growing textarea, AJAX submit
// with morphing success/error button. Self-contained, only loaded on
// contact.html. Honors reduce-motion where animation-bound.

(() => {
  const form = document.getElementById("contact-form");
  if (!form) return;

  const reduced = () =>
    document.body.classList.contains("reduce-motion") ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---- Floating label state for selects --------------------------------
  // <select> can't use :placeholder-shown; track value via JS instead so
  // CSS can react to .has-value with the same float-up animation.
  document.querySelectorAll(".input-floating select").forEach((sel) => {
    const sync = () => {
      sel.parentElement.classList.toggle("has-value", !!sel.value);
    };
    sync();
    sel.addEventListener("change", sync);
  });

  // ---- Inline validation ----------------------------------------------
  // Light-touch: validate on blur (not on every keystroke — that's hostile),
  // also re-validate on input once an error has been shown so the user gets
  // immediate positive feedback as they fix it.
  document
    .querySelectorAll(".input-floating input, .input-floating textarea")
    .forEach((field) => {
      const wrap = field.parentElement;
      const validate = () => {
        if (!field.value) {
          wrap.classList.remove("is-valid", "is-invalid");
          return;
        }
        if (field.checkValidity()) {
          wrap.classList.add("is-valid");
          wrap.classList.remove("is-invalid");
        } else {
          wrap.classList.add("is-invalid");
          wrap.classList.remove("is-valid");
        }
      };
      field.addEventListener("blur", validate);
      field.addEventListener("input", () => {
        if (wrap.classList.contains("is-invalid")) validate();
        else if (wrap.classList.contains("is-valid")) validate();
      });
    });

  // ---- Auto-grow textarea ---------------------------------------------
  const textarea = form.querySelector("textarea");
  if (textarea) {
    const grow = () => {
      textarea.style.height = "auto";
      // 6rem ≈ original 5-row height; cap at 60vh so a paste-bomb doesn't
      // push the submit button off-screen.
      const cap = Math.max(window.innerHeight * 0.6, 240);
      textarea.style.height = Math.min(textarea.scrollHeight, cap) + "px";
    };
    textarea.addEventListener("input", grow);
    // Run once for browsers that pre-fill via autocomplete on load.
    setTimeout(grow, 0);
  }

  // ---- Conditional field (E-commerce → payment platform) -------------
  const projectType = form.querySelector('select[name="project-type"]');
  const paymentField = form.querySelector("[data-show-when]");
  if (projectType && paymentField) {
    const targetValue = paymentField.dataset.showWhen;
    const sync = () => {
      const show = projectType.value === targetValue;
      paymentField.classList.toggle("is-visible", show);
      const inner = paymentField.querySelector("select, input, textarea");
      if (inner) {
        inner.disabled = !show;
        if (!show) inner.value = "";
      }
    };
    sync();
    projectType.addEventListener("change", sync);
  }

  // ---- Live Yuma local time + status widget ---------------------------
  // Arizona stays on MST year-round (no DST except Navajo Nation), so the
  // IANA zone "America/Phoenix" gives us the right local time regardless
  // of the visitor's timezone.
  const statusEl = document.querySelector("[data-yuma-status]");
  if (statusEl) {
    const timeEl = statusEl.querySelector("[data-yuma-time]");
    const labelEl = statusEl.querySelector("[data-yuma-label]");
    const dotEl = statusEl.querySelector("[data-yuma-dot]");

    const compute = () => {
      const fmt = new Intl.DateTimeFormat("en-US", {
        timeZone: "America/Phoenix",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
      const hourFmt = new Intl.DateTimeFormat("en-US", {
        timeZone: "America/Phoenix",
        hour: "numeric",
        hour12: false,
      });
      const time = fmt.format(new Date());
      const hour = parseInt(hourFmt.format(new Date()), 10);
      let state, label;
      if (hour >= 0 && hour < 7) {
        state = "asleep";
        label = "Asleep — replies first thing in the morning";
      } else if (hour < 9) {
        state = "warming";
        label = "Caffeinating — quick replies incoming";
      } else if (hour < 12) {
        state = "active";
        label = "At the keyboard — fast reply likely";
      } else if (hour < 13) {
        state = "lunch";
        label = "Grabbing chow — back in a bit";
      } else if (hour < 17) {
        state = "active";
        label = "At the keyboard — fast reply likely";
      } else if (hour < 19) {
        state = "winding";
        label = "Wrapping up the day — reply tonight or tomorrow";
      } else if (hour < 23) {
        state = "off";
        label = "Off duty — reply in the morning";
      } else {
        state = "asleep";
        label = "Asleep — replies first thing in the morning";
      }
      if (timeEl) timeEl.textContent = time + " in Yuma, AZ";
      if (labelEl) labelEl.textContent = label;
      if (dotEl) dotEl.dataset.state = state;
    };
    compute();
    // Refresh every minute so the clock stays accurate during long sessions.
    setInterval(compute, 60_000);
  }

  // ---- AJAX submit + button morph -------------------------------------
  const submitBtn = document.getElementById("submit-btn");
  const originalLabel = submitBtn ? submitBtn.textContent.trim() : "Send";

  function setBtnState(state, message) {
    if (!submitBtn) return;
    submitBtn.classList.remove("is-loading", "is-success", "is-error");
    if (state) submitBtn.classList.add("is-" + state);
    if (message != null) submitBtn.textContent = message;
  }

  // ---- Comms overlay (dramatic loading + success/error modal) ---------
  // Built as a native <dialog> so we get free focus-trap, ESC handling,
  // and ::backdrop styling. Three internal stages: loading / success /
  // error, swapped via [hidden]. Fully on-brand: radar sweep + monospace
  // status text + military-comms vocabulary.
  const overlay = document.createElement("dialog");
  overlay.className = "comms-overlay";
  overlay.id = "comms-overlay";
  overlay.setAttribute("aria-label", "Sending message");
  overlay.innerHTML = `
    <div class="comms-stage" data-comms-stage="loading">
      <div class="comms-radar" aria-hidden="true">
        <div class="comms-radar-rings"></div>
        <div class="comms-radar-sweep"></div>
        <div class="comms-radar-blip"></div>
      </div>
      <div class="comms-status" data-comms-status>Encoding…</div>
      <div class="comms-detail">SECURE TRANSMISSION · SENSCODE COMMS</div>
    </div>
    <div class="comms-stage" data-comms-stage="success" hidden>
      <svg class="comms-check" viewBox="0 0 60 60" aria-hidden="true">
        <circle cx="30" cy="30" r="26"></circle>
        <path d="M 18 30 L 26 38 L 42 22"></path>
      </svg>
      <h2>Message Delivered.</h2>
      <p class="comms-sub">Standby for orders.</p>
      <p class="comms-humor">
        Christian&rsquo;s reading it now. Probably between cuss words and
        his third cup of coffee.
      </p>
      <button type="button" class="cta-button comms-close" data-comms-close>
        Roger that
      </button>
    </div>
    <div class="comms-stage" data-comms-stage="error" hidden>
      <svg class="comms-error-icon" viewBox="0 0 60 60" aria-hidden="true">
        <circle cx="30" cy="30" r="26"></circle>
        <path d="M 20 20 L 40 40 M 40 20 L 20 40"></path>
      </svg>
      <h2>Transmission Failed.</h2>
      <p class="comms-sub">Static on the line.</p>
      <p class="comms-humor">
        Something jammed the signal. Try again, or hit me direct:
        <a href="mailto:christian@senscode.com">christian@senscode.com</a>
      </p>
      <button type="button" class="cta-button comms-close" data-comms-close>
        Try again
      </button>
    </div>
  `;
  document.body.appendChild(overlay);

  const overlayStatus = overlay.querySelector("[data-comms-status]");
  const stages = [
    "Encoding…",
    "Routing to Yuma…",
    "Pinging Christian…",
    "Awaiting confirmation…",
  ];

  let stageIdx = 0;
  let stageInterval = null;
  function startStageRotation() {
    stageIdx = 0;
    overlayStatus.textContent = stages[0];
    stageInterval = setInterval(() => {
      stageIdx = (stageIdx + 1) % stages.length;
      overlayStatus.textContent = stages[stageIdx];
    }, 900);
  }
  function stopStageRotation() {
    if (stageInterval) {
      clearInterval(stageInterval);
      stageInterval = null;
    }
  }

  function showOverlayStage(state) {
    overlay.querySelectorAll("[data-comms-stage]").forEach((el) => {
      el.hidden = el.dataset.commsStage !== state;
    });
  }

  function openOverlay() {
    showOverlayStage("loading");
    if (typeof overlay.showModal === "function") {
      overlay.showModal();
    } else {
      overlay.setAttribute("open", "");
    }
    startStageRotation();
  }

  function closeOverlay() {
    stopStageRotation();
    if (typeof overlay.close === "function") {
      overlay.close();
    } else {
      overlay.removeAttribute("open");
    }
  }

  overlay.addEventListener("click", (e) => {
    if (e.target.closest("[data-comms-close]")) {
      closeOverlay();
    }
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Native validation first — surfaces any browser-level errors, plus
    // keeps the form usable if JS fetch ends up unsupported somehow.
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    setBtnState("loading", "Sending…");

    // Random 3–6s dramatic loading window. Reduce-motion users get an
    // instant transition — no wait, no radar.
    const visualMin = reduced() ? 0 : 3000 + Math.random() * 3000;
    const start = Date.now();
    const data = new FormData(form);

    if (!reduced()) openOverlay();

    try {
      const res = await fetch(form.action, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: data,
      });

      // Hold the visual until the dramatic minimum has elapsed. Real
      // network latency past that gets respected naturally.
      const elapsed = Date.now() - start;
      if (elapsed < visualMin) {
        await new Promise((r) => setTimeout(r, visualMin - elapsed));
      }

      stopStageRotation();

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Submission failed");
      }

      setBtnState("success", "✓ Message launched");
      form.reset();
      form.querySelectorAll(".input-floating").forEach((wrap) => {
        wrap.classList.remove("has-value", "is-valid", "is-invalid");
      });
      if (textarea) textarea.style.height = "";
      if (reduced()) {
        // No overlay path — just a quick form-level toast via the button.
      } else {
        showOverlayStage("success");
      }
      setTimeout(() => setBtnState(null, originalLabel), 6000);
    } catch (err) {
      console.warn("[senscode] contact submit error:", err);
      const elapsed = Date.now() - start;
      if (elapsed < visualMin) {
        await new Promise((r) => setTimeout(r, visualMin - elapsed));
      }
      stopStageRotation();
      setBtnState("error", "✕ Couldn't send — try again");
      if (reduced()) {
        // No overlay path.
      } else {
        showOverlayStage("error");
      }
      setTimeout(() => setBtnState(null, originalLabel), 4000);
    }
  });
})();
