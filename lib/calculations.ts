/**
 * Trading calculation utilities for risk management
 * All formulas follow standard financial industry practices
 */

export interface PositionCalculationInput {
  tradeType: 'LONG' | 'SHORT';
  entryPrice: number;
  stopLossPrice: number;
  leverage: number;
  riskAmount: number;
}

export interface ProfitCalculationInput {
  tradeType: 'LONG' | 'SHORT';
  entryPrice: number;
  stopLossPrice: number;
  leverage: number;
  positionSize: number;
  takeProfits: number[];
}

export interface PositionCalculationResult {
  positionSize: number;
  margin: number;
  potentialLoss: number;
  riskPercentage: number;
}

export interface TakeProfitBreakdown {
  price: number;
  profit: number;
  riskReward: number;
}

export interface ProfitCalculationResult {
  profits: number[];
  roi: number;
  primaryRiskReward: number;
  averageRiskReward: number;
  potentialLoss: number;
  margin: number;
  totalProfit: number;
  averageProfit: number;
  takeProfitBreakdown: TakeProfitBreakdown[];
}

/**
 * Calculate optimal position size based on risk tolerance
 */
export function calculatePositionSize(input: PositionCalculationInput): PositionCalculationResult {
  const { entryPrice, stopLossPrice, leverage, riskAmount } = input;
  
  // Calculate risk per unit (absolute price distance to stop loss)
  const riskPerUnit = Math.abs(stopLossPrice - entryPrice);
  
  // Calculate risk percentage (for display purposes)
  const riskPercentage = (riskPerUnit / entryPrice) * 100;
  
  // Position size calculation:
  // Units needed = Risk Amount / Risk per unit
  // Leverage only affects margin requirements, not P&L
  const positionSize = riskAmount / riskPerUnit;
  
  // Calculate notional value of the position
  const notionalValue = positionSize * entryPrice;
  
  // Margin required = Notional Value / Leverage
  const margin = notionalValue / leverage;
  
  // Potential loss should equal the risk amount
  const potentialLoss = riskAmount;
  
  return {
    positionSize,
    margin,
    potentialLoss,
    riskPercentage
  };
}

/**
 * Calculate profit metrics for trading positions
 */
export function calculateProfitMetrics(input: ProfitCalculationInput): ProfitCalculationResult {
  const { tradeType, entryPrice, stopLossPrice, leverage, positionSize, takeProfits } = input;

  // Calculate potential loss (full position hits stop before any TP)
  const riskPercentage = Math.abs(stopLossPrice - entryPrice) / entryPrice;
  const potentialLoss = riskPercentage * positionSize;

  // Filter valid take profits first to determine allocation
  const validTakeProfits = takeProfits.filter(tp => tp > 0);
  const numTargets = validTakeProfits.length;

  // Position is split equally across all take profit levels
  // e.g., 2 TPs = 50% each, 4 TPs = 25% each
  const positionPerTarget = numTargets > 0 ? positionSize / numTargets : 0;

  // Calculate profit at each take profit level with allocated position
  const profits = validTakeProfits.map(tp => {
    const profitPercentage = tradeType === 'LONG'
      ? (tp - entryPrice) / entryPrice
      : (entryPrice - tp) / entryPrice;

    if (profitPercentage <= 0) return 0;

    return profitPercentage * positionPerTarget;
  }).filter(profit => profit > 0);

  // Calculate metrics
  const totalProfit = profits.reduce((sum, profit) => sum + profit, 0);
  const averageProfit = profits.length > 0 ? totalProfit / profits.length : 0;
  const margin = positionSize / leverage;
  const roi = margin > 0 ? (totalProfit / margin) * 100 : 0;

  // Risk/Reward based on total profit vs potential loss
  const primaryRiskReward = potentialLoss > 0 ? totalProfit / potentialLoss : 0;
  const averageRiskReward = potentialLoss > 0 ? averageProfit / potentialLoss : 0;

  // Build take profit breakdown with individual profits and R:R
  const takeProfitBreakdown: TakeProfitBreakdown[] = validTakeProfits.map((tp, index) => ({
    price: tp,
    profit: profits[index] || 0,
    riskReward: potentialLoss > 0 ? (profits[index] || 0) / potentialLoss : 0
  }));

  return {
    profits,
    roi,
    primaryRiskReward,
    averageRiskReward,
    potentialLoss,
    margin,
    totalProfit,
    averageProfit,
    takeProfitBreakdown
  };
}

/**
 * Validate trading input parameters
 */
export function validateTradingParameters(
  tradeType: 'LONG' | 'SHORT',
  entryPrice: number,
  stopLossPrice: number,
  takeProfits: number[] = []
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Basic validations
  if (entryPrice <= 0) errors.push('Entry price must be positive');
  if (stopLossPrice <= 0) errors.push('Stop loss must be positive');
  
  // Trade type specific validations
  if (tradeType === 'LONG') {
    if (stopLossPrice >= entryPrice) {
      errors.push('For LONG positions, stop loss must be below entry price');
    }
    takeProfits.forEach((tp, index) => {
      if (tp > 0 && tp <= entryPrice) {
        errors.push(`Take profit ${index + 1} must be above entry price for LONG positions`);
      }
    });
  } else {
    if (stopLossPrice <= entryPrice) {
      errors.push('For SHORT positions, stop loss must be above entry price');
    }
    takeProfits.forEach((tp, index) => {
      if (tp > 0 && tp >= entryPrice) {
        errors.push(`Take profit ${index + 1} must be below entry price for SHORT positions`);
      }
    });
  }
  
  // Check take profit order
  const validTPs = takeProfits.filter(tp => tp > 0).sort((a, b) => 
    tradeType === 'LONG' ? a - b : b - a
  );
  
  for (let i = 0; i < validTPs.length - 1; i++) {
    if (tradeType === 'LONG' && validTPs[i] >= validTPs[i + 1]) {
      errors.push('Take profit levels must be in ascending order for LONG positions');
      break;
    }
    if (tradeType === 'SHORT' && validTPs[i] <= validTPs[i + 1]) {
      errors.push('Take profit levels must be in descending order for SHORT positions');
      break;
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

export { formatCurrency, formatPercentage, safeParseFloat } from "./formatters";