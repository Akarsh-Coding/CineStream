import { Film } from "lucide-react";

export default function PosterFallback({ title }) {
  return (
    <div className="poster poster--fallback">
      <Film size={28} strokeWidth={1.5} />
      <span>{title || "No image"}</span>
    </div>
  );
}
