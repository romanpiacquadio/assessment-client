import * as React from 'react';
import { FileChartColumnIncreasing } from 'lucide-react';
import { Button, Container, Heading, Html, Section, Text } from '@react-email/components';
import { DimensionState } from '@/lib/types';
import { RadarChart } from './radar-chart';

const DIMENSIONS = [
  'Evolution',
  'Outcome',
  'Leverage',
  'Sponsorship',
  'Coverage',
  'Alignment',
] as const;

export const DimensionEmailTemplate = ({
  partialFeedbackDimension,
  dimensionState,
}: {
  partialFeedbackDimension: string | null;
  dimensionState: DimensionState | null;
}) => {
  const chartData = {
    labels: [...DIMENSIONS],
    datasets: [
      {
        label: `${partialFeedbackDimension} Score`,
        data: DIMENSIONS.map((dimension) => dimensionState?.[dimension]?.scoring || 0),
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 2,
      },
    ],
  };

  return (
    <Html>
      <Section style={main}>
        <Container style={container}>
          <Heading style={h1}>Partial Feedback for {partialFeedbackDimension}!</Heading>

          <div className="relative w-full overflow-hidden rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 shadow-lg dark:border-blue-800 dark:from-blue-950/50 dark:to-indigo-950/50">
            {/* Main content */}
            <div className="relative z-10 flex items-start gap-4">
              {/* Icon with animation */}
              <div className="relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg">
                  <FileChartColumnIncreasing className="h-6 w-6" />
                </div>
              </div>

              {/* Text content */}
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                    Analyzed Dimension: {partialFeedbackDimension}
                  </h3>
                </div>

                <p className="mb-2 text-sm text-blue-700 dark:text-blue-300">
                  Partial feedback generated for:{' '}
                  <span className="font-medium text-blue-900 dark:text-blue-100">
                    {partialFeedbackDimension}
                  </span>
                </p>
              </div>
            </div>

            {/* Partial feedback overview */}
            <div>
              <div className="mb-8 rounded-lg border p-6">
                <h2 className="mb-4 text-xl font-semibold">{partialFeedbackDimension} Overview</h2>
                <div className="flex flex-row items-center justify-center gap-8">
                  {/* Centered RadarChart */}
                  <div className="flex w-2/5 items-center justify-center">
                    <RadarChart data={chartData} />
                  </div>
                  {/* Recommendations */}
                  <div className="flex w-full flex-1 flex-col justify-center">
                    <h2 className="text-l mb-4 text-center font-semibold text-blue-900 dark:text-blue-100">
                      Action Points for: {partialFeedbackDimension}
                    </h2>
                    {dimensionState?.[partialFeedbackDimension ?? 'Evolution'].partial_feedback.map(
                      (recommendation: string, index: number) => (
                        <div
                          key={index}
                          className="my-2 flex items-center justify-center rounded-lg bg-sky-200 px-4 py-2 text-center text-xs font-medium shadow-sm transition-all duration-200 hover:bg-sky-200 dark:bg-sky-900 dark:hover:bg-sky-800"
                          style={{
                            maxWidth: 700,
                            minWidth: 350,
                            marginTop: '0.2rem',
                            marginBottom: '0.2rem',
                            marginLeft: 'auto',
                            marginRight: 'auto',
                          }}
                        >
                          {recommendation}
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="no-print relative z-20 mt-4 flex justify-end gap-2">
              {/* Button to send email */}
              <Button
                className="font:bg-green-500 rounded-md bg-blue-500 px-4 py-2 text-xs font-bold text-white uppercase transition-colors hover:bg-blue-600 focus:bg-blue-500 active:bg-blue-500"
                onClick={() => {
                  onSendEmail();
                }}
              >
                SEND TO EMAIL
              </Button>
              {/* Print button */}
              <Button
                className="font:bg-green-500 rounded-md bg-blue-500 px-4 py-2 text-xs font-bold text-white uppercase transition-colors hover:bg-blue-600 focus:bg-blue-500 active:bg-blue-500"
                onClick={() => window.print()}
              >
                SAVE AS PDF
              </Button>

              {/* Button to continue the analysis with the next dimension */}
              <Button
                className="font:bg-green-500 rounded-md bg-green-500 px-4 py-2 text-xs font-bold text-white uppercase transition-colors hover:bg-green-600 active:bg-green-500"
                id="continue-with-next-dimension-button"
                onClick={() => {
                  onUserClosePartialFeedback(false);
                  setPartialFeedbackDimension(null);
                  onCloseClick();
                }}
              >
                CONTINUE WITH NEXT DIMENSION
              </Button>

              {/* Button to contact CloudX team for support */}
              {rootElement && (
                <PopupButton
                  url={process.env.NEXT_PUBLIC_CALENDLY_URL ?? ''}
                  /*
                   * react-calendly uses React's Portal feature (https://reactjs.org/docs/portals.html) to render the popup modal. As a result, you'll need to
                   * specify the rootElement property to ensure that the modal is inserted into the correct domNode.
                   */
                  rootElement={rootElement}
                  text="CONTACT CLOUDX TEAM"
                  className="rounded-md bg-orange-500 px-4 py-2 text-xs font-bold text-white uppercase transition-colors hover:bg-orange-600 focus:bg-orange-500 active:bg-orange-500"
                />
              )}
            </div>
          </div>
        </Container>
      </Section>
    </Html>
  );
};

// Styles (Email CSS must be inline or object-based)
const main = { backgroundColor: '#ffffff', padding: '20px' };
const container = { margin: '0 auto', width: '580px' };
const h1 = { color: '#333', fontSize: '24px' };
const text = { color: '#555', fontSize: '16px' };
const button = { backgroundColor: '#007bff', color: '#fff', borderRadius: '5px' };
