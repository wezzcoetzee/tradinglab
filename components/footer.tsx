export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background/95 backdrop-blur py-6">
      <div className="mx-auto max-w-7xl px-8">
        <p className="text-sm text-muted-foreground text-right">
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
