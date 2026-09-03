"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/marcas", label: "Marcas" },
  { href: "/admin/produtos", label: "Produtos" },
];

export function AppNavLinks() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-4">
      {LINKS.map((link) => {
        const ativo = pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "text-sm transition-colors",
              ativo
                ? "text-primary font-semibold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
