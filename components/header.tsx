import { ThemeToggle } from '@/components/theme-toggle';

export function Header() {
  return (
    <header className="sticky top-0 z-50 h-14 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between">
        <span className="flex items-center gap-2 font-mono text-sm font-medium tracking-tight text-foreground/90">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 3H15V8L18 16C18.5 17.5 17.5 19 16 19H8C6.5 19 5.5 17.5 6 16L9 8V3Z" />
            <path d="M9 3H15" />
            <path d="M7 14H17" />
            <circle cx="10" cy="16.5" r="0.5" />
            <circle cx="13" cy="15" r="0.5" />
          </svg>
          TradingLab
        </span>
        <ThemeToggle />
      </div>
    </header>
  );
}
