"use client";

import { Fragment, useEffect, useRef, type CSSProperties } from "react";

type Props = {
  text: string;
  className?: string;
  style?: CSSProperties;
};

export function SplitH2({ text, className, style }: Props) {
  const ref = useRef<HTMLHeadingElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver !== "function") {
      el.classList.add("active");
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("active");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const words = text.split(" ");
  let charCursor = 0;
  const wordRenders = words.map((word) =>
    [...word].map((ch) => {
      const delay = `${charCursor++ * 0.028}s`;
      return { ch, delay };
    }),
  );

  return (
    <h2
      ref={ref}
      className={`split-text ${className ?? ""}`.trim()}
      style={style}
    >
      <span className="split-sr">{text}</span>
      <span aria-hidden="true">
        {wordRenders.map((chars, wi) => (
          <Fragment key={wi}>
            <span className="split-word">
              {chars.map((c, ci) => (
                <span
                  key={ci}
                  className="char"
                  style={{ transitionDelay: c.delay }}
                >
                  {c.ch}
                </span>
              ))}
            </span>
            {wi < wordRenders.length - 1 ? " " : ""}
          </Fragment>
        ))}
      </span>
    </h2>
  );
}
