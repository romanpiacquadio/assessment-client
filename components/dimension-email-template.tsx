import * as React from 'react';
import { Container, Heading, Html, Section } from '@react-email/components';
import { DimensionState, DimensionStateItem } from '@/lib/types';

export const DimensionEmailTemplate = ({
  partialFeedbackDimension,
  dimensionStates,
}: {
  partialFeedbackDimension: string | null;
  dimensionStates: DimensionState | null;
}) => {
  const currentState = dimensionStates?.[
    partialFeedbackDimension as keyof DimensionState
  ] as DimensionStateItem;
  const partialFeedback = currentState.partial_feedback;

  return (
    <Html>
      <Section style={main}>
        <Container style={container}>
          <div style={thanksForParticipationStyle}>
            Thanks for your participation in the CloudX AI Maturity Assessment of CloudX. This is
            your partial feedback report, based on your answers for the current dimension.
          </div>
          <Heading style={h1}>Partial Feedback for {partialFeedbackDimension}!</Heading>
          <div style={statsContainer}>
            <p style={statsScore}>
              <span style={highlightLabel}>Score: </span>
              <span>{currentState.scoring}</span>
            </p>
          </div>

          <div>
            <div>
              {/* Recommendations */}
              <div>
                <h3>Action Points for: {partialFeedbackDimension}</h3>
                {partialFeedback.map((recommendation: string, index: number) => (
                  <div style={recommendationItem} key={index}>
                    {`${index + 1}. ${recommendation}`}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Button to contact CloudX team for support */}
          <div style={contactButtonContainer}>
            <a
              href="https://cloudx.com/contact-us"
              target="_blank"
              rel="noopener noreferrer"
              style={contactButton}
            >
              CONTACT CLOUDX TEAM
            </a>
          </div>
        </Container>
      </Section>
    </Html>
  );
};

// Styles (Email CSS must be inline or object-based)
const main = { backgroundColor: '#ffffff', padding: '20px' };
const container = { margin: '0', width: '580px' };
const h1 = { color: '#333', fontSize: '24px' };
const thanksForParticipationStyle: React.CSSProperties = {
  margin: '4px',
  marginBottom: '10px',
  textAlign: 'left',
  fontSize: '14px',
};
const statsContainer: React.CSSProperties = {
  marginBottom: '24px',
  padding: '16px',
  backgroundColor: 'rgba(249, 250, 251, 0.6)',
  borderRadius: '8px',
  border: '1px solid #e5e7eb',
};
const statsScore: React.CSSProperties = {
  color: '#555',
  fontSize: '16px',
  margin: 0,
  textAlign: 'left',
  lineHeight: '1.5',
  width: '100%',
};
const highlightLabel: React.CSSProperties = {
  color: '#555',
  fontSize: '16px',
  margin: 0,
  textAlign: 'left',
  lineHeight: '1.5',
  fontStyle: 'italic',
};
const recommendationItem: React.CSSProperties = {
  margin: '4px',
  marginBottom: '10px',
  textAlign: 'left',
  fontSize: '14px',
};
const contactButtonContainer: React.CSSProperties = {
  marginTop: '24px',
  marginBottom: '24px',
  textAlign: 'center',
};
const contactButton: React.CSSProperties = {
  display: 'inline-block',
  borderRadius: '6px',
  backgroundColor: '#f97316',
  paddingLeft: '16px',
  paddingRight: '16px',
  paddingTop: '8px',
  paddingBottom: '8px',
  fontSize: '12px',
  fontWeight: 700,
  color: '#ffffff',
  textTransform: 'uppercase',
  textDecoration: 'none',
  textAlign: 'center',
  marginTop: '24px',
  marginBottom: '24px',
};
