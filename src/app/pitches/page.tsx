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
import { Card, CardHeader } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";


//mock pitches data types, DELETE AFTER DATABASE INTEGRATION
const allTags = Array.from(new Set(mockPitches.flatMap((p) => p.tags)));

export default function PitchSearchPage() {
  // SEARCH BAR at the top right
  const [search, setSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  // Mobile filter sidebar state
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);

  // SIMPLE CONTROL: How many cards to show
  const [maxCards, setMaxCards] = useState<number>(6); // Start with showing only 6 cards

  //database data
  const [pitches, setPitches] = useState<Pitches[]>([]); // pitches is an array of data from the database
  const [investments, setInvestments] = useState<Investment[]>([]); // data from investment ledger

  //slider state
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100]);
  
  //button selection states
  const [selectedSort, setSelectedSort] = useState<'after' | 'before'>('after'); // newest and oldest buttons
  const [FilterOn, setFilterOn] = useState<'on' | 'off'>('off');
  
  //date filter state
  const [selectedDate, setSelectedDate] = useState<string>("");

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

  // bubble sort to sort pitches from newest to oldest
  const sortPitchesNewest = () => {
    const sortedPitches = [...pitches]; // copy of pitches as not to modify original before sortted
    
    for (let x = 0; x < sortedPitches.length; x++) {
      for (let y = 0; y < sortedPitches.length - x - 1; y++) {
        const dA = new Date(sortedPitches[y].InvestmentStart);
        const B = new Date(sortedPitches[y + 1].InvestmentStart);

        if (dA < B) {
          [sortedPitches[y], sortedPitches[y + 1]] = [sortedPitches[y + 1], sortedPitches[y]];
        }
      }
    }
    
    setPitches(sortedPitches); // Update state with sorted array
  }

  // bubble sort to sort pitches from oldest to newest
  const sortPitchesOldest = () => {
    const sortedPitches = [...pitches]; // copy of pitches as not to modify original before sortted
    
    // Bubble sort by InvestmentStart date (oldest first)
    for (let x = 0; x < sortedPitches.length; x++) {
      for (let y = 0; y < sortedPitches.length - x - 1; y++) {
        const dateA = new Date(sortedPitches[y].InvestmentStart);
        const dateB = new Date(sortedPitches[y + 1].InvestmentStart);

        // If current date is newer than next date, swap them (oldest first)
        if (dateA > dateB) {
          [sortedPitches[y], sortedPitches[y + 1]] = [sortedPitches[y + 1], sortedPitches[y]];
        }
      }
    }
    
    setPitches(sortedPitches); // Update state with sorted array
  }

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
        <div className="max-h-48 overflow-y-auto space-y-2 border rounded-md p-2">
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

      {/* Selected Tags Display */}
      {selectedTags.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-medium text-sm">Selected Tags ({selectedTags.length})</h3>
          <div className="flex flex-wrap gap-2">
            {selectedTags.map((tag) => (
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

      {/* Advanced Filters Card */}
      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-center justify-between"> 
            <h2 className="font-semibold text-lg">Advanced Filters</h2>
            <Button 
              size="sm"
              style={{ backgroundColor: FilterOn === 'on' ? 'Green' : 'Black', color: 'white' }}
              onClick={() => {
                const newFilterState = FilterOn === 'off' ? 'on' : 'off';
                setFilterOn(newFilterState);
                if(newFilterState === 'on' && selectedSort === 'before') { 
                }
                if(newFilterState === 'on' && selectedSort === 'after') {  
                }
              }}
            >
              Apply Filters
            </Button>
          </div>
        </CardHeader>
        
        {/* slider controls */}
        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Investment Progress</label>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <Slider 
                  value={[priceRange[0]]} 
                  onValueChange={(value: number[]) => setPriceRange([value[0], priceRange[1]])}
                  max={100} 
                  step={1}
                  className="w-full"
                />
              </div>
              <div className="text-sm font-medium text-right min-w-[80px]">
                {priceRange[0]}% Invested
              </div>
            </div>
          </div>

          {/* Date Filter and Before/After Buttons */}
          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Investment Date Filter</label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                placeholder="Enter date"
                className="w-full"
              />
            </div>

            {/* After and Before Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                size="sm"
                className="font-semibold" 
                style={{ backgroundColor: selectedSort === 'after' ? 'lightgreen' : 'gray' }}
                onClick={() => { setSelectedSort('after'); if (FilterOn === 'on') {  } }}
              >
                After
              </Button>

              <Button 
                variant="outline" 
                size="sm"
                className="font-semibold" 
                style={{ backgroundColor: selectedSort === 'before' ? 'lightgreen' : 'gray' }}
                onClick={() => { setSelectedSort('before'); if (FilterOn === 'on') { }  }}
              >
                Before
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Clear All Filters */}
      {(search || selectedTags.length > 0 || FilterOn === 'on' || selectedDate) && (
        <Button 
          variant="outline" 
          onClick={() => {
            setSearch("");
            setSelectedTags([]);
            setFilterOn('off');
            setSelectedDate("");
            setPriceRange([0, 100]);
            setSelectedSort('after');
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
            {(search || selectedTags.length > 0 || FilterOn === 'on' || selectedDate) && (
              <span className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
                {selectedTags.length + (search ? 1 : 0) + (FilterOn === 'on' ? 1 : 0) + (selectedDate ? 1 : 0)}
              </span>
            )}
          </Button>
        </div>
      </div>

      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-80 bg-white border-r min-h-screen sticky top-16">
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
                const investmentsIntoPitch = investments.find(inv => inv.busPitchID === CurrentPitch.BusPitchID)?.totalAmount;
                const InvestmentGoal = Number(CurrentPitch.TargetInvAmount);
                const InvestedPercent = ((investmentsIntoPitch || 0) / (InvestmentGoal || 1)) * 100;

                // Show all pitches if no tags selected, otherwise check for any matching tags
                if (selectedTags.length === 0 || selectedTags.some(selectedTag => CurrentPitch.Tags?.includes(selectedTag))) {

                  //non tag filers applied here
                  
                  if((FilterOn === 'on' && selectedSort === 'after')){
                    if(InvestedPercent >= priceRange[0] && CurrentPitch.InvestmentStart >= (selectedDate || '1970-01-01')) {
                      return (
                        <PitchCard key={CurrentPitch.BusPitchID}  //creates a card for each pitch 
                            pitch={{
                              pitchID: CurrentPitch.BusPitchID.toString(),
                              pitchName: CurrentPitch.ProductTitle + " " + InvestedPercent.toFixed(2) + '% Funded',
                              pitchStatus: CurrentPitch.statusOfPitch,
                              currentAmount: investments.find(inv => inv.busPitchID === CurrentPitch.BusPitchID)?.totalAmount || 0,
                              pitchGoal: Number(CurrentPitch.TargetInvAmount),
                              pitchImageUrl: CurrentPitch.FeaturedImage ? CurrentPitch.FeaturedImage : null,
                              tags: CurrentPitch.Tags || [], 
                              pitcherID: CurrentPitch.BusAccountID, 
                              pitchStart: CurrentPitch.InvestmentStart, 
                              pitchEnd: CurrentPitch.InvestmentEnd,     
                            }} />
                        );
                    }
                  }
                  else if((FilterOn === 'on' && selectedSort === 'before')){
                    if(InvestedPercent >= priceRange[0] && CurrentPitch.InvestmentStart <= (selectedDate || '2100-01-01')) {
                      return (
                        <PitchCard key={CurrentPitch.BusPitchID}  //creates a card for each pitch 
                            pitch={{
                              pitchID: CurrentPitch.BusPitchID.toString(),
                              pitchName: CurrentPitch.ProductTitle + " " + InvestedPercent.toFixed(2) + '% Funded',
                              pitchStatus: CurrentPitch.statusOfPitch,
                              currentAmount: investments.find(inv => inv.busPitchID === CurrentPitch.BusPitchID)?.totalAmount || 0,
                              pitchGoal: Number(CurrentPitch.TargetInvAmount),
                              pitchImageUrl: CurrentPitch.FeaturedImage ? CurrentPitch.FeaturedImage : null ,
                              tags: CurrentPitch.Tags || [], 
                              pitcherID: CurrentPitch.BusAccountID, 
                              pitchStart: CurrentPitch.InvestmentStart, 
                              pitchEnd: CurrentPitch.InvestmentEnd,     
                            }} />
                        );
                    }
                  } 
                  else{
                    return (
                      <PitchCard key={CurrentPitch.BusPitchID}  //creates a card for each pitch 
                        pitch={{
                          pitchID: CurrentPitch.BusPitchID.toString(),
                          pitchName: CurrentPitch.ProductTitle + " " + InvestedPercent.toFixed(2) + '% Funded',
                          pitchStatus: CurrentPitch.statusOfPitch,
                          currentAmount: investments.find(inv => inv.busPitchID === CurrentPitch.BusPitchID)?.totalAmount || 0,
                          pitchGoal: Number(CurrentPitch.TargetInvAmount),
                          pitchImageUrl: CurrentPitch.FeaturedImage ? CurrentPitch.FeaturedImage : null,
                          tags: CurrentPitch.Tags || [],
                          pitcherID: CurrentPitch.BusAccountID,
                          pitchStart: CurrentPitch.InvestmentStart,
                          pitchEnd: CurrentPitch.InvestmentEnd,
                        }} />
                    );
                  }
                }
                else {
                  return null;
                } // Skip rendering if tag doesn't match
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
