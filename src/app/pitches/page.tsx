"use client";

import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { PitchCard } from "../../components/pitch_preview_card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { mockPitches } from "../../../mock_data/pitches";
import { Pitches, Investment } from "../../../types/pitch";
import { getAllBusinessPitches, getTotalMoneyInvested } from "./_actions";
import { Filter, X } from "lucide-react";

//mock pitches data types, DELETE AFTER DATABASE INTEGRATION
const allTags = Array.from(new Set(mockPitches.flatMap((p) => p.tags)));

export default function PitchSearchPage() {
  // SEARCH BAR at the top right
  const [search, setSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  // Mobile filter sidebar state
  const [isFilterOpen, setIsFilterOpen] = useState(false);

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

  // Filter sidebar content component
  const FilterSidebar = () => (
    <div className="space-y-6">
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
              className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 p-2 rounded-md transition-colors"
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

      {/* Clear Filters */}
      {(search || selectedTags.length > 0) && (
        <Button 
          variant="outline" 
          onClick={() => {
            setSearch("");
            setSelectedTags([]);
          }}
          className="w-full"
        >
          Clear All Filters
        </Button>
      )}
    </div>
  );

  //calls the tiles grid for pitches
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header with Filter Toggle */}
      <div className="lg:hidden bg-white border-b px-4 py-3 sticky top-16 z-40">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Discover Pitches</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center gap-2"
          >
            <Filter size={16} />
            Filters
            {(search || selectedTags.length > 0) && (
              <span className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
                {selectedTags.length + (search ? 1 : 0)}
              </span>
            )}
          </Button>
        </div>
      </div>

      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-72 bg-white border-r min-h-screen sticky top-16">
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Discover Pitches</h1>
            <FilterSidebar />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 sm:p-6">
          {/* Results Info */}
          <div className="mb-6">
            <p className="text-sm text-muted-foreground">
              {pitches.length > 0 
                ? `Showing ${Math.min(pitches.length, maxCards)} of ${pitches.length} pitches`
                : "Loading pitches..."
              }
            </p>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6">
            {pitches.length ? (  
              pitches.map((CurrentPitch) => {
                // Show all pitches if no tags selected, otherwise check for any matching tags
                if(selectedTags.length === 0 || selectedTags.some(selectedTag => CurrentPitch.Tags?.includes(selectedTag))){
                  return (
                    <PitchCard 
                      key={CurrentPitch.BusPitchID}
                      pitch={{
                        pitchID: CurrentPitch.BusPitchID.toString(),
                        pitchName: CurrentPitch.ProductTitle,
                        pitchStatus: CurrentPitch.statusOfPitch,
                        currentAmount: investments.find(inv => inv.busPitchID === CurrentPitch.BusPitchID)?.totalAmount || 0,
                        pitchGoal: Number(CurrentPitch.TargetInvAmount),
                        pitchImageUrl: "pitch.SuportingMedia" ,
                        tags: CurrentPitch.Tags || [], 
                        pitcherID: CurrentPitch.BusAccountID, 
                        pitchStart: CurrentPitch.InvestmentStart, 
                        pitchEnd: CurrentPitch.InvestmentEnd,     
                      }} 
                    />
                  );
                } else {
                  return null;
                }
              })
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground text-lg">
                  No pitches found matching your criteria.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Modal */}
      {isFilterOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-50 lg:hidden"
            onClick={() => setIsFilterOpen(false)}
          />
          
          {/* Modal */}
          <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-white z-50 lg:hidden transform transition-transform duration-300">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Filters</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsFilterOpen(false)}
              >
                <X size={20} />
              </Button>
            </div>
            
            <div className="p-4 overflow-y-auto max-h-[calc(100vh-80px)]">
              <FilterSidebar />
            </div>

            {/* Apply Button */}
            <div className="p-4 border-t bg-white">
              <Button 
                onClick={() => setIsFilterOpen(false)}
                className="w-full"
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
