import { useRef, useState } from "react";
import { Plus, Image as ImageIcon, X } from "lucide-react";

export default function QuickAddForm({ onAdd }) {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const clearFile = () => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed || submitting) return;

    setSubmitting(true);
    try {
      await onAdd(
        {
          // Negative, timestamp-based id — guaranteed not to collide with a real TMDB id,
          // since this entry didn't come from a TMDB lookup.
          id: -Date.now(),
          title: trimmed,
          poster_path: "",
        },
        file || undefined
      );
      setTitle(""); // only clear on success — keep the typed title if the request failed
      clearFile();
    } catch (err) {
      // already surfaced via the shared actionError banner
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="quick-add" onSubmit={handleSubmit}>
      <div className="quick-add__row">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a movie by title\u2026"
        />
        <label className="quick-add__file" title="Attach a thumbnail (optional)">
          <ImageIcon size={15} />
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} hidden />
        </label>
        <button type="submit" disabled={submitting || !title.trim()}>
          <Plus size={14} /> {submitting ? "Adding\u2026" : "Add"}
        </button>
      </div>

      {preview && (
        <div className="quick-add__preview">
          <img src={preview} alt="Selected thumbnail preview" />
          <button type="button" onClick={clearFile} aria-label="Remove image">
            <X size={13} />
          </button>
        </div>
      )}
    </form>
  );
}
