import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Radio, Loader2 } from 'lucide-react';
import { useSaveCallerUserProfile } from '../hooks/useQueries';

interface ProfileSetupModalProps {
  open: boolean;
}

export default function ProfileSetupModal({ open }: ProfileSetupModalProps) {
  const [name, setName] = useState('');
  const saveMutation = useSaveCallerUserProfile();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    saveMutation.mutate({ name: name.trim() });
  };

  return (
    <Dialog open={open}>
      <DialogContent
        className="bg-card border-border text-foreground max-w-md [&>button]:hidden"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-sm bg-neon-amber/10 border border-neon-amber/30 flex items-center justify-center">
              <Radio className="w-5 h-5 text-neon-amber" />
            </div>
            <DialogTitle className="text-lg font-bold text-foreground">
              Welcome to Techno Beacon
            </DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground text-sm">
            Set up your profile to start tracking artists and building your personal radar.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="profile-name" className="text-sm font-medium text-foreground">
              Your Name
            </Label>
            <Input
              id="profile-name"
              type="text"
              placeholder="Enter your name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-background border-border text-foreground placeholder:text-muted-foreground rounded-sm focus-visible:ring-neon-amber focus-visible:border-neon-amber/60"
              autoFocus
            />
          </div>

          {saveMutation.isError && (
            <p className="text-xs text-destructive">
              Failed to save profile. Please try again.
            </p>
          )}

          <button
            type="submit"
            disabled={!name.trim() || saveMutation.isPending}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-neon-amber text-background font-semibold text-sm rounded-sm hover:bg-neon-amber-dim transition-colors disabled:opacity-50"
          >
            {saveMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Enter the Beacon'
            )}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
