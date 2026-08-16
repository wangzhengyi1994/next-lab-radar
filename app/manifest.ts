import type { MetadataRoute } from "next";

const base = process.env.NEXT_PUBLIC_BASE_PATH || "";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "NEXT LAB RADAR · 海外 AI 选题雷达",
    short_name: "NL RADAR",
    description: "追踪海外 AI、设计工具、Skill 与 GitHub 资源，快速转为公众号选题。",
    start_url: `${base}/`,
    scope: `${base}/`,
    display: "standalone",
    background_color: "#f4f1e9",
    theme_color: "#0b0b0b",
    icons: [{ src: `${base}/favicon.svg`, sizes: "any", type: "image/svg+xml", purpose: "any" }],
  };
}
