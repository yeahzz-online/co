import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORIES } from "@/lib/copex";
import type { ActivityFilters } from "@/lib/data";

export type FilterState = Required<Pick<ActivityFilters, "search" | "category" | "window" | "price">>;

export const DEFAULT_FILTERS: FilterState = {
  search: "",
  category: "all",
  window: "all",
  price: "all",
};

export function ActivityFilterBar({
  value,
  onChange,
  searchPlaceholder = "Search by title, organizer or venue",
}: {
  value: FilterState;
  onChange: (next: FilterState) => void;
  searchPlaceholder?: string;
}) {
  return (
    <div className="glass-panel grid gap-3 rounded-3xl p-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_auto_auto_auto]">
      <div className="relative min-w-0">
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          value={value.search}
          onChange={(e) => onChange({ ...value, search: e.target.value })}
          placeholder={searchPlaceholder}
          aria-label="Search"
          className="h-11 rounded-2xl pl-10"
        />
      </div>

      <Select
        value={value.category}
        onValueChange={(category) => onChange({ ...value, category })}
      >
        <SelectTrigger className="h-11 rounded-2xl" aria-label="Category">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All categories</SelectItem>
          {CATEGORIES.map((c) => (
            <SelectItem key={c.value} value={c.value}>
              {c.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={value.window}
        onValueChange={(w) => onChange({ ...value, window: w as FilterState["window"] })}
      >
        <SelectTrigger className="h-11 rounded-2xl" aria-label="Date range">
          <SelectValue placeholder="When" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Any date</SelectItem>
          <SelectItem value="today">Today</SelectItem>
          <SelectItem value="week">Next 7 days</SelectItem>
          <SelectItem value="month">Next 30 days</SelectItem>
          <SelectItem value="upcoming">Upcoming only</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={value.price}
        onValueChange={(p) => onChange({ ...value, price: p as FilterState["price"] })}
      >
        <SelectTrigger className="h-11 rounded-2xl" aria-label="Price">
          <SelectValue placeholder="Price" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Free & paid</SelectItem>
          <SelectItem value="free">Free only</SelectItem>
          <SelectItem value="paid">Paid only</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
