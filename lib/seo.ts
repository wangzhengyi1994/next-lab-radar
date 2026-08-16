// Site-level constants for SEO (canonical URLs, sitemap, structured data).
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://next-lab-radar.pages.dev").replace(/\/$/, "");
export const SITE_NAME = "NEXT LAB RADAR";
export const SITE_DESC =
  "NEXT LAB 海外 AI 资讯雷达：追踪官方发布、设计工具、Codex Skill、GitHub 资源与创意技术，快速转为公众号选题。";

/** Absolute URL for a path (path should start with "/", relative to the site root). */
export function abs(path = ""): string {
  return `${SITE_URL}${path}`;
}

/**
 * Serialize JSON-LD for embedding in a <script> tag. JSON.stringify does NOT
 * escape "<", so crawled titles containing "</script>" would otherwise break
 * out of the script block (XSS). Escaping "<" as \u003c keeps the JSON valid
 * while making script-tag breakout impossible.
 */
export function jsonLdScript(obj: unknown): string {
  return JSON.stringify(obj).replace(/</g, "\\u003c");
}
