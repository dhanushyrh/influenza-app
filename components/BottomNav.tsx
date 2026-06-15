"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Hidden on non-app pages (onboarding wizard, lookbook, business profile)
// because those pages have their own primary CTAs at the bottom.
const HIDE_ON = ["/onboarding", "/business-onboarding", "/influencer", "/business", "/api", "/biz", "/inf", "/login", "/forgot-password", "/reset-password"];

export function BottomNav() {
  const path = usePathname();
  if (path === "/" || HIDE_ON.some((p) => path.startsWith(p))) return null;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 mx-auto flex max-w-md border-t border-neutral-100 bg-white">
      <NavItem href="/" label="Home" icon="🏠" active={path === "/"} />
      <NavItem href="/swipe" label="Discover" icon="🔍" active={path.startsWith("/swipe")} />
    </nav>
  );
}

function NavItem({
  href,
  label,
  icon,
  active,
}: {
  href: string;
  label: string;
  icon: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex flex-1 flex-col items-center gap-0.5 py-3 text-xs transition-colors ${
        active ? "text-brand" : "text-neutral-400"
      }`}
    >
      <span className="text-xl leading-none">{icon}</span>
      {label}
    </Link>
  );
}
