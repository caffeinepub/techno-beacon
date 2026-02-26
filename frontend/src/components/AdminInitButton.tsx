import React from 'react';
import { Database, Loader2, CheckCircle, AlertCircle, ShieldAlert } from 'lucide-react';
import { useInitializeSeedData, useIsAdmin } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useActor } from '../hooks/useActor';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

export default function AdminInitButton() {
  const initMutation = useInitializeSeedData();
  const { identity, isInitializing } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();
  const {
    data: isAdmin,
    isLoading: adminLoading,
    isFetched,
    isError,
  } = useIsAdmin();

  const isAuthenticated = !!identity;

  // Not authenticated at all — hide
  if (!isAuthenticated) return null;

  // Still initializing identity or actor — show subtle spinner
  const isCheckingAdmin = isInitializing || actorFetching || !actor || (adminLoading && !isFetched && !isError);

  if (isCheckingAdmin) {
    return (
      <div className="flex items-center gap-3 p-4 bg-card border border-border/40 rounded-sm">
        <Loader2 className="w-4 h-4 text-muted-foreground animate-spin shrink-0" />
        <p className="text-xs font-mono text-muted-foreground">Checking admin status…</p>
      </div>
    );
  }

  // Once settled — if not admin, hide completely
  if (isError || isAdmin !== true) return null;

  // Success state after initialization
  if (initMutation.isSuccess) {
    return (
      <div className="flex items-center gap-2 px-4 py-3 bg-neon-green/10 border border-neon-green/30 rounded-sm text-xs font-mono text-neon-green">
        <CheckCircle className="w-4 h-4 shrink-0" />
        <span>Seed data initialized — artists and events loaded successfully.</span>
      </div>
    );
  }

  const handleInit = () => {
    initMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success('Seed data initialized — artists and events loaded successfully.');
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

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 bg-card border border-neon-amber/30 rounded-sm">
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <Database className="w-4 h-4 text-neon-amber shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <p className="text-xs font-mono font-semibold text-foreground">
              Initialize artist &amp; event data
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
            Load artists and upcoming techno events into the backend. Click the button to populate the event listings.
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
              : 'Failed — retry'}
          </div>
        )}
        <button
          onClick={handleInit}
          disabled={initMutation.isPending}
          className="flex items-center gap-2 px-4 py-2 bg-neon-amber text-background text-xs font-semibold rounded-sm hover:opacity-90 transition-opacity disabled:opacity-50 whitespace-nowrap"
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
