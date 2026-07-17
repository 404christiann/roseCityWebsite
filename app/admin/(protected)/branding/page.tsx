"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useClubBranding } from "@/components/ClubBrandingProvider";
import AdminSaveFeedback from "@/components/admin/AdminSaveFeedback";
import { CLUB_LOGO_BUCKET } from "@/lib/club-branding";
import { createClient } from "@/lib/supabase-browser";

const MAX_LOGO_BYTES = 5 * 1024 * 1024;
const ALLOWED_LOGO_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);

function fileExtension(file: File): string {
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  return "jpg";
}

export default function BrandingPage() {
  const { clubLogoUrl, setClubLogoPath } = useClubBranding();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!logoFile) {
      setLocalPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(logoFile);
    setLocalPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [logoFile]);

  useEffect(() => {
    if (!saved) return;
    const timeoutId = window.setTimeout(() => setSaved(false), 3000);
    return () => window.clearTimeout(timeoutId);
  }, [saved]);

  function handleFile(file: File | null) {
    setError(null);
    setSaved(false);

    if (!file) return;
    if (!ALLOWED_LOGO_TYPES.has(file.type)) {
      setError("Choose a PNG, JPG, or WebP image.");
      return;
    }
    if (file.size > MAX_LOGO_BYTES) {
      setError("The logo must be 5 MB or smaller.");
      return;
    }

    setLogoFile(file);
  }

  async function saveLogo() {
    if (!logoFile || saving) return;

    setSaving(true);
    setSaved(false);
    setError(null);

    try {
      const supabase = createClient();
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData.user) {
        throw new Error(
          "Your admin session is not available to the uploader. Sign out, sign back in, and try again.",
        );
      }

      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session?.access_token) {
        throw new Error(
          "Your upload authorization expired. Sign out, sign back in, and try again.",
        );
      }

      const path = `club-branding/${Date.now()}-${crypto.randomUUID()}.${fileExtension(logoFile)}`;
      const encodedPath = path
        .split("/")
        .map((segment) => encodeURIComponent(segment))
        .join("/");
      const uploadResponse = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/${CLUB_LOGO_BUCKET}/${encodedPath}`,
        {
          method: "POST",
          headers: {
            apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            Authorization: `Bearer ${sessionData.session.access_token}`,
            "Content-Type": logoFile.type,
            "Cache-Control": "3600",
            "x-upsert": "false",
          },
          body: logoFile,
        },
      );

      if (!uploadResponse.ok) {
        const uploadBody = await uploadResponse.json().catch(() => null) as {
          error?: string;
          message?: string;
        } | null;
        const uploadMessage = uploadBody?.message ?? uploadBody?.error ?? `HTTP ${uploadResponse.status}`;
        throw new Error(
          uploadMessage.includes("row-level security")
            ? `Logo file upload failed: Supabase rejected the verified access token for ${authData.user.email ?? "this admin"}. Confirm the signed-in logos_v2 policies exist in the same Supabase project used by the website.`
            : `Logo file upload failed: ${uploadMessage}`,
        );
      }

      const updateResponse = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/site_branding?id=eq.1`,
        {
          method: "PATCH",
          headers: {
            apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            Authorization: `Bearer ${sessionData.session.access_token}`,
            "Content-Type": "application/json",
            Prefer: "return=minimal",
          },
          body: JSON.stringify({
            club_logo_path: path,
            updated_at: new Date().toISOString(),
          }),
        },
      );

      if (!updateResponse.ok) {
        const updateBody = await updateResponse.json().catch(() => null) as {
          message?: string;
        } | null;
        const updateMessage = updateBody?.message ?? `HTTP ${updateResponse.status}`;
        throw new Error(
          updateMessage.includes("schema cache")
            ? "The branding database setup has not been run yet. Run the site-branding migration, then try again."
            : `Logo setting save failed: ${updateMessage}`,
        );
      }

      setClubLogoPath(path);
      setLogoFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setSaved(true);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "The logo could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  const previewUrl = localPreviewUrl ?? clubLogoUrl;

  return (
    <div className="mx-auto max-w-5xl">
      <AdminSaveFeedback
        saving={saving}
        saved={saved}
        savingLabel="Updating club logo…"
        successLabel="Club logo updated"
      />

      <div className="mb-8">
        <h1
          className="font-display font-black uppercase leading-none text-white"
          style={{ fontSize: "clamp(2.5rem, 5vw, 3.5rem)" }}
        >
          Branding
        </h1>
        <p className="mt-2 max-w-2xl font-body text-sm leading-relaxed text-white/40">
          Upload one club logo here. Saving it updates the logo across the public website and admin portal.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(300px,0.8fr)]">
        <section
          className="rounded-xl border border-white/10 bg-[#141414] p-5 sm:p-7"
          aria-labelledby="club-logo-heading"
        >
          <div className="mb-6">
            <p className="font-display text-xs font-black uppercase tracking-[0.16em] text-[#E7001B]">
              Club Identity
            </p>
            <h2 id="club-logo-heading" className="mt-2 font-display text-2xl font-black uppercase text-white">
              Main Club Logo
            </h2>
            <p className="mt-2 font-body text-sm leading-relaxed text-white/40">
              For the cleanest result, use a square PNG with a transparent background. PNG, JPG, and WebP files up to 5 MB are accepted.
            </p>
          </div>

          <div className="rounded-xl border border-dashed border-white/15 bg-black/20 p-5 sm:p-6">
            <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
              <div className="relative h-32 w-32 flex-none overflow-hidden rounded-full border border-white/10 bg-white/5 p-3">
                <Image
                  src={previewUrl}
                  alt="Club logo preview"
                  fill
                  sizes="128px"
                  className="object-contain p-3"
                  unoptimized={Boolean(localPreviewUrl)}
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-display text-lg font-black uppercase text-white">
                  {logoFile ? "New logo selected" : "Current logo"}
                </p>
                <p className="mt-1 truncate font-body text-xs text-white/35">
                  {logoFile?.name ?? "This is the logo currently shown throughout the site."}
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={saving}
                  className="mt-4 rounded-lg border border-white/10 bg-white/5 px-5 py-2.5 font-display text-sm font-black uppercase tracking-widest text-white/70 transition hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {logoFile ? "Choose Different Image" : "Choose New Logo"}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={(event) => handleFile(event.target.files?.[0] ?? null)}
                />
              </div>
            </div>
          </div>

          {error && (
            <p className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 font-body text-sm text-red-300" role="alert">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={saveLogo}
            disabled={!logoFile || saving}
            className="mt-6 w-full rounded-lg bg-[#E7001B] px-6 py-4 font-display text-lg font-black uppercase tracking-widest text-white transition hover:bg-[#ff0a25] disabled:cursor-not-allowed disabled:opacity-35"
          >
            {saving ? "Saving…" : "Save New Club Logo"}
          </button>
        </section>

        <aside className="space-y-4" aria-label="Logo previews and usage">
          <div className="grid grid-cols-2 overflow-hidden rounded-xl border border-white/10">
            <div className="flex aspect-square items-center justify-center bg-white p-5">
              <div className="relative h-full w-full">
                <Image src={previewUrl} alt="Logo on a light background" fill sizes="180px" className="object-contain" unoptimized={Boolean(localPreviewUrl)} />
              </div>
            </div>
            <div className="flex aspect-square items-center justify-center bg-[#141414] p-5">
              <div className="relative h-full w-full">
                <Image src={previewUrl} alt="Logo on a dark background" fill sizes="180px" className="object-contain" unoptimized={Boolean(localPreviewUrl)} />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-[#141414] p-5">
            <h2 className="font-display text-lg font-black uppercase text-white">Where it updates</h2>
            <ul className="mt-4 space-y-3 font-body text-sm text-white/45">
              {["Website navigation", "Website footer", "Next match card", "Admin login and menu", "Players without a photo", "Browser tab icon"].map((location) => (
                <li key={location} className="flex items-center gap-3">
                  <span className="h-1.5 w-1.5 flex-none rounded-full bg-[#E7001B]" aria-hidden="true" />
                  {location}
                </li>
              ))}
            </ul>
          </div>

          <p className="font-body text-xs leading-relaxed text-white/25">
            Previously uploaded logo files are kept as a safety measure. Only the active logo setting changes when you save.
          </p>
        </aside>
      </div>
    </div>
  );
}
