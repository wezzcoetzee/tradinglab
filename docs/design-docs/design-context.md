# Design Context

## Users
Beginner crypto traders learning risk management. They may be overwhelmed by complex trading interfaces, so clarity and guidance matter more than information density. They use TradingLab to size positions, calculate profits, backtest strategies, and learn through guides.

## Brand Personality
Calm, trustworthy, clear. The interface should feel like a knowledgeable mentor — not a Wall Street terminal, not a flashy startup. Users should feel confident they're making informed decisions.

## Aesthetic Direction
- **Visual tone**: Clean and restrained with purposeful data presentation. Monochromatic base (Geist font, grayscale palette) with gold accent from the brand mark and semantic green/red for profit/loss.
- **References**: TradingView (data-native, dark mode done right), Linear/Vercel (minimal, monochrome, polished).
- **Anti-references**: Overly dense Bloomberg-style UIs. Flashy crypto bro aesthetics with neon gradients. Gamified trading apps that trivialize risk.
- **Theme**: Light and dark mode. Dark mode is the primary context for traders.
- **Typography**: Geist Sans for UI, Geist Mono with tabular-nums for financial data (`.data-mono` class).
- **Motion**: Subtle and functional — fade-slide-in with stagger for page loads, card hover lift, ticker scroll. No decorative animation.

## Design Principles
1. **Clarity over density** — Beginners need to understand what they're looking at. Favor whitespace, clear labels, and progressive disclosure over packing in data.
2. **Numbers are sacred** — Financial data must be unambiguous: monospace, aligned, consistent decimal places, semantic color (green=profit, red=loss). Never truncate or round without indication.
3. **Calm confidence** — The UI should feel steady and reliable. No urgent pulsing, no FOMO triggers. Muted palette with restrained use of color for meaning, not decoration.
4. **Teach, don't assume** — Provide context for trading concepts. Tooltips, guides, and inline help are features, not clutter. The user is here to learn.
5. **Responsive and fast** — Web workers for heavy computation, skeleton states for loading, accessible keyboard navigation. The tool should feel instant.
