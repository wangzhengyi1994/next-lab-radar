"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { AIItem } from "@/lib/types";
import { buildEditorialPack, evaluateEditorial, type EditorialRecord, type EditorialStage } from "@/lib/editorial";

const KEY = "next-lab:editorial:v1";
const STAGES: { key: EditorialStage; label: string }[] = [
  { key: "candidate", label: "选题池" }, { key: "verify", label: "核验中" }, { key: "draft", label: "写稿中" },
  { key: "visual", label: "配图中" }, { key: "review", label: "待审稿" }, { key: "scheduled", label: "待发布" }, { key: "published", label: "已发布" },
];

function readRecords(): EditorialRecord[] {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
}

export default function EditorialWorkspace({ items }: { items: AIItem[] }) {
  const [records, setRecords] = useState<EditorialRecord[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [channel, setChannel] = useState("all");
  useEffect(() => setRecords(readRecords()), []);
  const ranked = useMemo(() => items.map(item => ({ item, score: evaluateEditorial(item) }))
    .filter(x => channel === "all" || x.item.radarChannel === channel)
    .sort((a,b) => b.score.editorialScore - a.score.editorialScore).slice(0, 80), [items, channel]);
  const selected = items.find(i => i.id === selectedId) ?? ranked[0]?.item;
  const pack = selected ? buildEditorialPack(selected) : null;
  function save(next: EditorialRecord[]) { setRecords(next); localStorage.setItem(KEY, JSON.stringify(next)); }
  function add(item: AIItem) {
    if (records.some(r => r.itemId === item.id)) { setSelectedId(item.id); return; }
    const p = buildEditorialPack(item);
    save([{ itemId: item.id, stage: "candidate", account: p.account, angle: p.angle, note: "", updatedAt: new Date().toISOString() }, ...records]);
    setSelectedId(item.id);
  }
  function update(id: string, patch: Partial<EditorialRecord>) { save(records.map(r => r.itemId === id ? { ...r, ...patch, updatedAt: new Date().toISOString() } : r)); }
  async function copyPack(item: AIItem) {
    const p = buildEditorialPack(item);
    await navigator.clipboard.writeText([`选题：${item.title}`, `目标账号：${p.account}`, `大众兴趣：${p.massAppeal} / 选题价值：${p.editorialScore}`, `为什么值得写：${p.reasons.join("、") || "等待编辑判断"}`, `切入角度：${p.angle}`, "", "标题备选：", ...p.titles.map((t,i)=>`${i+1}. ${t}`), "", `已知信息：${item.summary ?? "待补"}`, `原文：${item.sourceUrl}`, "", "核验清单：", ...p.checklist.map(x=>`- ${x}`)].join("\n"));
  }
  return <div className="editorial-shell">
    <header className="editorial-topbar"><Link href="/" className="editorial-brand">NL / RADAR</Link><div><b>内容选题工作台</b><span>从热点发现到发布准备</span></div><div className="editorial-topstats"><span>候选 {records.filter(r=>r.stage==="candidate").length}</span><span>进行中 {records.filter(r=>!["candidate","published"].includes(r.stage)).length}</span><span>已发布 {records.filter(r=>r.stage==="published").length}</span></div></header>
    <section className="editorial-hero"><p>EDITORIAL DESK · {new Date().toLocaleDateString("zh-CN")}</p><h1>今天，<br/>什么值得写？</h1><div><strong>{ranked.filter(x=>x.score.editorialScore>=75).length}</strong><span>个高价值信号</span></div></section>
    <nav className="editorial-filters">{[["all","全部"],["society","社会热点"],["people","人物娱乐"],["ai-tech","AI 科技"],["breaking","重大新闻"]].map(([k,l])=><button key={k} className={channel===k?"active":""} onClick={()=>setChannel(k)}>{l}</button>)}</nav>
    <main className="editorial-grid">
      <section className="editorial-list"><div className="section-label">热点候选 / 按选题价值排序</div>{ranked.map(({item,score}, index)=><article key={item.id} className={"editorial-row "+(selected?.id===item.id?"selected":"")} onClick={()=>setSelectedId(item.id)}><span className="editorial-rank">{String(index+1).padStart(2,"0")}</span><div><div className="editorial-meta"><b>{score.editorialScore}</b> 选题价值 · {score.massAppeal} 大众兴趣 · 风险 {score.risk}</div><h2>{item.title}</h2><p>{score.reasons.join(" · ") || "等待编辑判断"}</p></div><button onClick={e=>{e.stopPropagation();add(item)}}>{records.some(r=>r.itemId===item.id)?"已入池":"加入选题"}</button></article>)}</section>
      <aside className="editorial-detail">{selected&&pack&&<><div className="section-label">选题拆解</div><div className="score-block"><strong>{pack.editorialScore}</strong><span>EDITORIAL<br/>SCORE</span><i className={pack.risk==="低"?"safe":""}>风险 {pack.risk}</i></div><h2>{selected.title}</h2><p className="detail-summary">{selected.summary || "当前源没有摘要，需要打开原文补充事实。"}</p><dl><div><dt>适合账号</dt><dd>{pack.account}</dd></div><div><dt>传播理由</dt><dd>{pack.reasons.join("、") || "需要人工判断"}</dd></div><div><dt>建议角度</dt><dd>{pack.angle}</dd></div></dl><div className="detail-titles"><b>标题备选</b>{pack.titles.map((t,i)=><p key={t}><span>0{i+1}</span>{t}</p>)}</div><div className="detail-actions"><a href={selected.sourceUrl} target="_blank">打开原文</a><button onClick={()=>copyPack(selected)}>复制完整选题包</button></div>{records.find(r=>r.itemId===selected.id)&&<div className="pipeline-control"><label>推进状态</label><select value={records.find(r=>r.itemId===selected.id)?.stage} onChange={e=>update(selected.id,{stage:e.target.value as EditorialStage})}>{STAGES.map(s=><option key={s.key} value={s.key}>{s.label}</option>)}</select></div>}</>}</aside>
    </main>
  </div>;
}
