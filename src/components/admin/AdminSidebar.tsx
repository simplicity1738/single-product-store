"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/admin", label: "Översikt", exact: true },
  { href: "/admin/blog", label: "Blogg", exact: false },
] as const;

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-56 shrink-0 border-r border-rose-100 bg-white/90 lg:block">
      <div className="sticky top-0 flex h-screen flex-col px-4 py-8">
        <div className="px-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-rose-600">
            Admin
          </p>
          <p className="mt-1 text-sm font-bold text-zinc-900">SimpliCity</p>
        </div>

        <nav className="mt-8 space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                  active
                    ? "bg-rose-50 text-rose-700 shadow-sm shadow-rose-100"
                    : "text-zinc-600 hover:bg-rose-50/60 hover:text-rose-700"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto px-2">
          <Link
            href="/"
            className="text-sm font-medium text-zinc-500 transition hover:text-rose-600"
          >
            ← Tillbaka till butiken
          </Link>
        </div>
      </div>
    </aside>
  );
}
