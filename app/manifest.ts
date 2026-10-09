import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "DailyArc",
    short_name: "DailyArc",
    description: "Level up your real life like an anime protagonist, then share your anime identity card.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#eef2f6",
    theme_color: "#eef2f6",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
