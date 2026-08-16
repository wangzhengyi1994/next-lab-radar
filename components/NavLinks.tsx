"use client";

import Link from "next/link";
import { useLocale } from "./LocaleProvider";
import LocaleSwitch from "./LocaleSwitch";

export default function NavLinks() {
  const { t } = useLocale();

  return (
    <nav className="hidden md:flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
      <Link href="/" className="hover:text-brand-600">{t("nav.home")}</Link>
      <Link href="/daily" className="hover:text-brand-600">{t("nav.daily")}</Link>
      <Link href="/stories" className="hover:text-brand-600">{t("nav.stories")}</Link>
      <Link href="/weekly" className="hover:text-brand-600">{t("nav.weekly")}</Link>
      <Link href="/trends" className="hover:text-brand-600">{t("nav.trends")}</Link>
      <Link href="/workspace" className="px-3 py-1.5 bg-black text-white hover:bg-[#1548ff]">选题工作台</Link>
      <Link href="/about" className="hover:text-brand-600">工作流</Link>
      <LocaleSwitch />
    </nav>
  );
}
