import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";

type HorseSearchProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function HorseSearch({ value, onChange }: HorseSearchProps) {
  const [input, setInput] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      onChange(input.trim());
    }, 350);

    return () => clearTimeout(timer);
  }, [input, onChange]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void setInput(value);
  }, [value]);

  const handleClear = () => {
    setInput("");
    onChange("");
  };

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-2.5 shadow-sm focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/50 transition-all">
      <Search className="h-4 w-4 text-muted-foreground shrink-0" />
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Search by horse name, breed, owner..."
        className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
      />
      {input && (
        <button
          type="button"
          onClick={handleClear}
          className="rounded-full p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground shrink-0"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
