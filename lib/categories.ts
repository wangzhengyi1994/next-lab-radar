import type { Category, CategoryKey } from "./types";

export const CATEGORIES: Category[] = [
  { key: "ai-models", label: "模型 / Agent", desc: "模型、Agent 与编程能力的一手发布" },
  { key: "ai-products", label: "设计 / 产品", desc: "AI 设计工具、界面产品与新功能" },
  { key: "industry", label: "行业信号", desc: "值得持续追踪的 AI 行业变化" },
  { key: "paper", label: "论文 / 方法", desc: "能转化为设计与开发实验的研究" },
  { key: "tip", label: "Skill / 资源", desc: "Codex Skill、GitHub 资源与真实工作流" },
];

export const CATEGORY_MAP: Record<CategoryKey, Category> = Object.fromEntries(
  CATEGORIES.map((c) => [c.key, c]),
) as Record<CategoryKey, Category>;

export function isCategoryKey(s: string | undefined | null): s is CategoryKey {
  return !!s && CATEGORIES.some((c) => c.key === s);
}
