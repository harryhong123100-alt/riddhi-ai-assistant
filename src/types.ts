export type SessionState = 'disconnected' | 'connecting' | 'listening' | 'speaking' | 'processing';

export type BrowserAction =
  | 'openWebsite'
  | 'closeTab'
  | 'scrollDown'
  | 'scrollUp'
  | 'click'
  | 'type'
  | 'navigate'
  | 'refresh';

export type AgentConfig = {
  id: number;
  name: string;
  role: string;
  online: boolean;
};

export type PermissionMode = 'microphone' | 'camera' | 'location';

export type AppSettings = {
  language: string;
  personalityMode: 'bold' | 'calm' | 'romantic' | 'sassy';
  autoListen: boolean;
  cameraVision: boolean;
  browserControl: boolean;
  lowBandwidth: boolean;
  muted: boolean;
};

export type VisionObject = {
  label: string;
  confidence: number;
};
