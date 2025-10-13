"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getPitches } from "./_actions";
import { X, Filter, Search, Settings, ChevronDown, ChevronUp, Calendar } from "lucide-react";
import { PitchCard } from "../../components/pitch_preview_card";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { BusinessPitch } from "@/db/types";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Filters {
  search: string;
  tags: string[];
  dateRange: string;
  customStartDate: string;
  customEndDate: string;
  priceRange: [number, number];
}

/**
 * This component represents the main pitch search page where users can discover and filter business pitches.
 * */
export default function PitchSearchPage() {
  const [pitches, setPitches] = useState<BusinessPitch[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    search: "",
    tags: [] as string[],
    dateRange: "all",
    customStartDate: "",
    customEndDate: "",
    priceRange: [0, 100] as [number, number],
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
      dateRange: "all",
      customStartDate: "",
      customEndDate: "",
      priceRange: [0, 100],
    });

  const getDateFilterRange = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (filters.dateRange) {
      case "last-30":
        return {
          start: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000),
          end: today
        };
      case "last-90":
        return {
          start: new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000),
          end: today
        };
      case "this-year":
        return {
          start: new Date(now.getFullYear(), 0, 1),
          end: today
        };
      case "custom":
        return {
          start: filters.customStartDate ? new Date(filters.customStartDate) : null,
          end: filters.customEndDate ? new Date(filters.customEndDate) : null
        };
      default:
        return { start: null, end: null };
    }
  };

  const filteredPitches = pitches.filter((p) => {
    const matchesSearch = filters.search
      ? p.product_title.toLowerCase().includes(filters.search.toLowerCase()) ||
      p.elevator_pitch?.toLowerCase().includes(filters.search.toLowerCase())
      : true;

    const matchesTags =
      filters.tags.length === 0 ||
      filters.tags.some((t) => p.tags?.includes(t));

    const fundingProgress = (p.raised_amount / p.target_investment_amount) * 100;
    const matchesProgress = fundingProgress >= filters.priceRange[0] && fundingProgress <= filters.priceRange[1];

    // Date filtering
    const pitchDate = new Date(p.end_date);
    const dateRange = getDateFilterRange();
    const matchesDate = !dateRange.start || !dateRange.end ||
      (pitchDate >= dateRange.start && pitchDate <= dateRange.end);

    return matchesSearch && matchesTags && matchesProgress && matchesDate;
  }).sort((a, b) => {
    // Sort by advertisement budget (highest first)
    return (b.adverts_available || 0) - (a.adverts_available || 0);
  });

  const activeFilterCount =
    (filters.search ? 1 : 0) +
    filters.tags.length +
    (filters.dateRange !== "all" ? 1 : 0) +
    (filters.priceRange[0] > 0 || filters.priceRange[1] < 100 ? 1 : 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      <div className="lg:hidden bg-white/90 backdrop-blur-lg border-b border-slate-200/50 px-4 py-4 sticky top-16 z-40 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Discover Pitches</h1>
            <p className="text-sm text-slate-600">{filteredPitches.length} opportunities found</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center gap-2 bg-white/80 hover:bg-white border-slate-200 shadow-sm"
          >
            <Filter size={16} />
            Filters
            {activeFilterCount > 0 && (
              <Badge className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full ml-1">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      <div className="flex">
        <aside className="hidden lg:block w-80 bg-white/90 backdrop-blur-lg border-r border-slate-200/50 shadow-sm">
          <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="p-6">
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900 mb-2">
                  Discover Pitches
                </h1>
                <p className="text-slate-600 text-sm">
                  {filteredPitches.length} of {pitches.length} opportunities
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Sorted by advertisement priority
                </p>
              </div>

              <FilterSidebar
                filters={filters}
                setFilters={setFilters}
                toggleTag={toggleTag}
                resetFilters={resetFilters}
              />
            </div>
          </div>
        </aside>

        <main className="flex-1 p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">

            {filteredPitches.length > 0 ? (
              <div
                className="columns-1 sm:columns-2 lg:columns-1 xl:columns-2 2xl:columns-3 gap-6 space-y-6"
                style={{
                  columnFill: 'balance'
                }}
              >
                {filteredPitches.map((pitch) => (
                  <div
                    key={pitch.instance_id}
                    className="break-inside-avoid mb-6"
                    style={{ display: 'inline-block', width: '100%' }}
                  >
                    <PitchCard pitch={pitch} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-6 h-6 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  No pitches found
                </h3>
                <p className="text-slate-600 mb-4">
                  Try adjusting your filters or search terms
                </p>
                <Button onClick={resetFilters} variant="outline">
                  Clear all filters
                </Button>
              </div>
            )}
          </div>
        </main>
      </div>

      {isFilterOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
            onClick={() => setIsFilterOpen(false)}
          />

          <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-white z-50 lg:hidden transform transition-transform duration-300 shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
              <h2 className="text-lg font-semibold text-slate-900">Filter Options</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsFilterOpen(false)}
                className="text-slate-500 hover:text-slate-700"
              >
                <X size={20} />
              </Button>
            </div>

            <div className="p-4 overflow-y-auto max-h-[calc(100vh-140px)]">
              <FilterSidebar
                filters={filters}
                setFilters={setFilters}
                toggleTag={toggleTag}
                resetFilters={resetFilters}
              />
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={resetFilters}
                  className="flex-1"
                >
                  Clear
                </Button>
                <Button
                  onClick={() => setIsFilterOpen(false)}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  Show {filteredPitches.length} Results
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * This component renders the sidebar containing various filter options for pitches.
 * */
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
  const [advancedOpen, setAdvancedOpen] = useState(true);

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="relative">
          <Input
            placeholder="Search pitches and descriptions..."
            value={filters.search}
            onChange={(e) =>
              setFilters((f) => ({ ...f, search: e.target.value }))
            }
            className="pl-10 border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="font-semibold text-slate-900 flex items-center gap-2">
          Categories
        </h2>
        <div className="space-y-2 max-h-48 overflow-y-auto bg-slate-50 rounded-lg p-3 border border-slate-200">
          {["Tech", "Health", "AI", "Finance", "E-commerce", "SaaS", "Hardware", "Mobile"].map((tag) => (
            <label
              key={tag}
              className="flex items-center gap-3 text-sm cursor-pointer hover:bg-white p-2 rounded-md transition-all duration-200 group"
            >
              <Checkbox
                checked={filters.tags.includes(tag)}
                onCheckedChange={() => toggleTag(tag)}
                className="border-slate-400 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
              />
              <span className="group-hover:text-blue-600 transition-colors">{tag}</span>
            </label>
          ))}
        </div>
      </div>

      {filters.tags.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-medium text-sm text-slate-700">
            Selected ({filters.tags.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {filters.tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 hover:bg-red-100 hover:text-red-700 cursor-pointer transition-colors duration-200"
                onClick={() => toggleTag(tag)}
              >
                {tag}
                <X size={12} />
              </Badge>
            ))}
          </div>
        </div>
      )}

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-3">
          <button
            onClick={() => setAdvancedOpen(!advancedOpen)}
            className="flex items-center justify-between w-full text-left group"
          >
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-slate-500 group-hover:text-purple-600 transition-colors" />
              <h2 className="font-semibold text-slate-900 group-hover:text-purple-600 transition-colors">
                Advanced Filters
              </h2>
            </div>
            {advancedOpen ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>
        </CardHeader>

        {advancedOpen && (
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-900 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                Funding Progress Range
              </label>
              <div className="px-3">
                <Slider
                  value={filters.priceRange}
                  onValueChange={(value) =>
                    setFilters((f) => ({ ...f, priceRange: value as [number, number] }))
                  }
                  max={100}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>{filters.priceRange[0]}%</span>
                  <span className="font-medium text-blue-600">
                    {filters.priceRange[0]}% - {filters.priceRange[1]}%
                  </span>
                  <span>{filters.priceRange[1]}%</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-500" />
                End Date Range
              </label>

              <Select
                value={filters.dateRange}
                onValueChange={(value: any) => setFilters(f => ({ ...f, dateRange: value }))}
              >
                <SelectTrigger className="border-slate-300 focus:border-purple-500 focus:ring-purple-500/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="last-30">Last 30 Days</SelectItem>
                  <SelectItem value="last-90">Last 3 Months</SelectItem>
                  <SelectItem value="this-year">This Year</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>

              {filters.dateRange === "custom" && (
                <div className="grid grid-cols-1 gap-2 mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div>
                    <label className="text-xs font-medium text-slate-600 mb-1 block">From Date</label>
                    <Input
                      type="date"
                      value={filters.customStartDate}
                      onChange={(e) =>
                        setFilters((f) => ({ ...f, customStartDate: e.target.value }))
                      }
                      className="text-sm border-slate-300 focus:border-purple-500 focus:ring-purple-500/20"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 mb-1 block">To Date</label>
                    <Input
                      type="date"
                      value={filters.customEndDate}
                      onChange={(e) =>
                        setFilters((f) => ({ ...f, customEndDate: e.target.value }))
                      }
                      className="text-sm border-slate-300 focus:border-purple-500 focus:ring-purple-500/20"
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>

      <Button
        variant="outline"
        onClick={resetFilters}
        className="w-full border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400"
      >
        <X className="w-4 h-4 mr-2" />
        Clear All Filters
      </Button>
    </div>
  );
}
