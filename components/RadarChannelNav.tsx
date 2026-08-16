"use client";

import { RADAR_CHANNELS } from "@/lib/radar";
import { useViewState } from "@/lib/viewState";

export default function RadarChannelNav() {
  const { state, update } = useViewState();
  const channels = [{ key: "all" as const, label: "全部雷达", desc: "所有频道的实时信号" }, ...RADAR_CHANNELS];
  return (
    <section className="max-w-[1440px] mx-auto px-5 md:px-8 pt-7" aria-label="雷达频道">
      <div className="grid grid-cols-2 lg:grid-cols-5 border-l border-t border-black/20 dark:border-white/20">
        {channels.map((channel, index) => {
          const active = state.radarChannel === channel.key;
          return <button type="button" key={channel.key} onClick={() => update({ radarChannel: channel.key })} className={`text-left min-h-[94px] px-4 py-3 border-r border-b border-black/20 dark:border-white/20 transition-colors ${active ? "bg-black text-white" : "bg-[#faf8f2] dark:bg-[#171717] hover:bg-[#edf2ff] dark:hover:bg-[#202020]"}`}>
            <span className={`block text-[10px] font-bold tracking-[.16em] mb-2 ${active ? "text-[#6f91ff]" : "text-[#1548ff]"}`}>0{index + 1}</span>
            <strong className="block text-sm">{channel.label}</strong>
            <span className={`hidden sm:block text-[11px] leading-5 mt-1 ${active ? "text-white/55" : "text-black/48 dark:text-white/45"}`}>{channel.desc}</span>
          </button>;
        })}
      </div>
    </section>
  );
}
