/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase-browser";
// ── Nationalities ─────────────────────────────

const NATIONALITIES = [
  { flag: "🇺🇸", label: "American" },
  { flag: "🇦🇷", label: "Argentine" },
  { flag: "🇧🇴", label: "Bolivian" },
  { flag: "🇧🇷", label: "Brazilian" },
  { flag: "🇬🇧", label: "British" },
  { flag: "🇨🇲", label: "Cameroonian" },
  { flag: "🇨🇦", label: "Canadian" },
  { flag: "🇨🇱", label: "Chilean" },
  { flag: "🇨🇴", label: "Colombian" },
  { flag: "🇨🇩", label: "Congolese" },
  { flag: "🇨🇷", label: "Costa Rican" },
  { flag: "🇳🇱", label: "Dutch" },
  { flag: "🇪🇨", label: "Ecuadorian" },
  { flag: "🇸🇻", label: "Salvadoran" },
  { flag: "🇪🇹", label: "Ethiopian" },
  { flag: "🇵🇭", label: "Filipino" },
  { flag: "🇫🇷", label: "French" },
  { flag: "🇩🇪", label: "German" },
  { flag: "🇬🇭", label: "Ghanaian" },
  { flag: "🇬🇹", label: "Guatemalan" },
  { flag: "🇭🇳", label: "Honduran" },
  { flag: "🇮🇹", label: "Italian" },
  { flag: "🇨🇮", label: "Ivorian" },
  { flag: "🇯🇲", label: "Jamaican" },
  { flag: "🇰🇪", label: "Kenyan" },
  { flag: "🇲🇽", label: "Mexican" },
  { flag: "🇳🇮", label: "Nicaraguan" },
  { flag: "🇳🇬", label: "Nigerian" },
  { flag: "🇵🇦", label: "Panamanian" },
  { flag: "🇵🇾", label: "Paraguayan" },
  { flag: "🇵🇪", label: "Peruvian" },
  { flag: "🇵🇹", label: "Portuguese" },
  { flag: "🇸🇳", label: "Senegalese" },
  { flag: "🇪🇸", label: "Spanish" },
  { flag: "🇹🇹", label: "Trinidadian" },
  { flag: "🇹🇷", label: "Turkish" },
  { flag: "🇺🇾", label: "Uruguayan" },
  { flag: "🇻🇪", label: "Venezuelan" },
].sort((a, b) => a.label.localeCompare(b.label));

// ── Types ─────────────────────────────────────

type Position = "Goalkeeper" | "Defender" | "Midfielder" | "Forward";

type Player = {
  id: string;
  number: number;
  name: string;
  caption: string | null;
  nationality: string;
  position: Position;
  height: string;
  weight: string;
  hometown: string;
  age: number;
  school: string | null;
  previous_club: string | null;
  photo_url: string;
  active: boolean;
};

type Staff = {
  id: string;
  initials: string;
  name: string;
  role: string;
  hometown: string;
  photo_url: string;
  active: boolean;
};

type PlayerForm = Omit<Player, "id" | "active">;
type StaffForm  = Omit<Staff,  "id" | "active">;

function emptyPlayer(): PlayerForm {
  return {
    number: 0, name: "", caption: "", nationality: "", position: "Midfielder",
    height: "", weight: "", hometown: "", age: 0,
    school: "", previous_club: "", photo_url: "",
  };
}
function emptyStaff(): StaffForm {
  return { initials: "", name: "", role: "", hometown: "", photo_url: "" };
}

const POSITIONS: Position[] = ["Goalkeeper", "Defender", "Midfielder", "Forward"];

// ── Default photo ─────────────────────────────

const DEFAULT_PLAYER_PHOTO = "/images/logo/rosecityLogo.jpeg";

// ── Photo upload helper ───────────────────────

async function uploadPhoto(file: File, bucket: string): Promise<string> {
  const supabase = createClient();
  const ext  = file.name.split(".").pop() ?? "jpg";
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
  if (error) throw new Error(error.message);
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

// ── Main component ────────────────────────────

export default function RosterPage() {
  const [tab, setTab] = useState<"players" | "staff">("players");

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1
          className="font-display font-black uppercase text-white leading-none"
          style={{ fontSize: "clamp(1.8rem, 4vw, 2.5rem)" }}
        >
          Roster
        </h1>
        <p className="font-body text-sm mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>
          Manage players and technical staff.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8">
        {(["players", "staff"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="px-5 py-2 rounded-lg font-display font-black uppercase tracking-widest text-xs transition-all"
            style={{
              backgroundColor: tab === t ? "#dc2626" : "#1a1a1a",
              color: tab === t ? "white" : "rgba(255,255,255,0.4)",
              border: `1px solid ${tab === t ? "#dc2626" : "rgba(255,255,255,0.07)"}`,
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "players" ? <PlayersTab /> : <StaffTab />}
    </div>
  );
}

// ── Players tab ───────────────────────────────

function PlayersTab() {
  const [players, setPlayers]     = useState<Player[]>([]);
  const [loading, setLoading]     = useState(true);
  const [addOpen, setAddOpen]     = useState(false);
  const [addForm, setAddForm]     = useState<PlayerForm>(emptyPlayer());
  const [addPhoto, setAddPhoto]   = useState<File | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm]   = useState<PlayerForm>(emptyPlayer());
  const [editPhoto, setEditPhoto] = useState<File | null>(null);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [saved, setSaved]         = useState(false);

  async function load() {
    const supabase = createClient();
    const { data } = await supabase
      .from("players")
      .select("*")
      .order("number");
    setPlayers((data ?? []) as Player[]);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function flash() { setSaved(true); setTimeout(() => setSaved(false), 3000); }

  function validatePlayer(f: PlayerForm): string | null {
    if (!f.name.trim())        return "Name is required.";
    if (!f.position)           return "Position is required.";
    if (!f.nationality.trim()) return "Nationality is required.";
    if (!f.hometown.trim())    return "Hometown is required.";
    if (!f.height.trim())      return "Height is required.";
    if (!f.weight.trim())      return "Weight is required.";
    if (f.number <= 0)         return "Jersey number must be greater than 0.";
    if (f.age <= 0)            return "Age must be greater than 0.";
    return null;
  }

  async function handleAdd() {
    const ve = validatePlayer(addForm);
    if (ve) { setError(ve); return; }
    setSaving(true); setError(null);
    try {
      const supabase = createClient();
      let photoUrl = addForm.photo_url;
      if (addPhoto) photoUrl = await uploadPhoto(addPhoto, "roster-images");

      const { error: e } = await supabase.from("players").insert([{
        ...addForm,
        photo_url: photoUrl,
        caption:       addForm.caption?.trim()       || null,
        school:        addForm.school?.trim()        || null,
        previous_club: addForm.previous_club?.trim() || null,
        active: true,
      }]);
      if (e) { setError(e.message); setSaving(false); return; }
      setAddForm(emptyPlayer()); setAddPhoto(null); setAddOpen(false);
      await load(); flash();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed");
    }
    setSaving(false);
  }

  function startEdit(p: Player) {
    setEditingId(p.id);
    setEditPhoto(null);
    setEditForm({
      number: p.number, name: p.name, caption: p.caption ?? "",
      nationality: p.nationality, position: p.position,
      height: p.height, weight: p.weight, hometown: p.hometown,
      age: p.age, school: p.school ?? "", previous_club: p.previous_club ?? "",
      photo_url: p.photo_url,
    });
  }

  async function handleSaveEdit() {
    if (!editingId) return;
    const ve = validatePlayer(editForm);
    if (ve) { setError(ve); return; }
    setSaving(true); setError(null);
    try {
      const supabase = createClient();
      let photoUrl = editForm.photo_url;
      if (editPhoto) photoUrl = await uploadPhoto(editPhoto, "roster-images");

      const { error: e } = await supabase.from("players").update({
        ...editForm,
        photo_url: photoUrl,
        caption:       editForm.caption?.trim()       || null,
        school:        editForm.school?.trim()        || null,
        previous_club: editForm.previous_club?.trim() || null,
      }).eq("id", editingId);
      if (e) { setError(e.message); setSaving(false); return; }
      setEditingId(null); setEditPhoto(null);
      await load(); flash();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed");
    }
    setSaving(false);
  }

  async function toggleActive(p: Player) {
    const supabase = createClient();
    await supabase.from("players").update({ active: !p.active }).eq("id", p.id);
    await load();
  }

  const sorted = [...players].sort((a, b) => a.number - b.number);

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6">
        <p className="font-body text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>
          {players.filter(p => p.active).length} active · {players.filter(p => !p.active).length} inactive
        </p>
        <button
          onClick={() => { setAddOpen(o => !o); setAddForm(emptyPlayer()); setAddPhoto(null); setError(null); }}
          className="px-5 py-2.5 rounded-lg font-display font-black uppercase tracking-widest text-white text-xs"
          style={{ backgroundColor: "#dc2626" }}
        >
          {addOpen ? "Cancel" : "+ Add Player"}
        </button>
      </div>

      {/* Feedback */}
      {saved  && <p className="font-display text-sm tracking-widest uppercase mb-4" style={{ color: "rgba(34,197,94,0.9)" }}>✓ Saved</p>}
      {error  && <p className="font-body text-sm mb-4" style={{ color: "#dc2626" }}>Error: {error}</p>}

      {/* Add form */}
      {addOpen && (
        <div className="rounded-xl p-5 mb-6" style={{ backgroundColor: "#161616", border: "1px solid rgba(220,38,38,0.25)" }}>
          <p className="font-display font-black uppercase text-xs tracking-widest mb-4" style={{ color: "rgba(255,255,255,0.5)" }}>New Player</p>
          <PlayerFormFields form={addForm} onChange={setAddForm} photoFile={addPhoto} onPhotoChange={setAddPhoto} />
          <div className="mt-4">
            <button onClick={handleAdd} disabled={saving}
              className="px-6 py-2 rounded-lg font-display font-black uppercase tracking-widest text-white text-xs"
              style={{ backgroundColor: "#dc2626", opacity: saving ? 0.6 : 1 }}>
              {saving ? "Saving…" : "Save Player"}
            </button>
          </div>
        </div>
      )}

      {/* Player list grouped by position */}
      {loading ? (
        <p className="font-display text-sm tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.3)" }}>Loading…</p>
      ) : (
        <div className="flex flex-col gap-3">
          {POSITIONS.map((pos) => {
            const group = sorted.filter((p) => p.position === pos);
            if (group.length === 0) return null;
            return (
              <PlayerPositionGroup
                key={pos}
                pos={pos}
                group={group}
                editingId={editingId}
                editForm={editForm}
                editPhoto={editPhoto}
                saving={saving}
                setEditForm={setEditForm}
                setEditPhoto={setEditPhoto}
                startEdit={(p) => { startEdit(p); setError(null); }}
                handleSaveEdit={handleSaveEdit}
                cancelEdit={() => { setEditingId(null); setError(null); }}
                toggleActive={toggleActive}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Player position group (collapsible) ───────

function PlayerPositionGroup({
  pos, group, editingId, editForm, editPhoto, saving,
  setEditForm, setEditPhoto, startEdit, handleSaveEdit, cancelEdit, toggleActive,
}: {
  pos: string;
  group: Player[];
  editingId: string | null;
  editForm: PlayerForm;
  editPhoto: File | null;
  saving: boolean;
  setEditForm: (f: PlayerForm) => void;
  setEditPhoto: (f: File | null) => void;
  startEdit: (p: Player) => void;
  handleSaveEdit: () => void;
  cancelEdit: () => void;
  toggleActive: (p: Player) => void;
}) {
  const [open, setOpen] = useState(true);

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
      {/* Position header */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3"
        style={{ backgroundColor: "#161616" }}
      >
        <span className="font-display font-black uppercase tracking-widest text-xs" style={{ color: "rgba(255,255,255,0.9)" }}>
          {pos}s{" "}
          <span style={{ color: "rgba(255,255,255,0.25)", fontWeight: 400 }}>{group.length}</span>
        </span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
          style={{ color: "rgba(255,255,255,0.3)", transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.25s ease" }}>
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Animated content */}
      <div style={{ display: "grid", gridTemplateRows: open ? "1fr" : "0fr", transition: "grid-template-rows 0.25s ease" }}>
        <div style={{ overflow: "hidden" }}>
          <div className="flex flex-col">
            {group.map((p) => {
              const isEditing = editingId === p.id;
              return (
                <div key={p.id}
                  style={{ borderTop: "1px solid rgba(255,255,255,0.04)", ...(isEditing ? { border: "1px solid rgba(220,38,38,0.3)" } : {}) }}>
                  {isEditing ? (
                    <div className="p-5" style={{ backgroundColor: "#161616" }}>
                      <PlayerFormFields form={editForm} onChange={setEditForm} photoFile={editPhoto} onPhotoChange={setEditPhoto} />
                      <div className="mt-4 flex gap-3">
                        <button onClick={handleSaveEdit} disabled={saving}
                          className="px-6 py-2 rounded-lg font-display font-black uppercase tracking-widest text-white text-xs"
                          style={{ backgroundColor: "#dc2626", opacity: saving ? 0.6 : 1 }}>
                          {saving ? "Saving…" : "Save"}
                        </button>
                        <button onClick={cancelEdit}
                          className="px-6 py-2 rounded-lg font-display font-black uppercase tracking-widest text-xs"
                          style={{ backgroundColor: "#222", color: "rgba(255,255,255,0.5)" }}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4 px-5 py-4"
                      style={{ backgroundColor: p.active ? "#111111" : "#0d0d0d", opacity: p.active ? 1 : 0.5 }}>
                      {/* Photo */}
                      <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0"
                        style={{ backgroundColor: "#1a1a1a", border: "1px solid rgba(255,255,255,0.08)" }}>
                        <img src={p.photo_url || DEFAULT_PLAYER_PHOTO} alt={p.name} className="w-full h-full object-cover" />
                      </div>
                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-display font-black text-white text-sm">#{p.number} {p.name}</span>
                          {!p.active && (
                            <span className="font-display uppercase px-2 py-0.5 rounded"
                              style={{ backgroundColor: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.3)", fontSize: "0.55rem", letterSpacing: "0.08em" }}>
                              Inactive
                            </span>
                          )}
                        </div>
                        <p className="font-body text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
                          {p.nationality}
                        </p>
                      </div>
                      {/* Actions */}
                      <div className="flex gap-2 flex-shrink-0">
                        <button onClick={() => startEdit(p)}
                          className="px-4 py-1.5 rounded-lg font-display font-black uppercase tracking-widest text-xs"
                          style={{ backgroundColor: "#1e1e1e", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)" }}>
                          Edit
                        </button>
                        <button onClick={() => toggleActive(p)}
                          className="px-4 py-1.5 rounded-lg font-display font-black uppercase tracking-widest text-xs"
                          style={{
                            backgroundColor: p.active ? "rgba(220,38,38,0.1)" : "rgba(34,197,94,0.1)",
                            border: `1px solid ${p.active ? "rgba(220,38,38,0.2)" : "rgba(34,197,94,0.2)"}`,
                            color: p.active ? "rgba(220,38,38,0.8)" : "rgba(34,197,94,0.8)",
                          }}>
                          {p.active ? "Deactivate" : "Activate"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Staff tab ─────────────────────────────────

function StaffTab() {
  const [staff, setStaff]         = useState<Staff[]>([]);
  const [loading, setLoading]     = useState(true);
  const [addOpen, setAddOpen]     = useState(false);
  const [addForm, setAddForm]     = useState<StaffForm>(emptyStaff());
  const [addPhoto, setAddPhoto]   = useState<File | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm]   = useState<StaffForm>(emptyStaff());
  const [editPhoto, setEditPhoto] = useState<File | null>(null);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [saved, setSaved]         = useState(false);

  async function load() {
    const supabase = createClient();
    const { data } = await supabase.from("staff").select("*").order("name");
    setStaff((data ?? []) as Staff[]);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function flash() { setSaved(true); setTimeout(() => setSaved(false), 3000); }

  function validateStaff(f: StaffForm): string | null {
    if (!f.name.trim())     return "Name is required.";
    if (!f.initials.trim()) return "Initials are required.";
    if (!f.role.trim())     return "Role is required.";
    if (!f.hometown.trim()) return "Hometown is required.";
    return null;
  }

  async function handleAdd() {
    const ve = validateStaff(addForm);
    if (ve) { setError(ve); return; }
    setSaving(true); setError(null);
    try {
      const supabase = createClient();
      let photoUrl = addForm.photo_url;
      if (addPhoto) photoUrl = await uploadPhoto(addPhoto, "staff-images");

      const { error: e } = await supabase.from("staff").insert([{ ...addForm, photo_url: photoUrl, active: true }]);
      if (e) { setError(e.message); setSaving(false); return; }
      setAddForm(emptyStaff()); setAddPhoto(null); setAddOpen(false);
      await load(); flash();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed");
    }
    setSaving(false);
  }

  function startEdit(s: Staff) {
    setEditingId(s.id);
    setEditPhoto(null);
    setEditForm({ initials: s.initials, name: s.name, role: s.role, hometown: s.hometown, photo_url: s.photo_url });
  }

  async function handleSaveEdit() {
    if (!editingId) return;
    const ve = validateStaff(editForm);
    if (ve) { setError(ve); return; }
    setSaving(true); setError(null);
    try {
      const supabase = createClient();
      let photoUrl = editForm.photo_url;
      if (editPhoto) photoUrl = await uploadPhoto(editPhoto, "staff-images");

      const { error: e } = await supabase.from("staff").update({ ...editForm, photo_url: photoUrl }).eq("id", editingId);
      if (e) { setError(e.message); setSaving(false); return; }
      setEditingId(null); setEditPhoto(null);
      await load(); flash();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed");
    }
    setSaving(false);
  }

  async function toggleActive(s: Staff) {
    const supabase = createClient();
    await supabase.from("staff").update({ active: !s.active }).eq("id", s.id);
    await load();
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6">
        <p className="font-body text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>
          {staff.filter(s => s.active).length} active · {staff.filter(s => !s.active).length} inactive
        </p>
        <button
          onClick={() => { setAddOpen(o => !o); setAddForm(emptyStaff()); setAddPhoto(null); setError(null); }}
          className="px-5 py-2.5 rounded-lg font-display font-black uppercase tracking-widest text-white text-xs"
          style={{ backgroundColor: "#dc2626" }}>
          {addOpen ? "Cancel" : "+ Add Staff"}
        </button>
      </div>

      {/* Feedback */}
      {saved && <p className="font-display text-sm tracking-widest uppercase mb-4" style={{ color: "rgba(34,197,94,0.9)" }}>✓ Saved</p>}
      {error && <p className="font-body text-sm mb-4" style={{ color: "#dc2626" }}>Error: {error}</p>}

      {/* Add form */}
      {addOpen && (
        <div className="rounded-xl p-5 mb-6" style={{ backgroundColor: "#161616", border: "1px solid rgba(220,38,38,0.25)" }}>
          <p className="font-display font-black uppercase text-xs tracking-widest mb-4" style={{ color: "rgba(255,255,255,0.5)" }}>New Staff Member</p>
          <StaffFormFields form={addForm} onChange={setAddForm} photoFile={addPhoto} onPhotoChange={setAddPhoto} />
          <div className="mt-4">
            <button onClick={handleAdd} disabled={saving}
              className="px-6 py-2 rounded-lg font-display font-black uppercase tracking-widest text-white text-xs"
              style={{ backgroundColor: "#dc2626", opacity: saving ? 0.6 : 1 }}>
              {saving ? "Saving…" : "Save Staff Member"}
            </button>
          </div>
        </div>
      )}

      {/* Staff list */}
      {loading ? (
        <p className="font-display text-sm tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.3)" }}>Loading…</p>
      ) : (
        <div className="flex flex-col gap-3">
          {staff.map((s) => {
            const isEditing = editingId === s.id;
            return (
              <div key={s.id} className="rounded-xl overflow-hidden"
                style={{ border: `1px solid ${isEditing ? "rgba(220,38,38,0.3)" : "rgba(255,255,255,0.07)"}` }}>
                {isEditing ? (
                  <div className="p-5" style={{ backgroundColor: "#161616" }}>
                    <StaffFormFields form={editForm} onChange={setEditForm} photoFile={editPhoto} onPhotoChange={setEditPhoto} />
                    <div className="mt-4 flex gap-3">
                      <button onClick={handleSaveEdit} disabled={saving}
                        className="px-6 py-2 rounded-lg font-display font-black uppercase tracking-widest text-white text-xs"
                        style={{ backgroundColor: "#dc2626", opacity: saving ? 0.6 : 1 }}>
                        {saving ? "Saving…" : "Save"}
                      </button>
                      <button onClick={() => { setEditingId(null); setError(null); }}
                        className="px-6 py-2 rounded-lg font-display font-black uppercase tracking-widest text-xs"
                        style={{ backgroundColor: "#222", color: "rgba(255,255,255,0.5)" }}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-4 px-5 py-4"
                    style={{ backgroundColor: s.active ? "#111111" : "#0d0d0d", opacity: s.active ? 1 : 0.5 }}>
                    {/* Photo */}
                    <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center"
                      style={{ backgroundColor: "#1a1a1a", border: "1px solid rgba(255,255,255,0.08)" }}>
                      {s.photo_url
                        ? <img src={s.photo_url} alt={s.name} className="w-full h-full object-cover" />
                        : <span className="font-display font-black text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{s.initials}</span>
                      }
                    </div>
                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-display font-black text-white text-sm">{s.name}</span>
                        {!s.active && (
                          <span className="font-display text-xs uppercase px-2 py-0.5 rounded"
                            style={{ backgroundColor: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.3)", fontSize: "0.55rem", letterSpacing: "0.08em" }}>
                            Inactive
                          </span>
                        )}
                      </div>
                      <p className="font-body text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>{s.role}</p>
                    </div>
                    {/* Actions */}
                    <div className="flex gap-2 flex-shrink-0">
                      <button onClick={() => { startEdit(s); setError(null); }}
                        className="px-4 py-1.5 rounded-lg font-display font-black uppercase tracking-widest text-xs"
                        style={{ backgroundColor: "#1e1e1e", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)" }}>
                        Edit
                      </button>
                      <button onClick={() => toggleActive(s)}
                        className="px-4 py-1.5 rounded-lg font-display font-black uppercase tracking-widest text-xs"
                        style={{
                          backgroundColor: s.active ? "rgba(220,38,38,0.1)" : "rgba(34,197,94,0.1)",
                          border: `1px solid ${s.active ? "rgba(220,38,38,0.2)" : "rgba(34,197,94,0.2)"}`,
                          color: s.active ? "rgba(220,38,38,0.8)" : "rgba(34,197,94,0.8)",
                        }}>
                        {s.active ? "Deactivate" : "Activate"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Player form fields ────────────────────────

function PlayerFormFields({
  form, onChange, photoFile, onPhotoChange,
}: {
  form: PlayerForm;
  onChange: (f: PlayerForm) => void;
  photoFile: File | null;
  onPhotoChange: (f: File | null) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const preview = photoFile ? URL.createObjectURL(photoFile) : (form.photo_url || DEFAULT_PLAYER_PHOTO);

  function set(field: string, value: string | number) {
    onChange({ ...form, [field]: value });
  }

  return (
    <div className="space-y-4">
      {/* Photo picker */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center"
          style={{ backgroundColor: "#0e0e0e", border: "1px solid rgba(255,255,255,0.08)" }}>
          <img src={preview} alt="preview" className="w-full h-full object-cover" />
        </div>
        <div>
          <button type="button" onClick={() => fileRef.current?.click()}
            className="px-4 py-2 rounded-lg font-display font-black uppercase tracking-widest text-xs"
            style={{ backgroundColor: "#1e1e1e", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)" }}>
            {preview ? "Change Photo" : "Upload Photo"}
          </button>
          {photoFile && (
            <p className="font-body text-xs mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>{photoFile.name}</p>
          )}
          <input ref={fileRef} type="file" accept="image/*" className="hidden"
            onChange={(e) => onPhotoChange(e.target.files?.[0] ?? null)} />
        </div>
      </div>

      {/* Fields grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Name" required>
          <input type="text" placeholder="e.g. Christian Alcala" value={form.name}
            onChange={(e) => set("name", e.target.value)} style={inputStyle} />
        </Field>
        <Field label="Jersey #" required>
          <input type="number" min={1} value={form.number || ""}
            onChange={(e) => set("number", Number(e.target.value))} style={inputStyle} />
        </Field>
        <Field label="Position" required>
          <select value={form.position} onChange={(e) => set("position", e.target.value)} style={inputStyle}>
            {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </Field>
        <Field label="Nationality" required>
          <NationalitySelect
            value={form.nationality}
            onChange={(v) => set("nationality", v)}
          />
        </Field>
        <Field label="Hometown" required>
          <input type="text" placeholder="e.g. Portland, OR" value={form.hometown}
            onChange={(e) => set("hometown", e.target.value)} style={inputStyle} />
        </Field>
        <Field label="Age" required>
          <input type="number" min={1} value={form.age || ""}
            onChange={(e) => set("age", Number(e.target.value))} style={inputStyle} />
        </Field>
        <Field label="Height" required>
          <input type="text" placeholder={"e.g. 5'10\""} value={form.height}
            onChange={(e) => set("height", e.target.value)} style={inputStyle} />
        </Field>
        <Field label="Weight" required>
          <input type="text" placeholder="e.g. 165 lbs" value={form.weight}
            onChange={(e) => set("weight", e.target.value)} style={inputStyle} />
        </Field>
        <Field label="School (optional)">
          <input type="text" placeholder="e.g. University of Portland" value={form.school ?? ""}
            onChange={(e) => set("school", e.target.value)} style={inputStyle} />
        </Field>
        <Field label="Previous Club (optional)">
          <input type="text" placeholder="e.g. Portland FC" value={form.previous_club ?? ""}
            onChange={(e) => set("previous_club", e.target.value)} style={inputStyle} />
        </Field>
        <Field label="Caption (optional)" >
          <input type="text" placeholder="Short bio or tagline" value={form.caption ?? ""}
            onChange={(e) => set("caption", e.target.value)} style={inputStyle} />
        </Field>
      </div>
    </div>
  );
}

// ── Staff form fields ─────────────────────────

function StaffFormFields({
  form, onChange, photoFile, onPhotoChange,
}: {
  form: StaffForm;
  onChange: (f: StaffForm) => void;
  photoFile: File | null;
  onPhotoChange: (f: File | null) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const preview = photoFile ? URL.createObjectURL(photoFile) : form.photo_url || null;

  function set(field: string, value: string) {
    onChange({ ...form, [field]: value });
  }

  return (
    <div className="space-y-4">
      {/* Photo picker */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center"
          style={{ backgroundColor: "#0e0e0e", border: "1px solid rgba(255,255,255,0.08)" }}>
          {preview
            ? <img src={preview} alt="preview" className="w-full h-full object-cover" />
            : <span className="font-display font-black text-lg" style={{ color: "rgba(255,255,255,0.2)" }}>
                {form.initials || "?"}
              </span>
          }
        </div>
        <div>
          <button type="button" onClick={() => fileRef.current?.click()}
            className="px-4 py-2 rounded-lg font-display font-black uppercase tracking-widest text-xs"
            style={{ backgroundColor: "#1e1e1e", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)" }}>
            {preview ? "Change Photo" : "Upload Photo"}
          </button>
          {photoFile && (
            <p className="font-body text-xs mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>{photoFile.name}</p>
          )}
          <input ref={fileRef} type="file" accept="image/*" className="hidden"
            onChange={(e) => onPhotoChange(e.target.files?.[0] ?? null)} />
        </div>
      </div>

      {/* Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Name" required>
          <input type="text" placeholder="e.g. John Smith" value={form.name}
            onChange={(e) => set("name", e.target.value)} style={inputStyle} />
        </Field>
        <Field label="Initials" required>
          <input type="text" placeholder="e.g. JS" maxLength={3} value={form.initials}
            onChange={(e) => set("initials", e.target.value.toUpperCase())} style={inputStyle} />
        </Field>
        <Field label="Role" required>
          <input type="text" placeholder="e.g. Head Coach" value={form.role}
            onChange={(e) => set("role", e.target.value)} style={inputStyle} />
        </Field>
        <Field label="Hometown" required>
          <input type="text" placeholder="e.g. Portland, OR" value={form.hometown}
            onChange={(e) => set("hometown", e.target.value)} style={inputStyle} />
        </Field>
      </div>
    </div>
  );
}

// ── Nationality dropdown ──────────────────────

function NationalitySelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const selected = NATIONALITIES.find((n) => n.label === value) ?? (value ? { flag: "🏳️", label: value } : null);
  const filtered = NATIONALITIES.filter((n) =>
    n.label.toLowerCase().includes(search.toLowerCase()) ||
    n.flag.includes(search)
  );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => { setOpen((o) => !o); setSearch(""); }}
        className="w-full flex items-center gap-3 text-left"
        style={{ ...inputStyle, cursor: "pointer" }}
      >
        {selected ? (
          <>
            <span style={{ fontSize: "1.2rem", lineHeight: 1 }}>{selected.flag}</span>
            <span className="font-body text-sm text-white">{selected.label}</span>
          </>
        ) : (
          <span className="font-body text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>Select nationality…</span>
        )}
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ marginLeft: "auto", color: "rgba(255,255,255,0.3)", flexShrink: 0, transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.15s" }}>
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            backgroundColor: "#1a1a1a",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 8,
            zIndex: 50,
            maxHeight: 240,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Search */}
          <div style={{ padding: "8px 10px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <input
              autoFocus
              type="text"
              placeholder="Search…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full font-body text-sm text-white outline-none"
              style={{ backgroundColor: "transparent", border: "none" }}
            />
          </div>

          {/* Options */}
          <div style={{ overflowY: "auto" }}>
            {filtered.length === 0 ? (
              <p className="font-body text-xs px-3 py-3" style={{ color: "rgba(255,255,255,0.3)" }}>No results</p>
            ) : (
              filtered.map((n) => (
                <button
                  key={n.label}
                  type="button"
                  onClick={() => { onChange(n.label); setOpen(false); setSearch(""); }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-left transition-colors"
                  style={{
                    backgroundColor: value === n.label ? "rgba(220,38,38,0.15)" : "transparent",
                    border: "none",
                  }}
                  onMouseEnter={(e) => { if (value !== n.label) (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.05)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = value === n.label ? "rgba(220,38,38,0.15)" : "transparent"; }}
                >
                  <span style={{ fontSize: "1.2rem", lineHeight: 1 }}>{n.flag}</span>
                  <span className="font-body text-sm text-white">{n.label}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Shared UI ─────────────────────────────────

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block font-display text-xs tracking-widest uppercase mb-1" style={{ color: "rgba(255,255,255,0.35)" }}>
        {label}{required && <span style={{ color: "#dc2626", marginLeft: 3 }}>*</span>}
      </label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  backgroundColor: "#0e0e0e",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "8px",
  padding: "8px 12px",
  color: "white",
  fontSize: "0.875rem",
  fontFamily: "inherit",
  outline: "none",
  colorScheme: "dark",
};
