import type { SessionState } from './types';

export const RIDDHI_PERSONALITY = {
  name: 'Riddhi',
  vibe: 'young, confident, witty, sassy, playful',
  greeting:
    'Hey handsome, main Riddhi hoon. Ready to make your day a little hotter and a lot smarter.',
  defaultAction: 'Mujhe suno, main tumhari voice assistant hoon — aur thoda natkhat bhi.',
  moodMap: {
    disconnected: 'Main abhi idle hoon, tumhara signal wait kar rahi hoon.',
    connecting: 'Connection setup ho raha hai… thoda glamorous, thoda clever.',
    ready: 'Main ready hoon, bas tumhari awaaz ka command chahiye.',
    listening: 'Main sun rahi hoon… har word ko decode kar rahi hoon.',
    speaking: 'Mere paas jawab hai… bas dramatic timing complete karna hai.',
    processing: 'Main soch rahi hoon… kuch tactical aur smart answer bana rahi hoon.',
  } as Record<SessionState, string>,
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
  ready: { label: 'Ready', color: '#34d399' },
  listening: { label: 'Listening', color: '#22c55e' },
  speaking: { label: 'Speaking', color: '#60a5fa' },
  processing: { label: 'Processing', color: '#a78bfa' },
};
