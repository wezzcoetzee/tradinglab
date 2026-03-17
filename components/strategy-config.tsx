'use client';

import { useState, useEffect } from 'react';
import { Settings, AlertCircle } from 'lucide-react';
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

  const handleChange = (field: keyof StrategyConfig, parser: (v: string) => number) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parser(e.target.value);
      setConfig((prev) => ({ ...prev, [field]: isNaN(value) ? 0 : value }));
    };

  const handleBlur = (field: string) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setValidation(validateStrategyConfig(config));
  };

  const handleAtrEnabledChange = (checked: boolean) => {
    const newConfig: StrategyConfig = { ...config, atrEnabled: checked };
    setConfig(newConfig);
    setTouched((prev) => ({ ...prev, atrEnabled: true }));
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startingCapital">Starting Capital ($)</Label>
            <Input
              id="startingCapital"
              type="number"
              min="0"
              step="100"
              value={config.startingCapital}
              onChange={handleChange('startingCapital', parseFloat)}
              onBlur={handleBlur('startingCapital')}
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
              onChange={handleChange('tradingFee', parseFloat)}
              onBlur={handleBlur('tradingFee')}
              autoComplete="off"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="smaMin">SMA Min</Label>
            <Input
              id="smaMin"
              type="number"
              min="2"
              max="50"
              step="1"
              value={config.smaMin}
              onChange={handleChange('smaMin', (v) => parseInt(v, 10))}
              onBlur={handleBlur('smaMin')}
              autoComplete="off"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="smaMax">SMA Max</Label>
            <Input
              id="smaMax"
              type="number"
              min="3"
              step="1"
              value={config.smaMax}
              onChange={handleChange('smaMax', (v) => parseInt(v, 10))}
              onBlur={handleBlur('smaMax')}
              autoComplete="off"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="atrEnabled">ATR Stop Loss</Label>
            <div className="flex items-center h-9">
              <Switch
                id="atrEnabled"
                checked={config.atrEnabled}
                onCheckedChange={handleAtrEnabledChange}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          Tests SMA periods with leverage 1×, 1.25×, 1.5×, 1.75×, 2×, 2.25×, 2.5×, 2.75×, 3×
        </div>

        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          Tests 60 ATR configurations: periods (10, 14, 20) × multipliers (2, 2.5, 3, 3.5, 4) × close % (10, 25, 50, 100)
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
