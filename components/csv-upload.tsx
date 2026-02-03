'use client';

import { useState, useRef } from 'react';
import Papa from 'papaparse';
import { Upload, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { validateCsv } from '@/lib/csv-validator';
import type { CsvRow, ValidationResult } from '@/lib/types';

interface CsvUploadProps {
  onDataLoaded?: (data: CsvRow[]) => void;
  actionButton?: React.ReactNode;
}

export function CsvUpload({ onDataLoaded, actionButton }: CsvUploadProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ValidationResult | null>(null);
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
          CSV Upload
        </CardTitle>
        <CardDescription>
          Upload your crypto backtest data (time, high, low, close, RSI, date)
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
              CSV validated. {result.rowCount} rows loaded.
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
