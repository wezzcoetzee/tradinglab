import Link from 'next/link';

const NAV_LINKS = [
  { href: '/backtester', label: 'Backtester' },
  { href: '/calculator/position-size', label: 'Position Size Calculator' },
  { href: '/calculator/profit', label: 'Profit Calculator' },
  { href: '/guides', label: 'Guides' },
];

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background/95 backdrop-blur py-6">
      <div className="mx-auto max-w-7xl px-8">
        <nav aria-label="Footer navigation" className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-4">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <p className="text-sm text-muted-foreground text-center">
          © {new Date().getFullYear()}{" "}
          <a
            href="https://wezzcoetzee.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4 hover:text-foreground transition-colors"
          >
            wezzcoetzee.com
          </a>
        </p>
      </div>
    </footer>
  );
}
