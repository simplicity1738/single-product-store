"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

const NAV_ITEMS = [
  { href: "/admin", label: "Översikt", exact: true },
  { href: "/admin/site-settings", label: "Sajtkonfiguration", exact: false },
  { href: "/admin/blog", label: "Blogg", exact: false },
  { href: "/admin/lab-tests", label: "Labbtester", exact: false },
  { href: "/admin?tab=recensioner", label: "Recensioner", exact: false },
] as const;

export default function AdminSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <aside className="hidden w-48 shrink-0 border-r border-rose-100 bg-white/90 lg:block">
      <div className="sticky top-0 flex h-screen flex-col p-3">
        <div className="px-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-rose-600">
            Admin
          </p>
          <p className="mt-1 text-sm font-bold text-zinc-900">SimpliCity</p>
        </div>

        <nav className="mt-6 space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const active = item.href.includes("tab=recensioner")
              ? pathname === "/admin" &&
                searchParams.get("tab") === "recensioner"
              : item.exact
                ? pathname === item.href && searchParams.get("tab") !== "recensioner"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-lg px-2.5 py-2 text-sm font-semibold transition ${
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

        <div className="mt-auto px-1">
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
