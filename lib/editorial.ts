import type { AIItem, RadarChannel } from "./types";

export type EditorialStage = "candidate" | "verify" | "draft" | "visual" | "review" | "scheduled" | "published";

export interface EditorialRecord {
  itemId: string;
  stage: EditorialStage;
  account: string;
  angle: string;
  note: string;
  updatedAt: string;
}

const EMOTION = /(爆火|热搜|争议|反转|离谱|吐槽|泪目|震惊|可惜|去世|道歉|回应|封神|崩坏|翻车|逆袭|意外|首次|最贵|最惨|票房|网友|围观)/i;
const DAILY = /(电影|明星|网红|学校|医院|婚姻|孩子|工资|房价|旅游|食品|外卖|烧烤|普通人|消费|手机|汽车|高考|教师|景区)/i;
const NOVELTY = /(仅.{0,5}人|第一次|首个|突然|竟然|没想到|反向|粗糙|抽象|神秘|消失|复出|破纪录|暴涨|零成本)/i;
const PRACTICAL = /(教程|免费|开源|实测|工具|skill|github|效率|设计|前端|提示词|工作流|发布)/i;
const RISK = /(传闻|网传|疑似|爆料|未经证实|伤亡|死亡|案件|警方|隐私|未成年)/i;

export function accountFor(channel: RadarChannel | undefined): string {
  if (channel === "breaking") return "快讯观察";
  if (channel === "society") return "大众热点";
  if (channel === "people") return "人物故事";
  return "NEXT LAB";
}

export function evaluateEditorial(item: AIItem) {
  const text = `${item.title} ${item.summary ?? ""}`;
  let mass = item.radarChannel === "society" || item.radarChannel === "people" ? 54 : 34;
  if (EMOTION.test(text)) mass += 17;
  if (DAILY.test(text)) mass += 13;
  if (NOVELTY.test(text)) mass += 14;
  if (item.surge) mass += 10;
  if ((item.corroboration ?? 1) >= 2) mass += 7;
  if (PRACTICAL.test(text)) mass += 8;
  mass = Math.min(99, mass);
  const confidence = item.confidence ?? (item.tier === 1 ? 86 : item.tier === 2 ? 72 : 56);
  const editorial = Math.min(99, Math.round(mass * 0.58 + confidence * 0.27 + Math.min(100, item.heat ?? 45) * 0.15));
  const reasons = [
    EMOTION.test(text) && "有情绪讨论点",
    DAILY.test(text) && "大众理解门槛低",
    NOVELTY.test(text) && "反差或猎奇明显",
    PRACTICAL.test(text) && "可实测或有实用价值",
    item.surge && "正在升温",
    (item.corroboration ?? 1) >= 2 && "已有多源报道",
  ].filter(Boolean) as string[];
  return { massAppeal: mass, editorialScore: editorial, reasons, risk: RISK.test(text) ? "高" : confidence < 65 ? "中" : "低" };
}

export function buildEditorialPack(item: AIItem) {
  const score = evaluateEditorial(item);
  const account = accountFor(item.radarChannel);
  const angle = item.radarChannel === "ai-tech"
    ? "从我亲自试用后的真实变化切入，保留输入、输出、界面和失败结果。"
    : item.radarChannel === "people"
      ? "从这次人物为什么突然被讨论切入，只写公开事实，不猜私生活。"
      : item.radarChannel === "breaking"
        ? "先给确定事实和时间线，再解释它为什么重要，未确认部分不写。"
        : "从反差、普通人感受和争议点切入，分清事实、网友玩梗与后续回应。";
  const title = item.title.replace(/[｜|].*$/, "").trim();
  return {
    ...score,
    account,
    angle,
    titles: [title, `${title}，为什么突然火了？`, `我把“${title.slice(0, 18)}”前后资料翻了一遍`],
    checklist: ["找到最早发布或官方原文", "至少补充 2 个独立信源", "确认时间、人物、数字和上下文", "收集 3—6 张可用原图或实测截图", "标记传闻、争议与版权风险"],
  };
}
