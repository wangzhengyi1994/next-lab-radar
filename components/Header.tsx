import Link from "next/link";
import SearchBar from "./SearchBar";
import NavLinks from "./NavLinks";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 bg-[#f4f1e9]/95 dark:bg-[#111]/95 backdrop-blur-xl border-b border-black/15 dark:border-white/15">
      <div className="max-w-[1440px] mx-auto px-5 md:px-8 h-16 flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="w-8 h-8 bg-black text-white grid place-items-center text-[11px] font-black tracking-[-0.08em]">
            NL
          </span>
          <span className="text-sm font-black tracking-[0.16em] dark:text-white">NEXT LAB <span className="text-[#1548ff]">RADAR</span></span>
        </Link>

        <div className="flex-1 max-w-xl">
          <SearchBar />
        </div>

        <NavLinks />
      </div>
    </header>
  );
}
