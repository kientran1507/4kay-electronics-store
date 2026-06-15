"use client";

import { useFrame } from "@react-three/fiber";
import type { VRM, VRMHumanBoneName } from "@pixiv/three-vrm";
import { Euler, Quaternion } from "three";
import { KioskState } from "@/types";

const boneNames = [
  "head",
  "neck",
  "chest",
  "spine",
  "leftUpperArm",
  "leftLowerArm",
  "leftHand",
  "rightUpperArm",
  "rightLowerArm",
  "rightHand",
  "leftShoulder",
  "rightShoulder",
] as VRMHumanBoneName[];

const originalRotations = new WeakMap<object, Quaternion>();
const GESTURE_INTENSITY = 0.35;
const ARM_ROTATION_LIMIT = 1.15;
const HEAD_ROTATION_LIMIT = 0.28;

const getBone = (vrm: VRM, name: VRMHumanBoneName) => vrm.humanoid?.getNormalizedBoneNode(name);

// Adjust these rotation constants if the avatar arms look wrong.
// VRM bone axes differ between exported models, so the values are intentionally conservative.
const neutralPose: Partial<Record<VRMHumanBoneName, Euler>> = {
  leftShoulder: new Euler(0.02, 0, 0.08),
  rightShoulder: new Euler(0.02, 0, -0.08),
  leftUpperArm: new Euler(0.08, 0.02, 1.5),
  rightUpperArm: new Euler(0.08, -0.02, -1.5),
  leftLowerArm: new Euler(0.02, 0.06, 0.36),
  rightLowerArm: new Euler(0.02, -0.06, -0.36),
  leftHand: new Euler(0.04, 0.04, 0.08),
  rightHand: new Euler(0.04, -0.04, -0.08),
  chest: new Euler(0.02, 0, 0),
  spine: new Euler(0.015, 0, 0),
};

const rememberOriginals = (vrm: VRM) => {
  boneNames.forEach((name) => {
    const bone = getBone(vrm, name);
    if (bone && !originalRotations.has(bone)) originalRotations.set(bone, bone.quaternion.clone());
  });
};

const clampEuler = (euler: Euler) =>
  new Euler(
    Math.max(-ARM_ROTATION_LIMIT, Math.min(ARM_ROTATION_LIMIT, euler.x)),
    Math.max(-ARM_ROTATION_LIMIT, Math.min(ARM_ROTATION_LIMIT, euler.y)),
    Math.max(-1.6, Math.min(1.6, euler.z)),
  );

const addEuler = (base = new Euler(), next = new Euler()) =>
  clampEuler(
    new Euler(
      base.x + next.x * GESTURE_INTENSITY,
      base.y + next.y * GESTURE_INTENSITY,
      base.z + next.z * GESTURE_INTENSITY,
    ),
  );

const clampHead = (euler: Euler) =>
  new Euler(
    Math.max(-HEAD_ROTATION_LIMIT, Math.min(HEAD_ROTATION_LIMIT, euler.x)),
    Math.max(-HEAD_ROTATION_LIMIT, Math.min(HEAD_ROTATION_LIMIT, euler.y)),
    Math.max(-0.16, Math.min(0.16, euler.z)),
  );

const applyAdditive = (vrm: VRM, name: VRMHumanBoneName, euler: Euler, alpha = 0.08) => {
  const bone = getBone(vrm, name);
  if (!bone) return;
  const original = originalRotations.get(bone);
  if (!original) return;
  const target = original.clone().multiply(new Quaternion().setFromEuler(clampEuler(euler)));
  bone.quaternion.slerp(target, alpha);
};

const pose = (vrm: VRM, name: VRMHumanBoneName, offset?: Euler, alpha = 0.08) => {
  applyAdditive(vrm, name, addEuler(neutralPose[name], offset), alpha);
};

export const useVrmGestures = ({
  vrm,
  avatarState,
  enabled = true,
}: {
  vrm?: VRM | null;
  avatarState: KioskState;
  enabled?: boolean;
}) => {
  useFrame(({ clock }) => {
    if (!vrm || !enabled) return;
    rememberOriginals(vrm);
    const t = clock.elapsedTime;
    const breathe = Math.sin(t * 1.4) * 0.025;
    const nod = Math.sin(t * 2.1) * 0.035;

    (Object.keys(neutralPose) as VRMHumanBoneName[]).forEach((name) => pose(vrm, name, undefined, 0.08));
    pose(vrm, "chest", new Euler(breathe, 0, 0), 0.06);
    applyAdditive(vrm, "head", clampHead(new Euler(nod * 0.3, Math.sin(t * 0.7) * 0.045, 0)), 0.06);
    applyAdditive(vrm, "neck", clampHead(new Euler(0, Math.sin(t * 0.55) * 0.02, 0)), 0.05);

    if (avatarState === "greeting") {
      pose(vrm, "rightUpperArm", new Euler(-0.1, -0.18, 0.42), 0.1);
      pose(vrm, "rightLowerArm", new Euler(0.22, Math.sin(t * 8) * 0.16, -0.3), 0.13);
      pose(vrm, "rightHand", new Euler(0, Math.sin(t * 8) * 0.22, 0.12), 0.13);
    } else if (avatarState === "listening") {
      applyAdditive(vrm, "spine", new Euler(0.08, 0, 0), 0.08);
      applyAdditive(vrm, "head", clampHead(new Euler(0.04, 0.08, 0.05)), 0.08);
    } else if (avatarState === "thinking") {
      applyAdditive(vrm, "head", clampHead(new Euler(0.08, -0.14, 0.05)), 0.07);
      pose(vrm, "rightUpperArm", new Euler(0.16, -0.08, 0.25), 0.07);
      pose(vrm, "rightLowerArm", new Euler(0.1, -0.04, -0.18), 0.07);
    } else if (avatarState === "talking") {
      pose(vrm, "rightUpperArm", new Euler(Math.sin(t * 3) * 0.08, 0.03, 0.24), 0.09);
      pose(vrm, "rightLowerArm", new Euler(0.04, Math.sin(t * 4) * 0.08, -0.12), 0.09);
      pose(vrm, "leftUpperArm", new Euler(Math.sin(t * 2.6) * 0.06, -0.02, -0.16), 0.08);
      applyAdditive(vrm, "head", clampHead(new Euler(nod * 0.8, Math.sin(t * 1.4) * 0.06, 0)), 0.08);
    } else if (avatarState === "presenting" || avatarState === "checkout") {
      applyAdditive(vrm, "chest", new Euler(0, -0.08, 0), 0.08);
      applyAdditive(vrm, "head", clampHead(new Euler(0, -0.1 + Math.sin(t * 1.1) * 0.03, 0)), 0.08);
      pose(vrm, "rightUpperArm", new Euler(0.02, 0.28, 0.34), 0.09);
      pose(vrm, "rightLowerArm", new Euler(0, 0.08, -0.22), 0.09);
      pose(vrm, "rightHand", new Euler(0, 0.1, 0.16), 0.09);
    } else if (avatarState === "comparing") {
      applyAdditive(vrm, "head", clampHead(new Euler(0, Math.sin(t * 1.5) * 0.16, 0)), 0.08);
      pose(vrm, "rightUpperArm", new Euler(0.03, Math.sin(t * 2) * 0.14, 0.22), 0.08);
      pose(vrm, "leftUpperArm", new Euler(0.03, Math.sin(t * 2 + Math.PI) * 0.14, -0.22), 0.08);
    } else if (avatarState === "error") {
      applyAdditive(vrm, "head", clampHead(new Euler(0.03, Math.sin(t * 5) * 0.07, 0)), 0.12);
    }
  });
};
