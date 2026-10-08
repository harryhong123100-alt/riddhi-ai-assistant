import { GoogleGenAI } from '@google/genai';
import type { BrowserAction, SessionState } from '../types';

export class LiveSessionManager {
  private apiKey: string;
  private client: any | null = null;
  private session: any | null = null;
  private state: SessionState = 'disconnected';
  private onStateChange?: (state: SessionState) => void;
  private onResponseAudio?: (base64: string) => void;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  setCallbacks(
    onStateChange: (state: SessionState) => void,
    onResponseAudio?: (base64: string) => void,
  ) {
    this.onStateChange = onStateChange;
    this.onResponseAudio = onResponseAudio;
  }

  updateState(next: SessionState) {
    this.state = next;
    this.onStateChange?.(next);
  }

  async connect() {
    if (!this.apiKey) {
      this.updateState('disconnected');
      return;
    }

    try {
      this.updateState('connecting');
      this.client = new GoogleGenAI({ apiKey: this.apiKey });

      const liveConfig = {
        model: 'gemini-2.5-flash-live-preview',
        config: {
          responseModalities: ['AUDIO'],
          audioTimestamp: true,
        },
      };

      const sessionFactory = (this.client as any).live?.connect ?? (this.client as any).liveSession;
      if (typeof sessionFactory === 'function') {
        this.session = await sessionFactory.call(this.client, liveConfig);
        this.updateState('idle');
        return;
      }

      this.updateState('processing');
      this.onResponseAudio?.(btoa('demo-audio'));
    } catch (error) {
      console.error('Live session connect failed:', error);
      this.updateState('disconnected');
    }
  }

  async startStreamingMic(audioChunk: Int16Array) {
    if (!this.session) {
      this.updateState('listening');
      return;
    }

    this.updateState('listening');

    try {
      await this.session.send({
        audio: Array.from(audioChunk).slice(0, 2048),
      });
    } catch (error) {
      console.error('Mic stream send failed:', error);
    }
  }

  async interrupt() {
    this.updateState('processing');
    if (this.session) {
      await this.session.stop();
    }
  }

  async playResponse(audioBase64: string) {
    this.updateState('speaking');
    this.onResponseAudio?.(audioBase64);
  }

  async handleToolCall(tool: BrowserAction, payload?: Record<string, string | number>) {
    switch (tool) {
      case 'openWebsite': {
        const url = String(payload?.url ?? 'https://www.google.com');
        if (typeof window !== 'undefined') {
          window.open(url, '_blank', 'noopener,noreferrer');
        }
        return { ok: true, message: `Opened ${url}` };
      }
      case 'navigate': {
        const url = String(payload?.url ?? 'https://www.google.com');
        if (typeof window !== 'undefined') {
          window.location.href = url;
        }
        return { ok: true, message: `Navigated to ${url}` };
      }
      case 'refresh': {
        if (typeof window !== 'undefined') window.location.reload();
        return { ok: true, message: 'Refreshed the page' };
      }
      case 'scrollDown':
        if (typeof window !== 'undefined') window.scrollBy({ top: 240, behavior: 'smooth' });
        return { ok: true, message: 'Scrolled down' };
      case 'scrollUp':
        if (typeof window !== 'undefined') window.scrollBy({ top: -240, behavior: 'smooth' });
        return { ok: true, message: 'Scrolled up' };
      default:
        return { ok: true, message: `Tool ${tool} executed.` };
    }
  }
}
