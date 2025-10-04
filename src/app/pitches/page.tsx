"use client";

import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { PitchCard } from "../../components/pitch_preview_card";
import { Checkbox } from "@/components/ui/checkbox";
import { mockPitches } from "../../../mock_data/pitches";
import { Pitches, Investment } from "../../../types/pitch";
import { getAllBusinessPitches, getTotalMoneyInvested } from "./_actions";

//mock pitches data types, DELETE AFTER DATABASE INTEGRATION
const allTags = Array.from(new Set(mockPitches.flatMap((p) => p.tags)));

export default function PitchSearchPage() {

  // SEARCH BAR at the top right
  const [search, setSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // SIMPLE CONTROL: How many cards to show
  const [maxCards, setMaxCards] = useState<number>(6); // Start with showing only 6 cards

  //database data
  const [pitches, setPitches] = useState<Pitches[]>([]); // pitches is an array of data from the database
  const [investments, setInvestments] = useState<Investment[]>([]); // data from investment ledger

  //where _actions get is used
  //where the data is put into the arrays above 
  useEffect(() => {
    async function loadData() {
      const busPitchInfo = await getAllBusinessPitches();
      const BusPitchInvestments = await getTotalMoneyInvested();

      setPitches(busPitchInfo);
      setInvestments(BusPitchInvestments);
    }
    loadData();
  }, []);

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

  //calls the tiles grid for pitches
  return (
    <div className="flex gap-6 p-6">
      {/* Pitch Grid */}
      <div className="flex-1 space-y-4">
        {/* Simple Control Panel */}
        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{/*start of grid*/}
          {pitches.length ? (
            pitches.map((CurrentPitch) => { //loops through pitches in array

              // Show all pitches if no tags selected, otherwise check for any matching tags
              if (selectedTags.length === 0 || selectedTags.some(selectedTag => CurrentPitch.Tags?.includes(selectedTag))) {
                return (
                  <PitchCard key={CurrentPitch.BusPitchID}  //creates a card for each pitch 
                    pitch={{
                      pitchID: CurrentPitch.BusPitchID.toString(),
                      pitchName: CurrentPitch.ProductTitle,
                      pitchStatus: CurrentPitch.statusOfPitch,
                      currentAmount: investments.find(inv => inv.busPitchID === CurrentPitch.BusPitchID)?.totalAmount || 0,
                      pitchGoal: Number(CurrentPitch.TargetInvAmount),
                      pitchImageUrl: CurrentPitch.FeaturedImage ? CurrentPitch.FeaturedImage : "",
                      tags: CurrentPitch.Tags || [],
                      pitcherID: CurrentPitch.BusAccountID,
                      pitchStart: CurrentPitch.InvestmentStart,
                      pitchEnd: CurrentPitch.InvestmentEnd,
                    }} />
                );
              }
              else {
                return null;
              } // Skip rendering if tag doesn't match

            })
          ) : (
            <p className="text-center text-muted-foreground">
              No results found.
            </p>
          )}


        </div> {/*end of grid*/}
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
