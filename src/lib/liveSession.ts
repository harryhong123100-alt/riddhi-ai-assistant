import { GoogleGenAI } from '@google/genai';
import type { BrowserAction, SessionState } from '../types';

export class LiveSessionManager {
  private readonly apiKey: string;
  private client: GoogleGenAI | null = null;
  private session: any | null = null;
  private state: SessionState = 'disconnected';
  private onStateChange?: (state: SessionState) => void;
  private onResponseAudio?: (base64: string) => void;

  constructor(apiKey: string) {
    this.apiKey = apiKey.trim();
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
      this.updateState('ready');
      return;
    }

    try {
      this.updateState('connecting');
      this.client = new GoogleGenAI({ apiKey: this.apiKey });

      const hasLiveSession = !!(this.client as any)?.live?.connect;
      if (hasLiveSession) {
        this.session = await (this.client as any).live.connect({
          model: 'gemini-2.5-flash-live-preview',
          config: {
            responseModalities: ['AUDIO'],
            audioTimestamp: true,
          },
        });
        this.updateState('ready');
        return;
      }

      this.updateState('ready');
      this.onResponseAudio?.(btoa('demo-audio'));
    } catch (error) {
      console.error('Live session connect failed:', error);
      this.updateState('ready');
    }
  }

  async startStreamingMic(audioChunk: Int16Array) {
    this.updateState('listening');

    if (!this.session) {
      return;
    }

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
      try {
        await this.session.stop();
      } catch (error) {
        console.error('Interrupt session failed:', error);
      }
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
        if (typeof window !== 'undefined') window.scrollBy({ top: 220, behavior: 'smooth' });
        return { ok: true, message: 'Scrolled down' };
      case 'scrollUp':
        if (typeof window !== 'undefined') window.scrollBy({ top: -220, behavior: 'smooth' });
        return { ok: true, message: 'Scrolled up' };
      default:
        return { ok: true, message: `Tool ${tool} executed.` };
    }
  }
}
