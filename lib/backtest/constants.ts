export const PERCENTAGE_DIVISOR = 100;

export const ATR_PERIODS = [10, 14, 20] as const;
export const ATR_MULTIPLIERS = [2, 2.5, 3, 3.5, 4] as const;
export const ATR_CLOSE_PERCENTS = [10, 25, 50, 100] as const;

export const WARMUP_DAYS = 160;

export const WORKER_PROGRESS_INTERVAL = 100;

/** With ATR enabled the config count is too large to keep every result, so only the best are kept. */
export const TOP_K_RESULTS = 1000;
