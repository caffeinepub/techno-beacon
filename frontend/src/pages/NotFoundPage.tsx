import React from 'react';
import { Link } from '@tanstack/react-router';
import { Radio } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-20 h-20 rounded-sm bg-neon-amber/10 border border-neon-amber/30 flex items-center justify-center mx-auto mb-6">
          <Radio className="w-10 h-10 text-neon-amber animate-pulse-neon" />
        </div>
        <h1 className="text-6xl font-mono font-bold text-neon-amber mb-4">404</h1>
        <p className="text-muted-foreground mb-8 font-mono">Signal lost. Page not found.</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-neon-amber text-background font-semibold text-sm rounded-sm hover:bg-neon-amber-dim transition-colors"
        >
          Return to Beacon
        </Link>
      </div>
    </div>
  );
}
