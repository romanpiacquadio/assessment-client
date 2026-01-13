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
  let currentState = dimensionStates?.[
    partialFeedbackDimension as keyof DimensionState
  ] as DimensionStateItem;
  let partialFeedback = currentState.partial_feedback;

  return (
    <Html>
      <Section style={main}>
        <Container style={container}>
          <Heading style={h1}>Partial Feedback for {partialFeedbackDimension}!</Heading>

          <div style={statsContainer}>
            <h3 style={statsTitle}>Statistics for current dimension:</h3>
            <div style={statsDetails}>
              <p style={statsDim}>
                <span style={highlightLabel}>Analyzed Dimension: </span>
                <span>{partialFeedbackDimension}</span>
              </p>
              <div style={{ height: '16px', width: '100%' }} />
              <p style={statsScore}>
                <span style={highlightLabel}>Score: </span>
                <span>{currentState.scoring}</span>
              </p>
            </div>
          </div>

          {/* Partial feedback overview */}
          <div>
            <h2>{partialFeedbackDimension} Overview</h2>
            <div>
              {/* Recommendations */}
              <div>
                <h2>Action Points for: {partialFeedbackDimension}</h2>
                {partialFeedback.map((recommendation: string, index: number) => (
                  <div style={recommendationItem} key={index}>
                    {`${index + 1}. ${recommendation}`}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Button to contact CloudX team for support */}
          <a
            href="https://cloudx.com/contact-us"
            target="_blank"
            rel="noopener noreferrer"
            style={contactButton}
          >
            CONTACT CLOUDX TEAM
          </a>
        </Container>
      </Section>
    </Html>
  );
};

// Styles (Email CSS must be inline or object-based)
const main = { backgroundColor: '#ffffff', padding: '20px' };
const container = { margin: '0', width: '580px' };
const h1 = { color: '#333', fontSize: '24px' };
const statsContainer: React.CSSProperties = {
  marginBottom: '24px',
  padding: '16px',
  backgroundColor: 'rgba(249, 250, 251, 0.6)', // increased transparency
  borderRadius: '8px',
  border: '1px solid #e5e7eb',
};
const statsTitle: React.CSSProperties = {
  color: '#333',
  fontSize: '20px',
  fontWeight: 700,
  marginBottom: '16px',
  marginTop: 0,
};
const statsDetails: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: '8px',
};
const statsDim: React.CSSProperties = {
  color: '#555',
  fontSize: '16px',
  margin: 0,
  marginBottom: '8px',
  textAlign: 'left',
  lineHeight: '1.5',
  width: '100%',
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
  textAlign: 'justify',
  fontSize: '14px',
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