# Real AI API Setup

The chat calls the backend endpoint:

```http
POST /api/ai/recommend
```

The browser never receives the provider key. The backend uses Gemini to extract intent and shopping needs, then ranks products from MongoDB with the local recommendation service. If Gemini is unavailable, the deterministic parser still works.

## Gemini

1. Create a key in Google AI Studio.
2. Put it in the root `.env` file:

```env
AI_PROVIDER=gemini
GEMINI_API_KEY=your_new_key
GEMINI_MODEL=gemini-2.5-flash
```

3. Restart the backend.
4. Send a message such as:

```text
I need a laptop under 20 million VND for programming and light gaming.
```

The current integration uses Google REST `generateContent` with JSON output. Change `GEMINI_MODEL` without editing source code when a different supported model is required.

Any API key pasted into chat, screenshots, source control, or frontend code should be revoked and replaced. Keys belong only in a local/deployment secret store.

Official references:

- https://ai.google.dev/gemini-api/docs/quickstart
- https://aistudio.google.com/app/apikey

## Free voice choices

The application supports three providers:

### Browser voice

```env
NEXT_PUBLIC_TTS_PROVIDER=browser
NEXT_PUBLIC_SPEECH_LANG=en-US
```

This is free and requires no server. Quality depends on voices installed in Windows, macOS, Chrome, or Edge.

### Kokoro

Kokoro is the recommended free, natural local option for this project:

```env
NEXT_PUBLIC_TTS_PROVIDER=kokoro
NEXT_PUBLIC_KOKORO_TTS_URL=http://localhost:8880
NEXT_PUBLIC_KOKORO_VOICE=af_heart
```

Run an OpenAI-compatible Kokoro server that provides `POST /v1/audio/speech`. The frontend automatically falls back to browser speech if the local server is unavailable.

Projects:

- Model: https://github.com/hexgrad/kokoro
- Local API server: https://github.com/remsky/Kokoro-FastAPI

### Piper

Piper is lighter and fully offline, but usually sounds less natural than Kokoro:

```env
NEXT_PUBLIC_TTS_PROVIDER=piper
NEXT_PUBLIC_PIPER_TTS_URL=http://localhost:5002
NEXT_PUBLIC_PIPER_VOICE=your_voice_name
```

Projects:

- Engine: https://github.com/OHF-Voice/piper1-gpl
- Voices: https://huggingface.co/rhasspy/piper-voices

See `docs/voice-and-speech.md` for browser microphone and voice testing.
