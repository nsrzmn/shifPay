"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Clock3, LayoutGrid } from "lucide-react";

const items = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/history", label: "History", icon: Clock3 },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="safe-bottom fixed bottom-0 left-1/2 z-30 flex w-full max-w-[390px] -translate-x-1/2 border-t border-border bg-white px-9 pt-2" aria-label="Main navigation">
      {items.map((item) => {
        const active = pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-1 flex-col items-center gap-1 rounded-xl py-1 text-[11px] font-semibold transition ${active ? "text-earn" : "text-slate-400"}`}
            aria-current={active ? "page" : undefined}
          >
            <Icon size={20} strokeWidth={active ? 2.5 : 2} aria-hidden="true" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
