'use client';

import { useState, useEffect } from 'react';
import { Settings, AlertCircle, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { validateStrategyConfig } from '@/lib/strategy-validator';
import { DEFAULT_STRATEGY_CONFIG } from '@/lib/types';
import type { StrategyConfig, StrategyConfigValidation } from '@/lib/types';

interface StrategyConfigProps {
  onConfigChange?: (config: StrategyConfig | null) => void;
}

export function StrategyConfigForm({ onConfigChange }: StrategyConfigProps) {
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
    const newConfig: StrategyConfig = { ...config, atrEnabled: checked };
    setConfig(newConfig);
    setTouched({ ...touched, atrEnabled: true });
    setValidation(validateStrategyConfig(newConfig));
  };

  const shouldShowError = validation && !validation.valid && Object.keys(touched).length > 0;

  useEffect(() => {
    const result = validateStrategyConfig(config);
    onConfigChange?.(result.valid ? config : null);
  }, [config, onConfigChange]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" aria-hidden="true" />
          Strategy Configuration
        </CardTitle>
        <CardDescription>
          Configure starting capital, fees, and ATR trailing stop loss
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
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
              autoComplete="off"
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
              autoComplete="off"
            />
          </div>

          <div className="space-y-2">
            <Label className="invisible">Toggle</Label>
            <div className="flex items-center space-x-2 h-9">
              <Switch
                id="atrEnabled"
                checked={config.atrEnabled}
                onCheckedChange={handleAtrEnabledChange}
              />
              <Label htmlFor="atrEnabled" className="cursor-pointer text-sm font-medium whitespace-nowrap">
                ATR Stop Loss
              </Label>
            </div>
          </div>
        </div>

        {config.atrEnabled && (
          <div className="flex items-start gap-2 text-sm text-muted-foreground bg-muted/50 rounded-md p-3">
            <Info className="h-4 w-4 mt-0.5 shrink-0" />
            <span>
              Optimization tests 60 ATR configurations: periods (10, 14, 20) × multipliers (2, 2.5, 3, 3.5, 4) × close % (10, 25, 50, 100)
            </span>
          </div>
        )}

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
