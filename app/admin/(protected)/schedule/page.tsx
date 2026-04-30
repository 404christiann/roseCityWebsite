"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";

// ── Types ─────────────────────────────────────

type Match = {
  id: string;
  date: string;
  time: string;
  opponent: string;
  home: boolean;
  venue: string;
  address: string | null;
};

type FormState = Omit<Match, "id">;

function emptyForm(): FormState {
  return { date: "", time: "", opponent: "", home: true, venue: "", address: "" };
}

// ── Main component ────────────────────────────

export default function SchedulePage() {
  const [matches, setMatches]       = useState<Match[]>([]);
  const [loading, setLoading]       = useState(true);
  const [editingId, setEditingId]   = useState<string | null>(null);
  const [editForm, setEditForm]     = useState<FormState>(emptyForm());
  const [addOpen, setAddOpen]       = useState(false);
  const [addForm, setAddForm]       = useState<FormState>(emptyForm());
  const [saving, setSaving]         = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError]           = useState<string | null>(null);
  const [saved, setSaved]           = useState(false);

  // ── Load ────────────────────────────────────

  async function load() {
    const supabase = createClient();
    const { data } = await supabase
      .from("matches")
      .select("id, date, time, opponent, home, venue, address")
      .order("date")
      .order("time");
    setMatches((data ?? []) as Match[]);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function flash() {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  // ── Add ─────────────────────────────────────

  function validate(form: FormState): string | null {
    if (!form.date)     return "Date is required.";
    if (!form.time)     return "Time is required.";
    if (!form.opponent.trim()) return "Opponent is required.";
    if (!form.venue.trim())    return "Venue is required.";
    return null;
  }

  async function handleAdd() {
    const validationError = validate(addForm);
    if (validationError) { setError(validationError); return; }
    setSaving(true);
    setError(null);
    const supabase = createClient();
    const { error: e } = await supabase.from("matches").insert([{
      ...addForm,
      address: addForm.address?.trim() || null,
    }]);
    if (e) { setError(e.message); setSaving(false); return; }
    setAddForm(emptyForm());
    setAddOpen(false);
    await load();
    flash();
    setSaving(false);
  }

  // ── Edit ────────────────────────────────────

  function startEdit(m: Match) {
    setEditingId(m.id);
    setEditForm({ date: m.date, time: m.time, opponent: m.opponent, home: m.home, venue: m.venue, address: m.address ?? "" });
  }

  async function handleSaveEdit() {
    if (!editingId) return;
    const validationError = validate(editForm);
    if (validationError) { setError(validationError); return; }
    setSaving(true);
    setError(null);
    const supabase = createClient();
    const { error: e } = await supabase.from("matches").update({
      ...editForm,
      address: editForm.address?.trim() || null,
    }).eq("id", editingId);
    if (e) { setError(e.message); setSaving(false); return; }
    setEditingId(null);
    await load();
    flash();
    setSaving(false);
  }

  // ── Delete ──────────────────────────────────

  async function handleDelete(id: string) {
    setDeletingId(id);
    setError(null);
    const supabase = createClient();
    const { error: e } = await supabase.from("matches").delete().eq("id", id);
    if (e) { setError(e.message); setDeletingId(null); return; }
    setMatches((prev) => prev.filter((m) => m.id !== id));
    setDeletingId(null);
  }

  // ── Render ───────────────────────────────────

  const sorted = [...matches].sort(
    (a, b) => new Date(`${a.date} ${a.time}`).getTime() - new Date(`${b.date} ${b.time}`).getTime()
  );

  return (
    <div className="max-w-4xl mx-auto">

      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1
            className="font-display font-black uppercase text-white leading-none"
            style={{ fontSize: "clamp(1.8rem, 4vw, 2.5rem)" }}
          >
            Schedule
          </h1>
          <p className="font-body text-sm mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>
            Add, edit, or remove matches.
          </p>
        </div>

        <button
          onClick={() => { setAddOpen((o) => !o); setAddForm(emptyForm()); setError(null); }}
          className="flex-shrink-0 px-5 py-2.5 rounded-lg font-display font-black uppercase tracking-widest text-white text-xs transition-opacity"
          style={{ backgroundColor: "#dc2626" }}
        >
          {addOpen ? "Cancel" : "+ Add Match"}
        </button>
      </div>

      {/* Global feedback */}
      {saved && (
        <p className="font-display text-sm tracking-widest uppercase mb-4" style={{ color: "rgba(34,197,94,0.9)" }}>
          ✓ Saved
        </p>
      )}
      {error && (
        <p className="font-body text-sm mb-4" style={{ color: "#dc2626" }}>
          Error: {error}
        </p>
      )}

      {/* Add form */}
      {addOpen && (
        <div
          className="rounded-xl p-5 mb-6"
          style={{ backgroundColor: "#161616", border: "1px solid rgba(220,38,38,0.25)" }}
        >
          <p className="font-display font-black uppercase text-xs tracking-widest mb-4" style={{ color: "rgba(255,255,255,0.5)" }}>
            New Match
          </p>
          <MatchForm form={addForm} onChange={setAddForm} />
          <div className="mt-4 flex gap-3">
            <button
              onClick={handleAdd}
              disabled={saving}
              className="px-6 py-2 rounded-lg font-display font-black uppercase tracking-widest text-white text-xs"
              style={{ backgroundColor: "#dc2626", opacity: saving ? 0.6 : 1, cursor: saving ? "not-allowed" : "pointer" }}
            >
              {saving ? "Saving…" : "Save Match"}
            </button>
          </div>
        </div>
      )}

      {/* Match list */}
      {loading ? (
        <p className="font-display text-sm tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.3)" }}>
          Loading…
        </p>
      ) : sorted.length === 0 ? (
        <p className="font-body text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>
          No matches yet. Add one above.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {sorted.map((m) => {
            const isEditing = editingId === m.id;
            const isDeleting = deletingId === m.id;

            return (
              <div
                key={m.id}
                className="rounded-xl overflow-hidden"
                style={{ border: `1px solid ${isEditing ? "rgba(220,38,38,0.3)" : "rgba(255,255,255,0.07)"}` }}
              >
                {isEditing ? (
                  /* Edit mode */
                  <div className="p-5" style={{ backgroundColor: "#161616" }}>
                    <MatchForm form={editForm} onChange={setEditForm} />
                    <div className="mt-4 flex gap-3">
                      <button
                        onClick={handleSaveEdit}
                        disabled={saving}
                        className="px-6 py-2 rounded-lg font-display font-black uppercase tracking-widest text-white text-xs"
                        style={{ backgroundColor: "#dc2626", opacity: saving ? 0.6 : 1, cursor: saving ? "not-allowed" : "pointer" }}
                      >
                        {saving ? "Saving…" : "Save"}
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-6 py-2 rounded-lg font-display font-black uppercase tracking-widest text-xs"
                        style={{ backgroundColor: "#222", color: "rgba(255,255,255,0.5)" }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  /* View mode */
                  <div
                    className="flex items-center justify-between gap-4 px-5 py-4"
                    style={{ backgroundColor: "#111111" }}
                  >
                    <div className="min-w-0">
                      {/* Date + home/away badge */}
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-display font-bold text-white text-sm">{m.date}</span>
                        <span className="font-body text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>{m.time}</span>
                        <span
                          className="font-display font-black uppercase text-xs px-2 py-0.5 rounded"
                          style={{
                            backgroundColor: m.home ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.07)",
                            color: m.home ? "rgba(34,197,94,0.9)" : "rgba(255,255,255,0.4)",
                            fontSize: "0.6rem",
                            letterSpacing: "0.08em",
                          }}
                        >
                          {m.home ? "Home" : "Away"}
                        </span>
                      </div>

                      {/* Opponent */}
                      <p className="font-display font-black uppercase text-white" style={{ fontSize: "0.95rem" }}>
                        {m.home ? "vs" : "@"} {m.opponent}
                      </p>

                      {/* Venue */}
                      <p className="font-body text-xs mt-0.5 truncate" style={{ color: "rgba(255,255,255,0.3)" }}>
                        {m.venue}{m.address ? ` · ${m.address}` : ""}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => startEdit(m)}
                        className="px-4 py-1.5 rounded-lg font-display font-black uppercase tracking-widest text-xs transition-colors"
                        style={{
                          backgroundColor: "#1e1e1e",
                          border: "1px solid rgba(255,255,255,0.08)",
                          color: "rgba(255,255,255,0.6)",
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(m.id)}
                        disabled={isDeleting}
                        className="px-4 py-1.5 rounded-lg font-display font-black uppercase tracking-widest text-xs transition-colors"
                        style={{
                          backgroundColor: "rgba(220,38,38,0.1)",
                          border: "1px solid rgba(220,38,38,0.2)",
                          color: isDeleting ? "rgba(220,38,38,0.4)" : "rgba(220,38,38,0.8)",
                          cursor: isDeleting ? "not-allowed" : "pointer",
                        }}
                      >
                        {isDeleting ? "…" : "Delete"}
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

// ── Reusable form ─────────────────────────────

function MatchForm({
  form,
  onChange,
}: {
  form: Omit<Match, "id">;
  onChange: (f: Omit<Match, "id">) => void;
}) {
  function set(field: string, value: string | boolean) {
    onChange({ ...form, [field]: value });
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <Field label="Date" required>
        <input
          type="date"
          value={form.date}
          onChange={(e) => set("date", e.target.value)}
          style={inputStyle}
        />
      </Field>

      <Field label="Time" required>
        <input
          type="time"
          value={form.time}
          onChange={(e) => set("time", e.target.value)}
          style={inputStyle}
        />
      </Field>

      <Field label="Opponent" required>
        <input
          type="text"
          placeholder="e.g. Portland FC"
          value={form.opponent}
          onChange={(e) => set("opponent", e.target.value)}
          style={inputStyle}
        />
      </Field>

      <Field label="Home / Away" required>
        <select
          value={form.home ? "home" : "away"}
          onChange={(e) => set("home", e.target.value === "home")}
          style={inputStyle}
        >
          <option value="home">Home</option>
          <option value="away">Away</option>
        </select>
      </Field>

      <Field label="Venue" required>
        <input
          type="text"
          placeholder="e.g. Delta Park"
          value={form.venue}
          onChange={(e) => set("venue", e.target.value)}
          style={inputStyle}
        />
      </Field>

      <Field label="Address (optional)">
        <input
          type="text"
          placeholder="e.g. 1234 N Broadacre St"
          value={form.address ?? ""}
          onChange={(e) => set("address", e.target.value)}
          style={inputStyle}
        />
      </Field>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label
        className="block font-display text-xs tracking-widest uppercase mb-1"
        style={{ color: "rgba(255,255,255,0.35)" }}
      >
        {label}
        {required && <span style={{ color: "#dc2626", marginLeft: 3 }}>*</span>}
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
