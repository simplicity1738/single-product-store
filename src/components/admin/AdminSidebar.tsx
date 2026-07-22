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
      className={`hidden shrink-0 border-r border-white/10 bg-[#0B0908] text-white transition-[width] duration-300 ease-out lg:block ${
        collapsed ? "w-16" : "w-48"
      }`}
    >
      <div className="sticky top-0 flex h-screen flex-col p-3">
        <div className={`px-1 ${collapsed ? "text-center" : ""}`}>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#ECE5D8]">
            {collapsed ? "SC" : "Admin"}
          </p>
          {!collapsed ? (
            <p className="mt-1 text-sm font-bold text-white">SimpliCity</p>
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
                className={`block rounded-xl text-xs font-medium uppercase tracking-wider transition-all ${
                  collapsed ? "px-0 py-2.5 text-center" : "px-4 py-2.5"
                } ${
                  active
                    ? "bg-[#ECE5D8] font-semibold text-[#0F0C0B] shadow-md"
                    : "text-[#CFC4BD] hover:bg-white/5 hover:text-white"
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
              className="block text-sm font-medium text-[#A89A92] transition hover:text-white"
            >
              ← Tillbaka till butiken
            </Link>
          ) : (
            <Link
              href="/"
              title="Tillbaka till butiken"
              className="block text-center text-sm font-medium text-[#A89A92] transition hover:text-white"
            >
              ←
            </Link>
          )}

          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label={collapsed ? "Expandera sidomeny" : "Minimera sidomeny"}
            title={collapsed ? "Expandera" : "Minimera"}
            className="flex w-full items-center justify-center rounded-xl border border-white/10 bg-white/5 py-2 text-sm font-bold text-[#CFC4BD] transition hover:bg-white/10 hover:text-white"
          >
            {collapsed ? ">" : "<"}
          </button>
        </div>
      </div>
    </aside>
  );
}
