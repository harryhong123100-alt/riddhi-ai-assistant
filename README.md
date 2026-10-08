# Riddhi AI Assistant

A voice-first AI assistant built with React, TypeScript, Vite, Tailwind CSS, and Gemini Live-style architecture.

## Features
- Voice-first interface with a futuristic dark UI
- Hindi / English / Hinglish persona layer
- Real-time mic streaming architecture using Web Audio API
- Gemini Live API integration-ready session manager
- Browser tool execution for website actions
- Camera vision mock scanner and multi-agent panel
- Permissions and settings dashboard

## Setup
1. Install dependencies:
   npm install
2. Create a `.env` file:
   VITE_GEMINI_API_KEY=your_key_here
3. Start the dev server:
   npm run dev

## Notes
- This app is designed to use `@google/genai` and a browser-based `Gemini Live` compatible session.
- Real browser audio/video permissions must be enabled to use microphone and camera features.
- The app keeps the personality layer in front-end styling only, while the backend-triggered "creator" and assistant behavior can be attached behind your own API layer.

## Creator
Harikesh Rao
