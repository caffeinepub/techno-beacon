import React from 'react';
import { Search, MapPin, Calendar, X } from 'lucide-react';
import { Input } from '@/components/ui/input';

export interface FilterState {
  artistName: string;
  city: string;
  dateFrom: string;
  dateTo: string;
}

interface EventFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
}

export default function EventFilters({ filters, onChange }: EventFiltersProps) {
  const hasActiveFilters = filters.artistName || filters.city || filters.dateFrom || filters.dateTo;

  const clearFilters = () => {
    onChange({ artistName: '', city: '', dateFrom: '', dateTo: '' });
  };

  return (
    <div className="bg-card border border-border rounded-sm p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Artist filter */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            placeholder="Artist name..."
            value={filters.artistName}
            onChange={(e) => onChange({ ...filters, artistName: e.target.value })}
            className="pl-9 bg-background border-border text-foreground placeholder:text-muted-foreground text-sm h-9 rounded-sm focus-visible:ring-neon-amber focus-visible:border-neon-amber/60"
          />
        </div>

        {/* City filter */}
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            placeholder="City..."
            value={filters.city}
            onChange={(e) => onChange({ ...filters, city: e.target.value })}
            className="pl-9 bg-background border-border text-foreground placeholder:text-muted-foreground text-sm h-9 rounded-sm focus-visible:ring-neon-amber focus-visible:border-neon-amber/60"
          />
        </div>

        {/* Date from */}
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          <Input
            type="date"
            placeholder="From date"
            value={filters.dateFrom}
            onChange={(e) => onChange({ ...filters, dateFrom: e.target.value })}
            className="pl-9 bg-background border-border text-foreground text-sm h-9 rounded-sm focus-visible:ring-neon-amber focus-visible:border-neon-amber/60 [color-scheme:dark]"
          />
        </div>

        {/* Date to */}
        <div className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            <Input
              type="date"
              placeholder="To date"
              value={filters.dateTo}
              onChange={(e) => onChange({ ...filters, dateTo: e.target.value })}
              className="pl-9 bg-background border-border text-foreground text-sm h-9 rounded-sm focus-visible:ring-neon-amber focus-visible:border-neon-amber/60 [color-scheme:dark]"
            />
          </div>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="shrink-0 p-2 text-muted-foreground hover:text-neon-amber transition-colors"
              title="Clear filters"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {hasActiveFilters && (
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground font-mono uppercase tracking-wider">Active:</span>
          {filters.artistName && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-neon-amber/10 text-neon-amber border border-neon-amber/30 rounded-sm font-mono">
              Artist: {filters.artistName}
              <button onClick={() => onChange({ ...filters, artistName: '' })} className="hover:text-white">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.city && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-neon-amber/10 text-neon-amber border border-neon-amber/30 rounded-sm font-mono">
              City: {filters.city}
              <button onClick={() => onChange({ ...filters, city: '' })} className="hover:text-white">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.dateFrom && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-neon-amber/10 text-neon-amber border border-neon-amber/30 rounded-sm font-mono">
              From: {filters.dateFrom}
              <button onClick={() => onChange({ ...filters, dateFrom: '' })} className="hover:text-white">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.dateTo && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-neon-amber/10 text-neon-amber border border-neon-amber/30 rounded-sm font-mono">
              To: {filters.dateTo}
              <button onClick={() => onChange({ ...filters, dateTo: '' })} className="hover:text-white">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
