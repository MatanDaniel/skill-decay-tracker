import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";

// API functions for skill + notes
import {
  getSkill,
  getNotes,
  addNote,
  deleteNote,
} from "@/api/skillsApi";

export default function SkillDetails({ skills }) {
  // Get skill id from URL (/skills/:id)
  const { id } = useParams();
  const numericId = Number(id);

  // Try to find the skill from the already-loaded list (faster, no API call)
  const fromList = useMemo(() => {
    if (!Array.isArray(skills)) return null;
    return skills.find((s) => Number(s.id) === numericId) ?? null;
  }, [skills, numericId]);

  // -------------------------
  // Skill state (main entity)
  // -------------------------
  const [skill, setSkill] = useState(fromList);
  const [loading, setLoading] = useState(!fromList);
  const [error, setError] = useState(null);

  // Load skill from backend only if not already available in memory
  useEffect(() => {
    let cancelled = false;

    async function loadSkill() {
      if (fromList) {
        setSkill(fromList);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await getSkill(numericId);
        if (!cancelled) setSkill(data);
      } catch (e) {
        if (!cancelled) setError(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (Number.isFinite(numericId)) loadSkill();

    return () => {
      cancelled = true; // prevent setting state after unmount
    };
  }, [numericId, fromList]);

  // -------------------------
  // Notes state (new feature)
  // -------------------------
  const [notes, setNotes] = useState([]);
  const [noteText, setNoteText] = useState("");
  const [notesLoading, setNotesLoading] = useState(false);
  const [notesError, setNotesError] = useState(null);

  // Fetch all notes for this skill
  async function loadNotes() {
    setNotesLoading(true);
    setNotesError(null);
    try {
      const rows = await getNotes(numericId);
      setNotes(rows);
    } catch (e) {
      setNotesError(e);
    } finally {
      setNotesLoading(false);
    }
  }

  // Reload notes whenever user navigates to a different skill
  useEffect(() => {
    if (!Number.isFinite(numericId)) return;
    loadNotes();
  }, [numericId]);

  // Add a new note
  async function handleAddNote() {
    const text = noteText.trim();
    // basic validation
    if (text.length < 2) return;

    setNotesError(null);
    try {
      const created = await addNote(numericId, text);

      // Add new note to UI immediately (no reload needed)
      setNotes((prev) => [created, ...prev]);

      // Clear textarea
      setNoteText("");
    } catch (e) {
      setNotesError(e);
    }
  }

  // Delete a note
  async function handleDeleteNote(noteId) {
    setNotesError(null);
    try {
      await deleteNote(numericId, noteId);

      // Remove note from UI
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
    } catch (e) {
      setNotesError(e);
    }
  }

  // Format timestamp nicely
  function formatDate(dt) {
    if (!dt) return "—";
    const d = new Date(dt);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleString();
  }

  // -------------------------
  // UI states (guards)
  // -------------------------

  if (!Number.isFinite(numericId)) {
    return <div className="p-6">Invalid skill id</div>;
  }

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (error) {
    return (
      <div className="p-6">
        <h2 className="text-lg font-semibold">Failed to load skill</h2>
        <p className="text-muted-foreground mt-2">
          {String(error.message || error)}
        </p>
        <Link to="/skills" className="underline mt-4 inline-block">
          Back to Skills
        </Link>
      </div>
    );
  }

  if (!skill) {
    return (
      <div className="p-6">
        <h2 className="text-lg font-semibold">Skill not found</h2>
        <p className="text-muted-foreground mt-2">
          This skill is not in the database.
        </p>
        <Link to="/skills" className="underline mt-4 inline-block">
          Back to Skills
        </Link>
      </div>
    );
  }

  // -------------------------
  // Main UI
  // -------------------------
  return (
    <div className="p-6 space-y-6">
      {/* Skill info */}
      <div className="rounded-xl border bg-card p-5">
        <h1 className="text-2xl font-semibold">{skill.name}</h1>

        <div className="mt-2 text-muted-foreground">
          Category: {skill.category ?? "—"}
        </div>

        <div className="mt-1 text-muted-foreground">
          Decay: {skill.decay_score ?? "—"}
        </div>

        <div className="mt-1 text-muted-foreground">
          Readiness score: {skill.readiness_score ?? 0}
        </div>

        <div className="mt-1 text-muted-foreground">
          Last practiced: {formatDate(skill.last_practiced_at)}
        </div>
      </div>

      {/* Notes section */}
      <div className="rounded-xl border bg-card p-5">
        <h2 className="text-lg font-semibold">Notes</h2>

        {/* Error message */}
        {notesError && (
          <div className="mt-3 rounded-md border border-red-300 bg-red-50 p-3 text-sm">
            {String(notesError.message || notesError)}
          </div>
        )}

        {/* Add new note */}
        <div className="mt-4 space-y-2">
          <textarea
            className="w-full rounded-md border bg-background p-3 text-sm"
            rows={3}
            placeholder="Write a note you want to remember for this skill..."
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
          />

          <button
            type="button"
            className="rounded-md bg-primary px-4 py-2 text-primary-foreground text-sm"
            onClick={handleAddNote}
            disabled={notesLoading}
          >
            Add Note
          </button>
        </div>

        {/* Notes list */}
        <div className="mt-5">
          {notesLoading ? (
            <div className="text-sm text-muted-foreground">
              Loading notes...
            </div>
          ) : notes.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No notes yet. Add your first note above.
            </div>
          ) : (
            <ul className="space-y-3">
              {notes.map((n) => (
                <li key={n.id} className="rounded-lg border p-3">
                  <div className="text-sm whitespace-pre-wrap">
                    {n.content}
                  </div>

                  <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{formatDate(n.created_at)}</span>

                    <button
                      type="button"
                      className="underline"
                      onClick={() => handleDeleteNote(n.id)}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Back navigation */}
      <Link to="/skills" className="underline inline-block">
        Back to Skills
      </Link>
    </div>
  );
}