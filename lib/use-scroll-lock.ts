"use client";

import { useEffect } from "react";

/** Freeze the page behind a sheet. The sheet itself can still scroll. */
export function useScrollLock() {
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const scrollY = window.scrollY;
    const scrollbar = window.innerWidth - html.clientWidth;
    const previous = {
      htmlOverflow: html.style.overflow,
      bodyOverflow: body.style.overflow,
      bodyPosition: body.style.position,
      bodyTop: body.style.top,
      bodyWidth: body.style.width,
      bodyPaddingRight: body.style.paddingRight,
    };

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";
    if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;

    return () => {
      html.style.overflow = previous.htmlOverflow;
      body.style.overflow = previous.bodyOverflow;
      body.style.position = previous.bodyPosition;
      body.style.top = previous.bodyTop;
      body.style.width = previous.bodyWidth;
      body.style.paddingRight = previous.bodyPaddingRight;
      window.scrollTo(0, scrollY);
    };
  }, []);
}
