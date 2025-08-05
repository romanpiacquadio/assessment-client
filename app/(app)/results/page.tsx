'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { RadarChart } from '@/components/radar-chart';

const STORAGE_KEY = 'maturity-model-state';

interface DimensionState {
  Evolution: { scoring: number | null; justification: string };
  Outcome: { scoring: number | null; justification: string };
  current: string;
  final_report?: {
    executive_summary: string;
    recommendations: Array<{
      text: string;
      priority: 'High' | 'Medium' | 'Low';
    }>;
  };
}

interface Recommendation {
  text: string;
  priority: 'High' | 'Medium' | 'Low';
}

export default function ResultsPage() {
  const router = useRouter();
  const savedState = typeof window !== 'undefined' 
    ? localStorage.getItem(STORAGE_KEY)
    : null;
  const dimensionState = savedState ? JSON.parse(savedState) : null;
  
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
    labels: ['Evolution', 'Outcome','Leverage', 'Sponsorship', 'Coverage', 'Alignment'],
    datasets: [{
      label: 'Maturity Score',
      data: [
        dimensionState.Evolution?.scoring || 0,
        dimensionState.Outcome?.scoring || 0,
        dimensionState.Leverage?.scoring || 0,
        dimensionState.Sponsorship?.scoring || 0,
        dimensionState.Coverage?.scoring || 0,
        dimensionState.Alignment?.scoring || 0
      ],
      backgroundColor: 'rgba(99, 102, 241, 0.2)',
      borderColor: 'rgba(99, 102, 241, 1)',
      borderWidth: 2
    }]
  };

  return (
    <div className={cn('container mx-auto max-w-4xl p-6')}>
      <h1 className="mb-8 text-3xl font-bold">Assessment Results</h1>
      
      <div className="mb-8 rounded-lg border p-6">
        <h2 className="mb-4 text-xl font-semibold">Maturity Overview</h2>
        <div className="h-96 flex justify-center items-center">
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
          {report.recommendations.map((rec, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className={cn(
                'mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-medium',
                rec.priority === 'High' ? 'bg-red-100 text-red-800' :
                rec.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              )}>
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
