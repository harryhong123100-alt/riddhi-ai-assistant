import { useEffect, useMemo, useState } from 'react';
import { Mic, MicOff, Camera, Gauge, Sparkles, Shield, Globe2, Languages, Settings2 } from 'lucide-react';
import { agentRoster, languageOptions, RIDDHI_PERSONALITY, statusPalette } from './lib/assistantPersonality';
import { AudioStreamer } from './lib/audioStreamer';
import { LiveSessionManager } from './lib/liveSession';
import type { AppSettings, PermissionMode, SessionState, VisionObject } from './types';

const defaultSettings: AppSettings = {
  language: 'Hindi',
  personalityMode: 'sassy',
  autoListen: true,
  cameraVision: true,
  browserControl: true,
  lowBandwidth: true,
  muted: false,
};

const permissionNotes: Record<PermissionMode, string> = {
  microphone: 'Mic access required for real-time voice calls.',
  camera: 'Camera access enables live object scan and visual awareness.',
  location: 'Location helps with contextual responses and local recommendations.',
};

const initialVision: VisionObject[] = [
  { label: 'Face', confidence: 0.96 },
  { label: 'Laptop', confidence: 0.91 },
  { label: 'Coffee Cup', confidence: 0.83 },
  { label: 'Desk', confidence: 0.8 },
];

export default function App() {
  const [sessionState, setSessionState] = useState<SessionState>('disconnected');
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [showSettings, setShowSettings] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [visionObjects, setVisionObjects] = useState<VisionObject[]>(initialVision);
  const [permissions, setPermissions] = useState<Record<PermissionMode, boolean>>({
    microphone: false,
    camera: false,
    location: false,
  });
  const [apiKey, setApiKey] = useState(import.meta.env.VITE_GEMINI_API_KEY ?? '');
  const [voiceOutput, setVoiceOutput] = useState('');

  const audioStreamer = useMemo(() => new AudioStreamer(), []);
  const liveSession = useMemo(() => new LiveSessionManager(apiKey), [apiKey]);

  useEffect(() => {
    liveSession.setCallbacks(setSessionState, (base64) => setVoiceOutput(base64));
  }, [liveSession]);

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const requestPermission = async (key: PermissionMode) => {
    try {
      if (key === 'microphone') {
        await navigator.mediaDevices.getUserMedia({ audio: true });
      }
      if (key === 'camera') {
        await navigator.mediaDevices.getUserMedia({ video: true });
      }
      setPermissions((prev) => ({ ...prev, [key]: true }));
    } catch (error) {
      console.error('Permission request failed:', error);
    }
  };

  const handlePower = async () => {
    if (sessionState === 'disconnected') {
      await liveSession.connect();
      setSessionState('ready');
      setIsMicOn(true);
      return;
    }

    setSessionState('disconnected');
    setIsMicOn(false);
    try {
      await liveSession.interrupt();
    } catch (error) {
      console.error(error);
    }
    audioStreamer.stop();
  };

  const handleMicToggle = async () => {
    if (!permissions.microphone) {
      await requestPermission('microphone');
    }

    if (isMicOn) {
      audioStreamer.stop();
      setIsMicOn(false);
      setSessionState('ready');
      return;
    }

    try {
      await audioStreamer.start(async (chunk) => {
        setSessionState('listening');
        await liveSession.startStreamingMic(chunk);
      });
      setIsMicOn(true);
      setSessionState('ready');
    } catch (error) {
      console.error('Mic toggle failed:', error);
      setSessionState('disconnected');
    }
  };

  const handleCameraScan = async () => {
    if (!permissions.camera) {
      await requestPermission('camera');
    }

    if (settings.cameraVision) {
      setVisionObjects((prev) =>
        prev.map((item, idx) => ({
          ...item,
          confidence: Math.min(0.99, item.confidence + (idx % 2 === 0 ? 0.02 : -0.01)),
        })),
      );
    }
  };

  const promptTone = RIDDHI_PERSONALITY.moodMap[sessionState] ?? RIDDHI_PERSONALITY.moodMap.disconnected;
  const currentStatus = statusPalette[sessionState] ?? statusPalette.disconnected;

  return (
    <div className="min-h-screen bg-[#050816] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(168,85,247,0.22),transparent_40%),radial-gradient(circle_at_bottom,_rgba(59,130,246,0.22),transparent_25%)]" />

      <main className="relative mx-auto flex min-h-screen max-w-7xl flex-col gap-6 p-4 md:p-8">
        <header className="flex items-center justify-between rounded-3xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-lg">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-fuchsia-300">Voice AI System</p>
            <h1 className="text-xl font-bold text-white">Riddhi AI Assistant</h1>
          </div>

          <div className="flex items-center gap-3">
            <span
              className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-300"
              style={{ borderColor: `${currentStatus.color}66` }}
            >
              {currentStatus.label}
            </span>
            <button
              onClick={() => setShowSettings((prev) => !prev)}
              className="rounded-full border border-white/10 bg-white/5 p-2 text-slate-200 transition hover:border-fuchsia-400/40 hover:text-fuchsia-300"
              aria-label="Open settings"
            >
              <Settings2 size={18} />
            </button>
          </div>
        </header>

        <section className="grid flex-1 gap-6 lg:grid-cols-[1.4fr_0.8fr]">
          <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[#0d1325]/80 p-4 shadow-neon">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(244,114,182,0.12),transparent_40%)]" />
            <div className="relative flex h-full flex-col">
              <div className="mb-4 flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300">
                <div className="flex items-center gap-2">
                  <Sparkles className="text-fuchsia-300" size={16} />
                  <span>Voice persona: {RIDDHI_PERSONALITY.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Languages size={16} />
                  <span>{settings.language}</span>
                </div>
              </div>

              <div className="relative flex flex-1 flex-col items-center justify-center rounded-[28px] border border-white/10 bg-[#090f1f] px-4 py-10">
                <div
                  className={`absolute h-72 w-72 rounded-full blur-3xl transition-all duration-500 ${
                    sessionState === 'listening'
                      ? 'bg-emerald-500/40 scale-110'
                      : sessionState === 'speaking'
                        ? 'bg-blue-500/40 scale-125'
                        : sessionState === 'connecting'
                          ? 'bg-yellow-500/30 animate-pulse'
                          : 'bg-fuchsia-500/25'
                  }`}
                />

                <div className={`relative z-10 flex h-60 w-60 items-center justify-center rounded-full border border-white/15 bg-gradient-to-br from-fuchsia-500/25 via-purple-500/20 to-cyan-400/20 shadow-[0_0_60px_rgba(244,114,182,0.25)] transition-all duration-500 ${isMicOn ? 'scale-105' : ''}`}>
                  <div className="flex h-32 w-32 items-center justify-center rounded-full border border-white/20 bg-slate-900/80 text-3xl font-black text-fuchsia-200 shadow-[0_0_40px_rgba(244,114,182,0.35)]">
                    R
                  </div>
                </div>

                <div className="relative z-10 mt-6 flex items-center gap-3">
                  <button
                    onClick={handlePower}
                    className="flex h-16 w-16 items-center justify-center rounded-full border border-fuchsia-400/50 bg-gradient-to-br from-fuchsia-500 to-violet-600 text-white shadow-[0_0_35px_rgba(236,72,153,0.5)] transition hover:scale-105"
                    aria-label="Power on assistant"
                  >
                    {sessionState === 'disconnected' ? <Mic size={26} /> : <MicOff size={26} />}
                  </button>
                  <button
                    onClick={handleMicToggle}
                    className={`flex h-16 w-16 items-center justify-center rounded-full border transition ${
                      isMicOn ? 'border-emerald-400/60 bg-emerald-500/15 text-emerald-200' : 'border-white/10 bg-white/5 text-white'
                    }`}
                    aria-label="Toggle microphone"
                  >
                    <Mic size={24} />
                  </button>
                </div>

                <p className="relative z-10 mt-6 max-w-md text-center text-base text-slate-300">{promptTone}</p>

                {voiceOutput && (
                  <div className="relative z-10 mt-6 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-xs text-cyan-200">
                    Audio response ready: {voiceOutput.slice(0, 16)}...
                  </div>
                )}
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-[28px] border border-white/10 bg-white/5 p-4 backdrop-blur-lg">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-200">
                  <Shield size={16} className="text-emerald-300" />
                  Permission gate
                </div>
              </div>

              <div className="space-y-3">
                {(['microphone', 'camera', 'location'] as PermissionMode[]).map((permission) => (
                  <button
                    key={permission}
                    onClick={() => requestPermission(permission)}
                    className={`flex w-full items-center justify-between rounded-2xl border px-3 py-2 text-sm transition ${
                      permissions[permission]
                        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
                        : 'border-white/10 bg-slate-900/40 text-slate-300 hover:border-fuchsia-400/40 hover:text-fuchsia-200'
                    }`}
                  >
                    <span className="capitalize">{permission}</span>
                    <span>{permissions[permission] ? 'Granted' : 'Ask'}</span>
                  </button>
                ))}
              </div>

              <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-amber-200">
                {permissionNotes.microphone}
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/5 p-4 backdrop-blur-lg">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-200">
                  <Camera size={16} className="text-cyan-300" />
                  Camera Vision
                </div>
                <button
                  onClick={handleCameraScan}
                  className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-cyan-200"
                >
                  Scan
                </button>
              </div>

              <div className="aspect-video overflow-hidden rounded-2xl border border-white/10 bg-slate-950/80">
                <div className="flex h-full items-center justify-center text-sm text-slate-500">Camera preview ready</div>
              </div>

              <div className="mt-4 space-y-2">
                {visionObjects.map((item) => (
                  <div key={item.label} className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-900/40 px-3 py-2 text-xs text-slate-300">
                    <span>{item.label}</span>
                    <span>{(item.confidence * 100).toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </section>

        {showSettings && (
          <section className="grid gap-4 rounded-[28px] border border-white/10 bg-white/5 p-4 backdrop-blur-lg lg:grid-cols-[1fr_1fr_1fr]">
            <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
              <div className="mb-3 flex items-center gap-2 text-sm text-slate-200">
                <Globe2 size={16} className="text-fuchsia-300" />
                Language
              </div>
              <select
                value={settings.language}
                onChange={(event) => updateSetting('language', event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none"
              >
                {languageOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
              <div className="mb-3 flex items-center gap-2 text-sm text-slate-200">
                <Gauge size={16} className="text-cyan-300" />
                Adaptive mode
              </div>
              <div className="space-y-2 text-sm text-slate-300">
                {(['bold', 'calm', 'romantic', 'sassy'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => updateSetting('personalityMode', mode)}
                    className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 capitalize ${
                      settings.personalityMode === mode
                        ? 'border-fuchsia-500/40 bg-fuchsia-500/10 text-fuchsia-100'
                        : 'border-white/10 bg-slate-900/50'
                    }`}
                  >
                    <span>{mode}</span>
                    <span>{settings.personalityMode === mode ? 'Enabled' : 'Off'}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
              <div className="mb-3 flex items-center gap-2 text-sm text-slate-200">
                <Sparkles size={16} className="text-violet-300" />
                Agent pool
              </div>

              <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
                {agentRoster.slice(0, 10).map((agent) => (
                  <div key={agent.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-900/50 px-2 py-2 text-xs text-slate-300">
                    <div>
                      <div className="font-medium text-white">{agent.name}</div>
                      <div>{agent.role}</div>
                    </div>
                    <span className={`h-2.5 w-2.5 rounded-full ${agent.online ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4 lg:col-span-3">
              <div className="mb-3 flex items-center gap-2 text-sm text-slate-200">
                <Settings2 size={16} className="text-amber-300" />
                Voice controls
              </div>

              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                {[
                  ['autoListen', 'Auto listen'],
                  ['cameraVision', 'Camera vision'],
                  ['browserControl', 'Browser control'],
                  ['lowBandwidth', 'Low bandwidth'],
                ].map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() =>
                      updateSetting(
                        key as keyof AppSettings,
                        !settings[key as keyof AppSettings] as never,
                      )
                    }
                    className={`rounded-xl border px-3 py-2 text-left text-sm ${
                      settings[key as keyof AppSettings]
                        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
                        : 'border-white/10 bg-slate-900/50 text-slate-300'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4 lg:col-span-3">
              <label className="mb-3 block text-sm text-slate-200">Gemini API Key</label>
              <input
                type="password"
                value={apiKey}
                onChange={(event) => setApiKey(event.target.value)}
                placeholder="VITE_GEMINI_API_KEY"
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none"
              />
            </div>
          </section>
        )}

        <div className="rounded-[20px] border border-white/10 bg-slate-950/70 p-3 text-xs text-slate-300">
          <span className="text-fuchsia-300">Creator note:</span> Harikesh Rao — your Riddhi AI assistant is designed as a bold, witty, emotionally aware voice companion with control-ready browser tools and adaptive memory.
        </div>
      </main>
    </div>
  );
}
