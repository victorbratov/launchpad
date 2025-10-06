"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getPitches, PitchWithStats } from "./_actions";
import { X } from "lucide-react";
import { PitchCard } from "../../components/pitch_preview_card";
import { Card, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";

interface Filters {
  search: string;
  tags: string[];
  date: string;
  sortDirection: "before" | "after";
  priceRange: [number, number];
  enabled: boolean;
}

export default function PitchSearchPage() {
  const [pitches, setPitches] = useState<PitchWithStats[]>([]);
  const [filters, setFilters] = useState<Filters>({
    search: "",
    tags: [] as string[],
    date: "",
    sortDirection: "after",
    priceRange: [0, 100] as [number, number],
    enabled: false,
  });

  useEffect(() => {
    async function loadPitches() {
      const data = await getPitches();
      setPitches(data);
    }
    loadPitches();
  }, []);

  const toggleTag = (tag: string) =>
    setFilters((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));

  const resetFilters = () =>
    setFilters({
      search: "",
      tags: [],
      date: "",
      sortDirection: "after",
      priceRange: [0, 100],
      enabled: false,
    });


  const filteredPitches = pitches.filter((p) => {
    const matchesSearch = filters.search
      ? p.product_title.toLowerCase().includes(filters.search.toLowerCase())
      : true;

    const matchesTags =
      filters.tags.length === 0 ||
      filters.tags.some((t) => p.tags?.includes(t));

    if (!matchesSearch || !matchesTags) return false;

    if (filters.enabled) {
      if (p.invested_percent < filters.priceRange[0]) return false;

      const startDate = new Date(p.start_date);
      if (filters.date) {
        const filterDate = new Date(filters.date);
        if (
          (filters.sortDirection === "after" && startDate < filterDate) ||
          (filters.sortDirection === "before" && startDate > filterDate)
        ) {
          return false;
        }
      }
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Left */}
      <aside className="hidden lg:block w-80 bg-white border-r min-h-screen sticky top-16">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6">Discover Pitches</h1>
          <FilterSidebar
            filters={filters}
            setFilters={setFilters}
            toggleTag={toggleTag}
            resetFilters={resetFilters}
          />
        </div>
      </aside>

      <main className="flex-1 p-6">
        {filteredPitches.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
            {filteredPitches.map((pitch) => (
              <PitchCard
                key={pitch.instance_id}
                pitch={pitch}
              />
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground">No pitches match your filters.</div>
        )}
      </main>
    </div>
  );
}

function FilterSidebar({
  filters,
  setFilters,
  toggleTag,
  resetFilters,
}: {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  toggleTag: (t: string) => void;
  resetFilters: () => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-semibold text-lg">Search by Name</h2>
        <Input
          placeholder="Enter pitch name..."
          value={filters.search}
          onChange={(e) =>
            setFilters((f) => ({ ...f, search: e.target.value }))
          }
        />
      </div>

      <div>
        <h2 className="font-semibold text-lg">Filter by Tags</h2>
        <div className="max-h-48 overflow-y-auto border rounded-md p-2 space-y-2">
          {["Tech", "Health", "AI", "Finance"].map((tag) => (
            <label
              key={tag}
              className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 p-2 rounded-md transition-colors"
            >
              <Checkbox
                checked={filters.tags.includes(tag)}
                onCheckedChange={() => toggleTag(tag)}
              />
              {tag}
            </label>
          ))}
        </div>
      </div>

      {filters.tags.length > 0 && (
        <div>
          <h3 className="font-medium text-sm">
            Selected Tags ({filters.tags.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {filters.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-sm cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors"
                onClick={() => toggleTag(tag)}
              >
                {tag}
                <X size={12} />
              </span>
            ))}
          </div>
        </div>
      )}

      <Card className="mt-4">
        <CardHeader>
          <div className="flex justify-between items-center">
            <h2 className="font-semibold text-lg">Advanced Filters</h2>
            <Button
              size="sm"
              className={filters.enabled ? "bg-green-600 text-white" : ""}
              onClick={() =>
                setFilters((f) => ({ ...f, enabled: !f.enabled }))
              }
            >
              {filters.enabled ? "On" : "Off"}
            </Button>
          </div>
        </CardHeader>
        <div className="p-4 space-y-4">
          <div>
            <label className="text-sm font-medium">Investment Progress</label>
            <Slider
              value={[filters.priceRange[0]]}
              onValueChange={(v) =>
                setFilters((f) => ({ ...f, priceRange: [v[0], f.priceRange[1]] }))
              }
              max={100}
              step={1}
            />
            <div className="text-sm">{filters.priceRange[0]}% Invested</div>
          </div>

          <div>
            <label className="text-sm font-medium">Date Filter</label>
            <Input
              type="date"
              value={filters.date}
              onChange={(e) =>
                setFilters((f) => ({ ...f, date: e.target.value }))
              }
            />

            <div className="grid grid-cols-2 gap-2 mt-2">
              {(["after", "before"] as const).map((d) => (
                <Button
                  key={d}
                  variant="outline"
                  size="sm"
                  className={`font-semibold ${filters.sortDirection === d
                    ? "bg-green-200"
                    : "bg-gray-200"
                    }`}
                  onClick={() =>
                    setFilters((f) => ({ ...f, sortDirection: d }))
                  }
                >
                  {d === "after" ? "After" : "Before"}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <Button variant="outline" onClick={resetFilters} className="w-full">
        Clear All Filters
      </Button>
    </div>
  );
}
