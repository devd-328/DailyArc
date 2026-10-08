"use client";

import { crossedRankBoundary, parseCheckInResult, type CheckInResult } from "@/lib/checkin";
import { proof } from "@/lib/config";
import type { Rank } from "@/lib/config";
import { compressProof } from "@/lib/proof-image";
import { useScrollLock } from "@/lib/use-scroll-lock";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type Phase = "ask" | "checking" | "verdict" | "reward";

type Verdict = "yes" | "no" | "unclear" | "no_proof";

export function ProofSheet({
  questId,
  questName,
  rank,
  onClose,
}: {
  questId: string;
  questName: string;
  rank: Rank;
  onClose: () => void;
}) {
  const router = useRouter();
  useScrollLock();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const closedRef = useRef(false);
  const snappingRef = useRef(false);
  const [phase, setPhase] = useState<Phase>("ask");
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraAttempt, setCameraAttempt] = useState(0);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [message, setMessage] = useState("");
  const [checkIn, setCheckIn] = useState<CheckInResult | null>(null);
  const [saveFailed, setSaveFailed] = useState(false);

  function close() {
    closedRef.current = true;
    onClose();
    router.refresh();
  }

  useEffect(() => {
    if (phase !== "ask") return;
    const video = videoRef.current;
    let cancelled = false;

    async function openCamera() {
      setCameraReady(false);
      setCameraError(null);
      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraError("This browser cannot open a live camera.");
        return;
      }
      try {
        const stream = await openLiveCamera();
        if (cancelled) {
          stopStream(stream);
          return;
        }
        streamRef.current = stream;
        if (video) {
          video.srcObject = stream;
          await video.play();
        }
        if (!cancelled) setCameraReady(true);
      } catch {
        if (!cancelled) {
          setCameraError("The camera is blocked or missing. A saved photo does not count.");
        }
      }
    }

    void openCamera();
    return () => {
      cancelled = true;
      stopStream(streamRef.current);
      streamRef.current = null;
      if (video) video.srcObject = null;
    };
  }, [phase, cameraAttempt]);

  function tryAgain() {
    setPhase("ask");
    setVerdict(null);
    setMessage("");
    setCheckIn(null);
    setSaveFailed(false);
    setCameraAttempt((current) => current + 1);
    snappingRef.current = false;
  }

  async function snap() {
    const video = videoRef.current;
    if (snappingRef.current || !video || !cameraReady || video.videoWidth === 0 || phase === "checking") return;
    snappingRef.current = true;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    if (!context) {
      snappingRef.current = false;
      return;
    }
    context.drawImage(video, 0, 0);
    const frame = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", 0.92);
    });
    stopStream(streamRef.current);
    streamRef.current = null;
    if (!frame) {
      setVerdict("unclear");
      setMessage("Could not take that photo. Try again.");
      setPhase("verdict");
      return;
    }
    await onPhoto(frame);
  }

  async function onPhoto(file: Blob) {
    if (phase === "checking") return;
    setPhase("checking");
    setMessage("");
    setSaveFailed(false);
    let image: Blob;
    try {
      image = await compressProof(file);
    } catch {
      if (closedRef.current) return;
      setVerdict("unclear");
      setMessage("Could not read that photo. Take another one.");
      setPhase("verdict");
      return;
    }
    if (closedRef.current) return;
    if (image.size > proof.maxBytes) {
      setVerdict("unclear");
      setMessage("That photo is still too big. Move closer and try again.");
      setPhase("verdict");
      return;
    }

    const form = new FormData();
    form.set("questId", questId);
    form.set("proof", image, "proof.jpg");
    let response: Response;
    try {
      response = await fetch("/api/verify-proof", { method: "POST", body: form });
    } catch {
      if (closedRef.current) return;
      setVerdict("unclear");
      setMessage("Could not reach the quest master. Try again.");
      setPhase("verdict");
      return;
    }
    if (closedRef.current) return;

    if (response.status === 429) {
      setVerdict("no");
      setMessage("That is enough proofs for today. Try again tomorrow.");
      setPhase("verdict");
      return;
    }
    if (!response.ok) {
      setVerdict("unclear");
      setMessage("The check failed. Take the photo again.");
      setPhase("verdict");
      return;
    }

    const data: unknown = await response.json();
    const parsed = parseVerdict(data);
    if (!parsed) {
      setVerdict("unclear");
      setMessage("The check failed. Take the photo again.");
      setPhase("verdict");
      return;
    }

    if (closedRef.current) return;
    setVerdict(parsed.verdict);
    setMessage(parsed.message);
    if (parsed.verdict !== "yes") {
      setPhase("verdict");
      return;
    }

    const saved = await saveCheckIn(questId);
    if (closedRef.current) return;
    if (!saved) {
      setSaveFailed(true);
      setPhase("reward");
      return;
    }
    setCheckIn(saved);
    setPhase("reward");
  }

  function finish() {
    if (checkIn && !checkIn.duplicate && crossedRankBoundary(rank, checkIn.rank)) {
      router.push(`/rank-up?xp=${checkIn.xpAwarded}`);
      return;
    }
    onClose();
    router.refresh();
  }

  async function retrySave() {
    setSaveFailed(false);
    setPhase("checking");
    setMessage("Saving your XP...");
    const saved = await saveCheckIn(questId);
    if (closedRef.current) return;
    if (!saved) {
      setSaveFailed(true);
      setMessage("Proof counted, but the XP did not save. Try again.");
      setPhase("reward");
      return;
    }
    setCheckIn(saved);
    setMessage(message);
    setPhase("reward");
  }

  const rewardTone = verdict === "yes" ? "bg-teal" : verdict === "unclear" ? "bg-card" : "bg-pink";

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center overflow-hidden overscroll-none lg:items-center lg:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-[var(--dim)]"
        aria-label="Close"
        onClick={close}
      />
      <div className="sheet-panel relative z-10 w-full max-w-lg overflow-y-auto overscroll-contain rounded-t-card border-2 border-b-0 border-ink bg-card px-5 pb-6 pt-[18px] lg:rounded-card lg:border-b-2 lg:shadow-panel">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-[22px]">Show your proof</h3>
          <button
            type="button"
            onClick={close}
            className="grid size-11 place-items-center rounded-btn border-2 border-ink bg-card text-base font-bold shadow-row"
            aria-label="Close"
          >
            x
          </button>
        </div>
        <p className="text-base font-bold leading-tight">{questName}</p>
        <p className="mt-2 text-[13px] font-medium leading-snug text-ink-soft">
          Your proof is checked and deleted instantly. We never save your photos.
        </p>

        <p className="mt-2 text-[13px] font-medium leading-snug text-ink-soft">
          Live camera only. A saved photo does not count.
        </p>

        {phase === "ask" ? (
          <>
            <div className="relative mt-4 aspect-[4/3] overflow-hidden rounded-card border-2 border-ink bg-ink">
              <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
              {cameraError ? (
                <p className="absolute inset-0 grid place-items-center px-4 text-center text-[13px] font-bold text-card">
                  {cameraError}
                </p>
              ) : null}
              {!cameraError && !cameraReady ? (
                <p className="absolute inset-0 grid place-items-center text-[15px] font-bold text-card" role="status">
                  Opening the camera...
                </p>
              ) : null}
            </div>
            {cameraError ? (
              <button
                type="button"
                onClick={() => setCameraAttempt((current) => current + 1)}
                className="mt-4 flex min-h-12 w-full items-center justify-center rounded-btn border-2 border-ink bg-card text-[15px] font-bold shadow-row active:translate-x-[3px] active:translate-y-[3px] active:shadow-pressed"
              >
                Try the camera again
              </button>
            ) : (
              <button
                type="button"
                disabled={!cameraReady}
                onClick={() => void snap()}
                className="mt-4 flex min-h-12 w-full items-center justify-center rounded-btn border-2 border-ink bg-pink text-[15px] font-bold shadow-row active:translate-x-[3px] active:translate-y-[3px] active:shadow-pressed disabled:opacity-60"
              >
                Snap
              </button>
            )}
          </>
        ) : null}

        {phase === "checking" ? (
          <p className="mt-5 animate-pulse text-center text-[15px] font-bold" role="status">
            {message || "Checking your proof..."}
          </p>
        ) : null}

        {phase === "verdict" || phase === "reward" ? (
          <p
            className={`mt-5 rounded-card border-2 border-ink px-4 py-3.5 text-[15px] font-bold leading-snug shadow-row ${rewardTone}`}
            role="status"
          >
            {message}
            {checkIn && !saveFailed && !checkIn.duplicate ? (
              <span className="mt-1 block">+{checkIn.xpAwarded} XP</span>
            ) : null}
            {saveFailed ? <span className="mt-1 block">The XP did not save yet.</span> : null}
          </p>
        ) : null}

        {phase === "verdict" ? (
          <button
            type="button"
            onClick={tryAgain}
            className="mt-4 flex min-h-12 w-full items-center justify-center rounded-btn border-2 border-ink bg-card text-[15px] font-bold shadow-row active:translate-x-[3px] active:translate-y-[3px] active:shadow-pressed"
          >
            Try again
          </button>
        ) : null}

        {phase === "reward" && saveFailed ? (
          <button
            type="button"
            onClick={() => void retrySave()}
            className="mt-4 flex min-h-12 w-full items-center justify-center rounded-btn border-2 border-ink bg-pink text-[15px] font-bold shadow-row active:translate-x-[3px] active:translate-y-[3px] active:shadow-pressed"
          >
            Save XP
          </button>
        ) : null}

        {phase === "reward" && !saveFailed ? (
          <button
            type="button"
            onClick={finish}
            className="mt-4 flex min-h-12 w-full items-center justify-center rounded-btn border-2 border-ink bg-pink text-[15px] font-bold shadow-row active:translate-x-[3px] active:translate-y-[3px] active:shadow-pressed"
          >
            {checkIn && !checkIn.duplicate && crossedRankBoundary(rank, checkIn.rank) ? "See your rank" : "Done"}
          </button>
        ) : null}
      </div>
    </div>
  );
}

function parseVerdict(data: unknown): { verdict: Verdict; message: string } | null {
  if (!data || typeof data !== "object") return null;
  const row = data as Record<string, unknown>;
  const verdict = row.verdict;
  if (verdict !== "yes" && verdict !== "no" && verdict !== "unclear" && verdict !== "no_proof") return null;
  if (typeof row.message !== "string" || !row.message.trim()) return null;
  return { verdict, message: row.message.trim() };
}

async function openLiveCamera(): Promise<MediaStream> {
  try {
    return await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: { facingMode: { ideal: "environment" } },
    });
  } catch {
    return navigator.mediaDevices.getUserMedia({ audio: false, video: true });
  }
}

function stopStream(stream: MediaStream | null) {
  stream?.getTracks().forEach((track) => track.stop());
}

async function saveCheckIn(questId: string): Promise<CheckInResult | null> {
  const response = await fetch("/api/checkins", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ quest_id: questId }),
  });
  if (!response.ok) return null;
  return parseCheckInResult(await response.json());
}
