# Design System

## Foundation

- **Component library:** ShadCN (new-york style) on Radix UI primitives
- **Styling:** Tailwind CSS 4 with CSS variables
- **Icons:** Lucide React
- **Fonts:** Geist Sans (`--font-geist-sans`) + Geist Mono (`--font-geist-mono`)
- **Base color:** Neutral

## Theming

Dark/light mode via `next-themes`. Theme toggle in header. System preference respected on first visit.

CSS variables defined in `app/globals.css` handle all color tokens. ShadCN components consume these automatically.

Key semantic tokens:
- `--background`, `--foreground` — page background and text
- `--card`, `--card-foreground` — card surfaces
- `--primary`, `--primary-foreground` — buttons, active states
- `--muted`, `--muted-foreground` — secondary text, descriptions
- `--destructive` — error states, liquidation indicators
- `--border`, `--input`, `--ring` — form controls

## Layout

- Multi-page app, centered content with `max-w-7xl`
- Sticky header with logo + navigation + theme toggle
- Two-column grid (`lg:grid-cols-2`) for setup/config and calculator forms
- Full-width for results section
- Card grid for guides index
- Responsive: stacks to single column on mobile

## Color Conventions for Financial Data

| Meaning | Class |
|---------|-------|
| Positive return | `text-green-*` |
| Negative return | `text-red-*` |
| Neutral / zero | Default foreground |
| Liquidated | `text-destructive` |
| Beat buy-and-hold | Green background tint |
| Underperformed hold | Red background tint |

These are applied via utility functions in `lib/format.ts`: `getReturnColorClass()`, `getVsHoldColorClass()`, `getVsHoldBackgroundClass()`.

## Component Inventory

### ShadCN Primitives (`components/ui/`)

Alert, Badge, Button, Card, Chart, Checkbox, Dialog, DropdownMenu, Input, Label, Pagination, Select, Switch, Table

### Adding New ShadCN Components

```bash
bunx --bun shadcn@latest add [component-name]
```

## Responsive Breakpoints

Standard Tailwind breakpoints. Key responsive patterns:
- Setup grid: `grid-cols-1 lg:grid-cols-2`
- Tables: horizontal scroll on mobile
- Heading: `text-3xl sm:text-4xl`
- Content padding: `px-8 pb-8`

## Animation

`tw-animate-css` package provides Tailwind animation utilities. Used sparingly — primarily for progress indicators and transitions.
