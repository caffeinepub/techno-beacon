import React from 'react';
import { Database, Loader2, CheckCircle, AlertCircle, ShieldAlert } from 'lucide-react';
import { useInitializeSeedData } from '../hooks/useQueries';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

export default function AdminInitButton() {
  const initMutation = useInitializeSeedData();

  const handleInit = () => {
    initMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success('Seed data initialized — Dave Clarke, Jeff Mills & Richie Hawtin loaded.');
      },
      onError: (error) => {
        const isUnauthorized =
          error instanceof Error && error.message.toLowerCase().includes('unauthorized');
        toast.error(
          isUnauthorized
            ? 'Admin access required to initialize seed data.'
            : 'Failed to initialize seed data. Please try again.'
        );
      },
    });
  };

  if (initMutation.isSuccess) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-neon-green/10 border border-neon-green/30 rounded-sm text-xs font-mono text-neon-green">
        <CheckCircle className="w-3.5 h-3.5 shrink-0" />
        Seed data initialized — Dave Clarke, Jeff Mills &amp; Richie Hawtin loaded.
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 bg-card border border-neon-amber/20 rounded-sm">
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <Database className="w-4 h-4 text-neon-amber shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <p className="text-xs font-mono font-semibold text-foreground">
              No artist data found
            </p>
            <Badge
              variant="outline"
              className="flex items-center gap-1 px-1.5 py-0 text-[10px] font-mono font-bold uppercase tracking-wider border-neon-amber/60 text-neon-amber bg-neon-amber/10 rounded-sm"
            >
              <ShieldAlert className="w-2.5 h-2.5" />
              Admin only
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Initialize seed data to load Dave Clarke, Jeff Mills, and Richie Hawtin with their upcoming events.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {initMutation.isError && (
          <div className="flex items-center gap-1 text-xs text-destructive font-mono">
            <AlertCircle className="w-3 h-3" />
            {initMutation.error instanceof Error &&
            initMutation.error.message.toLowerCase().includes('unauthorized')
              ? 'Admin only'
              : 'Failed'}
          </div>
        )}
        <button
          onClick={handleInit}
          disabled={initMutation.isPending}
          className="flex items-center gap-2 px-4 py-2 bg-neon-amber text-background text-xs font-semibold rounded-sm hover:bg-neon-amber-dim transition-colors disabled:opacity-50"
        >
          {initMutation.isPending ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Database className="w-3.5 h-3.5" />
          )}
          {initMutation.isPending ? 'Loading…' : 'Initialize Data'}
        </button>
      </div>
    </div>
  );
}
