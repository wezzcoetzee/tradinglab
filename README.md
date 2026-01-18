# Simply The Best - BTC Trading Strategy Analyzer

A Bitcoin trading strategy backtesting and optimization application built with TanStack Start, React, and Prisma. Analyze moving average crossover strategies with configurable leverage, fees, and position management.

## Features

- **Strategy Backtesting**: Compare SMA and EMA-based trading strategies against HODL
- **Parameter Configuration**: Adjust MA duration, leverage, fees, and position settings
- **MA Duration Optimization**: Find optimal moving average periods across a configurable range
- **Interactive Charts**: Visualize returns, price action, and optimization results
- **Performance Metrics**: Annualized returns, max drawdown, and trade counts

## Tech Stack

- **Framework**: [TanStack Start](https://tanstack.com/start) with React 19
- **Database**: PostgreSQL with [Prisma ORM](https://www.prisma.io/)
- **Styling**: Tailwind CSS 4 with Base UI components
- **Charts**: Recharts
- **Runtime**: Bun

## Prerequisites

- [Bun](https://bun.sh/) installed
- PostgreSQL database

## Getting Started

### 1. Clone and Install Dependencies

```bash
bun install
```

### 2. Configure Environment

Copy the example environment file and configure your database:

```bash
cp .env.example .env
```

Edit `.env` with your PostgreSQL connection string:

```
DATABASE_URL=postgresql://user:password@localhost:5432/simply_the_best
```

### 3. Set Up Database

Generate the Prisma client and run migrations:

```bash
bunx prisma generate
bunx prisma db push
```

### 4. Seed the Database

The project includes historical BTC price data. Seed it to the database:

```bash
bun run prisma/seed.ts
```

### 5. Run the Development Server

```bash
bun --bun run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

## Project Structure

```
├── data/                    # Raw data files
│   ├── btc-price-data.json  # Extracted BTC price history
│   └── btc 2025-10.xlsm     # Source Excel file
├── generated/prisma/        # Generated Prisma client
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── seed.ts              # Database seeder
├── scripts/
│   └── extract-excel.ts     # Excel to JSON extraction script
├── src/
│   ├── components/
│   │   ├── trading/         # Trading-specific components
│   │   └── ui/              # Reusable UI components
│   ├── data/
│   │   └── trading.server.ts # Server functions for data fetching
│   ├── lib/
│   │   ├── calculations/    # Strategy calculation logic
│   │   │   ├── indicators.ts  # SMA/EMA calculations
│   │   │   ├── signals.ts     # Signal generation
│   │   │   ├── returns.ts     # Return calculations
│   │   │   └── optimizer.ts   # MA period optimization
│   │   ├── types/
│   │   │   └── trading.ts   # TypeScript type definitions
│   │   └── db.ts            # Prisma client singleton
│   └── routes/
│       ├── index.tsx        # Redirects to /trading
│       └── trading/
│           ├── index.tsx    # Main dashboard
│           └── optimize.tsx # Optimization page
└── public/                  # Static assets
```

## Strategy Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `maDuration` | Moving average period (days) | 44 |
| `buyOnLongSignal` | Enter long when price > MA | true |
| `shortOnShort` | Enter short when price < MA | false |
| `longLeverage` | Leverage multiplier for longs | 2.25x |
| `shortLeverage` | Leverage multiplier for shorts | 1.0x |
| `initialCapital` | Starting capital | $1,000 |
| `gasFeePerTrade` | Fixed fee per trade | $0 |
| `exchangeFee` | Percentage fee per trade | 0.05% |

## How It Works

### Signal Generation
- **Long Signal**: Price closes above the moving average
- **Short Signal**: Price closes below the moving average

### Strategy Execution
1. When a long signal appears (and `buyOnLongSignal` is enabled), enter a long position
2. When a short signal appears (and `shortOnShort` is enabled), enter a short position
3. Apply leverage to amplify returns
4. Deduct fees on position entry and exit

### Calculations
- **Annualized Return**: Compounded annual growth rate over the data period
- **Max Drawdown**: Largest peak-to-trough decline in portfolio value
- **Trade Count**: Number of completed round-trip trades

## Scripts

### Extract Price Data from Excel

If you need to update the price data from a new Excel file:

```bash
bun run scripts/extract-excel.ts
```

### Run Tests

```bash
bun --bun run test
```

### Build for Production

```bash
bun --bun run build
```

## Database Schema

### PriceData
Stores historical BTC daily price data:
- `unixTimestamp`: Unix timestamp (unique index)
- `date`: Date of the price
- `closePrice`: Daily closing price

### StrategyConfig
Stores saved strategy configurations:
- `name`: Configuration name (unique)
- Strategy parameters (maDuration, leverage, fees, etc.)

## License

MIT
