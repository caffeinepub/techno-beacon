import React from 'react';
import { Radio, LogIn } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';

interface LoginPromptProps {
  title?: string;
  message?: string;
}

export default function LoginPrompt({
  title = 'Authentication Required',
  message = 'Log in to access this feature and track your favorite techno artists.',
}: LoginPromptProps) {
  const { login, isLoggingIn } = useInternetIdentity();

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] px-4 text-center">
      <div className="w-16 h-16 rounded-sm bg-neon-amber/10 border border-neon-amber/30 flex items-center justify-center mb-6 animate-glow-pulse">
        <Radio className="w-8 h-8 text-neon-amber" />
      </div>
      <h2 className="text-xl font-bold text-foreground mb-2">{title}</h2>
      <p className="text-sm text-muted-foreground max-w-sm mb-8">{message}</p>
      <button
        onClick={login}
        disabled={isLoggingIn}
        className="inline-flex items-center gap-2 px-6 py-3 bg-neon-amber text-background font-semibold text-sm rounded-sm hover:bg-neon-amber-dim transition-colors disabled:opacity-50"
      >
        {isLoggingIn ? (
          <>
            <span className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
            Connecting...
          </>
        ) : (
          <>
            <LogIn className="w-4 h-4" />
            Login
          </>
        )}
      </button>
    </div>
  );
}
