import fs from "node:fs";
import path from "node:path";
import type { AIItem } from "../../lib/types";

const DATA_DIR = path.resolve("data");
const ALERTS_PATH = path.join(DATA_DIR, "alerts.json");
const STATE_PATH = path.join(DATA_DIR, "alerted-events.json");
const WINDOW_MS = Number(process.env.RADAR_ALERT_WINDOW_HOURS || 8) * 3600_000;
const MAX_ALERTS = Number(process.env.RADAR_ALERT_MAX || 6);

export interface RadarAlert {
  eventId: string;
  title: string;
  source: string;
  sourceUrl: string;
  channel: string;
  heat: number;
  confidence: number;
  corroboration: number;
  detectedAt: string;
}

function readIds(): string[] {
  try {
    const parsed = JSON.parse(fs.readFileSync(STATE_PATH, "utf8"));
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
}

/** Persist only newly detected, high-confidence surge events for notification. */
export function buildRadarAlerts(items: AIItem[], now = Date.now()): RadarAlert[] {
  const seen = new Set(readIds());
  const byEvent = new Map<string, AIItem>();
  for (const item of items) {
    const eventId = item.eventId ?? item.id;
    const firstSeen = Date.parse(item.firstSeen ?? "");
    if (!item.surge || seen.has(eventId) || !Number.isFinite(firstSeen) || now - firstSeen > WINDOW_MS) continue;
    if ((item.confidence ?? 0) < 74) continue;
    const previous = byEvent.get(eventId);
    if (!previous || (item.confidence ?? 0) + (item.heat ?? 0) > (previous.confidence ?? 0) + (previous.heat ?? 0)) {
      byEvent.set(eventId, item);
    }
  }

  const detectedAt = new Date(now).toISOString();
  const alerts = [...byEvent.values()]
    .sort((a, b) => (b.corroboration ?? 1) - (a.corroboration ?? 1) || (b.confidence ?? 0) - (a.confidence ?? 0) || (b.heat ?? 0) - (a.heat ?? 0))
    .slice(0, MAX_ALERTS)
    .map((item): RadarAlert => ({
      eventId: item.eventId ?? item.id,
      title: item.title,
      source: item.source,
      sourceUrl: item.sourceUrl,
      channel: item.radarChannel ?? "ai-tech",
      heat: item.heat ?? 0,
      confidence: item.confidence ?? 0,
      corroboration: item.corroboration ?? 1,
      detectedAt,
    }));

  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(ALERTS_PATH, JSON.stringify({ generatedAt: detectedAt, alerts }, null, 2) + "\n", "utf8");
  const nextIds = [...alerts.map((alert) => alert.eventId), ...seen].slice(0, 800);
  fs.writeFileSync(STATE_PATH, JSON.stringify(nextIds, null, 2) + "\n", "utf8");
  console.log(`[alerts] ${alerts.length} new surge event(s)`);
  return alerts;
}
