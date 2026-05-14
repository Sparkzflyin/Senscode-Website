"use client";

import { useEffect, useRef, useState } from "react";

const FORMSPREE_ENDPOINT = "https://formspree.io/f/mreaewrb";

const STAGE_MESSAGES = [
  "Encoding…",
  "Routing to Yuma…",
  "Pinging Christian…",
  "Awaiting confirmation…",
];

type YumaStatus = "asleep" | "warming" | "active" | "lunch" | "winding" | "off";

function computeYuma(): { time: string; label: string; state: YumaStatus } {
  const timeFmt = new Intl.DateTimeFormat("en-US", {
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
  const now = new Date();
  const time = timeFmt.format(now);
  const hour = parseInt(hourFmt.format(now), 10);
  let state: YumaStatus;
  let label: string;
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
  return { time: `${time} in Yuma, AZ`, label, state };
}

function prefersReduced() {
  if (typeof window === "undefined") return false;
  return (
    document.body.classList.contains("reduce-motion") ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function ContactForm() {
  const formRef = useRef<HTMLFormElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const overlayRef = useRef<HTMLDialogElement | null>(null);
  const stageTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [projectType, setProjectType] = useState("");
  const [yuma, setYuma] = useState(() => ({
    time: "Yuma, AZ",
    label: "Checking the time…",
    state: "active" as YumaStatus,
  }));
  const [btnState, setBtnState] = useState<
    "" | "loading" | "success" | "error"
  >("");
  const [btnLabel, setBtnLabel] = useState("Send Message");
  const [overlayStage, setOverlayStage] = useState<
    "loading" | "success" | "error"
  >("loading");
  const [stageMessage, setStageMessage] = useState(STAGE_MESSAGES[0]);

  useEffect(() => {
    const update = () => setYuma(computeYuma());
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, []);

  const showPayment = projectType === "E-commerce";

  const growTextarea = () => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    const cap = Math.max(window.innerHeight * 0.6, 240);
    ta.style.height = Math.min(ta.scrollHeight, cap) + "px";
  };

  const startStageRotation = () => {
    let idx = 0;
    setStageMessage(STAGE_MESSAGES[0]);
    stageTimerRef.current = setInterval(() => {
      idx = (idx + 1) % STAGE_MESSAGES.length;
      setStageMessage(STAGE_MESSAGES[idx]);
    }, 900);
  };

  const stopStageRotation = () => {
    if (stageTimerRef.current) {
      clearInterval(stageTimerRef.current);
      stageTimerRef.current = null;
    }
  };

  const openOverlay = () => {
    setOverlayStage("loading");
    const dlg = overlayRef.current;
    if (!dlg) return;
    if (typeof dlg.showModal === "function") {
      dlg.showModal();
    } else {
      dlg.setAttribute("open", "");
    }
    startStageRotation();
  };

  const closeOverlay = () => {
    stopStageRotation();
    const dlg = overlayRef.current;
    if (!dlg) return;
    if (typeof dlg.close === "function") {
      dlg.close();
    } else {
      dlg.removeAttribute("open");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = formRef.current;
    if (!form) return;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    setBtnState("loading");
    setBtnLabel("Sending…");

    const reduced = prefersReduced();
    const visualMin = reduced ? 0 : 3000 + Math.random() * 3000;
    const start = Date.now();
    const data = new FormData(form);

    if (!reduced) openOverlay();

    // Persist to our own DB inbox in parallel with the Formspree email.
    // Best-effort: a failure here shouldn't break the user-facing submit.
    const leadPayload: Record<string, string> = {};
    data.forEach((value, key) => {
      if (typeof value === "string") leadPayload[key] = value;
    });
    void fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source: "contact",
        name: leadPayload.name || null,
        email: leadPayload.email || "",
        payload: leadPayload,
      }),
    }).catch((err) => {
      console.warn("[senscode] lead save failed:", err);
    });

    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: data,
      });

      const elapsed = Date.now() - start;
      if (elapsed < visualMin) {
        await new Promise((r) => setTimeout(r, visualMin - elapsed));
      }
      stopStageRotation();

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Submission failed");
      }

      setBtnState("success");
      setBtnLabel("✓ Message launched");
      form.reset();
      setProjectType("");
      if (textareaRef.current) textareaRef.current.style.height = "";
      if (!reduced) setOverlayStage("success");
      setTimeout(() => {
        setBtnState("");
        setBtnLabel("Send Message");
      }, 6000);
    } catch (err) {
      console.warn("[senscode] contact submit error:", err);
      const elapsed = Date.now() - start;
      if (elapsed < visualMin) {
        await new Promise((r) => setTimeout(r, visualMin - elapsed));
      }
      stopStageRotation();
      setBtnState("error");
      setBtnLabel("✕ Couldn't send — try again");
      if (!reduced) setOverlayStage("error");
      setTimeout(() => {
        setBtnState("");
        setBtnLabel("Send Message");
      }, 4000);
    }
  };

  return (
    <>
      <div className="contact-card reveal" id="contact-container">
        <header className="contact-header">
          <span className="tag">Get in Touch</span>
          <h2>Let&apos;s create together.</h2>
          <p>Send a message and I&apos;ll get back to you within 24 hours.</p>

          <div className="yuma-status" data-yuma-status aria-live="polite">
            <span
              className="yuma-status-dot"
              data-yuma-dot
              data-state={yuma.state}
              aria-hidden="true"
            ></span>
            <div className="yuma-status-text">
              <span className="yuma-status-time" data-yuma-time>
                {yuma.time}
              </span>
              <span className="yuma-status-label" data-yuma-label>
                {yuma.label}
              </span>
            </div>
          </div>
        </header>

        <form
          ref={formRef}
          id="contact-form"
          action={FORMSPREE_ENDPOINT}
          method="POST"
          onSubmit={handleSubmit}
        >
          <FloatingInput
            id="contact-name"
            name="name"
            label="Name / Business Name"
            type="text"
            maxLength={100}
            autoComplete="name"
            required
          />
          <FloatingInput
            id="contact-email"
            name="email"
            label="Email Address"
            type="email"
            maxLength={250}
            autoComplete="email"
            required
          />
          <FloatingInput
            id="contact-website"
            name="existing-website"
            label="Existing website URL (optional)"
            type="url"
            maxLength={250}
            autoComplete="url"
          />

          <div className="form-row">
            <FloatingSelect
              id="contact-project"
              name="project-type"
              label="Project type"
              value={projectType}
              onChange={(v) => setProjectType(v)}
              required
              options={[
                "New website",
                "Website redesign",
                "Landing page",
                "E-commerce",
                "Web app",
                "Other",
              ]}
            />
            <FloatingSelect
              id="contact-budget"
              name="budget"
              label="Budget range"
              required
              options={[
                "Under $1,000",
                "$1,000 – $3,000",
                "$3,000 – $5,000",
                "$5,000 – $10,000",
                "$10,000+",
                "Not sure yet",
              ]}
            />
            <FloatingSelect
              id="contact-timeline"
              name="timeline"
              label="Timeline"
              required
              options={["ASAP", "Within 1 month", "1–3+ months", "Flexible"]}
            />
          </div>

          <div
            className={`input-group input-floating conditional-field${showPayment ? " is-visible" : ""}`}
            data-show-when="E-commerce"
          >
            <FloatingSelect
              id="contact-payment"
              name="payment-platform"
              label="Preferred payment platform"
              disabled={!showPayment}
              bare
              options={[
                "Stripe",
                "PayPal",
                "Square",
                "Shopify Payments",
                "Other",
                "No preference",
              ]}
            />
          </div>

          <FloatingSelect
            id="contact-referral"
            name="referral-source"
            label="How did you hear about us? (optional)"
            options={[
              "Google / search",
              "Referral / word of mouth",
              "Instagram",
              "LinkedIn",
              "GitHub",
              "Other",
            ]}
          />

          <div className="input-group input-floating">
            <textarea
              ref={textareaRef}
              id="contact-message"
              name="message"
              maxLength={2500}
              placeholder=" "
              rows={5}
              required
              onInput={growTextarea}
            ></textarea>
            <label htmlFor="contact-message">Tell me about your project</label>
          </div>

          <div className="form-toggle-group">
            <input
              type="checkbox"
              id="veteran-status"
              name="veteran-discount-request"
              value="claimed"
            />
            <label htmlFor="veteran-status">
              I am a U.S. Veteran or Active-Duty Service Member.
            </label>
          </div>

          <button
            type="submit"
            id="submit-btn"
            className={`cta-button${btnState ? ` is-${btnState}` : ""}`}
          >
            {btnLabel}
          </button>
        </form>
      </div>

      <dialog
        ref={overlayRef}
        className="comms-overlay"
        id="comms-overlay"
        aria-label="Sending message"
      >
        <div
          className="comms-stage"
          data-comms-stage="loading"
          hidden={overlayStage !== "loading"}
        >
          <div className="comms-radar" aria-hidden="true">
            <div className="comms-radar-rings"></div>
            <div className="comms-radar-sweep"></div>
            <div className="comms-radar-blip"></div>
          </div>
          <div className="comms-status" data-comms-status>
            {stageMessage}
          </div>
          <div className="comms-detail">
            SECURE TRANSMISSION · SENSCODE COMMS
          </div>
        </div>

        <div
          className="comms-stage"
          data-comms-stage="success"
          hidden={overlayStage !== "success"}
        >
          <svg className="comms-check" viewBox="0 0 60 60" aria-hidden="true">
            <circle cx="30" cy="30" r="26"></circle>
            <path d="M 18 30 L 26 38 L 42 22"></path>
          </svg>
          <h2>Message Delivered.</h2>
          <p className="comms-sub">Standby for orders.</p>
          <p className="comms-humor">
            Christian&rsquo;s reading it now. Probably between cuss words and
            his third cup of coffee.
          </p>
          <button
            type="button"
            className="cta-button comms-close"
            onClick={closeOverlay}
          >
            Roger that
          </button>
        </div>

        <div
          className="comms-stage"
          data-comms-stage="error"
          hidden={overlayStage !== "error"}
        >
          <svg
            className="comms-error-icon"
            viewBox="0 0 60 60"
            aria-hidden="true"
          >
            <circle cx="30" cy="30" r="26"></circle>
            <path d="M 20 20 L 40 40 M 40 20 L 20 40"></path>
          </svg>
          <h2>Transmission Failed.</h2>
          <p className="comms-sub">Static on the line.</p>
          <p className="comms-humor">
            Something jammed the signal. Try again, or hit me direct:{" "}
            <a href="mailto:christian@senscode.com">christian@senscode.com</a>
          </p>
          <button
            type="button"
            className="cta-button comms-close"
            onClick={closeOverlay}
          >
            Try again
          </button>
        </div>
      </dialog>
    </>
  );
}

function FloatingInput({
  id,
  name,
  label,
  type,
  maxLength,
  autoComplete,
  required,
}: {
  id: string;
  name: string;
  label: string;
  type: string;
  maxLength?: number;
  autoComplete?: string;
  required?: boolean;
}) {
  const [touched, setTouched] = useState(false);
  const [valid, setValid] = useState<boolean | null>(null);

  return (
    <div
      className={`input-group input-floating${touched && valid === false ? " is-invalid" : ""}${touched && valid === true ? " is-valid" : ""}`}
    >
      <input
        id={id}
        name={name}
        type={type}
        maxLength={maxLength}
        autoComplete={autoComplete}
        required={required}
        placeholder=" "
        onBlur={(e) => {
          setTouched(true);
          if (!e.target.value) {
            setValid(null);
            return;
          }
          setValid(e.target.checkValidity());
        }}
        onInput={(e) => {
          if (!touched) return;
          const target = e.target as HTMLInputElement;
          if (!target.value) {
            setValid(null);
            return;
          }
          setValid(target.checkValidity());
        }}
      />
      <label htmlFor={id}>{label}</label>
    </div>
  );
}

function FloatingSelect({
  id,
  name,
  label,
  options,
  required,
  disabled,
  value,
  onChange,
  bare,
}: {
  id: string;
  name: string;
  label: string;
  options: string[];
  required?: boolean;
  disabled?: boolean;
  value?: string;
  onChange?: (v: string) => void;
  bare?: boolean;
}) {
  const [internal, setInternal] = useState("");
  const v = value ?? internal;
  const set = (next: string) => {
    if (onChange) onChange(next);
    else setInternal(next);
  };

  const inner = (
    <>
      <select
        id={id}
        name={name}
        value={v}
        required={required}
        disabled={disabled}
        onChange={(e) => set(e.target.value)}
      >
        <option value="" disabled hidden></option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      <label htmlFor={id}>{label}</label>
    </>
  );

  if (bare) return inner;
  return (
    <div className={`input-group input-floating${v ? " has-value" : ""}`}>
      {inner}
    </div>
  );
}
