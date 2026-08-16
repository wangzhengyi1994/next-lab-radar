import type { AIItem, RadarChannel } from "./types";

const BREAKING_ORIGINS = new Set([
  "rss:bbc-top", "rss:bbc-world", "rss:world-breaking", "rss:ap-world",
]);
const SOCIETY_ORIGINS = new Set([
  "rss:china-society", "rss:thepaper", "rss:weibo-news", "rss:douyin-news",
]);
const PEOPLE_ORIGINS = new Set([
  "rss:people-watch", "rss:entertainment-watch", "rss:grassroots-watch",
]);

const BREAKING_WORDS = /(breaking|突发|去世|逝世|死亡|地震|坠机|爆炸|袭击|战争|停火|选举|总统|首相|重大事故|遇难|紧急状态|breaking news)/i;
const SOCIETY_WORDS = /(社会|热搜|热议|网友|走红|爆火|摊主|烧烤|外卖|游客|学校|医院|警方|通报|回应|争议|奇葩|反转|民生|普通人)/i;
const PEOPLE_WORDS = /(明星|演员|歌手|网红|主播|博主|艺人|导演|主持人|张雪峰|大衣哥|朱之文|郭有才|董宇辉|李佳琦|雷军|马斯克|周杰伦|刘德华)/i;

export const RADAR_CHANNELS: { key: RadarChannel; label: string; desc: string }[] = [
  { key: "ai-tech", label: "AI / 科技", desc: "模型、设计工具、Skill 与 GitHub 资源" },
  { key: "breaking", label: "刚刚发生", desc: "国内外重大新闻与突发事件" },
  { key: "society", label: "社会热点", desc: "民生事件、网络热梗与普通人走红" },
  { key: "people", label: "人物雷达", desc: "明星、网红、专家与草根人物动态" },
];

export function inferRadarChannel(item: AIItem): RadarChannel {
  const origin = item.origin ?? "";
  const text = `${item.title} ${item.summary ?? ""}`;
  if (PEOPLE_ORIGINS.has(origin)) return "people";
  if (SOCIETY_ORIGINS.has(origin)) return "society";
  if (BREAKING_ORIGINS.has(origin)) return "breaking";
  if (PEOPLE_WORDS.test(item.title)) return "people";
  if (SOCIETY_WORDS.test(text)) return "society";
  if (BREAKING_WORDS.test(text)) return "breaking";
  return "ai-tech";
}

function tokens(title: string): Set<string> {
  const text = title.toLowerCase().replace(/(最新|刚刚|突发|快讯|视频|组图)/g, "");
  const out = new Set<string>();
  for (const word of text.match(/[a-z0-9][a-z0-9.-]{2,}/g) ?? []) out.add(word);
  for (const run of text.match(/[\u2e80-\u9fff]+/g) ?? []) {
    for (let i = 0; i < run.length - 1; i++) out.add(run.slice(i, i + 2));
  }
  return out;
}

function similarity(a: Set<string>, b: Set<string>): number {
  if (!a.size || !b.size) return 0;
  let common = 0;
  for (const token of a) if (b.has(token)) common++;
  return common / Math.min(a.size, b.size);
}

function stableId(title: string): string {
  let h = 2166136261;
  for (const ch of title) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return `event-${(h >>> 0).toString(36)}`;
}

/** Cluster nearby reports, then attach editorial confidence and surge signals. */
export function enrichRadarItems(items: AIItem[]): AIItem[] {
  const clusters: { id: string; channel: RadarChannel; time: number; tokens: Set<string>; indexes: number[]; sources: Set<string> }[] = [];
  const enriched = items.map((item) => ({ ...item, radarChannel: inferRadarChannel(item) }));

  enriched.forEach((item, index) => {
    const channel = item.radarChannel!;
    const time = Date.parse(item.publishedAt ?? item.firstSeen ?? "") || Date.now();
    const titleTokens = tokens(item.title);
    const cluster = clusters.find((candidate) =>
      candidate.channel === channel &&
      Math.abs(candidate.time - time) <= 72 * 3600_000 &&
      similarity(candidate.tokens, titleTokens) >= 0.48,
    );
    if (cluster) {
      cluster.indexes.push(index);
      cluster.sources.add(item.source);
    } else {
      clusters.push({ id: stableId(item.title), channel, time, tokens: titleTokens, indexes: [index], sources: new Set([item.source]) });
    }
  });

  for (const cluster of clusters) {
    const sourceCount = cluster.sources.size;
    for (const index of cluster.indexes) {
      const item = enriched[index];
      const tierBase = item.tier === 1 ? 88 : item.tier === 2 ? 74 : 58;
      const confidence = Math.min(99, tierBase + Math.min(11, (sourceCount - 1) * 4));
      enriched[index] = {
        ...item,
        eventId: cluster.id,
        corroboration: sourceCount,
        confidence,
        surge: (item.heat ?? 0) >= 78 || (sourceCount >= 3 && (item.heat ?? 0) >= 55),
      };
    }
  }
  return enriched;
}
