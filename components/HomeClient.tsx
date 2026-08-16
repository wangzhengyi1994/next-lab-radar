"use client";

import { useMemo } from "react";
import Link from "next/link";
import Header from "./Header";
import CategoryNav from "./CategoryNav";
import Sidebar from "./Sidebar";
import SortTabs from "./SortTabs";
import FeedSection from "./FeedSection";
import Hero from "./Hero";
import NewSince from "./NewSince";
import CommandPalette from "./CommandPalette";
import AskAI from "./AskAI";
import RadarChannelNav from "./RadarChannelNav";
import { useLocale } from "./LocaleProvider";
import { filterItems } from "@/lib/filter";
import { sourceCounts } from "@/lib/personalize";
import { ENTITY_MAP, entityCounts } from "@/lib/entities";
import { formatBJDate } from "@/lib/timeFormat";
import { ViewStateProvider, useViewState } from "@/lib/viewState";
import type { ViewState } from "@/lib/viewState";
import type { StoreMeta } from "@/lib/localStore";
import type { AIItem, Digest } from "@/lib/types";

function HomeLayout({
  items,
  meta,
  now,
  digest,
  state,
}: {
  items: AIItem[];
  meta: StoreMeta | null;
  now: number;
  digest: Digest | null;
  state: ViewState;
}) {
  const { t } = useLocale();
  const { category, keyword, mode, since, source, radarChannel } = state;

  const query = useMemo(
    () => ({ mode, category, since, keyword, source, radarChannel }),
    [mode, category, since, keyword, source, radarChannel],
  );

  const trending = useMemo(
    () => filterItems(items, { mode: "selected", since: "7d", sort: "heat" }).slice(0, 8),
    [items],
  );

  const topics = useMemo(
    () =>
      Object.entries(entityCounts(items))
        .filter(([, n]) => n >= 5)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 12)
        .map(([slug, count]) => ({ slug, name: ENTITY_MAP[slug]?.name ?? slug, count })),
    [items],
  );

  const sources = useMemo(() => sourceCounts(items), [items]);

  const showDigest = !keyword && category === "all" && !source;

  const heroItem = useMemo(
    () =>
      showDigest
        ? [...items]
            .filter((i) => i.image && i.aiSelected !== false)
            .sort(
              (a, b) =>
                (b.heat ?? 0) - (a.heat ?? 0) ||
                (b.publishedAt ?? b.firstSeen ?? "").localeCompare(a.publishedAt ?? a.firstSeen ?? ""),
            )[0] ?? null
        : null,
    [items, showDigest],
  );

  return (
    <>
      <Header />
      <CategoryNav />

      <div className="radar-masthead">
        <div>
          <p className="radar-kicker">EDITORIAL INTELLIGENCE / UPDATED DAILY</p>
          <h1>今天有什么值得写</h1>
        </div>
        <p className="radar-intro">从海外官方发布、GitHub、Hacker News、论文和设计社区里挑出真正适合 NEXT LAB 的信号。不追求全，只找能实测、能做图、能讲清楚的题。</p>
      </div>
      <RadarChannelNav />

      <main id="main-content" className="max-w-[1440px] mx-auto px-5 md:px-8 py-8 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
        <section className="min-w-0">
          {showDigest && <NewSince items={items} />}
          {heroItem && <Hero item={heroItem} />}
          {keyword && (
            <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              {t("search.keyword")}：<span className="text-brand-600 font-medium">{keyword}</span>
            </div>
          )}
          <SortTabs />
          <FeedSection items={items} query={query} now={now} />
        </section>

        <Sidebar
          trending={trending}
          meta={meta}
          state={state}
          sources={sources}
          topics={topics}
          trendSummary={digest?.trendSummary ?? null}
          digest={digest}
        />
      </main>

      <footer className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 mt-10">
        <div className="max-w-7xl mx-auto px-4 py-6 text-xs text-gray-500 dark:text-gray-400 flex flex-wrap items-center justify-between gap-2">
          <span>
            © {new Date().getFullYear()} NEXT LAB RADAR · {t("footer.total")} {items.length} {t("footer.totalSuffix")}
            {meta?.fetchedAt && <> · {t("footer.updated")} {formatBJDate(meta.fetchedAt)}</>}
          </span>
          <div className="flex items-center gap-3">
            <Link href="/about" className="hover:text-brand-600">{t("footer.about")}</Link>
            <Link href="/privacy" className="hover:text-brand-600">{t("footer.privacy")}</Link>
            <a
              href="https://github.com/Jackychen-12/AI-Search"
              target="_blank"
              rel="noreferrer"
              className="hover:text-brand-600"
            >
              开源底座
            </a>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 pb-5 text-center text-[11px] text-gray-400 dark:text-gray-500">Built for NEXT LAB editorial workflow · Powered by the open-source AI-Search engine</div>
      </footer>
    </>
  );
}

function HomeContent({
  items,
  meta,
  now,
  digest,
}: {
  items: AIItem[];
  meta: StoreMeta | null;
  now: number;
  digest: Digest | null;
}) {
  const { state } = useViewState();
  const cmdkSources = useMemo(() => sourceCounts(items).map(([s]) => s), [items]);
  return (
    <>
      <HomeLayout items={items} meta={meta} now={now} digest={digest} state={state} />
      <CommandPalette items={items} sources={cmdkSources} />
      <AskAI items={items} />
    </>
  );
}

export default function HomeClient({
  items,
  meta,
  now,
  digest,
}: {
  items: AIItem[];
  meta: StoreMeta | null;
  now: number;
  digest: Digest | null;
}) {
  return (
    <ViewStateProvider>
      <HomeContent items={items} meta={meta} now={now} digest={digest} />
    </ViewStateProvider>
  );
}
