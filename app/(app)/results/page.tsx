'use client';

import { useRouter } from 'next/navigation';
import { RadarChart } from '@/components/radar-chart';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const STORAGE_KEY = 'maturity-model-state';
const DIMENSIONS = [
  'Evolution',
  'Outcome',
  'Leverage',
  'Sponsorship',
  'Coverage',
  'Alignment',
] as const;

interface DimensionState {
  Evolution: { scoring: number | null; justification: string };
  Outcome: { scoring: number | null; justification: string };
  Leverage: { scoring: number | null; justification: string };
  Sponsorship: { scoring: number | null; justification: string };
  Coverage: { scoring: number | null; justification: string };
  Alignment: { scoring: number | null; justification: string };
  current: string;
  final_report?: {
    executive_summary: string;
    recommendations: Recommendation[];
  };
}

interface Recommendation {
  text: string;
  priority: 'High' | 'Medium' | 'Low';
}

export default function ResultsPage() {
  const router = useRouter();
  const savedState = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
  const dimensionState: DimensionState | null = savedState ? JSON.parse(savedState) : null;

  if (!dimensionState || dimensionState.current !== 'COMPLETED') {
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <p className="mb-4 text-lg">No assessment results found</p>
        <Button onClick={() => router.push('/')} className="mt-4">
          Start New Assessment
        </Button>
      </div>
    );
  }

  const report = dimensionState.final_report;
  if (!report) {
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <p className="mb-4 text-lg">No results data found</p>
        <Button onClick={() => router.push('/')}>Return Home</Button>
      </div>
    );
  }

  const chartData = {
    labels: [...DIMENSIONS],
    datasets: [
      {
        label: 'Maturity Score',
        data: DIMENSIONS.map((dimension) => dimensionState[dimension]?.scoring || 0),
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className={cn('container mx-auto max-w-4xl p-6')}>
      <h1 className="mb-8 text-3xl font-bold">Assessment Results</h1>

      <div className="mb-8 rounded-lg border p-6">
        <h2 className="mb-4 text-xl font-semibold">Maturity Overview</h2>
        <div className="flex h-96 items-center justify-center">
          <RadarChart data={chartData} />
        </div>
      </div>

      <div className="mb-8 rounded-lg border p-6">
        <h2 className="mb-4 text-xl font-semibold">Executive Summary</h2>
        <p className="text-muted-foreground">{report.executive_summary}</p>
      </div>

      <div className="mb-8">
        <h2 className="mb-4 text-xl font-semibold">Recommendations</h2>
        <ul className="space-y-3">
          {report.recommendations.map((rec: Recommendation, i: number) => (
            <li key={i} className="flex items-start gap-3">
              <span
                className={cn(
                  'mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-medium',
                  rec.priority === 'High'
                    ? 'bg-red-100 text-red-800'
                    : rec.priority === 'Medium'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                )}
              >
                {rec.priority.charAt(0)}
              </span>
              <span>{rec.text}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex gap-4">
        <Button onClick={() => router.push('/')}>Start New Assessment</Button>
        <Button variant="outline">Download Report</Button>
      </div>
    </div>
  );
}
