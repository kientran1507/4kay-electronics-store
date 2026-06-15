# Voice And Speech

The kiosk uses free browser APIs by default:

- Text-to-speech: `window.speechSynthesis`
- Microphone permission: `navigator.mediaDevices.getUserMedia`
- Speech recognition: `window.SpeechRecognition` or `window.webkitSpeechRecognition`

Relevant files:

- `frontend/hooks/useTextToSpeech.ts`
- `frontend/hooks/useSpeechRecognition.ts`
- `frontend/components/kiosk/KioskControls.tsx`
- `frontend/components/kiosk/KioskVoiceInput.tsx`

## Environment

```text
NEXT_PUBLIC_TTS_PROVIDER=browser
NEXT_PUBLIC_SPEECH_LANG=en-US
NEXT_PUBLIC_KOKORO_TTS_URL=http://localhost:8880
NEXT_PUBLIC_KOKORO_VOICE=af_heart
NEXT_PUBLIC_PIPER_TTS_URL=http://localhost:5002
NEXT_PUBLIC_PIPER_VOICE=
```

Browser TTS is free, but voice quality depends on the installed browser/system voices. For better offline voice later, add a backend Piper TTS provider. For premium natural voice later, add ElevenLabs or another paid provider only when an API key exists.

Provider options:

- `browser`: free browser fallback, voice selector enabled
- `kokoro`: local/self-hosted Kokoro endpoint, recommended free natural voice option
- `piper`: local/self-hosted Piper endpoint

If Kokoro or Piper fails, the app falls back to browser TTS automatically.

## Female Voice Selection

The app loads voices with `speechSynthesis.getVoices()` and listens for the `voiceschanged` event because many browsers load voices asynchronously.

Default selection prefers language-matching voices with names such as:

- Jenny
- Aria
- Ava
- Samantha
- Zira
- Susan
- Hazel
- Google US English
- Google UK English Female

It avoids obvious male names such as:

- David
- Mark
- George
- Guy
- male

If no female-sounding voice exists, the app selects the best language-matching voice and slightly raises pitch. Users can choose another voice from the dropdown, and the selected voice is saved in `localStorage`.

To install more voices, add voices through the operating system or browser settings, then refresh the page.

## Test TTS

1. Open `http://localhost:3000`.
2. Turn voice on.
3. Choose a voice from the dropdown.
4. Click `Test voice`.
5. Confirm the avatar enters talking state and mouth movement starts.
6. Refresh the page and confirm the selected voice persists.

## Test Kokoro TTS

1. Start a local Kokoro server on `http://localhost:8880`.
2. Configure:

```text
NEXT_PUBLIC_TTS_PROVIDER=kokoro
NEXT_PUBLIC_KOKORO_TTS_URL=http://localhost:8880
NEXT_PUBLIC_KOKORO_VOICE=af_heart
```

3. Restart the frontend.
4. Open voice settings and confirm provider is `kokoro`.
5. Click `Test`.
6. Confirm audio plays and mouth movement follows audio amplitude.

The frontend calls:

```text
POST /v1/audio/speech
```

on the configured Kokoro URL.

## Test Piper TTS

1. Start a local Piper HTTP server on `http://localhost:5002`.
2. Configure:

```text
NEXT_PUBLIC_TTS_PROVIDER=piper
NEXT_PUBLIC_PIPER_TTS_URL=http://localhost:5002
NEXT_PUBLIC_PIPER_VOICE=your_voice_name
```

3. Restart the frontend.
4. Open voice settings and confirm provider is `piper`.
5. Click `Test`.
6. Confirm audio plays and mouth movement follows audio amplitude.

The frontend calls:

```text
POST /api/tts
```

on the configured Piper URL.

## Microphone Recognition

Microphone permission alone does not produce transcript text. Permission only allows audio capture. The app must also start `SpeechRecognition` and handle `onresult`.

The mic flow is:

1. User clicks the mic button.
2. App requests `getUserMedia({ audio: true })`.
3. App immediately stops the permission stream tracks.
4. App creates a `SpeechRecognition` instance.
5. App sets:
   - `lang`
   - `interimResults = true`
   - `continuous = false`
   - `maxAlternatives = 1`
6. App starts recognition.
7. `onresult` updates the input with interim text.
8. Final transcript is submitted to the assistant.

## Test Microphone

1. Use Chrome or Edge.
2. Open `http://localhost:3000`.
3. Click the mic button.
4. Approve microphone permission.
5. Say: `Recommend me a phone with good camera and battery`.
6. Confirm the text appears in the input while speaking.
7. Confirm the final transcript is sent to the assistant.

If unsupported, the UI shows:

```text
Speech recognition is not supported in this browser. Please test with Chrome or Edge.
```

If recognition fails, the exact browser error code is shown in the controls.
