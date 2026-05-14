"use client";

import { createElement, useEffect, useState, type CSSProperties } from "react";

type Action =
  | { type: "type"; char: string }
  | { type: "delete" }
  | { type: "pause"; ms: number };

function makeTypoWord(word: string): string {
  // Transpose chars 2 and 3 — feels like a real typo. Two-char words swap;
  // single-char gets an extra 'x' so the correction still has something to do.
  if (word.length >= 3) {
    return word.charAt(0) + word.charAt(2) + word.charAt(1) + word.slice(3);
  }
  if (word.length === 2) return word.charAt(1) + word.charAt(0);
  return word + "x";
}

function buildPlainActions(text: string): Action[] {
  return [...text].map((char) => ({ type: "type", char }));
}

function buildTypoActions(
  text: string,
  typoTarget: number,
  typoOverride?: string,
): Action[] {
  const words = text.trim().split(" ");
  if (typoTarget < 0 || typoTarget >= words.length) {
    return buildPlainActions(text);
  }

  const beforeWords = words.slice(0, typoTarget);
  const beforePart =
    beforeWords.length > 0 ? beforeWords.join(" ") + " " : "";
  const targetWord = words[typoTarget];
  const restWords = words.slice(typoTarget + 1);
  const restPart = restWords.length > 0 ? " " + restWords.join(" ") : "";
  const typoWord = typoOverride || makeTypoWord(targetWord);

  const actions: Action[] = [];
  for (const c of beforePart) actions.push({ type: "type", char: c });
  for (const c of typoWord) actions.push({ type: "type", char: c });
  actions.push({ type: "pause", ms: 400 });
  for (let i = 0; i < typoWord.length; i++) actions.push({ type: "delete" });
  actions.push({ type: "pause", ms: 200 });
  for (const c of targetWord + restPart) actions.push({ type: "type", char: c });
  return actions;
}

const SR_ONLY_STYLE: CSSProperties = {
  position: "absolute",
  width: "1px",
  height: "1px",
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: 0,
};

type Speed = { min: number; range: number };

type Props = {
  text: string;
  as?: "h1" | "h2" | "h3" | "p";
  typo?: boolean;
  typoTarget?: number;
  typoOverride?: string;
  initialDelay?: number;
  typeSpeed?: Speed;
  deleteSpeed?: Speed;
  className?: string;
  style?: CSSProperties;
  id?: string;
};

const DEFAULT_TYPE_SPEED: Speed = { min: 70, range: 80 };
const DEFAULT_DELETE_SPEED: Speed = { min: 30, range: 40 };

export function Typewriter({
  text,
  as = "h1",
  typo = false,
  typoTarget = 1,
  typoOverride,
  initialDelay = 2000,
  typeSpeed = DEFAULT_TYPE_SPEED,
  deleteSpeed = DEFAULT_DELETE_SPEED,
  className,
  style,
  id,
}: Props) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Reset animation state whenever props change. The lint rule warns against
    // unconditional setState in effects, but here it's the intentional reset.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDisplayed("");
    setDone(false);

    const actions =
      typo && text.trim().includes(" ")
        ? buildTypoActions(text, typoTarget, typoOverride)
        : buildPlainActions(text);

    let idx = 0;
    let buffer = "";
    const timers: ReturnType<typeof setTimeout>[] = [];

    const run = () => {
      if (idx >= actions.length) {
        timers.push(setTimeout(() => setDone(true), 2500));
        return;
      }
      const action = actions[idx++];
      let nextDelay: number;
      if (action.type === "type") {
        buffer += action.char;
        setDisplayed(buffer);
        nextDelay = Math.floor(Math.random() * typeSpeed.range) + typeSpeed.min;
      } else if (action.type === "delete") {
        buffer = buffer.slice(0, -1);
        setDisplayed(buffer);
        nextDelay =
          Math.floor(Math.random() * deleteSpeed.range) + deleteSpeed.min;
      } else {
        nextDelay = action.ms;
      }
      timers.push(setTimeout(run, nextDelay));
    };

    timers.push(setTimeout(run, initialDelay));

    return () => timers.forEach(clearTimeout);
  }, [text, typo, typoTarget, typoOverride, initialDelay, typeSpeed, deleteSpeed]);

  return createElement(
    as,
    { className, style, id },
    <span key="sr" style={SR_ONLY_STYLE}>
      {text}
    </span>,
    <span
      key="anim"
      aria-hidden="true"
      className={`typewriter-cursor${done ? " done" : ""}`}
    >
      {displayed}
    </span>,
  );
}
