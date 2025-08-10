import type { AppConfig } from './lib/types';

export const APP_CONFIG_DEFAULTS: AppConfig = {
  companyName: 'CloudX',
  pageTitle: 'Voice Assistant',
  pageDescription: 'A voice assistant built with LiveKit',

  supportsChatInput: true,
  supportsVideoInput: false,
  supportsScreenShare: false,

  logo: '/cloudx-color.svg',
  accent: '#002cf2',
  logoDark: '/cloudx-color.svg',
  accentDark: '#1fd5f9',
  startButtonText: 'Start assessment',
};
