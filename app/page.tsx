import { CsvUpload } from '@/components/csv-upload';
import { ResultsTable } from '@/components/results-table';
import { StrategyConfig } from '@/components/strategy-config';

export default function Home() {
  return (
    <div className="flex min-h-screen items-start justify-center p-8">
      <div className="flex flex-col gap-8 w-full max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <CsvUpload />
          <StrategyConfig />
        </div>
        <ResultsTable results={[]} />
      </div>
    </div>
  );
}
