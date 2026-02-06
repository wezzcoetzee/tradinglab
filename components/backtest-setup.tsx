'use client';

import { useState, useRef } from 'react';
import Papa from 'papaparse';
import { Upload, FileText, AlertCircle, CheckCircle2, Info, Download, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { validateCsv } from '@/lib/csv-validator';
import type { CsvRow, ValidationResult } from '@/lib/types';

interface BacktestSetupProps {
  onDataLoaded?: (data: CsvRow[]) => void;
  actionButton?: React.ReactNode;
}

export function BacktestSetup({ onDataLoaded, actionButton }: BacktestSetupProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      setResult({
        valid: false,
        error: 'Invalid file type. Please upload a .csv file.'
      });
      return;
    }

    setIsLoading(true);
    setResult(null);
    setFileName(file.name);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const validation = validateCsv(results.data);
        setResult(validation);
        setIsLoading(false);
        if (validation.valid && validation.data) {
          onDataLoaded?.(validation.data);
        }
      },
      error: (error) => {
        setResult({
          valid: false,
          error: `Failed to parse CSV: ${error.message}`
        });
        setIsLoading(false);
      }
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" aria-hidden="true" />
          Backtest Setup
        </CardTitle>
        <CardDescription className="flex items-center gap-1.5">
          Upload CSV with high, low, close, date columns
          <Dialog>
            <DialogTrigger asChild>
              <button
                type="button"
                className="inline-flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                aria-label="CSV format info"
              >
                <Info className="h-4 w-4" />
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>CSV Format Requirements</DialogTitle>
                <DialogDescription>
                  Your CSV file must contain the following columns:
                </DialogDescription>
              </DialogHeader>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li><strong>date</strong> - Date in YYYY-MM-DD format</li>
                <li><strong>high</strong> - Daily high price</li>
                <li><strong>low</strong> - Daily low price</li>
                <li><strong>close</strong> - Daily close price</li>
              </ul>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="mt-2">
                    <Download className="mr-2 h-4 w-4" />
                    Download Example CSV
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem asChild>
                    <a href="/BTC.csv" download>BTC</a>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <a href="/ETH.csv" download>ETH</a>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <a href="/SOL.csv" download>SOL</a>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </DialogContent>
          </Dialog>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          className="hidden"
          aria-label="Upload CSV file"
        />

        <div className="flex gap-3">
          <Button
            onClick={handleButtonClick}
            disabled={isLoading}
            variant="outline"
            size="lg"
            className="flex-1"
          >
            <Upload className="mr-2 h-4 w-4" />
            {isLoading ? 'Processing…' : 'Select CSV File'}
          </Button>
          {actionButton}
        </div>

        {result && result.valid && (
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>
              {fileName} validated. {result.rowCount} rows loaded.
            </AlertDescription>
          </Alert>
        )}

        {result && !result.valid && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Validation Error</AlertTitle>
            <AlertDescription>{result.error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
