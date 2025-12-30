import type { TranscriptionSegment } from 'livekit-client';

export interface CombinedTranscription extends TranscriptionSegment {
  role: 'assistant' | 'user';
  receivedAtMediaTimestamp: number;
  receivedAt: number;
}
export type ThemeMode = 'dark' | 'light' | 'system';

export interface AppConfig {
  pageTitle: string;
  pageDescription: string;
  companyName: string;

  supportsChatInput: boolean;
  supportsVideoInput: boolean;
  supportsScreenShare: boolean;

  logo: string;
  startButtonText: string;
  accent?: string;
  logoDark?: string;
  accentDark?: string;
}

export interface SandboxConfig {
  [key: string]:
    | { type: 'string'; value: string }
    | { type: 'number'; value: number }
    | { type: 'boolean'; value: boolean }
    | null;
}

export interface DimensionState {
  Evolution: {
    scoring: number | null;
    justification: string;
    insights: string;
    partial_feedback: string;
  };
  Outcome: {
    scoring: number | null;
    justification: string;
    insights: string;
    partial_feedback: string;
  };
  Leverage: {
    scoring: number | null;
    justification: string;
    insights: string;
    partial_feedback: string;
  };
  Sponsorship: {
    scoring: number | null;
    justification: string;
    insights: string;
    partial_feedback: string;
  };
  Coverage: {
    scoring: number | null;
    justification: string;
    insights: string;
    partial_feedback: string;
  };
  Alignment: {
    scoring: number | null;
    justification: string;
    insights: string;
    partial_feedback: string;
  };
  current: string;
  final_report?: {
    executive_summary: string;
    recommendations: Recommendation[];
  };
}

export interface Recommendation {
  text: string;
  priority: 'High' | 'Medium' | 'Low';
}

export type AgentStateData = Partial<DimensionState> & {
  current?: string;
};

// New interface for analysis notifications
export interface AnalysisNotification {
  type: 'dimension_analysis';
  status: 'started' | 'completed';
  dimension: string;
}

export interface InactivityTimeoutNotification {
  type: 'inactivity_timeout';
  status: 'session_ended';
  reason: 'inactivity_timeout';
  message: string;
}
