"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const NAV_ITEMS = [
  { href: "/admin", label: "Översikt", short: "Ö", exact: true },
  { href: "/admin/site-settings", label: "Sajtkonfiguration", short: "S", exact: false },
  { href: "/admin/blog", label: "Blogg", short: "B", exact: false },
  { href: "/admin/lab-tests", label: "Labbtester", short: "L", exact: false },
  { href: "/admin?tab=recensioner", label: "Recensioner", short: "R", exact: false },
] as const;

const COLLAPSE_STORAGE_KEY = "simplicity-admin-sidebar-collapsed";

export default function AdminSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      setCollapsed(window.localStorage.getItem(COLLAPSE_STORAGE_KEY) === "1");
    } catch {
      // ignore storage errors
    }
  }, []);

  function toggleCollapsed() {
    setCollapsed((current) => {
      const next = !current;
      try {
        window.localStorage.setItem(COLLAPSE_STORAGE_KEY, next ? "1" : "0");
      } catch {
        // ignore storage errors
      }
      return next;
    });
  }

  return (
    <aside
      className={`hidden shrink-0 border-r border-rose-100 bg-white/90 transition-[width] duration-300 ease-out lg:block ${
        collapsed ? "w-16" : "w-48"
      }`}
    >
      <div className="sticky top-0 flex h-screen flex-col p-3">
        <div className={`px-1 ${collapsed ? "text-center" : ""}`}>
          <p className="text-xs font-semibold uppercase tracking-wide text-rose-600">
            {collapsed ? "SC" : "Admin"}
          </p>
          {!collapsed ? (
            <p className="mt-1 text-sm font-bold text-zinc-900">SimpliCity</p>
          ) : null}
        </div>

        <nav className="mt-6 space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const active = item.href.includes("tab=recensioner")
              ? pathname === "/admin" &&
                searchParams.get("tab") === "recensioner"
              : item.exact
                ? pathname === item.href &&
                  searchParams.get("tab") !== "recensioner"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                className={`block rounded-lg text-sm font-semibold transition ${
                  collapsed ? "px-0 py-2 text-center" : "px-2.5 py-2"
                } ${
                  active
                    ? "bg-rose-50 text-rose-700 shadow-sm shadow-rose-100"
                    : "text-zinc-600 hover:bg-rose-50/60 hover:text-rose-700"
                }`}
              >
                {collapsed ? item.short : item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-3 px-1">
          {!collapsed ? (
            <Link
              href="/"
              className="block text-sm font-medium text-zinc-500 transition hover:text-rose-600"
            >
              ← Tillbaka till butiken
            </Link>
          ) : (
            <Link
              href="/"
              title="Tillbaka till butiken"
              className="block text-center text-sm font-medium text-zinc-500 transition hover:text-rose-600"
            >
              ←
            </Link>
          )}

          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label={collapsed ? "Expandera sidomeny" : "Minimera sidomeny"}
            title={collapsed ? "Expandera" : "Minimera"}
            className="flex w-full items-center justify-center rounded-lg border border-rose-100 bg-rose-50/50 py-2 text-sm font-bold text-rose-700 transition hover:bg-rose-100"
          >
            {collapsed ? ">" : "<"}
          </button>
        </div>
      </div>
    </aside>
  );
}
