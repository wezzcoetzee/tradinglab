import { ThemeToggle } from '@/components/theme-toggle';

export function Header() {
  return (
    <header className="sticky top-0 z-50 h-14 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between">
        <h1 className="font-mono text-sm font-medium tracking-tight text-foreground/90">
          Simply The Best
        </h1>
        <ThemeToggle />
      </div>
    </header>
  );
}
