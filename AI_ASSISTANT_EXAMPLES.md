# AI Assistant Test Messages

Use these messages in the storefront assistant after starting the frontend and backend locally.

```text
I need a laptop under 20 million VND for programming and light gaming
```

```text
Recommend me a phone with good camera and battery
```

```text
I'm a student and I need something durable
```

```text
Compare these two laptops
```

```text
I want the cheapest option but still good enough for office work
```

Expected behavior:

- The assistant asks one follow-up question if the request is too vague.
- Recommendations include a reason, trade-off, best-fit explanation, and alternatives.
- The avatar switches to listening while typing/voice is active, thinking during the API call, and talking when the assistant responds or TTS is playing.
