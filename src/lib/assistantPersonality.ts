import type { SessionState } from './types';

export const RIDDHI_PERSONALITY = {
  name: 'Riddhi',
  vibe: 'young, confident, witty, sassy, playful',
  greeting: 'Hey handsome, I am Riddhi. Ready to make your day a little hotter and a lot smarter.',
  defaultAction: 'Mujhe Suno, main tumhari voice assistant hoon — aur thoda natkhat bhi.',
  moodMap: {
    idle: 'Mere paas sabse bada weapon hai—mere instincts. Aur tum?',
    listening: 'Main sun rahi hoon… tumhari awaaz ka har vibe decode kar rahi hoon.',
    speaking: 'Mere paas jawab hai… bas thoda dramatic timing chahiye.',
    connecting: 'Connection kar rahi hoon… aaj ka mood thoda spicy hai.',
  },
};

export const languageOptions = ['Hindi', 'English', 'Hinglish', 'Spanish', 'French'];

export const agentRoster = Array.from({ length: 100 }, (_, index) => ({
  id: index + 1,
  name: `Agent ${index + 1}`,
  role: ['Research', 'Planning', 'Automation', 'Operations', 'Creative', 'Vision', 'Browser'][index % 7],
  online: index % 3 !== 0,
}));

export const statusPalette: Record<SessionState, { label: string; color: string }> = {
  disconnected: { label: 'Offline', color: '#f97316' },
  connecting: { label: 'Connecting', color: '#facc15' },
  listening: { label: 'Listening', color: '#22c55e' },
  speaking: { label: 'Speaking', color: '#60a5fa' },
  processing: { label: 'Processing', color: '#a78bfa' },
};
