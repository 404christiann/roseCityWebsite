"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import AdminSaveFeedback from "@/components/admin/AdminSaveFeedback";
import ScaledShopKitPreview from "@/components/admin/ScaledShopKitPreview";
import type {
  DBShopKitPhoto,
  DBShopKitSection,
} from "@/lib/db-types";
import {
  fetchShopKitContent,
} from "@/lib/queries";
import {
  diffShopKitPhotos,
  type DraftKitPhoto,
} from "@/lib/shop-kit";
import { createClient } from "@/lib/supabase-browser";

type SectionFields = {
  eyebrow: string;
  title: string;
  description: string;
  cta_label: string;
  cta_link: string;
};

const EMPTY_FIELDS: SectionFields = {
  eyebrow: "",
  title: "",
  description: "",
  cta_label: "",
  cta_link: "",
};

async function uploadPhoto(file: File, bucket: string): Promise<string> {
  const supabase = createClient();
  const extension = file.name.split(".").pop() ?? "jpg";
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file);
  if (error) throw new Error(error.message);
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export default function AdminShopPage() {
  const [fields, setFields] = useState<SectionFields>(EMPTY_FIELDS);
  const [draftPhotos, setDraftPhotos] = useState<DraftKitPhoto[]>([]);
  const [originalPhotos, setOriginalPhotos] = useState<DBShopKitPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchShopKitContent()
      .then(({ section, photos }) => {
        if (section) {
          setFields({
            eyebrow: section.eyebrow,
            title: section.title,
            description: section.description,
            cta_label: section.cta_label,
            cta_link: section.cta_link,
          });
        }
        setOriginalPhotos(photos);
        setDraftPhotos(photos.map((photo) => ({ id: photo.id, url: photo.url })));
      })
      .catch((loadError: unknown) => {
        setError(loadError instanceof Error ? loadError.message : "Failed to load shop content");
      })
      .finally(() => setLoading(false));
  }, []);

  function setField(field: keyof SectionFields, value: string) {
    setFields((current) => ({ ...current, [field]: value }));
    setSaved(false);
  }

  function movePhoto(index: number, delta: -1 | 1) {
    setDraftPhotos((current) => {
      const next = [...current];
      const destination = index + delta;
      if (destination < 0 || destination >= next.length) return current;
      [next[index], next[destination]] = [next[destination], next[index]];
      return next;
    });
    setSaved(false);
  }

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    const remaining = 4 - draftPhotos.length;
    const selected = Array.from(files).slice(0, remaining);
    if (selected.length === 0) return;

    setUploading(true);
    setError(null);
    setSaved(false);
    try {
      const uploaded: DraftKitPhoto[] = [];
      for (const file of selected) {
        uploaded.push({ id: null, url: await uploadPhoto(file, "shop") });
      }
      setDraftPhotos((current) => [...current, ...uploaded].slice(0, 4));
    } catch (uploadError: unknown) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handleSave() {
    if (draftPhotos.length === 0) return;

    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const supabase = createClient();
      const { error: sectionError } = await supabase
        .from("shop_kit_section")
        .upsert([{
          id: 1,
          ...fields,
          updated_at: new Date().toISOString(),
        }]);
      if (sectionError) throw new Error(sectionError.message);

      const { toDelete, toInsert, toUpdate } = diffShopKitPhotos(
        originalPhotos,
        draftPhotos,
      );

      if (toDelete.length > 0) {
        const { error: deleteError } = await supabase
          .from("shop_kit_photos")
          .delete()
          .in("id", toDelete);
        if (deleteError) throw new Error(deleteError.message);
      }

      for (const update of toUpdate) {
        const { error: updateError } = await supabase
          .from("shop_kit_photos")
          .update({ sort_order: update.sort_order })
          .eq("id", update.id);
        if (updateError) throw new Error(updateError.message);
      }

      if (toInsert.length > 0) {
        const { error: insertError } = await supabase
          .from("shop_kit_photos")
          .insert(toInsert);
        if (insertError) throw new Error(insertError.message);
      }

      const fresh = await fetchShopKitContent();
      setOriginalPhotos(fresh.photos);
      setDraftPhotos(
        fresh.photos.map((photo) => ({ id: photo.id, url: photo.url })),
      );
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (saveError: unknown) {
      setError(saveError instanceof Error ? saveError.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  const previewSection: DBShopKitSection = {
    id: 1,
    ...fields,
    updated_at: "",
  };
  const previewPhotos: DBShopKitPhoto[] = draftPhotos.map((photo, index) => ({
    id: photo.id ?? `draft-${index}`,
    url: photo.url,
    sort_order: index,
    created_at: "",
  }));
  const saveDisabled = saving || uploading || draftPhotos.length === 0;

  return (
    <div className="mx-auto min-w-0 max-w-7xl overflow-hidden">
      <AdminSaveFeedback saving={saving} saved={saved} />
      <div className="mb-6 sm:mb-8">
        <h1
          className="font-display font-black uppercase leading-none text-white"
          style={{ fontSize: "clamp(2.25rem, 12vw, 3.5rem)" }}
        >
          Shop
        </h1>
        <p
          className="font-body mt-1"
          style={{ fontSize: "1rem", color: "rgba(255,255,255,0.35)" }}
        >
          Edit the shared 2026 Kit section shown on the homepage and shop page.
        </p>
      </div>

      {loading ? (
        <p
          className="font-display text-sm uppercase tracking-widest"
          style={{ color: "rgba(255,255,255,0.3)" }}
        >
          Loading…
        </p>
      ) : (
        <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(320px,420px)_minmax(0,1fr)]">
          <section
            className="min-w-0 self-start rounded-xl p-4 sm:p-6"
            style={{
              backgroundColor: "#141414",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <div className="mb-6">
              <p
                className="font-display font-bold uppercase tracking-widest"
                style={{ color: "#E7001B", fontSize: "0.72rem" }}
              >
                Shop Section Text
              </p>
              <p
                className="font-body mt-1 text-sm"
                style={{ color: "rgba(255,255,255,0.35)" }}
              >
                Changes remain a draft until you save.
              </p>
            </div>

            <div className="space-y-4">
              <Field
                label="Small Heading Above the Title"
                help='Example: "2026 Kit · Available Now"'
              >
                <input
                  type="text"
                  placeholder="2026 Kit · Available Now"
                  value={fields.eyebrow}
                  onChange={(event) => setField("eyebrow", event.target.value)}
                  style={inputStyle}
                />
              </Field>

              <Field
                label="Main Product Title"
                help="Press Enter where you want the title to start a new line."
              >
                <textarea
                  placeholder={"Thorn\nEdition\n2026"}
                  value={fields.title}
                  onChange={(event) => setField("title", event.target.value)}
                  rows={4}
                  style={{ ...inputStyle, resize: "vertical" }}
                />
              </Field>

              <Field
                label="Product Description"
                help="A short description shown below the main title."
              >
                <textarea
                  placeholder="Describe the jersey, its design, and what makes it special."
                  value={fields.description}
                  onChange={(event) => setField("description", event.target.value)}
                  rows={5}
                  style={{ ...inputStyle, resize: "vertical" }}
                />
              </Field>

              <div className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <Field
                  label="Purchase Button Text"
                  help='Example: "Buy Now →"'
                >
                  <input
                    type="text"
                    placeholder="Buy Now →"
                    value={fields.cta_label}
                    onChange={(event) => setField("cta_label", event.target.value)}
                    style={inputStyle}
                  />
                </Field>
                <Field
                  label="Purchase Page Link"
                  help="Paste the full web address where supporters can buy the kit."
                >
                  <input
                    type="url"
                    placeholder="https://..."
                    value={fields.cta_link}
                    onChange={(event) => setField("cta_link", event.target.value)}
                    style={inputStyle}
                  />
                </Field>
              </div>
            </div>

            <div
              className="my-6 h-px"
              style={{ backgroundColor: "rgba(255,255,255,0.07)" }}
            />

            <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p
                  className="font-display text-xs uppercase tracking-widest"
                  style={{ color: "rgba(255,255,255,0.35)" }}
                >
                  Kit Photos
                </p>
                <p
                  className="font-body mt-1 text-xs"
                  style={{ color: "rgba(255,255,255,0.22)" }}
                >
                  Drag-free ordering with arrow controls.
                </p>
              </div>
              <span
                className="font-display text-xs uppercase tracking-widest"
                style={{ color: "rgba(255,255,255,0.25)" }}
              >
                {draftPhotos.length}/4
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 min-[420px]:flex min-[420px]:flex-wrap">
              {draftPhotos.map((photo, index) => (
                <div key={photo.id ?? photo.url} className="min-w-0 min-[420px]:w-[76px]">
                  <div
                    className="group relative aspect-square w-full overflow-hidden rounded-lg min-[420px]:h-[72px]"
                    style={{ border: "1px solid rgba(255,255,255,0.08)" }}
                  >
                    <Image
                      src={photo.url}
                      alt={`Kit photo ${index + 1}`}
                      fill
                      sizes="72px"
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setDraftPhotos((current) =>
                          current.filter((_, photoIndex) => photoIndex !== index),
                        );
                        setSaved(false);
                      }}
                      className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full opacity-100 transition-opacity sm:h-6 sm:w-6 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
                      style={{ backgroundColor: "#E7001B" }}
                      aria-label={`Remove kit photo ${index + 1}`}
                    >
                      <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
                        <path d="M1 1L9 9M9 1L1 9" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
                      </svg>
                    </button>
                  </div>
                  <div className="mt-1 flex gap-1">
                    <OrderButton
                      label={`Move kit photo ${index + 1} left`}
                      disabled={index === 0}
                      onClick={() => movePhoto(index, -1)}
                    >
                      ←
                    </OrderButton>
                    <OrderButton
                      label={`Move kit photo ${index + 1} right`}
                      disabled={index === draftPhotos.length - 1}
                      onClick={() => movePhoto(index, 1)}
                    >
                      →
                    </OrderButton>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading || draftPhotos.length >= 4}
                className="flex aspect-square w-full flex-col items-center justify-center rounded-lg transition-colors min-[420px]:h-[72px] min-[420px]:w-[76px]"
                style={{
                  border: "1px dashed rgba(255,255,255,0.15)",
                  backgroundColor: uploading
                    ? "rgba(255,255,255,0.03)"
                    : "transparent",
                  color: "rgba(255,255,255,0.3)",
                  cursor:
                    uploading || draftPhotos.length >= 4
                      ? "not-allowed"
                      : "pointer",
                  opacity: draftPhotos.length >= 4 ? 0.4 : 1,
                }}
                aria-label="Add kit photos"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <span
                  className="font-display mt-1 uppercase"
                  style={{ fontSize: "0.55rem", letterSpacing: "0.08em" }}
                >
                  {uploading ? "Uploading" : "Add"}
                </span>
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(event) => handleUpload(event.target.files)}
              />
            </div>

            {draftPhotos.length >= 4 && (
              <p
                className="font-body mt-2 text-xs"
                style={{ color: "rgba(255,255,255,0.25)" }}
              >
                4 photo max.
              </p>
            )}
            {draftPhotos.length === 0 && (
              <p className="font-body mt-2 text-xs" style={{ color: "#E7001B" }}>
                At least 1 photo is required.
              </p>
            )}

            <div
              className="mt-6 border-t pt-5"
              style={{ borderColor: "rgba(255,255,255,0.07)" }}
            >
              {error && (
                <p className="font-body mb-3 text-sm" style={{ color: "#E7001B" }}>
                  Error: {error}
                </p>
              )}
              <button
                type="button"
                onClick={handleSave}
                disabled={saveDisabled}
                className="font-display w-full rounded-lg px-6 py-3 font-black uppercase tracking-widest text-white transition-opacity"
                style={{
                  backgroundColor: "#E7001B",
                  fontSize: "1rem",
                  opacity: saveDisabled ? 0.5 : 1,
                  cursor: saveDisabled ? "not-allowed" : "pointer",
                }}
              >
                {saving ? "Saving…" : uploading ? "Uploading…" : "Save Changes"}
              </button>
            </div>
          </section>

          <section className="min-w-0">
            <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p
                  className="font-display font-bold uppercase tracking-widest text-white"
                  style={{ fontSize: "0.9rem" }}
                >
                  Live Preview
                </p>
                <p
                  className="font-body mt-1 text-xs"
                  style={{ color: "rgba(255,255,255,0.3)" }}
                >
                  Desktop website view, scaled to fit.
                </p>
              </div>
              <span
                className="font-display rounded-full px-3 py-1 text-xs uppercase tracking-widest"
                style={{
                  color: "rgba(255,255,255,0.4)",
                  backgroundColor: "rgba(255,255,255,0.05)",
                }}
              >
                Draft
              </span>
            </div>

            <div
              className="overflow-hidden rounded-lg"
              style={{ border: "1px solid rgba(255,255,255,0.08)" }}
            >
              {previewPhotos.length > 0 ? (
                <ScaledShopKitPreview
                  section={previewSection}
                  photos={previewPhotos}
                />
              ) : (
                <div
                  className="flex min-h-72 items-center justify-center p-8 text-center"
                  style={{ backgroundColor: "#141414" }}
                >
                  <p
                    className="font-body text-sm"
                    style={{ color: "rgba(255,255,255,0.35)" }}
                  >
                    Add at least one kit photo to preview the public section.
                  </p>
                </div>
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
  children,
}: {
  label: string;
  help?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        className="font-display mb-1 block text-xs uppercase tracking-widest"
        style={{ color: "rgba(255,255,255,0.35)" }}
      >
        {label}
      </label>
      {children}
      {help && (
        <p
          className="font-body mt-1.5 text-xs leading-relaxed"
          style={{ color: "rgba(255,255,255,0.25)" }}
        >
          {help}
        </p>
      )}
    </div>
  );
}

function OrderButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex h-9 flex-1 items-center justify-center rounded sm:h-6"
      style={{
        backgroundColor: "rgba(255,255,255,0.05)",
        color: disabled ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.5)",
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      {children}
    </button>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  backgroundColor: "#0e0e0e",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "8px",
  padding: "9px 12px",
  color: "white",
  fontSize: "1rem",
  fontFamily: "inherit",
  outline: "none",
  colorScheme: "dark",
};
