import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "twenty second coffee",
    short_name: "twenty second",
    description: "Coffee, loyalty rewards and everything happening at twenty second coffee.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#faf6ef",
    theme_color: "#a51f1b",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
