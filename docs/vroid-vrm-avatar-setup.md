# VRoid / VRM Avatar Setup

The kiosk assistant loads one VRoid/VRM model from:

```text
frontend/public/models/avatar/avatar.vrm
```

Runtime URL:

```text
/models/avatar/avatar.vrm
```

## Export From VRoid Studio

1. Open VRoid Studio.
2. Create or customize a humanoid character.
3. Keep the upper body, arms, hands, and facial expressions enabled.
4. Export the model as `.vrm`.
5. Rename the exported file to `avatar.vrm`.
6. Place it at `frontend/public/models/avatar/avatar.vrm`.
7. Start the frontend and open `http://localhost:3000`.

## How Loading Works

Relevant files:

- `frontend/components/kiosk/KioskScene.tsx`
- `frontend/components/kiosk/VrmAvatar.tsx`
- `frontend/hooks/useVrmAvatar.ts`
- `frontend/hooks/useVrmGestures.ts`
- `frontend/hooks/useVrmLipSync.ts`

The loader uses `@pixiv/three-vrm` and React Three Fiber. After loading, `useVrmAvatar.ts` computes a `THREE.Box3` bounding box, measures the model height, scales the model to a target kiosk display height, centers it, and positions it for an upper-body portrait.

## Fix Avatar Too Small Or Too Large

Open `frontend/hooks/useVrmAvatar.ts`.

Adjust:

```ts
const TARGET_DISPLAY_HEIGHT = 2.55;
```

Increase it if the avatar is too small. Decrease it if the avatar is too large or cropped.

The camera framing is in `frontend/components/kiosk/KioskScene.tsx`:

```ts
camera={{ position: [0, 1.38, 2.12], fov: 24 }}
camera.lookAt(0, 1.28, 0)
```

Move the camera farther on `z` if the model is cropped. Raise or lower the `lookAt` target to frame the face/chest.

## Locked Kiosk Camera

The customer should not be able to rotate, drag, zoom, or pan the avatar. `KioskScene.tsx` disables pointer events on the canvas and does not enable customer controls.

For developer inspection only, set:

```text
NEXT_PUBLIC_DEBUG_AVATAR_CONTROLS=true
```

This enables the debug `OrbitControls` block in development. It is off by default and should stay off for demos.

## Fix Avatar Facing Wrong Direction

Open `frontend/hooks/useVrmAvatar.ts`.

Adjust:

```ts
const AVATAR_FACING_ROTATION = Math.PI;
```

Use `0` if the avatar is already facing the camera. Use `Math.PI` if the avatar faces away.

## Fix T-Pose Or Awkward Arms

Open `frontend/hooks/useVrmGestures.ts`.

The neutral pose constants are near the top of the file:

```ts
const neutralPose = {
  leftUpperArm: new Euler(...),
  rightUpperArm: new Euler(...),
}
```

Adjust these rotation constants if the avatar arms look wrong. Different VRM exports can have slightly different local bone axes, so keep changes small. The hook stores original bone rotations, applies the neutral pose relative to the original pose, then layers state gestures on top.

Gesture tuning constants:

```ts
const GESTURE_INTENSITY = 0.35;
const ARM_ROTATION_LIMIT = 1.15;
const HEAD_ROTATION_LIMIT = 0.28;
```

Lower `GESTURE_INTENSITY` if gestures look too theatrical. Lower the rotation limits if arms or head twist too far.

Expected states:

- `idle`: relaxed arms, subtle breathing, small head movement
- `greeting`: small right-hand wave
- `listening`: slight forward lean and attentive head tilt
- `thinking`: small head tilt and hand movement
- `talking`: forearm/hand movement and head nods
- `presenting`: right-hand gesture toward the recommendation panel
- `comparing`: small alternating left/right gestures
- `checkout`: presenting gesture toward payment/checkout flow

## Test Checklist

1. Start backend and frontend.
2. Open `http://localhost:3000`.
3. Confirm the avatar is large, visible, and framed as upper body.
4. Confirm face, mouth, arms, and hands are visible.
5. Send:

```text
I need a laptop under 20 million VND for programming and light gaming.
```

6. Confirm the assistant speaks.
7. Confirm the mouth moves while TTS is speaking.
8. Confirm arms rest naturally when idle.
9. Confirm arms/hands move subtly while talking and presenting.

## Debugging

In development, `useVrmAvatar.ts` logs model height, bounding boxes, scale, bones, and expressions. `OrbitControls` are enabled only in development so you can inspect the model framing without adding production UI.

Missing bones or expressions are skipped safely.

## Expression And Lip Sync Tuning

Facial expressions are controlled by:

```text
frontend/hooks/useVrmExpressions.ts
```

Mouth movement is controlled by:

```text
frontend/hooks/useVrmLipSync.ts
```

For browser TTS, lip sync uses speech boundary pulses. For external Kokoro/Piper audio, lip sync can use Web Audio amplitude from the audio element. Tune `intensity` in `VrmAvatar.tsx` if the mouth opens too little or too much.
