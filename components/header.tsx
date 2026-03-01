"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { PriceTicker } from "@/components/price-ticker";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4">
        <Link
          href="/"
          className="flex items-center gap-2 font-mono text-sm font-medium tracking-tight text-foreground/90 shrink-0"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#D4AF37"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M9 3H15V8L18 16C18.5 17.5 17.5 19 16 19H8C6.5 19 5.5 17.5 6 16L9 8V3Z" />
            <path d="M9 3H15" />
            <path d="M7 14H17" />
            <circle cx="10" cy="16.5" r="0.5" />
            <circle cx="13" cy="15" r="0.5" />
          </svg>
          TradingLab
        </Link>

        <PriceTicker className="flex-1 min-w-0" />

        <div className="flex items-center gap-2 shrink-0">
          <Button variant="ghost" size="sm" className="data-mono text-xs" asChild>
            <Link href="/guides">Guides</Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1 data-mono text-xs">
                Tools
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href="/backtester">Backtester</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/calculator/position-size">Position Size Calculator</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/calculator/profit">Profit Calculator</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
