import { X } from 'lucide-react';

interface FilterState {
  artistName: string;
  city: string;
  dateFrom: string;
  dateTo: string;
}

interface EventFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

export default function EventFilters({ filters, onFiltersChange }: EventFiltersProps) {
  const update = (key: keyof FilterState, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearAll = () => {
    onFiltersChange({ artistName: '', city: '', dateFrom: '', dateTo: '' });
  };

  const hasActiveFilters = Object.values(filters).some((v) => v.trim() !== '');

  const activeChips = Object.entries(filters)
    .filter(([, v]) => v.trim() !== '')
    .map(([k, v]) => ({ key: k as keyof FilterState, value: v }));

  return (
    <div className="mb-6 flex flex-col gap-3">
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="ARTIST NAME..."
          value={filters.artistName}
          onChange={(e) => update('artistName', e.target.value)}
          className="bg-card border border-border text-foreground font-mono text-xs px-3 py-2 rounded-none focus:outline-none focus:border-neon-amber placeholder:text-muted-foreground w-44"
        />
        <input
          type="text"
          placeholder="CITY..."
          value={filters.city}
          onChange={(e) => update('city', e.target.value)}
          className="bg-card border border-border text-foreground font-mono text-xs px-3 py-2 rounded-none focus:outline-none focus:border-neon-amber placeholder:text-muted-foreground w-36"
        />
        <input
          type="date"
          value={filters.dateFrom}
          onChange={(e) => update('dateFrom', e.target.value)}
          className="bg-card border border-border text-foreground font-mono text-xs px-3 py-2 rounded-none focus:outline-none focus:border-neon-amber w-40"
        />
        <input
          type="date"
          value={filters.dateTo}
          onChange={(e) => update('dateTo', e.target.value)}
          className="bg-card border border-border text-foreground font-mono text-xs px-3 py-2 rounded-none focus:outline-none focus:border-neon-amber w-40"
        />
        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="font-mono text-xs px-3 py-2 border border-border text-muted-foreground hover:border-neon-amber hover:text-neon-amber transition-all flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            CLEAR
          </button>
        )}
      </div>

      {/* Active Filter Chips */}
      {activeChips.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeChips.map(({ key, value }) => (
            <span
              key={key}
              className="flex items-center gap-1.5 font-mono text-xs px-2 py-1 bg-neon-amber/10 border border-neon-amber text-neon-amber"
            >
              {value}
              <button onClick={() => update(key, '')} className="hover:text-foreground transition-colors">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
