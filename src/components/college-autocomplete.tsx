import { Check, ChevronDown, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import { collegeRecords } from "@/data/colleges";

type CollegeAutocompleteProps = {
  id: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
};

export function CollegeAutocomplete({ id, value, placeholder = "Search your college", onChange }: CollegeAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const normalized = value.trim().toLowerCase();
  const results = useMemo(() => {
    if (!normalized) return collegeRecords.slice(0, 8);
    const words = normalized.split(/\s+/).filter(Boolean);
    return collegeRecords
      .filter((college) => {
        const haystack = `${college.name} ${college.city} ${college.state}`.toLowerCase();
        return words.every((word) => haystack.includes(word));
      })
      .slice(0, 8);
  }, [normalized]);

  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-4 top-1/2 z-10 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
      <Input
        id={id}
        value={value}
        autoComplete="off"
        placeholder={placeholder}
        className="pl-10 pr-10"
        onFocus={() => setOpen(true)}
        onChange={(event) => { onChange(event.target.value); setOpen(true); }}
        onKeyDown={(event) => { if (event.key === "Escape") setOpen(false); }}
        onBlur={() => window.setTimeout(() => setOpen(false), 150)}
      />
      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
      {open && results.length > 0 ? (
        <div className="absolute z-30 mt-2 max-h-72 w-full overflow-y-auto rounded-2xl border border-glass-border bg-background p-1.5 shadow-xl">
          {results.map((college) => (
            <button
              type="button"
              key={`${college.name}-${college.city}`}
              className="flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-primary/10"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => { onChange(college.name); setOpen(false); }}
            >
              <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"><Check className="size-3.5" /></span>
              <span className="min-w-0"><span className="block truncate text-sm font-medium">{college.name}</span><span className="block truncate text-xs text-muted-foreground">{college.city}, {college.state}</span></span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
