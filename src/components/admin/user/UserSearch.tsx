import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";

type UserSearchProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function UserSearch({ value, onChange }: UserSearchProps) {
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
    <div className="">
      <div className="flex items-center gap-3 rounded-xl border bg-white px-4 py-3 shadow-sm focus-within:border-primary/50">
        <Search className="h-4 w-4 text-slate-400" />

        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Search by user name"
          className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
        />

        {input && (
          <button
            type="button"
            onClick={handleClear}
            className="rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
