"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { PitchCard } from "../../components/pitch_preview_card";
import { Checkbox } from "@/components/ui/checkbox";
import { mockPitches } from "../../../mock_data/pitches";

const allTags = Array.from(new Set(mockPitches.flatMap((p) => p.tags)));

export default function PitchSearchPage() {
  const [search, setSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Filter pitches by name + tags
  const filteredPitches = useMemo(() => {
    return mockPitches.filter((pitch) => {
      const matchesSearch = pitch.pitchName
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesTags =
        selectedTags.length === 0 ||
        selectedTags.some((tag) => pitch.tags.includes(tag));
      return matchesSearch && matchesTags;
    });
  }, [search, selectedTags]);

  // Toggle tag checkbox
  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div className="flex gap-6 p-6">
      {/* Pitch Grid */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPitches.length ? (
          filteredPitches.map((pitch) => (
            <PitchCard key={pitch.pitchID} pitch={pitch} />
          ))
        ) : (
          <p className="text-center text-muted-foreground">
            No results found.
          </p>
        )}
      </div>

      {/* Sidebar Filters */}
      <div className="w-72 space-y-6">
        {/* Search Pitch by Name */}
        <div className="space-y-2">
          <h2 className="font-semibold text-lg">Search by Name</h2>
          <Input
            placeholder="Enter pitch name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Tag Filters */}
        <div className="space-y-2">
          <h2 className="font-semibold text-lg">Filter by Tags</h2>
          <div className="flex flex-col gap-2">
            {allTags.map((tag) => (
              <label
                key={tag}
                className="flex items-center gap-2 text-sm cursor-pointer"
              >
                <Checkbox
                  checked={selectedTags.includes(tag)}
                  onCheckedChange={() => toggleTag(tag)}
                />
                {tag}
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
