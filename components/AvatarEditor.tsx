"use client";

import {
  avatarImageSrc,
  cropAvatar,
  galleryAvatarPath,
  presetAvatarPaths,
  type AvatarType,
} from "@/lib/avatar";
import { avatars } from "@/lib/config";
import { createClient } from "@/lib/supabase/client";
import { useScrollLock } from "@/lib/use-scroll-lock";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

export function AvatarEditor({
  userId,
  avatarType,
  avatarUrl,
  supabaseUrl,
}: {
  userId: string;
  avatarType: AvatarType;
  avatarUrl: string;
  supabaseUrl: string;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bust, setBust] = useState(0);
  const src = avatarImageSrc(avatarType, avatarUrl, supabaseUrl);
  const shown = bust > 0 && avatarType === "gallery" ? `${src}?v=${bust}` : src;

  async function choosePreset(path: string) {
    if (busy) return;
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const { error: saveError } = await supabase
      .from("profiles")
      .update({ avatar_type: "preset", avatar_url: path })
      .eq("id", userId);
    setBusy(false);
    if (saveError) {
      setError("Could not save the avatar. Try again.");
      return;
    }
    setOpen(false);
    router.refresh();
  }

  async function onFile(file: File | undefined) {
    if (!file || busy) return;
    if (inputRef.current) inputRef.current.value = "";
    if (file.size > avatars.maxUploadBytes) {
      setError("That photo is over 5 MB. Pick a smaller one.");
      return;
    }
    setBusy(true);
    setError(null);
    let image: Blob;
    try {
      image = await cropAvatar(file);
    } catch {
      setBusy(false);
      setError("Could not read that photo. Try another.");
      return;
    }
    const path = galleryAvatarPath(userId);
    const supabase = createClient();
    const { error: uploadError } = await supabase.storage.from("avatars").upload(path, image, {
      upsert: true,
      contentType: "image/jpeg",
      cacheControl: "60",
    });
    if (uploadError) {
      setBusy(false);
      setError("Could not save the avatar. Try again.");
      return;
    }
    const { error: saveError } = await supabase
      .from("profiles")
      .update({ avatar_type: "gallery", avatar_url: path })
      .eq("id", userId);
    setBusy(false);
    if (saveError) {
      setError("Could not save the avatar. Try again.");
      return;
    }
    setBust(Date.now());
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError(null);
          setOpen(true);
        }}
        className="relative grid size-16 shrink-0 place-items-center overflow-hidden rounded-full border-2 border-ink bg-paper"
        aria-label="Change avatar"
      >
        <img src={shown} alt="" className="size-full rounded-full object-cover" />
      </button>
      {open ? (
        <AvatarSheet
          avatarUrl={avatarUrl}
          busy={busy}
          error={error}
          onClose={() => {
            if (busy) return;
            setOpen(false);
          }}
          onChoose={(path) => void choosePreset(path)}
          onUpload={() => inputRef.current?.click()}
        />
      ) : null}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(event) => void onFile(event.target.files?.[0])}
      />
    </>
  );
}

function AvatarSheet({
  avatarUrl,
  busy,
  error,
  onClose,
  onChoose,
  onUpload,
}: {
  avatarUrl: string;
  busy: boolean;
  error: string | null;
  onClose: () => void;
  onChoose: (path: string) => void;
  onUpload: () => void;
}) {
  useScrollLock();
  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center overflow-hidden overscroll-none lg:items-center lg:p-6">
      <button type="button" className="absolute inset-0 bg-[var(--dim)]" aria-label="Close" onClick={onClose} />
      <div className="sheet-panel relative z-10 w-full max-w-lg overflow-y-auto overscroll-contain rounded-t-card border-2 border-b-0 border-ink bg-card px-5 pb-6 pt-[18px] lg:rounded-card lg:border-b-2 lg:shadow-panel">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-[22px]">Choose an avatar</h3>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="grid size-11 place-items-center rounded-btn border-2 border-ink bg-card text-base font-bold shadow-row disabled:opacity-60"
            aria-label="Close"
          >
            x
          </button>
        </div>
        <div className="grid grid-cols-4 gap-2.5">
          {presetAvatarPaths().map((path, index) => {
            const selected = path === avatarUrl;
            return (
              <button
                key={path}
                type="button"
                disabled={busy}
                aria-label={`Avatar ${index + 1}`}
                aria-pressed={selected}
                onClick={() => onChoose(path)}
                className={`grid aspect-square place-items-center overflow-hidden rounded-full border-2 p-0.5 disabled:opacity-60 ${
                  selected ? "border-pink bg-pink shadow-row" : "border-ink bg-paper"
                }`}
              >
                <img src={path} alt="" className="size-full rounded-full object-cover" />
              </button>
            );
          })}
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={onUpload}
          className="mt-4 flex min-h-12 w-full items-center justify-center rounded-btn border-2 border-ink bg-card text-[15px] font-bold shadow-row active:translate-x-[3px] active:translate-y-[3px] active:shadow-pressed disabled:opacity-60"
        >
          {busy ? "Saving..." : "Upload from gallery"}
        </button>
        {error ? (
          <p className="mt-2 text-center text-[13px] font-medium" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}
