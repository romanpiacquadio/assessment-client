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

export interface DimensionStateItem {
  scoring: number | null;
  justification: string;
  insights: string;
  partial_feedback: string[];
}

export interface DimensionState {
  Evolution: DimensionStateItem;
  Outcome: DimensionStateItem;
  Leverage: DimensionStateItem;
  Sponsorship: DimensionStateItem;
  Coverage: DimensionStateItem;
  Alignment: DimensionStateItem;
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
