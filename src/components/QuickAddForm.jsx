import { useState } from "react";
import { Plus } from "lucide-react";

export default function QuickAddForm({ onAdd }) {
  const [title, setTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed || submitting) return;

    setSubmitting(true);
    try {
      await onAdd({
        // Negative, timestamp-based id — guaranteed not to collide with a real TMDB id,
        // since this entry didn't come from a TMDB lookup.
        id: -Date.now(),
        title: trimmed,
        poster_path: "",
      });
      setTitle("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="quick-add" onSubmit={handleSubmit}>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Add a movie by title\u2026"
      />
      <button type="submit" disabled={submitting || !title.trim()}>
        <Plus size={14} /> {submitting ? "Adding\u2026" : "Add"}
      </button>
    </form>
  );
}
