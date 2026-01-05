'use client';

import { useRouter } from 'next/navigation';
import { RadarChart } from '@/components/radar-chart';
import { Button } from '@/components/ui/button';
import { useClearSession } from '@/hooks/useClearSession';
import { DimensionState, Recommendation } from '@/lib/types';
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

export default function ResultsPage() {
  const router = useRouter();
  const { clearSession, isClearing, error } = useClearSession();
  const savedState = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
  const dimensionState: DimensionState | null = savedState ? JSON.parse(savedState) : null;

  const handleStartNewAssessment = async () => {
    try {
      await clearSession();
      // Clear local storage as well
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY);
      }
      router.push('/');
    } catch (err) {
      console.error('Error starting new assessment:', err);
    }
  };

  if (!dimensionState || dimensionState.current !== 'COMPLETED') {
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <p className="mb-4 text-lg">No assessment results found</p>
        <Button onClick={handleStartNewAssessment} className="mt-4" disabled={isClearing}>
          {isClearing ? 'Clearing...' : 'Start New Assessment'}
        </Button>
        {error && <p className="mt-2 text-sm text-red-600">Error: {error}</p>}
      </div>
    );
  }

  const report = dimensionState.final_report;
  if (!report) {
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <p className="mb-4 text-lg">No results data found</p>
        <Button onClick={handleStartNewAssessment} disabled={isClearing}>
          {isClearing ? 'Clearing...' : 'Start New Assessment'}
        </Button>
        {error && <p className="mt-2 text-sm text-red-600">Error: {error}</p>}
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
    <div id="printable-report" className={cn('container mx-auto max-w-4xl p-6')}>
      <h1 className="mb-8 text-3xl font-bold">Assessment Results</h1>

      <div className="mb-8 rounded-lg border p-6">
        <h2 className="mb-4 text-xl font-semibold">Maturity Overview</h2>
        <div className="flex h-96 items-center justify-center">
          <RadarChart data={chartData} />
        </div>
      </div>

      <div className="mt-4 mb-8 rounded-lg border p-6">
        <h2 className="mb-4 text-xl font-semibold">Evaluation Criteria by Dimension</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full rounded-lg border border-gray-200 bg-white text-left text-sm dark:border-gray-700 dark:bg-gray-900">
            <thead>
              <tr className="bg-muted dark:bg-gray-800">
                <th className="border-b border-gray-200 px-4 py-2 font-semibold text-blue-900 dark:border-gray-700 dark:text-blue-100">
                  Dimension
                </th>
                <th className="border-b border-gray-200 px-4 py-2 font-semibold text-blue-900 dark:border-gray-700 dark:text-blue-100">
                  Criteria Explained
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              <tr>
                <td className="px-4 py-2 font-medium text-blue-800 dark:text-blue-200">
                  Evolution
                </td>
                <td className="text-muted-foreground px-4 py-2">
                  This dimension refers to the maturity of AI-based solutions developed internally
                  by the company, moving from PoCs to MVPs to fully-functional or enterprise-grade
                  applications.
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium text-blue-800 dark:text-blue-200">Outcome</td>
                <td className="text-muted-foreground px-4 py-2">
                  This dimension evaluates whether the company is tracking and achieving concrete
                  business outcomes from their AI initiatives. It includes measurements like ROI,
                  efficiency gains, cost reduction, or customer satisfaction improvements. Business
                  impact is essential to justify AI investments.
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium text-blue-800 dark:text-blue-200">Leverage</td>
                <td className="text-muted-foreground px-4 py-2">
                  This dimension assesses how AI is applied across the organization, from
                  unstructured, individual use to strategic, multi-area implementation with
                  increasing levels of autonomy. The goal is to understand the functional maturity
                  of AI use in terms of assistance level.
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium text-blue-800 dark:text-blue-200">
                  Sponsorship
                </td>
                <td className="text-muted-foreground px-4 py-2">
                  This dimension measures the level of executive support and financial investment
                  dedicated to AI initiatives. It reflects whether AI is a strategic priority for
                  the leadership team and if dedicated resources are allocated.
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium text-blue-800 dark:text-blue-200">Coverage</td>
                <td className="text-muted-foreground px-4 py-2">
                  This dimension evaluates the breadth of AI adoption across the organization — how
                  many business areas or workflows are impacted by AI, and how deeply it is
                  integrated into core operations.
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium text-blue-800 dark:text-blue-200">
                  Alignment
                </td>
                <td className="text-muted-foreground px-4 py-2">
                  This dimension evaluates whether there is a coherent, standardized, and strategic
                  approach to how generative AI is used across the company. It focuses on
                  governance, infrastructure, collaboration across teams, and flexibility to adapt
                  to the evolving AI landscape.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="mb-8 rounded-lg border p-6">
        <h2 className="mb-4 text-xl font-semibold">Executive Summary</h2>
        {report.executive_summary
          .split(/\n\n/)
          .filter((para: string) => para.trim() !== '')
          .map((para: string, idx: number) => (
            <p key={idx} className="text-muted-foreground mb-4 last:mb-0">
              {para.split('\n').map((line, i) => (
                <span key={i}>
                  {line}
                  {i !== para.split('\n').length - 1 && <br />}
                </span>
              ))}
            </p>
          ))}
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

      <div className="no-print flex gap-4">
        <Button onClick={handleStartNewAssessment} disabled={isClearing}>
          {isClearing ? 'Clearing...' : 'Start New Assessment'}
        </Button>
        <Button variant="outline" onClick={() => window.print()}>
          Download Report
        </Button>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">Error: {error}</p>}
    </div>
  );
}
