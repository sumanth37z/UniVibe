"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import {
  Building2,
  Compass,
  LayoutDashboard,
  LogIn,
  LogOut,
  Megaphone,
  Menu,
  Plus,
  Sparkles,
  Ticket,
  UserRound,
  X,
} from "lucide-react";

import { Logo } from "@/components/logo";
import { Avatar } from "@/components/monogram";
import { cn } from "@/lib/utils";
import { logout } from "@/lib/actions/auth";
import type { CurrentUser } from "@/lib/auth";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  section: string;
};

function navItems(user: CurrentUser | null): NavItem[] {
  if (!user) {
    return [
      { href: "/events", label: "Discover events", icon: Compass, section: "Explore" },
      { href: "/colleges", label: "Colleges", icon: Building2, section: "Explore" },
    ];
  }
  const items: NavItem[] = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, section: "Explore" },
    { href: "/events", label: "Discover events", icon: Compass, section: "Explore" },
    { href: "/colleges", label: "Colleges", icon: Building2, section: "Explore" },
    { href: "/registrations", label: "My tickets", icon: Ticket, section: "My hub" },
  ];
  if (user.role === "organizer") {
    items.push({
      href: "/my-events",
      label: "Manage events",
      icon: Megaphone,
      section: "My hub",
    });
  }
  items.push({ href: "/profile", label: "Profile", icon: UserRound, section: "Account" });
  return items;
}

function NavList({
  user,
  onNavigate,
}: {
  user: CurrentUser | null;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const items = navItems(user);
  const sections = [...new Set(items.map((i) => i.section))];

  return (
    <div className="flex h-full flex-col">
      <div className="px-5 pt-6 pb-8">
        <Link href={user ? "/dashboard" : "/"} onClick={onNavigate} className="group inline-block">
          <Logo dark />
        </Link>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3">
        {sections.map((section) => (
          <div key={section}>
            <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-cream/40">
              {section}
            </p>
            <ul className="space-y-1">
              {items
                .filter((i) => i.section === section)
                .map((item) => {
                  const active =
                    pathname === item.href ||
                    (item.href !== "/dashboard" && pathname.startsWith(item.href));
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onNavigate}
                        className={cn(
                          "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors duration-200",
                          active
                            ? "bg-cream text-ink"
                            : "text-cream/70 hover:bg-cream/10 hover:text-cream"
                        )}
                      >
                        <item.icon
                          className={cn(
                            "size-4.5 transition-transform duration-200 group-hover:scale-110",
                            active ? "text-iris" : "text-cream/50"
                          )}
                        />
                        {item.label}
                        {active && (
                          <span className="absolute right-3 size-1.5 rounded-full bg-iris" />
                        )}
                      </Link>
                    </li>
                  );
                })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="space-y-3 p-4">
        {user?.role === "organizer" && (
          <Link
            href="/events/new"
            onClick={onNavigate}
            className="flex items-center justify-center gap-2 rounded-xl bg-lime px-4 py-3 text-sm font-bold text-ink transition-transform duration-200 hover:scale-[1.02]"
          >
            <Plus className="size-4.5" strokeWidth={2.5} />
            Create event
          </Link>
        )}

        {user ? (
          <div className="flex items-center gap-3 rounded-xl bg-cream/[0.07] p-3 ring-1 ring-cream/10">
            <Avatar name={user.name} hue={user.hue} className="ring-transparent" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-cream">{user.name}</p>
              <p className="truncate text-xs font-medium text-cream/50">
                {user.role === "organizer" ? "Organizer · " : ""}
                {user.college.shortName}
              </p>
            </div>
            <form action={logout}>
              <button
                type="submit"
                title="Sign out"
                className="grid size-8 place-items-center rounded-lg text-cream/50 transition-colors hover:bg-cream/10 hover:text-cream"
              >
                <LogOut className="size-4" />
              </button>
            </form>
          </div>
        ) : (
          <div className="rounded-xl bg-cream/[0.07] p-4 ring-1 ring-cream/10">
            <p className="flex items-center gap-2 text-sm font-bold text-cream">
              <Sparkles className="size-4 text-lime" />
              Browsing as a guest
            </p>
            <p className="mt-1.5 text-xs leading-relaxed font-medium text-cream/50">
              Sign in to register for events and build your ticket wall.
            </p>
            <div className="mt-3 space-y-2">
              <Link
                href="/signup"
                onClick={onNavigate}
                className="flex items-center justify-center gap-2 rounded-lg bg-lime px-4 py-2.5 text-xs font-bold text-ink transition-transform duration-200 hover:scale-[1.02]"
              >
                Join the vibe
              </Link>
              <Link
                href="/login"
                onClick={onNavigate}
                className="flex items-center justify-center gap-2 rounded-lg bg-cream/10 px-4 py-2.5 text-xs font-bold text-cream transition-colors hover:bg-cream/20"
              >
                <LogIn className="size-3.5" />
                Sign in
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function Sidebar({ user }: { user: CurrentUser | null }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* desktop */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 bg-ink lg:block">
        <NavList user={user} />
      </aside>

      {/* mobile top bar */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-cream/10 bg-ink px-4 py-3 lg:hidden">
        <Link href={user ? "/dashboard" : "/"}>
          <Logo dark />
        </Link>
        <button
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="grid size-10 place-items-center rounded-xl bg-cream/10 text-cream transition-colors hover:bg-cream/20"
        >
          <Menu className="size-5" />
        </button>
      </div>

      {/* mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-ink/60 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 w-[280px] bg-ink lg:hidden"
            >
              <button
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="absolute right-4 top-4 z-10 grid size-9 place-items-center rounded-lg text-cream/60 hover:bg-cream/10"
              >
                <X className="size-5" />
              </button>
              <NavList user={user} onNavigate={() => setOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
