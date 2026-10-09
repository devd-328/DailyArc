"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    const hadController = navigator.serviceWorker.controller != null;
    if (!hadController) {
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (sessionStorage.getItem("dailyarc-sw-reload") === "1") return;
        sessionStorage.setItem("dailyarc-sw-reload", "1");
        window.location.reload();
      });
    }

    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);

  return null;
}
