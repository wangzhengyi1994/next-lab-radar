import { describe, expect, it } from "vitest";
import { enrichRadarItems, inferRadarChannel } from "../lib/radar";
import type { AIItem } from "../lib/types";

function item(patch: Partial<AIItem>): AIItem {
  return {
    id: "id",
    title: "title",
    summary: null,
    source: "source",
    sourceUrl: "https://example.com/story",
    category: "industry",
    publishedAt: "2026-08-17T00:00:00.000Z",
    ...patch,
  };
}

describe("radar channels", () => {
  it("keeps explicit society and people feeds in their lanes", () => {
    expect(inferRadarChannel(item({ origin: "rss:china-society", title: "明星走红毙晚" }))).toBe("society");
    expect(inferRadarChannel(item({ origin: "rss:people-watch", title: "张雪峰最新回应" }))).toBe("people");
  });

  it("does not route a technical story by a generic summary mention", () => {
    expect(inferRadarChannel(item({ origin: "rss:ithome", title: "MagicOS 更新 AI 通知", summary: "博主演示了功能" }))).toBe("ai-tech");
  });
});

describe("event clustering", () => {
  it("retains cross-source corroboration and marks a major breaking event", () => {
    const results = enrichRadarItems([
      item({ id: "a", origin: "rss:bbc-top", source: "BBC", title: "Seven killed in major Ukraine attack", tier: 1, heat: 55 }),
      item({ id: "b", origin: "rss:world-breaking", source: "Reuters", title: "Major Ukraine attack leaves seven killed", tier: 2, heat: 40 }),
    ]);
    expect(results[0].eventId).toBe(results[1].eventId);
    expect(results[0].corroboration).toBe(2);
    expect(results[0].surge).toBe(true);
    expect(results[0].confidence).toBeGreaterThanOrEqual(90);
  });
});
