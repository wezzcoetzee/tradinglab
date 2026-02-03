'use client';

import { useState } from 'react';
import { Settings, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { validateStrategyConfig } from '@/lib/strategy-validator';
import {
  DEFAULT_STRATEGY_CONFIG,
  ATR_PERIOD_OPTIONS,
  ATR_MULTIPLIER_OPTIONS,
  ATR_CLOSE_PERCENT_OPTIONS,
} from '@/lib/types';
import type { StrategyConfig, StrategyConfigValidation } from '@/lib/types';

export function StrategyConfig() {
  const [config, setConfig] = useState<StrategyConfig>(DEFAULT_STRATEGY_CONFIG);
  const [validation, setValidation] = useState<StrategyConfigValidation | null>(null);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleStartingCapitalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setConfig({ ...config, startingCapital: isNaN(value) ? 0 : value });
  };

  const handleStartingCapitalBlur = () => {
    setTouched({ ...touched, startingCapital: true });
    setValidation(validateStrategyConfig(config));
  };

  const handleTradingFeeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setConfig({ ...config, tradingFee: isNaN(value) ? 0 : value });
  };

  const handleTradingFeeBlur = () => {
    setTouched({ ...touched, tradingFee: true });
    setValidation(validateStrategyConfig(config));
  };

  const handleAtrEnabledChange = (checked: boolean) => {
    const newConfig: StrategyConfig = checked
      ? {
          ...config,
          atrEnabled: true,
          atrPeriod: 14,
          atrMultiplier: 3,
          atrClosePercent: 100,
        }
      : {
          ...config,
          atrEnabled: false,
          atrPeriod: undefined,
          atrMultiplier: undefined,
          atrClosePercent: undefined,
        };

    setConfig(newConfig);
    setTouched({ ...touched, atrEnabled: true });
    setValidation(validateStrategyConfig(newConfig));
  };

  const handleAtrPeriodChange = (value: string) => {
    setConfig({ ...config, atrPeriod: parseInt(value) as 10 | 14 | 20 });
  };

  const handleAtrMultiplierChange = (value: string) => {
    setConfig({ ...config, atrMultiplier: parseFloat(value) as 2 | 2.5 | 3 | 3.5 | 4 });
  };

  const handleAtrClosePercentChange = (value: string) => {
    setConfig({ ...config, atrClosePercent: parseInt(value) as 10 | 25 | 50 | 100 });
  };

  const shouldShowError = validation && !validation.valid && Object.keys(touched).length > 0;

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Strategy Configuration
        </CardTitle>
        <CardDescription>
          Configure starting capital, fees, and optional ATR trailing stop loss
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="startingCapital">Starting Capital ($)</Label>
            <Input
              id="startingCapital"
              type="number"
              min="0"
              step="100"
              value={config.startingCapital}
              onChange={handleStartingCapitalChange}
              onBlur={handleStartingCapitalBlur}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tradingFee">Trading Fee (%)</Label>
            <Input
              id="tradingFee"
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={config.tradingFee}
              onChange={handleTradingFeeChange}
              onBlur={handleTradingFeeBlur}
            />
          </div>
        </div>

        <div className="space-y-4 border-t pt-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="atrEnabled"
              checked={config.atrEnabled}
              onCheckedChange={handleAtrEnabledChange}
            />
            <Label htmlFor="atrEnabled" className="cursor-pointer">
              Enable ATR Trailing Stop Loss
            </Label>
          </div>

          {config.atrEnabled && (
            <div className="space-y-4 pl-6">
              <div className="space-y-2">
                <Label htmlFor="atrPeriod">ATR Period</Label>
                <Select
                  value={config.atrPeriod?.toString()}
                  onValueChange={handleAtrPeriodChange}
                >
                  <SelectTrigger id="atrPeriod">
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    {ATR_PERIOD_OPTIONS.map((period) => (
                      <SelectItem key={period} value={period.toString()}>
                        {period}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="atrMultiplier">ATR Multiplier</Label>
                <Select
                  value={config.atrMultiplier?.toString()}
                  onValueChange={handleAtrMultiplierChange}
                >
                  <SelectTrigger id="atrMultiplier">
                    <SelectValue placeholder="Select multiplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {ATR_MULTIPLIER_OPTIONS.map((multiplier) => (
                      <SelectItem key={multiplier} value={multiplier.toString()}>
                        {multiplier}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="atrClosePercent">ATR Close Position (%)</Label>
                <Select
                  value={config.atrClosePercent?.toString()}
                  onValueChange={handleAtrClosePercentChange}
                >
                  <SelectTrigger id="atrClosePercent">
                    <SelectValue placeholder="Select close %" />
                  </SelectTrigger>
                  <SelectContent>
                    {ATR_CLOSE_PERCENT_OPTIONS.map((percent) => (
                      <SelectItem key={percent} value={percent.toString()}>
                        {percent}%
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>

        {shouldShowError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Validation Error</AlertTitle>
            <AlertDescription>{validation.error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
