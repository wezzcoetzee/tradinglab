import { CsvUpload } from '@/components/csv-upload';
import { StrategyConfig } from '@/components/strategy-config';

export default function Home() {
  return (
    <div className="flex min-h-screen items-start justify-center p-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-7xl">
        <CsvUpload />
        <StrategyConfig />
      </div>
    </div>
  );
}
