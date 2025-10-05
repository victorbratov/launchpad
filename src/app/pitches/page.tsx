"use client";

import { useState,useEffect,useMemo } from "react";
import { Input } from "@/components/ui/input";
import { PitchCard } from "../../components/pitch_preview_card";
import { Checkbox } from "@/components/ui/checkbox";
import { mockPitches } from "../../../mock_data/pitches";
import { Pitches, Investment } from "../../../types/pitch";
import { getAllBusinessPitches, getTotalMoneyInvested } from "./_actions";
import { Card, CardHeader } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";


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


  //slider state
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100]);
  
  //button selection states
  const [selectedSort, setSelectedSort] = useState<'after' | 'before' >(`after`); // newest and oldest buttons
  const [FilterOn, setFilterOn] = useState<'on' | 'off' >(`off`);
  
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

  



  {/* bubble sort to sort pitches from newest to oldest */}

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

  {/* bubble sort to sort pitches from oldest to newest */}

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
              
              const investmentsIntoPitch = investments.find(inv => inv.busPitchID === CurrentPitch.BusPitchID)?.totalAmount
              const InvestmentGoal = Number(CurrentPitch.TargetInvAmount);

              const InvestedPercent = ((investmentsIntoPitch || 0) / (InvestmentGoal || 1)) * 100;


              // Show all pitches if no tags selected, otherwise check for any matching tags
              if(selectedTags.length === 0 || selectedTags.some(selectedTag => CurrentPitch.Tags?.includes(selectedTag))){

                //non tag filers applied here
                
                if((FilterOn === `on` && selectedSort === `after`)){
                  if(InvestedPercent >= priceRange[0] && CurrentPitch.InvestmentStart >= (selectedDate || '1970-01-01')) {
                    return (
                      <PitchCard key={CurrentPitch.BusPitchID}  //creates a card for each pitch 
                          pitch={{
                            pitchID: CurrentPitch.BusPitchID.toString(),
                            pitchName: CurrentPitch.ProductTitle + " " + InvestedPercent.toFixed(2) + '% Funded',
                            pitchStatus: CurrentPitch.statusOfPitch,
                            currentAmount: investments.find(inv => inv.busPitchID === CurrentPitch.BusPitchID)?.totalAmount || 0,
                            pitchGoal: Number(CurrentPitch.TargetInvAmount),
                            pitchImageUrl: "pitch.SuportingMedia" ,
                            tags: CurrentPitch.Tags || [], 
                            pitcherID: CurrentPitch.BusAccountID, 
                            pitchStart: CurrentPitch.InvestmentStart, 
                            pitchEnd: CurrentPitch.InvestmentEnd,     
                          }} />
                      );
                  }
                }
                else if((FilterOn === `on` && selectedSort === `before`)){
                  if(InvestedPercent >= priceRange[0] && CurrentPitch.InvestmentStart <= (selectedDate || '2100--01-01')) {
                    return (
                      <PitchCard key={CurrentPitch.BusPitchID}  //creates a card for each pitch 
                          pitch={{
                            pitchID: CurrentPitch.BusPitchID.toString(),
                            pitchName: CurrentPitch.ProductTitle + " " + InvestedPercent.toFixed(2) + '% Funded',
                            pitchStatus: CurrentPitch.statusOfPitch,
                            currentAmount: investments.find(inv => inv.busPitchID === CurrentPitch.BusPitchID)?.totalAmount || 0,
                            pitchGoal: Number(CurrentPitch.TargetInvAmount),
                            pitchImageUrl: "pitch.SuportingMedia" ,
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
                            pitchImageUrl: "pitch.SuportingMedia" ,
                            tags: CurrentPitch.Tags || [], 
                            pitcherID: CurrentPitch.BusAccountID, 
                            pitchStart: CurrentPitch.InvestmentStart, 
                            pitchEnd: CurrentPitch.InvestmentEnd,     
                          }} />
                      );
                }
              }
              else{
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

        

        {/* Filter by other means */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-8"> 
              <div> 
              <h2 className="font-semibold text-lg">Filters</h2>
              </div>
              <div>
                <Button 
                  style={{ backgroundColor: FilterOn === 'on' ? 'Green' : 'Black' }}
                  onClick={() => {
                    const newFilterState = FilterOn === 'off' ? 'on' : 'off';
                    setFilterOn(newFilterState);
                    if(newFilterState === 'on' && selectedSort === 'before') { 
                    }
                    if(newFilterState === 'on' && selectedSort === 'after') {  
                    }
                  }}
                  
                  >
                  <div className=" ">
                    Apply Filters
                  </div>
                </Button>
              </div>
            </div>
          </CardHeader>
          
          {/*slider controls */}
          <div className="p-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <Slider 
                  value={[priceRange[0]]} 
                  onValueChange={(value) => setPriceRange([value[0], priceRange[1]])}
                  max={100} 
                  step={1}
                  className="w-full"
                />
              </div>
              <div className="text-sm font-medium text-right">
                {priceRange[0]}% Invested
              </div>
            </div>
          </div>

        <div className ="flex items-center gap-3"> 
            {/* Date Filter */}
            <div className="space-y-2 ml-4 ">
              <h2 className="font-semibold text-sm ml-2">Investments Made</h2>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                placeholder="Enter date"
              />
            </div>

            {/* After and Before Buttons */}
            <div className="flex flex-col gap-2 mr-4"> 

              <Button 
                variant="outline" 
                className="w-full font-semibold text-lg" 
                style={{ backgroundColor: selectedSort === 'after' ? 'lightgreen' : 'gray' }}
                onClick={() => { setSelectedSort('after'); if (FilterOn === 'on') {  } }}
              >
                After
              </Button>

              <Button 
                variant="outline" 
                className="w-full font-semibold text-lg" 
                style={{ backgroundColor: selectedSort === 'before' ? 'lightgreen' : 'gray' }}
                onClick={() => { setSelectedSort('before'); if (FilterOn === 'on') { }  }}
              >
                Before
              </Button>


            </div>
          </div>
        </Card>




      </div>
    </div>
  );
}
