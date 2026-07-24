"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import AdminSaveFeedback from "@/components/admin/AdminSaveFeedback";
import AboutClubPageClient from "@/components/AboutClubPageClient";
import ClubLogoPageClient from "@/components/ClubLogoPageClient";
import type {
  DBAboutPageContent,
  DBClubLogoPageContent,
} from "@/lib/db-types";
import {
  aboutStoragePathFromPublicUrl,
  DEFAULT_ABOUT_PAGE_CONTENT,
  DEFAULT_CLUB_LOGO_PAGE_CONTENT,
  normalizeAboutValues,
  normalizeClubLogoFeatures,
  normalizeStoryParagraphs,
  type AboutValue,
  type ClubLogoFeature,
} from "@/lib/about-content";
import { fetchAboutClubContent } from "@/lib/queries";
import { deleteStorageUrls } from "@/lib/storage-cleanup";
import { createClient } from "@/lib/supabase-browser";

type AdminTab = "about" | "logo";
type UploadTarget =
  | { kind: "aboutFeature" }
  | { kind: "logoAnnotated" }
  | { kind: "logoMap" }
  | { kind: "logoFeaturePatch"; index: number }
  | { kind: "logoFeatureIcon"; index: number };

const inputStyle: CSSProperties = {
  width: "100%",
  backgroundColor: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "0.5rem",
  color: "white",
  padding: "0.72rem 0.82rem",
  fontSize: "0.9rem",
  outline: "none",
};

function toAboutDraft(content: DBAboutPageContent): DBAboutPageContent {
  return {
    ...content,
    story_paragraphs: normalizeStoryParagraphs(content.story_paragraphs),
    values: normalizeAboutValues(content.values),
  };
}

function toLogoDraft(content: DBClubLogoPageContent): DBClubLogoPageContent {
  return {
    ...content,
    features: normalizeClubLogoFeatures(content.features),
  };
}

async function uploadAboutImage(file: File): Promise<string> {
  const supabase = createClient();
  const extension = file.name.split(".").pop() ?? "jpg";
  const path = `content/${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;
  const { error } = await supabase.storage.from("about-page").upload(path, file);
  if (error) throw new Error(error.message);
  const { data } = supabase.storage.from("about-page").getPublicUrl(path);
  return data.publicUrl;
}

export default function AdminAboutPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>("about");
  const [aboutDraft, setAboutDraft] = useState<DBAboutPageContent>(
    toAboutDraft(DEFAULT_ABOUT_PAGE_CONTENT),
  );
  const [logoDraft, setLogoDraft] = useState<DBClubLogoPageContent>(
    toLogoDraft(DEFAULT_CLUB_LOGO_PAGE_CONTENT),
  );
  const [pendingDeleteUrls, setPendingDeleteUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const uploadTargetRef = useRef<UploadTarget | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchAboutClubContent()
      .then(({ about, logo }) => {
        const nextAbout = toAboutDraft(about);
        const nextLogo = toLogoDraft(logo);
        setAboutDraft(nextAbout);
        setLogoDraft(nextLogo);
        setPendingDeleteUrls([]);
        setDirty(false);
      })
      .catch((loadError: unknown) => {
        setError(loadError instanceof Error ? loadError.message : "Failed to load about content");
      })
      .finally(() => setLoading(false));
  }, []);

  function markDirty() {
    setDirty(true);
    setSaved(false);
  }

  function queueReplacedUrl(url: string) {
    if (!aboutStoragePathFromPublicUrl(url)) return;
    setPendingDeleteUrls((current) => current.includes(url) ? current : [...current, url]);
  }

  function openUploader(target: UploadTarget) {
    uploadTargetRef.current = target;
    fileRef.current?.click();
  }

  async function handleImageUpload(file: File | null) {
    const target = uploadTargetRef.current;
    if (!file || !target) return;

    setUploading(true);
    setError(null);
    try {
      const nextUrl = await uploadAboutImage(file);
      if (target.kind === "aboutFeature") {
        queueReplacedUrl(aboutDraft.feature_image_url);
        setAboutDraft((current) => ({ ...current, feature_image_url: nextUrl }));
      }
      if (target.kind === "logoAnnotated") {
        queueReplacedUrl(logoDraft.annotated_image_url);
        setLogoDraft((current) => ({ ...current, annotated_image_url: nextUrl }));
      }
      if (target.kind === "logoMap") {
        queueReplacedUrl(logoDraft.map_image_url);
        setLogoDraft((current) => ({ ...current, map_image_url: nextUrl }));
      }
      if (target.kind === "logoFeaturePatch") {
        const replacedUrl = logoDraft.features[target.index]?.patch_url;
        if (replacedUrl) queueReplacedUrl(replacedUrl);
        setLogoDraft((current) => ({
          ...current,
          features: current.features.map((feature, index) =>
            index === target.index ? { ...feature, patch_url: nextUrl } : feature,
          ),
        }));
      }
      if (target.kind === "logoFeatureIcon") {
        const replacedUrl = logoDraft.features[target.index]?.icon_url;
        if (replacedUrl) queueReplacedUrl(replacedUrl);
        setLogoDraft((current) => ({
          ...current,
          features: current.features.map((feature, index) =>
            index === target.index ? { ...feature, icon_url: nextUrl } : feature,
          ),
        }));
      }
      markDirty();
    } catch (uploadError: unknown) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed");
    } finally {
      setUploading(false);
      uploadTargetRef.current = null;
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function setAboutField(field: keyof DBAboutPageContent, value: string) {
    setAboutDraft((current) => ({ ...current, [field]: value }));
    markDirty();
  }

  function setStoryText(value: string) {
    setAboutDraft((current) => ({
      ...current,
      story_paragraphs: value.split("\n").map((line) => line.trim()).filter(Boolean),
    }));
    markDirty();
  }

  function setValue(index: number, field: keyof AboutValue, value: string) {
    setAboutDraft((current) => ({
      ...current,
      values: current.values.map((item, valueIndex) =>
        valueIndex === index ? { ...item, [field]: value } : item,
      ),
    }));
    markDirty();
  }

  function setLogoFeature(index: number, field: keyof ClubLogoFeature, value: string | number) {
    setLogoDraft((current) => ({
      ...current,
      features: current.features.map((feature, featureIndex) =>
        featureIndex === index ? { ...feature, [field]: value } : feature,
      ),
    }));
    markDirty();
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      const supabase = createClient();
      const aboutPayload = {
        ...aboutDraft,
        hero_title: aboutDraft.hero_title.trim() || DEFAULT_ABOUT_PAGE_CONTENT.hero_title,
        story_paragraphs: normalizeStoryParagraphs(aboutDraft.story_paragraphs),
        values_heading: aboutDraft.values_heading.trim() || DEFAULT_ABOUT_PAGE_CONTENT.values_heading,
        values: normalizeAboutValues(aboutDraft.values),
        closing_text: aboutDraft.closing_text.trim(),
        closing_cta_label: aboutDraft.closing_cta_label.trim(),
        closing_cta_href: aboutDraft.closing_cta_href.trim() || "/schedule",
        updated_at: new Date().toISOString(),
      };
      const logoPayload = {
        ...logoDraft,
        features: normalizeClubLogoFeatures(logoDraft.features),
        updated_at: new Date().toISOString(),
      };

      const [aboutResult, logoResult] = await Promise.all([
        supabase.from("about_page_content").upsert([aboutPayload]),
        supabase.from("club_logo_page_content").upsert([logoPayload]),
      ]);
      const saveError = aboutResult.error ?? logoResult.error;
      if (saveError) throw new Error(saveError.message);

      await deleteStorageUrls("about-page", pendingDeleteUrls, ["content/"]);
      setAboutDraft(aboutPayload);
      setLogoDraft(logoPayload);
      setPendingDeleteUrls([]);
      setDirty(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (saveError: unknown) {
      setError(saveError instanceof Error ? saveError.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  const saveDisabled = saving || uploading || !dirty;

  return (
    <div className="mx-auto min-w-0 max-w-7xl overflow-hidden">
      <AdminSaveFeedback saving={saving} saved={saved} />
      <div className="mb-4 sm:mb-6">
        <h1
          className="font-display font-black uppercase leading-none text-white"
          style={{ fontSize: "clamp(2rem, 10vw, 2.75rem)" }}
        >
          About
        </h1>
        <p className="font-body mt-1" style={{ fontSize: "1rem", color: "rgba(255,255,255,0.35)" }}>
          Edit the About Club and Club Logo public pages.
        </p>
      </div>

      {loading ? (
        <p className="font-display text-sm uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)" }}>
          Loading...
        </p>
      ) : (
        <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(320px,460px)_minmax(0,1fr)]">
          <section
            className="min-w-0 self-start rounded-xl p-4 sm:p-5"
            style={{ backgroundColor: "#141414", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <div className="mb-4 grid grid-cols-2 gap-1 rounded-lg p-1" style={{ backgroundColor: "rgba(255,255,255,0.04)" }}>
              {[
                { id: "about" as const, label: "About" },
                { id: "logo" as const, label: "Club Logo" },
              ].map((tab) => {
                const selected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    disabled={saving || uploading}
                    className="font-display rounded-md px-3 py-3 text-xs uppercase tracking-widest transition-colors"
                    style={{
                      backgroundColor: selected ? "#FFFFFF" : "transparent",
                      color: selected ? "#141414" : "rgba(255,255,255,0.5)",
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {activeTab === "about" ? (
              <div className="space-y-4">
                <Field label="Page Title">
                  <input
                    value={aboutDraft.hero_title}
                    onChange={(event) => setAboutField("hero_title", event.target.value)}
                    style={inputStyle}
                  />
                </Field>
                <Field label="Story Paragraphs" help="Each line becomes one paragraph.">
                  <textarea
                    value={aboutDraft.story_paragraphs.join("\n")}
                    onChange={(event) => setStoryText(event.target.value)}
                    rows={7}
                    style={{ ...inputStyle, resize: "vertical" }}
                  />
                </Field>
                <ImageControl
                  label="Feature Image"
                  url={aboutDraft.feature_image_url}
                  onReplace={() => openUploader({ kind: "aboutFeature" })}
                  disabled={uploading || saving}
                />
                <Field label="Values Heading">
                  <input
                    value={aboutDraft.values_heading}
                    onChange={(event) => setAboutField("values_heading", event.target.value)}
                    style={inputStyle}
                  />
                </Field>
                {aboutDraft.values.map((value, index) => (
                  <div key={index} className="rounded-lg border border-white/10 p-3">
                    <Field label={`Value ${index + 1} Title`}>
                      <input
                        value={value.title}
                        onChange={(event) => setValue(index, "title", event.target.value)}
                        style={inputStyle}
                      />
                    </Field>
                    <Field label={`Value ${index + 1} Description`}>
                      <textarea
                        value={value.description}
                        onChange={(event) => setValue(index, "description", event.target.value)}
                        rows={2}
                        style={{ ...inputStyle, resize: "vertical" }}
                      />
                    </Field>
                  </div>
                ))}
                <Field label="Closing Text">
                  <textarea
                    value={aboutDraft.closing_text}
                    onChange={(event) => setAboutField("closing_text", event.target.value)}
                    rows={2}
                    style={{ ...inputStyle, resize: "vertical" }}
                  />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="CTA Label" flush>
                    <input
                      value={aboutDraft.closing_cta_label}
                      onChange={(event) => setAboutField("closing_cta_label", event.target.value)}
                      style={inputStyle}
                    />
                  </Field>
                  <Field label="CTA Link" flush>
                    <input
                      value={aboutDraft.closing_cta_href}
                      onChange={(event) => setAboutField("closing_cta_href", event.target.value)}
                      style={inputStyle}
                    />
                  </Field>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <ImageControl
                  label="Annotated Crest Image"
                  url={logoDraft.annotated_image_url}
                  onReplace={() => openUploader({ kind: "logoAnnotated" })}
                  disabled={uploading || saving}
                />
                {logoDraft.features.map((feature, index) => (
                  <div key={index} className="rounded-lg border border-white/10 p-3">
                    <Field label={`Feature ${index + 1} Title`}>
                      <input
                        value={feature.title}
                        onChange={(event) => setLogoFeature(index, "title", event.target.value)}
                        style={inputStyle}
                      />
                    </Field>
                    <Field label={`Feature ${index + 1} Description`}>
                      <textarea
                        value={feature.description}
                        onChange={(event) => setLogoFeature(index, "description", event.target.value)}
                        rows={3}
                        style={{ ...inputStyle, resize: "vertical" }}
                      />
                    </Field>
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <ImageControl
                        label="Patch"
                        url={feature.patch_url}
                        onReplace={() => openUploader({ kind: "logoFeaturePatch", index })}
                        disabled={uploading || saving}
                      />
                      <ImageControl
                        label="Icon"
                        url={feature.icon_url}
                        onReplace={() => openUploader({ kind: "logoFeatureIcon", index })}
                        disabled={uploading || saving}
                      />
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <Field label="Icon Size" flush>
                        <input
                          type="number"
                          min={24}
                          max={140}
                          value={feature.icon_size}
                          onChange={(event) => setLogoFeature(index, "icon_size", Number(event.target.value))}
                          style={inputStyle}
                        />
                      </Field>
                      <Field label="Icon Scale" flush>
                        <input
                          type="number"
                          min={0.5}
                          max={4}
                          step={0.05}
                          value={feature.icon_scale}
                          onChange={(event) => setLogoFeature(index, "icon_scale", Number(event.target.value))}
                          style={inputStyle}
                        />
                      </Field>
                    </div>
                  </div>
                ))}
                <ImageControl
                  label="Map Image"
                  url={logoDraft.map_image_url}
                  onReplace={() => openUploader({ kind: "logoMap" })}
                  disabled={uploading || saving}
                />
              </div>
            )}

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => handleImageUpload(event.target.files?.[0] ?? null)}
            />

            {error && (
              <p className="font-body mt-4 text-sm" style={{ color: "#E7001B" }}>
                Error: {error}
              </p>
            )}

            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={saveDisabled}
              className="font-display mt-5 w-full rounded-lg py-3 text-sm font-bold uppercase tracking-widest transition-opacity"
              style={{
                backgroundColor: "#E7001B",
                color: "white",
                opacity: saveDisabled ? 0.5 : 1,
                cursor: saveDisabled ? "not-allowed" : "pointer",
              }}
            >
              {saving ? "Saving..." : uploading ? "Uploading..." : "Save About Pages"}
            </button>
          </section>

          <section className="min-w-0">
            <p
              className="font-display mb-3 text-xs uppercase tracking-widest"
              style={{ color: "rgba(255,255,255,0.35)" }}
            >
              {activeTab === "about" ? "About Preview" : "Club Logo Preview"}
            </p>
            <div
              className="h-[760px] overflow-auto rounded-lg bg-white"
              style={{ border: "1px solid rgba(255,255,255,0.08)" }}
            >
              {activeTab === "about" ? (
                <AboutClubPageClient content={aboutDraft} animate={false} />
              ) : (
                <ClubLogoPageClient content={logoDraft} animate={false} />
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  help,
  flush = false,
  children,
}: {
  label: string;
  help?: string;
  flush?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={flush ? "" : "mt-3 first:mt-0"}>
      <label
        className="font-display mb-1 block text-xs uppercase tracking-widest"
        style={{ color: "rgba(255,255,255,0.35)" }}
      >
        {label}
      </label>
      {children}
      {help && (
        <p className="font-body mt-1 text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
          {help}
        </p>
      )}
    </div>
  );
}

function ImageControl({
  label,
  url,
  onReplace,
  disabled,
}: {
  label: string;
  url: string;
  onReplace: () => void;
  disabled: boolean;
}) {
  return (
    <div>
      <p
        className="font-display mb-1 text-xs uppercase tracking-widest"
        style={{ color: "rgba(255,255,255,0.35)" }}
      >
        {label}
      </p>
      <div className="grid min-w-0 grid-cols-[64px_minmax(0,1fr)] gap-2 rounded-lg border border-white/10 p-2 sm:grid-cols-[72px_minmax(0,1fr)]">
        <div className="relative h-14 min-w-0 overflow-hidden rounded-md bg-black sm:h-16">
          <Image src={url} alt={label} fill sizes="84px" className="object-contain" />
        </div>
        <div className="flex min-w-0 flex-col">
          <p
            className="font-body min-w-0 truncate text-xs"
            style={{ color: "rgba(255,255,255,0.32)" }}
            title={url}
          >
            {url}
          </p>
          <button
            type="button"
            onClick={onReplace}
            disabled={disabled}
            className="font-display mt-2 w-full max-w-full rounded-md px-2 py-2 text-[0.65rem] font-bold uppercase tracking-widest"
            style={{
              backgroundColor: "rgba(255,255,255,0.06)",
              color: "rgba(255,255,255,0.65)",
              opacity: disabled ? 0.45 : 1,
              cursor: disabled ? "not-allowed" : "pointer",
            }}
          >
            Replace
          </button>
        </div>
      </div>
    </div>
  );
}
